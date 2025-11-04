import { ApiResponse, create } from 'apisauce';
import ENV from '../../shared/config/env';
import { checkNetworkConnection } from '../../shared/lib/useNetworkStatus';
import { translate } from '../../shared/i18n/translate';

const BASE_URL = ENV.API_BASE_URL;
const DEFAULT_TIMEOUT = ENV.API_TIMEOUT;

export type ApiProblem =
  | 'CLIENT_ERROR'
  | 'SERVER_ERROR'
  | 'TIMEOUT_ERROR'
  | 'CONNECTION_ERROR'
  | 'NETWORK_ERROR'
  | 'CANCEL_ERROR'
  | 'UNKNOWN_ERROR'
  | null;

export class ApiError extends Error {
  code: ApiProblem;
  status?: number;
  details?: any;
  constructor(code: ApiProblem, message?: string, status?: number, details?: any) {
    super(message || (code ?? ''));
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

type TokenBag = {
  getAccessToken: () => Promise<string | null> | string | null;
  getRefreshToken?: () => Promise<string | null> | string | null;
  refresh?: () => Promise<{ accessToken: string; refreshToken?: string } | null>;
  onAuthError?: () => void; // ví dụ: điều hướng về màn hình đăng nhập
};
let tokenBag: TokenBag = { getAccessToken: () => null };
export function setTokenProvider(bag: TokenBag) { tokenBag = bag; }

const api = create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

api.addAsyncRequestTransform(async (req) => {
  const token = await tokenBag.getAccessToken?.();
  if (token) { req.headers = { ...(req.headers || {}), Authorization: `Bearer ${token}` }; }
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
const waiters: Array<(token: string | null) => void> = [];

async function enqueueRefresh(): Promise<string | null> {
  if (!tokenBag.refresh) { return null; }
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        const res = await tokenBag.refresh!();
        const newToken = res?.accessToken ?? null;
        return newToken;
      } catch {
        return null;
      } finally {
        isRefreshing = false;
      }
    })();
  }
  const token = await refreshPromise!;
  waiters.splice(0).forEach((resolve) => resolve(token));
  return token;
}

function waitForToken(): Promise<string | null> {
  return new Promise((resolve) => waiters.push(resolve));
}

function toApiError<T>(res: ApiResponse<T>): ApiError {
  const code: ApiProblem = res.problem ?? 'UNKNOWN_ERROR';
  const status = res.status;
  const message =
    (typeof res.data === 'object' && (res.data as any)?.message) ||
    (res.originalError as any)?.message ||
    String(code);
  return new ApiError(code, message, status, res.data);
}

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type CallOptions = {
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: number;
  cancelToken?: any;
};

export async function callApi<T>(
  method: HttpMethod,
  url: string,
  opts: CallOptions = {}
): Promise<T> {
  const {
    params, data, headers, timeout = DEFAULT_TIMEOUT,
    retry = 0, cancelToken,
  } = opts;

  // Kiểm tra kết nối mạng trước khi gọi API
  const isConnected = await checkNetworkConnection();
  if (!isConnected) {
    throw new ApiError(
      'NETWORK_ERROR',
      translate('network:noConnectionMessage'),
      undefined,
      { isNetworkError: true }
    );
  }

  const send = () => api.any<T>({ method, url, params, data, headers, timeout, cancelToken });

  let attempt = 0;
  while (true) {
    const res = await send();

    if (res.ok && res.data !== undefined) { return res.data as T; }

    if (res.status === 401 && tokenBag.refresh) {
      const token = isRefreshing ? await waitForToken() : await enqueueRefresh();
      if (token) {
        const retryRes = await send();
        if (retryRes.ok && retryRes.data !== undefined) { return retryRes.data as T; }
      }
      tokenBag.onAuthError?.();
    }

    const prob = res.problem;
    const shouldRetry = (prob === 'TIMEOUT_ERROR' || prob === 'NETWORK_ERROR' || prob === 'CONNECTION_ERROR')
      && attempt < retry;
    if (shouldRetry) {
      attempt += 1;
      await new Promise(r => setTimeout(r, 300 * attempt));
      continue;
    }

    throw toApiError(res);
  }
}

export const http = {
  get:  <T>(url: string, opts?: CallOptions) => callApi<T>('get', url, opts),
  post: <T>(url: string, data?: any, opts?: CallOptions) => callApi<T>('post', url, { ...opts, data }),
  put:  <T>(url: string, data?: any, opts?: CallOptions) => callApi<T>('put', url, { ...opts, data }),
  patch:<T>(url: string, data?: any, opts?: CallOptions) => callApi<T>('patch', url, { ...opts, data }),
  del:  <T>(url: string, opts?: CallOptions) => callApi<T>('delete', url, opts),
};

export async function upload<T>(
  url: string,
  form: FormData,
  opts: Omit<CallOptions, 'data'> = {}
) {
  return callApi<T>('post', url, {
    ...opts,
    data: form,
    headers: { ...(opts.headers || {}), 'Content-Type': 'multipart/form-data' },
    timeout: opts.timeout ?? 60000,
  });
}

export const queryFn = <T>(url: string, params?: any) => () =>
  http.get<T>(url, { params });

export const mutationFn = <TReq, TRes>(url: string, method: HttpMethod = 'post') => (body: TReq) =>
  callApi<TRes>(method, url, { data: body });

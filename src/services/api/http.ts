import { ApiResponse, create } from 'apisauce';
import ENV from '../../shared/config/env';
import { checkNetworkConnection } from '../../shared/lib/useNetworkStatus';
import { translate } from '../../shared/i18n/translate';
import { getAccessToken, getRefreshToken, clearAuth } from '../auth/authService';
import { store } from '@/app/store';
import { clearAuthState } from '@/features/auth/model/authSlice';

const BASE_URL = ENV.API_BASE_URL;
const BASE_URL_PORTAL = ENV.API_BASE_URL_PORTAL;
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
  onAuthError?: () => void; 
};

// Setup token provider mặc định sử dụng authService
let tokenBag: TokenBag = {
  getAccessToken: () => getAccessToken(),
  getRefreshToken: () => getRefreshToken(),
  onAuthError: () => {
    clearAuth();
    store.dispatch(clearAuthState());
  },
};

// Cho phép override token provider nếu cần
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

const apiPortal = create({
  baseURL: BASE_URL_PORTAL,
  timeout: DEFAULT_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

apiPortal.addAsyncRequestTransform(async (req) => {
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

  let parsedData: any = res.data;
  if (typeof res.data === 'string') {
    try {
      parsedData = JSON.parse(res.data);
    } catch {
      parsedData = res.data;
    }
  }

  let message = '';
  if (parsedData && typeof parsedData === 'object') {
    if (parsedData.errors && typeof parsedData.errors === 'object') {
      const errorMessages = Object.values(parsedData.errors);
      message = errorMessages.length > 0 ? String(errorMessages[0]) : '';
    }
    if (!message && parsedData.message) {
      message = String(parsedData.message);
    }
  }

  if (!message) {
    message = (res.originalError as any)?.message || String(code);
  }
  
  return new ApiError(code, message, status, parsedData);
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

  const isConnected = await checkNetworkConnection();
  if (!isConnected) {
    throw new ApiError(
      'NETWORK_ERROR',
      translate('network:noConnectionMessage'),
      undefined,
      { isNetworkError: true }
    );
  }

  const fullUrl = `${BASE_URL}${url}`;
  console.log('📤 [API Request]', {
    method: method.toUpperCase(),
    url: fullUrl,
    baseURL: BASE_URL,
    endpoint: url,
    params,
    data: data ? (typeof data === 'object' ? JSON.stringify(data, null, 2) : data) : undefined,
    headers: headers ? Object.keys(headers).reduce((acc, key) => {
      if (key.toLowerCase().includes('authorization') || key.toLowerCase().includes('password')) {
        acc[key] = '***HIDDEN***';
      } else {
        acc[key] = headers[key];
      }
      return acc;
    }, {} as Record<string, string>) : undefined,
  });

  const send = () => api.any<T>({ method, url, params, data, headers, timeout, cancelToken });

  let attempt = 0;
  while (true) {
    const res = await send();

    // Log response
    console.log('📥 [API Response]', {
      method: method.toUpperCase(),
      url: fullUrl,
      status: res.status,
      ok: res.ok,
      problem: res.problem,
      data: res.data ? (typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : res.data) : undefined,
      attempt: attempt + 1,
    });

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

export async function callApiPortal<T>(
  method: HttpMethod,
  url: string,
  opts: CallOptions = {}
): Promise<T> {

  const {
    params, data, headers, timeout = DEFAULT_TIMEOUT,
    retry = 0, cancelToken,
  } = opts;

  const isConnected = await checkNetworkConnection();
  if (!isConnected) {
    throw new ApiError(
      'NETWORK_ERROR',
      translate('network:noConnectionMessage'),
      undefined,
      { isNetworkError: true }
    );
  }

  const fullUrl = `${BASE_URL_PORTAL}${url}`;
  console.log('📤 [API Portal Request]', {
    method: method.toUpperCase(),
    url: fullUrl,
    baseURL: BASE_URL_PORTAL,
    endpoint: url,
    params,
    data: data ? (typeof data === 'object' ? JSON.stringify(data, null, 2) : data) : undefined,
    headers: headers ? Object.keys(headers).reduce((acc, key) => {
      if (key.toLowerCase().includes('authorization') || key.toLowerCase().includes('password')) {
        acc[key] = '***HIDDEN***';
      } else {
        acc[key] = headers[key];
      }
      return acc;
    }, {} as Record<string, string>) : undefined,
  });

  const send = () => apiPortal.any<T>({ method, url, params, data, headers, timeout, cancelToken });

  let attempt = 0;
  while (true) {
    const res = await send();

    // Log response (Portal)
    console.log('📥 [API Portal Response]', {
      method: method.toUpperCase(),
      url: fullUrl,
      status: res.status,
      ok: res.ok,
      problem: res.problem,
      data: res.data ? (typeof res.data === 'object' ? JSON.stringify(res.data, null, 2) : res.data) : undefined,
      attempt: attempt + 1,
    });

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
  getPortal:  <T>(url: string, opts?: CallOptions) => callApiPortal<T>('get', url, opts),
  postPortal: <T>(url: string, data?: any, opts?: CallOptions) => callApiPortal<T>('post', url, { ...opts, data }),
  putPortal:  <T>(url: string, data?: any, opts?: CallOptions) => callApiPortal<T>('put', url, { ...opts, data }),
  patchPortal:<T>(url: string, data?: any, opts?: CallOptions) => callApiPortal<T>('patch', url, { ...opts, data }),
  delPortal:  <T>(url: string, opts?: CallOptions) => callApiPortal<T>('delete', url, opts),
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

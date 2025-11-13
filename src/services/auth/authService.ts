import * as storage from '@/store/index';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_ID_KEY = 'auth_user_id';

export function saveToken(token: string, refreshToken?: string | null, userId?: number): void {
  storage.saveString(TOKEN_KEY, token);
  if (refreshToken) {
    storage.saveString(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    storage.remove(REFRESH_TOKEN_KEY);
  }
  if (userId !== undefined && userId !== null) {
    storage.save(USER_ID_KEY, userId);
  }
}

export function getAccessToken(): string | null {
  return storage.loadString(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return storage.loadString(REFRESH_TOKEN_KEY);
}

export function getUserId(): number | null {
  return storage.load<number>(USER_ID_KEY) ?? null;
}

export function clearAuth(): void {
  storage.remove(TOKEN_KEY);
  storage.remove(REFRESH_TOKEN_KEY);
  storage.remove(USER_ID_KEY);
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}


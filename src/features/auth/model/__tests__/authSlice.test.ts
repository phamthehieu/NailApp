import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setCredentials, setUserInfo, clearAuthState, AuthUserInfo } from '../authSlice';

// Mock authService
jest.mock('@/services/auth/authService', () => ({
  getAccessToken: jest.fn(() => null),
  getRefreshToken: jest.fn(() => null),
  getUserId: jest.fn(() => null),
}));

const createTestStore = () => configureStore({
  reducer: {
    auth: authReducer,
  },
});

type TestStore = ReturnType<typeof createTestStore>;
type RootState = ReturnType<TestStore['getState']>;

describe('authSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have initial state', () => {
    const state = (store.getState() as RootState).auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.userInfo).toBeNull();
  });

  it('should set credentials correctly', () => {
    const credentials = {
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      userId: 123,
    };

    store.dispatch(setCredentials(credentials));
    const state = (store.getState() as RootState).auth;

    expect(state.token).toBe('test-token');
    expect(state.refreshToken).toBe('test-refresh-token');
    expect(state.userId).toBe(123);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should set credentials with minimal data', () => {
    const credentials = {
      token: 'test-token',
    };

    store.dispatch(setCredentials(credentials));
    const state = (store.getState() as RootState).auth;

    expect(state.token).toBe('test-token');
    expect(state.refreshToken).toBeNull();
    expect(state.userId).toBeNull();
    expect(state.isAuthenticated).toBe(true);
  });

  it('should set user info correctly', () => {
    const userInfo: AuthUserInfo = {
      displayName: 'Test User',
      description: 'Test Description',
      avatarUrl: 'https://example.com/avatar.jpg',
      email: 'test@example.com',
      phoneNumber: '0123456789',
      role: 1,
      roleObj: {
        id: 1,
        name: 'Admin',
      },
      tenantId: 1,
      tenant: 'Test Tenant',
      username: 'testuser',
      status: 1,
      id: 123,
      creator: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
      lastModifiedAt: '2024-01-01T00:00:00Z',
      informations: null,
      warnings: null,
      errors: null,
      list_Store: [],
    };

    store.dispatch(setUserInfo(userInfo));
    const state = (store.getState() as RootState).auth;

    expect(state.userInfo).toEqual(userInfo);
    expect(state.userInfo?.email).toBe('test@example.com');
    expect(state.userInfo?.username).toBe('testuser');
  });

  it('should clear auth state correctly', () => {
    // First set some data
    store.dispatch(setCredentials({ token: 'test-token' }));
    const userInfo: AuthUserInfo = {
      displayName: 'Test User',
      description: null,
      avatarUrl: null,
      email: 'test@example.com',
      phoneNumber: '0123456789',
      role: 1,
      roleObj: { id: 1, name: 'Admin' },
      tenantId: 1,
      tenant: null,
      username: 'testuser',
      status: 1,
      id: 123,
      creator: null,
      createdAt: '2024-01-01T00:00:00Z',
      lastModifiedAt: '2024-01-01T00:00:00Z',
      informations: null,
      warnings: null,
      errors: null,
      list_Store: [],
    };
    store.dispatch(setUserInfo(userInfo));

    // Then clear it
    store.dispatch(clearAuthState());
    const state = (store.getState() as RootState).auth;

    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.userId).toBeNull();
    expect(state.userInfo).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});


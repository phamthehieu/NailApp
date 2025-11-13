import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getAccessToken, getRefreshToken, getUserId } from '@/services/auth/authService';


export type lisStore = {
  appUserID: number;
  storeId: number;
  code: string;
  name: string;
}
export type AuthUserInfo = {
  displayName: string;
  description: string | null;
  avatarUrl: string | null;
  email: string;
  phoneNumber: string;
  role: number;
  roleObj: {
    id: number;
    name: string;
  };
  tenantId: number;
  tenant: string | null;
  username: string;
  status: number;
  id: number;
  creator: string | null;
  createdAt: string;
  lastModifiedAt: string;
  informations: string | null;
  warnings: string | null;
  errors: string | null;
  list_Store: lisStore[];
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userId: number | null;
  userInfo: AuthUserInfo | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: getAccessToken(),
  refreshToken: getRefreshToken(),
  userId: getUserId(),
  userInfo: null,
  isAuthenticated: Boolean(getAccessToken()),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        token: string;
        refreshToken?: string | null;
        userId?: number | null;
      }>
    ) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.userId = action.payload.userId ?? null;
      state.isAuthenticated = true;
    },
    setUserInfo(state, action: PayloadAction<AuthUserInfo>) {
      state.userInfo = action.payload;
    },
    clearAuthState(state) {
      state.token = null;
      state.refreshToken = null;
      state.userId = null;
      state.userInfo = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setUserInfo, clearAuthState } = authSlice.actions;

export default authSlice.reducer;

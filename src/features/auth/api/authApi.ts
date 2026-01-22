
import { http } from '@/services/api/http';
import { AuthUserInfo } from '../model/authSlice';

export interface LoginRequest {
  id: number;
  username: string;
  password: string;
  deviceCode: string;
  pushToken: string;
  osName: string;
}

export interface LoginResponse {
  [key: string]: any;
}

export async function loginApi(
  dataLogin: LoginRequest
): Promise<LoginResponse> {
  return http.postPortal<LoginResponse>(
    '/StaffProfile/Login',
    dataLogin
  );
}

export async function getUserInfoApi(): Promise<AuthUserInfo> {
  return http.getPortal<AuthUserInfo>(
    '/StaffProfile/GetInfo'
  );
}


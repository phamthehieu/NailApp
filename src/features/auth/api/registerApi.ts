import { http } from '@/services/api/http';

export interface CreateOTPRequest {
  id: number;
  name: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: number;
  monthOfBirth: number;
  yearOfBirth: number;
  gender: number;
  password: string;
  description: string;
  isClause: boolean;
  avatarUrl: string;
  otpCode: string;
  guidId: string;
}

export interface CreateAccountRequest extends CreateOTPRequest {
  otpCode: string;
  guidId: string;
}

export async function createOTPApi(data: CreateOTPRequest): Promise<any> {
  return http.postPortal<any>('/RegisterAccount/CreateOTP', data);
}

export async function createAccountApi(data: CreateAccountRequest): Promise<any> {
  return http.postPortal<any>('/RegisterAccount/Create', data);
}


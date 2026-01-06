export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserInfoResponse {
  id: string;
  email: string;
  role: string;
  userType: number;
  organizationId?: string;
  organizationName?: string;
}

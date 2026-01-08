import { apiClient } from '@/infrastructure/api/apiClient';

export interface SuperAdminDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  organizationId?: string;
  organizationName?: string;
  primaryRole: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSuperAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateEmailRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  password: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export class SuperAdminService {
  async getSuperAdmins(): Promise<SuperAdminDto[]> {
    return apiClient.get<SuperAdminDto[]>('/api/admin/superadmins');
  }

  async createSuperAdmin(request: CreateSuperAdminRequest): Promise<SuperAdminDto> {
    return apiClient.post<SuperAdminDto>('/api/admin/superadmins', request);
  }

  async updateUserProfile(userId: string, request: UpdateProfileRequest): Promise<SuperAdminDto> {
    return apiClient.put<SuperAdminDto>(`/api/admin/superadmins/${userId}/profile`, request);
  }

  async updateUserEmail(userId: string, request: UpdateEmailRequest): Promise<SuperAdminDto> {
    return apiClient.put<SuperAdminDto>(`/api/admin/superadmins/${userId}/email`, request);
  }

  async updateUserPassword(userId: string, request: UpdatePasswordRequest): Promise<void> {
    return apiClient.put<void>(`/api/admin/superadmins/${userId}/password`, request);
  }

  async deleteUser(userId: string): Promise<void> {
    return apiClient.delete<void>(`/api/admin/superadmins/${userId}`);
  }
}

export const superAdminService = new SuperAdminService();

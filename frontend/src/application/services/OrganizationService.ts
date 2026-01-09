import { apiClient } from '@/infrastructure/api/apiClient';

export interface OrganizationDto {
  id: string;
  name: string;
  midNumber: string;
  village?: string;
  address?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  isActive: boolean;
  memberCount: number;
}

export interface CreateOrganizationRequest {
  name: string;
  midNumber: string;
  village?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface UpdateOrganizationRequest {
  name: string;
  midNumber: string;
  village?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export interface RegisterOrganizationRequest {
  organizationName: string;
  midNumber: string;
  village?: string;
  address?: string;
  email?: string;
  phone?: string;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}

export interface RegisterOrganizationResponse {
  organization: OrganizationDto;
  adminUser: {
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
  };
}

export class OrganizationService {
  async getAllOrganizations(): Promise<OrganizationDto[]> {
    return apiClient.get<OrganizationDto[]>('/api/organizations');
  }

  async getOrganizationById(id: string): Promise<OrganizationDto> {
    return apiClient.get<OrganizationDto>(`/api/organizations/${id}`);
  }

  async createOrganization(request: CreateOrganizationRequest): Promise<OrganizationDto> {
    return apiClient.post<OrganizationDto>('/api/organizations', request);
  }

  async updateOrganization(id: string, request: UpdateOrganizationRequest): Promise<OrganizationDto> {
    return apiClient.put<OrganizationDto>(`/api/organizations/${id}`, request);
  }

  async deleteOrganization(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/organizations/${id}`);
  }

  async getOrganizationMembers(id: string): Promise<UserDto[]> {
    return apiClient.get<UserDto[]>(`/api/organizations/${id}/members`);
  }

  async removeOrganizationMember(organizationId: string, userId: string): Promise<void> {
    return apiClient.delete<void>(`/api/organizations/${organizationId}/members/${userId}`);
  }

  async registerOrganization(request: RegisterOrganizationRequest): Promise<RegisterOrganizationResponse> {
    return apiClient.post<RegisterOrganizationResponse>('/api/public/organizations/register', request);
  }
}

export interface UserDto {
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

export const organizationService = new OrganizationService();

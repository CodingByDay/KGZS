import { apiClient } from '@/infrastructure/api/apiClient';

export interface OrganizationDto {
  id: string;
  name: string;
  village?: string;
  address?: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface RegisterOrganizationRequest {
  organizationName: string;
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
  async registerOrganization(request: RegisterOrganizationRequest): Promise<RegisterOrganizationResponse> {
    return apiClient.post<RegisterOrganizationResponse>('/api/public/organizations/register', request);
  }
}

export const organizationService = new OrganizationService();

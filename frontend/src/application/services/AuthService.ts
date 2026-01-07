import { apiClient } from '@/infrastructure/api/apiClient';
import { StorageService } from '@/infrastructure/storage/StorageService';
import { LoginRequest, LoginResponse, UserInfoResponse, UpdateProfileRequest } from '@/domain/types/Auth';
import { User } from '@/domain/types/User';
import { UserRole } from '@/domain/enums/UserRole';
import { UserType } from '@/domain/enums/UserType';

export class AuthService {
  async login(email: string, password: string): Promise<void> {
    const request: LoginRequest = { email, password };
    const response = await apiClient.post<LoginResponse>('/api/auth/login', request);
    
    StorageService.setToken(response.token);
  }

  logout(): void {
    StorageService.clear();
  }

  getToken(): string | null {
    return StorageService.getToken();
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<UserInfoResponse>('/api/auth/me');
    
    const user: User = {
      id: response.id,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      phoneNumber: response.phoneNumber,
      profilePictureUrl: response.profilePictureUrl,
      role: response.role as UserRole,
      userType: response.userType as UserType,
      organizationId: response.organizationId,
      organizationName: response.organizationName,
    };
    
    StorageService.setUser(JSON.stringify(user));
    return user;
  }

  async updateProfile(request: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<UserInfoResponse>('/api/auth/me/profile', request);
    
    const user: User = {
      id: response.id,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      phoneNumber: response.phoneNumber,
      profilePictureUrl: response.profilePictureUrl,
      role: response.role as UserRole,
      userType: response.userType as UserType,
      organizationId: response.organizationId,
      organizationName: response.organizationName,
    };
    
    StorageService.setUser(JSON.stringify(user));
    return user;
  }

  async uploadProfilePicture(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.postForm<{ profilePictureUrl: string }>('/api/profilepicture/upload', formData);
    
    // Reload user to get updated profile picture
    const updatedUser = await this.getCurrentUser();
    return response.profilePictureUrl;
  }

  async deleteProfilePicture(): Promise<void> {
    await apiClient.delete('/api/profilepicture');
    // Reload user to get updated profile picture
    await this.getCurrentUser();
  }
}

export const authService = new AuthService();

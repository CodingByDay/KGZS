import { apiClient } from '@/infrastructure/api/apiClient';
import { StorageService } from '@/infrastructure/storage/StorageService';
import { LoginRequest, LoginResponse, RefreshRequest, UserInfoResponse, UpdateProfileRequest } from '@/domain/types/Auth';
import { User } from '@/domain/types/User';
import { UserRole } from '@/domain/enums/UserRole';
import { UserType } from '@/domain/enums/UserType';

export class AuthService {
  async login(email: string, password: string, rememberMe: boolean): Promise<void> {
    const request: LoginRequest = { email, password, rememberMe };
    const response = await apiClient.post<LoginResponse>('/api/auth/login', request);
    
    StorageService.setAuth(response.token, response.refreshToken, rememberMe);
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post<void>('/api/auth/logout');
    } catch {
      // Ignore logout API errors and clear client state regardless
    } finally {
      StorageService.clear();
    }
  }

  getToken(): string | null {
    return StorageService.getToken();
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Restores authentication on app startup.
   * Validates existing token, refreshes if expired, and returns true if user is authenticated.
   */
  async restoreAuth(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Try to validate token by calling /api/auth/me
    // If it fails with 401, try to refresh
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      const apiError = error as { status?: number };
      if (apiError.status === 401) {
        // Token expired, try to refresh
        const refreshToken = StorageService.getRefreshToken();
        if (!refreshToken) {
          // No refresh token, clear auth
          this.logout();
          return false;
        }

        try {
          const refreshRequest: RefreshRequest = { refreshToken };
          const response = await apiClient.post<LoginResponse>('/api/auth/refresh', refreshRequest);
          StorageService.setTokensAfterRefresh(response.token, response.refreshToken);
          return true;
        } catch {
          // Refresh failed, clear auth
          this.logout();
          return false;
        }
      }
      // Other error, assume not authenticated
      return false;
    }
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

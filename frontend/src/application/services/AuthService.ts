import { apiClient } from '@/infrastructure/api/apiClient';
import { StorageService } from '@/infrastructure/storage/StorageService';
import { LoginRequest, LoginResponse, UserInfoResponse } from '@/domain/types/Auth';
import { User } from '@/domain/types/User';
import { UserRole } from '@/domain/enums/UserRole';

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
      role: response.role as UserRole,
    };
    
    StorageService.setUser(JSON.stringify(user));
    return user;
  }
}

export const authService = new AuthService();

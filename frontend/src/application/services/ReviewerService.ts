import { apiClient } from '@/infrastructure/api/apiClient';
import { UserRole } from '@/domain/enums/UserRole';

export interface ReviewerDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface CreateReviewerRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UpdateReviewerEmailRequest {
  email: string;
}

export interface UpdateReviewerProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export interface ResetReviewerPasswordRequest {
  password?: string;
}

export interface ResetReviewerPasswordResponse {
  temporaryPassword?: string;
}

export class ReviewerService {
  async getReviewers(): Promise<ReviewerDto[]> {
    return apiClient.get<ReviewerDto[]>('/api/admin/reviewers');
  }

  async createReviewer(request: CreateReviewerRequest): Promise<ReviewerDto> {
    return apiClient.post<ReviewerDto>('/api/admin/reviewers', request);
  }

  async updateReviewerEmail(userId: string, request: UpdateReviewerEmailRequest): Promise<ReviewerDto> {
    return apiClient.put<ReviewerDto>(`/api/admin/reviewers/${userId}/email`, request);
  }

  async resetReviewerPassword(userId: string, request: ResetReviewerPasswordRequest): Promise<ResetReviewerPasswordResponse> {
    return apiClient.post<ResetReviewerPasswordResponse>(`/api/admin/reviewers/${userId}/reset-password`, request);
  }

  async updateReviewerProfile(userId: string, request: UpdateReviewerProfileRequest): Promise<ReviewerDto> {
    return apiClient.put<ReviewerDto>(`/api/admin/reviewers/${userId}/profile`, request);
  }

  async deleteReviewer(userId: string): Promise<void> {
    return apiClient.delete<void>(`/api/admin/reviewers/${userId}`);
  }
}

export const reviewerService = new ReviewerService();

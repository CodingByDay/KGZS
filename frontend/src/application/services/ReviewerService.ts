import { apiClient } from '@/infrastructure/api/apiClient';
import { UserRole } from '@/domain/enums/UserRole';

export interface ReviewerDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  reviewerType: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface CreateReviewerRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  reviewerType: UserRole;
}

export interface UpdateReviewerEmailRequest {
  email: string;
}

export interface ResetReviewerPasswordRequest {
  password?: string;
}

export interface ResetReviewerPasswordResponse {
  temporaryPassword?: string;
}

export interface UpdateReviewerTypeRequest {
  reviewerType: UserRole;
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

  async updateReviewerType(userId: string, request: UpdateReviewerTypeRequest): Promise<ReviewerDto> {
    return apiClient.put<ReviewerDto>(`/api/admin/reviewers/${userId}/reviewer-type`, request);
  }
}

export const reviewerService = new ReviewerService();

import { apiClient } from '@/infrastructure/api/apiClient';

export enum PrijavaStatus {
  PendingPayment = 0,
  PendingAdminConfirmation = 1,
  PendingReview = 2,
  Rejected = 3,
  Cancelled = 4,
}

export enum PrijavaPaymentMethod {
  Stripe = 0,
  Card = 1,
  BankTransfer = 2,
}

export enum PrijavaPaymentStatus {
  Unpaid = 0,
  Submitted = 1,
  Paid = 2,
  Rejected = 3,
}

export interface PrijavaPaymentDto {
  id: string;
  prijavaId: string;
  paymentMethod: PrijavaPaymentMethod;
  amount?: number;
  currency?: string;
  paymentStatus: PrijavaPaymentStatus;
  providerSessionId?: string;
  paymentIntentId?: string;
  bankTransferReceiptUrl?: string;
  adminConfirmedByUserId?: string;
  adminConfirmedByUserName?: string;
  adminConfirmedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PrijavaDto {
  id: string;
  organizationId: string;
  organizationName: string;
  itemId: string;
  itemName: string;
  reviewDueDate: string;
  status: PrijavaStatus;
  createdAt: string;
  updatedAt?: string;
  payment?: PrijavaPaymentDto;
}

export interface CreatePrijavaRequest {
  itemId: string;
  reviewDueDate: string;
}

export interface UpdatePrijavaRequest {
  itemId: string;
  reviewDueDate: string;
}

export interface CreateStripeSessionResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface CreateCardSessionResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface BankTransferInstructionsResponse {
  iban: string;
  reference: string;
  recipient: string;
  amount?: number;
  currency?: string;
}

export interface ConfirmPaymentRequest {
  notes?: string;
}

export interface RejectPaymentRequest {
  reason: string;
}

class PrijavaServiceClass {
  async getPrijave(params?: {
    status?: PrijavaStatus;
    itemId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<PrijavaDto[]> {
    const queryParams = new URLSearchParams();
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.itemId) queryParams.append('itemId', params.itemId);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    
    const queryString = queryParams.toString();
    const url = `/api/org/prijave${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<PrijavaDto[]>(url);
  }

  async getPrijavaById(id: string): Promise<PrijavaDto> {
    return apiClient.get<PrijavaDto>(`/api/org/prijave/${id}`);
  }

  async createPrijava(request: CreatePrijavaRequest): Promise<PrijavaDto> {
    return apiClient.post<PrijavaDto>('/api/org/prijave', request);
  }

  async updatePrijava(id: string, request: UpdatePrijavaRequest): Promise<PrijavaDto> {
    return apiClient.put<PrijavaDto>(`/api/org/prijave/${id}`, request);
  }

  async deletePrijava(id: string): Promise<void> {
    return apiClient.delete(`/api/org/prijave/${id}`);
  }

  async createStripeSession(prijavaId: string): Promise<CreateStripeSessionResponse> {
    return apiClient.post<CreateStripeSessionResponse>(`/api/org/prijave/${prijavaId}/payments/stripe/create-session`);
  }

  async createCardSession(prijavaId: string): Promise<CreateCardSessionResponse> {
    return apiClient.post<CreateCardSessionResponse>(`/api/org/prijave/${prijavaId}/payments/card/create-session`);
  }

  async getBankTransferInstructions(prijavaId: string): Promise<BankTransferInstructionsResponse> {
    return apiClient.get<BankTransferInstructionsResponse>(`/api/org/prijave/${prijavaId}/payments/bank-transfer/instructions`);
  }

  async uploadBankTransferReceipt(prijavaId: string, file: File): Promise<{ receiptUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postForm<{ receiptUrl: string }>(`/api/org/prijave/${prijavaId}/payments/bank-transfer/upload-receipt-file`, formData);
  }

  // Admin methods
  async getAllPrijave(params?: {
    organizationId?: string;
    status?: PrijavaStatus;
    itemId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<PrijavaDto[]> {
    const queryParams = new URLSearchParams();
    if (params?.organizationId) queryParams.append('organizationId', params.organizationId);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.itemId) queryParams.append('itemId', params.itemId);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);
    
    const queryString = queryParams.toString();
    const url = `/api/admin/prijave${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<PrijavaDto[]>(url);
  }

  async getPrijavaByIdForAdmin(id: string): Promise<PrijavaDto> {
    return apiClient.get<PrijavaDto>(`/api/admin/prijave/${id}`);
  }

  async confirmPayment(prijavaId: string, request?: ConfirmPaymentRequest): Promise<void> {
    return apiClient.post(`/api/admin/prijave/${prijavaId}/confirm-payment`, request);
  }

  async rejectPayment(prijavaId: string, request: RejectPaymentRequest): Promise<void> {
    return apiClient.post(`/api/admin/prijave/${prijavaId}/reject-payment`, request);
  }
}

export const prijavaService = new PrijavaServiceClass();

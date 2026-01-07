import { StorageService } from '../storage/StorageService';
import { OfflineQueue } from '../storage/OfflineQueue';

export interface ApiError {
  message: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAcceptLanguage(): string {
    const lang = localStorage.getItem('lang') || 'sl';
    return lang === 'en' ? 'en-US' : 'sl-SI';
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = StorageService.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept-Language': this.getAcceptLanguage(),
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Check if offline and method should be queued
    if (!navigator.onLine && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
      OfflineQueue.queue({
        method: options.method as 'POST' | 'PUT' | 'DELETE',
        endpoint,
        body: options.body ? JSON.parse(options.body as string) : undefined,
      });
      throw new Error('Action queued for when connection is restored');
    }

    try {
      console.log(`[API Client] Making ${options.method || 'GET'} request to: ${url}`);
      console.log('[API Client] Headers:', headers);
      if (options.body) {
        console.log('[API Client] Request body:', options.body);
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include credentials for CORS with AllowCredentials
      });

      console.log(`[API Client] Response status: ${response.status} ${response.statusText}`);
      console.log('[API Client] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const responseText = await response.text();
        console.error(`[API Client] Error response body:`, responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || 'An error occurred' };
        }
        
        const error: ApiError = {
          message: errorData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
        throw error;
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseText = await response.text();
        console.log('[API Client] Response body:', responseText);
        return JSON.parse(responseText) as T;
      }
      
      console.log('[API Client] Empty or non-JSON response');
      return {} as T;
    } catch (error) {
      if (error instanceof Error && error.message === 'Action queued for when connection is restored') {
        throw error;
      }
      
      if (error && typeof error === 'object' && 'status' in error) {
        console.error('[API Client] API Error:', error);
        throw error;
      }
      
      // Network errors (CORS, connection refused, etc.)
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      console.error(`[API Client] Network error: ${errorMessage}`);
      console.error('[API Client] Full error:', error);
      
      throw {
        message: errorMessage,
        status: 0,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    const isFormData = body instanceof FormData;
    const url = `${this.baseUrl}${endpoint}`;
    const token = StorageService.getToken();

    const headers: Record<string, string> = {
      'Accept-Language': this.getAcceptLanguage(),
      ...(options?.headers as Record<string, string>),
    };

    // Don't set Content-Type for FormData - browser will set it with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      credentials: 'include',
    });

    if (!response.ok) {
      const responseText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || 'An error occurred' };
      }
      
      const error: ApiError = {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
      };
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const responseText = await response.text();
      return JSON.parse(responseText) as T;
    }
    
    return {} as T;
  }

  async postForm<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = StorageService.getToken();

    const headers: HeadersInit = {
      'Accept-Language': this.getAcceptLanguage(),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type - browser will set it with boundary for FormData
    console.log('[API Client] Uploading form data to:', url);
    console.log('[API Client] FormData entries:', Array.from(formData.entries()).map(([k, v]) => [k, v instanceof File ? `${v.name} (${v.size} bytes)` : v]));

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
      });

      console.log('[API Client] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const responseText = await response.text();
        console.error('[API Client] Error response:', responseText);
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText || 'An error occurred' };
        }
        
        const error: ApiError = {
          message: errorData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseText = await response.text();
        console.log('[API Client] Success response:', responseText);
        return JSON.parse(responseText) as T;
      }
      
      return {} as T;
    } catch (error) {
      console.error('[API Client] Network error:', error);
      throw error;
    }
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080';

export const apiClient = new ApiClient(API_BASE_URL);

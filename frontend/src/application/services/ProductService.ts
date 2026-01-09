import { apiClient } from '@/infrastructure/api/apiClient';

export interface ProductDto {
  id: string;
  organizationId: string;
  organizationName: string;
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  subcategoryName?: string;
  name: string;
  description?: string;
  unit?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  categoryId: string;
  subcategoryId?: string;
  description?: string;
  unit?: string;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  name: string;
  categoryId: string;
  subcategoryId?: string;
  description?: string;
  unit?: string;
  imageUrl?: string;
}

class ProductServiceClass {
  async getProducts(search?: string, categoryId?: string): Promise<ProductDto[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId);
    
    const queryString = params.toString();
    const url = `/api/org/products${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<ProductDto[]>(url);
  }

  async getProductById(id: string): Promise<ProductDto> {
    return apiClient.get<ProductDto>(`/api/org/products/${id}`);
  }

  async createProduct(request: CreateProductRequest): Promise<ProductDto> {
    return apiClient.post<ProductDto>('/api/org/products', request);
  }

  async updateProduct(id: string, request: UpdateProductRequest): Promise<ProductDto> {
    return apiClient.put<ProductDto>(`/api/org/products/${id}`, request);
  }

  async deleteProduct(id: string): Promise<void> {
    return apiClient.delete(`/api/org/products/${id}`);
  }

  async uploadProductImage(productId: string, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postForm<{ imageUrl: string }>(`/api/org/products/${productId}/image/upload`, formData);
  }

  async deleteProductImage(productId: string): Promise<void> {
    return apiClient.delete(`/api/org/products/${productId}/image`);
  }
}

export const productService = new ProductServiceClass();

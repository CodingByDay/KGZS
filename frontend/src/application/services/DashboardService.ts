import { apiClient } from '@/infrastructure/api/apiClient';

export interface DashboardStatistics {
  evaluationsCount: number;
  categoriesCount: number;
  productSamplesCount: number;
  commissionsCount: number;
  protocolsCount: number;
}

export interface UserActivity {
  id: string;
  action: string;
  entityType: string;
  entityName: string;
  timestamp: string;
}

export class DashboardService {
  async getStatistics(): Promise<DashboardStatistics> {
    try {
      const [evaluations, categories, productSamples, commissions, protocols] = await Promise.all([
        apiClient.get<any[]>('/api/evaluations').catch(() => []),
        apiClient.get<any[]>('/api/categories').catch(() => []),
        apiClient.get<any[]>('/api/productsamples').catch(() => []),
        apiClient.get<any[]>('/api/commissions').catch(() => []),
        apiClient.get<any[]>('/api/protocols').catch(() => []),
      ]);

      return {
        evaluationsCount: evaluations.length,
        categoriesCount: categories.length,
        productSamplesCount: productSamples.length,
        commissionsCount: commissions.length,
        protocolsCount: protocols.length,
      };
    } catch (error) {
      console.error('Failed to load dashboard statistics:', error);
      return {
        evaluationsCount: 0,
        categoriesCount: 0,
        productSamplesCount: 0,
        commissionsCount: 0,
        protocolsCount: 0,
      };
    }
  }

  async getUserActivity(userId: string): Promise<UserActivity[]> {
    // TODO: Replace with actual audit log endpoint when available
    // For now, return empty array as placeholder
    // When backend implements: GET /api/auditlogs?userId={userId}&limit=10
    return [];
  }
}

export const dashboardService = new DashboardService();

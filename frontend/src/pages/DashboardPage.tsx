import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/application/services/AuthService';
import { User } from '@/domain/types/User';
import { ApiError } from '@/infrastructure/api/apiClient';
import { AppShell } from '@/app/components/AppShell';

export function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError.status === 401) {
          authService.logout();
          navigate('/login');
        } else {
          setError(apiError.message || 'Failed to load user information');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AppShell>
    );
  }

  if (error && !user) {
    return (
      <AppShell>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            User Information
          </h2>
          
          {user && (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">ID:</span>
                <p className="text-gray-900">{user.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Role:</span>
                <p className="text-gray-900">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/application/services/AuthService';
import { User } from '@/domain/types/User';
import { ApiError } from '@/infrastructure/api/apiClient';
import { AppShell } from '@/app/components/AppShell';
import { UserTypeLabels } from '@/domain/enums/UserType';

export function ProfilePage() {
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
          <button onClick={() => navigate('/app/dashboard')} className="text-blue-600">
            Back to Dashboard
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">User Type</label>
              <p className="mt-1 text-sm text-gray-900">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user?.userType ? UserTypeLabels[user.userType] : 'N/A'}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 text-sm text-gray-900">{user?.role || 'N/A'}</p>
            </div>
            {user?.organizationName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Organization</label>
                <p className="mt-1 text-sm text-gray-900">{user.organizationName}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <p className="mt-1 text-sm text-gray-500 font-mono">{user?.id || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

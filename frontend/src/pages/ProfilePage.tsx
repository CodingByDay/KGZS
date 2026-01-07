import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@/application/services/AuthService';
import { User } from '@/domain/types/User';
import { ApiError } from '@/infrastructure/api/apiClient';
import { AppShell } from '@/app/components/AppShell';
import { UserTypeLabels } from '@/domain/enums/UserType';
import { UserRole } from '@/domain/enums/UserRole';

export function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
          <div className="text-gray-500">{t('common.loading')}</div>
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
          <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
          <p className="text-gray-600 mt-1">{t('profile.subtitle')}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('profile.email')}
              </label>
              <p className="mt-1 text-sm text-gray-900">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('profile.userType')}
              </label>
              <p className="mt-1 text-sm text-gray-900">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user?.userType ? UserTypeLabels[user.userType] : 'N/A'}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('profile.role')}
              </label>
              <p className="mt-1 text-sm text-gray-900">{user?.role || 'N/A'}</p>
            </div>
            {user?.organizationName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('profile.organization')}
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.organizationName}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('profile.userId')}
              </label>
              <p className="mt-1 text-sm text-gray-500 font-mono">{user?.id || 'N/A'}</p>
            </div>
          </div>
        </div>

        {(user?.role === UserRole.SuperAdmin || String(user?.role) === 'SuperAdmin') && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('profile.superAdminActionsTitle')}
            </h2>
            <Link
              to="/app/admin/superadmins"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('profile.manageSuperAdmins')}
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}

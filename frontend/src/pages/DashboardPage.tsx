import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@/application/services/AuthService';
import { User } from '@/domain/types/User';
import { UserType } from '@/domain/enums/UserType';
import { UserRole } from '@/domain/enums/UserRole';
import { ApiError } from '@/infrastructure/api/apiClient';
import { AppShell } from '@/app/components/AppShell';
import { dashboardService, DashboardStatistics, UserActivity } from '@/application/services/DashboardService';
import { HiChartBar, HiFolder, HiCube, HiUserGroup, HiDocumentText, HiClock, HiInformationCircle, HiBanknotes } from 'react-icons/hi2';
import { getRoleDisplayInfo, getRoleLabel } from '@/domain/enums/UserRoleDisplay';

// Get version from package.json
const APP_VERSION = '0.0.0'; // This should match package.json version

export function DashboardPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        
        // Load statistics
        const stats = await dashboardService.getStatistics();
        setStatistics(stats);
        
        // Load user activity (placeholder for now)
        if (userData.id) {
          const activity = await dashboardService.getUserActivity(userData.id);
          setRecentActivity(activity);
        }
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError.status === 401) {
          authService.logout();
          navigate('/login');
        } else {
          setError(apiError.message || 'Failed to load dashboard data');
        }
      } finally {
        setIsLoading(false);
        setLoadingStats(false);
      }
    };

    loadData();
  }, [navigate]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'Created':
        return t('dashboard.recentActivity.created');
      case 'Updated':
        return t('dashboard.recentActivity.updated');
      case 'Deleted':
        return t('dashboard.recentActivity.deleted');
      case 'StatusChanged':
        return t('dashboard.recentActivity.statusChanged');
      default:
        return action;
    }
  };

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
        </div>
      </AppShell>
    );
  }

  // Check if user is an organization user
  const userTypeValue = user?.userType;
  const userRoleValue = user?.role;
  const userTypeNum = userTypeValue !== undefined && userTypeValue !== null 
    ? (typeof userTypeValue === 'number' ? userTypeValue : Number(userTypeValue))
    : null;
  const isOrgUserByType = 
    userTypeValue === UserType.OrganizationAdmin || 
    userTypeValue === UserType.OrganizationUser ||
    userTypeNum === 2 || // OrganizationAdmin = 2
    userTypeNum === 3 || // OrganizationUser = 3
    String(userTypeValue) === '2' ||
    String(userTypeValue) === '3';
  const isOrgUserByRole = 
    userRoleValue === UserRole.OrganizationAdmin ||
    String(userRoleValue) === 'OrganizationAdmin';
  const isOrganizationUser = isOrgUserByType || isOrgUserByRole;

  // Build stats cards based on user type
  const allStatsCards = [
    {
      title: t('dashboard.statistics.evaluations'),
      value: statistics?.evaluationsCount ?? 0,
      icon: HiChartBar,
      color: 'bg-blue-500',
      link: '/app/evaluations',
      accessibleToOrgUsers: true,
    },
    {
      title: t('dashboard.statistics.categories'),
      value: statistics?.categoriesCount ?? 0,
      icon: HiFolder,
      color: 'bg-green-500',
      link: '/app/categories',
      accessibleToOrgUsers: false,
    },
    {
      title: t('dashboard.statistics.productSamples'),
      value: statistics?.productSamplesCount ?? 0,
      icon: HiCube,
      color: 'bg-purple-500',
      link: '/app/productsamples',
      accessibleToOrgUsers: true,
    },
    {
      title: t('dashboard.statistics.commissions'),
      value: statistics?.commissionsCount ?? 0,
      icon: HiUserGroup,
      color: 'bg-orange-500',
      link: '/app/commissions',
      accessibleToOrgUsers: false,
    },
    {
      title: t('dashboard.statistics.protocols'),
      value: statistics?.protocolsCount ?? 0,
      icon: HiDocumentText,
      color: 'bg-indigo-500',
      link: '/app/protocols',
      accessibleToOrgUsers: true,
    },
    {
      title: t('nav.payments'),
      value: statistics?.paymentsCount ?? 0,
      icon: HiBanknotes,
      color: 'bg-teal-500',
      link: '/app/payments',
      accessibleToOrgUsers: true,
    },
  ];

  // Filter cards based on user type
  const statsCards = isOrganizationUser 
    ? allStatsCards.filter(card => card.accessibleToOrgUsers) // Organization users: only Prijave, Ocenjevanja, Zapisniki, Placila
    : allStatsCards.filter(card => card.title !== t('nav.payments')); // Other users: all except payments

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          {user && (
            <p className="mt-1 text-gray-600">
              {t('dashboard.welcome')}, {user.firstName} {user.lastName}
            </p>
          )}
        </div>

        {/* Statistics Cards */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('dashboard.statistics.title')}
          </h2>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isOrganizationUser ? 'xl:grid-cols-4' : 'xl:grid-cols-5'} gap-4`}>
            {statsCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.link}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                      {loadingStats ? (
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                      )}
                    </div>
                    <div className={`${card.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <HiClock className="w-5 h-5 text-gray-600" />
                {t('dashboard.recentActivity.title')}
              </h2>
            </div>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t('dashboard.recentActivity.noActivity')}</p>
                <p className="text-sm mt-2 text-gray-400">
                  Your recent actions will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {getActionLabel(activity.action)} {activity.entityType}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.entityName}</p>
                    </div>
                    <p className="text-xs text-gray-400 ml-4">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HiInformationCircle className="w-5 h-5 text-gray-600" />
              {t('dashboard.systemInfo.title')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">
                  {t('dashboard.systemInfo.version')}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {APP_VERSION}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">
                  {t('dashboard.systemInfo.lastUpdated')}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              {user && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    {user.role && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">{t('profile.role')}</span>
                        <div>
                          {(() => {
                            const roleInfo = getRoleDisplayInfo(user.role, i18n.language as 'sl' | 'en');
                            const Icon = roleInfo.icon;
                            return (
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md ${roleInfo.bgColor} ${roleInfo.color}`}>
                                <Icon className="w-3.5 h-3.5" />
                                {getRoleLabel(user.role, i18n.language as 'sl' | 'en')}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                    {user.organizationName && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          {t('profile.organization')}
                        </span>
                        <span className="text-sm text-gray-900">{user.organizationName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

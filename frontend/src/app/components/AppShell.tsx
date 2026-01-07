import { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/application/services/AuthService';
import { StorageService } from '@/infrastructure/storage/StorageService';
import { UserTypeLabels } from '@/domain/enums/UserType';
import { UserRole } from '@/domain/enums/UserRole';
import { User } from '@/domain/types/User';
import { useTranslation } from 'react-i18next';
import { HiOutlineCog6Tooth, HiArrowRightOnRectangle } from 'react-icons/hi2';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userJson = StorageService.getUser();
      if (userJson) {
        try {
          const parsedUser = JSON.parse(userJson);
          setUser(parsedUser);
        } catch {
          // If parsing fails, try to load from API
          if (authService.isAuthenticated()) {
            try {
              const userData = await authService.getCurrentUser();
              setUser(userData);
            } catch {
              // If API call fails, user might not be authenticated
            }
          }
        }
      } else if (authService.isAuthenticated()) {
        // No user in storage but token exists, load from API
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch {
          // If API call fails, user might not be authenticated
        }
      }
    };

    loadUser();
  }, []);

  const isSuperAdmin = user?.role === UserRole.SuperAdmin || String(user?.role) === 'SuperAdmin';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const changeLanguage = (lang: 'sl' | 'en') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen flex flex-col">
          <div className="p-4 border-b flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-800">{t('app.name')}</h1>
          </div>
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            <Link
              to="/app/dashboard"
              className={`block px-4 py-2 rounded-lg ${
                isActive('/app/dashboard') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('nav.dashboard')}
            </Link>
            <Link
              to="/app/productsamples"
              className={`block px-4 py-2 rounded-lg ${
                isActive('/app/productsamples') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('nav.productSamples')}
            </Link>
            <Link
              to="/app/categories"
              className={`block px-4 py-2 rounded-lg ${
                isActive('/app/categories') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('nav.categories')}
            </Link>
            <Link
              to="/app/commissions"
              className={`block px-4 py-2 rounded-lg ${
                isActive('/app/commissions') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('nav.commissions')}
            </Link>
            <Link
              to="/app/evaluations"
              className={`block px-4 py-2 rounded-lg ${
                isActive('/app/evaluations') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('nav.evaluations')}
            </Link>
            <Link
              to="/app/protocols"
              className={`block px-4 py-2 rounded-lg ${
                isActive('/app/protocols') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('nav.protocols')}
            </Link>
            {isSuperAdmin && (
              <Link
                to="/app/admin"
                className={`block px-4 py-2 rounded-lg ${
                  isActive('/app/admin') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
              {t('nav.admin')}
              </Link>
            )}
          </nav>
          {/* User Profile Card - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
            {/* User Info Card */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user?.email || 'User'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-blue-100 text-blue-800">
                      {user?.userType && user.userType in UserTypeLabels 
                        ? UserTypeLabels[user.userType as keyof typeof UserTypeLabels] 
                        : 'N/A'}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-purple-100 text-purple-800">
                      {user?.role || 'N/A'}
                    </span>
                  </div>
                  {user?.organizationName && (
                    <div className="text-xs text-gray-500 mt-1 truncate" title={user.organizationName}>
                      {user.organizationName}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-3 space-y-2">
              {/* Language Switcher with Flags */}
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                <span className="text-xs font-medium text-gray-600 flex-shrink-0">Lang:</span>
                <div className="flex gap-1.5 flex-1">
                  <button
                    type="button"
                    onClick={() => changeLanguage('sl')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                      i18n.language === 'sl' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-label={t('language.sl')}
                    title="Slovenščina"
                  >
                    <span className="text-base">🇸🇮</span>
                    <span>SL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLanguage('en')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                      i18n.language === 'en' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-label={t('language.en')}
                    title="English"
                  >
                    <span className="text-base">🇬🇧</span>
                    <span>EN</span>
                  </button>
                </div>
              </div>

              {/* Profile and Logout Buttons */}
              <div className="flex gap-2">
                <Link
                  to="/app/profile"
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    location.pathname === '/app/profile'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                  }`}
                  title={t('nav.profile')}
                >
                  <HiOutlineCog6Tooth className="w-4 h-4" />
                  <span>{t('nav.profile')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-sm hover:shadow-md"
                  title={t('nav.logout')}
                >
                  <HiArrowRightOnRectangle className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

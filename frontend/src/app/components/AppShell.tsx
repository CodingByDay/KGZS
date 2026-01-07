import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/application/services/AuthService';
import { StorageService } from '@/infrastructure/storage/StorageService';
import { UserTypeLabels } from '@/domain/enums/UserType';
import { useTranslation } from 'react-i18next';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const userJson = StorageService.getUser();
  const user = userJson ? JSON.parse(userJson) : null;
  const isSuperAdmin = user?.role === 'SuperAdmin';

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
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-gray-800">{t('app.name')}</h1>
          </div>
          <nav className="p-4 space-y-2">
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
          <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
            <div className="mb-2 text-sm text-gray-600">
              <div className="font-medium">{user?.email}</div>
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user?.userType && user.userType in UserTypeLabels 
                      ? UserTypeLabels[user.userType as keyof typeof UserTypeLabels] 
                      : 'N/A'}
                  </span>
                  <span>{user?.role}</span>
                </div>
                {user?.organizationName && (
                  <div className="text-xs text-gray-500">{user.organizationName}</div>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center gap-2 mb-2">
                <div className="flex-1">
                  <Link
                    to="/app/profile"
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg text-center"
                  >
                    {t('nav.profile')}
                  </Link>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => changeLanguage('sl')}
                    className={`px-2 py-1 text-xs rounded ${
                      i18n.language === 'sl' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                    aria-label={t('language.sl')}
                  >
                    SL
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLanguage('en')}
                    className={`px-2 py-1 text-xs rounded ${
                      i18n.language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                    aria-label={t('language.en')}
                  >
                    EN
                  </button>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                {t('nav.logout')}
              </button>
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

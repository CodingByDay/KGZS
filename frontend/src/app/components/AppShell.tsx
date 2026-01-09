import { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/application/services/AuthService';
import { StorageService } from '@/infrastructure/storage/StorageService';
import { UserRole } from '@/domain/enums/UserRole';
import { UserType } from '@/domain/enums/UserType';
import { getRoleDisplayInfo, getRoleLabel } from '@/domain/enums/UserRoleDisplay';
import { User } from '@/domain/types/User';
import { useTranslation } from 'react-i18next';
import { 
  HiOutlineCog6Tooth, 
  HiArrowRightOnRectangle,
  HiHome,
  HiCube,
  HiFolder,
  HiUserGroup,
  HiClipboardDocumentCheck,
  HiDocumentText,
  HiShieldCheck,
  HiBuildingOffice,
  HiBanknotes,
  HiArchiveBox
} from 'react-icons/hi2';
import SI from 'country-flag-icons/react/3x2/SI';
import GB from 'country-flag-icons/react/3x2/GB';
import { Logo } from '@/ui/components/Logo';

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
          console.log('AppShell: Loaded user from storage:', parsedUser);
          console.log('AppShell: ProfilePictureUrl:', parsedUser.profilePictureUrl);
          console.log('AppShell: userType from storage:', parsedUser.userType, 'type:', typeof parsedUser.userType);
          console.log('AppShell: role from storage:', parsedUser.role, 'type:', typeof parsedUser.role);
          setUser(parsedUser);
        } catch {
          // If parsing fails, try to load from API
          if (authService.isAuthenticated()) {
            try {
              const userData = await authService.getCurrentUser();
              console.log('AppShell: Loaded user from API:', userData);
              console.log('AppShell: ProfilePictureUrl from API:', userData.profilePictureUrl);
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
          console.log('AppShell: Loaded user from API (no storage):', userData);
          console.log('AppShell: ProfilePictureUrl from API:', userData.profilePictureUrl);
          setUser(userData);
        } catch {
          // If API call fails, user might not be authenticated
        }
      }
    };

    loadUser();

    // Listen for custom storage update events (for same-tab updates)
    // This ensures AppShell updates when profile picture is uploaded in ProfilePage
    const handleUserUpdated = () => {
      loadUser();
    };

    window.addEventListener('userUpdated', handleUserUpdated);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdated);
    };
  }, []);

  const isSuperAdmin = user?.role === UserRole.SuperAdmin || String(user?.role) === 'SuperAdmin';
  // Check if user is an organization user (OrganizationAdmin or OrganizationUser)
  // Handle both enum values, numeric values, and string values (from API/storage)
  const userTypeValue = user?.userType;
  const userRoleValue = user?.role;
  const hasOrganizationId = !!user?.organizationId;
  
  // Convert userType to number for comparison (handles enum, number, or string)
  const userTypeNum = userTypeValue !== undefined && userTypeValue !== null 
    ? (typeof userTypeValue === 'number' ? userTypeValue : Number(userTypeValue))
    : null;
  
  // Check userType (can be enum, number, or string from storage)
  const isOrgUserByType = 
    userTypeValue === UserType.OrganizationAdmin || 
    userTypeValue === UserType.OrganizationUser ||
    userTypeNum === 2 || // OrganizationAdmin = 2
    userTypeNum === 3 || // OrganizationUser = 3
    String(userTypeValue) === '2' || // Handle string "2"
    String(userTypeValue) === '3'; // Handle string "3"
  
  // Check role as well (OrganizationAdmin role)
  const isOrgUserByRole = 
    userRoleValue === UserRole.OrganizationAdmin ||
    String(userRoleValue) === 'OrganizationAdmin';
  
  // Also check if user has organizationId (additional indicator)
  const isOrganizationUser = isOrgUserByType || isOrgUserByRole || (hasOrganizationId && !isSuperAdmin);
  
  // Debug logging
  if (user) {
    console.log('AppShell: User detection - userType:', userTypeValue, 'type:', typeof userTypeValue, 'role:', userRoleValue, 'organizationId:', user.organizationId, 'isOrganizationUser:', isOrganizationUser);
  }

  const handleLogout = () => {
    authService.logout().finally(() => {
      navigate('/login');
    });
  };

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    // Exact match for products and prijave to avoid false positives
    if (path === '/app/products') {
      return currentPath === '/app/products' || (currentPath.startsWith('/app/products/') && !currentPath.startsWith('/app/prijave'));
    }
    if (path === '/app/prijave') {
      return currentPath === '/app/prijave' || currentPath.startsWith('/app/prijave/');
    }
    return currentPath.startsWith(path);
  };

  const changeLanguage = (lang: 'sl' | 'en') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <div className="h-screen bg-blue-50 overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl h-screen flex flex-col">
          <div className="p-4 border-b border-blue-700 flex-shrink-0">
            <Logo size="md" />
          </div>
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            {isOrganizationUser ? (
              // Organization users see: Dashboard, Prijave, Ocenjevanja, Zapisniki, Placila
              <>
                <Link
                  to="/app/dashboard"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive('/app/dashboard') 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
                >
                  <HiHome className="w-5 h-5" />
                  <span className="font-medium">{t('nav.dashboard')}</span>
                </Link>
                <Link
                  to="/app/productsamples"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive('/app/productsamples') 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
                >
                  <HiCube className="w-5 h-5" />
                  <span className="font-medium">{t('nav.productSamples')}</span>
                </Link>
                <Link
                  to="/app/products"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive('/app/products')
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
                >
                  <HiArchiveBox className="w-5 h-5" />
                  <span className="font-medium">{t('nav.products')}</span>
                </Link>
                <Link
                  to="/app/prijave"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive('/app/prijave')
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
                >
                  <HiDocumentText className="w-5 h-5" />
                  <span className="font-medium">{t('nav.prijave') || 'Prijave'}</span>
                </Link>
                <Link
                  to="/app/evaluations"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive('/app/evaluations') 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
                >
                  <HiClipboardDocumentCheck className="w-5 h-5" />
                  <span className="font-medium">{t('nav.evaluations')}</span>
                </Link>
                <Link
                  to="/app/protocols"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive('/app/protocols') 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
                >
                  <HiDocumentText className="w-5 h-5" />
                  <span className="font-medium">{t('nav.protocols')}</span>
                </Link>
                <Link
                  to="/app/payments"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive('/app/payments') 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
                >
                  <HiBanknotes className="w-5 h-5" />
                  <span className="font-medium">{t('nav.payments')}</span>
                </Link>
              </>
            ) : (
              // Other users see full navigation
              <>
                <Link
                  to="/app/dashboard"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive('/app/dashboard') 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
                >
                  <HiHome className="w-5 h-5" />
                  <span className="font-medium">{t('nav.dashboard')}</span>
                </Link>
                <Link
                  to="/app/productsamples"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive('/app/productsamples') 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
                >
                  <HiCube className="w-5 h-5" />
                  <span className="font-medium">{t('nav.productSamples')}</span>
                </Link>
                <Link
                  to="/app/categories"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive('/app/categories') 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
                >
                  <HiFolder className="w-5 h-5" />
                  <span className="font-medium">{t('nav.categories')}</span>
                </Link>
                <Link
                  to="/app/commissions"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive('/app/commissions') 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
                >
                  <HiUserGroup className="w-5 h-5" />
                  <span className="font-medium">{t('nav.commissions')}</span>
                </Link>
                <Link
                  to="/app/evaluations"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive('/app/evaluations') 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
                >
                  <HiClipboardDocumentCheck className="w-5 h-5" />
                  <span className="font-medium">{t('nav.evaluations')}</span>
                </Link>
                <Link
                  to="/app/protocols"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isActive('/app/protocols') 
                      ? 'bg-blue-700 text-white shadow-md' 
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                  }`}
                >
                  <HiDocumentText className="w-5 h-5" />
                  <span className="font-medium">{t('nav.protocols')}</span>
                </Link>
                {isSuperAdmin && (
                  <>
                    <Link
                      to="/app/admin/organizations"
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                        isActive('/app/admin/organizations') 
                          ? 'bg-blue-700 text-white shadow-md' 
                          : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                      }`}
                    >
                      <HiBuildingOffice className="w-5 h-5" />
                      <span className="font-medium">{t('nav.kmetije')}</span>
                    </Link>
                    <Link
                      to="/app/admin/prijave"
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                        isActive('/app/admin/prijave') 
                          ? 'bg-blue-700 text-white shadow-md' 
                          : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                      }`}
                    >
                      <HiDocumentText className="w-5 h-5" />
                      <span className="font-medium">{t('nav.prijave') || 'Prijave'}</span>
                    </Link>
                    <Link
                      to="/app/admin"
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                        isActive('/app/admin') 
                          ? 'bg-blue-700 text-white shadow-md' 
                          : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                      }`}
                    >
                      <HiShieldCheck className="w-5 h-5" />
                      <span className="font-medium">{t('nav.admin')}</span>
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
          {/* User Profile Card - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-blue-700 bg-blue-900/50">
            {/* User Info Card */}
            <div className="p-4 border-b border-blue-700/50">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 relative w-10 h-10">
                  {/* Fallback - always rendered */}
                  <div 
                    className="absolute inset-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md z-0"
                    style={{ display: user?.profilePictureUrl && user.profilePictureUrl.trim() !== '' ? 'none' : 'flex' }}
                  >
                    {user?.email?.charAt(0).toUpperCase() || user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {/* Profile picture - overlays fallback if available */}
                  {user?.profilePictureUrl && user.profilePictureUrl.trim() !== '' && (() => {
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080';
                    // Ensure profilePictureUrl starts with / if it doesn't already
                    const profileUrl = user.profilePictureUrl.startsWith('/') 
                      ? user.profilePictureUrl 
                      : `/${user.profilePictureUrl}`;
                    const imageUrl = `${baseUrl}${profileUrl}`;
                    console.log('AppShell: Rendering profile picture');
                    console.log('AppShell: Base URL:', baseUrl);
                    console.log('AppShell: ProfilePictureUrl (raw):', user.profilePictureUrl);
                    console.log('AppShell: ProfilePictureUrl (normalized):', profileUrl);
                    console.log('AppShell: Full Image URL:', imageUrl);
                    return (
                      <img
                        src={imageUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="absolute inset-0 w-10 h-10 rounded-full object-cover border-2 border-blue-700 shadow-md"
                        style={{ 
                          display: 'block',
                          zIndex: 10,
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '2.5rem',
                          height: '2.5rem'
                        }}
                        key={user.profilePictureUrl}
                        onLoad={(e) => {
                          console.log('AppShell: Profile picture loaded successfully');
                          console.log('AppShell: Image element:', e.target);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'block';
                          target.style.opacity = '1';
                          target.style.zIndex = '10';
                          // Hide fallback when image loads
                          const fallback = target.parentElement?.querySelector('div:first-child') as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'none';
                          }
                        }}
                        onError={(e) => {
                          // Log error for debugging
                          console.error('AppShell: Failed to load profile picture');
                          console.error('AppShell: ProfilePictureUrl (raw):', user.profilePictureUrl);
                          console.error('AppShell: ProfilePictureUrl (normalized):', profileUrl);
                          console.error('AppShell: Full URL:', imageUrl);
                          console.error('AppShell: Error event:', e);
                          // Hide image on error, show fallback
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('div:first-child') as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                    );
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || 'User'}
                  </div>
                  {user?.role && (
                    <div className="mt-1.5">
                      {(() => {
                        const roleInfo = getRoleDisplayInfo(user.role, i18n.language as 'sl' | 'en');
                        const Icon = roleInfo.icon;
                        return (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-md bg-blue-800/50 text-blue-100">
                            <Icon className="w-3.5 h-3.5" />
                            {getRoleLabel(user.role, i18n.language as 'sl' | 'en')}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                  {user?.organizationName && (
                    <div className="text-xs text-blue-200 mt-1 truncate" title={user.organizationName}>
                      {user.organizationName}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-3 space-y-2">
              {/* Language Switcher with Flags */}
              <div className="flex items-center gap-2 p-2 bg-blue-800/30 rounded-lg border border-blue-700/50">
                <span className="text-xs font-medium text-blue-200 flex-shrink-0">{i18n.language === 'sl' ? 'Jezik:' : 'Language:'}</span>
                <div className="flex gap-1.5 flex-1">
                  <button
                    type="button"
                    onClick={() => changeLanguage('sl')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                      i18n.language === 'sl' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-blue-800/50 text-blue-200 hover:bg-blue-700/50'
                    }`}
                    aria-label={t('language.sl')}
                    title="Slovenščina"
                  >
                    <SI className="w-4 h-4" />
                    <span>SL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLanguage('en')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                      i18n.language === 'en' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-blue-800/50 text-blue-200 hover:bg-blue-700/50'
                    }`}
                    aria-label={t('language.en')}
                    title="English"
                  >
                    <GB className="w-4 h-4" />
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
                      : 'bg-blue-800/50 text-blue-100 hover:bg-blue-700/50 border border-blue-700/50'
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
        <main className="flex-1 h-screen overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { AppShell } from '@/app/components/AppShell';
import { useTranslation } from 'react-i18next';
import { HiUserGroup, HiShieldCheck, HiClipboardDocumentCheck } from 'react-icons/hi2';

export function AdminPage() {
  const { t } = useTranslation();
  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/app/admin/users"
            className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-3">
              <HiUserGroup className="w-8 h-8 text-blue-100" />
              <h2 className="text-xl font-semibold text-white">{t('admin.userManagementTitle')}</h2>
            </div>
            <p className="text-blue-100 text-sm flex-1">{t('admin.userManagementDescription')}</p>
          </Link>
          <Link
            to="/app/admin/superadmins"
            className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-3">
              <HiShieldCheck className="w-8 h-8 text-blue-100" />
              <h2 className="text-xl font-semibold text-white">{t('admin.superAdminManagementTitle')}</h2>
            </div>
            <p className="text-blue-100 text-sm flex-1">{t('admin.superAdminManagementDescription')}</p>
          </Link>
          <Link
            to="/app/admin/reviewers"
            className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-3">
              <HiClipboardDocumentCheck className="w-8 h-8 text-blue-100" />
              <h2 className="text-xl font-semibold text-white">{t('reviewers.pageTitle')}</h2>
            </div>
            <p className="text-blue-100 text-sm flex-1">{t('reviewers.pageSubtitle')}</p>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

import { Link } from 'react-router-dom';
import { AppShell } from '@/app/components/AppShell';
import { useTranslation } from 'react-i18next';

export function AdminPage() {
  const { t } = useTranslation();
  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/app/admin/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{t('admin.userManagementTitle')}</h2>
            <p className="text-gray-600">{t('admin.userManagementDescription')}</p>
          </Link>
          <Link
            to="/app/admin/superadmins"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{t('admin.superAdminManagementTitle')}</h2>
            <p className="text-gray-600">{t('admin.superAdminManagementDescription')}</p>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

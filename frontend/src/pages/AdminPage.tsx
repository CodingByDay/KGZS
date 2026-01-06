import { Link } from 'react-router-dom';
import { AppShell } from '@/app/components/AppShell';

export function AdminPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/app/admin/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">User Management</h2>
            <p className="text-gray-600">Manage all users, assign roles and organizations</p>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

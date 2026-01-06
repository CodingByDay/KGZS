import { useState, useEffect } from 'react';
import { apiClient } from '@/infrastructure/api/apiClient';
import { AppShell } from '@/app/components/AppShell';
import { UserType, UserTypeLabels } from '@/domain/enums/UserType';
import { UserRole } from '@/domain/enums/UserRole';

interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  organizationId?: string;
  organizationName?: string;
  primaryRole: UserRole;
  isActive: boolean;
  createdAt: string;
}

interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  organizationId?: string;
  primaryRole: UserRole;
}

interface OrganizationDto {
  id: string;
  name: string;
  village?: string;
  address?: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export function UsersManagementPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterUserType, setFilterUserType] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, orgsData] = await Promise.all([
        apiClient.get<UserDto[]>('/api/admin/users'),
        apiClient.get<OrganizationDto[]>('/api/organizations').catch(() => []),
      ]);
      setUsers(usersData);
      setOrganizations(orgsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      await apiClient.post('/api/admin/users', userData);
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user');
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filterUserType !== 'all' && user.userType.toString() !== filterUserType) return false;
    if (filterRole !== 'all' && user.primaryRole !== filterRole) return false;
    return true;
  });

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create User
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-4 mb-4">
            <select
              value={filterUserType}
              onChange={(e) => setFilterUserType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All User Types</option>
              {Object.entries(UserTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Roles</option>
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {UserTypeLabels[user.userType]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.primaryRole}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.organizationName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showCreateModal && (
          <CreateUserModal
            organizations={organizations}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateUser}
          />
        )}
      </div>
    </AppShell>
  );
}

function CreateUserModal({
  organizations,
  onClose,
  onSubmit,
}: {
  organizations: OrganizationDto[];
  onClose: () => void;
  onSubmit: (user: CreateUserRequest) => void;
}) {
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    userType: UserType.GlobalAdmin,
    organizationId: undefined,
    primaryRole: UserRole.SuperAdmin,
  });

  // Auto-set role based on user type
  useEffect(() => {
    if (formData.userType === UserType.GlobalAdmin) {
      setFormData(prev => ({ ...prev, primaryRole: UserRole.SuperAdmin, organizationId: undefined }));
    } else if (formData.userType === UserType.OrganizationAdmin) {
      setFormData(prev => ({ ...prev, primaryRole: UserRole.OrganizationAdmin }));
    }
  }, [formData.userType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Create User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">User Type</label>
            <select
              value={formData.userType}
              onChange={(e) => setFormData({ ...formData, userType: parseInt(e.target.value) as UserType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              {Object.entries(UserTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.userType === UserType.GlobalAdmin && 'Creates a SuperAdmin with full system access'}
              {formData.userType === UserType.OrganizationAdmin && 'Creates an Organization Admin (requires Organization)'}
              {formData.userType === UserType.OrganizationUser && 'Creates a regular organization user (requires Organization)'}
              {formData.userType === UserType.CommissionUser && 'Creates a commission-related user'}
              {formData.userType === UserType.InterestedParty && 'Creates an interested party (email notifications only)'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={formData.primaryRole}
              onChange={(e) => setFormData({ ...formData, primaryRole: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
              disabled={formData.userType === UserType.GlobalAdmin || formData.userType === UserType.OrganizationAdmin}
            >
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {(formData.userType === UserType.GlobalAdmin || formData.userType === UserType.OrganizationAdmin) && (
              <p className="text-xs text-gray-500 mt-1">Role is automatically set based on User Type</p>
            )}
          </div>
          {(formData.userType === UserType.OrganizationAdmin || 
            formData.userType === UserType.OrganizationUser || 
            formData.userType === UserType.CommissionUser) && (
            <div>
              <label className="block text-sm font-medium mb-1">Organization</label>
              <select
                value={formData.organizationId || ''}
                onChange={(e) => setFormData({ ...formData, organizationId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required={formData.userType === UserType.OrganizationAdmin || formData.userType === UserType.OrganizationUser}
              >
                <option value="">Select an organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} {org.village ? `(${org.village})` : ''}
                  </option>
                ))}
              </select>
              {organizations.length === 0 && (
                <p className="text-xs text-yellow-600 mt-1">No organizations found. Create an organization first.</p>
              )}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

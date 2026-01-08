import { useState, useEffect } from 'react';
import { apiClient } from '@/infrastructure/api/apiClient';
import { AppShell } from '@/app/components/AppShell';
import { UserType, UserTypeLabels } from '@/domain/enums/UserType';
import { UserRole } from '@/domain/enums/UserRole';
import { getRoleDisplayInfo, getRoleLabel } from '@/domain/enums/UserRoleDisplay';
import { useTranslation } from 'react-i18next';
import { HiPencil, HiTrash, HiKey, HiMagnifyingGlass, HiFunnel } from 'react-icons/hi2';
import { ApiError } from '@/infrastructure/api/apiClient';

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
  phoneNumber?: string;
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

interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

interface UpdateEmailRequest {
  email: string;
}

interface UpdatePasswordRequest {
  password: string;
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

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

export function UsersManagementPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [filterUserType, setFilterUserType] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const addToast = (type: Toast['type'], message: string) => {
    setToasts((prev) => [...prev, { id: Date.now(), type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, orgsData] = await Promise.all([
        apiClient.get<UserDto[]>('/api/admin/users'),
        apiClient.get<OrganizationDto[]>('/api/organizations').catch(() => []),
      ]);
      setUsers(usersData);
      setOrganizations(orgsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      addToast('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      await apiClient.post('/api/admin/users', userData);
      setShowCreateModal(false);
      await loadData();
      addToast('success', 'User created successfully');
    } catch (error) {
      const apiError = error as ApiError;
      addToast('error', apiError.message || 'Failed to create user');
    }
  };

  const handleUpdateProfile = async (data: UpdateProfileRequest & UpdateEmailRequest) => {
    if (!selectedUser) return;
    try {
      await apiClient.put(`/api/admin/users/${selectedUser.id}/profile`, {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      });
      await apiClient.put(`/api/admin/users/${selectedUser.id}/email`, { email: data.email });
      setShowEditModal(false);
      setSelectedUser(null);
      await loadData();
      addToast('success', 'User updated successfully');
    } catch (error) {
      const apiError = error as ApiError;
      addToast('error', apiError.message || 'Failed to update user');
    }
  };

  const handleUpdatePassword = async (data: UpdatePasswordRequest) => {
    if (!selectedUser) return;
    try {
      await apiClient.put(`/api/admin/users/${selectedUser.id}/password`, data);
      setShowPasswordModal(false);
      setSelectedUser(null);
      addToast('success', 'Password updated successfully');
    } catch (error) {
      const apiError = error as ApiError;
      addToast('error', apiError.message || 'Failed to update password');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await apiClient.delete(`/api/admin/users/${selectedUser.id}`);
      setShowDeleteModal(false);
      setSelectedUser(null);
      await loadData();
      addToast('success', 'User deleted successfully');
    } catch (error) {
      const apiError = error as ApiError;
      addToast('error', apiError.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter((user) => {
    // User type filter
    if (filterUserType !== 'all' && user.userType.toString() !== filterUserType) return false;
    
    // Role filter
    if (filterRole !== 'all' && user.primaryRole !== filterRole) return false;
    
    // Name filter
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    if (nameFilter && !fullName.includes(nameFilter.toLowerCase())) return false;
    
    // Email filter
    if (emailFilter && !user.email.toLowerCase().includes(emailFilter.toLowerCase())) return false;
    
    // Status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      if (user.isActive !== isActive) return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t('common.loading')}</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Toasts */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-2 rounded shadow text-sm ${
                toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create User
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <HiFunnel className="w-4 h-4" />
              {t('common.filters') || 'Filters'}
              {(filterUserType !== 'all' || filterRole !== 'all' || nameFilter || emailFilter || statusFilter !== 'all') && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {[filterUserType !== 'all' && '1', filterRole !== 'all' && '1', nameFilter && '1', emailFilter && '1', statusFilter !== 'all' && '1'].filter(Boolean).length}
                </span>
              )}
            </button>
            {(filterUserType !== 'all' || filterRole !== 'all' || nameFilter || emailFilter || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setFilterUserType('all');
                  setFilterRole('all');
                  setNameFilter('');
                  setEmailFilter('');
                  setStatusFilter('all');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {t('common.clearFilters') || 'Clear Filters'}
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
              {/* Name filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder={t('common.search') || 'Search...'}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    placeholder={t('common.search') || 'Search...'}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* User Type filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Type
                </label>
                <select
                  value={filterUserType}
                  onChange={(e) => setFilterUserType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('common.all') || 'All'}</option>
                  {Object.entries(UserTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('common.all') || 'All'}</option>
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('common.all') || 'All'}</option>
                  <option value="active">{t('common.active')}</option>
                  <option value="inactive">{t('common.inactive')}</option>
                </select>
              </div>
            </div>
          )}

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const roleInfo = getRoleDisplayInfo(user.primaryRole, 'en');
                        const Icon = roleInfo.icon;
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md ${roleInfo.bgColor} ${roleInfo.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {getRoleLabel(user.primaryRole, 'en')}
                          </span>
                        );
                      })()}
                    </td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="Edit User"
                        >
                          <HiPencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPasswordModal(true);
                          }}
                          className="p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded transition-colors"
                          title="Reset Password"
                        >
                          <HiKey className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Delete User"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
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

        {showEditModal && selectedUser && (
          <UpdateProfileModal
            user={selectedUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onSubmit={handleUpdateProfile}
          />
        )}

        {showPasswordModal && selectedUser && (
          <UpdatePasswordModal
            user={selectedUser}
            onClose={() => {
              setShowPasswordModal(false);
              setSelectedUser(null);
            }}
            onSubmit={handleUpdatePassword}
          />
        )}

        {showDeleteModal && selectedUser && (
          <DeleteModal
            user={selectedUser}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedUser(null);
            }}
            onConfirm={handleDelete}
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

function UpdateProfileModal({
  user,
  onClose,
  onSubmit,
}: {
  user: UserDto;
  onClose: () => void;
  onSubmit: (data: UpdateProfileRequest & UpdateEmailRequest) => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit User</h2>
        <p className="text-sm text-gray-600 mb-4">
          Update profile information for {user.firstName} {user.lastName}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => {
                setFormData({ ...formData, firstName: e.target.value });
                setErrors({ ...errors, firstName: '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => {
                setFormData({ ...formData, lastName: e.target.value });
                setErrors({ ...errors, lastName: '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-gray-500 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => {
                setFormData({ ...formData, phoneNumber: e.target.value });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setErrors({ ...errors, email: '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdatePasswordModal({
  user,
  onClose,
  onSubmit,
}: {
  user: UserDto;
  onClose: () => void;
  onSubmit: (data: UpdatePasswordRequest) => void;
}) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    onSubmit({ password });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <p className="text-sm text-gray-600 mb-4">
          Reset password for {user.firstName} {user.lastName}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({
  user,
  onClose,
  onConfirm,
}: {
  user: UserDto;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Delete User</h2>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

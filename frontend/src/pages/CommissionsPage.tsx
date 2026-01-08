import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@/infrastructure/api/apiClient';
import { AppShell } from '@/app/components/AppShell';
import { ApiError } from '@/infrastructure/api/apiClient';
import { HiPencil, HiTrash, HiMagnifyingGlass, HiFunnel } from 'react-icons/hi2';

interface CommissionMember {
  id: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  role: string; // MainMember, President, Member, Trainee
  isExcluded: boolean;
  joinedAt: string;
}

interface Commission {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  members: CommissionMember[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  primaryRole: string;
}

interface CommissionMemberRequest {
  userId: string;
  role: string;
}

interface CreateCommissionRequest {
  name: string;
  description?: string;
  members: CommissionMemberRequest[];
}

interface UpdateCommissionRequest {
  name: string;
  description?: string;
  status: string;
  members: CommissionMemberRequest[];
}

export function CommissionsPage() {
  const { t } = useTranslation();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [memberCountFilter, setMemberCountFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [commissionsData, usersData] = await Promise.all([
        apiClient.get<Commission[]>('/api/admin/commissions'),
        apiClient.get<User[]>('/api/admin/users').catch(() => []),
      ]);
      setCommissions(commissionsData);
      setUsers(usersData);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('commissions.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommission = async (data: CreateCommissionRequest) => {
    try {
      await apiClient.post<Commission>('/api/admin/commissions', data);
      await loadData();
      setShowCreateModal(false);
      setError('');
      setSuccessMessage(t('commissions.messages.createSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('commissions.messages.createError'));
    }
  };

  const handleUpdateCommission = async (id: string, data: UpdateCommissionRequest) => {
    try {
      await apiClient.put<Commission>(`/api/admin/commissions/${id}`, data);
      await loadData();
      setEditingCommission(null);
      setError('');
      setSuccessMessage(t('commissions.messages.updateSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('commissions.messages.updateError'));
    }
  };

  const handleDeleteCommission = async (id: string) => {
    if (!confirm(t('commissions.messages.deleteConfirm'))) {
      return;
    }
    try {
      await apiClient.delete(`/api/admin/commissions/${id}`);
      await loadData();
      setError('');
      setSuccessMessage(t('commissions.messages.deleteSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('commissions.messages.deleteError'));
    }
  };

  // Filter commissions
  const filteredCommissions = commissions.filter((commission) => {
    // Name filter
    if (nameFilter && !commission.name.toLowerCase().includes(nameFilter.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && commission.status !== statusFilter) {
      return false;
    }
    
    // Member count filter
    if (memberCountFilter !== 'all') {
      const memberCount = commission.members.length;
      switch (memberCountFilter) {
        case '0':
          if (memberCount !== 0) return false;
          break;
        case '1-3':
          if (memberCount < 1 || memberCount > 3) return false;
          break;
        case '4-6':
          if (memberCount < 4 || memberCount > 6) return false;
          break;
        case '7+':
          if (memberCount < 7) return false;
          break;
      }
    }
    
    return true;
  });

  // Get unique statuses for filter
  const uniqueStatuses = Array.from(new Set(commissions.map(c => c.status)));

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('commissions.title')}</h1>
            <p className="text-gray-600 mt-1">{t('commissions.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('commissions.createButton')}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <HiFunnel className="w-4 h-4" />
              {t('common.filters') || 'Filters'}
              {(nameFilter || statusFilter !== 'all' || memberCountFilter !== 'all') && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {[nameFilter && '1', statusFilter !== 'all' && '1', memberCountFilter !== 'all' && '1'].filter(Boolean).length}
                </span>
              )}
            </button>
            {(nameFilter || statusFilter !== 'all' || memberCountFilter !== 'all') && (
              <button
                onClick={() => {
                  setNameFilter('');
                  setStatusFilter('all');
                  setMemberCountFilter('all');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {t('common.clearFilters') || 'Clear Filters'}
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {/* Name filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('commissions.table.name')}
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

              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('commissions.table.status')}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('common.all') || 'All'}</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Member count filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('commissions.table.members')}
                </label>
                <select
                  value={memberCountFilter}
                  onChange={(e) => setMemberCountFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('common.all') || 'All'}</option>
                  <option value="0">0 {t('commissions.table.membersCount')}</option>
                  <option value="1-3">1-3 {t('commissions.table.membersCount')}</option>
                  <option value="4-6">4-6 {t('commissions.table.membersCount')}</option>
                  <option value="7+">7+ {t('commissions.table.membersCount')}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('commissions.table.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('commissions.table.description')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('commissions.table.members')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('commissions.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('commissions.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    {commissions.length === 0 
                      ? t('commissions.messages.noCommissions')
                      : t('common.noResults') || 'No results found'}
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((commission) => (
                  <tr key={commission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {commission.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {commission.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {commission.members.length} {t('commissions.table.membersCount')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {commission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setEditingCommission(commission)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title={t('commissions.table.edit')}
                        >
                          <HiPencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCommission(commission.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title={t('commissions.table.delete')}
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showCreateModal && (
          <CommissionModal
            users={users}
            onClose={() => {
              setShowCreateModal(false);
              setError('');
            }}
            onSubmit={handleCreateCommission}
          />
        )}

        {editingCommission && (
          <CommissionModal
            users={users}
            commission={editingCommission}
            onClose={() => {
              setEditingCommission(null);
              setError('');
            }}
            onSubmit={(data) => handleUpdateCommission(editingCommission.id, data as UpdateCommissionRequest)}
          />
        )}
      </div>
    </AppShell>
  );
}

interface CommissionModalProps {
  users: User[];
  commission?: Commission;
  onClose: () => void;
  onSubmit: (data: CreateCommissionRequest | UpdateCommissionRequest) => void;
}

function CommissionModal({ users, commission, onClose, onSubmit }: CommissionModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateCommissionRequest>({
    name: commission?.name || '',
    description: commission?.description || '',
    members: commission?.members.map(m => ({
      userId: m.userId,
      role: m.role,
    })) || [],
  });
  const [status, setStatus] = useState(commission?.status || 'Active');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [memberSearch, setMemberSearch] = useState('');

  const availableUsers = users.filter(
    (user) =>
      !formData.members.some((m) => m.userId === user.id) &&
      (memberSearch === '' ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(memberSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = t('commissions.createModal.nameRequired');
    }
    
    // Validate exactly one MainMember
    const mainMemberCount = formData.members.filter((m) => m.role === 'MainMember').length;
    if (mainMemberCount !== 1) {
      newErrors.members = t('commissions.createModal.exactlyOneMainMember');
    }

    // Validate 0 or 1 President
    const presidentCount = formData.members.filter((m) => m.role === 'President').length;
    if (presidentCount > 1) {
      newErrors.members = t('commissions.createModal.maxOnePresident');
    }

    // Validate at least one member
    if (formData.members.length === 0) {
      newErrors.members = t('commissions.createModal.atLeastOneMember');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      if (commission) {
        onSubmit({
          ...formData,
          status,
        } as UpdateCommissionRequest);
      } else {
        onSubmit(formData);
      }
    }
  };

  const addMember = (userId: string) => {
    if (formData.members.some((m) => m.userId === userId)) {
      return;
    }
    setFormData({
      ...formData,
      members: [...formData.members, { userId, role: 'Member' }],
    });
    setMemberSearch('');
  };

  const removeMember = (userId: string) => {
    setFormData({
      ...formData,
      members: formData.members.filter((m) => m.userId !== userId),
    });
  };

  const updateMemberRole = (userId: string, role: string) => {
    setFormData({
      ...formData,
      members: formData.members.map((m) => (m.userId === userId ? { ...m, role } : m)),
    });
  };

  const getRoleLabel = (role: string) => {
    return t(`commissions.roles.${role}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {commission ? t('commissions.editModal.title') : t('commissions.createModal.title')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('commissions.createModal.name')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('commissions.createModal.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>

          {commission && (
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('commissions.editModal.status')}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Active">{t('common.active')}</option>
                <option value="Inactive">{t('common.inactive')}</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('commissions.createModal.members')} *
            </label>
            <p className="text-sm text-gray-600 mb-2">{t('commissions.createModal.membersDescription')}</p>

            {/* Member search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder={t('commissions.createModal.searchUsers')}
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              {memberSearch && availableUsers.length > 0 && (
                <div className="mt-2 border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => addMember(user.id)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span>
                        {user.firstName} {user.lastName} ({user.email})
                      </span>
                      <span className="text-blue-600">+</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Member list */}
            {formData.members.length === 0 ? (
              <p className="text-sm text-gray-500">{t('commissions.createModal.noMembers')}</p>
            ) : (
              <div className="space-y-2">
                {formData.members.map((member) => {
                  const user = users.find((u) => u.id === member.userId);
                  if (!user) return null;
                  return (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-3 border border-gray-300 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={member.role}
                          onChange={(e) => updateMemberRole(member.userId, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="MainMember">{getRoleLabel('MainMember')}</option>
                          <option value="President">{getRoleLabel('President')}</option>
                          <option value="Member">{getRoleLabel('Member')}</option>
                          <option value="Trainee">{getRoleLabel('Trainee')}</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeMember(member.userId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {errors.members && (
              <p className="mt-1 text-sm text-red-600">{errors.members}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              {t('commissions.createModal.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {commission ? t('commissions.editModal.save') : t('commissions.createModal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

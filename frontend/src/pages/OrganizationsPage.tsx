import { useState, useEffect } from 'react';
import { AppShell } from '@/app/components/AppShell';
import { organizationService, OrganizationDto, CreateOrganizationRequest, UpdateOrganizationRequest, UserDto } from '@/application/services/OrganizationService';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useTranslation } from 'react-i18next';
import { HiPencil, HiTrash, HiMagnifyingGlass, HiFunnel, HiUsers, HiXMark } from 'react-icons/hi2';
import { UserTypeLabels } from '@/domain/enums/UserType';
import { getRoleDisplayInfo, getRoleLabel } from '@/domain/enums/UserRoleDisplay';

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

export function OrganizationsPage() {
  const { t } = useTranslation();
  const [organizations, setOrganizations] = useState<OrganizationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationDto | null>(null);
  const [members, setMembers] = useState<UserDto[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [midNumberFilter, setMidNumberFilter] = useState('');
  const [villageFilter, setVillageFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await organizationService.getAllOrganizations();
      setOrganizations(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('organizations.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (organizationId: string) => {
    try {
      setLoadingMembers(true);
      const data = await organizationService.getOrganizationMembers(organizationId);
      setMembers(data);
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('organizations.messages.loadMembersError'));
    } finally {
      setLoadingMembers(false);
    }
  };

  const addToast = (type: Toast['type'], message: string) => {
    setToasts((prev) => [...prev, { id: Date.now(), type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  };

  const handleCreateOrganization = async (data: CreateOrganizationRequest) => {
    try {
      await organizationService.createOrganization(data);
      setShowCreateModal(false);
      await loadOrganizations();
      addToast('success', t('organizations.messages.createSuccess'));
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('organizations.messages.createError'));
    }
  };

  const handleUpdateOrganization = async (data: UpdateOrganizationRequest) => {
    if (!selectedOrganization) return;
    try {
      await organizationService.updateOrganization(selectedOrganization.id, data);
      setShowEditModal(false);
      setSelectedOrganization(null);
      await loadOrganizations();
      addToast('success', t('organizations.messages.updateSuccess'));
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('organizations.messages.updateError'));
    }
  };

  const handleDelete = async () => {
    if (!selectedOrganization) return;
    try {
      await organizationService.deleteOrganization(selectedOrganization.id);
      setShowDeleteModal(false);
      setSelectedOrganization(null);
      await loadOrganizations();
      addToast('success', t('organizations.messages.deleteSuccess'));
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('organizations.messages.deleteError'));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedOrganization) return;
    if (!confirm(t('organizations.messages.removeMemberConfirm'))) return;
    
    try {
      await organizationService.removeOrganizationMember(selectedOrganization.id, userId);
      await loadMembers(selectedOrganization.id);
      addToast('success', t('organizations.messages.removeMemberSuccess'));
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('organizations.messages.removeMemberError'));
    }
  };

  // Filter organizations
  const filteredOrganizations = organizations.filter((org) => {
    if (nameFilter && !org.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
    if (midNumberFilter && !org.midNumber.toLowerCase().includes(midNumberFilter.toLowerCase())) return false;
    if (villageFilter && (!org.village || !org.village.toLowerCase().includes(villageFilter.toLowerCase()))) return false;
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('organizations.pageTitle')}</h1>
            <p className="text-gray-600 mt-1">{t('organizations.pageSubtitle')}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('organizations.addButton')}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
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
              {(nameFilter || midNumberFilter || villageFilter) && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {[nameFilter && '1', midNumberFilter && '1', villageFilter && '1'].filter(Boolean).length}
                </span>
              )}
            </button>
            {(nameFilter || midNumberFilter || villageFilter) && (
              <button
                onClick={() => {
                  setNameFilter('');
                  setMidNumberFilter('');
                  setVillageFilter('');
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
                  {t('organizations.table.name')}
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

              {/* MID Number filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('organizations.table.midNumber')}
                </label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={midNumberFilter}
                    onChange={(e) => setMidNumberFilter(e.target.value)}
                    placeholder={t('common.search') || 'Search...'}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Village filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('organizations.table.village')}
                </label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={villageFilter}
                    onChange={(e) => setVillageFilter(e.target.value)}
                    placeholder={t('common.search') || 'Search...'}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('organizations.table.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('organizations.table.midNumber')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('organizations.table.village')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('organizations.table.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('organizations.table.members')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('organizations.table.createdAt')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('organizations.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrganizations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {organizations.length === 0 
                      ? t('organizations.messages.noOrganizations')
                      : (t('common.noResults') || 'No results found')}
                  </td>
                </tr>
              ) : (
                filteredOrganizations.map((org) => (
                  <tr key={org.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{org.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{org.midNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{org.village || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{org.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={async () => {
                          setSelectedOrganization(org);
                          setShowMembersModal(true);
                          await loadMembers(org.id);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <HiUsers className="w-4 h-4" />
                        {org.memberCount}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedOrganization(org);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title={t('organizations.actions.edit')}
                        >
                          <HiPencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrganization(org);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title={t('organizations.actions.delete')}
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

        {/* Create Modal */}
        {showCreateModal && (
          <CreateOrganizationModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateOrganization}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedOrganization && (
          <UpdateOrganizationModal
            organization={selectedOrganization}
            onClose={() => {
              setShowEditModal(false);
              setSelectedOrganization(null);
            }}
            onSubmit={handleUpdateOrganization}
          />
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedOrganization && (
          <DeleteModal
            organization={selectedOrganization}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedOrganization(null);
            }}
            onConfirm={handleDelete}
          />
        )}

        {/* Members Modal */}
        {showMembersModal && selectedOrganization && (
          <MembersModal
            organization={selectedOrganization}
            members={members}
            loadingMembers={loadingMembers}
            onClose={() => {
              setShowMembersModal(false);
              setSelectedOrganization(null);
              setMembers([]);
            }}
            onRemoveMember={handleRemoveMember}
          />
        )}
      </div>
    </AppShell>
  );
}

function CreateOrganizationModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: CreateOrganizationRequest) => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateOrganizationRequest>({
    name: '',
    midNumber: '',
    village: '',
    address: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('organizations.createModal.nameRequired');
    if (!formData.midNumber.trim()) newErrors.midNumber = t('organizations.createModal.midNumberRequired');
    if (formData.midNumber && !/^[A-Za-z0-9\-]+$/.test(formData.midNumber)) {
      newErrors.midNumber = t('organizations.createModal.midNumberInvalid');
    }
    if (formData.midNumber && formData.midNumber.length > 50) {
      newErrors.midNumber = t('organizations.createModal.midNumberMaxLength');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        village: formData.village || undefined,
        address: formData.address || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{t('organizations.createModal.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('organizations.createModal.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('organizations.createModal.midNumber')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.midNumber}
              onChange={(e) => {
                setFormData({ ...formData, midNumber: e.target.value });
                setErrors({ ...errors, midNumber: '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.midNumber && <p className="text-red-600 text-sm mt-1">{errors.midNumber}</p>}
            <p className="text-xs text-gray-500 mt-1">{t('organizations.createModal.midNumberHelp')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('organizations.createModal.village')} <span className="text-gray-500 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="text"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('organizations.createModal.address')} <span className="text-gray-500 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('organizations.createModal.email')} <span className="text-gray-500 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('organizations.createModal.phone')} <span className="text-gray-500 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('organizations.createModal.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('organizations.createModal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateOrganizationModal({
  organization,
  onClose,
  onSubmit,
}: {
  organization: OrganizationDto;
  onClose: () => void;
  onSubmit: (data: UpdateOrganizationRequest) => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<UpdateOrganizationRequest>({
    name: organization.name,
    midNumber: organization.midNumber,
    village: organization.village || '',
    address: organization.address || '',
    email: organization.email || '',
    phone: organization.phone || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t('organizations.editModal.nameRequired');
    if (!formData.midNumber.trim()) newErrors.midNumber = t('organizations.editModal.midNumberRequired');
    if (formData.midNumber && !/^[A-Za-z0-9\-]+$/.test(formData.midNumber)) {
      newErrors.midNumber = t('organizations.editModal.midNumberInvalid');
    }
    if (formData.midNumber && formData.midNumber.length > 50) {
      newErrors.midNumber = t('organizations.editModal.midNumberMaxLength');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        village: formData.village || undefined,
        address: formData.address || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{t('organizations.editModal.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('organizations.editModal.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('organizations.editModal.midNumber')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.midNumber}
              onChange={(e) => {
                setFormData({ ...formData, midNumber: e.target.value });
                setErrors({ ...errors, midNumber: '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.midNumber && <p className="text-red-600 text-sm mt-1">{errors.midNumber}</p>}
            <p className="text-xs text-gray-500 mt-1">{t('organizations.editModal.midNumberHelp')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('organizations.editModal.village')} <span className="text-gray-500 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="text"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('organizations.editModal.address')} <span className="text-gray-500 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('organizations.editModal.email')} <span className="text-gray-500 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('organizations.editModal.phone')} <span className="text-gray-500 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('organizations.editModal.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('organizations.editModal.update')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({
  organization,
  onClose,
  onConfirm,
}: {
  organization: OrganizationDto;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-red-600">{t('organizations.deleteModal.title')}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {t('organizations.deleteModal.description', { name: organization.name })}
        </p>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('organizations.deleteModal.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {t('organizations.deleteModal.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

function MembersModal({
  organization,
  members,
  loadingMembers,
  onClose,
  onRemoveMember,
}: {
  organization: OrganizationDto;
  members: UserDto[];
  loadingMembers: boolean;
  onClose: () => void;
  onRemoveMember: (userId: string) => void;
}) {
  const { t } = useTranslation();
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    if (nameFilter && !fullName.includes(nameFilter.toLowerCase())) return false;
    if (emailFilter && !member.email.toLowerCase().includes(emailFilter.toLowerCase())) return false;
    if (roleFilter !== 'all' && member.primaryRole !== roleFilter) return false;
    return true;
  });

  const uniqueRoles = Array.from(new Set(members.map(m => m.primaryRole)));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t('organizations.membersModal.title')}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('organizations.membersModal.description', { name: organization.name })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <HiXMark className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <HiFunnel className="w-4 h-4" />
              {t('common.filters') || 'Filters'}
              {(nameFilter || emailFilter || roleFilter !== 'all') && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {[nameFilter && '1', emailFilter && '1', roleFilter !== 'all' && '1'].filter(Boolean).length}
                </span>
              )}
            </button>
            {(nameFilter || emailFilter || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setNameFilter('');
                  setEmailFilter('');
                  setRoleFilter('all');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {t('common.clearFilters') || 'Clear Filters'}
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('organizations.membersModal.name')}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('organizations.membersModal.email')}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('organizations.membersModal.role')}
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('common.all') || 'All'}</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingMembers ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">{t('common.loading')}</div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('organizations.membersModal.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('organizations.membersModal.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('organizations.membersModal.userType')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('organizations.membersModal.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('organizations.membersModal.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('organizations.membersModal.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      {members.length === 0 
                        ? t('organizations.membersModal.noMembers')
                        : (t('common.noResults') || 'No results found')}
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {UserTypeLabels[member.userType as unknown as keyof typeof UserTypeLabels] || member.userType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const roleInfo = getRoleDisplayInfo(member.primaryRole as any, 'en');
                          const Icon = roleInfo.icon;
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md ${roleInfo.bgColor} ${roleInfo.color}`}>
                              <Icon className="w-3.5 h-3.5" />
                              {getRoleLabel(member.primaryRole as any, 'en')}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {member.isActive ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => onRemoveMember(member.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title={t('organizations.membersModal.removeMember')}
                          disabled={member.userType === 'OrganizationAdmin' && member.primaryRole === 'OrganizationAdmin'}
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex-shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('organizations.membersModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

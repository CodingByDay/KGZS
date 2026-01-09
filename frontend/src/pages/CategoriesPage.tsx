import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@/infrastructure/api/apiClient';
import { AppShell } from '@/app/components/AppShell';
import { ApiError } from '@/infrastructure/api/apiClient';
import { HiPencil, HiTrash, HiPlus, HiFolder, HiFolderOpen, HiMagnifyingGlass, HiFunnel } from 'react-icons/hi2';

interface Group {
  id: string;
  name: string;
  description?: string;
  evaluationEventId?: string;
}

interface Subgroup {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description?: string;
  createdAt: string;
}

interface CreateGroupRequest {
  name: string;
  description?: string;
}

interface UpdateGroupRequest {
  name: string;
  description?: string;
}

interface CreateSubgroupRequest {
  categoryId: string;
  name: string;
  description?: string;
}

interface UpdateSubgroupRequest {
  name: string;
  description?: string;
}

export function CategoriesPage() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showCreateSubgroupModal, setShowCreateSubgroupModal] = useState(false);
  const [editingSubgroup, setEditingSubgroup] = useState<Subgroup | null>(null);
  const [error, setError] = useState('');
  
  // Filter states for groups
  const [groupNameFilter, setGroupNameFilter] = useState('');
  const [showGroupFilters, setShowGroupFilters] = useState(false);
  
  // Filter states for subgroups
  const [subgroupNameFilter, setSubgroupNameFilter] = useState('');
  const [subgroupCategoryFilter, setSubgroupCategoryFilter] = useState('all');
  const [showSubgroupFilters, setShowSubgroupFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [groupsData, subgroupsData] = await Promise.all([
        apiClient.get<Group[]>('/api/groups'),
        apiClient.get<Subgroup[]>('/api/subgroups'),
      ]);
      setGroups(groupsData);
      setSubgroups(subgroupsData);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('categories.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (data: CreateGroupRequest) => {
    try {
      const requestData = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
      };
      await apiClient.post<Group>('/api/groups', requestData);
      await loadData();
      setShowCreateGroupModal(false);
      setError('');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('categories.messages.createError'));
    }
  };

  const handleUpdateGroup = async (id: string, data: UpdateGroupRequest) => {
    try {
      await apiClient.put<Group>(`/api/groups/${id}`, data);
      await loadData();
      setEditingGroup(null);
      setError('');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('categories.messages.updateError'));
    }
  };

  const handleDeleteGroup = async (id: string) => {
    const confirmMessage = t('categories.messages.deleteConfirm') || 'Are you sure you want to delete this group?';
    if (!confirm(confirmMessage)) {
      return;
    }
    try {
      await apiClient.delete(`/api/groups/${id}`);
      await loadData();
      setError('');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('categories.messages.deleteError'));
    }
  };

  const handleCreateSubgroup = async (data: CreateSubgroupRequest) => {
    try {
      const requestData = {
        categoryId: data.categoryId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
      };
      console.log('Creating subgroup with data:', requestData);
      await apiClient.post<Subgroup>('/api/subgroups', requestData);
      await loadData();
      setShowCreateSubgroupModal(false);
      setError('');
    } catch (err) {
      console.error('Error creating subgroup:', err);
      const apiError = err as ApiError;
      setError(apiError.message || t('categories.subgroups.messages.createError'));
    }
  };

  const handleUpdateSubgroup = async (id: string, data: UpdateSubgroupRequest) => {
    try {
      await apiClient.put<Subgroup>(`/api/subgroups/${id}`, data);
      await loadData();
      setEditingSubgroup(null);
      setError('');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('categories.subgroups.messages.updateError'));
    }
  };

  const handleDeleteSubgroup = async (id: string) => {
    const confirmMessage = t('categories.subgroups.messages.deleteConfirm') || 'Are you sure you want to delete this subgroup?';
    if (!confirm(confirmMessage)) {
      return;
    }
    try {
      await apiClient.delete(`/api/subgroups/${id}`);
      await loadData();
      setError('');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('categories.subgroups.messages.deleteError'));
    }
  };

  const getSubgroupsForGroup = (groupId: string) => {
    return subgroups.filter(sg => sg.categoryId === groupId);
  };

  // Filter groups
  const filteredGroups = groups.filter((group) => {
    if (groupNameFilter && !group.name.toLowerCase().includes(groupNameFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Filter subgroups
  const filteredSubgroups = subgroups.filter((subgroup) => {
    if (subgroupNameFilter && !subgroup.name.toLowerCase().includes(subgroupNameFilter.toLowerCase())) {
      return false;
    }
    if (subgroupCategoryFilter !== 'all' && subgroup.categoryId !== subgroupCategoryFilter) {
      return false;
    }
    return true;
  });

  // Get unique categories for subgroup filter
  const uniqueCategories = Array.from(
    new Map(subgroups.map(sg => [sg.categoryId, { id: sg.categoryId, name: sg.categoryName }])).values()
  );

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('categories.title')}</h1>
          <p className="mt-1 text-gray-600">{t('categories.subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Groups Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-b from-blue-900 to-blue-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HiFolder className="w-8 h-8 text-blue-100" />
                <div>
                  <h2 className="text-xl font-semibold text-white">{t('categories.title')}</h2>
                  <p className="text-blue-100 text-sm">{t('categories.subtitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="px-4 py-2 bg-white text-blue-900 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 font-medium"
              >
                <HiPlus className="w-5 h-5" />
                {t('categories.createButton')}
              </button>
            </div>
          </div>

          {/* Group Filters */}
          <div className="px-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowGroupFilters(!showGroupFilters)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <HiFunnel className="w-4 h-4" />
                {t('common.filters') || 'Filters'}
                {groupNameFilter && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">1</span>
                )}
              </button>
              {groupNameFilter && (
                <button
                  onClick={() => setGroupNameFilter('')}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {t('common.clearFilters') || 'Clear Filters'}
                </button>
              )}
            </div>

            {showGroupFilters && (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('categories.createModal.name')}
                  </label>
                  <div className="relative">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={groupNameFilter}
                      onChange={(e) => setGroupNameFilter(e.target.value)}
                      placeholder={t('common.search') || 'Search...'}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('categories.createModal.name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('categories.createModal.description')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        {groups.length === 0 
                          ? (t('categories.messages.noGroups') || 'No groups found. Create your first group.')
                          : (t('common.noResults') || 'No results found')}
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((group) => {
                      const groupSubgroups = getSubgroupsForGroup(group.id);

                      return (
                        <tr key={group.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{group.name}</span>
                              {groupSubgroups.length > 0 && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                                  {groupSubgroups.length} {t('categories.subgroups.title').toLowerCase()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">{group.description || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingGroup(group)}
                                className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                                title={t('categories.edit')}
                              >
                                <HiPencil className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteGroup(group.id)}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                title={t('common.delete')}
                              >
                                <HiTrash className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Subgroups Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-b from-green-900 to-green-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HiFolderOpen className="w-8 h-8 text-green-100" />
                <div>
                  <h2 className="text-xl font-semibold text-white">{t('categories.subgroups.title')}</h2>
                  <p className="text-green-100 text-sm">
                    {t('categories.subgroups.subtitle') || 'Manage subgroups within groups'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateSubgroupModal(true)}
                className="px-4 py-2 bg-white text-green-900 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2 font-medium"
              >
                <HiPlus className="w-5 h-5" />
                {t('categories.subgroups.addSubgroup')}
              </button>
            </div>
          </div>

          {/* Subgroup Filters */}
          <div className="px-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowSubgroupFilters(!showSubgroupFilters)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <HiFunnel className="w-4 h-4" />
                {t('common.filters') || 'Filters'}
                {(subgroupNameFilter || subgroupCategoryFilter !== 'all') && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                    {[subgroupNameFilter && '1', subgroupCategoryFilter !== 'all' && '1'].filter(Boolean).length}
                  </span>
                )}
              </button>
              {(subgroupNameFilter || subgroupCategoryFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSubgroupNameFilter('');
                    setSubgroupCategoryFilter('all');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {t('common.clearFilters') || 'Clear Filters'}
                </button>
              )}
            </div>

            {showSubgroupFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('categories.subgroups.createModal.name')}
                  </label>
                  <div className="relative">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={subgroupNameFilter}
                      onChange={(e) => setSubgroupNameFilter(e.target.value)}
                      placeholder={t('common.search') || 'Search...'}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('categories.subgroups.createModal.group')}
                  </label>
                  <select
                    value={subgroupCategoryFilter}
                    onChange={(e) => setSubgroupCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">{t('common.all') || 'All'}</option>
                    {uniqueCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('categories.subgroups.createModal.group')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('categories.subgroups.createModal.name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('categories.subgroups.createModal.description')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubgroups.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        {subgroups.length === 0 
                          ? t('categories.subgroups.noSubgroups')
                          : (t('common.noResults') || 'No results found')}
                      </td>
                    </tr>
                  ) : (
                    filteredSubgroups.map((subgroup) => (
                      <tr key={subgroup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{subgroup.categoryName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{subgroup.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{subgroup.description || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingSubgroup(subgroup)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                              title={t('categories.edit')}
                            >
                              <HiPencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubgroup(subgroup.id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                              title={t('common.delete')}
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
          </div>
        </div>

        {/* Modals */}
        {showCreateGroupModal && (
          <CreateGroupModal
            onClose={() => {
              setShowCreateGroupModal(false);
              setError('');
            }}
            onSubmit={handleCreateGroup}
          />
        )}

        {editingGroup && (
          <EditGroupModal
            group={editingGroup}
            onClose={() => {
              setEditingGroup(null);
              setError('');
            }}
            onSubmit={(data) => handleUpdateGroup(editingGroup.id, data)}
          />
        )}

        {showCreateSubgroupModal && (
          <CreateSubgroupModal
            groups={groups}
            onClose={() => {
              setShowCreateSubgroupModal(false);
              setError('');
            }}
            onSubmit={handleCreateSubgroup}
          />
        )}

        {editingSubgroup && (
          <EditSubgroupModal
            subgroup={editingSubgroup}
            onClose={() => {
              setEditingSubgroup(null);
              setError('');
            }}
            onSubmit={(data) => handleUpdateSubgroup(editingSubgroup.id, data)}
          />
        )}
      </div>
    </AppShell>
  );
}

function CreateGroupModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: CreateGroupRequest) => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = t('categories.createModal.nameRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{t('categories.createModal.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('categories.createModal.name')} *
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
              placeholder={t('common.placeholders.name')}
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('categories.createModal.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={t('common.placeholders.description')}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              {t('categories.createModal.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('categories.createModal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditGroupModal({
  group,
  onClose,
  onSubmit,
}: {
  group: Group;
  onClose: () => void;
  onSubmit: (data: UpdateGroupRequest) => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<UpdateGroupRequest>({
    name: group.name,
    description: group.description || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = t('categories.createModal.nameRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{t('categories.editModal.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('categories.createModal.name')} *
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
              placeholder={t('common.placeholders.name')}
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('categories.createModal.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={t('common.placeholders.description')}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              {t('categories.createModal.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('categories.editModal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateSubgroupModal({
  groups,
  onClose,
  onSubmit,
}: {
  groups: Group[];
  onClose: () => void;
  onSubmit: (data: CreateSubgroupRequest) => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateSubgroupRequest>({
    categoryId: '',
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = t('categories.subgroups.createModal.nameRequired');
    }
    if (!formData.categoryId) {
      newErrors.categoryId = t('categories.subgroups.createModal.groupRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        description: formData.description?.trim() || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{t('categories.subgroups.createModal.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('categories.subgroups.createModal.group')} *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => {
                setFormData({ ...formData, categoryId: e.target.value });
                if (errors.categoryId) setErrors({ ...errors, categoryId: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">{t('common.select') || 'Select...'}</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('categories.subgroups.createModal.name')} *
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
              placeholder={t('common.placeholders.name')}
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('categories.subgroups.createModal.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={t('common.placeholders.description')}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              {t('categories.subgroups.createModal.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {t('categories.subgroups.createModal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditSubgroupModal({
  subgroup,
  onClose,
  onSubmit,
}: {
  subgroup: Subgroup;
  onClose: () => void;
  onSubmit: (data: UpdateSubgroupRequest) => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<UpdateSubgroupRequest>({
    name: subgroup.name,
    description: subgroup.description || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = t('categories.subgroups.createModal.nameRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        description: formData.description?.trim() || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{t('categories.subgroups.editModal.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('categories.subgroups.createModal.name')} *
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
              placeholder={t('common.placeholders.name')}
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('categories.subgroups.createModal.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={t('common.placeholders.description')}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              {t('categories.subgroups.createModal.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {t('categories.subgroups.editModal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

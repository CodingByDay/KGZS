import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@/infrastructure/api/apiClient';
import { AppShell } from '@/app/components/AppShell';
import { ApiError } from '@/infrastructure/api/apiClient';

interface CategoryReviewer {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  assignedAt: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  evaluationEventId?: string;
  reviewers?: CategoryReviewer[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface CreateCategoryRequest {
  name: string;
  description?: string;
  reviewerUserIds: string[];
}

export function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, usersData] = await Promise.all([
        apiClient.get<Category[]>('/api/categories'),
        apiClient.get<User[]>('/api/admin/users').catch(() => []),
      ]);
      setCategories(categoriesData);
      setUsers(usersData);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('categories.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (data: CreateCategoryRequest) => {
    try {
      await apiClient.post<Category>('/api/categories', data);
      await loadData();
      setShowCreateModal(false);
      setError('');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('categories.messages.createError'));
    }
  };

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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">{t('categories.title')}</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('categories.createButton')}
            </button>
          </div>
          <p className="mt-1 text-gray-600">{t('categories.subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Food Group Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewers</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{category.description || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {category.reviewers && category.reviewers.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {category.reviewers.map((reviewer) => (
                          <span
                            key={reviewer.id}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                            title={reviewer.userEmail}
                          >
                            {reviewer.userName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showCreateModal && (
          <CreateCategoryModal
            users={users}
            onClose={() => {
              setShowCreateModal(false);
              setError('');
            }}
            onSubmit={handleCreateCategory}
          />
        )}
      </div>
    </AppShell>
  );
}

function CreateCategoryModal({
  users,
  onClose,
  onSubmit,
}: {
  users: User[];
  onClose: () => void;
  onSubmit: (data: CreateCategoryRequest) => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    description: '',
    reviewerUserIds: [],
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
        ...formData,
        description: formData.description || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
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
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('categories.createModal.reviewers')}
            </label>
            <p className="text-xs text-gray-500 mb-2">{t('categories.createModal.reviewersDescription')}</p>
            <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
              {(() => {
                const reviewerUsers = users.filter((user) => 
                  user.role === 'CommissionMember' || 
                  user.role === 'CommissionChair' || 
                  user.role === 'CommissionTrainee' ||
                  user.role === 'EvaluationOrganizer'
                );
                return reviewerUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('categories.createModal.noReviewers')}</p>
                ) : (
                  <div className="space-y-2">
                    {reviewerUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.reviewerUserIds.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              reviewerUserIds: [...formData.reviewerUserIds, user.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              reviewerUserIds: formData.reviewerUserIds.filter((id) => id !== user.id),
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">({user.email})</span>
                      </div>
                    </label>
                    ))}
                  </div>
                );
              })()}
            </div>
            {formData.reviewerUserIds.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {formData.reviewerUserIds.length} {formData.reviewerUserIds.length === 1 ? 'reviewer' : 'reviewers'} selected
              </p>
            )}
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

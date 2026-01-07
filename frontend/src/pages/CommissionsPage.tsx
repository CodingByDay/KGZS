import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@/infrastructure/api/apiClient';
import { AppShell } from '@/app/components/AppShell';
import { ApiError } from '@/infrastructure/api/apiClient';

interface Commission {
  id: string;
  name: string;
  description?: string;
  status: string;
  categoryId: string;
  evaluationEventId: string;
}

interface EvaluationEvent {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  evaluationEventId: string;
}

interface CreateCommissionRequest {
  evaluationEventId: string;
  categoryId: string;
  name: string;
  description?: string;
}

export function CommissionsPage() {
  const { t } = useTranslation();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [evaluationEvents, setEvaluationEvents] = useState<EvaluationEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [commissionsData, eventsData, categoriesData] = await Promise.all([
        apiClient.get<Commission[]>('/api/commissions'),
        apiClient.get<EvaluationEvent[]>('/api/evaluations').catch(() => []),
        apiClient.get<Category[]>('/api/categories').catch(() => []),
      ]);
      setCommissions(commissionsData);
      setEvaluationEvents(eventsData);
      setCategories(categoriesData);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('commissions.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommission = async (data: CreateCommissionRequest) => {
    try {
      await apiClient.post<Commission>('/api/commissions', data);
      await loadData();
      setShowCreateModal(false);
      setError('');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('commissions.messages.createError'));
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('commissions.title')}</h1>
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

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commissions.map((commission) => (
                <tr key={commission.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{commission.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{commission.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {commission.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showCreateModal && (
          <CreateCommissionModal
            evaluationEvents={evaluationEvents}
            categories={categories}
            onClose={() => {
              setShowCreateModal(false);
              setError('');
            }}
            onSubmit={handleCreateCommission}
          />
        )}
      </div>
    </AppShell>
  );
}

function CreateCommissionModal({
  evaluationEvents,
  categories,
  onClose,
  onSubmit,
}: {
  evaluationEvents: EvaluationEvent[];
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: CreateCommissionRequest) => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateCommissionRequest>({
    evaluationEventId: '',
    categoryId: '',
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (formData.evaluationEventId) {
      const filtered = categories.filter(
        (cat) => cat.evaluationEventId === formData.evaluationEventId
      );
      setFilteredCategories(filtered);
      if (formData.categoryId && !filtered.find((c) => c.id === formData.categoryId)) {
        setFormData((prev) => ({ ...prev, categoryId: '' }));
      }
    } else {
      setFilteredCategories([]);
      setFormData((prev) => ({ ...prev, categoryId: '' }));
    }
  }, [formData.evaluationEventId, formData.categoryId, categories]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = t('commissions.createModal.nameRequired');
    }
    if (!formData.evaluationEventId) {
      newErrors.evaluationEventId = t('commissions.createModal.evaluationEventRequired');
    }
    if (!formData.categoryId) {
      newErrors.categoryId = t('commissions.createModal.categoryRequired');
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
        <h2 className="text-2xl font-bold mb-4">{t('commissions.createModal.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('commissions.createModal.evaluationEvent')} *
            </label>
            <select
              value={formData.evaluationEventId}
              onChange={(e) => {
                setFormData({ ...formData, evaluationEventId: e.target.value, categoryId: '' });
                if (errors.evaluationEventId) setErrors({ ...errors, evaluationEventId: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.evaluationEventId ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">{t('commissions.createModal.evaluationEvent')}</option>
              {evaluationEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
            {errors.evaluationEventId && (
              <p className="mt-1 text-sm text-red-600">{errors.evaluationEventId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('commissions.createModal.category')} *
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
              disabled={!formData.evaluationEventId || filteredCategories.length === 0}
            >
              <option value="">
                {formData.evaluationEventId
                  ? filteredCategories.length === 0
                    ? 'No categories available for this event'
                    : t('commissions.createModal.category')
                  : 'Select evaluation event first'}
              </option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>

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
              {t('commissions.createModal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

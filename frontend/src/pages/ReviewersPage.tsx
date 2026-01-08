import { useState, useEffect } from 'react';
import { AppShell } from '@/app/components/AppShell';
import { reviewerService, ReviewerDto, CreateReviewerRequest, UpdateReviewerEmailRequest, ResetReviewerPasswordRequest, UpdateReviewerProfileRequest } from '@/application/services/ReviewerService';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useTranslation } from 'react-i18next';
import { HiPencil, HiTrash, HiKey } from 'react-icons/hi2';

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

export function ReviewersPage() {
  const { t } = useTranslation();
  const [reviewers, setReviewers] = useState<ReviewerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState<ReviewerDto | null>(null);

  useEffect(() => {
    loadReviewers();
  }, []);

  const loadReviewers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await reviewerService.getReviewers();
      setReviewers(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('reviewers.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const handleCreateReviewer = async (data: CreateReviewerRequest) => {
    try {
      await reviewerService.createReviewer(data);
      setShowCreateModal(false);
      await loadReviewers();
      addToast('success', t('reviewers.messages.createSuccess'));
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('reviewers.messages.createError'));
    }
  };

  const handleUpdateProfile = async (data: UpdateReviewerProfileRequest) => {
    if (!selectedReviewer) return;
    try {
      // Update profile (firstName, lastName, phoneNumber)
      await reviewerService.updateReviewerProfile(selectedReviewer.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
      });
      // Update email separately if it changed
      if (data.email !== selectedReviewer.email) {
        await reviewerService.updateReviewerEmail(selectedReviewer.id, { email: data.email });
      }
      setShowEditModal(false);
      setSelectedReviewer(null);
      await loadReviewers();
      addToast('success', t('reviewers.messages.updateProfileSuccess'));
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('reviewers.messages.updateProfileError'));
    }
  };

  const handleDelete = async () => {
    if (!selectedReviewer) return;
    try {
      await reviewerService.deleteReviewer(selectedReviewer.id);
      setShowDeleteModal(false);
      setSelectedReviewer(null);
      await loadReviewers();
      addToast('success', t('reviewers.messages.deleteSuccess'));
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('reviewers.messages.deleteError'));
    }
  };

  const handleResetPassword = async (data: ResetReviewerPasswordRequest): Promise<string | null> => {
    if (!selectedReviewer) return null;
    try {
      const response = await reviewerService.resetReviewerPassword(selectedReviewer.id, data);
      setShowPasswordModal(false);
      setSelectedReviewer(null);
      addToast('success', t('reviewers.messages.updatePasswordSuccess'));
      
      // If temporary password was generated, show it
      if (response.temporaryPassword) {
        return response.temporaryPassword;
      }
      return null;
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('reviewers.messages.updatePasswordError'));
      return null;
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
            <h1 className="text-3xl font-bold text-gray-900">{t('reviewers.pageTitle')}</h1>
            <p className="text-gray-600 mt-1">{t('reviewers.pageSubtitle')}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('reviewers.addButton')}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reviewers.table.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reviewers.table.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reviewers.table.phoneNumber')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reviewers.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reviewers.table.createdAt')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('reviewers.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviewers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {t('reviewers.table.noData')}
                  </td>
                </tr>
              ) : (
                reviewers.map((reviewer) => (
                  <tr key={reviewer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reviewer.firstName} {reviewer.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{reviewer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{reviewer.phoneNumber || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reviewer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {reviewer.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(reviewer.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedReviewer(reviewer);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title={t('reviewers.editModal.title')}
                        >
                          <HiPencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReviewer(reviewer);
                            setShowPasswordModal(true);
                          }}
                          className="p-2 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded transition-colors"
                          title={t('reviewers.passwordModal.title')}
                        >
                          <HiKey className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReviewer(reviewer);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title={t('reviewers.deleteModal.title')}
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
          <CreateReviewerModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateReviewer}
          />
        )}

        {/* Edit Profile Modal */}
        {showEditModal && selectedReviewer && (
          <UpdateProfileModal
            reviewer={selectedReviewer}
            onClose={() => {
              setShowEditModal(false);
              setSelectedReviewer(null);
            }}
            onSubmit={handleUpdateProfile}
          />
        )}

        {/* Password Modal */}
        {showPasswordModal && selectedReviewer && (
          <ResetPasswordModal
            reviewer={selectedReviewer}
            onClose={() => {
              setShowPasswordModal(false);
              setSelectedReviewer(null);
            }}
            onSubmit={handleResetPassword}
          />
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedReviewer && (
          <DeleteModal
            reviewer={selectedReviewer}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedReviewer(null);
            }}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </AppShell>
  );
}

function CreateReviewerModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: CreateReviewerRequest) => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateReviewerRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = t('reviewers.createModal.emailRequired');
    if (!formData.password || formData.password.length < 6) newErrors.password = t('reviewers.createModal.passwordRequired');
    if (!formData.firstName) newErrors.firstName = t('reviewers.createModal.firstNameRequired');
    if (!formData.lastName) newErrors.lastName = t('reviewers.createModal.lastNameRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        phoneNumber: formData.phoneNumber || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{t('reviewers.createModal.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reviewers.createModal.firstName')}
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reviewers.createModal.lastName')}
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reviewers.createModal.phoneNumber')} <span className="text-gray-500 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reviewers.createModal.email')}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reviewers.createModal.password')}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('reviewers.createModal.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('reviewers.createModal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateProfileModal({
  reviewer,
  onClose,
  onSubmit,
}: {
  reviewer: ReviewerDto;
  onClose: () => void;
  onSubmit: (data: UpdateReviewerProfileRequest) => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<UpdateReviewerProfileRequest>({
    firstName: reviewer.firstName,
    lastName: reviewer.lastName,
    email: reviewer.email,
    phoneNumber: reviewer.phoneNumber || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = t('reviewers.editModal.firstNameRequired');
    if (!formData.lastName) newErrors.lastName = t('reviewers.editModal.lastNameRequired');
    if (!formData.email) newErrors.email = t('reviewers.editModal.emailRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        phoneNumber: formData.phoneNumber || undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{t('reviewers.editModal.title')}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {t('reviewers.editModal.description', { name: `${reviewer.firstName} ${reviewer.lastName}` })}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reviewers.editModal.firstName')}
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => {
                setFormData({ ...formData, firstName: e.target.value });
                if (errors.firstName) setErrors({ ...errors, firstName: '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reviewers.editModal.lastName')}
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => {
                setFormData({ ...formData, lastName: e.target.value });
                if (errors.lastName) setErrors({ ...errors, lastName: '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reviewers.editModal.phoneNumber')} <span className="text-gray-500 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reviewers.editModal.email')}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
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
              {t('reviewers.editModal.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('reviewers.editModal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({
  reviewer,
  onClose,
  onSubmit,
}: {
  reviewer: ReviewerDto;
  onClose: () => void;
  onSubmit: (data: ResetReviewerPasswordRequest) => Promise<string | null>;
}) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password && password.length < 6) {
      setError(t('reviewers.passwordModal.passwordMinLength'));
      return;
    }
    
    if (password && password !== confirmPassword) {
      setError(t('reviewers.passwordModal.passwordsMismatch'));
      return;
    }

    const request: ResetReviewerPasswordRequest = password ? { password } : {};
    const tempPassword = await onSubmit(request);
    if (tempPassword) {
      setTemporaryPassword(tempPassword);
    }
  };

  const copyToClipboard = () => {
    if (temporaryPassword) {
      navigator.clipboard.writeText(temporaryPassword);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    }
  };

  if (temporaryPassword) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">{t('reviewers.passwordModal.temporaryPassword')}</h2>
          <p className="text-sm text-yellow-600 mb-4">
            {t('reviewers.passwordModal.temporaryPasswordWarning')}
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <code className="text-lg font-mono">{temporaryPassword}</code>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                {passwordCopied ? '✓ ' + t('reviewers.passwordModal.copied') : t('reviewers.passwordModal.copyPassword')}
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{t('reviewers.passwordModal.title')}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {t('reviewers.passwordModal.description', { name: `${reviewer.firstName} ${reviewer.lastName}` })}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reviewers.passwordModal.newPassword')}
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
          {password && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('reviewers.passwordModal.confirmPassword')}
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
            </div>
          )}
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('reviewers.passwordModal.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              {t('reviewers.passwordModal.reset')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({
  reviewer,
  onClose,
  onConfirm,
}: {
  reviewer: ReviewerDto;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-red-600">{t('reviewers.deleteModal.title')}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {t('reviewers.deleteModal.description', { name: `${reviewer.firstName} ${reviewer.lastName}` })}
        </p>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('reviewers.deleteModal.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {t('reviewers.deleteModal.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { AppShell } from '@/app/components/AppShell';
import { superAdminService, SuperAdminDto, CreateSuperAdminRequest, UpdateEmailRequest, UpdatePasswordRequest } from '@/application/services/SuperAdminService';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useTranslation } from 'react-i18next';

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

export function SuperAdminsPage() {
  const { t } = useTranslation();
  const [superAdmins, setSuperAdmins] = useState<SuperAdminDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SuperAdminDto | null>(null);

  useEffect(() => {
    loadSuperAdmins();
  }, []);

  const loadSuperAdmins = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await superAdminService.getSuperAdmins();
      setSuperAdmins(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('superAdmin.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const addToast = (type: Toast['type'], message: string) => {
    setToasts((prev) => [...prev, { id: Date.now(), type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  };

  const handleCreateSuperAdmin = async (data: CreateSuperAdminRequest) => {
    try {
      await superAdminService.createSuperAdmin(data);
      setShowCreateModal(false);
      await loadSuperAdmins();
      addToast('success', t('superAdmin.messages.createSuccess'));
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('superAdmin.messages.createError'));
    }
  };

  const handleUpdateEmail = async (data: UpdateEmailRequest) => {
    if (!selectedUser) return;
    try {
      await superAdminService.updateUserEmail(selectedUser.id, data);
      setShowEmailModal(false);
      setSelectedUser(null);
      await loadSuperAdmins();
      addToast('success', t('superAdmin.messages.updateEmailSuccess'));
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('superAdmin.messages.updateEmailError'));
    }
  };

  const handleUpdatePassword = async (data: UpdatePasswordRequest) => {
    if (!selectedUser) return;
    try {
      await superAdminService.updateUserPassword(selectedUser.id, data);
      setShowPasswordModal(false);
      setSelectedUser(null);
      addToast('success', t('superAdmin.messages.updatePasswordSuccess'));
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('superAdmin.messages.updatePasswordError'));
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
            <h1 className="text-3xl font-bold text-gray-900">{t('superAdmin.pageTitle')}</h1>
            <p className="text-gray-600 mt-1">{t('superAdmin.pageSubtitle')}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('superAdmin.addButton')}
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
                  {t('superAdmin.table.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('superAdmin.table.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('superAdmin.table.createdAt')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('superAdmin.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {superAdmins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    {t('superAdmin.table.noData')}
                  </td>
                </tr>
              ) : (
                superAdmins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {admin.firstName} {admin.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{admin.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedUser(admin);
                          setShowEmailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        {t('superAdmin.emailModal.title')}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(admin);
                          setShowPasswordModal(true);
                        }}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        {t('superAdmin.passwordModal.title')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateSuperAdminModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateSuperAdmin}
          />
        )}

        {/* Email Modal */}
        {showEmailModal && selectedUser && (
          <UpdateEmailModal
            user={selectedUser}
            onClose={() => {
              setShowEmailModal(false);
              setSelectedUser(null);
            }}
            onSubmit={handleUpdateEmail}
          />
        )}

        {/* Password Modal */}
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
      </div>
    </AppShell>
  );
}

function CreateSuperAdminModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: CreateSuperAdminRequest) => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateSuperAdminRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = t('superAdmin.createModal.emailRequired');
    if (!formData.password || formData.password.length < 6) newErrors.password = t('superAdmin.createModal.passwordRequired');
    if (!formData.firstName) newErrors.firstName = t('superAdmin.createModal.firstNameRequired');
    if (!formData.lastName) newErrors.lastName = t('superAdmin.createModal.lastNameRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{t('superAdmin.createModal.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('superAdmin.createModal.email')}
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
              {t('superAdmin.createModal.password')}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('superAdmin.createModal.firstName')}
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
              {t('superAdmin.createModal.lastName')}
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('superAdmin.createModal.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('superAdmin.createModal.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateEmailModal({
  user,
  onClose,
  onSubmit,
}: {
  user: SuperAdminDto;
  onClose: () => void;
  onSubmit: (data: UpdateEmailRequest) => void;
}) {
  const { t } = useTranslation();
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t('superAdmin.emailModal.emailRequired'));
      return;
    }
    onSubmit({ email });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{t('superAdmin.emailModal.title')}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {t('superAdmin.emailModal.description', { name: `${user.firstName} ${user.lastName}` })}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('superAdmin.emailModal.newEmail')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
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
                {t('superAdmin.emailModal.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t('superAdmin.emailModal.update')}
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
  user: SuperAdminDto;
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
      setError(t('superAdmin.passwordModal.passwordRequired'));
      return;
    }
    if (password.length < 6) {
      setError(t('superAdmin.passwordModal.passwordMinLength'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('superAdmin.passwordModal.passwordsMismatch'));
      return;
    }
    onSubmit({ password });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{t('superAdmin.passwordModal.title')}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {t('superAdmin.passwordModal.description', { name: `${user.firstName} ${user.lastName}` })}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('superAdmin.passwordModal.newPassword')}
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
              {t('superAdmin.passwordModal.confirmPassword')}
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
                {t('superAdmin.passwordModal.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              {t('superAdmin.passwordModal.reset')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

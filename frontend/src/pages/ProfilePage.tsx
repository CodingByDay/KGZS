import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@/application/services/AuthService';
import { User } from '@/domain/types/User';
import { ApiError } from '@/infrastructure/api/apiClient';
import { AppShell } from '@/app/components/AppShell';
import { UserRole } from '@/domain/enums/UserRole';
import { getRoleDisplayInfo, getRoleLabel } from '@/domain/enums/UserRoleDisplay';
import SI from 'country-flag-icons/react/3x2/SI';
import GB from 'country-flag-icons/react/3x2/GB';
import { UpdateProfileRequest } from '@/domain/types/Auth';

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    preferredLanguage: 'sl',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phoneNumber: userData.phoneNumber || '',
          preferredLanguage: i18n.language || 'sl',
        });
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError.status === 401) {
          await authService.logout();
          navigate('/login');
        } else {
          setError(apiError.message || 'Failed to load user information');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate, i18n.language]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) {
      errors.firstName = t('profile.errors.firstNameRequired');
    }
    if (!formData.lastName.trim()) {
      errors.lastName = t('profile.errors.lastNameRequired');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      const request: UpdateProfileRequest = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        preferredLanguage: formData.preferredLanguage,
      };

      const updatedUser = await authService.updateProfile(request);
      setUser(updatedUser);
      setIsEditing(false);
      addToast('success', t('profile.messages.updateSuccess'));

      // Update language if changed
      if (formData.preferredLanguage !== i18n.language) {
        i18n.changeLanguage(formData.preferredLanguage);
        localStorage.setItem('lang', formData.preferredLanguage);
      }
    } catch (err) {
      const apiError = err as ApiError;
      addToast('error', apiError.message || t('profile.messages.updateError'));
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        preferredLanguage: i18n.language || 'sl',
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t('common.loading')}</div>
        </div>
      </AppShell>
    );
  }

  if (error && !user) {
    return (
      <AppShell>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate('/app/dashboard')} className="text-blue-600">
            Back to Dashboard
          </button>
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
            <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
            <p className="text-gray-600 mt-1">{t('profile.subtitle')}</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('profile.edit')}
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.profilePicture')}
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {user?.profilePictureUrl ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080'}${user.profilePictureUrl}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <span className="text-2xl text-gray-500">
                        {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="flex flex-col gap-2">
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm text-center">
                      {t('profile.uploadPicture')}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Validate file size (5MB max)
                            if (file.size > 5 * 1024 * 1024) {
                              addToast('error', t('profile.messages.fileTooLarge') || 'File size exceeds 5MB limit');
                              return;
                            }
                            
                            // Validate file type
                            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                            if (!allowedTypes.includes(file.type)) {
                              addToast('error', t('profile.messages.invalidFileType') || 'Invalid file type. Allowed: JPG, PNG, GIF, WEBP');
                              return;
                            }

                            try {
                              console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
                              const url = await authService.uploadProfilePicture(file);
                              console.log('Upload successful, URL:', url);
                              const updatedUser = await authService.getCurrentUser();
                              setUser(updatedUser);
                              addToast('success', t('profile.messages.uploadSuccess'));
                            } catch (err) {
                              console.error('Upload error:', err);
                              const apiError = err as ApiError;
                              addToast('error', apiError.message || t('profile.messages.uploadError'));
                            }
                          }
                        }}
                      />
                    </label>
                    {user?.profilePictureUrl && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await authService.deleteProfilePicture();
                            const updatedUser = await authService.getCurrentUser();
                            setUser(updatedUser);
                            addToast('success', t('profile.messages.deleteSuccess'));
                          } catch (err) {
                            const apiError = err as ApiError;
                            addToast('error', apiError.message || t('profile.messages.deleteError'));
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        {t('profile.deletePicture')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Email - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('profile.email')}
              </label>
              <p className="mt-1 text-sm text-gray-900">{user?.email || ''}</p>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('profile.firstName')}
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value });
                      if (formErrors.firstName) setFormErrors({ ...formErrors, firstName: '' });
                    }}
                    className={`mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{user?.firstName || ''}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('profile.lastName')}
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value });
                      if (formErrors.lastName) setFormErrors({ ...formErrors, lastName: '' });
                    }}
                    className={`mt-1 block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{user?.lastName || ''}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('profile.phoneNumber')} <span className="text-gray-400 text-xs">({t('profile.optional')})</span>
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('profile.phoneNumberPlaceholder')}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{user?.phoneNumber || ''}</p>
              )}
            </div>

            {/* Language Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('profile.preferredLanguage')}
              </label>
              {isEditing ? (
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredLanguage: 'sl' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-lg transition-all ${
                      formData.preferredLanguage === 'sl'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <SI className="w-5 h-5" />
                    <span className="font-medium">Slovenščina</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredLanguage: 'en' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-lg transition-all ${
                      formData.preferredLanguage === 'en'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <GB className="w-5 h-5" />
                    <span className="font-medium">English</span>
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  {formData.preferredLanguage === 'sl' ? (
                    <>
                      <SI className="w-5 h-5" />
                      <span className="text-sm text-gray-900 font-medium">Slovenščina</span>
                    </>
                  ) : (
                    <>
                      <GB className="w-5 h-5" />
                      <span className="text-sm text-gray-900 font-medium">English</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Read-only fields */}
            {user?.role && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('profile.role')}
                </label>
                <div className="mt-1">
                  {(() => {
                    const roleInfo = getRoleDisplayInfo(user.role, i18n.language as 'sl' | 'en');
                    const Icon = roleInfo.icon;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg ${roleInfo.bgColor} ${roleInfo.color}`}>
                        <Icon className="w-4 h-4" />
                        {getRoleLabel(user.role, i18n.language as 'sl' | 'en')}
                      </span>
                    );
                  })()}
                </div>
              </div>
            )}
            {user?.organizationName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('profile.organization')}
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.organizationName}</p>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('profile.save')}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('profile.cancel')}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
}

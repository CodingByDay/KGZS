import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { organizationService, RegisterOrganizationRequest } from '@/application/services/OrganizationService';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useTranslation } from 'react-i18next';

export function RegisterFarmPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<RegisterOrganizationRequest>({
    organizationName: '',
    midNumber: '',
    village: '',
    address: '',
    email: '',
    phone: '',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.organizationName.trim()) newErrors.organizationName = t('registerFarm.errors.organizationNameRequired');
    if (!formData.midNumber.trim()) newErrors.midNumber = t('registerFarm.errors.midNumberRequired');
    if (formData.midNumber && !/^[A-Za-z0-9\-]+$/.test(formData.midNumber)) {
      newErrors.midNumber = t('registerFarm.errors.midNumberInvalid');
    }
    if (formData.midNumber && formData.midNumber.length > 50) {
      newErrors.midNumber = t('registerFarm.errors.midNumberMaxLength');
    }
    if (!formData.adminEmail.trim()) newErrors.adminEmail = t('registerFarm.errors.adminEmailRequired');
    if (!formData.adminPassword || formData.adminPassword.length < 6) newErrors.adminPassword = t('registerFarm.errors.adminPasswordRequired');
    if (!formData.adminFirstName.trim()) newErrors.adminFirstName = t('registerFarm.errors.adminFirstNameRequired');
    if (!formData.adminLastName.trim()) newErrors.adminLastName = t('registerFarm.errors.adminLastNameRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');
    try {
      await organizationService.registerOrganization(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('registerFarm.errors.submitError'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('registerFarm.successTitle')}</h2>
          <p className="text-gray-600 mb-4">{t('registerFarm.successMessage')}</p>
          <p className="text-sm text-gray-500">{t('registerFarm.redirectNotice')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← {t('registerFarm.backToHome')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('registerFarm.title')}</h1>
          <p className="text-gray-600 mt-2">{t('registerFarm.subtitle')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('registerFarm.organizationInfo')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('registerFarm.organizationName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('common.placeholders.organizationName')}
                  />
                  {errors.organizationName && <p className="text-red-600 text-sm mt-1">{errors.organizationName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('registerFarm.midNumber')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.midNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, midNumber: e.target.value });
                      setErrors({ ...errors, midNumber: '' });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('common.placeholders.midNumber')}
                  />
                  {errors.midNumber && <p className="text-red-600 text-sm mt-1">{errors.midNumber}</p>}
                  <p className="text-xs text-gray-500 mt-1">{t('registerFarm.midNumberHelp')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('registerFarm.village')}
                  </label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('common.placeholders.village')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('registerFarm.address')}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('common.placeholders.address')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('registerFarm.email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('common.placeholders.email')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('registerFarm.phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('common.placeholders.phone')}
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('registerFarm.adminAccount')}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('registerFarm.adminEmail')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('common.placeholders.email')}
                  />
                  {errors.adminEmail && <p className="text-red-600 text-sm mt-1">{errors.adminEmail}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('registerFarm.adminPassword')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('common.placeholders.password')}
                  />
                  {errors.adminPassword && <p className="text-red-600 text-sm mt-1">{errors.adminPassword}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('registerFarm.adminFirstName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.adminFirstName}
                      onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('common.placeholders.firstName')}
                    />
                    {errors.adminFirstName && <p className="text-red-600 text-sm mt-1">{errors.adminFirstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('registerFarm.adminLastName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.adminLastName}
                      onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('common.placeholders.lastName')}
                    />
                    {errors.adminLastName && <p className="text-red-600 text-sm mt-1">{errors.adminLastName}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                {t('registerFarm.actions.cancel')}
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('registerFarm.actions.submitting') : t('registerFarm.actions.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

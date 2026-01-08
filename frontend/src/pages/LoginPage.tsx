import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { authService } from '@/application/services/AuthService';
import { ApiError } from '@/infrastructure/api/apiClient';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await authService.restoreAuth();
      if (isAuthenticated) {
        navigate('/app/dashboard', { replace: true });
      } else {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const validate = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError(t('auth.emailRequired'));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('auth.emailInvalid'));
      isValid = false;
    }

    if (!password) {
      setPasswordError(t('auth.passwordRequired'));
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      await authService.login(email, password, rememberMe);
      navigate('/app/dashboard');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || t('auth.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          {t('auth.loginTitle')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            label={t('auth.emailLabel')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            placeholder={t('auth.emailPlaceholder')}
            disabled={isLoading}
          />

          <Input
            type="password"
            label={t('auth.passwordLabel')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            placeholder={t('auth.passwordPlaceholder')}
            disabled={isLoading}
          />

          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-gray-700"
            >
              {t('auth.keepMeLoggedIn')}
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full"
          >
            {t('auth.loginButton')}
          </Button>
        </form>
      </div>
    </div>
  );
}

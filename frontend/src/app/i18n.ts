import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import sl from '@/locales/sl/translation.json';
import en from '@/locales/en/translation.json';

const storedLang = localStorage.getItem('lang') || 'sl';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      sl: { translation: sl },
      en: { translation: en },
    },
    lng: storedLang,
    fallbackLng: 'sl',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;


import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import ru from './locales/ru/translation.json';
import de from './locales/de/translation.json';
import fr from './locales/fr/translation.json';

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  de: { translation: de },
  fr: { translation: fr }
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;

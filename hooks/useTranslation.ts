import React, { createContext, useState, useContext, useEffect, ReactNode, FC } from 'react';
import { Language, Translations } from '../types';

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: {[key: string]: string | number}) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCAL_STORAGE_LANG_KEY = 'appLanguage';

export const I18nProvider: FC<{children: ReactNode}> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Initialize language from localStorage, or default to 'en'
    const savedLanguage = localStorage.getItem(LOCAL_STORAGE_LANG_KEY);
    return (savedLanguage === 'en' || savedLanguage === 'de') ? savedLanguage : 'en';
  });
  const [translations, setTranslations] = useState<{ [key in Language]?: Translations }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [enRes, deRes] = await Promise.all([
          fetch('/locales/en.json'),
          fetch('/locales/de.json')
        ]);
        if (!enRes.ok || !deRes.ok) {
            throw new Error('Failed to fetch translation files');
        }
        const enData = await enRes.json();
        const deData = await deRes.json();
        setTranslations({ en: enData, de: deData });
      } catch (error) {
        console.error("Failed to load translation files:", error);
        // In case of error, app can still function with keys as fallbacks
      } finally {
        setIsLoading(false);
      }
    };
    fetchTranslations();
  }, []); // Fetch only once on mount

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(LOCAL_STORAGE_LANG_KEY, language); // Save language to localStorage
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, replacements?: {[key: string]: string | number}): string => {
    const langTranslations = translations[language] || translations['en'];
    let translation = langTranslations?.[key] || key;
    if (replacements) {
        Object.entries(replacements).forEach(([placeholder, value]) => {
            translation = translation.replace(`{${placeholder}}`, String(value));
        });
    }
    return translation;
  };

  // Do not render children until translations are loaded to avoid FOUC
  if (isLoading) {
    return null; 
  }

  return React.createElement(
    I18nContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
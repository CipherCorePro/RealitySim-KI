
import { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import type { TranslationKey } from '../translations';

export const useTranslations = () => {
    const { language } = useLanguage();
    
    const t = useCallback((key: TranslationKey, params: { [key: string]: string | number | undefined } = {}) => {
        let str: string = translations[language][key] || translations.en[key] || key;
        for (const p in params) {
            const value = params[p];
            if (value !== undefined) {
                 str = str.replace(`{${p}}`, String(value));
            }
        }
        return str;
    }, [language]);
    
    return t;
};

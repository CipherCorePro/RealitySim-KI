

import { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations, TranslationKey } from '../translations';

export const useTranslations = () => {
    const { language } = useLanguage();
    
    const t = useCallback((key: TranslationKey, params: { [key: string]: string | number | undefined } = {}) => {
        let str: string = (translations[language] as any)[key] || (translations.en as any)[key] || key;
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

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'de' ? 'en' : 'de');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-3 rounded-md transition-colors text-sm uppercase"
            aria-label={`Switch language to ${language === 'de' ? 'English' : 'Deutsch'}`}
        >
            {language}
        </button>
    );
};

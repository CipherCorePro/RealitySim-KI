import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

const SETTINGS_KEY = 'realitysim_settings';

export interface Settings {
    provider: 'lm_studio' | 'gemini';
    lmStudioUrl: string;
    lmStudioModel: string;
    lmStudioEmbeddingModel: string;
    geminiModel: string;
}

interface SettingsContextType {
    settings: Settings;
    setSettings: (settings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettingsState] = useState<Settings>({
        provider: 'lm_studio',
        lmStudioUrl: '',
        lmStudioModel: '',
        lmStudioEmbeddingModel: '',
        geminiModel: 'gemini-2.5-flash',
    });

    useEffect(() => {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
            try {
                const parsed = JSON.parse(storedSettings);
                // Merge with defaults to ensure new fields are present
                setSettingsState(currentSettings => ({...currentSettings, ...parsed}));
            } catch (e) {
                console.error("Failed to parse settings from localStorage", e);
            }
        }
    }, []);

    const setSettings = (newSettings: Settings) => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
        setSettingsState(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

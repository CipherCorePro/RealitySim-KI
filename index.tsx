
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';

// --- Settings Context ---
const SETTINGS_KEY = 'realitysim_settings';

interface Settings {
    lmStudioUrl: string;
    lmStudioModel: string;
}

interface SettingsContextType {
    settings: Settings;
    setSettings: (settings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettingsState] = useState<Settings>({
        lmStudioUrl: '',
        lmStudioModel: '',
    });

    useEffect(() => {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
            try {
                const parsed = JSON.parse(storedSettings);
                setSettingsState(parsed);
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
// --- End Settings Context ---


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </LanguageProvider>
  </React.StrictMode>
);
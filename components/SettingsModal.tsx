
import React from 'react';
import { Language, ThemeSettings, DiagramType, DiagrammingLanguage } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeSettings: ThemeSettings;
  onThemeChange: (newSettings: ThemeSettings) => void;
  diagramType: DiagramType;
  onDiagramTypeChange: (newType: DiagramType) => void;
  diagrammingLanguage: DiagrammingLanguage;
  onDiagrammingLanguageChange: (newLang: DiagrammingLanguage) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  themeSettings,
  onThemeChange,
  diagramType,
  onDiagramTypeChange,
  diagrammingLanguage,
  onDiagrammingLanguageChange,
}) => {
  const { language, setLanguage, t } = useTranslation();

  if (!isOpen) return null;
  
  const handleThemeValueChange = (key: keyof ThemeSettings, value: string | number) => {
      onThemeChange({ ...themeSettings, [key]: value });
  };
  
  const diagramTypes: {label: string, value: DiagramType}[] = [
    { label: t('classDiagram'), value: 'classDiagram' },
    { label: t('flowchart'), value: 'flowchart TD' },
    { label: t('sequenceDiagram'), value: 'sequenceDiagram' },
    { label: t('stateDiagram'), value: 'stateDiagram-v2' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-100">{t('settingsTitle')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-6 overflow-y-auto space-y-8">
          {/* General Settings */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="language-select" className="block text-sm font-medium text-slate-300 mb-2">{t('language')}</label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
             <div>
              <label htmlFor="diagram-lang-select" className="block text-sm font-medium text-slate-300 mb-2">{t('diagrammingLanguage')}</label>
              <select
                id="diagram-lang-select"
                value={diagrammingLanguage}
                onChange={(e) => onDiagrammingLanguageChange(e.target.value as DiagrammingLanguage)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="mermaid">{t('mermaid')}</option>
                <option value="plantuml">{t('plantuml')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="diagram-type-select" className="block text-sm font-medium text-slate-300 mb-2">{t('diagramType')}</label>
              <select
                id="diagram-type-select"
                value={diagramType}
                onChange={(e) => onDiagramTypeChange(e.target.value as DiagramType)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                {diagramTypes.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
              </select>
            </div>
          </section>

          {/* Theme Settings */}
          <section>
             <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-4">{t('themeSettings')}</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                {Object.keys(themeSettings).map((key) => {
                    const settingKey = key as keyof ThemeSettings;
                    const isColor = settingKey !== 'fontSize';
                    return (
                        <div key={key}>
                            <label htmlFor={key} className="block text-sm font-medium text-slate-300 mb-1 capitalize">{t(settingKey)}</label>
                            <div className="flex items-center">
                                {isColor && <input
                                    type="color"
                                    id={key}
                                    value={themeSettings[settingKey] as string}
                                    onChange={(e) => handleThemeValueChange(settingKey, e.target.value)}
                                    className="p-0 h-10 w-10 rounded-md border-none bg-slate-700 cursor-pointer"
                                />}
                                <input
                                    type={isColor ? 'text' : 'number'}
                                    value={themeSettings[settingKey]}
                                    onChange={(e) => handleThemeValueChange(settingKey, isColor ? e.target.value : parseInt(e.target.value, 10))}
                                    className="w-full ml-2 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    min={isColor ? undefined : 8}
                                    max={isColor ? undefined : 24}
                                />
                            </div>
                        </div>
                    )
                })}
             </div>
          </section>
        </main>
         <footer className="p-4 bg-slate-900/50 border-t border-slate-700 flex-shrink-0 flex justify-end">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-md font-semibold transition-colors"
            >
                {t('close')}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;

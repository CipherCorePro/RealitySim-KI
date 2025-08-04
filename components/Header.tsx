
import React from 'react';
import Icon from './Icon';
import { useTranslation } from '../hooks/useTranslation';
import { AppMode } from '../types';

interface HeaderProps {
  onZipUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  onSettingsToggle: () => void;
  isProjectLoaded: boolean;
  isLoading: boolean;
  appMode: AppMode;
  onAppModeChange: (mode: AppMode) => void;
  onDownloadProject: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onZipUpload, 
    onAnalyze, 
    onSettingsToggle, 
    isProjectLoaded, 
    isLoading,
    appMode,
    onAppModeChange,
    onDownloadProject
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const buttonBaseClasses = "px-4 py-1.5 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-50 flex items-center gap-2";
  const activeButtonClasses = "bg-slate-100 text-slate-800 shadow";
  const inactiveButtonClasses = "bg-transparent text-slate-300 hover:bg-slate-600";

  return (
    <header className="flex items-center justify-between p-4 bg-slate-900/50 border-b border-slate-700/50 rounded-t-lg flex-shrink-0">
      <div className="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18"/>
            <path d="M3 12h18"/>
            <path d="M16 3a4 4 0 0 0-8 0"/>
            <path d="M16 21a4 4 0 0 0-8 0"/>
            <path d="M3 16a4 4 0 0 0 0-8"/>
            <path d="M21 16a4 4 0 0 0 0-8"/>
        </svg>
        <h1 className="text-2xl font-bold text-slate-100">Mermaid Architect AI</h1>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="p-1 bg-slate-700/50 rounded-lg flex items-center space-x-2">
            <button onClick={() => onAppModeChange('analyze')} className={`${buttonBaseClasses} ${appMode === 'analyze' ? activeButtonClasses : inactiveButtonClasses}`}>
                <Icon type="analyze" className="w-4 h-4" />
                <span>{t('analyzeExistingProject')}</span>
            </button>
            <button onClick={() => onAppModeChange('generate')} className={`${buttonBaseClasses} ${appMode === 'generate' ? activeButtonClasses : inactiveButtonClasses}`}>
                <Icon type="scaffolding" className="w-4 h-4" />
                <span>{t('architectFromIdea')}</span>
            </button>
             <button onClick={() => onAppModeChange('agentSystem')} className={`${buttonBaseClasses} ${appMode === 'agentSystem' ? activeButtonClasses : inactiveButtonClasses}`}>
                 <Icon type="documentation" className="w-4 h-4" />
                <span>{t('agentSystem')}</span>
            </button>
             <button onClick={() => onAppModeChange('businessPlan')} className={`${buttonBaseClasses} ${appMode === 'businessPlan' ? activeButtonClasses : inactiveButtonClasses}`}>
                 <Icon type="briefcase" className="w-4 h-4" />
                <span>{t('businessPlanGenerator')}</span>
            </button>
             <button onClick={() => onAppModeChange('pitchDeck')} className={`${buttonBaseClasses} ${appMode === 'pitchDeck' ? activeButtonClasses : inactiveButtonClasses}`}>
                 <Icon type="presentationChart" className="w-4 h-4" />
                <span>{t('pitchDeckGenerator')}</span>
            </button>
            <button onClick={() => onAppModeChange('startupPlanner')} className={`${buttonBaseClasses} ${appMode === 'startupPlanner' ? activeButtonClasses : inactiveButtonClasses}`}>
                 <Icon type="lightbulb" className="w-4 h-4" />
                <span>{t('startupPlanner')}</span>
            </button>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {appMode === 'analyze' && (
             <>
                <input
                  type="file"
                  accept=".zip"
                  onChange={onZipUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  onClick={handleUploadClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md font-semibold transition-colors"
                  title={t('uploadZipTitle')}
                >
                  <Icon type="upload" />
                  <span>{t('uploadZip')}</span>
                </button>
                <button
                  onClick={onDownloadProject}
                  disabled={!isProjectLoaded || isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t('downloadProjectZip')}
                >
                  <Icon type="zip" />
                  <span>{t('downloadProjectZip')}</span>
                </button>
                <button
                  onClick={onAnalyze}
                  disabled={!isProjectLoaded || isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t('analyzeProjectTitle')}
                >
                  {isLoading ? (
                    <Icon type="spinner" />
                  ) : (
                    <Icon type="analyze" />
                  )}
                  <span>{isLoading ? t('analyzing') : t('analyzeProject')}</span>
                </button>
            </>
        )}
        <button
          onClick={onSettingsToggle}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-md font-semibold transition-colors"
          title={t('settings')}
        >
            <Icon type="settings" />
        </button>
      </div>
    </header>
  );
};

export default Header;
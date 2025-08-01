
import React from 'react';
import { Download, Upload } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';

interface ExporterPanelProps {
    onExport: (type: 'environment' | 'agents' | 'entities' | 'all') => void;
    onLoad: () => void;
}

export const ExporterPanel: React.FC<ExporterPanelProps> = ({ onExport, onLoad }) => {
    const t = useTranslations();
    return (
        <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400"/>
                {t('stateManagement_title')}
            </h2>
            <div className="space-y-2 text-sm">
                <button onClick={() => onExport('all')} className="w-full text-left bg-emerald-600 hover:bg-emerald-500 p-2 rounded-md transition-colors font-semibold flex items-center gap-2">
                    <Download className="w-4 h-4"/>
                    {t('stateManagement_save')}
                </button>
                 <button onClick={onLoad} className="w-full text-left bg-sky-600 hover:bg-sky-500 p-2 rounded-md transition-colors font-semibold flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {t('stateManagement_load')}
                </button>
                <details className="pt-2">
                    <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">{t('stateManagement_advanced')}</summary>
                    <div className="space-y-2 text-sm mt-2">
                         <button onClick={() => onExport('environment')} className="w-full text-left bg-slate-700 hover:bg-slate-600/80 p-2 rounded-md transition-colors">{t('export_env')}</button>
                         <button onClick={() => onExport('agents')} className="w-full text-left bg-slate-700 hover:bg-slate-600/80 p-2 rounded-md transition-colors">{t('export_agents')}</button>
                         <button onClick={() => onExport('entities')} className="w-full text-left bg-slate-700 hover:bg-slate-600/80 p-2 rounded-md transition-colors">{t('export_entities')}</button>
                    </div>
                </details>
            </div>
        </div>
    );
};

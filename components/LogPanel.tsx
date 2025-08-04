import React from 'react';
import { BookText } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';
import type { TimedLogEntry } from '../types';
import { TranslationKey } from '../translations';

interface LogPanelProps {
  logs: TimedLogEntry[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const t = useTranslations();
  return (
    <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
        <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
            <BookText className="w-5 h-5 text-emerald-400"/>
            {t('logPanel_eventLog')}
        </h2>
        <div className="h-48 bg-slate-900/50 p-2 rounded-md overflow-y-auto flex flex-col-reverse">
            <ul className="text-xs text-slate-400 font-mono space-y-1">
                {logs.map((log, index) => {
                    const message = t(log.key as TranslationKey, log.params);
                    const time = new Date(log.timestamp).toLocaleTimeString();
                    return <li key={index}>{`[${time}] ${message}`}</li>;
                })}
            </ul>
        </div>
    </div>
  );
};

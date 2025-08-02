
import React from 'react';
import { BrainCircuit } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';

interface ProcessingIndicatorProps {
    isOpen: boolean;
}

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ isOpen }) => {
    const t = useTranslations();

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center" role="status" aria-live="polite">
            <BrainCircuit className="w-20 h-20 text-sky-400 animate-pulse" />
            <p className="text-xl font-bold text-slate-200 mt-4 tracking-wider animate-pulse">
                {t('processingSteps')}
            </p>
        </div>
    );
};


import React, { useState } from 'react';
import { Play, RotateCcw, FastForward, Globe } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';

interface ControlPanelProps {
    onStep: () => void;
    onRunSteps: (steps: number) => void;
    onReset: () => void;
    onGenerateWorld: () => void;
    isGenerating: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onStep, onRunSteps, onReset, onGenerateWorld, isGenerating }) => {
    const [runSteps, setRunSteps] = useState(10);
    const t = useTranslations();

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onGenerateWorld}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-wait"
            >
                <Globe className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? t('log_generatingWorld') : t('controlPanel_generateWorld')}
            </button>
            <button
                onClick={onStep}
                disabled={isGenerating}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                <Play className="w-4 h-4" />
                {t('controlPanel_step')}
            </button>
            <div className="flex items-center bg-slate-700 rounded-md">
                 <input 
                    type="number"
                    value={runSteps}
                    onChange={e => setRunSteps(parseInt(e.target.value, 10))}
                    disabled={isGenerating}
                    className="bg-transparent w-16 text-center focus:outline-none p-2 disabled:opacity-50"
                 />
                <button
                    onClick={() => onRunSteps(runSteps)}
                    disabled={isGenerating}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-r-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <FastForward className="w-4 h-4" />
                    {t('controlPanel_run')}
                </button>
            </div>
            <button
                onClick={onReset}
                disabled={isGenerating}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                 <RotateCcw className="w-4 h-4" />
                {t('controlPanel_reset')}
            </button>
        </div>
    );
};

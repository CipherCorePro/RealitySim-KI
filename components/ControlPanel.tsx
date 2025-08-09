import React, { useState } from 'react';
import { Play, RotateCcw, FastForward, Globe, PlusSquare, FileSearch } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';

interface ControlPanelProps {
    onStep: () => void;
    onRunSteps: (steps: number) => void;
    onReset: () => void;
    onGenerateWorld: () => void;
    onGenerateContent: () => void;
    onAnalyzeWorld: () => void;
    isGenerating: boolean;
    isProcessing: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onStep, onRunSteps, onReset, onGenerateWorld, onGenerateContent, onAnalyzeWorld, isGenerating, isProcessing }) => {
    const [runSteps, setRunSteps] = useState(10);
    const t = useTranslations();
    const generatingText = t('log_generating');

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onGenerateWorld}
                disabled={isGenerating || isProcessing}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-wait"
            >
                <Globe className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? generatingText : t('controlPanel_generateWorld')}
            </button>
            <button
                onClick={onGenerateContent}
                disabled={isGenerating || isProcessing}
                className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-3 rounded-md transition-colors flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-wait"
            >
                <PlusSquare className="w-4 h-4" />
                {isGenerating ? generatingText : t('controlPanel_addWithAI')}
            </button>
            <button
                onClick={onStep}
                disabled={isGenerating || isProcessing}
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
                    disabled={isGenerating || isProcessing}
                    className="bg-transparent w-16 text-center focus:outline-none p-2 disabled:opacity-50"
                 />
                <button
                    onClick={() => onRunSteps(runSteps)}
                    disabled={isGenerating || isProcessing}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-r-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <FastForward className="w-4 h-4" />
                    {t('controlPanel_run')}
                </button>
            </div>
             <button
                onClick={onAnalyzeWorld}
                disabled={isGenerating || isProcessing}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-wait"
                title={t('controlPanel_analyze_tooltip')}
            >
                <FileSearch className="w-4 h-4" />
                {t('controlPanel_analyze')}
            </button>
            <button
                onClick={onReset}
                disabled={isGenerating || isProcessing}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                 <RotateCcw className="w-4 h-4" />
                {t('controlPanel_reset')}
            </button>
        </div>
    );
};
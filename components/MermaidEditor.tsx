import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Icon from './Icon';

interface IdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
}

const IdeaModal: React.FC<IdeaModalProps> = ({ isOpen, onClose, onGenerate, isGenerating }) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    await onGenerate(prompt);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">{t('generateDiagramFromIdea')}</h3>
           <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700 transition-colors">
            <Icon type="close" className="w-6 h-6" />
          </button>
        </header>
        <main className="p-6">
           <label htmlFor="idea-prompt-modal" className="block text-sm font-medium text-slate-300 mb-2">{t('describeYourIdea')}</label>
          <textarea
            id="idea-prompt-modal"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-40 p-3 bg-slate-900/70 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 resize-none font-mono text-sm"
            placeholder={t('ideaInputPlaceholder')}
            disabled={isGenerating}
          />
        </main>
        <footer className="p-4 bg-slate-900/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold transition-colors">{t('close')}</button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-md font-semibold transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Icon type="spinner"/> : <Icon type="analyze"/>}
            <span>{t('generate')}</span>
          </button>
        </footer>
      </div>
    </div>
  );
};


interface DiagramEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  onRender: () => void;
  isLoading: boolean;
  onGenerateFromIdea?: (prompt: string) => Promise<void>;
  isGeneratingIdea?: boolean;
  onClear?: () => void;
}

const DiagramEditor: React.FC<DiagramEditorProps> = ({ code, onCodeChange, onRender, isLoading, onGenerateFromIdea, isGeneratingIdea, onClear }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
     <>
        <div className="bg-slate-800/50 rounded-lg h-full flex flex-col">
          <div className="p-2 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-100 p-2">{t('diagramCode')}</h2>
            <div className="flex items-center space-x-2">
                {onGenerateFromIdea && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        disabled={isLoading || !!isGeneratingIdea}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md font-semibold text-sm transition-colors disabled:opacity-50"
                        title={t('generateDiagramFromIdea')}
                        >
                        <Icon type="lightbulb" className="w-4 h-4" />
                        <span>{t('generateFromIdea')}</span>
                    </button>
                )}
                <button
                onClick={onRender}
                disabled={isLoading || !code}
                className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                <Icon type="render" className="w-4 h-4" />
                <span>{t('renderDiagram')}</span>
                </button>
                 {code && onClear && (
                    <button
                        onClick={onClear}
                        disabled={isLoading || !!isGeneratingIdea}
                        title={t('clearDiagram')}
                        className="p-1.5 bg-red-800/50 hover:bg-red-700/50 rounded-md transition-colors disabled:opacity-50"
                    >
                        <Icon type="delete" className="w-4 h-4" />
                    </button>
                )}
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className="w-full h-full p-4 bg-transparent border-0 focus:ring-0 resize-none font-mono text-sm text-slate-300 placeholder:text-slate-500"
            placeholder={t('diagramCodePlaceholder')}
            aria-label={t('diagramCode')}
            disabled={isLoading || !!isGeneratingIdea}
          />
        </div>
        {onGenerateFromIdea && (
            <IdeaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onGenerate={onGenerateFromIdea}
                isGenerating={!!isGeneratingIdea}
            />
        )}
    </>
  );
};

export default DiagramEditor;

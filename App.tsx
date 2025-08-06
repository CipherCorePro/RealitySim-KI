



import React, { useMemo, useState, useEffect } from 'react';
import type { Agent, PsychoReport } from './types';
import { AgentCard } from './components/AgentCard';
import { ControlPanel } from './components/ControlPanel';
import { LogPanel } from './components/LogPanel';
import { WorldGraph } from './components/WorldGraph';
import { CreateObjectPanel } from './components/CreateObjectPanel';
import { ExporterPanel } from './components/ExporterPanel';
import { AdminPanel } from './components/AdminPanel';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { BrainCircuit, Cpu, Zap, Microscope, Boxes, Trash2, Settings, X, Globe, Users, PlusSquare, Apple, Droplet, Log, Hammer, Home, Vote, PanelLeft, PanelRight, Map, BarChart2, Mountain, Waves, Palmtree } from './components/IconComponents';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useSettings } from './contexts/SettingsContext';
import { useTranslations } from './hooks/useTranslations';
import { useSimulation } from './hooks/useSimulation';
import { ProcessingIndicator } from './components/ProcessingIndicator';

// --- View Toggle Panel ---
interface ViewTogglePanelProps {
    visibility: {
        left: boolean;
        agentCard: boolean;
        worldMap: boolean;
        right: boolean;
    };
    onToggle: (panel: keyof ViewTogglePanelProps['visibility']) => void;
}

const ViewTogglePanel: React.FC<ViewTogglePanelProps> = ({ visibility, onToggle }) => {
    const t = useTranslations();
    const baseClass = "p-2 rounded-md transition-colors";
    const activeClass = "bg-sky-600 hover:bg-sky-500 text-white";
    const inactiveClass = "bg-slate-700 hover:bg-slate-600 text-slate-300";

    return (
        <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
            <button onClick={() => onToggle('left')} title={t('viewtoggle_left')} className={`${baseClass} ${visibility.left ? activeClass : inactiveClass}`}>
                <PanelLeft className="w-5 h-5" />
            </button>
            <button onClick={() => onToggle('agentCard')} title={t('viewtoggle_agentcard')} className={`${baseClass} ${visibility.agentCard ? activeClass : inactiveClass}`}>
                <Users className="w-5 h-5" />
            </button>
            <button onClick={() => onToggle('worldMap')} title={t('viewtoggle_map')} className={`${baseClass} ${visibility.worldMap ? activeClass : inactiveClass}`}>
                <Map className="w-5 h-5" />
            </button>
            <button onClick={() => onToggle('right')} title={t('viewtoggle_right')} className={`${baseClass} ${visibility.right ? activeClass : inactiveClass}`}>
                <PanelRight className="w-5 h-5" />
            </button>
        </div>
    );
};
// --- End View Toggle Panel ---

// --- Settings Modal Component ---
interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, setSettings } = useSettings();
    const t = useTranslations();

    const [provider, setProvider] = useState(settings.provider);
    const [url, setUrl] = useState(settings.lmStudioUrl);
    const [model, setModel] = useState(settings.lmStudioModel);
    const [embeddingModel, setEmbeddingModel] = useState(settings.lmStudioEmbeddingModel);
    const [geminiModel, setGeminiModel] = useState(settings.geminiModel);

    useEffect(() => {
        if (isOpen) {
            setProvider(settings.provider);
            setUrl(settings.lmStudioUrl);
            setModel(settings.lmStudioModel);
            setEmbeddingModel(settings.lmStudioEmbeddingModel);
            setGeminiModel(settings.geminiModel);
        }
    }, [settings, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        setSettings({ provider, lmStudioUrl: url, lmStudioModel: model, lmStudioEmbeddingModel: embeddingModel, geminiModel });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-850 p-6 rounded-lg border border-slate-700 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-sky-400"/>
                        {t('settings_title')}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-200 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t('settings_aiProvider_label')}</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setProvider('lm_studio')}
                                className={`p-3 rounded-md border text-center transition-colors ${provider === 'lm_studio' ? 'bg-sky-600 border-sky-500' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                            >
                                LM Studio
                            </button>
                             <button
                                onClick={() => setProvider('gemini')}
                                className={`p-3 rounded-md border text-center transition-colors ${provider === 'gemini' ? 'bg-sky-600 border-sky-500' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                            >
                                Google Gemini
                            </button>
                        </div>
                    </div>

                    {provider === 'lm_studio' && (
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="lm-studio-url" className="block text-sm font-medium text-slate-300 mb-1">{t('settings_lmStudioUrl_label')}</label>
                                <input id="lm-studio-url" type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="http://localhost:1234" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"/>
                                <p className="text-xs text-slate-500 mt-2">{t('settings_lmStudioUrl_description')}</p>
                            </div>
                            <div>
                                <label htmlFor="lm-studio-model" className="block text-sm font-medium text-slate-300 mb-1">{t('settings_lmStudioModel_label')}</label>
                                <input id="lm-studio-model" type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. google/gemma-2b-it" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"/>
                                <p className="text-xs text-slate-500 mt-2">{t('settings_lmStudioModel_description')}</p>
                            </div>
                             <div>
                                <label htmlFor="lm-studio-embedding-model" className="block text-sm font-medium text-slate-300 mb-1">{t('settings_lmStudioEmbeddingModel_label')}</label>
                                <input id="lm-studio-embedding-model" type="text" value={embeddingModel} onChange={(e) => setEmbeddingModel(e.target.value)} placeholder="e.g. text-embedding-granite-embedding-278m-multilingual" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"/>
                                <p className="text-xs text-slate-500 mt-2">{t('settings_lmStudioEmbeddingModel_description')}</p>
                            </div>
                        </div>
                    )}
                    
                     {provider === 'gemini' && (
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="gemini-model" className="block text-sm font-medium text-slate-300 mb-1">{t('settings_geminiModel_label')}</label>
                                <select id="gemini-model" value={geminiModel} onChange={e => setGeminiModel(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition">
                                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                                    <option value="gemini-1.5-flash-latest">gemini-1.5-flash-latest</option>
                                    <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option>
                                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                                    <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
                                </select>
                                 <p className="text-xs text-slate-500 mt-2">{t('settings_geminiModel_description')}</p>
                            </div>
                            <div>
                                 <label htmlFor="gemini-api-key" className="block text-sm font-medium text-slate-300 mb-1">{t('settings_geminiApiKey_label')}</label>
                                 <div className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-400">
                                     {t('settings_geminiApiKey_value')}
                                 </div>
                                 <p className="text-xs text-slate-500 mt-2">{t('settings_geminiApiKey_description')}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">{t('settings_cancel')}</button>
                        <button onClick={handleSave} className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">{t('settings_save')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- End Settings Modal ---

// --- Generate World Modal ---
interface GenerateWorldModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (agentCount: number, entityCounts: { [key: string]: number }) => void;
    isGenerating: boolean;
}

const GenerateWorldModal: React.FC<GenerateWorldModalProps> = ({ isOpen, onClose, onGenerate, isGenerating }) => {
    const [agentCount, setAgentCount] = useState(20);
    const [entityCounts, setEntityCounts] = useState({ food: 5, water: 3, wood: 5, iron: 4, stone: 4, coal: 3, sand: 2, clay: 2, buildings: 3 });
    const t = useTranslations();

    if (!isOpen) {
        return null;
    }
    
    const handleEntityCountChange = (type: string, value: string) => {
        const count = Math.max(0, parseInt(value, 10) || 0);
        setEntityCounts(prev => ({...prev, [type]: count}));
    }

    const handleGenerateClick = () => {
        onGenerate(agentCount, entityCounts);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-850 p-6 rounded-lg border border-slate-700 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Globe className="w-6 h-6 text-purple-400"/>
                        {t('generateWorldModal_title')}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-200 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label htmlFor="agent-count" className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2"><Users className="w-4 h-4" />{t('generateWorldModal_agentsLabel')}</label>
                        <input
                            id="agent-count"
                            type="number"
                            value={agentCount}
                            onChange={(e) => setAgentCount(Math.max(1, parseInt(e.target.value, 10)))}
                            min="1"
                            max="100"
                            disabled={isGenerating}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"
                        />
                         <p className="text-xs text-slate-500 mt-2">{t('generateWorldModal_agentsDescription')}</p>
                    </div>

                     <div>
                        <h3 className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2"><Boxes className="w-4 h-4"/>{t('generateWorldModal_entitiesLabel')}</h3>
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="entity-count-food-world" className="text-xs text-slate-400 flex items-center gap-1"><Apple className="w-3 h-3"/>{t('generateContent_foodSources')}</label>
                                <input id="entity-count-food-world" type="number" value={entityCounts.food} onChange={e => handleEntityCountChange('food', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                             <div className="flex flex-col gap-1">
                                <label htmlFor="entity-count-water-world" className="text-xs text-slate-400 flex items-center gap-1"><Droplet className="w-3 h-3"/>{t('generateContent_waterSources')}</label>
                                <input id="entity-count-water-world" type="number" value={entityCounts.water} onChange={e => handleEntityCountChange('water', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="entity-count-wood-world" className="text-xs text-slate-400 flex items-center gap-1"><Log className="w-3 h-3"/>{t('generateContent_woodSources')}</label>
                                <input id="entity-count-wood-world" type="number" value={entityCounts.wood} onChange={e => handleEntityCountChange('wood', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="entity-count-iron-world" className="text-xs text-slate-400 flex items-center gap-1"><Hammer className="w-3 h-3"/>{t('generateContent_ironSources')}</label>
                                <input id="entity-count-iron-world" type="number" value={entityCounts.iron} onChange={e => handleEntityCountChange('iron', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                             <div className="flex flex-col gap-1">
                                <label htmlFor="entity-count-stone-world" className="text-xs text-slate-400 flex items-center gap-1"><Mountain className="w-3 h-3"/>{t('generateContent_stoneSources')}</label>
                                <input id="entity-count-stone-world" type="number" value={entityCounts.stone} onChange={e => handleEntityCountChange('stone', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                             <div className="flex flex-col gap-1">
                                <label htmlFor="entity-count-coal-world" className="text-xs text-slate-400 flex items-center gap-1"><Mountain className="w-3 h-3"/>{t('generateContent_coalSources')}</label>
                                <input id="entity-count-coal-world" type="number" value={entityCounts.coal} onChange={e => handleEntityCountChange('coal', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                             <div className="flex flex-col gap-1">
                                <label htmlFor="entity-count-sand-world" className="text-xs text-slate-400 flex items-center gap-1"><Waves className="w-3 h-3"/>{t('generateContent_sandSources')}</label>
                                <input id="entity-count-sand-world" type="number" value={entityCounts.sand} onChange={e => handleEntityCountChange('sand', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                             <div className="flex flex-col gap-1">
                                <label htmlFor="entity-count-clay-world" className="text-xs text-slate-400 flex items-center gap-1"><Palmtree className="w-3 h-3"/>{t('generateContent_claySources')}</label>
                                <input id="entity-count-clay-world" type="number" value={entityCounts.clay} onChange={e => handleEntityCountChange('clay', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                             <div className="flex flex-col gap-1 col-span-full">
                                <label htmlFor="entity-count-buildings-world" className="text-xs text-slate-400 flex items-center gap-1"><Home className="w-3 h-3"/>{t('generateContent_buildings')}</label>
                                <input id="entity-count-buildings-world" type="number" value={entityCounts.buildings} onChange={e => handleEntityCountChange('buildings', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                         </div>
                        <p className="text-xs text-slate-500 mt-2">{t('generateWorldModal_entitiesDescription')}</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">{t('settings_cancel')}</button>
                        <button onClick={handleGenerateClick} disabled={isGenerating} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-wait">{isGenerating ? t('log_generating') : t('generateWorldModal_generate')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- End Generate World Modal ---

// --- Generate Content Modal ---
interface GenerateContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerateAgents: (count: number) => void;
    onGenerateEntities: (counts: { [key: string]: number }) => void;
    isGenerating: boolean;
}

const GenerateContentModal: React.FC<GenerateContentModalProps> = ({ isOpen, onClose, onGenerateAgents, onGenerateEntities, isGenerating }) => {
    const [agentCount, setAgentCount] = useState(5);
    const [entityCounts, setEntityCounts] = useState({ food: 2, water: 2, wood: 2, iron: 2, buildings: 2 });
    const t = useTranslations();

    if (!isOpen) {
        return null;
    }

    const handleEntityCountChange = (type: string, value: string) => {
        const count = Math.max(0, parseInt(value, 10) || 0);
        setEntityCounts(prev => ({...prev, [type]: count}));
    }

    const handleGenerateAgentsClick = () => {
        onGenerateAgents(agentCount);
    };
    
    const handleGenerateEntitiesClick = () => {
        onGenerateEntities(entityCounts);
    };

    const generatingText = t('log_generating');

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-850 p-6 rounded-lg border border-slate-700 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <PlusSquare className="w-6 h-6 text-purple-400"/>
                        {t('generateContent_title')}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-200 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-8">
                    {/* Agent Generation */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2"><Users className="w-5 h-5"/>{t('generateContent_addAgents')}</h3>
                        <div>
                            <label htmlFor="agent-count-add" className="block text-sm font-medium text-slate-300 mb-1">{t('generateContent_agentsLabel')}</label>
                            <input
                                id="agent-count-add"
                                type="number"
                                value={agentCount}
                                onChange={(e) => setAgentCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                min="1"
                                max="50"
                                disabled={isGenerating}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"
                            />
                            <p className="text-xs text-slate-500 mt-2">{t('generateContent_agentsDescription')}</p>
                        </div>
                        <button 
                            onClick={handleGenerateAgentsClick}
                            disabled={isGenerating}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-wait flex items-center justify-center gap-2"
                        >
                            <Globe className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? generatingText : t('generateContent_generateAgentsBtn')}
                        </button>
                    </div>

                    {/* Entity Generation */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2"><Boxes className="w-5 h-5"/>{t('generateContent_addEntities')}</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="entity-count-food" className="block text-sm font-medium text-slate-300 mb-1">{t('generateContent_foodSources')}</label>
                                <input id="entity-count-food" type="number" value={entityCounts.food} onChange={(e) => handleEntityCountChange('food', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                            <div>
                                <label htmlFor="entity-count-water" className="block text-sm font-medium text-slate-300 mb-1">{t('generateContent_waterSources')}</label>
                                <input id="entity-count-water" type="number" value={entityCounts.water} onChange={(e) => handleEntityCountChange('water', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                            <div>
                                <label htmlFor="entity-count-wood" className="block text-sm font-medium text-slate-300 mb-1">{t('generateContent_woodSources')}</label>
                                <input id="entity-count-wood" type="number" value={entityCounts.wood} onChange={(e) => handleEntityCountChange('wood', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                            <div>
                                <label htmlFor="entity-count-iron" className="block text-sm font-medium text-slate-300 mb-1">{t('generateContent_ironSources')}</label>
                                <input id="entity-count-iron" type="number" value={entityCounts.iron} onChange={(e) => handleEntityCountChange('iron', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                             <div className="col-span-2">
                                <label htmlFor="entity-count-buildings" className="block text-sm font-medium text-slate-300 mb-1">{t('generateContent_buildings')}</label>
                                <input id="entity-count-buildings" type="number" value={entityCounts.buildings} onChange={(e) => handleEntityCountChange('buildings', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{t('generateContent_entitiesDescriptionCategorized')}</p>
                         <button 
                            onClick={handleGenerateEntitiesClick}
                            disabled={isGenerating}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-wait flex items-center justify-center gap-2"
                         >
                            <Globe className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? generatingText : t('generateContent_generateEntitiesBtn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- End Generate Content Modal ---

// --- Psychoanalysis Modal ---
interface PsychoanalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: PsychoReport | null;
    isGenerating: boolean;
    agentName: string | null;
}

const ReportSection: React.FC<{ title: string; content: string | undefined }> = ({ title, content }) => (
    <div className="space-y-1">
        <h3 className="text-md font-semibold text-sky-300">{title}</h3>
        <p className="text-sm text-slate-300 whitespace-pre-wrap">{content || '...'}</p>
    </div>
);

const PsychoanalysisModal: React.FC<PsychoanalysisModalProps> = ({ isOpen, onClose, report, isGenerating, agentName }) => {
    const t = useTranslations();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-850 p-6 rounded-lg border border-slate-700 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-850 py-2 -mt-6 -mx-6 px-6 z-10 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-sky-400"/>
                        {t('psychoanalysis_title')} {agentName && `- ${agentName}`}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-200 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {isGenerating && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <BrainCircuit className="w-16 h-16 text-sky-400 animate-pulse" />
                        <p className="text-lg text-slate-300 mt-4 animate-pulse">{t('psychoanalysis_generating')}</p>
                    </div>
                )}
                
                {report && !isGenerating && (
                    <div className="space-y-6">
                        <ReportSection title={t('report_psychodynamik')} content={report.Psychodynamik} />
                        <ReportSection title={t('report_persoenlichkeitsbild')} content={report.Persönlichkeitsbild} />
                        <ReportSection title={t('report_beziehungsdynamik')} content={report.Beziehungsdynamik} />
                        <ReportSection title={t('report_trauma')} content={report['Traumatische Spuren oder psychische Belastung']} />
                        <ReportSection title={t('report_kultur')} content={report['Kulturelle & spirituelle Verarbeitung']} />
                        <ReportSection title={t('report_projektionen')} content={report['Projektionen oder Verschiebungen']} />
                        <ReportSection title={t('report_empfehlung')} content={report['Therapeutische Empfehlung']} />
                    </div>
                )}
            </div>
        </div>
    );
};
// --- End Psychoanalysis Modal ---

export default function App() {
    const t = useTranslations();
    const {
        worldState,
        logs,
        selectedAgent,
        isGenerating,
        isProcessingSteps,
        isSettingsOpen,
        isGenerateWorldModalOpen,
        isGenerateContentModalOpen,
        isAnalyticsOpen,
        isPsychoanalysisModalOpen,
        psychoanalysisReport,
        isGeneratingAnalysis,
        analyzedAgent,
        panelVisibility,
        setSelectedAgent,
        setIsSettingsOpen,
        setIsGenerateWorldModalOpen,
        setIsGenerateContentModalOpen,
        setIsAnalyticsOpen,
        setIsPsychoanalysisModalOpen,
        togglePanel,
        handlers,
    } = useSimulation();

    const cultureName = useMemo(() => {
        if (!selectedAgent?.cultureId || !worldState.cultures) return t('culture_none');
        return worldState.cultures.find(c => c.id === selectedAgent.cultureId)?.name || t('culture_none');
    }, [selectedAgent?.cultureId, worldState.cultures, t]);

    const religionName = useMemo(() => {
        if (!selectedAgent?.religionId || !worldState.religions) return t('religion_none');
        return worldState.religions.find(r => r.id === selectedAgent.religionId)?.name || t('religion_none');
    }, [selectedAgent?.religionId, worldState.religions, t]);

    const leaderName = useMemo(() => {
        if (!worldState.government?.leaderId) return t('role_none');
        return worldState.agents.find(a => a.id === worldState.government.leaderId)?.name || t('role_none');
    }, [worldState.government?.leaderId, worldState.agents, t]);
    
    const middleIsVisible = panelVisibility.agentCard || panelVisibility.worldMap;

    const gridClasses = useMemo(() => {
        const { left, right } = panelVisibility;
        
        if (left && middleIsVisible && right) return { left: 'lg:col-span-3', middle: 'lg:col-span-6', right: 'lg:col-span-3' };
        if (left && middleIsVisible && !right) return { left: 'lg:col-span-4', middle: 'lg:col-span-8', right: 'hidden' };
        if (!left && middleIsVisible && right) return { left: 'hidden', middle: 'lg:col-span-8', right: 'lg:col-span-4' };
        if (left && !middleIsVisible && right) return { left: 'lg:col-span-6', middle: 'hidden', right: 'lg:col-span-6' };
        if (!left && !middleIsVisible && right) return { left: 'hidden', middle: 'hidden', right: 'lg:col-span-12' };
        if (left && !middleIsVisible && !right) return { left: 'lg:col-span-12', middle: 'hidden', right: 'hidden' };
        if (!left && middleIsVisible && !right) return { left: 'hidden', middle: 'lg:col-span-12', right: 'hidden' };
        
        return { left: 'hidden', middle: 'hidden', right: 'hidden' };
    }, [panelVisibility, middleIsVisible]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans">
      <ProcessingIndicator isOpen={isProcessingSteps} />
      <header className="bg-slate-950/70 backdrop-blur-sm p-4 border-b border-slate-700/50 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-sky-400" />
            <h1 className="text-2xl font-bold text-slate-100 tracking-wider">{t('realitySimAI')}</h1>
            <LanguageSwitcher />
        </div>
        <div className="flex items-center gap-2">
            <ViewTogglePanel visibility={panelVisibility} onToggle={togglePanel} />
            <div className="h-8 w-px bg-slate-700 mx-2"></div>
            <ControlPanel 
                onStep={handlers.handleStep} 
                onRunSteps={handlers.handleRunSteps} 
                onReset={handlers.handleReset} 
                onGenerateWorld={() => setIsGenerateWorldModalOpen(true)} 
                onGenerateContent={() => setIsGenerateContentModalOpen(true)} 
                isGenerating={isGenerating} 
                isProcessing={isProcessingSteps} 
            />
             <button
                onClick={() => setIsAnalyticsOpen(true)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold p-2.5 rounded-md transition-colors"
                aria-label={t('analytics_title')}
            >
                <BarChart2 className="w-5 h-5" />
            </button>
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold p-2.5 rounded-md transition-colors"
                aria-label={t('settings_title')}
            >
                <Settings className="w-5 h-5" />
            </button>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-4 p-4">
        {panelVisibility.left && (
            <div className={`col-span-12 ${gridClasses.left} space-y-4`}>
                <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-sky-400"/>
                        {t('agents')}
                    </h2>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {worldState.agents.map(agent => (
                        <div key={agent.id} className="flex items-center gap-1">
                            <button onClick={() => setSelectedAgent(agent)} className={`flex-grow text-left p-2 rounded-l-md transition-colors ${selectedAgent?.id === agent.id ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-700/50 hover:bg-slate-700'} ${!agent.isAlive ? 'text-slate-500' : ''}`}>
                                {agent.name} {!agent.isAlive && ` (${t('deceased')})`}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handlers.handleDelete('agent', agent.id)}} className={`p-2 text-slate-500 hover:text-red-400 rounded-r-md transition-colors ${selectedAgent?.id === agent.id ? 'bg-sky-500/20' : 'bg-slate-700/50 hover:bg-slate-700'}`}>
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    </div>
                </div>
                <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                        <Boxes className="w-5 h-5 text-sky-400"/>
                        {t('entities')}
                    </h2>
                    <ul className="space-y-1 max-h-[20vh] overflow-y-auto pr-2">
                        {worldState.entities.map((entity) => (
                            <li key={entity.id} className="flex items-center justify-between text-sm p-2 bg-slate-700/50 rounded-md">
                                <span>{entity.name}</span>
                                <button onClick={() => handlers.handleDelete('entity', entity.id)} className="p-1 -mr-1 text-slate-500 hover:text-red-400 rounded-md transition-colors">
                                     <Trash2 className="w-3 h-3" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}

        {middleIsVisible && (
            <div className={`col-span-12 ${gridClasses.middle} space-y-4`}>
              {panelVisibility.agentCard && (
                selectedAgent ? (
                    <AgentCard 
                        agent={selectedAgent} 
                        allAgents={worldState.agents} 
                        entities={worldState.entities} 
                        cultureName={cultureName}
                        religionName={religionName}
                        leaderName={leaderName}
                        environment={worldState.environment}
                        onPrompt={handlers.handlePrompt} 
                        onGeneratePsychoanalysis={handlers.handleGeneratePsychoanalysis} 
                    />
                ) : (
                    <div className="bg-slate-850 p-4 rounded-lg border border-slate-700 h-full flex items-center justify-center">
                        <p className="text-slate-400">{t('agentCard_selectAgent')}</p>
                    </div>
                )
              )}
              {panelVisibility.worldMap && (
                <WorldGraph agents={worldState.agents} entities={worldState.entities} environment={worldState.environment} cultures={worldState.cultures || []}/>
              )}
            </div>
        )}

        {panelVisibility.right && (
            <div className={`col-span-12 ${gridClasses.right} space-y-4`}>
                {selectedAgent?.adminAgent ? (
                    <AdminPanel
                        environment={worldState.environment}
                        actions={worldState.actions}
                        agents={worldState.agents}
                        government={worldState.government}
                        cultures={worldState.cultures || []}
                        techTree={worldState.techTree || []}
                        onUpdateEnvironment={handlers.handleUpdateEnvironment}
                        onCreateAction={(data) => handlers.handleCreate('action', data)}
                        onDeleteAction={(name) => handlers.handleDelete('action', name)}
                        onSetAgentHealth={handlers.handleSetAgentHealth}
                        onInflictSickness={handlers.handleInflictSickness}
                        onResurrectAgent={handlers.handleResurrectAgent}
                        onSetAgentPosition={handlers.handleSetAgentPosition}
                        onSetAgentCurrency={handlers.handleSetAgentCurrency}
                        onImprisonAgent={handlers.handleImprisonAgent}
                        onEnactLaw={handlers.handleEnactLaw}
                        onRepealLaw={handlers.handleRepealLaw}
                        onStartElection={handlers.handleStartElection}
                        onSetLeader={handlers.handleSetLeader}
                        onUnlockTech={handlers.handleUnlockTech}
                    />
                ) : (
                    <>
                        <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                                <Microscope className="w-5 h-5 text-emerald-400"/>
                                {t('environment')}
                            </h2>
                            <ul className="space-y-2 text-sm">
                                {Object.entries(worldState.environment).map(([key, value]) => {
                                    if (key === 'election') {
                                        const election = value as any | null;
                                        let displayValue = t('election_status_none');
                                        if (election) {
                                            displayValue = election.isActive 
                                                ? t('election_status_active', { endDate: election.termEndDate }) 
                                                : t('election_status_inactive');
                                        }
                                        
                                        return (
                                             <li key={key} className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Vote className="w-4 h-4 text-slate-400"/>
                                                    <span className="capitalize text-slate-400">{t('election_title')}:</span>
                                                </div>
                                                <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-xs">{displayValue}</span>
                                            </li>
                                        );
                                    }
                                    return (
                                        <li key={key} className="flex justify-between items-center">
                                            <span className="capitalize text-slate-400">{key}:</span>
                                            <span className="font-mono bg-slate-700 px-2 py-0.5 rounded">{String(value)}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-emerald-400"/>
                                {t('availableActions')}
                            </h2>
                            <ul className="space-y-1 max-h-[25vh] overflow-y-auto pr-2">
                                {worldState.actions.map(action => (
                                    <li key={action.name} title={action.description} className="flex items-center justify-between text-xs p-2 bg-slate-700/50 rounded-md">
                                        <span className="truncate pr-2">{action.name}</span>
                                         <button onClick={() => handlers.handleDelete('action', action.name)} className="p-1 -mr-1 text-slate-500 hover:text-red-400 rounded-md transition-colors flex-shrink-0">
                                             <Trash2 className="w-3 h-3" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <CreateObjectPanel onCreate={handlers.handleCreate} />
                    </>
                )}

                <LogPanel logs={logs} />
                <ExporterPanel onExport={handlers.handleExport} onLoad={handlers.handleLoadState} onExportConversations={handlers.handleExportConversations} onExportStatistics={handlers.handleExportStatistics} />
            </div>
        )}
      </main>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <GenerateWorldModal 
        isOpen={isGenerateWorldModalOpen}
        onClose={() => setIsGenerateWorldModalOpen(false)}
        isGenerating={isGenerating}
        onGenerate={async (agentCount, entityCounts) => {
            await handlers.handleGenerateWorld(agentCount, entityCounts);
        }}
       />
       <GenerateContentModal
        isOpen={isGenerateContentModalOpen}
        onClose={() => setIsGenerateContentModalOpen(false)}
        onGenerateAgents={handlers.handleGenerateAgents}
        onGenerateEntities={handlers.handleGenerateEntities}
        isGenerating={isGenerating}
       />
       <PsychoanalysisModal 
        isOpen={isPsychoanalysisModalOpen}
        onClose={() => setIsPsychoanalysisModalOpen(false)}
        report={psychoanalysisReport}
        isGenerating={isGeneratingAnalysis}
        agentName={analyzedAgent?.name || null}
       />
       <AnalyticsDashboard 
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        worldState={worldState}
       />
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { RealityEngine } from './services/simulation';
import type { WorldState, Agent, Entity, EnvironmentState, LogEntry, Culture, Law, Personality } from './types';
import { initialWorldState, GENOME_OPTIONS, INITIAL_CURRENCY, SKILL_TYPES } from './constants';
import { AgentCard } from './components/AgentCard';
import { ControlPanel } from './components/ControlPanel';
import { LogPanel } from './components/LogPanel';
import { WorldGraph } from './components/WorldGraph';
import { CreateObjectPanel } from './components/CreateObjectPanel';
import { ExporterPanel } from './components/ExporterPanel';
import { AdminPanel } from './components/AdminPanel';
import { generateActionFromPrompt, generateWorld, generateAgents, generateEntities, LmStudioError } from './services/geminiService';
import { BrainCircuit, Cpu, Zap, Microscope, Boxes, Trash2, Settings, X, Globe, Users, PlusSquare, Apple, Droplet, Log, Hammer, Home } from './components/IconComponents';
import { useLanguage } from './contexts/LanguageContext';
import { useTranslations } from './hooks/useTranslations';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useSettings } from './index';
import { TranslationKey } from './translations';
import { ProcessingIndicator } from './components/ProcessingIndicator';

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
    const [geminiModel, setGeminiModel] = useState(settings.geminiModel);

    useEffect(() => {
        if (isOpen) {
            setProvider(settings.provider);
            setUrl(settings.lmStudioUrl);
            setModel(settings.lmStudioModel);
            setGeminiModel(settings.geminiModel);
        }
    }, [settings, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        setSettings({ provider, lmStudioUrl: url, lmStudioModel: model, geminiModel });
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
    const [entityCounts, setEntityCounts] = useState({ food: 5, water: 3, wood: 5, iron: 4, buildings: 3 });
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
                         <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
                             <div className="flex flex-col gap-1 col-span-2 lg:col-span-1">
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

// --- Data Sanitization Helpers ---
const safeParseInt = (val: any, fallback: number): number => {
    const num = parseInt(String(val), 10);
    return isNaN(num) ? fallback : num;
};

const sanitizeObjectToNumber = (obj: any): { [key: string]: number } => {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        return {};
    }
    return Object.entries(obj).reduce((acc, [key, value]) => {
        const num = parseFloat(String(value));
        if (typeof key === 'string' && !isNaN(num)) {
            acc[key] = num;
        }
        return acc;
    }, {} as { [key: string]: number });
};

const sanitizePersonality = (p: any): Personality => {
    const defaults: Personality = { openness: 0.5, conscientiousness: 0.5, extraversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 };
    const sanitized = sanitizeObjectToNumber(p);
    return {
        openness: (sanitized.openness >= 0 && sanitized.openness <= 1) ? sanitized.openness : defaults.openness,
        conscientiousness: (sanitized.conscientiousness >= 0 && sanitized.conscientiousness <= 1) ? sanitized.conscientiousness : defaults.conscientiousness,
        extraversion: (sanitized.extraversion >= 0 && sanitized.extraversion <= 1) ? sanitized.extraversion : defaults.extraversion,
        agreeableness: (sanitized.agreeableness >= 0 && sanitized.agreeableness <= 1) ? sanitized.agreeableness : defaults.agreeableness,
        neuroticism: (sanitized.neuroticism >= 0 && sanitized.neuroticism <= 1) ? sanitized.neuroticism : defaults.neuroticism,
    };
};

const sanitizeAndCreateAgents = (generatedAgents: any[], worldState: WorldState): Agent[] => {
    return generatedAgents.map((geminiAgent: any, index: number) => {
        const beliefNetwork = sanitizeObjectToNumber(geminiAgent.beliefs);
        const personality = sanitizePersonality(geminiAgent.personality);
        
        const defaultSkills = SKILL_TYPES.reduce((acc, skill) => ({ ...acc, [skill]: 1 }), {} as { [key: string]: number });
        const skills = { ...defaultSkills, ...sanitizeObjectToNumber(geminiAgent.skills) };
        
        const defaultEmotions = { happiness: 0.5, sadness: 0.1, anger: 0.1, fear: 0.1, trust: 0.3, love: 0.1 };
        const emotions = { ...defaultEmotions, ...sanitizeObjectToNumber(geminiAgent.emotions) };
        const inventory = typeof geminiAgent.inventory === 'object' && geminiAgent.inventory !== null && !Array.isArray(geminiAgent.inventory) 
            ? sanitizeObjectToNumber(geminiAgent.inventory) 
            : {};

        const x = safeParseInt(geminiAgent.x, Math.floor(Math.random() * worldState.environment.width));
        const y = safeParseInt(geminiAgent.y, Math.floor(Math.random() * worldState.environment.height));
        const age = safeParseInt(geminiAgent.age, 25);
        const hunger = safeParseInt(geminiAgent.hunger, Math.floor(Math.random() * 50));
        const thirst = safeParseInt(geminiAgent.thirst, Math.floor(Math.random() * 50));
        const fatigue = safeParseInt(geminiAgent.fatigue, Math.floor(Math.random() * 50));
        const stress = safeParseInt(geminiAgent.stress, Math.floor(Math.random() * 30));
        const socialStatus = safeParseInt(geminiAgent.socialStatus, Math.floor(Math.random() * 40) + 30);
        const currency = safeParseInt(geminiAgent.currency, INITIAL_CURRENCY);

        return {
            id: `agent-gen-${Date.now()}-${index}`,
            name: String(geminiAgent.name || `Agent ${index + 1}`),
            description: String(geminiAgent.description || 'An agent generated by the AI.'),
            x: Math.max(0, Math.min(worldState.environment.width - 1, x)),
            y: Math.max(0, Math.min(worldState.environment.height - 1, y)),
            beliefNetwork,
            emotions,
            resonance: {},
            socialMemory: [],
            lastActions: [],
            adminAgent: false,
            health: 100,
            isAlive: true,
            sickness: null,
            conversationHistory: [],
            age,
            genome: (Array.isArray(geminiAgent.genome) ? geminiAgent.genome : []).filter((g: any) => typeof g === 'string' && GENOME_OPTIONS.includes(g)),
            relationships: {},
            cultureId: geminiAgent.cultureId || null,
            religionId: geminiAgent.religionId || null,
            role: geminiAgent.role || null,
            offspringCount: 0,
            hunger,
            thirst,
            fatigue,
            inventory,
            personality,
            goals: (Array.isArray(geminiAgent.goals) ? geminiAgent.goals : []).filter((g: any) => typeof g === 'object' && g !== null && g.type && g.description),
            stress,
            socialStatus,
            skills,
            trauma: [],
            currency,
        };
    });
};

const sanitizeAndCreateEntities = (generatedEntities: any[], worldState: WorldState): Entity[] => {
    return generatedEntities.map((geminiEntity, index) => {
        const x = safeParseInt(geminiEntity.x, Math.floor(Math.random() * worldState.environment.width));
        const y = safeParseInt(geminiEntity.y, Math.floor(Math.random() * worldState.environment.height));
        return {
            id: `entity-gen-${Date.now()}-${index}`,
            name: geminiEntity.name,
            description: geminiEntity.description,
            x: Math.max(0, Math.min(worldState.environment.width - 1, x)),
            y: Math.max(0, Math.min(worldState.environment.height - 1, y)),
            isMarketplace: !!geminiEntity.isMarketplace,
            isJail: !!geminiEntity.isJail,
            isResource: !!geminiEntity.isResource,
            resourceType: geminiEntity.resourceType,
            quantity: safeParseInt(geminiEntity.quantity, 10),
        };
    });
};


export default function App() {
  const [engine, setEngine] = useState(() => new RealityEngine(initialWorldState));
  const [worldState, setWorldState] = useState<WorldState>(engine.getState());
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingSteps, setIsProcessingSteps] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerateWorldModalOpen, setIsGenerateWorldModalOpen] = useState(false);
  const [isGenerateContentModalOpen, setIsGenerateContentModalOpen] = useState(false);

  const t = useTranslations();
  const { language } = useLanguage();
  const { settings } = useSettings();

  useEffect(() => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${t('log_simulationInitialized')}`, ...prev.slice(0,99)])
  }, [t]);


  useEffect(() => {
    const selectedAgentFromState = selectedAgent && worldState.agents.find(a => a.id === selectedAgent.id);
    if (!selectedAgentFromState) {
      setSelectedAgent(worldState.agents[0] || null);
    } else {
      if(JSON.stringify(selectedAgent) !== JSON.stringify(selectedAgentFromState)) {
        setSelectedAgent(selectedAgentFromState);
      }
    }
  }, [worldState.agents, selectedAgent]);

  const addLog = useCallback((logEntry: LogEntry) => {
    // @ts-ignore
    const message = t(logEntry.key, logEntry.params);
    setLogs(prevLogs => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prevLogs].slice(0, 100));
  }, [t]);
  
  const addRawLog = useCallback((message: string) => {
     setLogs(prevLogs => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prevLogs].slice(0, 100));
  }, []);

  const handleStep = useCallback(async () => {
    setIsProcessingSteps(true);
    try {
        const { logs: newLogs } = await engine.step(language);
        setWorldState({ ...engine.getState() });
        newLogs.forEach(log => addLog(log));
        addLog({ key: 'log_simulationStepped' });
    } catch (error) {
        console.error("Error during step processing:", error);
        addRawLog(`Error during step processing: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsProcessingSteps(false);
    }
  }, [engine, addLog, language, addRawLog]);

  const handleRunSteps = useCallback(async (steps: number) => {
    setIsProcessingSteps(true);
    addRawLog(t('log_runningSimulation', { steps }));
    try {
        let allLogs: LogEntry[] = [];
        for (let i = 0; i < steps; i++) {
        const { logs: newLogs } = await engine.step(language);
        allLogs.push(...newLogs);
        }
        setWorldState({ ...engine.getState() });

        // Batch log updates for performance
        const formattedNewLogs = allLogs.map(logEntry => {
            // @ts-ignore
            const message = t(logEntry.key, logEntry.params);
            return `[${new Date().toLocaleTimeString()}] ${message}`;
        }).reverse(); // reverse to keep chronological order when prepending

        setLogs(prevLogs => [...formattedNewLogs, ...prevLogs].slice(0, 100));

        addLog({ key: 'log_simulationRanSteps', params: { steps } });
    } catch (error) {
        console.error("Error during run steps processing:", error);
        addRawLog(`Error during run steps processing: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsProcessingSteps(false);
    }
  }, [engine, addLog, addRawLog, t, language]);

  const handleReset = useCallback(() => {
    const newEngine = new RealityEngine(initialWorldState);
    setEngine(newEngine);
    setWorldState(newEngine.getState());
    setSelectedAgent(newEngine.getState().agents[0] || null);
    setLogs([`[${new Date().toLocaleTimeString()}] ${t('log_simulationReset')}`]);
  }, [t]);

  const isAiConfigured = useCallback(() => {
    if (settings.provider === 'gemini') {
        // For Gemini, we assume API_KEY is in env.
        return true;
    }
    // For LM Studio, we need URL and model.
    return !!settings.lmStudioUrl && !!settings.lmStudioModel;
  }, [settings]);

  const handleGenerateWorld = useCallback(async (agentCount: number, entityCounts: { [key: string]: number }) => {
    if (!isAiConfigured()) {
        addRawLog(t('log_configure_ai_full'));
        setIsSettingsOpen(true);
        return;
    }

    setIsGenerating(true);
    addRawLog(t('log_generatingWorld'));

    try {
        const generatedData = await generateWorld(worldState.environment, language, agentCount, entityCounts);

        if (!generatedData || !generatedData.agents || !generatedData.entities) {
            throw new Error("Invalid data received from world generation.");
        }
        
        const totalEntityCount = Object.values(entityCounts).reduce((sum, val) => sum + val, 0);

        if (generatedData.agents.length !== agentCount || generatedData.entities.length !== totalEntityCount) {
            addRawLog(t('log_worldGenerated_warning', { 
                reqAgents: agentCount, 
                genAgents: generatedData.agents.length,
                reqEntities: totalEntityCount,
                genEntities: generatedData.entities.length,
            }));
        }

        const newAgents: Agent[] = sanitizeAndCreateAgents(generatedData.agents, worldState);
        const newEntities: Entity[] = sanitizeAndCreateEntities(generatedData.entities, worldState);
        
        const adminAgent = engine.getAgentById('agent-admin');
        const finalAgents = adminAgent ? [...newAgents, adminAgent] : newAgents;

        const currentEngineState = engine.getState();
        const newWorldState: WorldState = {
            agents: finalAgents,
            entities: newEntities,
            actions: currentEngineState.actions,
            environment: currentEngineState.environment,
            cultures: currentEngineState.cultures,
            religions: currentEngineState.religions,
            government: currentEngineState.government,
            markets: currentEngineState.markets,
            techTree: currentEngineState.techTree,
        };
        
        const newEngine = new RealityEngine(newWorldState);
        setEngine(newEngine);
        setWorldState(newEngine.getState());
        setSelectedAgent(newEngine.getState().agents.find(a => !a.adminAgent) || null);
        addRawLog(t('log_worldGenerated'));

    } catch (error) {
        if (error instanceof LmStudioError && error.translationKey) {
            addRawLog(t(error.translationKey as TranslationKey));
        } else {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addRawLog(t('log_aiError', { error: `World generation failed: ${errorMessage}` }));
        }
    } finally {
        setIsGenerating(false);
    }
}, [engine, addRawLog, t, language, worldState, settings, isAiConfigured]);


const handleGenerateAgents = useCallback(async (count: number) => {
    if (!isAiConfigured()) {
        addRawLog(t('log_configure_ai_full'));
        setIsSettingsOpen(true);
        return;
    }

    setIsGenerating(true);
    addRawLog(t('log_generatingAgents', { count }));
    setIsGenerateContentModalOpen(false);

    try {
        const generatedData = await generateAgents(worldState.environment, language, count);
        if (!generatedData || !generatedData.agents) {
            throw new Error("Invalid data received from agent generation.");
        }
        
        const newAgents = sanitizeAndCreateAgents(generatedData.agents, worldState);
        
        const currentEngineState = engine.getState();
        const newWorldState: WorldState = {
            ...currentEngineState,
            agents: [...currentEngineState.agents, ...newAgents],
        };
        
        const newEngine = new RealityEngine(newWorldState);
        setEngine(newEngine);
        setWorldState(newEngine.getState());
        addRawLog(t('log_addedAgents', { count: newAgents.length }));

    } catch (error) {
        if (error instanceof LmStudioError && error.translationKey) {
            addRawLog(t(error.translationKey as TranslationKey));
        } else {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addRawLog(t('log_aiError', { error: `Agent generation failed: ${errorMessage}` }));
        }
    } finally {
        setIsGenerating(false);
    }
}, [engine, addRawLog, t, language, worldState, settings, isAiConfigured]);


const handleGenerateEntities = useCallback(async (counts: { [key: string]: number }) => {
    if (!isAiConfigured()) {
        addRawLog(t('log_configure_ai_full'));
        setIsSettingsOpen(true);
        return;
    }

    const totalCount = Object.values(counts).reduce((sum, val) => sum + val, 0);
    if (totalCount === 0) {
        addRawLog("No entities requested to generate.");
        return;
    }

    setIsGenerating(true);
    addRawLog(t('log_generatingEntities', { count: totalCount }));
    setIsGenerateContentModalOpen(false);

    try {
        const generatedData = await generateEntities(worldState.environment, language, counts);
        if (!generatedData || !generatedData.entities) {
            throw new Error("Invalid data received from entity generation.");
        }
        
        const newEntities = sanitizeAndCreateEntities(generatedData.entities, worldState);

        const currentEngineState = engine.getState();
        const newWorldState: WorldState = {
            ...currentEngineState,
            entities: [...currentEngineState.entities, ...newEntities],
        };
        
        const newEngine = new RealityEngine(newWorldState);
        setEngine(newEngine);
        setWorldState(newEngine.getState());
        addRawLog(t('log_addedEntities', { count: newEntities.length }));
    } catch (error) {
        if (error instanceof LmStudioError && error.translationKey) {
            addRawLog(t(error.translationKey as TranslationKey));
        } else {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addRawLog(t('log_aiError', { error: `Entity generation failed: ${errorMessage}` }));
        }
    } finally {
        setIsGenerating(false);
    }
}, [engine, addRawLog, t, language, worldState, settings, isAiConfigured]);


  const handlePrompt = useCallback(async (agentId: string, prompt: string, useAi: boolean) => {
    let actionToExecute = prompt;

    if (useAi) {
      addRawLog(t('log_agentProcessingPrompt', {agentId: agentId.substring(0,4), prompt, aiInfo: settings.provider }));
      
      if (!isAiConfigured()) {
        addRawLog(t('log_configure_ai_full'));
        setIsSettingsOpen(true);
        return;
      }
      
      try {
        const agent = engine.getAgentById(agentId);
        if(agent) {
           const generatedActionName = await generateActionFromPrompt(prompt, engine.getAvailableActions(), agent, engine.getState(), language);
            if (generatedActionName && generatedActionName !== "Keine Aktion") {
                actionToExecute = generatedActionName;
                addLog({ key: 'log_aiSuggestedAction', params: { action: actionToExecute } });
            } else {
                addLog({ key: 'log_aiFailed' });
                return; // Stop if AI fails to find a suitable action
            }
        }
      } catch (error) {
          if (error instanceof LmStudioError && error.translationKey) {
              addRawLog(t(error.translationKey as TranslationKey));
          } else {
              const errorMessage = error instanceof Error ? error.message : String(error);
              addLog({ key: 'log_aiError', params: { error: errorMessage } });
          }
          return;
      }
    } else {
        addRawLog(`Agent ${agentId.substring(0,4)} processing raw command: "${prompt}"`);
        // actionToExecute is already set to prompt, so we just proceed
    }

    const { logs: newLogs } = await engine.processAgentPrompt(agentId, actionToExecute);
    setWorldState({ ...engine.getState() });
    newLogs.forEach(log => addLog(log));
  }, [engine, addLog, addRawLog, t, language, settings, isAiConfigured]);
  
  const handleCreate = useCallback((type: 'agent' | 'entity' | 'action', data: any) => {
    if (type === 'agent') {
        engine.addAgent(data.name, data.description, data.beliefs, data.genome, data.role);
        addLog({ key: 'log_createdAgent', params: { name: data.name } });
    } else if (type === 'entity') {
        engine.addEntity(data.name, data.description);
        addLog({ key: 'log_createdEntity', params: { name: data.name } });
    } else if (type === 'action') {
        engine.addAction(data.name, data.description, data.beliefKey);
        addLog({ key: 'log_createdAction', params: { name: data.name } });
    }
    setWorldState({ ...engine.getState() });
  },[engine, addLog]);

  const handleDelete = useCallback((type: 'agent' | 'entity' | 'action', id: string) => {
    // @ts-ignore
    if (!window.confirm(t('confirmDelete', { type: t(`type_${type}`) }))) {
        return;
    }

    let itemName = id;
    if (type === 'agent') {
        const agent = engine.getAgentById(id);
        if (agent) itemName = agent.name;
        engine.removeAgent(id);
        if (selectedAgent?.id === id) {
            setSelectedAgent(worldState.agents.filter(a => a.id !== id)[0] || null);
        }
    } else if (type === 'entity') {
        const entity = engine.getEntityById(id);
        if (entity) itemName = entity.name;
        engine.removeEntity(id);
    } else if (type === 'action') { // here id is the name
        itemName = id;
        engine.removeAction(id);
    }
    setWorldState({ ...engine.getState() });
    // @ts-ignore
    addLog({ key: 'log_removed', params: { type: t(`type_${type}`), name: itemName }});
  }, [engine, addLog, selectedAgent, worldState.agents, t]);

  const handleSetAgentHealth = useCallback((agentId: string, health: number) => {
    engine.setAgentHealth(agentId, health);
    const agentName = engine.getAgentById(agentId)?.name || 'Unknown Agent';
    setWorldState({ ...engine.getState() });
    addLog({ key: 'log_adminSetHealth', params: { name: agentName, health } });
  }, [engine, addLog]);

  const handleSetAgentPosition = useCallback((agentId: string, x: number, y: number) => {
    engine.setAgentPosition(agentId, x, y);
    const agentName = engine.getAgentById(agentId)?.name || 'Unknown Agent';
    setWorldState({ ...engine.getState() });
    addLog({ key: 'log_adminSetPosition', params: { name: agentName, x, y } });
  }, [engine, addLog]);

  const handleInflictSickness = useCallback((agentId: string, sickness: string | null) => {
      engine.setAgentSickness(agentId, sickness);
      const agentName = engine.getAgentById(agentId)?.name || 'Unknown Agent';
      setWorldState({ ...engine.getState() });
      if (sickness) {
        addLog({ key: 'log_adminInflictedSickness', params: { name: agentName, sickness } });
      } else {
        addLog({ key: 'log_adminCured', params: { name: agentName } });
      }
  }, [engine, addLog]);

  const handleResurrectAgent = useCallback((agentId: string) => {
    engine.resurrectAgent(agentId);
    const agentName = engine.getAgentById(agentId)?.name || 'Unknown Agent';
    setWorldState({ ...engine.getState() });
    addLog({ key: 'log_adminResurrected', params: { name: agentName } });
  }, [engine, addLog]);

  const handleUpdateEnvironment = useCallback((newEnvironment: EnvironmentState) => {
    engine.setEnvironment(newEnvironment);
    setWorldState({ ...engine.getState() });
    addLog({ key: 'log_adminModifiedEnv' });
  }, [engine, addLog]);

  const handleSetAgentCurrency = useCallback((agentId: string, currency: number) => {
    engine.setAgentCurrency(agentId, currency);
    const agentName = engine.getAgentById(agentId)?.name || 'Unknown Agent';
    setWorldState({ ...engine.getState() });
    addLog({ key: 'log_adminSetCurrency', params: { name: agentName, currency } });
  }, [engine, addLog]);

  const handleEnactLaw = useCallback((law: Law) => {
      engine.enactLaw(law);
      setWorldState({ ...engine.getState() });
      addLog({ key: 'log_action_enact_law_success', params: { agentName: 'Admin', lawName: law.name } });
  }, [engine, addLog]);

  const handleRepealLaw = useCallback((lawId: string) => {
      const lawName = engine.getState().government.laws.find(l => l.id === lawId)?.name;
      engine.repealLaw(lawId);
      setWorldState({ ...engine.getState() });
      addLog({ key: 'log_adminRepealedLaw', params: { lawName: lawName || 'a law' } });
  }, [engine, addLog]);

  const handleStartElection = useCallback(() => {
      engine.startElection();
      setWorldState({ ...engine.getState() });
      addLog({ key: 'log_election_started' });
  }, [engine, addLog]);
  
  const handleSetLeader = useCallback((agentId: string) => {
      engine.setLeader(agentId);
      const agentName = engine.getAgentById(agentId)?.name || 'Unknown Agent';
      setWorldState({ ...engine.getState() });
      addLog({ key: 'log_adminSetLeader', params: { name: agentName } });
  }, [engine, addLog]);

  const handleUnlockTech = useCallback((cultureId: string, techId: string) => {
      engine.unlockTech(cultureId, techId);
      const cultureName = engine.getState().cultures.find(c => c.id === cultureId)?.name || 'A culture';
      const techName = t(`tech_${techId}` as any) || techId;
      setWorldState({ ...engine.getState() });
      addLog({ key: 'log_adminUnlockedTech', params: { cultureName, techId: techName } });
  }, [engine, addLog, t]);

  const downloadJSON = (data: any, filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleExport = useCallback((type: 'environment' | 'agents' | 'entities' | 'all') => {
    const state = engine.getState();
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    let logKey: TranslationKey = 'log_exported';
    switch (type) {
        case 'environment':
            downloadJSON(state.environment, `realitysim_environment_${timestamp}.json`);
            break;
        case 'agents':
            downloadJSON(state.agents, `realitysim_agents_${timestamp}.json`);
            break;
        case 'entities':
            downloadJSON(state.entities, `realitysim_entities_${timestamp}.json`);
            break;
        case 'all':
            downloadJSON({
                environment: state.environment,
                agents: state.agents,
                entities: state.entities,
                actions: state.actions,
                cultures: state.cultures,
                religions: state.religions,
            }, `realitysim_full_state_${timestamp}.json`);
            logKey = 'log_stateSaved';
            break;
    }
    addLog({ key: logKey, params: { type } });
  }, [engine, addLog]);

   const handleLoadState = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';

    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const jsonStr = event.target?.result;
                if (typeof jsonStr !== 'string') {
                    throw new Error("File content is not a string.");
                }
                const parsedState = JSON.parse(jsonStr);

                if (!parsedState.agents || !parsedState.environment || !parsedState.actions) {
                    throw new Error("Invalid or incomplete world state file.");
                }
                
                const loadedState: WorldState = {
                    ...initialWorldState,
                    ...parsedState,
                };
                
                const newEngine = new RealityEngine(loadedState);
                setEngine(newEngine);
                setWorldState(newEngine.getState());
                setSelectedAgent(newEngine.getState().agents.find(a => !a.adminAgent) || null);
                addRawLog(t('log_stateLoaded'));

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                addRawLog(t('log_loadError', { error: errorMessage }));
            }
        };

        reader.onerror = () => {
             addRawLog(t('log_loadError', { error: reader.error?.message || "Unknown file read error" }));
        };

        reader.readAsText(file);
    };

    input.click();
}, [addRawLog, t]);


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
            <ControlPanel onStep={handleStep} onRunSteps={handleRunSteps} onReset={handleReset} onGenerateWorld={() => setIsGenerateWorldModalOpen(true)} onGenerateContent={() => setIsGenerateContentModalOpen(true)} isGenerating={isGenerating} isProcessing={isProcessingSteps} />
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
        <div className="col-span-12 lg:col-span-3 space-y-4">
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
                        <button onClick={(e) => { e.stopPropagation(); handleDelete('agent', agent.id)}} className={`p-2 text-slate-500 hover:text-red-400 rounded-r-md transition-colors ${selectedAgent?.id === agent.id ? 'bg-sky-500/20' : 'bg-slate-700/50 hover:bg-slate-700'}`}>
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
                    {worldState.entities.map((entity: Entity) => (
                        <li key={entity.id} className="flex items-center justify-between text-sm p-2 bg-slate-700/50 rounded-md">
                            <span>{entity.name}</span>
                            <button onClick={() => handleDelete('entity', entity.id)} className="p-1 -mr-1 text-slate-500 hover:text-red-400 rounded-md transition-colors">
                                 <Trash2 className="w-3 h-3" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        <div className="col-span-12 lg:col-span-6 space-y-4">
          {selectedAgent ? (
             <AgentCard agent={selectedAgent} allAgents={worldState.agents} cultures={worldState.cultures || []} religions={worldState.religions || []} onPrompt={handlePrompt} />
          ) : (
            <div className="bg-slate-850 p-4 rounded-lg border border-slate-700 h-full flex items-center justify-center">
                <p className="text-slate-400">{t('agentCard_selectAgent')}</p>
            </div>
          )}
          <WorldGraph agents={worldState.agents} entities={worldState.entities} environment={worldState.environment} cultures={worldState.cultures || []}/>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-4">
            {selectedAgent?.adminAgent ? (
                <AdminPanel
                    environment={worldState.environment}
                    actions={worldState.actions}
                    agents={worldState.agents}
                    government={worldState.government}
                    cultures={worldState.cultures || []}
                    onUpdateEnvironment={handleUpdateEnvironment}
                    onCreateAction={(data) => handleCreate('action', data)}
                    onDeleteAction={(name) => handleDelete('action', name)}
                    onSetAgentHealth={handleSetAgentHealth}
                    onInflictSickness={handleInflictSickness}
                    onResurrectAgent={handleResurrectAgent}
                    onSetAgentPosition={handleSetAgentPosition}
                    onSetAgentCurrency={handleSetAgentCurrency}
                    onEnactLaw={handleEnactLaw}
                    onRepealLaw={handleRepealLaw}
                    onStartElection={handleStartElection}
                    onSetLeader={handleSetLeader}
                    onUnlockTech={handleUnlockTech}
                />
            ) : (
                <>
                    <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                            <Microscope className="w-5 h-5 text-emerald-400"/>
                            {t('environment')}
                        </h2>
                        <ul className="space-y-2 text-sm">
                            {Object.entries(worldState.environment).map(([key, value]) => (
                                <li key={key} className="flex justify-between">
                                    <span className="capitalize text-slate-400">{key}:</span>
                                    <span className="font-mono bg-slate-700 px-2 py-0.5 rounded">{String(value)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-emerald-400"/>
                            {t('availableActions')}
                        </h2>
                        <ul className="space-y-1 max-h-[25vh] overflow-y-auto pr-2">
                            {worldState.actions.map(action => (
                                <li key={action.name} className="flex items-center justify-between text-xs p-2 bg-slate-700/50 rounded-md">
                                    <span className="truncate pr-2">{action.name}</span>
                                     <button onClick={() => handleDelete('action', action.name)} className="p-1 -mr-1 text-slate-500 hover:text-red-400 rounded-md transition-colors flex-shrink-0">
                                         <Trash2 className="w-3 h-3" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <CreateObjectPanel onCreate={handleCreate} />
                </>
            )}

            <LogPanel logs={logs} />
            <ExporterPanel onExport={handleExport} onLoad={handleLoadState} />
        </div>
      </main>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <GenerateWorldModal 
        isOpen={isGenerateWorldModalOpen}
        onClose={() => setIsGenerateWorldModalOpen(false)}
        isGenerating={isGenerating}
        onGenerate={async (agentCount, entityCounts) => {
            await handleGenerateWorld(agentCount, entityCounts);
        }}
       />
       <GenerateContentModal
        isOpen={isGenerateContentModalOpen}
        onClose={() => setIsGenerateContentModalOpen(false)}
        onGenerateAgents={handleGenerateAgents}
        onGenerateEntities={handleGenerateEntities}
        isGenerating={isGenerating}
       />
    </div>
  );
}

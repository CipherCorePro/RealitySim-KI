
import React, { useState, useEffect, useCallback } from 'react';
import { RealityEngine } from './services/simulation';
import type { WorldState, Agent, Entity, EnvironmentState, LogEntry, Culture } from './types';
import { initialWorldState, GENOME_OPTIONS } from './constants';
import { AgentCard } from './components/AgentCard';
import { ControlPanel } from './components/ControlPanel';
import { LogPanel } from './components/LogPanel';
import { WorldGraph } from './components/WorldGraph';
import { CreateObjectPanel } from './components/CreateObjectPanel';
import { ExporterPanel } from './components/ExporterPanel';
import { AdminPanel } from './components/AdminPanel';
import { generateActionFromPrompt, generateWorld, LmStudioError } from './services/geminiService';
import { BrainCircuit, Cpu, Zap, Microscope, Boxes, Trash2, Settings, X, Globe, Users } from './components/IconComponents';
import { useLanguage } from './contexts/LanguageContext';
import { useTranslations } from './hooks/useTranslations';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useSettings } from './index';
import type { TranslationKey } from './translations';

// --- Settings Modal Component ---
interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, setSettings } = useSettings();
    const [url, setUrl] = useState(settings.lmStudioUrl);
    const [model, setModel] = useState(settings.lmStudioModel);
    const t = useTranslations();

    useEffect(() => {
        setUrl(settings.lmStudioUrl);
        setModel(settings.lmStudioModel);
    }, [settings.lmStudioUrl, settings.lmStudioModel, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        setSettings({ ...settings, lmStudioUrl: url, lmStudioModel: model });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-850 p-6 rounded-lg border border-slate-700 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
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
                        <label htmlFor="lm-studio-url" className="block text-sm font-medium text-slate-300 mb-1">{t('settings_lmStudioUrl_label')}</label>
                        <input
                            id="lm-studio-url"
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="http://localhost:1234"
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                        />
                        <p className="text-xs text-slate-500 mt-2">{t('settings_lmStudioUrl_description')}</p>
                    </div>

                     <div>
                        <label htmlFor="lm-studio-model" className="block text-sm font-medium text-slate-300 mb-1">{t('settings_lmStudioModel_label')}</label>
                        <input
                            id="lm-studio-model"
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="e.g. google/gemma-2b-it"
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                        />
                        <p className="text-xs text-slate-500 mt-2">{t('settings_lmStudioModel_description')}</p>
                    </div>

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
    onGenerate: (agentCount: number, entityCount: number) => void;
}

const GenerateWorldModal: React.FC<GenerateWorldModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const [agentCount, setAgentCount] = useState(20);
    const [entityCount, setEntityCount] = useState(20);
    const t = useTranslations();

    if (!isOpen) {
        return null;
    }

    const handleGenerateClick = () => {
        onGenerate(agentCount, entityCount);
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
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                        />
                         <p className="text-xs text-slate-500 mt-2">{t('generateWorldModal_agentsDescription')}</p>
                    </div>

                     <div>
                        <label htmlFor="entity-count" className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2"><Boxes className="w-4 h-4"/>{t('generateWorldModal_entitiesLabel')}</label>
                        <input
                            id="entity-count"
                            type="number"
                            value={entityCount}
                             onChange={(e) => setEntityCount(Math.max(0, parseInt(e.target.value, 10)))}
                            min="0"
                            max="100"
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                        />
                        <p className="text-xs text-slate-500 mt-2">{t('generateWorldModal_entitiesDescription')}</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">{t('settings_cancel')}</button>
                        <button onClick={handleGenerateClick} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">{t('generateWorldModal_generate')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- End Generate World Modal ---


export default function App() {
  const [engine, setEngine] = useState(() => new RealityEngine(initialWorldState));
  const [worldState, setWorldState] = useState<WorldState>(engine.getState());
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerateWorldModalOpen, setIsGenerateWorldModalOpen] = useState(false);

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
    const { logs: newLogs } = await engine.step(language);
    setWorldState({ ...engine.getState() });
    newLogs.forEach(log => addLog(log));
    addLog({ key: 'log_simulationStepped' });
  }, [engine, addLog, language]);

  const handleRunSteps = useCallback(async (steps: number) => {
    addRawLog(t('log_runningSimulation', { steps }));
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
  }, [engine, addLog, addRawLog, t, language]);

  const handleReset = useCallback(() => {
    const newEngine = new RealityEngine(initialWorldState);
    setEngine(newEngine);
    setWorldState(newEngine.getState());
    setSelectedAgent(newEngine.getState().agents[0] || null);
    setLogs([`[${new Date().toLocaleTimeString()}] ${t('log_simulationReset')}`]);
  }, [t]);

  const handleGenerateWorld = useCallback(async (agentCount: number, entityCount: number) => {
    if (!settings.lmStudioUrl || !settings.lmStudioModel) {
        addRawLog(t('log_configure_ai_full'));
        setIsSettingsOpen(true);
        return;
    }

    setIsGenerating(true);
    addRawLog(t('log_generatingWorld'));

    try {
        const generatedData = await generateWorld(worldState.environment, language, agentCount, entityCount);

        if (!generatedData || !generatedData.agents || !generatedData.entities) {
            throw new Error("Invalid data received from world generation.");
        }

        if (generatedData.agents.length !== agentCount || generatedData.entities.length !== entityCount) {
            addRawLog(t('log_worldGenerated_warning', { 
                reqAgents: agentCount, 
                genAgents: generatedData.agents.length,
                reqEntities: entityCount,
                genEntities: generatedData.entities.length,
            }));
        }

        const newAgents: Agent[] = generatedData.agents.map((geminiAgent: any, index: number) => {
            const beliefNetwork = (geminiAgent.beliefs || []).reduce((acc: { [key: string]: number }, belief: { key: string, value: number }) => {
                if (belief.key && typeof belief.value === 'number') {
                    acc[belief.key] = belief.value;
                }
                return acc;
            }, {});
            
            const x = geminiAgent.x ?? Math.floor(Math.random() * worldState.environment.width);
            const y = geminiAgent.y ?? Math.floor(Math.random() * worldState.environment.height);

            return {
                id: `agent-gen-${Date.now()}-${index}`,
                name: geminiAgent.name,
                description: geminiAgent.description,
                x: Math.max(0, Math.min(worldState.environment.width - 1, x)),
                y: Math.max(0, Math.min(worldState.environment.height - 1, y)),
                beliefNetwork,
                emotions: { happiness: 0.5, sadness: 0.1, anger: 0.1, fear: 0.1, trust: 0.3, love: 0.1 },
                resonance: {},
                socialMemory: [],
                lastActions: [],
                adminAgent: false,
                health: 100,
                isAlive: true,
                sickness: null,
                conversationHistory: [],
                age: geminiAgent.age,
                genome: (geminiAgent.genome || []).filter((g: string) => GENOME_OPTIONS.includes(g)),
                relationships: {},
                cultureId: geminiAgent.cultureId || null,
                religionId: geminiAgent.religionId || null,
                role: geminiAgent.role || null,
                offspringCount: 0,
                hunger: geminiAgent.hunger ?? Math.floor(Math.random() * 50),
                thirst: geminiAgent.thirst ?? Math.floor(Math.random() * 50),
                fatigue: geminiAgent.fatigue ?? Math.floor(Math.random() * 50),
                inventory: geminiAgent.inventory ?? {},
            };
        });

        const newEntities: Entity[] = generatedData.entities.map((geminiEntity, index) => {
            const x = geminiEntity.x ?? Math.floor(Math.random() * worldState.environment.width);
            const y = geminiEntity.y ?? Math.floor(Math.random() * worldState.environment.height);
            return {
                id: `entity-gen-${Date.now()}-${index}`,
                name: geminiEntity.name,
                description: geminiEntity.description,
                x: Math.max(0, Math.min(worldState.environment.width - 1, x)),
                y: Math.max(0, Math.min(worldState.environment.height - 1, y)),
            };
        });
        
        const adminAgent = engine.getAgentById('agent-admin');
        const finalAgents = adminAgent ? [...newAgents, adminAgent] : newAgents;

        const newWorldState: WorldState = {
            agents: finalAgents,
            entities: newEntities,
            actions: engine.getState().actions, // Keep existing actions
            environment: worldState.environment, // Keep existing environment
            cultures: engine.getState().cultures,
            religions: engine.getState().religions,
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
}, [engine, addRawLog, t, language, worldState.environment, settings.lmStudioUrl, settings.lmStudioModel]);

  const handlePrompt = useCallback(async (agentId: string, prompt: string, useAi: boolean) => {
    let actionToExecute = prompt;

    if (useAi) {
      addRawLog(t('log_agentProcessingPrompt', {agentId: agentId.substring(0,4), prompt, aiInfo: '(using local AI)'}));
      
      if (!settings.lmStudioUrl || !settings.lmStudioModel) {
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

    const { logs: newLogs } = engine.processAgentPrompt(agentId, actionToExecute);
    setWorldState({ ...engine.getState() });
    newLogs.forEach(log => addLog(log));
  }, [engine, addLog, addRawLog, t, language, settings.lmStudioUrl, settings.lmStudioModel]);
  
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
                const loadedState: WorldState = JSON.parse(jsonStr);

                if (!loadedState.agents || !loadedState.environment || !loadedState.actions) {
                    throw new Error("Invalid or incomplete world state file.");
                }
                
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
      <header className="bg-slate-950/70 backdrop-blur-sm p-4 border-b border-slate-700/50 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-sky-400" />
            <h1 className="text-2xl font-bold text-slate-100 tracking-wider">{t('realitySimAI')}</h1>
            <LanguageSwitcher />
        </div>
        <div className="flex items-center gap-2">
            <ControlPanel onStep={handleStep} onRunSteps={handleRunSteps} onReset={handleReset} onGenerateWorld={() => setIsGenerateWorldModalOpen(true)} isGenerating={isGenerating} />
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
                    onUpdateEnvironment={handleUpdateEnvironment}
                    onCreateAction={(data) => handleCreate('action', data)}
                    onDeleteAction={(name) => handleDelete('action', name)}
                    onSetAgentHealth={handleSetAgentHealth}
                    onInflictSickness={handleInflictSickness}
                    onResurrectAgent={handleResurrectAgent}
                    onSetAgentPosition={handleSetAgentPosition}
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
        onGenerate={async (agentCount, entityCount) => {
            setIsGenerateWorldModalOpen(false);
            await handleGenerateWorld(agentCount, entityCount);
        }}
       />
    </div>
  );
}

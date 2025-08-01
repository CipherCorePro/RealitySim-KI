
import React, { useState, useEffect } from 'react';
import type { Action, EnvironmentState, Agent } from '../types';
import { Shield, Settings, Zap, Trash2, PlusCircle, Bot, MapPin } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';

interface AdminPanelProps {
    environment: EnvironmentState;
    actions: Action[];
    agents: Agent[];
    onUpdateEnvironment: (newEnvironment: EnvironmentState) => void;
    onCreateAction: (data: { name: string; description: string; beliefKey?: string }) => void;
    onDeleteAction: (name: string) => void;
    onSetAgentHealth: (agentId: string, health: number) => void;
    onInflictSickness: (agentId: string, sickness: string | null) => void;
    onResurrectAgent: (agentId: string) => void;
    onSetAgentPosition: (agentId: string, x: number, y: number) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ environment, actions, agents, onUpdateEnvironment, onCreateAction, onDeleteAction, onSetAgentHealth, onInflictSickness, onResurrectAgent, onSetAgentPosition }) => {
    const t = useTranslations();
    const [envState, setEnvState] = useState(environment);
    const [agentHealthInputs, setAgentHealthInputs] = useState<{ [key: string]: string }>({});
    const [agentSicknessInputs, setAgentSicknessInputs] = useState<{ [key: string]: string }>({});
    const [agentPositionInputs, setAgentPositionInputs] = useState<{ [key: string]: { x: string, y: string } }>({});
    
    useEffect(() => {
        setEnvState(environment);
        
        const initialHealths: { [key: string]: string } = {};
        const initialSicknesses: { [key: string]: string } = {};
        const initialPositions: { [key: string]: { x: string, y: string } } = {};
        agents.forEach(agent => {
            initialHealths[agent.id] = String(agent.health);
            initialSicknesses[agent.id] = agent.sickness || '';
            initialPositions[agent.id] = { x: String(agent.x), y: String(agent.y) };
        });
        setAgentHealthInputs(initialHealths);
        setAgentSicknessInputs(initialSicknesses);
        setAgentPositionInputs(initialPositions);

    }, [environment, agents]);

    const handleHealthInputChange = (agentId: string, value: string) => {
        setAgentHealthInputs(prev => ({ ...prev, [agentId]: value }));
    };

    const handleSicknessInputChange = (agentId: string, value: string) => {
        setAgentSicknessInputs(prev => ({ ...prev, [agentId]: value }));
    };

    const handlePositionInputChange = (agentId: string, axis: 'x' | 'y', value: string) => {
        setAgentPositionInputs(prev => ({
            ...prev,
            [agentId]: {
                ...prev[agentId],
                [axis]: value
            }
        }));
    };

    const handleSetHealth = (agentId: string) => {
        const healthVal = parseInt(agentHealthInputs[agentId], 10);
        if (!isNaN(healthVal)) {
            onSetAgentHealth(agentId, healthVal);
        }
    };
    
    const handleSetSickness = (agentId: string) => {
        const sicknessVal = agentSicknessInputs[agentId].trim();
        onInflictSickness(agentId, sicknessVal || null);
    };

    const handleSetPosition = (agentId: string) => {
        const xVal = parseInt(agentPositionInputs[agentId].x, 10);
        const yVal = parseInt(agentPositionInputs[agentId].y, 10);
        if (!isNaN(xVal) && !isNaN(yVal)) {
            onSetAgentPosition(agentId, xVal, yVal);
        }
    };

    const handleEnvSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateEnvironment(envState);
    };

    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newBeliefKey, setNewBeliefKey] = useState('');

    const handleActionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newDesc.trim()) return;
        onCreateAction({ name: newName, description: newDesc, beliefKey: newBeliefKey });
        setNewName('');
        setNewDesc('');
        setNewBeliefKey('');
    };

    return (
        <div className="bg-slate-850 p-4 rounded-lg border border-red-500/30 space-y-6">
            <h2 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5"/>
                {t('admin_title')}
            </h2>

            <div className="space-y-3">
                <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-400"/>
                    {t('admin_envOverride')}
                </h3>
                <form onSubmit={handleEnvSubmit} className="space-y-2 text-sm">
                    {Object.entries(envState).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                            <label className="capitalize text-slate-400 w-1/3 truncate">{key}:</label>
                            <input
                                type={typeof value === 'number' ? 'number' : 'text'}
                                value={value}
                                onChange={e => setEnvState(prev => ({ ...prev, [key]: typeof environment[key] === 'number' && typeof e.target.value === 'string' ? parseFloat(e.target.value) || 0 : e.target.value }))}
                                className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                        </div>
                    ))}
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-md transition-colors mt-2">{t('admin_updateEnv')}</button>
                </form>
            </div>
            
            <div className="space-y-3">
                <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-400"/>
                    {t('admin_ruleEditor')}
                </h3>

                <form onSubmit={handleActionSubmit} className="space-y-2 text-sm bg-slate-900/50 p-3 rounded-lg">
                     <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2"><PlusCircle className="w-4 h-4"/>{t('admin_createAction')}</h4>
                     <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder={t('create_name')} required className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                     <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder={t('create_description')} required className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                     <input type="text" value={newBeliefKey} onChange={e => setNewBeliefKey(e.target.value)} placeholder={t('create_beliefKeyPlaceholder')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                     <button type="submit" className="w-full bg-emerald-600/80 hover:bg-emerald-600 text-white font-semibold py-2 rounded-md transition-colors">{t('admin_createActionBtn')}</button>
                </form>

                <div className="space-y-1 max-h-[25vh] overflow-y-auto pr-2">
                     <h4 className="text-sm font-semibold text-slate-200 my-2">{t('admin_existingActions')}</h4>
                    {actions.map(action => (
                         <li key={action.name} className="flex items-center justify-between text-xs p-2 bg-slate-700/50 rounded-md list-none">
                            <div className="flex flex-col overflow-hidden mr-2">
                                <span className="font-bold text-slate-200 truncate">{action.name}</span>
                                <span className="text-slate-400 truncate">{action.description}</span>
                            </div>
                            <button onClick={() => onDeleteAction(action.name)} className="p-1 text-slate-500 hover:text-red-400 rounded-md transition-colors flex-shrink-0">
                                 <Trash2 className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-emerald-400"/>
                    {t('admin_agentManagement')}
                </h3>
                <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 text-sm">
                    {agents.filter(a => !a.adminAgent).map(agent => (
                        <div key={agent.id} className="bg-slate-900/50 p-3 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                                <span className={`font-bold ${agent.isAlive ? 'text-slate-200' : 'text-slate-500'}`}>{agent.name}</span>
                                {!agent.isAlive && (
                                    <button onClick={() => onResurrectAgent(agent.id)} className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-1 px-3 rounded-md transition-colors">{t('admin_resurrect')}</button>
                                )}
                            </div>
                            {agent.isAlive && (
                            <>
                                <div className="flex items-center gap-2">
                                    <label htmlFor={`health-${agent.id}`} className="text-slate-400 w-20">{t('agentCard_health')}:</label>
                                    <input id={`health-${agent.id}`} type="number" value={agentHealthInputs[agent.id] || ''} onChange={e => handleHealthInputChange(agent.id, e.target.value)} className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                                    <button onClick={() => handleSetHealth(agent.id)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md transition-colors">{t('admin_set')}</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label htmlFor={`sickness-${agent.id}`} className="text-slate-400 w-20">{t('agentCard_sickness')}:</label>
                                    <input id={`sickness-${agent.id}`} type="text" value={agentSicknessInputs[agent.id] || ''} onChange={e => handleSicknessInputChange(agent.id, e.target.value)} placeholder={t('admin_sicknessPlaceholder')} className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                                    <button onClick={() => handleSetSickness(agent.id)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md transition-colors">{t('admin_set')}</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-slate-400 w-20 flex items-center gap-1"><MapPin className="w-3 h-3"/> Pos:</label>
                                    <div className="flex-grow flex items-center gap-1">
                                      <input type="number" value={agentPositionInputs[agent.id]?.x || ''} onChange={e => handlePositionInputChange(agent.id, 'x', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="x" />
                                      <input type="number" value={agentPositionInputs[agent.id]?.y || ''} onChange={e => handlePositionInputChange(agent.id, 'y', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="y" />
                                    </div>
                                    <button onClick={() => handleSetPosition(agent.id)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md transition-colors">{t('admin_set')}</button>
                                </div>
                            </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};


import React, { useState, useEffect } from 'react';
import type { Action, EnvironmentState, Agent, Law, Culture } from '../types';
import { Shield, Settings, Zap, Trash2, PlusCircle, Bot, MapPin, Gavel, Vote, BookOpenCheck, CircleDollarSign } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';

interface AdminPanelProps {
    environment: EnvironmentState;
    actions: Action[];
    agents: Agent[];
    government: any; // Simplified for prop drilling
    cultures: Culture[];
    onUpdateEnvironment: (newEnvironment: EnvironmentState) => void;
    onCreateAction: (data: { name: string; description: string; beliefKey?: string }) => void;
    onDeleteAction: (name: string) => void;
    onSetAgentHealth: (agentId: string, health: number) => void;
    onSetAgentCurrency: (agentId: string, currency: number) => void;
    onInflictSickness: (agentId: string, sickness: string | null) => void;
    onResurrectAgent: (agentId: string) => void;
    onSetAgentPosition: (agentId: string, x: number, y: number) => void;
    // New admin actions
    onEnactLaw: (law: Law) => void;
    onRepealLaw: (lawId: string) => void;
    onStartElection: () => void;
    onSetLeader: (agentId: string) => void;
    onUnlockTech: (cultureId: string, techId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const { 
        environment, actions, agents, government, cultures,
        onUpdateEnvironment, onCreateAction, onDeleteAction, onSetAgentHealth, onSetAgentCurrency,
        onInflictSickness, onResurrectAgent, onSetAgentPosition,
        onEnactLaw, onRepealLaw, onStartElection, onSetLeader, onUnlockTech
    } = props;

    const t = useTranslations();
    const [envState, setEnvState] = useState(environment);
    const [agentHealthInputs, setAgentHealthInputs] = useState<{ [key: string]: string }>({});
    const [agentCurrencyInputs, setAgentCurrencyInputs] = useState<{ [key: string]: string }>({});
    const [agentSicknessInputs, setAgentSicknessInputs] = useState<{ [key: string]: string }>({});
    const [agentPositionInputs, setAgentPositionInputs] = useState<{ [key: string]: { x: string, y: string } }>({});
    
    useEffect(() => {
        setEnvState(environment);
        const initialHealths: { [key: string]: string } = {};
        const initialSicknesses: { [key: string]: string } = {};
        const initialPositions: { [key: string]: { x: string, y: string } } = {};
        const initialCurrencies: { [key: string]: string } = {};
        agents.forEach(agent => {
            initialHealths[agent.id] = String(agent.health);
            initialSicknesses[agent.id] = agent.sickness || '';
            initialPositions[agent.id] = { x: String(agent.x), y: String(agent.y) };
            initialCurrencies[agent.id] = String(agent.currency);
        });
        setAgentHealthInputs(initialHealths);
        setAgentSicknessInputs(initialSicknesses);
        setAgentPositionInputs(initialPositions);
        setAgentCurrencyInputs(initialCurrencies);
    }, [environment, agents]);

    const handleHealthInputChange = (agentId: string, value: string) => setAgentHealthInputs(p => ({ ...p, [agentId]: value }));
    const handleSicknessInputChange = (agentId: string, value: string) => setAgentSicknessInputs(p => ({ ...p, [agentId]: value }));
    const handleCurrencyInputChange = (agentId: string, value: string) => setAgentCurrencyInputs(p => ({ ...p, [agentId]: value }));
    const handlePositionInputChange = (agentId: string, axis: 'x' | 'y', value: string) => setAgentPositionInputs(p => ({ ...p, [agentId]: { ...p[agentId], [axis]: value } }));

    const handleSetHealth = (agentId: string) => onSetAgentHealth(agentId, parseInt(agentHealthInputs[agentId], 10));
    const handleSetSickness = (agentId: string) => onInflictSickness(agentId, agentSicknessInputs[agentId].trim() || null);
    const handleSetCurrency = (agentId: string) => onSetAgentCurrency(agentId, parseInt(agentCurrencyInputs[agentId], 10));
    const handleSetPosition = (agentId: string) => onSetAgentPosition(agentId, parseInt(agentPositionInputs[agentId].x, 10), parseInt(agentPositionInputs[agentId].y, 10));

    const [newLawName, setNewLawName] = useState('');
    const [newLawAction, setNewLawAction] = useState('');
    const [newLawFine, setNewLawFine] = useState('25');
    const handleAddLaw = () => {
        if(!newLawName || !newLawAction) return;
        const newLaw: Law = {
            id: `law-${Date.now()}`,
            name: newLawName,
            description: `It is illegal to ${newLawAction}`,
            violatingAction: newLawAction,
            punishment: { type: 'fine', amount: parseInt(newLawFine, 10) }
        };
        onEnactLaw(newLaw);
        setNewLawName('');
        setNewLawAction('');
    };

    return (
        <div className="bg-slate-850 p-4 rounded-lg border border-red-500/30 space-y-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5"/>
                {t('admin_title')}
            </h2>

            {/* Political Management */}
            <div className="space-y-3">
                <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2"><Gavel className="w-5 h-5 text-emerald-400"/>{t('admin_politicalManagement')}</h3>
                <div className="text-sm space-y-2 bg-slate-900/50 p-3 rounded-lg">
                    <p>{t('admin_currentLeader')}: <span className="font-bold">{agents.find(a=>a.id === government.leaderId)?.name || 'None'}</span></p>
                    <button onClick={onStartElection} className="w-full text-xs py-1 mt-2 bg-sky-600 hover:bg-sky-500 rounded flex items-center justify-center gap-2"><Vote className="w-4 h-4" />{t('admin_startElection')}</button>
                    <div>
                        <h4 className="text-xs font-bold my-2">{t('admin_laws')}</h4>
                        {government.laws.map((law: Law) => <div key={law.id} className="flex justify-between items-center text-xs p-1"><span>{law.name}</span><button onClick={()=> onRepealLaw(law.id)}><Trash2 className="w-3 h-3 text-slate-500 hover:text-red-400"/></button></div>)}
                    </div>
                    <div className="pt-2 border-t border-slate-700 space-y-1">
                         <input type="text" value={newLawName} onChange={e => setNewLawName(e.target.value)} placeholder={t('admin_lawName')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                         <input type="text" value={newLawAction} onChange={e => setNewLawAction(e.target.value)} placeholder={t('admin_violatingAction')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                         <button onClick={handleAddLaw} className="w-full text-xs py-1 bg-emerald-600 hover:bg-emerald-500 rounded">{t('admin_addLaw')}</button>
                    </div>
                </div>
            </div>

            {/* Tech Management */}
            <div className="space-y-3">
                 <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2"><BookOpenCheck className="w-5 h-5 text-emerald-400"/>{t('admin_techManagement')}</h3>
                 {cultures.map(culture => (
                     <div key={culture.id} className="text-sm space-y-1 bg-slate-900/50 p-3 rounded-lg">
                         <h4 className="font-bold">{culture.name}</h4>
                         <p className="text-xs text-slate-400">{t('admin_researchPoints')}: {culture.researchPoints.toFixed(0)}</p>
                         <p className="text-xs text-slate-400">{t('agentCard_tech')}: {culture.knownTechnologies.join(', ') || 'None'}</p>
                     </div>
                 ))}
            </div>

            {/* Agent Management */}
            <div className="space-y-3">
                <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2"><Bot className="w-5 h-5 text-emerald-400"/>{t('admin_agentManagement')}</h3>
                <div className="space-y-4 text-sm">
                    {agents.filter(a => !a.adminAgent).map(agent => (
                        <div key={agent.id} className="bg-slate-900/50 p-3 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                                <span className={`font-bold ${agent.isAlive ? 'text-slate-200' : 'text-slate-500'}`}>{agent.name}</span>
                                {!agent.isAlive && (
                                    <button onClick={() => onResurrectAgent(agent.id)} className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-1 px-3 rounded-md transition-colors">{t('admin_resurrect')}</button>
                                )}
                            </div>
                            {agent.isAlive && ( <>
                                <div className="flex items-center gap-2">
                                    <label className="text-slate-400 w-20 flex items-center gap-1"><CircleDollarSign className="w-3 h-3"/> {t('agentCard_currency')}:</label>
                                    <input type="number" value={agentCurrencyInputs[agent.id] || ''} onChange={e => handleCurrencyInputChange(agent.id, e.target.value)} className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    <button onClick={() => handleSetCurrency(agent.id)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md">{t('admin_set')}</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-slate-400 w-20">{t('agentCard_health')}:</label>
                                    <input type="number" value={agentHealthInputs[agent.id] || ''} onChange={e => handleHealthInputChange(agent.id, e.target.value)} className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    <button onClick={() => handleSetHealth(agent.id)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md">{t('admin_set')}</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-slate-400 w-20">{t('agentCard_sickness')}:</label>
                                    <input type="text" value={agentSicknessInputs[agent.id] || ''} onChange={e => handleSicknessInputChange(agent.id, e.target.value)} placeholder={t('admin_sicknessPlaceholder')} className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    <button onClick={() => handleSetSickness(agent.id)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md">{t('admin_set')}</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-slate-400 w-20 flex items-center gap-1"><MapPin className="w-3 h-3"/> Pos:</label>
                                    <div className="flex-grow flex items-center gap-1">
                                      <input type="number" value={agentPositionInputs[agent.id]?.x || ''} onChange={e => handlePositionInputChange(agent.id, 'x', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" placeholder="x" />
                                      <input type="number" value={agentPositionInputs[agent.id]?.y || ''} onChange={e => handlePositionInputChange(agent.id, 'y', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" placeholder="y" />
                                    </div>
                                    <button onClick={() => handleSetPosition(agent.id)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md">{t('admin_set')}</button>
                                </div>
                            </>)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

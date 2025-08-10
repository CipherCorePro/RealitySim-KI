import React, { useState, useEffect } from 'react';
import type { Action, EnvironmentState, Agent, Law, Culture, Technology, ActionEffect, Skills } from '../types';
import { Shield, Settings, Zap, Trash2, Users, MapPin, Gavel, Vote, BookOpenCheck, CircleDollarSign, HeartPulse, Megaphone } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';
import { SKILL_TYPES } from '../constants';

// --- Environment Editor ---
const EnvironmentEditor: React.FC<{ environment: EnvironmentState; onSave: (env: EnvironmentState) => void }> = ({ environment, onSave }) => {
    const t = useTranslations();
    const [envState, setEnvState] = useState(environment);

    useEffect(() => {
        setEnvState(environment);
    }, [environment]);

    const handleChange = (key: string, value: string) => {
        const isNumeric = !isNaN(parseFloat(environment[key])) && isFinite(environment[key]);
        setEnvState(prev => ({
            ...prev,
            [key]: isNumeric ? (value === '' ? 0 : parseFloat(value)) : value
        }));
    };

    return (
        <div className="space-y-2">
            <h4 className="text-md font-semibold text-slate-100">{t('admin_environmentEditor')}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(envState).map(([key, value]) => {
                    if (typeof value === 'object' && value !== null) return null; // Don't show complex objects like election
                    return (
                        <div key={key} className="flex flex-col gap-1">
                            <label className="capitalize text-slate-400">{key}</label>
                            <input
                                type={typeof value === 'number' ? 'number' : 'text'}
                                value={String(value)}
                                onChange={e => handleChange(key, e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1"
                            />
                        </div>
                    )
                })}
            </div>
            <button onClick={() => onSave(envState)} className="w-full text-xs py-1.5 mt-2 bg-emerald-600 hover:bg-emerald-500 rounded">{t('admin_saveEnvironment')}</button>
        </div>
    )
};

// --- Action Editor ---
const ActionEditor: React.FC<{ actions: Action[]; onUpdate: (name: string, data: Partial<Action>) => void }> = ({ actions, onUpdate }) => {
    const t = useTranslations();
    const [selectedActionName, setSelectedActionName] = useState('');
    const [description, setDescription] = useState('');
    const [costs, setCosts] = useState('{}');
    const [statChanges, setStatChanges] = useState({ health: '', hunger: '', thirst: '', fatigue: '', stress: '', currency: '' });
    const [skillGain, setSkillGain] = useState({ skill: SKILL_TYPES[0], amount: '' });

    useEffect(() => {
        const action = actions.find(a => a.name === selectedActionName);
        if (action) {
            setDescription(action.description);
            setCosts(JSON.stringify(action.effects?.costs || {}, null, 2));
            setStatChanges({
                health: String(action.effects?.statChanges?.health || ''),
                hunger: String(action.effects?.statChanges?.hunger || ''),
                thirst: String(action.effects?.statChanges?.thirst || ''),
                fatigue: String(action.effects?.statChanges?.fatigue || ''),
                stress: String(action.effects?.statChanges?.stress || ''),
                currency: String(action.effects?.statChanges?.currency || ''),
            });
            setSkillGain({
                skill: String(action.effects?.skillGain?.skill || SKILL_TYPES[0]),
                amount: String(action.effects?.skillGain?.amount || '')
            });
        } else {
            setDescription('');
            setCosts('{}');
            setStatChanges({ health: '', hunger: '', thirst: '', fatigue: '', stress: '', currency: '' });
            setSkillGain({ skill: SKILL_TYPES[0], amount: '' });
        }
    }, [selectedActionName, actions]);

    const handleUpdate = () => {
        if (!selectedActionName) return;

        let parsedCosts;
        try {
            parsedCosts = JSON.parse(costs);
        } catch (e) {
            alert('Invalid JSON in costs field.');
            return;
        }

        const updatedEffects: ActionEffect = {};

        if (Object.keys(parsedCosts).length > 0) updatedEffects.costs = parsedCosts;

        const parsedStatChanges = Object.entries(statChanges).reduce((acc, [key, value]) => {
            if (value.trim() !== '') {
                const numVal = parseFloat(value);
                if (!isNaN(numVal)) {
                    acc[key as keyof typeof statChanges] = numVal;
                }
            }
            return acc;
        }, {} as { [key: string]: number });
        if (Object.keys(parsedStatChanges).length > 0) updatedEffects.statChanges = parsedStatChanges;
        
        const skillAmount = parseFloat(skillGain.amount);
        if (skillGain.skill && !isNaN(skillAmount) && skillAmount > 0) {
            updatedEffects.skillGain = { skill: skillGain.skill as keyof Skills, amount: skillAmount };
        }

        onUpdate(selectedActionName, { description, effects: updatedEffects });
    };

    return (
        <div className="space-y-2 pt-4 border-t border-slate-700">
            <h4 className="text-md font-semibold text-slate-100">{t('admin_actionEditor')}</h4>
            <select
                value={selectedActionName}
                onChange={e => setSelectedActionName(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs"
            >
                <option value="">{t('admin_selectActionToEdit')}</option>
                {actions.map(action => <option key={action.name} value={action.name}>{action.name}</option>)}
            </select>

            {selectedActionName && (
                <div className="space-y-3">
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t('create_description')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" rows={2}/>
                    <textarea value={costs} onChange={e => setCosts(e.target.value)} placeholder={t('create_costs_placeholder')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs font-mono" rows={3}/>
                     <div>
                        <h5 className="text-xs font-semibold mb-1">{t('create_stat_changes_label')}</h5>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {Object.keys(statChanges).map(key => (
                                <div key={key} className="flex items-center gap-2">
                                    <label className="text-xs text-slate-400 capitalize w-16">{t(`stat_${key}` as any)}</label>
                                    <input type="number" value={statChanges[key as keyof typeof statChanges]} onChange={e => setStatChanges(p => ({...p, [key]: e.target.value}))} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs"/>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h5 className="text-xs font-semibold mb-1">{t('create_skill_gain_label')}</h5>
                        <div className="flex items-center gap-2">
                            <select value={skillGain.skill} onChange={e => setSkillGain(p => ({...p, skill: e.target.value}))} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs">
                                {SKILL_TYPES.map(s => <option key={s} value={s}>{t(`skill_${s}` as any)}</option>)}
                            </select>
                            <input type="number" step="0.1" value={skillGain.amount} onChange={e => setSkillGain(p => ({...p, amount: e.target.value}))} placeholder={t('create_amount')} className="w-32 bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs"/>
                        </div>
                    </div>
                    <button onClick={handleUpdate} className="w-full text-xs py-1.5 mt-2 bg-emerald-600 hover:bg-emerald-500 rounded">{t('admin_updateAction')}</button>
                </div>
            )}
        </div>
    );
};

interface AdminPanelProps {
    environment: EnvironmentState;
    actions: Action[];
    agents: Agent[];
    government: any; // Simplified for prop drilling
    cultures: Culture[];
    techTree: Technology[];
    onUpdateEnvironment: (newEnvironment: EnvironmentState) => void;
    onCreateAction: (data: { name: string; description: string; beliefKey?: string }) => void;
    onUpdateAction: (actionName: string, data: Partial<Action>) => void;
    onDeleteAction: (name: string) => void;
    onSetAgentHealth: (agentId: string, health: number) => void;
    onSetAgentCurrency: (agentId: string, currency: number) => void;
    onInflictSickness: (agentId: string, sickness: string | null) => void;
    onResurrectAgent: (agentId: string) => void;
    onSetAgentPosition: (agentId: string, x: number, y: number) => void;
    onImprisonAgent: (agentId: string, duration: number) => void;
    onCreateBroadcast: (data: { title: string; content: string; targetBelief: string; influenceDelta: number; truthfulness: number; }) => void;
    // New admin actions
    onEnactLaw: (law: Law) => void;
    onRepealLaw: (lawId: string) => void;
    onStartElection: () => void;
    onSetLeader: (agentId: string) => void;
    onUnlockTech: (cultureId: string, techId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const { 
        environment, actions, agents, government, cultures, techTree,
        onUpdateEnvironment, onCreateAction, onUpdateAction, onDeleteAction, onSetAgentHealth, onSetAgentCurrency,
        onInflictSickness, onResurrectAgent, onSetAgentPosition, onImprisonAgent, onCreateBroadcast,
        onEnactLaw, onRepealLaw, onStartElection, onSetLeader, onUnlockTech
    } = props;

    const t = useTranslations();
    const [agentHealthInputs, setAgentHealthInputs] = useState<{ [key: string]: string }>({});
    const [agentCurrencyInputs, setAgentCurrencyInputs] = useState<{ [key: string]: string }>({});
    const [agentSicknessInputs, setAgentSicknessInputs] = useState<{ [key: string]: string }>({});
    const [agentPositionInputs, setAgentPositionInputs] = useState<{ [key: string]: { x: string, y: string } }>({});
    const [agentImprisonInputs, setAgentImprisonInputs] = useState<{ [key: string]: string }>({});
    const [selectedLeaderId, setSelectedLeaderId] = useState('');
    
    // Media Broadcast State
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastContent, setBroadcastContent] = useState('');
    const [broadcastTarget, setBroadcastTarget] = useState('progress_good');
    const [broadcastInfluence, setBroadcastInfluence] = useState(0.1);
    const [broadcastTruth, setBroadcastTruth] = useState(1.0);

    useEffect(() => {
        const initialHealths: { [key: string]: string } = {};
        const initialSicknesses: { [key: string]: string } = {};
        const initialPositions: { [key: string]: { x: string, y: string } } = {};
        const initialCurrencies: { [key: string]: string } = {};
        const initialImprison: { [key: string]: string } = {};
        agents.forEach(agent => {
            initialHealths[agent.id] = String(agent.health);
            initialSicknesses[agent.id] = agent.sickness || '';
            initialPositions[agent.id] = { x: String(agent.x), y: String(agent.y) };
            initialCurrencies[agent.id] = String(agent.currency);
            initialImprison[agent.id] = '20';
        });
        setAgentHealthInputs(initialHealths);
        setAgentSicknessInputs(initialSicknesses);
        setAgentPositionInputs(initialPositions);
        setAgentCurrencyInputs(initialCurrencies);
        setAgentImprisonInputs(initialImprison);
        setSelectedLeaderId(government.leaderId || '');
    }, [agents, government]);

    const handleHealthInputChange = (agentId: string, value: string) => setAgentHealthInputs(p => ({ ...p, [agentId]: value }));
    const handleSicknessInputChange = (agentId: string, value: string) => setAgentSicknessInputs(p => ({ ...p, [agentId]: value }));
    const handleCurrencyInputChange = (agentId: string, value: string) => setAgentCurrencyInputs(p => ({ ...p, [agentId]: value }));
    const handlePositionInputChange = (agentId: string, axis: 'x' | 'y', value: string) => setAgentPositionInputs(p => ({ ...p, [agentId]: { ...p[agentId], [axis]: value } }));
    const handleImprisonInputChange = (agentId: string, value: string) => setAgentImprisonInputs(p => ({ ...p, [agentId]: value }));

    const handleSetHealth = (agentId: string) => onSetAgentHealth(agentId, parseInt(agentHealthInputs[agentId], 10));
    const handleSetSickness = (agentId: string) => onInflictSickness(agentId, agentSicknessInputs[agentId].trim() || null);
    const handleSetCurrency = (agentId: string) => onSetAgentCurrency(agentId, parseInt(agentCurrencyInputs[agentId], 10));
    const handleSetPosition = (agentId: string) => onSetAgentPosition(agentId, parseInt(agentPositionInputs[agentId].x, 10), parseInt(agentPositionInputs[agentId].y, 10));
    const handleImprison = (agentId: string) => onImprisonAgent(agentId, parseInt(agentImprisonInputs[agentId], 10));

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

    const handleSendBroadcast = () => {
        if (broadcastTitle.trim() && broadcastContent.trim()) {
            onCreateBroadcast({
                title: broadcastTitle,
                content: broadcastContent,
                targetBelief: broadcastTarget,
                influenceDelta: broadcastInfluence,
                truthfulness: broadcastTruth,
            });
            setBroadcastTitle('');
            setBroadcastContent('');
        }
    };

    const beliefKeys = ['progress_good', 'nature_good', 'wealth_is_power', 'community_first', 'tradition_important', 'knowledge_is_sacred', 'law_is_absolute', 'aggression', 'immorality_ok'];

    return (
        <div className="bg-slate-850 p-4 rounded-lg border border-red-500/30 space-y-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5"/>
                {t('admin_title')}
            </h2>

             {/* Media Management */}
            <div className="space-y-3">
                <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2"><Megaphone className="w-5 h-5 text-emerald-400"/>{t('admin_mediaManagement')}</h3>
                <div className="text-sm space-y-3 bg-slate-900/50 p-3 rounded-lg">
                    <input type="text" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} placeholder={t('admin_broadcast_title_label')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                    <textarea value={broadcastContent} onChange={e => setBroadcastContent(e.target.value)} placeholder={t('admin_broadcast_content_label')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" rows={3}/>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">{t('admin_broadcast_target_belief_label')}</label>
                        <select value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs">
                            {beliefKeys.map(key => <option key={key} value={key}>{key}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">{t('admin_broadcast_influence_label')}: {broadcastInfluence.toFixed(2)}</label>
                        <input type="range" min="-1" max="1" step="0.05" value={broadcastInfluence} onChange={e => setBroadcastInfluence(parseFloat(e.target.value))} className="w-full" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">{t('admin_broadcast_truthfulness_label')}: {broadcastTruth.toFixed(2)}</label>
                        <input type="range" min="0" max="1" step="0.05" value={broadcastTruth} onChange={e => setBroadcastTruth(parseFloat(e.target.value))} className="w-full" />
                    </div>
                    <button onClick={handleSendBroadcast} className="w-full text-xs py-1.5 bg-sky-600 hover:bg-sky-500 rounded">{t('admin_broadcast_send_btn')}</button>
                </div>
            </div>

            {/* Political Management */}
            <div className="space-y-3">
                <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2"><Gavel className="w-5 h-5 text-emerald-400"/>{t('admin_politicalManagement')}</h3>
                <div className="text-sm space-y-2 bg-slate-900/50 p-3 rounded-lg">
                    <p>{t('admin_currentLeader')}: <span className="font-bold">{agents.find(a=>a.id === government.leaderId)?.name || 'None'}</span></p>
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedLeaderId}
                            onChange={e => setSelectedLeaderId(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs"
                        >
                            <option value="">{t('admin_selectAgent')}</option>
                            {agents.filter(a => !a.adminAgent).map(agent => (
                                <option key={agent.id} value={agent.id}>{agent.name}</option>
                            ))}
                        </select>
                        <button onClick={() => onSetLeader(selectedLeaderId)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md whitespace-nowrap">{t('admin_setLeader')}</button>
                    </div>
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
                     <div key={culture.id} className="text-sm space-y-2 bg-slate-900/50 p-3 rounded-lg">
                         <h4 className="font-bold">{culture.name}</h4>
                         <p className="text-xs text-slate-400">{t('admin_researchPoints')}: {culture.researchPoints.toFixed(0)}</p>
                         <div>
                            <h5 className="text-xs font-semibold my-1">{t('agentCard_tech')}</h5>
                             {techTree.map(tech => {
                                 const isKnown = culture.knownTechnologies.includes(tech.id);
                                 return (
                                     <div key={tech.id} className="flex justify-between items-center text-xs p-1">
                                         <span className={isKnown ? 'text-green-400' : 'text-slate-400'}>{t(`tech_${tech.id}` as any) || tech.name}</span>
                                         {!isKnown && (
                                             <button onClick={() => onUnlockTech(culture.id, tech.id)} className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-0.5 px-2 rounded-md">{t('admin_unlock')}</button>
                                         )}
                                     </div>
                                 )
                             })}
                         </div>
                     </div>
                 ))}
            </div>

            {/* Agent Management */}
            <div className="space-y-3">
                <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2"><Users className="w-5 h-5 text-emerald-400"/>{t('admin_agentManagement')}</h3>
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
                                    <label className="text-slate-400 w-20 flex items-center gap-1"><HeartPulse className="w-3 h-3" /> {t('agentCard_health')}:</label>
                                    <input type="number" value={agentHealthInputs[agent.id] || ''} onChange={e => handleHealthInputChange(agent.id, e.target.value)} className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    <button onClick={() => handleSetHealth(agent.id)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md">{t('admin_set')}</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-slate-400 w-20">{t('agentCard_sickness')}:</label>
                                    <input type="text" placeholder={t('admin_sicknessPlaceholder')} value={agentSicknessInputs[agent.id] || ''} onChange={e => handleSicknessInputChange(agent.id, e.target.value)} className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    <button onClick={() => handleSetSickness(agent.id)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md">{t('admin_set')}</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-slate-400 w-20 flex items-center gap-1"><MapPin className="w-3 h-3"/> Pos:</label>
                                    <input type="number" value={agentPositionInputs[agent.id]?.x || ''} onChange={e => handlePositionInputChange(agent.id, 'x', e.target.value)} className="w-1/2 bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    <input type="number" value={agentPositionInputs[agent.id]?.y || ''} onChange={e => handlePositionInputChange(agent.id, 'y', e.target.value)} className="w-1/2 bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    <button onClick={() => handleSetPosition(agent.id)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md">{t('admin_set')}</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-slate-400 w-20">{t('admin_imprisonDuration')}:</label>
                                    <input type="number" value={agentImprisonInputs[agent.id] || ''} onChange={e => handleImprisonInputChange(agent.id, e.target.value)} className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    <button onClick={() => handleImprison(agent.id)} className="bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold py-1 px-3 rounded-md">{t('admin_imprison')}</button>
                                </div>
                            </>)}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* World Rule Editor */}
            <div className="space-y-3">
                <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2"><Settings className="w-5 h-5 text-emerald-400"/>{t('admin_ruleEditor')}</h3>
                <div className="text-sm space-y-4 bg-slate-900/50 p-3 rounded-lg">
                    <EnvironmentEditor environment={environment} onSave={onUpdateEnvironment} />
                    <ActionEditor actions={actions} onUpdate={onUpdateAction} />
                </div>
            </div>
        </div>
    );
};
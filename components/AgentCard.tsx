
import React, { useState } from 'react';
import type { Agent, Culture, Religion, ResourceType } from '../types';
import { BeliefsChart } from './BeliefsChart';
import { BrainCircuit, MessageSquare, Sparkles, Send, HeartPulse, Skull, MapPin, Dna, GitCommitHorizontal, User, Users, Heart, BookText, Globe, GitBranch, Award, Church, PersonStanding, Baby, CookingPot, GlassWater, Bed, Apple, Droplet, Log, PlusSquare, Boxes as InventoryIcon } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';
import { CHILDHOOD_MAX_AGE, ADOLESCENCE_MAX_AGE, ADULTHOOD_MAX_AGE } from '../constants';

interface AgentCardProps {
    agent: Agent;
    allAgents: Agent[];
    cultures: Culture[];
    religions: Religion[];
    onPrompt: (agentId: string, prompt: string, useAi: boolean) => void;
}

const getHealthColor = (health: number) => {
    if (health < 30) return 'bg-red-500';
    if (health < 70) return 'bg-yellow-500';
    return 'bg-green-500';
};

const getNeedColor = (need: number) => {
    if (need > 75) return 'bg-red-500';
    if (need > 40) return 'bg-yellow-500';
    return 'bg-green-500';
}

const getRelationshipColor = (type: string) => {
    switch (type) {
        case 'spouse':
        case 'partner':
            return 'bg-pink-500';
        case 'friend':
            return 'bg-emerald-500';
        case 'rival':
            return 'bg-red-500';
        case 'ex-partner':
            return 'bg-slate-500';
        default:
            return 'bg-sky-500';
    }
};

const getLifeStage = (age: number, t: (key: any) => string) => {
    if (age <= CHILDHOOD_MAX_AGE) return { name: t('lifeStage_child'), Icon: Baby };
    if (age <= ADOLESCENCE_MAX_AGE) return { name: t('lifeStage_adolescent'), Icon: User };
    if (age <= ADULTHOOD_MAX_AGE) return { name: t('lifeStage_adult'), Icon: PersonStanding };
    return { name: t('lifeStage_elder'), Icon: PersonStanding };
};

const InfoRow: React.FC<{icon: React.ElementType, label: string, value: string | React.ReactNode}> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 w-28 text-slate-400">
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </div>
        <div className="text-slate-200 font-medium">{value}</div>
    </div>
);

const resourceIcons: { [key in ResourceType]: React.ElementType } = {
    food: Apple,
    water: Droplet,
    wood: Log,
    medicine: PlusSquare,
};


export const AgentCard: React.FC<AgentCardProps> = ({ agent, allAgents, cultures, religions, onPrompt }) => {
    const [prompt, setPrompt] = useState('');
    const [useAi, setUseAi] = useState(true);
    const t = useTranslations();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onPrompt(agent.id, prompt, useAi);
            setPrompt('');
        }
    };

    const beliefData = Object.entries(agent.beliefNetwork || {}).map(([name, value]) => ({ name, value }));
    const resonanceData = Object.entries(agent.resonance || {}).map(([name, value]) => ({ name, value }));
    const emotionData = Object.entries(agent.emotions || {}).map(([name, value]) => ({ name, value }));
    const relationshipEntries = agent.relationships ? Object.entries(agent.relationships) : [];
    const socialMemoryEntries = agent.socialMemory || [];
    const inventoryEntries = agent.inventory ? Object.entries(agent.inventory) : [];
    const agentCulture = cultures.find(c => c.id === agent.cultureId);
    const agentReligion = religions.find(r => r.id === agent.religionId);
    const lifeStage = getLifeStage(agent.age, t);

    return (
        <div className={`bg-slate-850 p-4 rounded-lg border border-slate-700 space-y-4 relative ${!agent.isAlive ? 'saturate-50' : ''}`}>
            {!agent.isAlive && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg">
                    <Skull className="w-16 h-16 text-slate-400 mb-2" />
                    <p className="text-xl font-bold text-slate-300 tracking-widest">{t('agentCard_deceased')}</p>
                </div>
            )}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <User className="w-6 h-6 text-sky-400"/>
                        {agent.name}
                    </h2>
                    <p className="text-sm text-slate-400">{agent.description}</p>
                     <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                         <div className="flex items-center gap-1">
                           <MapPin className="w-3 h-3" />
                           <span>({agent.x}, {agent.y})</span>
                        </div>
                         <div className="flex items-center gap-1">
                           <Users className="w-3 h-3" />
                           <span>{t('agentCard_offspring')}: {agent.offspringCount}</span>
                        </div>
                        {agent.adminAgent && <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">Admin</span>}
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                 <InfoRow icon={lifeStage.Icon} label={t('agentCard_lifeStage')} value={`${lifeStage.name} (${t('agentCard_age')} ${agent.age.toFixed(1)})`} />
                 <InfoRow icon={Award} label={t('agentCard_role')} value={agent.role ? t(`role_${agent.role.toLowerCase()}` as any) : t('role_none')} />
                 <InfoRow icon={Globe} label={t('agentCard_culture')} value={agentCulture?.name || t('culture_none')} />
                 <InfoRow icon={Church} label={t('agentCard_religion')} value={agentReligion?.name || t('religion_none')} />
            </div>

            <div className="space-y-3">
                 <h3 className="text-md font-semibold text-slate-300 flex items-center gap-2"><HeartPulse className="w-5 h-5 text-red-400"/> {t('agentCard_status')}</h3>
                 <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2" title={`${t('agentCard_health')}`}>
                        <HeartPulse className="w-4 h-4 text-slate-400"/>
                        <div className="w-full bg-slate-700 rounded-full h-2.5 border border-slate-900/50">
                            <div className={`h-full rounded-full transition-all duration-500 ${getHealthColor(agent.health)}`} style={{ width: `${agent.health}%` }}></div>
                        </div>
                        <span className="font-mono text-xs w-14 text-right">{agent.health.toFixed(0)} / 100</span>
                    </div>
                     <div className="flex items-center gap-2" title={`${t('agentCard_hunger')}`}>
                        <CookingPot className="w-4 h-4 text-slate-400"/>
                        <div className="w-full bg-slate-700 rounded-full h-2.5 border border-slate-900/50">
                            <div className={`h-full rounded-full transition-all duration-500 ${getNeedColor(agent.hunger)}`} style={{ width: `${100 - agent.hunger}%` }}></div>
                        </div>
                        <span className="font-mono text-xs w-14 text-right">{agent.hunger.toFixed(0)} / 100</span>
                    </div>
                     <div className="flex items-center gap-2" title={`${t('agentCard_thirst')}`}>
                        <GlassWater className="w-4 h-4 text-slate-400"/>
                        <div className="w-full bg-slate-700 rounded-full h-2.5 border border-slate-900/50">
                            <div className={`h-full rounded-full transition-all duration-500 ${getNeedColor(agent.thirst)}`} style={{ width: `${100 - agent.thirst}%` }}></div>
                        </div>
                        <span className="font-mono text-xs w-14 text-right">{agent.thirst.toFixed(0)} / 100</span>
                    </div>
                      <div className="flex items-center gap-2" title={`${t('agentCard_fatigue')}`}>
                        <Bed className="w-4 h-4 text-slate-400"/>
                        <div className="w-full bg-slate-700 rounded-full h-2.5 border border-slate-900/50">
                            <div className={`h-full rounded-full transition-all duration-500 ${getNeedColor(agent.fatigue)}`} style={{ width: `${100 - agent.fatigue}%` }}></div>
                        </div>
                        <span className="font-mono text-xs w-14 text-right">{agent.fatigue.toFixed(0)} / 100</span>
                    </div>
                    <div className="flex items-center gap-2 pl-1">
                         <span className="font-medium text-slate-400 w-24">{t('agentCard_sickness')}:</span>
                         {agent.sickness ? <span className="font-mono bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded text-xs">{agent.sickness}</span> : <span className="text-slate-400">{t('agentCard_healthy')}</span>}
                    </div>
                 </div>
            </div>

             <div className="space-y-3">
                <h3 className="text-md font-semibold text-slate-300 flex items-center gap-2"><Dna className="w-5 h-5 text-cyan-400"/> {t('agentCard_genome')}</h3>
                 {agent.genome && agent.genome.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {agent.genome.map(gene => (
                            <span key={gene} className="text-xs font-mono bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">{gene}</span>
                        ))}
                    </div>
                ) : <p className="text-slate-500 text-sm">{t('agentCard_noGenome')}</p>}
            </div>

            <div>
                <h3 className="text-md font-semibold mb-2 text-slate-300 flex items-center gap-2">
                    <InventoryIcon className="w-5 h-5 text-yellow-400"/>
                    {t('agentCard_inventory')}
                </h3>
                 {inventoryEntries.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {inventoryEntries.map(([type, quantity]) => {
                             const Icon = resourceIcons[type as ResourceType] || InventoryIcon;
                             if(quantity <= 0) return null;
                             return (
                                <div key={type} className="bg-slate-700/50 p-2 rounded-md flex items-center gap-2">
                                     <Icon className="w-5 h-5 text-yellow-300" />
                                     <div className="flex flex-col">
                                         <span className="font-semibold text-slate-200 capitalize">{t(`resource_${type}` as any)}</span>
                                         <span className="text-slate-400 text-xs">x {quantity}</span>
                                     </div>
                                </div>
                            );
                        })}
                    </div>
                ) : <p className="text-slate-500 text-sm">{t('agentCard_noInventory')}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="text-md font-semibold mb-2 text-slate-300 flex items-center gap-2"><BrainCircuit className="w-4 h-4" />{t('agentCard_beliefs')}</h3>
                    <div className="h-40 bg-slate-900/50 p-2 rounded-md">
                        {beliefData.length > 0 ? <BeliefsChart data={beliefData} barColor="#38bdf8" keyPrefix="belief_" /> : <p className="text-center text-slate-500 text-sm pt-12">{t('agentCard_noBeliefs')}</p>}
                    </div>
                </div>
                <div>
                    <h3 className="text-md font-semibold mb-2 text-slate-300 flex items-center gap-2"><Heart className="w-4 h-4" />{t('agentCard_emotions')}</h3>
                    <div className="h-40 bg-slate-900/50 p-2 rounded-md">
                        {emotionData.length > 0 ? <BeliefsChart data={emotionData} barColor="#f472b6" keyPrefix="emotion_" /> : <p className="text-center text-slate-500 text-sm pt-12">{t('agentCard_noEmotions')}</p>}
                    </div>
                </div>
                 <div>
                    <h3 className="text-md font-semibold mb-2 text-slate-300 flex items-center gap-2"><GitCommitHorizontal className="w-4 h-4" />{t('agentCard_resonance')}</h3>
                    <div className="h-40 bg-slate-900/50 p-2 rounded-md">
                        {resonanceData.length > 0 ? <BeliefsChart data={resonanceData} barColor="#34d399" /> : <p className="text-center text-slate-500 text-sm pt-12">{t('agentCard_noResonance')}</p>}
                    </div>
                </div>
                <div>
                    <h3 className="text-md font-semibold mb-2 text-slate-300 flex items-center gap-2"><Users className="w-4 h-4" />{t('agentCard_relationships')}</h3>
                    <ul className="space-y-1 text-sm h-40 overflow-y-auto pr-2">
                        {relationshipEntries.length > 0 ? relationshipEntries.sort(([, a], [, b]) => b.score - a.score).map(([agentId, relationship]) => {
                                const otherAgent = allAgents.find(a => a.id === agentId);
                                if (!otherAgent) return null;
                                return (
                                    <li key={agentId} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-md text-xs">
                                        <div className='flex flex-col'>
                                            <span className="text-slate-200 font-semibold">{otherAgent.name}</span>
                                            <span className="text-slate-400 capitalize">{t(`relationship_${relationship.type}` as any)}</span>
                                        </div>
                                        <div className="w-1/2 bg-slate-800 rounded-full h-2.5">
                                            <div className={`${getRelationshipColor(relationship.type)} h-2.5 rounded-full`} style={{width: `${relationship.score}%`}}></div>
                                        </div>
                                    </li>
                                )
                            }) : <li className="text-slate-500 text-sm p-1">{t('agentCard_noRelationships')}</li>}
                    </ul>
                </div>
            </div>

             <div>
                <h3 className="text-md font-semibold mb-2 text-slate-300 flex items-center gap-2">
                    <GitBranch className="w-5 h-5"/>
                    {t('agentCard_dispositions')}
                </h3>
                 <div className="space-y-2 text-sm h-40 overflow-y-auto pr-2">
                     {relationshipEntries.length > 0 ? relationshipEntries.map(([agentId, relationship]) => {
                         const otherAgent = allAgents.find(a => a.id === agentId);
                         if (!otherAgent || !relationship.disposition) return null;
                         const dispositionData = Object.entries(relationship.disposition).map(([name, value]) => ({ name, value }));

                         return (
                            <div key={agentId} className="bg-slate-900/50 p-2 rounded-md">
                                <p className="text-xs text-slate-300 font-semibold mb-1">vs. {otherAgent.name}</p>
                                <div className="h-20">
                                   <BeliefsChart data={dispositionData} barColor="#a78bfa" keyPrefix="emotion_" />
                                </div>
                            </div>
                         )
                     }) : <p className="text-slate-500 text-sm">{t('agentCard_noDispositions')}</p>}
                 </div>
            </div>

            <div>
                <h3 className="text-md font-semibold mb-2 text-slate-300 flex items-center gap-2">
                    <BookText className="w-5 h-5"/>
                    {t('agentCard_socialMemory')}
                </h3>
                <ul className="space-y-1 text-sm h-28 overflow-y-auto pr-2 mb-4">
                    {socialMemoryEntries.length > 0 ? socialMemoryEntries.map((memory, index) => {
                        const otherAgent = allAgents.find(a => a.id === memory.agentId);
                        if (!otherAgent) return null;
                        const impactColor = memory.emotionalImpact > 0 ? 'text-emerald-400' : 'text-red-400';
                        return (
                             <li key={index} className="bg-slate-700/50 p-2 rounded-md text-slate-300 text-xs truncate flex justify-between items-center">
                                <span>With <span className='font-bold'>{otherAgent.name}</span>: '{memory.action}' was <span className='font-semibold'>{memory.result}</span>.</span>
                                <span className={impactColor}>{memory.emotionalImpact > 0 ? '▲' : '▼'} {Math.abs(memory.emotionalImpact).toFixed(1)}</span>
                            </li>
                        )
                    }) : <li className="text-slate-500 text-sm">{t('agentCard_noSocialMemory')}</li>}
                </ul>
            </div>

            <div>
                 <h3 className="text-md font-semibold mb-2 text-slate-300 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5"/>
                    {t('agentCard_lastActions')}
                </h3>
                 <ul className="space-y-1 text-sm h-28 overflow-y-auto pr-2 mb-4">
                        {agent.lastActions.length > 0 ? agent.lastActions.map((action, index) => (
                            <li key={index} className="bg-slate-700/50 p-2 rounded-md text-slate-300 text-xs truncate">
                                {action.name}
                            </li>
                        )) : <li className="text-slate-500 text-sm">{t('agentCard_noActions')}</li>}
                    </ul>
            </div>

            <div>
                <h3 className="text-md font-semibold mb-2 text-slate-300 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5"/>
                    {t('agentCard_interact')}
                </h3>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={!agent.isAlive ? t('agentCard_promptPlaceholderDeceased', { name: agent.name }) : (useAi ? t('agentCard_promptPlaceholder', { name: agent.name }) : t('agentCard_promptPlaceholderRaw'))}
                        className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition disabled:cursor-not-allowed"
                        disabled={!agent.isAlive}
                    />
                    <button type="submit" className="bg-sky-600 hover:bg-sky-500 rounded-md px-4 py-2 text-white font-semibold transition flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed" disabled={!agent.isAlive || !prompt.trim()}>
                       <Send className="w-4 h-4" />
                    </button>
                </form>
                 <div className="mt-2 flex items-center justify-end text-slate-500 text-xs gap-2 cursor-pointer select-none" onClick={() => setUseAi(!useAi)}>
                    <Sparkles className={`w-4 h-4 transition-colors ${useAi ? 'text-sky-400' : 'text-slate-500'}`} />
                    <span className={`transition-colors ${useAi ? 'text-slate-300' : 'text-slate-500'}`}>{t('agentCard_useAi')}</span>
                    <div className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${useAi ? 'bg-sky-500' : 'bg-slate-600'}`}>
                        <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${useAi ? 'translate-x-5' : ''}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
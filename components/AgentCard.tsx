import React, { useState } from 'react';
import type { Agent, Goal, Trauma, Entity, Relationship, Psyche, JailJournalEntry } from '../types';
import { BeliefsChart } from './BeliefsChart';
import { BrainCircuit, MessageSquare, Sparkles, Send, HeartPulse, Skull, MapPin, Dna, User, Users, Heart, BookText, Globe, Award, Church, PersonStanding, Baby, CookingPot, GlassWater, Bed, Apple, Droplet, Log, PlusSquare, Boxes, CircleDollarSign, BookOpenCheck, Gavel, Hammer, ClipboardList, TrendingUp, ShieldAlert, Smile, Activity, Home, Briefcase, History, Notebook } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';
import { CHILDHOOD_MAX_AGE, ADOLESCENCE_MAX_AGE, ADULTHOOD_MAX_AGE } from '../constants';

interface AgentCardProps {
    agent: Agent;
    allAgents: Agent[];
    entities: Entity[];
    cultureName: string;
    religionName: string;
    leaderName: string;
    onPrompt: (agentId: string, prompt: string, useAi: boolean) => void;
    onGeneratePsychoanalysis: (agent: Agent) => void;
}

const getHealthColor = (health: number) => {
    if (health < 30) return 'bg-red-500';
    if (health < 70) return 'bg-yellow-500';
    return 'bg-green-500';
};

const getNeedColor = (value: number) => {
    if (value > 80) return 'text-red-400';
    if (value > 50) return 'text-yellow-400';
    return 'text-slate-300';
}

const Stat: React.FC<{ icon: React.ReactNode, label: string, value: React.ReactNode, className?: string }> = ({ icon, label, value, className }) => (
    <div className={`flex items-center justify-between text-sm ${className}`}>
        <div className="flex items-center gap-2 text-slate-400">
            {icon}
            <span>{label}</span>
        </div>
        <span className="font-mono text-slate-200">{value}</span>
    </div>
);

const Pill: React.FC<{ children: React.ReactNode, color?: string, title?: string }> = ({ children, color = 'bg-slate-700', title }) => (
    <span title={title} className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>{children}</span>
);

const AgentCardComponent: React.FC<AgentCardProps> = ({ agent, allAgents, entities, cultureName, religionName, leaderName, onPrompt, onGeneratePsychoanalysis }) => {
    const [prompt, setPrompt] = useState('');
    const [useAi, setUseAi] = useState(true);
    const t = useTranslations();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !agent.isAlive) return;
        onPrompt(agent.id, prompt, useAi);
        setPrompt('');
    };
    
    const getLifeStage = (age: number) => {
        if (age <= CHILDHOOD_MAX_AGE) return t('lifeStage_child');
        if (age <= ADOLESCENCE_MAX_AGE) return t('lifeStage_adolescent');
        if (age <= ADULTHOOD_MAX_AGE) return t('lifeStage_adult');
        return t('lifeStage_elder');
    };

    const emotionData = Object.entries(agent.emotions || {}).map(([name, value]) => ({ name, value }));
    const beliefData = Object.entries(agent.beliefNetwork || {}).map(([name, value]) => ({ name, value }));
    const skillsData = Object.entries(agent.skills || {}).map(([name, value]) => ({ name, value: value / 100 })); // normalize for chart
    const personalityData = Object.entries(agent.personality || {}).map(([name, value]) => ({ name, value }));
    const psycheData = Object.entries(agent.psyche || {}).map(([name, value]) => ({ name, value }));
    const inventoryItems = Object.entries(agent.inventory || {}).filter(([,qty]) => qty > 0);
    const relationships = Object.entries(agent.relationships || {});
    const ownedEntities = entities.filter(e => e.ownerId === agent.id);

    const getRelationshipColor = (type: Relationship['type']) => {
        switch (type) {
            case 'spouse': return 'text-pink-400';
            case 'friend': return 'text-green-400';
            case 'rival': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };
    
    const getItemIcon = (item: string) => {
      switch (item) {
        case 'food': return <Apple className="w-4 h-4 text-green-400"/>;
        case 'local_produce': return <Apple className="w-4 h-4 text-green-400"/>;
        case 'water': return <Droplet className="w-4 h-4 text-blue-400"/>;
        case 'wood': return <Log className="w-4 h-4 text-yellow-700"/>;
        case 'iron': return <Hammer className="w-4 h-4 text-slate-500"/>;
        case 'medicine': return <PlusSquare className="w-4 h-4 text-red-400" />;
        case 'sword': return <Briefcase className="w-4 h-4 text-gray-400"/>;
        case 'plow': return <Briefcase className="w-4 h-4 text-orange-400"/>;
        case 'advanced_medicine': return <PlusSquare className="w-4 h-4 text-pink-400"/>;
        case 'iron_ingot': return <Boxes className="w-4 h-4 text-slate-400" />;
        default: return <Boxes className="w-4 h-4 text-slate-400"/>;
      }
    };
    
    const getGoalIcon = (goalType: Goal['type']) => {
        switch (goalType) {
            case 'becomeLeader': return <Award className="w-4 h-4 text-yellow-400" />;
            case 'buildLargeHouse': return <Home className="w-4 h-4 text-green-400" />;
            case 'masterSkill': return <TrendingUp className="w-4 h-4 text-sky-400" />;
            case 'avengeRival': return <ShieldAlert className="w-4 h-4 text-red-400" />;
            case 'achieveWealth': return <CircleDollarSign className="w-4 h-4 text-emerald-400" />;
            case 'mentorYoungAgent': return <Users className="w-4 h-4 text-purple-400" />;
            case 'seekCounseling': return <Heart className="w-4 h-4 text-pink-400" />;
            default: return <ClipboardList className="w-4 h-4 text-slate-400" />;
        }
    }

    return (
        <div className="bg-slate-850 p-4 rounded-lg border border-slate-700 max-h-[calc(100vh-16rem)] overflow-y-auto">
            <div className="flex items-start gap-4 mb-4">
                 <div className="flex-shrink-0">
                    {agent.isAlive ? <User className="w-16 h-16 text-sky-300" /> : <Skull className="w-16 h-16 text-slate-600"/>}
                 </div>
                <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-slate-100">{agent.name}</h2>
                    <p className="text-sm text-slate-400 italic mt-1">{agent.description}</p>
                </div>
                <button
                    onClick={() => onGeneratePsychoanalysis(agent)}
                    className="flex-shrink-0 bg-sky-600/50 hover:bg-sky-500/50 text-sky-200 font-semibold py-2 px-3 rounded-md transition-colors text-sm flex items-center gap-2"
                    title={t('psychoanalysis_generate_button')}
                    >
                    <BrainCircuit className="w-4 h-4" />
                    <span>{t('psychoanalysis_generate_button')}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Column 1: Core Stats, Needs, Property */}
                <div className="space-y-4">
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                        <h3 className="text-md font-semibold text-slate-100 mb-3 flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-400"/> {t('agentCard_statusAndNeeds')}</h3>
                         {agent.isAlive ? (
                            <div className="space-y-2">
                                <Stat icon={<PersonStanding className="w-4 h-4"/>} label={t('agentCard_lifeStage')} value={`${getLifeStage(agent.age)} (${t('agentCard_age')}: ${agent.age.toFixed(1)})`} />
                                <Stat icon={<Globe className="w-4 h-4"/>} label={t('agentCard_culture')} value={cultureName} />
                                <Stat icon={<Church className="w-4 h-4"/>} label={t('agentCard_religion')} value={religionName} />
                                <Stat icon={<Briefcase className="w-4 h-4"/>} label={t('agentCard_role')} value={t(`role_${agent.role?.toLowerCase()}` as any) || t('role_none')} />
                                <Stat icon={<Award className="w-4 h-4"/>} label={t('world_leader')} value={leaderName} />
                                <div className="pt-2 mt-2 border-t border-slate-700/50 space-y-2">
                                  <Stat icon={<HeartPulse className="w-4 h-4"/>} label={t('agentCard_health')} value={<span className="font-bold">{agent.health.toFixed(0)}/100</span>} />
                                  <Stat icon={<CookingPot className="w-4 h-4"/>} label={t('agentCard_hunger')} value={<span className={getNeedColor(agent.hunger)}>{agent.hunger.toFixed(0)}/100</span>} />
                                  <Stat icon={<GlassWater className="w-4 h-4"/>} label={t('agentCard_thirst')} value={<span className={getNeedColor(agent.thirst)}>{agent.thirst.toFixed(0)}/100</span>} />
                                  <Stat icon={<Bed className="w-4 h-4"/>} label={t('agentCard_fatigue')} value={<span className={getNeedColor(agent.fatigue)}>{agent.fatigue.toFixed(0)}/100</span>} />
                                  <Stat icon={<ShieldAlert className="w-4 h-4"/>} label={t('agentCard_stress')} value={<span className={getNeedColor(agent.stress)}>{agent.stress.toFixed(0)}/100</span>} />
                                  <Stat icon={<TrendingUp className="w-4 h-4"/>} label={t('agentCard_socialStatus')} value={agent.socialStatus.toFixed(0)} />
                                  <Stat icon={<CircleDollarSign className="w-4 h-4"/>} label={t('agentCard_currency')} value={`${agent.currency}$`} />
                                  <Stat icon={<PlusSquare className="w-4 h-4"/>} label={t('agentCard_sickness')} value={agent.sickness || t('agentCard_healthy')} />
                                </div>
                                {agent.imprisonedUntil && (
                                    <div className="!mt-4 bg-red-900/50 p-2 rounded-md text-center text-red-300">
                                        <p className="font-bold">{t('agentCard_imprisoned')}</p>
                                        <p className="text-xs">{t('agentCard_release_at')} {agent.imprisonedUntil}</p>
                                    </div>
                                )}
                            </div>
                         ) : (
                             <p className="text-center text-red-400 font-bold py-4">{t('agentCard_deceased')}</p>
                         )}
                    </div>
                     <div className="bg-slate-900/50 p-3 rounded-lg">
                        <h3 className="text-md font-semibold text-slate-100 mb-3 flex items-center gap-2"><Dna className="w-5 h-5 text-emerald-400"/>{t('agentCard_genome')}</h3>
                        {agent.genome.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {agent.genome.map(gene => <Pill key={gene} color="bg-cyan-800" title={t(`gene_desc_${gene}` as any)}>{t(`gene_${gene}` as any)}</Pill>)}
                            </div>
                        ) : <p className="text-sm text-slate-400">{t('agentCard_noGenome')}</p>}
                    </div>
                </div>

                {/* Column 2: Personality & Psyche */}
                <div className="space-y-4">
                     <div className="bg-slate-900/50 p-3 rounded-lg h-60">
                         <h3 className="text-md font-semibold text-slate-100 mb-3 flex items-center gap-2"><Smile className="w-5 h-5 text-emerald-400"/>{t('agentCard_personality')}</h3>
                        <BeliefsChart data={personalityData} barColor="#2dd4bf" keyPrefix="personality_" />
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg h-60">
                         <h3 className="text-md font-semibold text-slate-100 mb-3 flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-emerald-400"/>{t('psyche_title')}</h3>
                        <BeliefsChart data={psycheData} barColor="#f472b6" keyPrefix="psyche_" />
                    </div>
                </div>

                {/* Column 3: Skills, Inventory, Social */}
                <div className="space-y-4">
                    <div className="bg-slate-900/50 p-3 rounded-lg h-60">
                         <h3 className="text-md font-semibold text-slate-100 mb-3 flex items-center gap-2"><BookOpenCheck className="w-5 h-5 text-emerald-400"/>{t('agentCard_skills')}</h3>
                        <BeliefsChart data={skillsData} barColor="#67e8f9" keyPrefix="skill_" />
                    </div>
                     <div className="bg-slate-900/50 p-3 rounded-lg">
                        <h3 className="text-md font-semibold text-slate-100 mb-3 flex items-center gap-2"><Boxes className="w-5 h-5 text-emerald-400"/>{t('agentCard_inventory')}</h3>
                        {inventoryItems.length > 0 ? (
                            <ul className="space-y-1">
                                {inventoryItems.map(([item, qty]) => {
                                    // Handle potentially prefixed item keys from AI generation, e.g. "item_food" vs "food"
                                    const itemKey = item.startsWith('item_') ? item.substring(5) : item;
                                    return (
                                        <li key={item} className="flex items-center gap-2 text-sm">
                                            {getItemIcon(itemKey)}
                                            <span>{t(`item_${itemKey}` as any) || itemKey}</span>
                                            <span className="ml-auto font-mono text-slate-300">{qty}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : <p className="text-sm text-slate-400">{t('agentCard_noInventory')}</p>}
                    </div>
                </div>

                {/* Column 4: Relationships, Goals, Memory */}
                <div className="space-y-4">
                     <div className="bg-slate-900/50 p-3 rounded-lg">
                         <h3 className="text-md font-semibold text-slate-100 mb-3 flex items-center gap-2"><Users className="w-5 h-5 text-emerald-400"/>{t('agentCard_relationships')}</h3>
                         {relationships.length > 0 ? (
                            <ul className="space-y-2 max-h-24 overflow-y-auto pr-2">
                                {relationships.map(([id, rel]) => (
                                    <li key={id} className="text-sm">
                                        <div className="flex justify-between items-center">
                                            <span>{allAgents.find(a => a.id === id)?.name || 'Unknown'}</span>
                                            <span className={getRelationshipColor(rel.type)}>{t(`relationship_${rel.type}` as any)} ({rel.score.toFixed(0)})</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                         ) : <p className="text-sm text-slate-400">{t('agentCard_noRelationships')}</p>}
                    </div>
                     <div className="bg-slate-900/50 p-3 rounded-lg">
                        <h3 className="text-md font-semibold text-slate-100 mb-3 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-emerald-400"/>{t('agentCard_goals')}</h3>
                         {agent.goals.length > 0 ? (
                            <ul className="space-y-2">
                                {agent.goals.map((goal, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        {getGoalIcon(goal.type)}
                                        <div className="flex-grow">
                                          <p className="text-slate-300">{goal.description}</p>
                                          <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                                            <div className="bg-sky-500 h-1.5 rounded-full" style={{width: `${goal.progress}%`}}></div>
                                          </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                         ) : <p className="text-sm text-slate-400">{t('agentCard_noGoals')}</p>}
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                        <h3 className="text-md font-semibold text-slate-100 mb-3 flex items-center gap-2"><History className="w-5 h-5 text-emerald-400"/>{t('agentCard_longTermMemory')}</h3>
                        {(agent.longTermMemory || []).length > 0 ? (
                             <ul className="space-y-1 max-h-24 overflow-y-auto pr-2 text-xs font-mono">
                                {[...agent.longTermMemory].reverse().slice(0, 10).map((mem, i) => (
                                    <li key={i} className="text-slate-400">
                                        <span className="text-slate-500 mr-2">[{mem.timestamp}]</span>
                                        {mem.content}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-slate-400">{t('agentCard_noMemories')}</p>}
                    </div>
                    {agent.imprisonedUntil && (
                        <div className="bg-slate-900/50 p-3 rounded-lg">
                            <h3 className="text-md font-semibold text-slate-100 mb-3 flex items-center gap-2"><Notebook className="w-5 h-5 text-yellow-400"/>{t('agentCard_jailJournal')}</h3>
                            {(agent.jailJournal && agent.jailJournal.length > 0) ? (
                                <div className="space-y-3 max-h-32 overflow-y-auto pr-2 text-xs">
                                    {[...agent.jailJournal].reverse().map((entry, i) => (
                                        <div key={i}>
                                            <p className="text-slate-500 font-mono mb-1">[{t('controlPanel_step')} {entry.timestamp}]</p>
                                            <p className="text-slate-300 whitespace-pre-wrap">{entry.entry}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">{t('agentCard_noJournalEntries')}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Interaction Panel */}
            <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-slate-700/50">
                <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-emerald-400"/> {t('agentCard_interact')}</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={!agent.isAlive}
                        placeholder={
                            !agent.isAlive ? t('agentCard_promptPlaceholderDeceased', { name: agent.name }) :
                            useAi ? t('agentCard_promptPlaceholder', { name: agent.name }) : t('agentCard_promptPlaceholderRaw')
                        }
                        className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!agent.isAlive}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {useAi ? <Sparkles className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                        {t('create_create')}
                    </button>
                </div>
                <div className="flex items-center mt-2">
                    <input type="checkbox" id="use-ai-checkbox" checked={useAi} onChange={e => setUseAi(e.target.checked)} className="h-4 w-4 rounded border-slate-500 text-sky-600 focus:ring-sky-500"/>
                    <label htmlFor="use-ai-checkbox" className="ml-2 block text-sm text-slate-400">{t('agentCard_useAi')}</label>
                </div>
            </form>
        </div>
    );
};

export const AgentCard = React.memo(AgentCardComponent);
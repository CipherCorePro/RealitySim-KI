import React, { useState } from 'react';
import type { Agent, Entity, EnvironmentState } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { BeliefsChart } from './BeliefsChart';
import { 
    MessageSquare, Send, Sparkles, BrainCircuit, Activity, HeartPulse, ShieldAlert, Users,
    CircleDollarSign, Home, Dna, Baby, PersonStanding, Church, Award, MapPin, Skull, Heart, 
    Briefcase, CookingPot, GlassWater, Bed, BookOpenCheck, ClipboardList, TrendingUp, Smile,
    Gavel, Notebook, Download
} from './IconComponents';
import { TranslationKey } from '../translations';
import { CHILDHOOD_MAX_AGE, ADOLESCENCE_MAX_AGE, ADULTHOOD_MAX_AGE } from '../constants';

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; headerActions?: React.ReactNode }> = ({ title, icon, children, headerActions }) => (
    <div className="bg-slate-850 p-3 rounded-lg border border-slate-700 flex flex-col">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-semibold text-slate-100 flex items-center gap-2">
                {icon} {title}
            </h3>
            {headerActions}
        </div>
        <div className="flex-grow">{children}</div>
    </div>
);

const ProgressBar: React.FC<{ value: number; max: number; color: string; label: string }> = ({ value, max, color, label }) => (
    <div>
        <div className="flex justify-between text-xs mb-0.5">
            <span className="text-slate-300">{label}</span>
            <span className="font-mono text-slate-400">{value.toFixed(0)}/{max}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
            <div className={color} style={{ width: `${(value / max) * 100}%`, height: '100%', borderRadius: 'inherit' }}></div>
        </div>
    </div>
);

const DetailItem: React.FC<{ label: string; value: string | React.ReactNode; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-700/50">
        <span className="flex items-center gap-2 text-slate-400">{icon}{label}</span>
        <span className="font-semibold text-right">{value}</span>
    </div>
);

interface AgentCardProps {
    agent: Agent;
    allAgents: Agent[];
    entities: Entity[];
    cultureName: string;
    religionName: string;
    leaderName: string;
    environment: EnvironmentState;
    onPrompt: (agentId: string, prompt: string, useAi: boolean) => void;
    onGeneratePsychoanalysis: (agent: Agent) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, allAgents, entities, cultureName, religionName, leaderName, environment, onPrompt, onGeneratePsychoanalysis }) => {
    const [prompt, setPrompt] = useState('');
    const [useAi, setUseAi] = useState(true);
    const t = useTranslations();

    const getLifeStage = (age: number) => {
        if (age <= CHILDHOOD_MAX_AGE) return t('lifeStage_child');
        if (age <= ADOLESCENCE_MAX_AGE) return t('lifeStage_adolescent');
        if (age <= ADULTHOOD_MAX_AGE) return t('lifeStage_adult');
        return t('lifeStage_elder');
    };

    const handlePromptSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onPrompt(agent.id, prompt, useAi);
            setPrompt('');
        }
    };
    
    const handleDownloadJournal = () => {
        if (!agent.jailJournal || agent.jailJournal.length === 0) return;

        let markdownContent = `# ${t('agentCard_jailJournal')} - ${agent.name}\n\n`;
        [...agent.jailJournal].sort((a,b) => a.timestamp - b.timestamp).forEach(entry => {
            markdownContent += `## ${t('agentCard_release_at')} ${entry.timestamp}\n\n`;
            markdownContent += `${entry.entry}\n\n---\n\n`;
        });
        
        const blob = new Blob([markdownContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${agent.name.replace(/\s/g, '_')}_jail_journal.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const isImprisoned = agent.imprisonedUntil && agent.imprisonedUntil > environment.time;

    return (
        <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 pb-4">
            <div className="text-center bg-slate-850 p-4 rounded-lg border border-slate-700">
                <h2 className="text-2xl font-bold text-sky-300">{agent.name}</h2>
                <p className="text-sm text-slate-400 italic mt-1">{agent.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* --- Column 1: Core Stats & Interaction --- */}
                <div className="space-y-4">
                    <Card title={t('agentCard_statusAndNeeds')} icon={<Activity className="w-5 h-5 text-sky-400"/>}>
                        <div className="space-y-3">
                             <div className="text-center font-bold text-lg p-2 rounded-md bg-slate-900/50">
                                {!agent.isAlive ? <span className="text-red-500">{t('agentCard_deceased')}</span> :
                                isImprisoned ? <span className="text-yellow-400">{t('agentCard_imprisoned')}</span> :
                                <span className="text-green-400">{t('agentCard_healthy')}</span>}
                                {isImprisoned && <p className="text-xs font-normal text-slate-400">{t('agentCard_release_at')} {agent.imprisonedUntil}</p>}
                            </div>
                            <DetailItem label={t('agentCard_age')} value={`${agent.age.toFixed(1)} (${getLifeStage(agent.age)})`} icon={<PersonStanding className="w-4 h-4"/>} />
                            <DetailItem label={t('agentCard_culture')} value={cultureName} icon={<Users className="w-4 h-4"/>} />
                            <DetailItem label={t('agentCard_religion')} value={religionName} icon={<Church className="w-4 h-4"/>} />
                            <DetailItem label={t('agentCard_role')} value={t(`role_${(agent.role || 'none').toLowerCase()}` as any)} icon={<Award className="w-4 h-4"/>} />
                            <DetailItem label={t('world_leader')} value={leaderName} icon={<Gavel className="w-4 h-4"/>} />
                            <ProgressBar value={agent.health} max={100} color="bg-red-500" label={t('agentCard_health')} />
                            <ProgressBar value={agent.hunger} max={100} color="bg-orange-500" label={t('agentCard_hunger')} />
                            <ProgressBar value={agent.thirst} max={100} color="bg-blue-500" label={t('agentCard_thirst')} />
                            <ProgressBar value={agent.fatigue} max={100} color="bg-purple-500" label={t('agentCard_fatigue')} />
                            <ProgressBar value={agent.stress} max={100} color="bg-yellow-500" label={t('agentCard_stress')} />
                            <ProgressBar value={agent.socialStatus} max={100} color="bg-pink-500" label={t('agentCard_socialStatus')} />
                            <DetailItem label={t('agentCard_sickness')} value={agent.sickness || t('agentCard_healthy')} icon={<ShieldAlert className="w-4 h-4"/>} />
                             <DetailItem label={t('agentCard_currency')} value={`${agent.currency}$`} icon={<CircleDollarSign className="w-4 h-4"/>} />
                        </div>
                    </Card>
                    <Card title={t('personality_title')} icon={<Smile className="w-5 h-5 text-sky-400"/>}>
                        <div className="h-40"><BeliefsChart data={Object.entries(agent.personality).map(([name, value]) => ({name, value}))} barColor="#f472b6" keyPrefix="personality_" /></div>
                    </Card>
                     <Card title={t('psyche_title')} icon={<BrainCircuit className="w-5 h-5 text-sky-400"/>}>
                        <div className="h-48"><BeliefsChart data={Object.entries(agent.psyche).map(([name, value]) => ({name, value}))} barColor="#c084fc" keyPrefix="psyche_" /></div>
                         <button onClick={() => onGeneratePsychoanalysis(agent)} className="w-full mt-2 text-xs bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2">
                            <BrainCircuit className="w-4 h-4" /> {t('psychoanalysis_generate_button')}
                         </button>
                    </Card>
                    <Card title={t('agentCard_interact')} icon={<MessageSquare className="w-5 h-5 text-sky-400"/>}>
                        <form onSubmit={handlePromptSubmit} className="space-y-2">
                             <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={!agent.isAlive ? t('agentCard_promptPlaceholderDeceased') : useAi ? t('agentCard_promptPlaceholder', { name: agent.name }) : t('agentCard_promptPlaceholderRaw')}
                                disabled={!agent.isAlive}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                                rows={3}
                            />
                            <div className="flex justify-between items-center">
                                <label className="flex items-center text-xs gap-2 cursor-pointer">
                                    <input type="checkbox" checked={useAi} onChange={() => setUseAi(!useAi)} className="form-checkbox h-4 w-4 rounded bg-slate-700 text-sky-500 border-slate-600 focus:ring-sky-500" />
                                    {t('agentCard_useAi')}
                                </label>
                                <button type="submit" disabled={!agent.isAlive || !prompt} className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-3 rounded-md transition-colors flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed">
                                    {useAi ? <Sparkles className="w-4 h-4"/> : <Send className="w-4 h-4"/>} Send
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* --- Column 2: Mental & Skill States --- */}
                <div className="space-y-4">
                    <Card title={t('agentCard_beliefs')} icon={<BookOpenCheck className="w-5 h-5 text-sky-400"/>}>
                        {Object.keys(agent.beliefNetwork).length > 0 ? (
                           <div className="h-40"><BeliefsChart data={Object.entries(agent.beliefNetwork).map(([name, value]) => ({name, value}))} barColor="#818cf8" /></div>
                        ) : <p className="text-sm text-slate-400">{t('agentCard_noBeliefs')}</p>}
                    </Card>
                    <Card title={t('agentCard_emotions')} icon={<Heart className="w-5 h-5 text-sky-400"/>}>
                        {Object.keys(agent.emotions).length > 0 ? (
                            <div className="h-40"><BeliefsChart data={Object.entries(agent.emotions).map(([name, value]) => ({name, value}))} barColor="#a78bfa" keyPrefix="emotion_" /></div>
                        ) : <p className="text-sm text-slate-400">{t('agentCard_noEmotions')}</p>}
                    </Card>
                    <Card title={t('agentCard_skills')} icon={<TrendingUp className="w-5 h-5 text-sky-400"/>}>
                        <div className="h-40"><BeliefsChart data={Object.entries(agent.skills).map(([name, value]) => ({name, value: value/100}))} barColor="#34d399" keyPrefix="skill_" /></div>
                    </Card>
                     <Card title={t('agentCard_goals')} icon={<ClipboardList className="w-5 h-5 text-sky-400"/>}>
                        {agent.goals.length > 0 ? (
                            <ul className="space-y-2 text-sm">
                                {agent.goals.map((goal, i) => (
                                    <li key={i} className="bg-slate-700/50 p-2 rounded-md">
                                        <p className="font-semibold text-slate-200">{t(`goal_${goal.type}` as TranslationKey) || goal.type}</p>
                                        <p className="text-xs text-slate-400 italic">"{goal.description}"</p>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-slate-400">{t('agentCard_noGoals')}</p>}
                    </Card>
                     <Card title={t('agentCard_trauma')} icon={<ShieldAlert className="w-5 h-5 text-sky-400"/>}>
                         {agent.trauma.length > 0 ? (
                             <ul className="space-y-2 text-sm text-slate-300">
                                {agent.trauma.map((t, i) => <li key={i} className="p-2 bg-slate-700/50 rounded-md">Trigger: "{t.event}" (Intensity: {t.intensity})</li>)}
                            </ul>
                         ) : <p className="text-sm text-slate-400">{t('agentCard_noTrauma')}</p>}
                    </Card>
                </div>
                
                {/* --- Column 3: Social & Material States --- */}
                <div className="space-y-4">
                    <Card title={t('agentCard_relationships')} icon={<Users className="w-5 h-5 text-sky-400"/>}>
                         {Object.keys(agent.relationships).length > 0 ? (
                            <ul className="space-y-1 text-sm max-h-40 overflow-y-auto pr-1">
                                {Object.entries(agent.relationships).map(([id, rel]) => {
                                    const otherAgent = allAgents.find(a => a.id === id);
                                    if (!otherAgent) return null;
                                    return <li key={id} className="flex justify-between p-1.5 bg-slate-700/50 rounded-md">
                                        <span className={otherAgent.isAlive ? '' : 'text-slate-500'}>{otherAgent.name}</span>
                                        <span className="text-slate-400 font-mono text-xs">{t(`relationship_${rel.type}` as TranslationKey)} ({rel.score.toFixed(0)})</span>
                                    </li>
                                })}
                            </ul>
                         ) : <p className="text-sm text-slate-400">{t('agentCard_noRelationships')}</p>}
                    </Card>
                    <Card title={t('agentCard_inventory')} icon={<Briefcase className="w-5 h-5 text-sky-400"/>}>
                         {Object.keys(agent.inventory).length > 0 ? (
                            <ul className="space-y-1 text-sm max-h-40 overflow-y-auto pr-1">
                                {Object.entries(agent.inventory).map(([item, quantity]) => quantity > 0 && (
                                    <li key={item} className="flex justify-between p-1.5 bg-slate-700/50 rounded-md">
                                        <span>{t(`item_${item}` as TranslationKey) || item}</span>
                                        <span className="font-mono">{quantity}</span>
                                    </li>
                                ))}
                            </ul>
                         ) : <p className="text-sm text-slate-400">{t('agentCard_noInventory')}</p>}
                    </Card>
                     <Card title={t('agentCard_family')} icon={<Baby className="w-5 h-5 text-sky-400"/>}>
                        {(agent.childrenIds && agent.childrenIds.length > 0) ? (
                             <ul className="space-y-1 text-sm">
                                {agent.childrenIds.map(childId => {
                                    const child = allAgents.find(a => a.id === childId);
                                    return <li key={childId} className="flex justify-between p-1.5 bg-slate-700/50 rounded-md">
                                        <span>{child?.name || 'Unknown Child'} {!child?.isAlive && `(${t('deceased')})`}</span>
                                        <span className="text-slate-400 text-xs">{t('agentCard_child_relation')}</span>
                                    </li>;
                                })}
                            </ul>
                        ) : <p className="text-sm text-slate-400">{t('agentCard_no_children')}</p>}
                    </Card>
                    <Card title={t('agentCard_property')} icon={<Home className="w-5 h-5 text-sky-400"/>}>
                        {entities.filter(e => e.ownerId === agent.id).length > 0 ? (
                            <ul className="space-y-1 text-sm">
                                {entities.filter(e => e.ownerId === agent.id).map(entity => (
                                    <li key={entity.id} className="p-1.5 bg-slate-700/50 rounded-md">{entity.name}</li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-slate-400">{t('agentCard_noProperty')}</p>}
                    </Card>
                     <Card title={t('agentCard_genome')} icon={<Dna className="w-5 h-5 text-sky-400"/>}>
                        {agent.genome.length > 0 ? (
                            <ul className="space-y-1 text-sm">
                                {agent.genome.map(gene => (
                                    <li key={gene} title={t(`gene_desc_${gene}` as TranslationKey)} className="p-1.5 bg-slate-700/50 rounded-md">
                                        {t(`gene_${gene}` as TranslationKey) || gene}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-slate-400">{t('agentCard_noGenome')}</p>}
                    </Card>
                </div>
            </div>

            {/* --- Full Width Sections --- */}
            {(agent.jailJournal && agent.jailJournal.length > 0) && (
                <Card 
                    title={t('agentCard_jailJournal')} 
                    icon={<Notebook className="w-5 h-5 text-sky-400"/>}
                    headerActions={
                        <button onClick={handleDownloadJournal} title={t('export_journal_button')} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                            <Download className="w-4 h-4" />
                        </button>
                    }
                >
                    <div className="space-y-3 max-h-64 overflow-y-auto bg-slate-900/50 p-2 rounded-md">
                        {[...agent.jailJournal].reverse().map((entry, index) => (
                            <div key={index} className="text-sm text-slate-300 border-b border-slate-700 pb-2 last:border-b-0">
                                <p className="text-xs text-slate-500 font-mono mb-1">Step: {entry.timestamp}</p>
                                <p className="whitespace-pre-wrap">{entry.entry}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};
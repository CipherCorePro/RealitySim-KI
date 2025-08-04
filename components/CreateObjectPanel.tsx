
import React, { useState } from 'react';
import { PlusCircle, Dna, Award, Smile, Zap, Sparkles } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';
import { GENOME_OPTIONS, ROLES, PERSONALITY_TRAITS, SKILL_TYPES } from '../constants';
import type { Personality, ActionEffect, Skills } from '../types';

interface CreateObjectPanelProps {
    onCreate: (type: 'agent' | 'entity' | 'action', data: any) => void;
}

// --- Random Data for Local Generation ---
const randomData = {
    firstNames: ['Elara', 'Rhys', 'Silvana', 'Orion', 'Nadia', 'Marius', 'Lyra', 'Kai', 'Jasmine', 'Isaac', 'Helena', 'Gareth', 'Fiona', 'Elias', 'Dahlia', 'Caspian', 'Bram', 'Anya', 'Ralf', 'Garrus', 'Bob', 'Alice', 'Xavier', 'Willow', 'Vera', 'Ulysses', 'Thalia', 'Silas', 'Rhiannon', 'Quentin', 'Phoebe'],
    lastNames: ['Meadowbrook', 'Stonehand', 'Riverwind', 'Blackwood', 'Ironhide', 'Swiftfoot', 'Sunstrider', 'Shadowend'],
    descriptors: ['A curious', 'A pragmatic', 'A cheerful', 'A cynical', 'An optimistic', 'A cautious', 'A brave', 'A timid'],
    agentRoles: ['explorer', 'artisan', 'scholar', 'hermit', 'warrior', 'trader', 'healer'],
    hobbies: ['who loves to talk about the weather', 'who complains about small things', 'who is optimistic about the future', 'who is wary of strangers', 'who secretly writes poetry', 'who collects rare stones'],
    beliefKeys: ['progress_good', 'nature_good', 'wealth_is_power', 'community_first', 'tradition_important', 'knowledge_is_sacred']
};

const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const CreateObjectPanel: React.FC<CreateObjectPanelProps> = ({ onCreate }) => {
    const [type, setType] = useState<'agent' | 'entity' | 'action'>('agent');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [beliefs, setBeliefs] = useState('');
    const [beliefKey, setBeliefKey] = useState('');
    const [genome, setGenome] = useState('');
    const [role, setRole] = useState<string>(ROLES[0]);
    const [personality, setPersonality] = useState<Personality>({
        openness: 0.5,
        conscientiousness: 0.5,
        extraversion: 0.5,
        agreeableness: 0.5,
        neuroticism: 0.5,
    });
    const [costsStr, setCostsStr] = useState('');
    const [statChanges, setStatChanges] = useState({ health: '', hunger: '', thirst: '', fatigue: '', stress: '', currency: '' });
    const [skillGain, setSkillGain] = useState({ skill: SKILL_TYPES[0], amount: '' });

    const t = useTranslations();

    const handleGenerateName = () => {
        const randomName = `${getRandomItem(randomData.firstNames)} ${getRandomItem(randomData.lastNames)}`;
        setName(randomName);
    };

    const handleGenerateDescription = () => {
        const randomDesc = `${getRandomItem(randomData.descriptors)} ${getRandomItem(randomData.agentRoles)} ${getRandomItem(randomData.hobbies)}.`;
        setDescription(randomDesc);
    };

    const handleGenerateBeliefs = () => {
        const numBeliefs = Math.floor(Math.random() * 3) + 2; // 2 to 4 beliefs
        const shuffledKeys = [...randomData.beliefKeys].sort(() => 0.5 - Math.random());
        const selectedKeys = shuffledKeys.slice(0, numBeliefs);
        const newBeliefs = selectedKeys.reduce((acc, key) => {
            acc[key] = parseFloat(Math.random().toFixed(2));
            return acc;
        }, {} as {[key: string]: number});
        setBeliefs(JSON.stringify(newBeliefs, null, 2));
    };

    const handleGenerateGenes = () => {
        const shuffled = [...GENOME_OPTIONS].sort(() => 0.5 - Math.random());
        const selectedCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 genes
        const selected = shuffled.slice(0, selectedCount);
        setGenome(selected.join(', '));
    };

    const handleRandomizePersonality = () => {
        setPersonality({
            openness: Math.random(),
            conscientiousness: Math.random(),
            extraversion: Math.random(),
            agreeableness: Math.random(),
            neuroticism: Math.random(),
        });
    };

    const handlePersonalityChange = (trait: keyof Personality, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 1) {
            setPersonality(prev => ({ ...prev, [trait]: numValue }));
        }
    };
    
    const handleStatChange = (stat: keyof typeof statChanges, value: string) => {
        setStatChanges(prev => ({...prev, [stat]: value}));
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setBeliefs('');
        setBeliefKey('');
        setGenome('');
        setRole(ROLES[0]);
        setCostsStr('');
        setStatChanges({ health: '', hunger: '', thirst: '', fatigue: '', stress: '', currency: '' });
        setSkillGain({ skill: SKILL_TYPES[0], amount: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let data: any = { name, description };
        if (type === 'agent') {
            try {
                data.beliefs = beliefs ? JSON.parse(beliefs) : {};
            } catch {
                alert(t('create_invalidJson'));
                return;
            }
            data.genome = genome.split(',').map(g => g.trim()).filter(Boolean);
            data.role = role;
            data.personality = personality;
        }
        if (type === 'action') {
            data.beliefKey = beliefKey;
            
            const actionEffects: ActionEffect = {};
            if(costsStr) {
                try {
                    actionEffects.costs = JSON.parse(costsStr);
                } catch {
                    alert('Invalid JSON for Costs.');
                    return;
                }
            }
            
            const parsedStatChanges: ActionEffect['statChanges'] = {};
            let hasStatChanges = false;
            for (const [key, value] of Object.entries(statChanges)) {
                if(value.trim() !== '') {
                    const numVal = parseFloat(value);
                    if(!isNaN(numVal)) {
                        parsedStatChanges[key as keyof typeof parsedStatChanges] = numVal;
                        hasStatChanges = true;
                    }
                }
            }
            if(hasStatChanges) actionEffects.statChanges = parsedStatChanges;

            const skillGainAmount = parseFloat(skillGain.amount);
            if(!isNaN(skillGainAmount) && skillGainAmount > 0) {
                actionEffects.skillGain = {
                    skill: skillGain.skill as keyof Skills,
                    amount: skillGainAmount
                };
            }

            if (Object.keys(actionEffects).length > 0) {
                data.effects = actionEffects;
            }
        }
        onCreate(type, data);
        resetForm();
    };

    return (
        <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400"/>
                {t('create_createNew')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                    <option value="agent">{t('create_agent')}</option>
                    <option value="entity">{t('create_entity')}</option>
                    <option value="action">{t('create_action')}</option>
                </select>
                <div className="flex items-center gap-2">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('create_name')} required className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                     {type === 'agent' && <button type="button" onClick={handleGenerateName} title={t('create_generate_random_name')} className="p-2 bg-purple-600 hover:bg-purple-500 rounded-md transition-colors"><Sparkles className="w-5 h-5"/></button>}
                </div>
                 <div className="flex items-center gap-2">
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('create_description')} required className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                     {type === 'agent' && <button type="button" onClick={handleGenerateDescription} title={t('create_generate_random_description')} className="p-2 bg-purple-600 hover:bg-purple-500 rounded-md transition-colors"><Sparkles className="w-5 h-5"/></button>}
                </div>
                {type === 'agent' && (
                     <>
                        <div className="flex items-start gap-2">
                            <textarea value={beliefs} onChange={e => setBeliefs(e.target.value)} placeholder={t('create_beliefsPlaceholder')} rows={2} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                            <button type="button" onClick={handleGenerateBeliefs} title={t('create_generate_random_beliefs')} className="p-2 bg-purple-600 hover:bg-purple-500 rounded-md transition-colors"><Sparkles className="w-5 h-5"/></button>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="text" value={genome} onChange={e => setGenome(e.target.value)} placeholder={t('create_genome_placeholder')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                            <button type="button" onClick={handleGenerateGenes} title={t('create_generate_genes_title')} className="p-2 bg-purple-600 hover:bg-purple-500 rounded-md transition-colors"><Dna className="w-5 h-5"/></button>
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="role-select" className="text-slate-400 flex items-center gap-2"><Award className="w-4 h-4"/> {t('create_role_label')}</label>
                            <select id="role-select" value={role} onChange={e => setRole(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                                {ROLES.map(r => <option key={r} value={r}>{t(`role_${r.toLowerCase()}` as any)}</option>)}
                            </select>
                        </div>
                        <details>
                           <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-200 transition-colors flex items-center gap-1"><Smile className="w-4 h-4" /> {t('personality_title')}</summary>
                           <div className="p-2 bg-slate-900/50 rounded-md mt-2 space-y-2">
                            {PERSONALITY_TRAITS.map(trait => (
                                <div key={trait} className="flex items-center gap-2">
                                <label className="w-1/3 capitalize text-slate-300">{t(`personality_${trait}` as any)}</label>
                                <input 
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={personality[trait as keyof Personality]}
                                    onChange={(e) => handlePersonalityChange(trait as keyof Personality, e.target.value)}
                                    className="w-2/3"
                                />
                                </div>
                            ))}
                             <button type="button" onClick={handleRandomizePersonality} className="w-full text-xs py-1 mt-2 bg-slate-600 hover:bg-slate-500 rounded">{t('create_randomize_personality')}</button>
                           </div>
                        </details>
                     </>
                )}
                 {type === 'action' && (
                     <>
                        <input type="text" value={beliefKey} onChange={e => setBeliefKey(e.target.value)} placeholder={t('create_beliefKeyPlaceholder')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                        <details>
                           <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-200 transition-colors flex items-center gap-1"><Zap className="w-4 h-4" /> {t('create_mechanical_effects')}</summary>
                           <div className="p-2 bg-slate-900/50 rounded-md mt-2 space-y-3">
                                <textarea value={costsStr} onChange={e => setCostsStr(e.target.value)} placeholder={t('create_costs_placeholder')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs" />
                                
                                <div>
                                    <h4 className="text-xs font-semibold mb-2">{t('create_stat_changes_label')}</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(Object.keys(statChanges) as Array<keyof typeof statChanges>).map(stat => (
                                            <div key={stat} className="flex items-center gap-1">
                                                <label className="text-slate-400 text-xs w-16 capitalize">{t(`stat_${stat}` as any)}</label>
                                                <input type="number" step="any" value={statChanges[stat]} onChange={e => handleStatChange(stat, e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-semibold mb-2">{t('create_skill_gain_label')}</h4>
                                    <div className="flex items-center gap-2">
                                        <label className="text-slate-400 text-xs">{t('create_skill_to_gain')}</label>
                                        <select value={skillGain.skill} onChange={e => setSkillGain(p => ({...p, skill: e.target.value}))} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs">
                                             {SKILL_TYPES.map(s => <option key={s} value={s}>{t(`skill_${s}` as any, {s})}</option>)}
                                        </select>
                                        <label className="text-slate-400 text-xs">{t('create_amount')}</label>
                                         <input type="number" step="any" value={skillGain.amount} onChange={e => setSkillGain(p => ({...p, amount: e.target.value}))} className="w-24 bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    </div>
                                </div>
                           </div>
                        </details>
                     </>
                )}
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-md transition-colors">{t('create_create')}</button>
            </form>
        </div>
    );
};

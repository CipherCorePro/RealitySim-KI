
import React, { useState } from 'react';
import { PlusCircle, Dna, Award, Smile } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';
import { GENOME_OPTIONS, ROLES, PERSONALITY_TRAITS } from '../constants';
import type { Personality } from '../types';

interface CreateObjectPanelProps {
    onCreate: (type: 'agent' | 'entity' | 'action', data: any) => void;
}

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
    const t = useTranslations();

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
        }
        onCreate(type, data);
        setName('');
        setDescription('');
        setBeliefs('');
        setBeliefKey('');
        setGenome('');
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
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('create_name')} required className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('create_description')} required className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                {type === 'agent' && (
                     <>
                        <textarea value={beliefs} onChange={e => setBeliefs(e.target.value)} placeholder={t('create_beliefsPlaceholder')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                        <div className="flex items-center gap-2">
                            <input type="text" value={genome} onChange={e => setGenome(e.target.value)} placeholder={t('create_genome_placeholder')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                            <button type="button" onClick={handleGenerateGenes} title={t('create_generate_genes_title')} className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors"><Dna className="w-5 h-5"/></button>
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
                     <input type="text" value={beliefKey} onChange={e => setBeliefKey(e.target.value)} placeholder={t('create_beliefKeyPlaceholder')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                )}
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-md transition-colors">{t('create_create')}</button>
            </form>
        </div>
    );
};

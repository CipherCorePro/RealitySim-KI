

import type { WorldState, Agent, Entity, Action, EnvironmentState, Beliefs, Resonance, LogEntry, Relationship, Culture, ActionExecutionResult, Religion, Personality, Skills, Trauma, Goal, Law, TradeOffer, ItemType, SocialMemoryEntry, PsychoReport, Psyche, ActionContext, Transaction, ActionEffect } from '../types';
import { 
    RESONANCE_DECAY_RATE, RESONANCE_THRESHOLD, RESONANCE_UPDATE_AMOUNT, MAX_LAST_ACTIONS,
    AGE_INCREMENT, MAX_AGE, AGE_RELATED_HEALTH_DECLINE,
    RELATIONSHIP_INCREMENT_PROXIMITY, PROXIMITY_DISTANCE_THRESHOLD, EMOTION_DECAY_RATE,
    GENOME_OPTIONS, MUTATION_RATE, CULTURAL_EVOLUTION_INTERVAL,
    EMOTIONAL_LEARNING_RATE, ELECTION_TERM_LENGTH,
    initialWorldState as defaultWorldState,
    HUNGER_INCREASE_RATE, THIRST_INCREASE_RATE, FATIGUE_INCREASE_RATE,
    HEALTH_LOSS_FROM_DEHYDRATION, HEALTH_LOSS_FROM_STARVATION, SICKNESS_HEALTH_LOSS,
    STRESS_DECAY_RATE, STRESS_FROM_NEEDS, TECH_TREE,
    MAX_SOCIAL_MEMORIES, SKILL_TYPES, BOREDOM_INCREASE_RATE, PSYCHE_DECAY_RATE, defaultPsyche,
    defaultQTable, Q_LEARNING_RATE, Q_DISCOUNT_FACTOR, EPSILON_GREEDY,
    PERSONALITY_SHIFT_RATE, STRESS_THRESHOLD_FOR_PERSONALITY_SHIFT, MAX_TRANSACTIONS, MAX_LONG_TERM_MEMORIES,
    RANDOM_FIRST_NAMES, RANDOM_LAST_NAMES
} from '../constants';
import { availableActions } from './actions';
import { wander, findNearestEntity, findNearestAgent } from './simulationUtils';
import type { Language } from '../contexts/LanguageContext';
import { VectorDB } from './memoryService';
import { generateEmbedding, generateJailJournalEntry } from './geminiService';
import type { Settings } from '../contexts/SettingsContext';
import { translations } from '../translations';

const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

class PromptParser {
    public parse(prompt: string, availableActions: Action[]): Action | null {
        const p = prompt.toLowerCase().trim();
        for (const action of availableActions) { if (action.name.toLowerCase() === p) return action; }
        for (const action of availableActions) { if (p.includes(action.name.toLowerCase())) return action; }
        return null;
    }
}

interface Conversation {
    participants: string[];
    history: { speakerName: string; message: string; }[];
    turn: string;
    lastInteractionTime: number;
}


export class RealityEngine {
    private worldState: WorldState;
    private agents: Map<string, Agent> = new Map();
    private entities: Map<string, Entity> = new Map();
    private actions: Map<string, Action> = new Map();
    private cultures: Map<string, Culture> = new Map();
    private religions: Map<string, Religion> = new Map();
    private promptParser: PromptParser = new PromptParser();
    private conversations = new Map<string, Conversation>();
    private memoryDBs: Map<string, VectorDB> = new Map();
    private settings: Settings;
    public language: Language = 'de'; // Default, will be updated by step
    public marketPrices: { [key: string]: number } = {};


    constructor(initialState: WorldState, settings: Settings) {
        this.worldState = initialState; 
        this.settings = settings;

        this.worldState.cultures.forEach(culture => this.cultures.set(culture.id, culture));
        this.worldState.religions.forEach(religion => this.religions.set(religion.id, religion));
        this.worldState.transactions = this.worldState.transactions || [];

        this.worldState.agents.forEach(agent => {
             const agentWithDefaults: Agent = {
                personality: { openness: 0.5, conscientiousness: 0.5, extraversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
                goals: [], stress: 0, socialStatus: 50,
                skills: { healing: 1, woodcutting: 1, rhetoric: 1, combat: 1, construction: 1, farming: 1, mining: 1, crafting: 1, trading: 1 },
                trauma: [], lastActions: [], conversationHistory: [], socialMemory: [], 
                longTermMemory: agent.longTermMemory || [],
                relationships: agent.relationships || {}, offspringCount: agent.offspringCount || 0,
                childrenIds: agent.childrenIds || [],
                role: agent.role || null, religionId: agent.religionId || null,
                hunger: agent.hunger || 0, thirst: agent.thirst || 0, fatigue: agent.fatigue || 0, inventory: agent.inventory || {},
                currency: agent.currency || 50,
                unconsciousState: agent.unconsciousState || {},
                psyche: agent.psyche || defaultPsyche(),
                qTable: agent.qTable || defaultQTable(),
                lastStressLevel: agent.stress || 0,
                ...agent, 
            };
            this.agents.set(agent.id, agentWithDefaults);
            this.updateCultureMembership(agentWithDefaults);

            // Initialize VectorDB for each agent
            const db = new VectorDB();
            if (agentWithDefaults.longTermMemory) {
                db.loadMemories(agentWithDefaults.longTermMemory);
            }
            this.memoryDBs.set(agent.id, db);
        });

        this.worldState.entities.forEach(entity => this.entities.set(entity.id, entity));
        
        availableActions.forEach(action => this.actions.set(action.name, action));

        // Allow user-defined actions from save state to be added
        this.worldState.actions.forEach(action => {
            if (!this.actions.has(action.name)) {
                const finalAction: Action = { ...action };
                finalAction.execute = this.createCustomActionExecute(finalAction);
                this.actions.set(action.name, finalAction);
            }
        });
        
        this.updateActionLegality();
        this.calculateMarketPrices();
    }

    private updateCultureMembership(agent: Agent) {
         if (agent.cultureId && this.cultures.has(agent.cultureId)) {
            const culture = this.cultures.get(agent.cultureId)!;
            if (!culture.memberIds.includes(agent.id)) culture.memberIds.push(agent.id);
        }
    }
    
    // --- NEW ENGINE METHODS FOR NEW SYSTEMS ---

    public logTransaction(transaction: Omit<Transaction, 'step'>) {
        if (!this.worldState.transactions) {
            this.worldState.transactions = [];
        }
        this.worldState.transactions.push({ ...transaction, step: this.worldState.environment.time });
        if (this.worldState.transactions.length > MAX_TRANSACTIONS) {
            this.worldState.transactions.shift();
        }
    }

    private calculateMarketPrices() {
        const basePrices: { [key: string]: number } = { food: 5, water: 2, wood: 8, medicine: 15, iron: 12, iron_ingot: 25, sword: 60, plow: 40, advanced_medicine: 50 };
        const totalSupply: { [key: string]: number } = {};

        for (const agent of this.agents.values()) {
            for (const item in agent.inventory) {
                totalSupply[item] = (totalSupply[item] || 0) + agent.inventory[item];
            }
        }
        for (const market of this.worldState.markets) {
            for (const listing of market.listings) {
                totalSupply[listing.item] = (totalSupply[listing.item] || 0) + listing.quantity;
            }
        }

        for(const item in basePrices) {
            const supply = totalSupply[item] || 1;
            this.marketPrices[item] = Math.round(basePrices[item] * (1 + (100 / (supply + 10))));
        }
    }
    
    public addListingToMarket(marketId: string, offer: {fromAgentId: string, item: ItemType, quantity: number}) {
        const market = this.worldState.markets.find(m => m.id === marketId);
        if (market) {
            const newOffer: TradeOffer = { ...offer, offerId: `offer-${Date.now()}`, price: 0 }; // Price is ignored, system sets it
            market.listings.push(newOffer);
        }
    }

    public executeTrade(buyer: Agent, offer: TradeOffer) {
        const seller = this.agents.get(offer.fromAgentId);
        const market = this.worldState.markets[0];
        if (!seller || !market) return;
        
        const price = this.marketPrices[offer.item] || 999;
        const totalCost = price * offer.quantity;
        if (buyer.currency < totalCost) return;

        this.logTransaction({ from: buyer.id, to: seller.id, item: 'currency', quantity: totalCost });
        this.logTransaction({ from: seller.id, to: buyer.id, item: offer.item, quantity: offer.quantity });

        buyer.currency -= totalCost;
        seller.currency += totalCost;
        buyer.inventory[offer.item] = (buyer.inventory[offer.item] || 0) + offer.quantity;
        
        market.listings = market.listings.filter(l => l.offerId !== offer.offerId);
        
        const skillGain = 0.5; // DEFAULT_SKILL_GAIN
        if (buyer.genome.includes("G-INTELLIGENT")) skillGain * 1.25;
        buyer.skills.trading = (buyer.skills.trading || 0) + skillGain;
        
        let sellerSkillGain = skillGain;
        if (seller.genome.includes("G-INTELLIGENT")) sellerSkillGain * 1.25;
        seller.skills.trading = (seller.skills.trading || 0) + sellerSkillGain;
    }

    public startElection() {
        if (!this.worldState.government.leaderId) {
             const potentialCandidates = Array.from(this.agents.values()).filter(a => a.isAlive && a.socialStatus > 60);
             if (potentialCandidates.length > 0) {
                 this.worldState.government.leaderId = potentialCandidates.sort((a,b) => b.socialStatus - a.socialStatus)[0].id;
             }
        }

        this.worldState.environment.election = {
            isActive: true,
            candidates: [],
            votes: {},
            termEndDate: this.worldState.environment.time + ELECTION_TERM_LENGTH,
        };
    }

    public castVote(candidateId: string) {
        if (this.worldState.environment.election?.isActive) {
            this.worldState.environment.election.votes[candidateId] = (this.worldState.environment.election.votes[candidateId] || 0) + 1;
        }
    }
    
    public declareCandidacy(agentId: string) {
        if (this.worldState.environment.election?.isActive) {
            this.worldState.environment.election.candidates.push(agentId);
        }
    }

    private endElection(): LogEntry[] {
        const logs: LogEntry[] = [];
        const election = this.worldState.environment.election;
        if (!election || !election.isActive) return logs;

        let winnerId: string | null = null;
        let maxVotes = -1;

        for(const candidateId in election.votes) {
            if(election.votes[candidateId] > maxVotes) {
                maxVotes = election.votes[candidateId];
                winnerId = candidateId;
            }
        }
        
        election.isActive = false;
        const oldLeaderName = this.agents.get(this.worldState.government.leaderId || '')?.name;
        
        if (winnerId) {
            this.worldState.government.leaderId = winnerId;
            const winner = this.agents.get(winnerId);
            if(winner) {
                winner.socialStatus = Math.min(100, winner.socialStatus + 20);
                winner.role = 'Leader';

                // Grant Governance tech to the new leader's culture
                if (winner.cultureId) {
                    const culture = this.cultures.get(winner.cultureId);
                    if (culture && !culture.knownTechnologies.includes('governance')) {
                        culture.knownTechnologies.push('governance');
                        logs.push({ key: 'log_leader_unlocks_governance', params: { leaderName: winner.name, cultureName: culture.name } });
                    }
                }
            }
            logs.push({ key: 'log_election_winner', params: { winnerName: winner?.name, votes: maxVotes } });
            return logs;
        }
        
        logs.push({ key: 'log_election_no_winner', params: { oldLeaderName: oldLeaderName || 'Niemand' } });
        return logs;
    }

    public enactLaw(law: Law) {
        this.worldState.government.laws.push(law);
        this.updateActionLegality();
    }

    public updateActionLegality() {
        const illegalActionNames = new Set(this.worldState.government.laws.map(l => l.violatingAction));
        this.actions.forEach(action => {
            action.isIllegal = illegalActionNames.has(action.name);
        });
    }

    public addResearchPoints(cultureId: string, points: number) {
        const culture = this.cultures.get(cultureId);
        if (culture) {
            culture.researchPoints += points;
        }
    }

    private checkTechnologyUnlocks(): LogEntry[] {
        const logs: LogEntry[] = [];
        this.cultures.forEach(culture => {
            TECH_TREE.forEach(tech => {
                if (!culture.knownTechnologies.includes(tech.id) && culture.researchPoints >= tech.researchCost) {
                    const hasRequired = tech.requiredTech ? tech.requiredTech.every(req => culture.knownTechnologies.includes(req)) : true;
                    if (hasRequired) {
                        culture.knownTechnologies.push(tech.id);
                        logs.push({ key: 'log_tech_unlocked', params: { cultureName: culture.name, techName: tech.name } });

                        // Unlock actions
                        if(tech.unlocks.actions) {
                           this.worldState.actions = this.worldState.actions.filter(a => !tech.unlocks.actions?.includes(a.name)); // remove if exists
                           const newActions = defaultWorldState.actions.filter(a => tech.unlocks.actions?.includes(a.name));
                           newActions.forEach(a => this.actions.set(a.name, a));
                        }
                    }
                }
            });
        });
        return logs;
    }
    
    public inheritGenome(parent1: Agent, parent2: Agent): string[] {
        const combined = [...new Set([...parent1.genome, ...parent2.genome])];
        const inheritedCount = Math.ceil(combined.length / 2);
        let inheritedGenes = combined.sort(() => 0.5 - Math.random()).slice(0, inheritedCount);

        // Apply mutation
        inheritedGenes = inheritedGenes.map(gene => {
            if (Math.random() < MUTATION_RATE) {
                return GENOME_OPTIONS[Math.floor(Math.random() * GENOME_OPTIONS.length)];
            }
            return gene;
        });

        // Ensure uniqueness after mutation
        return [...new Set(inheritedGenes)];
    }
    
    private inheritPersonality(parent1: Agent, parent2: Agent): Personality {
        const childPersonality: Partial<Personality> = {};
        for (const trait of Object.keys(parent1.personality) as (keyof Personality)[]) {
            const avg = (parent1.personality[trait] + parent2.personality[trait]) / 2;
            const mutation = (Math.random() - 0.5) * 0.2; // +/- 0.1
            childPersonality[trait] = Math.max(0, Math.min(1, avg + mutation));
        }
        return childPersonality as Personality;
    }

    private inheritPsyche(parent1: Agent, parent2: Agent): Psyche {
        const childPsyche: Partial<Psyche> = {};
        for (const trait of Object.keys(parent1.psyche) as (keyof Psyche)[]) {
            const avg = (parent1.psyche[trait] + parent2.psyche[trait]) / 2;
            const mutation = (Math.random() - 0.5) * 0.2;
            childPsyche[trait] = Math.max(0, Math.min(1, avg + mutation));
        }
        return childPsyche as Psyche;
    }
    
    private addNewbornAgent(data: Partial<Agent> & { description: string, parents: [Agent, Agent] }): LogEntry[] {
        const [parent1, parent2] = data.parents;
        const lastName = parent1.name.split(' ')[1] || parent2.name.split(' ')[1] || getRandomItem(RANDOM_LAST_NAMES);
        const newName = `${getRandomItem(RANDOM_FIRST_NAMES)} ${lastName}`;
        const stress = 5;
        const newAgent: Agent = {
            id: `agent-${Date.now()}`, name: newName, description: data.description,
            x: parent1.x + (Math.random() > 0.5 ? 1 : -1), y: parent1.y + (Math.random() > 0.5 ? 1 : -1),
            beliefNetwork: Object.keys(parent1.beliefNetwork).reduce((acc, key) => ({...acc, [key]: (parent1.beliefNetwork[key] + parent2.beliefNetwork[key]) / 2}), {} as Beliefs),
            emotions: { happiness: 0.6, sadness: 0.1, anger: 0.0, fear: 0.2, trust: 0.5, love: 0.5, grief: 0, shame: 0.1, pride: 0.5 },
            resonance: {}, lastActions: [], socialMemory: [], longTermMemory: [], adminAgent: false, health: 100, isAlive: true, sickness: null,
            conversationHistory: [], age: 0, genome: this.inheritGenome(parent1, parent2), relationships: {},
            cultureId: parent1.cultureId, religionId: parent1.religionId, role: 'Worker', offspringCount: 0, childrenIds: [],
            hunger: 0, thirst: 0, fatigue: 0, inventory: {}, personality: this.inheritPersonality(parent1, parent2),
            goals: [], stress: stress, socialStatus: (parent1.socialStatus + parent2.socialStatus) / 3,
            skills: SKILL_TYPES.reduce((acc, skill) => ({ ...acc, [skill]: 0 }), {} as Skills),
            trauma: [],
            unconsciousState: {},
            psyche: this.inheritPsyche(parent1, parent2),
            currency: 10,
            qTable: defaultQTable(),
            lastStressLevel: stress,
        };
        
        // Update parents with child ID
        if (!parent1.childrenIds) parent1.childrenIds = [];
        parent1.childrenIds.push(newAgent.id);
        if (parent1.id !== parent2.id) { // In case of artificial insemination
            if (!parent2.childrenIds) parent2.childrenIds = [];
            parent2.childrenIds.push(newAgent.id);
        }

        const admin = this.agents.get('agent-admin');
        if (admin) {
            if (!newAgent.relationships) newAgent.relationships = {};
            newAgent.relationships[admin.id] = { type: 'friend', score: 100, disposition: {} };
            if (!admin.relationships) admin.relationships = {};
            admin.relationships[newAgent.id] = { type: 'friend', score: 100, disposition: {} };
        }
        
        this.agents.set(newAgent.id, newAgent);
        this.memoryDBs.set(newAgent.id, new VectorDB());
        this.updateCultureMembership(newAgent);
        return [{ key: 'log_new_child', params: { childName: newAgent.name, parent1Name: parent1.name, parent2Name: parent2.name } }];
    }
    
    private addEntityToSimulation(entity: Entity) {
        this.entities.set(entity.id, entity);
    }
    
    public addSocialMemory(agentId: string, memory: SocialMemoryEntry) {
        const agent = this.agents.get(agentId);
        if(agent) {
            agent.socialMemory.unshift(memory);
            if(agent.socialMemory.length > MAX_SOCIAL_MEMORIES) {
                agent.socialMemory.pop();
            }
        }
    }

    public addNewSanitizedAgent(agent: Agent): void {
        this.agents.set(agent.id, agent);
        const db = new VectorDB();
        if (agent.longTermMemory?.length > 0) {
            db.loadMemories(agent.longTermMemory);
        }
        this.memoryDBs.set(agent.id, db);
        this.updateCultureMembership(agent);
    }
    
    public addNewSanitizedEntity(entity: Entity): void {
        this.entities.set(entity.id, entity);
    }

    public addAgent(name: string, description: string, beliefs: Beliefs, genome: string[] = [], role: string | null = 'Worker', personality?: Personality): void {
        const stress = 10;
        const newAgent: Agent = {
            id: `agent-${Date.now()}`, name, description,
            x: Math.floor(Math.random() * this.worldState.environment.width), y: Math.floor(Math.random() * this.worldState.environment.height),
            beliefNetwork: beliefs, emotions: { happiness: 0.5, sadness: 0.1, anger: 0.1, fear: 0.1, trust: 0.3, love: 0.1 },
            resonance: {}, lastActions: [], socialMemory: [], longTermMemory: [], adminAgent: false, health: 100, isAlive: true,
            sickness: null, conversationHistory: [], age: 20, genome: genome, relationships: {},
            cultureId: null, religionId: null, role: role, offspringCount: 0, childrenIds: [],
            hunger: 0, thirst: 0, fatigue: 0, inventory: {},
            personality: personality || { openness: Math.random(), conscientiousness: Math.random(), extraversion: Math.random(), agreeableness: Math.random(), neuroticism: Math.random() },
            goals: [], stress: stress, socialStatus: 50,
            skills: { healing: 1, woodcutting: 1, rhetoric: 1, combat: 1, construction: 1, farming: 1 }, trauma: [], currency: 50,
            psyche: defaultPsyche(),
            qTable: defaultQTable(),
            lastStressLevel: stress,
        };
        
        const admin = this.agents.get('agent-admin');
        if (admin && !newAgent.adminAgent) {
            if (!newAgent.relationships) newAgent.relationships = {};
            newAgent.relationships[admin.id] = { type: 'friend', score: 100, disposition: {} };

            if (!admin.relationships) admin.relationships = {};
            admin.relationships[newAgent.id] = { type: 'friend', score: 100, disposition: {} };
        }
        
        this.agents.set(newAgent.id, newAgent);
        this.memoryDBs.set(newAgent.id, new VectorDB());
    }

    public addEntity(name: string, description: string): void {
        const newEntity: Entity = {
            id: `entity-${Date.now()}`, name, description,
            x: Math.floor(Math.random() * this.worldState.environment.width), y: Math.floor(Math.random() * this.worldState.environment.height),
        };
        this.entities.set(newEntity.id, newEntity);
    }

    private createCustomActionExecute(action: Action): (agent: Agent, allAgents: Map<string, Agent>, allEntities: Map<string, Entity>, worldState: WorldState, context: ActionContext) => Promise<ActionExecutionResult> {
        return async (agent, allAgents, allEntities, worldState, context) => {
            const effects = action.effects;
            if (!effects) {
                return { log: { key: 'log_action_custom', params: { actionName: action.name, agentName: agent.name } }, status: 'neutral', reward: 0 };
            }

            // 1. Check costs
            if (effects.costs) {
                for (const item in effects.costs) {
                    if ((agent.inventory[item] || 0) < effects.costs[item]) {
                        return { log: { key: 'log_action_custom_fail_cost', params: { agentName: agent.name, actionName: action.name, item, amount: effects.costs[item] } }, status: 'failure', reward: -5 };
                    }
                }
            }

            // 2. Apply costs
            if (effects.costs) {
                for (const item in effects.costs) {
                    agent.inventory[item] -= effects.costs[item];
                    if (agent.inventory[item] <= 0) delete agent.inventory[item];
                    context.logTransaction({ from: agent.id, to: 'WORLD', item: item as any, quantity: effects.costs[item] });
                }
            }

            // 3. Apply stat changes
            let totalReward = 0;
            if (effects.statChanges) {
                const statDeltas = effects.statChanges;
                if(statDeltas.health) agent.health += statDeltas.health;
                if(statDeltas.hunger) agent.hunger += statDeltas.hunger;
                if(statDeltas.thirst) agent.thirst += statDeltas.thirst;
                if(statDeltas.fatigue) agent.fatigue += statDeltas.fatigue;
                if(statDeltas.stress) agent.stress += statDeltas.stress;
                if(statDeltas.currency) {
                     agent.currency += statDeltas.currency;
                     if(statDeltas.currency < 0) {
                        context.logTransaction({ from: agent.id, to: 'WORLD', item: 'currency', quantity: Math.abs(statDeltas.currency) });
                     } else {
                        context.logTransaction({ from: 'WORLD', to: agent.id, item: 'currency', quantity: statDeltas.currency });
                     }
                }

                // Clamp values
                agent.health = Math.max(0, Math.min(100, agent.health));
                agent.hunger = Math.max(0, Math.min(100, agent.hunger));
                agent.thirst = Math.max(0, Math.min(100, agent.thirst));
                agent.fatigue = Math.max(0, Math.min(100, agent.fatigue));
                agent.stress = Math.max(0, Math.min(100, agent.stress));
                agent.currency = Math.max(0, agent.currency);
                
                totalReward += (statDeltas.health || 0) + (statDeltas.currency || 0) - (statDeltas.hunger || 0) - (statDeltas.thirst || 0) - (statDeltas.fatigue || 0) - (statDeltas.stress || 0);
            }

            // 4. Apply skill gain
            if (effects.skillGain) {
                const { skill, amount } = effects.skillGain;
                if(agent.skills[skill] !== undefined) {
                    agent.skills[skill] = (agent.skills[skill] || 0) + amount;
                    totalReward += amount * 2;
                }
            }

            return { log: { key: 'log_action_custom_success', params: { actionName: action.name, agentName: agent.name } }, status: 'success', reward: Math.max(-20, Math.min(20, totalReward)) };
        };
    }

    public addAction(name: string, description: string, beliefKey?: string, effects?: ActionEffect): void {
        const newAction: Action = { name, description, beliefKey, effects };
        newAction.execute = this.createCustomActionExecute(newAction);
        this.actions.set(name, newAction);
    }

    public removeAgent(agentId: string): void { this.agents.delete(agentId); this.memoryDBs.delete(agentId); }
    public removeEntity(entityId: string): void { this.entities.delete(entityId); }
    public removeAction(actionName: string): void { this.actions.delete(actionName); }
    public getAgentById(agentId: string): Agent | undefined { return this.agents.get(agentId); }
    public getEntityById(entityId: string): Entity | undefined { return this.entities.get(entityId); }
    public getAvailableActions(): Action[] { return Array.from(this.actions.values()); }
    public setEnvironment(newState: EnvironmentState): void { this.worldState.environment = newState; }

    public setAgentHealth(agentId: string, health: number) { const agent = this.agents.get(agentId); if (agent) agent.health = Math.max(0, Math.min(100, health)); }
    public setAgentSickness(agentId: string, sickness: string | null) { const agent = this.agents.get(agentId); if (agent) agent.sickness = sickness; }
    public resurrectAgent(agentId: string) { const agent = this.agents.get(agentId); if (agent) { agent.isAlive = true; agent.health = 50; } }
    public setAgentPosition(agentId: string, x: number, y: number): void { const agent = this.agents.get(agentId); if (agent) { agent.x = x; agent.y = y; } }
    
    public setAgentCurrency(agentId: string, currency: number) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.currency = Math.max(0, currency);
        }
    }

    public repealLaw(lawId: string) {
        this.worldState.government.laws = this.worldState.government.laws.filter(l => l.id !== lawId);
        this.updateActionLegality();
    }

    public setLeader(agentId: string): { techUnlocked: boolean, cultureName?: string } {
        const agent = this.agents.get(agentId);
        if (agent) {
            this.worldState.government.leaderId = agentId;
            agent.role = 'Leader';
            // Grant Governance tech to the new leader's culture
            if (agent.cultureId) {
                const culture = this.cultures.get(agent.cultureId);
                if (culture && !culture.knownTechnologies.includes('governance')) {
                    culture.knownTechnologies.push('governance');
                    return { techUnlocked: true, cultureName: culture.name };
                }
            }
        }
        return { techUnlocked: false };
    }

    public imprisonAgent(agentId: string, duration: number): boolean {
        const agent = this.agents.get(agentId);
        const jail = Array.from(this.entities.values()).find(e => e.isJail);
        if (agent && jail && duration > 0) {
            agent.imprisonedUntil = this.worldState.environment.time + duration;
            agent.x = jail.x;
            agent.y = jail.y;
            if (!jail.inmates) {
                jail.inmates = [];
            }
            if (!jail.inmates.includes(agentId)) {
                jail.inmates.push(agentId);
            }
            return true;
        }
        return false;
    }

    public unlockTech(cultureId: string, techId: string) {
        const culture = this.cultures.get(cultureId);
        if (culture && !culture.knownTechnologies.includes(techId)) {
            culture.knownTechnologies.push(techId);
        }
    }

    public applyPsychoanalysis(agentId: string, report: PsychoReport): { logs: LogEntry[] } {
        const agent = this.agents.get(agentId);
        if (!agent) return { logs: [] };
    
        const logs: LogEntry[] = [];
    
        if (report.unconscious_modifiers && Object.keys(report.unconscious_modifiers).length > 0) {
            agent.unconsciousState = { ...(agent.unconsciousState || {}), ...report.unconscious_modifiers };
        }
    
        if (report.suggested_goal && report.suggested_goal.type) {
            // @ts-ignore
            const goalExists = agent.goals.some(g => g.type === report.suggested_goal!.type && g.status === 'active');
            if (!goalExists) {
                const newGoal: Goal = {
                    // @ts-ignore
                    type: report.suggested_goal.type,
                    // @ts-ignore
                    description: report.suggested_goal.description,
                    status: 'active',
                    progress: 0,
                };
                agent.goals.push(newGoal);
                logs.push({ key: 'log_goal_generated', params: { agentName: agent.name, goalDescription: newGoal.description } });
            }
        }
        
        logs.push({ key: 'log_psychoanalysis_applied', params: { agentName: agent.name } });
    
        return { logs };
    }


    public getState(): WorldState {
        this.worldState.agents = Array.from(this.agents.values());
        this.worldState.entities = Array.from(this.entities.values());
        const serializableActions = Array.from(this.actions.values()).map(({ execute, ...rest }) => rest);
        const serializableCultures = Array.from(this.cultures.values());
        
        return {
            ...this.worldState,
            actions: serializableActions,
            cultures: serializableCultures,
            marketPrices: this.marketPrices,
        };
    }
    
    private updateAgentGoals(agent: Agent): LogEntry[] {
        const logs: LogEntry[] = [];
        const hasGoal = (type: Goal['type']) => agent.goals.some(g => g.type === type && g.status === 'active');
    
        if (agent.goals.filter(g => g.status === 'active').length >= 2) {
            return [];
        }
    
        if (agent.emotions.grief > 0.7 && !hasGoal('expressGrief')) {
            const newGoal: Goal = { type: 'expressGrief', status: 'active', progress: 0, description: `Mourn the loss.` };
            agent.goals.push(newGoal);
            logs.push({ key: 'log_goal_generated', params: { agentName: agent.name, goalDescription: newGoal.description } });
            return logs;
        }

        if (agent.psyche.searchForMeaning > 0.8 && !hasGoal('findMeaning')) {
            const newGoal: Goal = { type: 'findMeaning', status: 'active', progress: 0, description: `Find the meaning of life.` };
            agent.goals.push(newGoal);
            logs.push({ key: 'log_goal_generated', params: { agentName: agent.name, goalDescription: newGoal.description } });
            return logs;
        }

        if (agent.socialStatus > 50 && agent.personality.extraversion > 0.7 && !hasGoal('becomeLeader')) {
            const newGoal: Goal = { type: 'becomeLeader', status: 'active', progress: 0, description: `Become the leader of the community.` };
            agent.goals.push(newGoal);
            logs.push({ key: 'log_goal_generated', params: { agentName: agent.name, goalDescription: newGoal.description } });
            return logs;
        }
    
        const totalInventoryValue = Object.entries(agent.inventory).reduce((sum, [item, quantity]) => {
            return sum + (this.marketPrices[item] || 5) * quantity;
        }, 0);
        if (agent.currency < 30 && totalInventoryValue < 50 && agent.personality.conscientiousness > 0.6 && !hasGoal('achieveWealth')) {
             const newGoal: Goal = { type: 'achieveWealth', status: 'active', progress: 0, description: `Achieve wealth by earning at least 200 currency.` };
            agent.goals.push(newGoal);
            logs.push({ key: 'log_goal_generated', params: { agentName: agent.name, goalDescription: newGoal.description } });
            return logs;
        }
    
        return logs;
    }

    private updateAgentRole(agent: Agent): LogEntry[] {
        if (agent.role === 'Worker' && (agent.skills.healing || 0) > 20) {
            agent.role = 'Healer';
            agent.socialStatus = Math.min(100, agent.socialStatus + 10);
            return [{ key: 'log_promotion', params: { agentName: agent.name, newRole: 'Healer' } }];
        }
        return [];
    }

    private applyPersonalityShifts(agent: Agent): void {
        if (!agent.isAlive) return;
    
        // Shift based on chronic stress
        if (agent.stress > STRESS_THRESHOLD_FOR_PERSONALITY_SHIFT && (agent.lastStressLevel || 0) > STRESS_THRESHOLD_FOR_PERSONALITY_SHIFT) {
            agent.personality.neuroticism = Math.min(1, agent.personality.neuroticism + PERSONALITY_SHIFT_RATE);
            agent.personality.openness = Math.max(0, agent.personality.openness - (PERSONALITY_SHIFT_RATE / 2));
        }
    
        // Shift based on social success
        const recentSocialSuccess = agent.socialMemory.slice(0, 5).filter(m => m.action === 'Talk' && m.emotionalImpact > 0).length;
        if (recentSocialSuccess >= 2) {
            agent.personality.extraversion = Math.min(1, agent.personality.extraversion + PERSONALITY_SHIFT_RATE);
        }
    }
    
    private applyPerStepMechanisms(agent: Agent): LogEntry[] {
        if (!agent.isAlive || agent.adminAgent) return [];

        const logs: LogEntry[] = [];

        // Calculate nearby agents first to use for multiple mechanics
        const nearbyAgents = Array.from(this.agents.values()).filter(other => 
            other.id !== agent.id && 
            other.isAlive &&
            !other.adminAgent &&
            Math.sqrt(Math.pow(agent.x - other.x, 2) + Math.pow(agent.y - other.y, 2)) < PROXIMITY_DISTANCE_THRESHOLD
        );

        if (agent.imprisonedUntil && agent.imprisonedUntil <= this.worldState.environment.time) {
            agent.imprisonedUntil = undefined;
            const jail = Array.from(this.entities.values()).find(e => e.isJail);
            if (jail) jail.inmates = jail.inmates?.filter(id => id !== agent.id);
            logs.push({ key: 'log_action_release_from_jail', params: { agentName: agent.name } });
        }
        
        // --- Needs Update ---
        agent.hunger = Math.min(110, agent.hunger + HUNGER_INCREASE_RATE);
        agent.thirst = Math.min(110, agent.thirst + THIRST_INCREASE_RATE);
        agent.fatigue = Math.min(110, agent.fatigue + FATIGUE_INCREASE_RATE);
        if (agent.hunger > 75 || agent.thirst > 75 || agent.fatigue > 90) { agent.stress = Math.min(100, agent.stress + STRESS_FROM_NEEDS); }
        if (agent.hunger > 100) { agent.health -= HEALTH_LOSS_FROM_STARVATION; logs.push({ key: 'log_survival_starving', params: { agentName: agent.name } }); }
        if (agent.thirst > 100) { agent.health -= HEALTH_LOSS_FROM_DEHYDRATION; logs.push({ key: 'log_survival_dehydrated', params: { agentName: agent.name } }); }
        
        // --- Sickness & Age ---
        if (agent.sickness) {
            let sicknessDamage = SICKNESS_HEALTH_LOSS;
            if (agent.genome.includes("G-RESISTANT")) sicknessDamage = 2;
            agent.health -= sicknessDamage;
            logs.push({ key: 'log_survival_sickness', params: { agentName: agent.name, sickness: agent.sickness } });

            // NEW: Spread sickness
            nearbyAgents.forEach(otherAgent => {
                if (!otherAgent.sickness) {
                    let chanceToInfect = 0.1; // Base chance per step
                    if(otherAgent.genome.includes("G-RESISTANT")) {
                        chanceToInfect /= 2;
                    }
                    if (Math.random() < chanceToInfect) {
                        otherAgent.sickness = agent.sickness;
                        logs.push({ key: 'log_sickness_spread', params: { infectedName: otherAgent.name, sourceName: agent.name, sickness: agent.sickness! } });
                    }
                }
            });
        }
        agent.age += AGE_INCREMENT;
        if (agent.age >= MAX_AGE) {
            let ageDamage = AGE_RELATED_HEALTH_DECLINE;
            if (agent.genome.includes("G-LONGEVITY")) ageDamage /= 2;
            agent.health -= ageDamage;
        }

        // --- Death Check ---
        if (agent.health <= 0 && agent.isAlive) { 
            agent.isAlive = false; 
            logs.push({ key: 'log_survival_succumbed_needs', params: { agentName: agent.name } }); 
            // Trigger grief in others
            this.agents.forEach(otherAgent => {
                if(otherAgent.isAlive && otherAgent.relationships[agent.id]) {
                    const rel = otherAgent.relationships[agent.id];
                    if(rel.score > 50) { // If it was a meaningful relationship
                        otherAgent.emotions.grief = Math.min(1, (otherAgent.emotions.grief || 0) + rel.score / 100);
                        logs.push({key: 'log_grief', params: { agentName: otherAgent.name, deceasedName: agent.name }});
                    }
                }
            });
            return logs; 
        }

        // --- Emotion & Psyche Decay ---
        for (const key in agent.emotions) agent.emotions[key] *= EMOTION_DECAY_RATE;
        for (const key in agent.psyche) agent.psyche[key as keyof Psyche] *= PSYCHE_DECAY_RATE;
        agent.stress *= STRESS_DECAY_RATE;

        // If still imprisoned, skip social/movement mechanics
        if (agent.imprisonedUntil) {
            return logs;
        }

        // --- Psyche Updates from State ---
        agent.psyche.fearOfDeath = Math.min(1, agent.psyche.fearOfDeath + (100 - agent.health) / 500);
        if (agent.lastActions.length > 2 && agent.lastActions[0].name === agent.lastActions[1].name && agent.lastActions[1].name === agent.lastActions[2].name) {
            agent.psyche.boredom = Math.min(1, agent.psyche.boredom + BOREDOM_INCREASE_RATE);
        }
        if (agent.religionId) {
            agent.psyche.spiritualNeed = Math.min(1, agent.psyche.spiritualNeed + 0.01);
        }
        
        // --- RELATIONSHIP UPDATES ---
        for (const otherAgent of nearbyAgents) {
            // Ensure relationship objects exist for both agents
            if (!agent.relationships) { agent.relationships = {}; }
            if (!otherAgent.relationships) { otherAgent.relationships = {}; }
        
            // Initialize relationship from agent's perspective if it doesn't exist
            if (!agent.relationships[otherAgent.id]) {
                agent.relationships[otherAgent.id] = { type: 'stranger', score: 0, disposition: {} };
            }
        
            // Initialize relationship from otherAgent's perspective if it doesn't exist
            if (!otherAgent.relationships[agent.id]) {
                otherAgent.relationships[agent.id] = { type: 'stranger', score: 0, disposition: {} };
            }
        
            const agentRel = agent.relationships[otherAgent.id];
            const otherRel = otherAgent.relationships[agent.id];
        
            // Increment score for both, ensuring they stay in sync
            const newScore = Math.min(100, agentRel.score + RELATIONSHIP_INCREMENT_PROXIMITY);
            agentRel.score = newScore;
            otherRel.score = newScore;
    
            // Update relationship type for agent
            if (agentRel.score > 70 && agentRel.type !== 'friend' && agentRel.type !== 'partner' && agentRel.type !== 'spouse') {
                agentRel.type = 'friend';
            } else if (agentRel.score > 20 && agentRel.type === 'stranger') {
                agentRel.type = 'acquaintance';
            }
        
            // Update relationship type for otherAgent symmetrically
            if (otherRel.score > 70 && otherRel.type !== 'friend' && otherRel.type !== 'partner' && otherRel.type !== 'spouse') {
                otherRel.type = 'friend';
            } else if (otherRel.score > 20 && otherRel.type === 'stranger') {
                otherRel.type = 'acquaintance';
            }

            // Jealousy check
            const partner = Object.entries(agent.relationships).find(([id, rel]) => (rel.type === 'spouse' || rel.type === 'partner') && this.agents.get(id)?.isAlive)?.[0];
            if (partner && otherAgent.id === partner && nearbyAgents.some(a => a.id !== agent.id && a.id !== partner)) {
                agent.psyche.jealousy = Math.min(1, agent.psyche.jealousy + 0.05);
            }
        }

        // --- Learning and Development ---
        this.applyPersonalityShifts(agent);
        agent.lastStressLevel = agent.stress;
        
        // --- Goal & Role Updates ---
        if (this.worldState.environment.time % 20 === 1) { 
           logs.push(...this.updateAgentGoals(agent));
           logs.push(...this.updateAgentRole(agent));
        }
        return logs;
    }

    private getAgentStateKey(agent: Agent, allAgents: Map<string, Agent>, allEntities: Map<string, Entity>): string {
        const hungerState = agent.hunger > 75 ? 'hungry' : (agent.hunger > 25 ? 'normal' : 'full');
        const thirstState = agent.thirst > 75 ? 'thirsty' : (agent.thirst > 25 ? 'normal' : 'quenched');
        const fatigueState = agent.fatigue > 85 ? 'tired' : 'rested';
        const isNearFood = !!findNearestEntity(agent, allEntities, e => e.isResource && e.resourceType === 'food' && (e.quantity || 0) > 0);
        const isNearRival = !!findNearestAgent(agent, allAgents, a => agent.relationships[a.id]?.type === 'rival');
        
        return `h:${hungerState},t:${thirstState},f:${fatigueState},food:${isNearFood},rival:${isNearRival}`;
    }

    private chooseAction(agent: Agent): Action | null {
        if (agent.imprisonedUntil) return this.actions.get("Rest") || null;

        const availableActions = this.getAvailableActions().filter(a => {
            const agentCulture = this.cultures.get(agent.cultureId || '');
            if (!agentCulture) return true;
            const techRequirement = TECH_TREE.find(t => t.unlocks.actions?.includes(a.name));
            if (techRequirement && !agentCulture.knownTechnologies.includes(techRequirement.id)) return false;
            return true;
        });
        if (availableActions.length === 0) return null;

        // Epsilon-greedy exploration: 10% chance to choose a random action
        if (Math.random() < EPSILON_GREEDY) {
            return availableActions[Math.floor(Math.random() * availableActions.length)];
        }
        
        const stateKey = this.getAgentStateKey(agent, this.agents, this.entities);
        const actionScores = new Map<Action, number>();
        for (const action of availableActions) {
            let score = Math.random() * 5; 
            if (action.isIllegal) score -= 1000 * agent.personality.conscientiousness;
            
            // Add Q-value from reinforcement learning
            const stateActionKey = `${stateKey}-${action.name}`;
            score += (agent.qTable[stateActionKey] || 0) * 2; // Weight the learned value

            actionScores.set(action, score);
        }

        // --- SURVIVAL, PSYCHE, GOALS ---
        const survivalPriority = 500; 
        if (agent.thirst > 50) { const drinkAction = this.actions.get("Drink Water"); if (drinkAction) actionScores.set(drinkAction, (actionScores.get(drinkAction) || 0) + survivalPriority + agent.thirst * 2); }
        if (agent.hunger > 60) { if ((agent.inventory['food'] || 0) > 0) { const eatAction = this.actions.get("Eat Food"); if (eatAction) actionScores.set(eatAction, (actionScores.get(eatAction) || 0) + survivalPriority + agent.hunger); } else { const gatherFoodAction = this.actions.get("Gather Food"); if (gatherFoodAction) actionScores.set(gatherFoodAction, (actionScores.get(gatherFoodAction) || 0) + survivalPriority + agent.hunger * 1.5); } }
        const restAction = this.actions.get("Rest");
        if (agent.fatigue > 85 && restAction) actionScores.set(restAction, (actionScores.get(restAction) || 0) + agent.fatigue);
        if (agent.psyche.fearOfDeath > 0.6 && restAction) actionScores.set(restAction, (actionScores.get(restAction) || 0) + agent.psyche.fearOfDeath * 50);

        if (agent.emotions.grief > 0.5) { const mournAction = this.actions.get("Mourn"); if (mournAction) actionScores.set(mournAction, (actionScores.get(mournAction) || 0) + agent.emotions.grief * 100); }
        if (agent.psyche.boredom > 0.7) { const randomAction = availableActions[Math.floor(Math.random() * availableActions.length)]; actionScores.set(randomAction, (actionScores.get(randomAction) || 0) + agent.psyche.boredom * 80); }
        if (agent.psyche.spiritualNeed > 0.6) { const meditateAction = this.actions.get("Meditate"); if (meditateAction) actionScores.set(meditateAction, (actionScores.get(meditateAction) || 0) + agent.psyche.spiritualNeed * 70); }
        if (agent.psyche.jealousy > 0.6) { const confrontAction = this.actions.get("Confront Partner"); if (confrontAction) actionScores.set(confrontAction, (actionScores.get(confrontAction) || 0) + agent.psyche.jealousy * 90); }

        agent.goals.forEach(goal => {
            if (goal.type === 'avengeRival' && goal.targetId) { const rival = this.agents.get(goal.targetId); const fightAction = this.actions.get("Fight"); if (rival && fightAction && Math.sqrt(Math.pow(agent.x - rival.x, 2) + Math.pow(agent.y - rival.y, 2)) < PROXIMITY_DISTANCE_THRESHOLD) { actionScores.set(fightAction, (actionScores.get(fightAction) || 0) + 120 + agent.psyche.vengefulness * 50); } }
            if (goal.type === 'becomeLeader') { const runAction = this.actions.get("Run for Election"); if (runAction) actionScores.set(runAction, (actionScores.get(runAction) || 0) + 90); }
            if (goal.type === 'findMeaning') { const meditateAction = this.actions.get("Meditate"); if (meditateAction) actionScores.set(meditateAction, (actionScores.get(meditateAction) || 0) + 100); }
            if (goal.type === 'forgiveRival') { const forgiveAction = this.actions.get("Offer Forgiveness"); if (forgiveAction) actionScores.set(forgiveAction, (actionScores.get(forgiveAction) || 0) + 110); }
        });

        // --- SOCIAL & ROLE ---
        let socialScore = agent.personality.extraversion * 50;
        socialScore += (agent.emotions.pride || 0) * 30;
        socialScore -= (agent.emotions.shame || 0) * 40;
        socialScore -= (agent.emotions.grief || 0) * 50;
        const talkAction = this.actions.get("Talk");
        if (talkAction) actionScores.set(talkAction, (actionScores.get(talkAction) || 0) + socialScore);

        if (agent.role === 'Scientist') { const researchAction = this.actions.get("Research"); if (researchAction) actionScores.set(researchAction, (actionScores.get(researchAction) || 0) + 70 + (agent.psyche.inspiration * 50)); }
        if (agent.role === 'Guard') { const patrolAction = this.actions.get("Patrol"); if (patrolAction) actionScores.set(patrolAction, (actionScores.get(patrolAction) || 0) + 80); }
        if (agent.role === 'Counselor') { const provideHelpAction = this.actions.get("Provide Counseling"); if(provideHelpAction) actionScores.set(provideHelpAction, (actionScores.get(provideHelpAction) || 0) + 85 + (agent.psyche.empathy * 40)); }

        let bestAction: Action | null = null;
        let maxScore = -Infinity;
        for (const [action, score] of actionScores.entries()) { if (score > maxScore) { maxScore = score; bestAction = action; } }
        
        if (maxScore < 5) {
            const wanderActions = ["Move North", "Move South", "Move East", "Move West"];
            return this.actions.get(wanderActions[Math.floor(Math.random() * wanderActions.length)]) || null;
        }
        return bestAction;
    }

    private updateQValue(agent: Agent, stateKey: string, actionName: string, reward: number, newStateKey: string) {
        const stateActionKey = `${stateKey}-${actionName}`;
        const oldQValue = agent.qTable[stateActionKey] || 0;

        // Find the max Q-value for the next state
        let maxNextQ = 0;
        for (const action of this.actions.values()) {
            const nextStateActionKey = `${newStateKey}-${action.name}`;
            const nextQ = agent.qTable[nextStateActionKey] || 0;
            if (nextQ > maxNextQ) {
                maxNextQ = nextQ;
            }
        }
    
        // Q-learning formula
        const newQValue = oldQValue + Q_LEARNING_RATE * (reward + Q_DISCOUNT_FACTOR * maxNextQ - oldQValue);
        agent.qTable[stateActionKey] = newQValue;
    }

    private formatLogToString(log: LogEntry): string {
        let str = log.key;
        if (log.params) {
            str += ' ' + Object.entries(log.params).map(([key, value]) => `${key}=${value}`).join(' ');
        }
        return str;
    }
    
    private async executeAction(agentId: string, action: Action): Promise<{ logs: LogEntry[], sideEffects?: ActionExecutionResult['sideEffects'] }> {
        const agent = this.agents.get(agentId);
        if (!agent || !agent.isAlive) return { logs: [] };
        
        const actionLogs: LogEntry[] = [];
        
        // This pre-emptive check is flawed for probabilistic crimes. The logic is now inside the action itself.
        /*
        if (action.isIllegal) {
            ...
        }
        */

        const worldStateForAction: WorldState = { ...this.getState() };
        const actionContext: ActionContext = {
            language: this.language,
            marketPrices: this.marketPrices,
            addListingToMarket: this.addListingToMarket.bind(this),
            executeTrade: this.executeTrade.bind(this),
            castVote: this.castVote.bind(this),
            declareCandidacy: this.declareCandidacy.bind(this),
            enactLaw: this.enactLaw.bind(this),
            addResearchPoints: this.addResearchPoints.bind(this),
            addSocialMemory: this.addSocialMemory.bind(this),
            logTransaction: this.logTransaction.bind(this),
        };

        const stateKeyBeforeAction = this.getAgentStateKey(agent, this.agents, this.entities);
        const { log, sideEffects, status, reward } = await action.execute!(agent, this.agents, this.entities, worldStateForAction, actionContext);
        actionLogs.push(log);

        // --- LONG-TERM MEMORY CREATION ---
        const memoryContent = this.formatLogToString(log);
        try {
            const embedding = await generateEmbedding(memoryContent, this.settings);
            agent.longTermMemory.push({ content: memoryContent, embedding, timestamp: this.worldState.environment.time });
            if(agent.longTermMemory.length > MAX_LONG_TERM_MEMORIES) agent.longTermMemory.shift();
            this.memoryDBs.get(agent.id)?.addMemory(memoryContent, this.worldState.environment.time, embedding);
        } catch (e) {
            console.error("Failed to generate embedding for memory:", e);
        }

        // Belief Update
        if (status === 'success' && action.onSuccess) {
            const { belief, delta } = action.onSuccess;
            agent.beliefNetwork[belief] = Math.max(0, Math.min(1, (agent.beliefNetwork[belief] || 0) + delta));
        } else if (status === 'failure' && action.onFailure) {
            const { belief, delta } = action.onFailure;
            agent.beliefNetwork[belief] = Math.max(0, Math.min(1, (agent.beliefNetwork[belief] || 0) + delta));
        }
        
        // Q-Table Update
        const stateKeyAfterAction = this.getAgentStateKey(agent, this.agents, this.entities);
        this.updateQValue(agent, stateKeyBeforeAction, action.name, reward, stateKeyAfterAction);


        agent.lastActions = [action, ...agent.lastActions].slice(0, MAX_LAST_ACTIONS);
        const newResonance: Resonance = {};
        for (const key in agent.resonance) { if(agent.resonance[key] * RESONANCE_DECAY_RATE > RESONANCE_THRESHOLD) newResonance[key] = agent.resonance[key] * RESONANCE_DECAY_RATE; }
        newResonance[action.name] = (newResonance[action.name] || 0) + RESONANCE_UPDATE_AMOUNT;
        agent.resonance = newResonance;

        return { logs: actionLogs, sideEffects };
    }
    
    public async step(language: Language): Promise<{ logs: LogEntry[] }> {
        this.language = language;
        const allLogs: LogEntry[] = [];
        this.worldState.environment.time++;
        
        if (this.worldState.environment.time % 10 === 0) this.calculateMarketPrices();

        if (this.worldState.environment.election?.isActive && this.worldState.environment.time >= this.worldState.environment.election.termEndDate) {
            allLogs.push(...this.endElection());
        }
        if (!this.worldState.environment.election || !this.worldState.environment.election.isActive) {
             if(this.worldState.environment.time % ELECTION_TERM_LENGTH === 0) {
                 this.startElection();
                 allLogs.push({ key: 'log_election_started' });
             }
        }

        allLogs.push(...this.checkTechnologyUnlocks());
        
        const agentsToProcess = Array.from(this.agents.values());
        for (const agent of agentsToProcess) {
            if (agent.imprisonedUntil && agent.isAlive) {
                // Since each step represents a week, generate a journal entry on every step they are imprisoned.
                if (this.worldState.environment.time > 0 && this.worldState.environment.time < agent.imprisonedUntil) {
                    const createJournalEntry = async () => {
                        const memoryDB = this.memoryDBs.get(agent.id);
                        let reason = translations[this.language].reason_for_imprisonment_unknown;
                        if (memoryDB) {
                            try {
                                const queryVector = await generateEmbedding("crime arrest steal fight law", this.settings);
                                const relevantMemories = memoryDB.search(queryVector, 3);
                                if (relevantMemories.length > 0) {
                                    reason = relevantMemories.map(m => `[${m.timestamp}] ${m.content}`).join('\n');
                                }
                            } catch(e) {
                                console.error("Could not generate embedding for jail journal reason:", e);
                            }
                        }
        
                        const entry = await generateJailJournalEntry(agent, this.worldState, this.language, reason);
                        if (entry) {
                            if (!agent.jailJournal) {
                                agent.jailJournal = [];
                            }
                            agent.jailJournal.push({
                                timestamp: this.worldState.environment.time,
                                entry: entry
                            });
                        }
                    };
                    // Fire and forget, don't block the simulation step
                    createJournalEntry();
                }
            }
            
            allLogs.push(...this.applyPerStepMechanisms(agent));
            if (!agent.isAlive || agent.adminAgent || agent.imprisonedUntil) continue;
            
            const action = this.chooseAction(agent);
            if (action) {
                const { logs, sideEffects } = await this.executeAction(agent.id, action);
                allLogs.push(...logs);
                if (sideEffects?.createAgent) allLogs.push(...this.addNewbornAgent(sideEffects.createAgent as any));
                if (sideEffects?.createEntity) this.addEntityToSimulation(sideEffects.createEntity as Entity);
            }
        }
        
        return { logs: allLogs };
    }
    
    public async processAgentPrompt(agentId: string, prompt: string): Promise<{ logs: LogEntry[] }> {
        const agent = this.agents.get(agentId);
        if (!agent || !agent.isAlive) return { logs: [] };
        if (agent.imprisonedUntil) return { logs: [{ key: 'log_execution_imprisoned', params: { agentName: agent.name } }] };

        const action = this.promptParser.parse(prompt, this.getAvailableActions());
        
        if (action) {
            const { logs, sideEffects } = await this.executeAction(agentId, action);
            if (sideEffects?.createAgent) this.addNewbornAgent(sideEffects.createAgent as any);
            if (sideEffects?.createEntity) this.addEntityToSimulation(sideEffects.createEntity as Entity);
            return { logs };
        }
        return { logs: [{ key: 'log_execution_actionNotFound', params: { agentName: agent.name, prompt } }] };
    }

    public searchAgentMemory(agentId: string, queryVector: number[], topK: number) {
        const db = this.memoryDBs.get(agentId);
        if (!db) return [];
        return db.search(queryVector, topK);
    }
}
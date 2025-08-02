
import type { WorldState, Agent, Entity, Action, EnvironmentState, Beliefs, Resonance, LogEntry, Relationship, Culture, ActionExecutionResult, Religion, Personality, Skills, Trauma, Goal, Law, TradeOffer, ItemType, SocialMemoryEntry } from '../types';
import { 
    RESONANCE_DECAY_RATE, RESONANCE_THRESHOLD, RESONANCE_UPDATE_AMOUNT, MAX_LAST_ACTIONS,
    AGE_INCREMENT, MAX_AGE, AGE_RELATED_HEALTH_DECLINE,
    RELATIONSHIP_INCREMENT_PROXIMITY, PROXIMITY_DISTANCE_THRESHOLD, EMOTION_DECAY_RATE, DISPOSITION_DECAY_RATE,
    GENOME_OPTIONS, MUTATION_RATE, CULTURAL_ASSIMILATION_RATE, CULTURAL_EVOLUTION_INTERVAL,
    EMOTIONAL_LEARNING_RATE, ELECTION_TERM_LENGTH,
    initialWorldState as defaultWorldState,
    HUNGER_INCREASE_RATE, THIRST_INCREASE_RATE, FATIGUE_INCREASE_RATE,
    HEALTH_LOSS_FROM_DEHYDRATION, HEALTH_LOSS_FROM_STARVATION, SICKNESS_HEALTH_LOSS,
    STRESS_DECAY_RATE, STRESS_FROM_NEEDS, RECIPES, TECH_TREE, DEFAULT_SKILL_GAIN, STATUS_FROM_FIGHT_WIN,
    MAX_SOCIAL_MEMORIES, SKILL_TYPES
} from '../constants';
import { generateAgentConversation } from './geminiService';
import type { Language } from '../contexts/LanguageContext';

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
    public language: Language = 'de'; // Default, will be updated by step
    public marketPrices: { [item: string]: number } = {};


    constructor(initialState: WorldState) {
        this.worldState = JSON.parse(JSON.stringify(initialState)); // Deep copy

        this.worldState.cultures.forEach(culture => this.cultures.set(culture.id, culture));
        this.worldState.religions.forEach(religion => this.religions.set(religion.id, religion));

        this.worldState.agents.forEach(agent => {
             const agentWithDefaults: Agent = {
                personality: { openness: 0.5, conscientiousness: 0.5, extraversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 },
                goals: [], stress: 0, socialStatus: 50,
                skills: { healing: 1, woodcutting: 1, rhetoric: 1, combat: 1, construction: 1, farming: 1, mining: 1, crafting: 1, trading: 1 },
                trauma: [], lastActions: [], conversationHistory: [], socialMemory: [], 
                relationships: agent.relationships || {}, offspringCount: agent.offspringCount || 0,
                role: agent.role || null, religionId: agent.religionId || null,
                hunger: agent.hunger || 0, thirst: agent.thirst || 0, fatigue: agent.fatigue || 0, inventory: agent.inventory || {},
                currency: agent.currency || 50,
                ...agent, 
            };
            this.agents.set(agent.id, agentWithDefaults);
            this.updateCultureMembership(agentWithDefaults);
        });

        this.worldState.entities.forEach(entity => this.entities.set(entity.id, entity));
        
        const defaultActionsMap = new Map<string, Action>();
        defaultWorldState.actions.forEach(action => defaultActionsMap.set(action.name, action));

        this.worldState.actions.forEach(action => {
            const defaultAction = defaultActionsMap.get(action.name);
            const finalAction: Action = { 
                name: action.name, description: action.description, beliefKey: action.beliefKey,
                // @ts-ignore
                execute: async (agent, allAgents, allEntities, worldState, engine) => ({ log: { key: 'log_action_custom', params: { actionName: action.name, agentName: agent.name } } })
            };
            if (defaultAction?.execute) finalAction.execute = defaultAction.execute;
            this.actions.set(action.name, finalAction);
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

        buyer.currency -= totalCost;
        seller.currency += totalCost;
        buyer.inventory[offer.item] = (buyer.inventory[offer.item] || 0) + offer.quantity;
        
        market.listings = market.listings.filter(l => l.offerId !== offer.offerId);
        
        let skillGain = DEFAULT_SKILL_GAIN;
        if (buyer.genome.includes("G-INTELLIGENT")) skillGain *= 1.25;
        buyer.skills.trading = (buyer.skills.trading || 0) + skillGain;
        
        let sellerSkillGain = DEFAULT_SKILL_GAIN;
        if (seller.genome.includes("G-INTELLIGENT")) sellerSkillGain *= 1.25;
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
        const election = this.worldState.environment.election;
        if (!election || !election.isActive) return [];

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
            if(winner) winner.socialStatus = Math.min(100, winner.socialStatus + 20);
            return [{ key: 'log_election_winner', params: { winnerName: winner?.name, votes: maxVotes } }];
        }
        
        return [{ key: 'log_election_no_winner', params: { oldLeaderName: oldLeaderName || 'Niemand' } }];
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
    
    private addNewbornAgent(data: Partial<Agent> & { name: string, description: string, parents: [Agent, Agent] }): LogEntry[] {
        const [parent1, parent2] = data.parents;
        const newAgent: Agent = {
            id: `agent-${Date.now()}`, name: data.name, description: data.description,
            x: parent1.x + (Math.random() > 0.5 ? 1 : -1), y: parent1.y + (Math.random() > 0.5 ? 1 : -1),
            beliefNetwork: Object.keys(parent1.beliefNetwork).reduce((acc, key) => ({...acc, [key]: (parent1.beliefNetwork[key] + parent2.beliefNetwork[key]) / 2}), {} as Beliefs),
            emotions: { happiness: 0.6, sadness: 0.1, anger: 0.0, fear: 0.2, trust: 0.5, love: 0.5 },
            resonance: {}, lastActions: [], socialMemory: [], adminAgent: false, health: 100, isAlive: true, sickness: null,
            conversationHistory: [], age: 0, genome: this.inheritGenome(parent1, parent2), relationships: {},
            cultureId: parent1.cultureId, religionId: parent1.religionId, role: 'Worker', offspringCount: 0,
            hunger: 0, thirst: 0, fatigue: 0, inventory: {}, personality: this.inheritPersonality(parent1, parent2),
            goals: [], stress: 5, socialStatus: (parent1.socialStatus + parent2.socialStatus) / 3,
            skills: SKILL_TYPES.reduce((acc, skill) => ({ ...acc, [skill]: 0 }), {} as Skills),
            trauma: [],
            currency: 10
        };
        this.agents.set(newAgent.id, newAgent);
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

    public addAgent(name: string, description: string, beliefs: Beliefs, genome: string[] = [], role: string | null = 'Worker', personality?: Personality): void {
        const newAgent: Agent = {
            id: `agent-${Date.now()}`, name, description,
            x: Math.floor(Math.random() * this.worldState.environment.width), y: Math.floor(Math.random() * this.worldState.environment.height),
            beliefNetwork: beliefs, emotions: { happiness: 0.5, sadness: 0.1, anger: 0.1, fear: 0.1, trust: 0.3, love: 0.1 },
            resonance: {}, lastActions: [], socialMemory: [], adminAgent: false, health: 100, isAlive: true,
            sickness: null, conversationHistory: [], age: 20, genome: genome, relationships: {},
            cultureId: null, religionId: null, role: role, offspringCount: 0,
            hunger: 0, thirst: 0, fatigue: 0, inventory: {},
            personality: personality || { openness: Math.random(), conscientiousness: Math.random(), extraversion: Math.random(), agreeableness: Math.random(), neuroticism: Math.random() },
            goals: [], stress: 10, socialStatus: 50,
            skills: { healing: 1, woodcutting: 1, rhetoric: 1, combat: 1, construction: 1, farming: 1 }, trauma: [], currency: 50,
        };
        this.agents.set(newAgent.id, newAgent);
    }

    public addEntity(name: string, description: string): void {
        const newEntity: Entity = {
            id: `entity-${Date.now()}`, name, description,
            x: Math.floor(Math.random() * this.worldState.environment.width), y: Math.floor(Math.random() * this.worldState.environment.height),
        };
        this.entities.set(newEntity.id, newEntity);
    }

    public addAction(name: string, description: string, beliefKey?: string): void {
        // @ts-ignore
        const newAction: Action = { name, description, beliefKey, execute: async (agent) => ({ log: { key: 'log_action_custom', params: { actionName: name, agentName: agent.name } } })};
        this.actions.set(name, newAction);
    }

    public removeAgent(agentId: string): void { this.agents.delete(agentId); }
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

    public setLeader(agentId: string) {
        if (this.agents.has(agentId)) {
            this.worldState.government.leaderId = agentId;
        }
    }

    public unlockTech(cultureId: string, techId: string) {
        const culture = this.cultures.get(cultureId);
        if (culture && !culture.knownTechnologies.includes(techId)) {
            culture.knownTechnologies.push(techId);
        }
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
    
        // Only add a new goal if the agent has less than 2 active goals
        if (agent.goals.filter(g => g.status === 'active').length >= 2) {
            return [];
        }
    
        // Goal: Become leader
        if (agent.socialStatus > 50 && agent.personality.extraversion > 0.7 && !hasGoal('becomeLeader')) {
            const newGoal: Goal = {
                type: 'becomeLeader', status: 'active', progress: 0,
                description: `Become the leader of the community.`
            };
            agent.goals.push(newGoal);
            logs.push({ key: 'log_goal_generated', params: { agentName: agent.name, goalDescription: newGoal.description } });
            return logs; // Return after adding one goal to avoid adding multiple at once
        }
    
        // Goal: Achieve Wealth
        const totalInventoryValue = Object.entries(agent.inventory).reduce((sum, [item, quantity]) => {
            return sum + (this.marketPrices[item] || 5) * quantity;
        }, 0);
        if (agent.currency < 30 && totalInventoryValue < 50 && agent.personality.conscientiousness > 0.6 && !hasGoal('achieveWealth')) {
             const newGoal: Goal = {
                type: 'achieveWealth', status: 'active', progress: 0,
                description: `Achieve wealth by earning at least 200 currency.`
            };
            agent.goals.push(newGoal);
            logs.push({ key: 'log_goal_generated', params: { agentName: agent.name, goalDescription: newGoal.description } });
            return logs;
        }
        
        // Goal: Master a skill
        const skills = Object.entries(agent.skills || {}).sort(([,a],[,b]) => b - a);
        if (skills.length > 0) {
            const bestSkill = skills[0];
            if (bestSkill[1] > 10 && bestSkill[1] < 50 && agent.personality.openness > 0.5 && !hasGoal('masterSkill')) {
                const newGoal: Goal = {
                    type: 'masterSkill', status: 'active', progress: 0,
                    description: `Become a master of ${bestSkill[0]}.`,
                    targetId: bestSkill[0]
                };
                agent.goals.push(newGoal);
                logs.push({ key: 'log_goal_generated', params: { agentName: agent.name, goalDescription: newGoal.description } });
                return logs;
            }
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
    
    private applyPerStepMechanisms(agent: Agent): LogEntry[] {
        if (!agent.isAlive || agent.adminAgent) return [];

        const logs: LogEntry[] = [];

        if (agent.imprisonedUntil && agent.imprisonedUntil <= this.worldState.environment.time) {
            agent.imprisonedUntil = undefined;
            const jail = Array.from(this.entities.values()).find(e => e.isJail);
            if (jail) jail.inmates = jail.inmates?.filter(id => id !== agent.id);
            logs.push({ key: 'log_action_release_from_jail', params: { agentName: agent.name } });
        }
        if (agent.imprisonedUntil) return logs;

        agent.hunger = Math.min(110, agent.hunger + HUNGER_INCREASE_RATE);
        agent.thirst = Math.min(110, agent.thirst + THIRST_INCREASE_RATE);
        agent.fatigue = Math.min(110, agent.fatigue + FATIGUE_INCREASE_RATE);
        if (agent.hunger > 75 || agent.thirst > 75 || agent.fatigue > 90) { agent.stress = Math.min(100, agent.stress + STRESS_FROM_NEEDS); }
        if (agent.hunger > 100) { agent.health -= HEALTH_LOSS_FROM_STARVATION; logs.push({ key: 'log_survival_starving', params: { agentName: agent.name } }); }
        if (agent.thirst > 100) { agent.health -= HEALTH_LOSS_FROM_DEHYDRATION; logs.push({ key: 'log_survival_dehydrated', params: { agentName: agent.name } }); }
        
        if (agent.sickness) {
            let sicknessDamage = SICKNESS_HEALTH_LOSS;
            if (agent.genome.includes("G-RESISTANT")) sicknessDamage = 2;
            agent.health -= sicknessDamage;
            logs.push({ key: 'log_survival_sickness', params: { agentName: agent.name, sickness: agent.sickness } });
        }

        agent.age += AGE_INCREMENT;
        if (agent.age >= MAX_AGE) {
            let ageDamage = AGE_RELATED_HEALTH_DECLINE;
            if (agent.genome.includes("G-LONGEVITY")) ageDamage /= 2;
            agent.health -= ageDamage;
        }

        if (agent.health <= 0 && agent.isAlive) { agent.isAlive = false; logs.push({ key: 'log_survival_succumbed_needs', params: { agentName: agent.name } }); return logs; }
        for (const key in agent.emotions) agent.emotions[key] *= EMOTION_DECAY_RATE;
        agent.stress *= STRESS_DECAY_RATE;
        
        // --- RELATIONSHIP UPDATES ---
        const nearbyAgents = Array.from(this.agents.values()).filter(other => 
            other.id !== agent.id && 
            other.isAlive &&
            !other.adminAgent &&
            Math.sqrt(Math.pow(agent.x - other.x, 2) + Math.pow(agent.y - other.y, 2)) < PROXIMITY_DISTANCE_THRESHOLD
        );

        for (const otherAgent of nearbyAgents) {
            if (!agent.relationships[otherAgent.id]) {
                agent.relationships[otherAgent.id] = { type: 'acquaintance', score: 0, disposition: {} };
            }
            
            const currentRelationship = agent.relationships[otherAgent.id];
            // Only increment if not maxed out
            if (currentRelationship.score < 100) {
                currentRelationship.score = Math.min(100, currentRelationship.score + RELATIONSHIP_INCREMENT_PROXIMITY);
            }
    
            if (currentRelationship.score > 70 && currentRelationship.type !== 'friend' && currentRelationship.type !== 'partner' && currentRelationship.type !== 'spouse') {
                currentRelationship.type = 'friend';
            } else if (currentRelationship.score > 20 && currentRelationship.type === 'stranger') {
                currentRelationship.type = 'acquaintance';
            }
        }
        // --- END RELATIONSHIP UPDATES ---

        if (this.worldState.environment.time % 20 === 1) { 
           logs.push(...this.updateAgentGoals(agent));
           logs.push(...this.updateAgentRole(agent));
        }
        return logs;
    }

    private chooseAction(agent: Agent): Action | null {
        if (agent.imprisonedUntil) return this.actions.get("Rest") || null;

        const availableActions = this.getAvailableActions().filter(a => {
            const agentCulture = this.cultures.get(agent.cultureId || '');
            if (!agentCulture) return true;
            // Filter out actions that require un-researched tech
            const techRequirement = TECH_TREE.find(t => t.unlocks.actions?.includes(a.name));
            if (techRequirement && !agentCulture.knownTechnologies.includes(techRequirement.id)) return false;
            return true;
        });
        if (availableActions.length === 0) return null;

        const actionScores = new Map<Action, number>();
        for (const action of availableActions) {
            let score = 0;
            if (action.isIllegal) score -= 1000 * agent.personality.conscientiousness;
            actionScores.set(action, score);
        }

        if (agent.hunger > 75) actionScores.set(this.actions.get("Eat Food")!, (actionScores.get(this.actions.get("Eat Food")!) || 0) + 100);
        if (agent.thirst > 75) actionScores.set(this.actions.get("Drink Water")!, (actionScores.get(this.actions.get("Drink Water")!) || 0) + 100);
        if (agent.fatigue > 90) actionScores.set(this.actions.get("Rest")!, (actionScores.get(this.actions.get("Rest")!) || 0) + 100);
        if (agent.currency < 20) actionScores.set(this.actions.get("Work for money")!, (actionScores.get(this.actions.get("Work for money")!) || 0) + 80);

        agent.goals.forEach(goal => {
            if (goal.type === 'avengeRival' && goal.targetId) {
                const rival = this.agents.get(goal.targetId);
                if (rival && Math.sqrt(Math.pow(agent.x - rival.x, 2) + Math.pow(agent.y - rival.y, 2)) < PROXIMITY_DISTANCE_THRESHOLD) {
                    actionScores.set(this.actions.get("Fight")!, (actionScores.get(this.actions.get("Fight")!) || 0) + 120);
                }
            }
            if (goal.type === 'becomeLeader') {
                 actionScores.set(this.actions.get("Run for Election")!, (actionScores.get(this.actions.get("Run for Election")!) || 0) + 90);
            }
        });

        if (agent.role === 'Scientist') actionScores.set(this.actions.get("Research")!, (actionScores.get(this.actions.get("Research")!) || 0) + 70);
        if (agent.role === 'Guard') actionScores.set(this.actions.get("Patrol")!, (actionScores.get(this.actions.get("Patrol")!) || 0) + 80);
        if (agent.role === 'Crafter') {
            const craftable = RECIPES.find(r => (this.cultures.get(agent.cultureId || '')?.knownTechnologies.includes(r.requiredTech || '')) );
            if(craftable) actionScores.set(this.actions.get(craftable.name)!, (actionScores.get(this.actions.get(craftable.name)!) || 0) + 60);
        }

        const nearbyAgents = Array.from(this.agents.values()).filter(other => other.id !== agent.id && other.isAlive && Math.sqrt(Math.pow(agent.x - other.x, 2) + Math.pow(agent.y - other.y, 2)) < PROXIMITY_DISTANCE_THRESHOLD);
        if (nearbyAgents.length > 0) {
            let socialScore = 30 + (agent.personality.extraversion * 30) - (agent.stress * 0.5) - (agent.fatigue > 70 ? 20 : 0);
            if(agent.genome.includes('G-SOCIAL')) socialScore += 50;
            const talkAction = this.actions.get("Talk");
            if (talkAction) actionScores.set(talkAction, (actionScores.get(talkAction) || 0) + socialScore);
        }

        let bestAction: Action | null = null;
        let maxScore = -Infinity;
        for (const [action, score] of actionScores.entries()) { if (score > maxScore) { maxScore = score; bestAction = action; } }
        if (maxScore < 5) {
            const wanderActions = ["Move North", "Move South", "Move East", "Move West"];
            return this.actions.get(wanderActions[Math.floor(Math.random() * wanderActions.length)]) || null;
        }
        return bestAction;
    }
    
    private async executeAction(agentId: string, action: Action): Promise<{ logs: LogEntry[], sideEffects?: ActionExecutionResult['sideEffects'] }> {
        const agent = this.agents.get(agentId);
        if (!agent || !agent.isAlive) return { logs: [] };
        
        const actionLogs: LogEntry[] = [];
        if (action.isIllegal) {
            const law = this.worldState.government.laws.find(l => l.violatingAction === action.name);
            const nearbyGuards = Array.from(this.agents.values()).filter(a => a.role === 'Guard' && a.isAlive && Math.sqrt(Math.pow(agent.x - a.x, 2) + Math.pow(agent.y - a.y, 2)) < 5);

            if (law && nearbyGuards.length > 0) {
                 const guard = nearbyGuards[0];
                 agent.socialStatus = Math.max(0, agent.socialStatus - 15);
                 if (law.punishment.type === 'fine') {
                     agent.currency = Math.max(0, agent.currency - law.punishment.amount);
                     actionLogs.push({ key: 'log_law_violation', params: { agentName: agent.name, lawName: law.name, punishment: law.punishment.amount } });
                 } else if (law.punishment.type === 'arrest') {
                     const jail = Array.from(this.entities.values()).find(e => e.isJail);
                     if (jail) {
                         agent.x = jail.x;
                         agent.y = jail.y;
                         agent.imprisonedUntil = this.worldState.environment.time + law.punishment.amount;
                         jail.inmates = [...(jail.inmates || []), agent.id];
                         actionLogs.push({ key: 'log_action_arrest_success', params: { guardName: guard.name, criminalName: agent.name } });
                     }
                 }
                 return { logs: actionLogs };
            }
        }

        const worldStateForAction: WorldState = { ...this.getState() };
        const { log, sideEffects } = await action.execute!(agent, this.agents, this.entities, worldStateForAction, this);
        actionLogs.push(log);

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
            allLogs.push(...this.applyPerStepMechanisms(agent));
            if (!agent.isAlive || agent.adminAgent || agent.imprisonedUntil) continue;
            
            const action = this.chooseAction(agent);
            if (action) {
                const { logs, sideEffects } = await this.executeAction(agent.id, action);
                allLogs.push(...logs);
                if (sideEffects?.createAgent) allLogs.push(...this.addNewbornAgent(sideEffects.createAgent));
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
            if (sideEffects?.createAgent) this.addNewbornAgent(sideEffects.createAgent);
            if (sideEffects?.createEntity) this.addEntityToSimulation(sideEffects.createEntity as Entity);
            return { logs };
        }
        return { logs: [{ key: 'log_execution_actionNotFound', params: { agentName: agent.name, prompt } }] };
    }
}

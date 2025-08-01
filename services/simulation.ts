
import type { WorldState, Agent, Entity, Action, EnvironmentState, Beliefs, Resonance, LogEntry, Relationship, RelationshipType, Culture, ActionExecutionResult, Emotions, Religion } from '../types';
import { 
    RESONANCE_DECAY_RATE, RESONANCE_THRESHOLD, RESONANCE_UPDATE_AMOUNT, MAX_LAST_ACTIONS,
    AGE_INCREMENT, MAX_AGE, AGE_RELATED_HEALTH_DECLINE,
    RELATIONSHIP_INCREMENT_CONVERSATION, RELATIONSHIP_INCREMENT_PROXIMITY,
    PROXIMITY_DISTANCE_THRESHOLD, EMOTION_DECAY_RATE, DISPOSITION_DECAY_RATE, MAX_SOCIAL_MEMORIES,
    GENOME_OPTIONS, MUTATION_RATE, CULTURAL_ASSIMILATION_RATE, CULTURAL_EVOLUTION_INTERVAL,
    EMOTIONAL_LEARNING_RATE, ADULTHOOD_MAX_AGE, RELIGIOUS_ASSIMILATION_RATE,
    initialWorldState as defaultWorldState,
    HUNGER_INCREASE_RATE, THIRST_INCREASE_RATE, FATIGUE_INCREASE_RATE,
    HEALTH_LOSS_FROM_DEHYDRATION, HEALTH_LOSS_FROM_STARVATION
} from '../constants';
import { generateAgentConversation } from './geminiService';
import type { Language } from '../contexts/LanguageContext';

class PromptParser {
    public parse(prompt: string, availableActions: Action[]): Action | null {
        const p = prompt.toLowerCase().trim();
        
        for (const action of availableActions) {
            if (action.name.toLowerCase() === p) {
                return action;
            }
        }

        for (const action of availableActions) {
            if (p.includes(action.name.toLowerCase()) || action.name.toLowerCase().includes(p)) {
                return action;
            }
        }
        
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
    private environment: EnvironmentState;
    private agents: Map<string, Agent> = new Map();
    private entities: Map<string, Entity> = new Map();
    private actions: Map<string, Action> = new Map();
    private cultures: Map<string, Culture> = new Map();
    private religions: Map<string, Religion> = new Map();
    private promptParser: PromptParser = new PromptParser();
    private conversations = new Map<string, Conversation>();

    constructor(initialState: WorldState) {
        this.environment = { ...initialState.environment };

        // Initialize Cultures
        (initialState.cultures || []).forEach(culture => this.cultures.set(culture.id, { ...culture, memberIds: [] }));

        // Initialize Religions
        (initialState.religions || []).forEach(religion => this.religions.set(religion.id, { ...religion, memberIds: [] }));

        initialState.agents.forEach(agent => {
            const agentWithDefaults = { 
                ...agent, 
                lastActions: [], 
                conversationHistory: [], 
                socialMemory: [], 
                relationships: agent.relationships || {},
                offspringCount: agent.offspringCount || 0,
                role: agent.role || null,
                religionId: agent.religionId || null,
                hunger: agent.hunger || 0,
                thirst: agent.thirst || 0,
                fatigue: agent.fatigue || 0,
                inventory: agent.inventory || {},
            };
            this.addAgentToSimulation(agentWithDefaults);
        });

        initialState.entities.forEach(entity => this.entities.set(entity.id, { ...entity }));
        
        // Re-hydrate actions with their execute functions
        const defaultActionsMap = new Map<string, Action>();
        defaultWorldState.actions.forEach(action => defaultActionsMap.set(action.name, action));

        initialState.actions.forEach(action => {
            const defaultAction = defaultActionsMap.get(action.name);
            const finalAction: Action = { 
                name: action.name, 
                description: action.description,
                beliefKey: action.beliefKey,
                // A generic execute function for custom actions created by the user
                execute: (agent, allAgents, allEntities, env) => ({ newEnvironment: env, log: { key: 'log_action_custom', params: { actionName: action.name, agentName: agent.name } } })
            };

            if (defaultAction && typeof defaultAction.execute === 'function') {
                // If it's a default action, use its hardcoded execute function
                finalAction.execute = defaultAction.execute;
            }
            
            this.actions.set(action.name, finalAction);
        });
    }
    
    public inheritGenome(parent1: Agent, parent2: Agent): string[] {
        const p1Genome = parent1.genome;
        const p2Genome = parent2.genome;
        const combined = [...new Set([...p1Genome, ...p2Genome])]; // Combine unique genes
        
        // Inherit roughly half of the combined unique genes
        const inheritedCount = Math.ceil(combined.length / 2);
        const shuffled = combined.sort(() => 0.5 - Math.random());
        let childGenome = shuffled.slice(0, inheritedCount);

        // Apply mutation
        childGenome = childGenome.map(gene => {
            if (Math.random() < MUTATION_RATE) {
                // Mutate: swap for a random gene from all options
                const randomGene = GENOME_OPTIONS[Math.floor(Math.random() * GENOME_OPTIONS.length)];
                return randomGene;
            }
            return gene;
        });

        return [...new Set(childGenome)]; // Ensure unique genes after mutation
    }
    
    private addNewbornAgent(data: Partial<Agent> & { name: string, description: string, parents: [Agent, Agent] }) {
        const [parent1, parent2] = data.parents;
        const newAgent: Agent = {
            id: `agent-${Date.now()}`,
            name: data.name,
            description: data.description,
            x: parent1.x + (Math.random() > 0.5 ? 1 : -1),
            y: parent1.y + (Math.random() > 0.5 ? 1 : -1),
            beliefNetwork: Object.keys(parent1.beliefNetwork).reduce((acc, key) => {
                acc[key] = (parent1.beliefNetwork[key] + parent2.beliefNetwork[key]) / 2;
                return acc;
            }, {} as Beliefs),
            emotions: { happiness: 0.6, sadness: 0.1, anger: 0.0, fear: 0.2, trust: 0.5, love: 0.5 },
            resonance: {},
            lastActions: [],
            socialMemory: [],
            adminAgent: false,
            health: 100,
            isAlive: true,
            sickness: null,
            conversationHistory: [],
            age: 0,
            genome: this.inheritGenome(parent1, parent2),
            relationships: {},
            cultureId: parent1.cultureId,
            religionId: parent1.religionId, // Inherits religion
            role: 'Worker', // Newborns start as Workers
            offspringCount: 0,
            hunger: 0,
            thirst: 0,
            fatigue: 0,
            inventory: {},
        };
        this.addAgentToSimulation(newAgent);
    }
    
    private addEntityToSimulation(entity: Entity) {
        this.entities.set(entity.id, entity);
    }

    private addAgentToSimulation(agent: Agent) {
        this.agents.set(agent.id, agent);
        if (agent.cultureId && this.cultures.has(agent.cultureId)) {
            this.cultures.get(agent.cultureId)!.memberIds.push(agent.id);
        }
         if (agent.religionId && this.religions.has(agent.religionId)) {
            this.religions.get(agent.religionId)!.memberIds.push(agent.id);
        }
    }


    public addAgent(name: string, description: string, beliefs: Beliefs, genome: string[] = [], role: string | null = 'Worker'): void {
        const newAgent: Agent = {
            id: `agent-${Date.now()}`,
            name,
            description,
            x: Math.floor(Math.random() * this.environment.width),
            y: Math.floor(Math.random() * this.environment.height),
            beliefNetwork: beliefs,
            emotions: { happiness: 0.5, sadness: 0.1, anger: 0.1, fear: 0.1, trust: 0.3, love: 0.1 },
            resonance: {},
            lastActions: [],
            socialMemory: [],
            adminAgent: false,
            health: 100,
            isAlive: true,
            sickness: null,
            conversationHistory: [],
            age: 20, // Start as an adult
            genome: genome,
            relationships: {},
            cultureId: null,
            religionId: null,
            role: role,
            offspringCount: 0,
            hunger: 0,
            thirst: 0,
            fatigue: 0,
            inventory: {},
        };
        this.agents.set(newAgent.id, newAgent);
    }

    public addEntity(name: string, description: string): void {
        const newEntity: Entity = {
            id: `entity-${Date.now()}`,
            name,
            description,
            x: Math.floor(Math.random() * this.environment.width),
            y: Math.floor(Math.random() * this.environment.height),
        };
        this.entities.set(newEntity.id, newEntity);
    }

    public addAction(name: string, description: string, beliefKey?: string): void {
        const newAction: Action = {
            name,
            description,
            beliefKey,
            execute: (agent, allAgents, allEntities, env) => ({ newEnvironment: env, log: { key: 'log_action_custom', params: { actionName: name, agentName: agent.name } } })
        };
        this.actions.set(name, newAction);
    }

    public removeAgent(agentId: string): void {
        const agent = this.agents.get(agentId);
        if (agent) {
             if (agent.cultureId) {
                const culture = this.cultures.get(agent.cultureId);
                if (culture) {
                    culture.memberIds = culture.memberIds.filter(id => id !== agentId);
                }
            }
            if (agent.religionId) {
                const religion = this.religions.get(agent.religionId);
                if (religion) {
                    religion.memberIds = religion.memberIds.filter(id => id !== agentId);
                }
            }
        }
        this.agents.delete(agentId);
    }

    public removeEntity(entityId: string): void {
        this.entities.delete(entityId);
    }

    public removeAction(actionName: string): void {
        this.actions.delete(actionName);
    }

    public getAgentById(agentId: string): Agent | undefined {
        return this.agents.get(agentId);
    }

    public getEntityById(entityId: string): Entity | undefined {
        return this.entities.get(entityId);
    }
    
    public getAvailableActions(): Action[] {
        return Array.from(this.actions.values());
    }

    public setEnvironment(newState: EnvironmentState): void {
        this.environment = newState;
    }

    public setAgentPosition(agentId: string, x: number, y: number): void {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.x = Math.max(0, Math.min(this.environment.width - 1, x));
            agent.y = Math.max(0, Math.min(this.environment.height - 1, y));
        }
    }

    public setAgentHealth(agentId: string, health: number): void {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.health = Math.max(0, Math.min(100, health));
            if (agent.health <= 0) {
                agent.isAlive = false;
            } else {
                agent.isAlive = true;
            }
        }
    }

    public setAgentSickness(agentId: string, sickness: string | null): void {
        const agent = this.agents.get(agentId);
        if (agent && agent.isAlive) {
            agent.sickness = sickness;
        }
    }

    public resurrectAgent(agentId: string): void {
        const agent = this.agents.get(agentId);
        if (agent && !agent.isAlive) {
            agent.isAlive = true;
            agent.health = 50;
            agent.sickness = null;
            agent.age = Math.min(agent.age, MAX_AGE - 10);
            agent.hunger = 0;
            agent.thirst = 0;
            agent.fatigue = 0;
        }
    }

    private handleReligionChange(agentId: string, newReligionId: string | null) {
        const agent = this.agents.get(agentId);
        if (!agent) return;

        // Remove from old religion
        const oldReligionId = agent.religionId;
        if (oldReligionId && this.religions.has(oldReligionId)) {
            const oldReligion = this.religions.get(oldReligionId)!;
            oldReligion.memberIds = oldReligion.memberIds.filter(id => id !== agentId);
        }

        // Add to new religion
        agent.religionId = newReligionId;
        if (newReligionId && this.religions.has(newReligionId)) {
            const newReligion = this.religions.get(newReligionId)!;
            if (!newReligion.memberIds.includes(agentId)) {
                newReligion.memberIds.push(agentId);
            }
        }
    }

    public getState(): WorldState {
        const deepClonedAgents = Array.from(this.agents.values()).map(a => JSON.parse(JSON.stringify(a)));
        
        // When serializing actions, remove the execute function
        const serializableActions = Array.from(this.actions.values()).map(({ execute, ...rest }) => rest);

        return {
            environment: { ...this.environment },
            agents: deepClonedAgents,
            entities: Array.from(this.entities.values()).map(e => ({...e})),
            actions: serializableActions,
            cultures: Array.from(this.cultures.values()).map(c => ({...c})),
            religions: Array.from(this.religions.values()).map(r => ({...r})),
        };
    }
    
    private applyPerStepMechanisms(agent: Agent): LogEntry[] {
        if (!agent.isAlive || agent.adminAgent) return [];
        const logs: LogEntry[] = [];
        
        // 1. Needs update
        agent.hunger = Math.min(110, agent.hunger + HUNGER_INCREASE_RATE);
        agent.thirst = Math.min(110, agent.thirst + THIRST_INCREASE_RATE);
        agent.fatigue = Math.min(110, agent.fatigue + FATIGUE_INCREASE_RATE);
        
        // 2. Health loss from needs
        if (agent.hunger > 100) {
            agent.health = Math.max(0, agent.health - HEALTH_LOSS_FROM_STARVATION);
            logs.push({ key: 'log_survival_starving', params: { agentName: agent.name } });
        }
        if (agent.thirst > 100) {
            agent.health = Math.max(0, agent.health - HEALTH_LOSS_FROM_DEHYDRATION);
            logs.push({ key: 'log_survival_dehydrated', params: { agentName: agent.name } });
        }
        if (agent.health <= 0 && agent.isAlive) {
            agent.isAlive = false;
            logs.push({ key: 'log_survival_succumbed_needs', params: { agentName: agent.name } });
            return logs;
        }

        // 3. Aging & Health Decline
        agent.age += AGE_INCREMENT;
        if (agent.age >= MAX_AGE) {
            let healthDecline = AGE_RELATED_HEALTH_DECLINE;
            if (agent.genome.includes("G-LONGEVITY")) healthDecline /= 2;
            agent.health = Math.max(0, agent.health - healthDecline);
            logs.push({ key: 'log_aging_healthDecline', params: { agentName: agent.name, age: agent.age.toFixed(1) } });
            if (agent.health <= 0 && agent.isAlive) {
                agent.health = 0;
                agent.isAlive = false;
                logs.push({ key: 'log_aging_succumbed', params: { agentName: agent.name } });
                return logs;
            }
        }

        // 4. Emotion & Disposition Decay
        if (agent.emotions) {
            for (const key in agent.emotions) agent.emotions[key] *= EMOTION_DECAY_RATE;
        }
        if (agent.relationships) {
            for (const relId in agent.relationships) {
                const disposition = agent.relationships[relId].disposition;
                for (const key in disposition) disposition[key] *= DISPOSITION_DECAY_RATE;
            }
        }

        // 5. Cultural & Religious Assimilation
        if (agent.cultureId && this.cultures.has(agent.cultureId)) {
            const culture = this.cultures.get(agent.cultureId)!;
            for (const key in culture.sharedBeliefs) {
                if (agent.beliefNetwork[key] !== undefined) {
                    agent.beliefNetwork[key] = (1 - CULTURAL_ASSIMILATION_RATE) * agent.beliefNetwork[key] + CULTURAL_ASSIMILATION_RATE * culture.sharedBeliefs[key];
                }
            }
        }
        if (agent.religionId && this.religions.has(agent.religionId)) {
            const religion = this.religions.get(agent.religionId)!;
            for (const key in religion.dogma) {
                if (agent.beliefNetwork[key] !== undefined) {
                    agent.beliefNetwork[key] = (1 - RELIGIOUS_ASSIMILATION_RATE) * agent.beliefNetwork[key] + RELIGIOUS_ASSIMILATION_RATE * religion.dogma[key];
                }
            }
        }

        // 6. Disease
        if (Math.random() < 0.03 && !agent.sickness) {
            agent.sickness = "Grippe";
            agent.health = Math.max(0, agent.health - 15);
            logs.push({ key: 'log_disease_caughtSickness', params: { agentName: agent.name, sickness: agent.sickness } });
        }
        if (agent.sickness) {
            let healthLoss = agent.genome.includes("G-RESISTANT") ? 2 : 5;
            agent.health = Math.max(0, agent.health - healthLoss);
            if (agent.health > 0) logs.push({ key: 'log_disease_lostHealth', params: { agentName: agent.name, sickness: agent.sickness } });
        }
        if (agent.health <= 0 && agent.isAlive) {
            agent.health = 0;
            agent.isAlive = false;
            logs.push({ key: 'log_disease_succumbed', params: { agentName: agent.name } });
            return logs;
        }

        // 7. Social Proximity
        this.agents.forEach(otherAgent => {
            if (agent.id === otherAgent.id || !otherAgent.isAlive) return;

            const distance = Math.sqrt(Math.pow(agent.x - otherAgent.x, 2) + Math.pow(agent.y - otherAgent.y, 2));
            if (distance < PROXIMITY_DISTANCE_THRESHOLD) {
                if (!agent.relationships[otherAgent.id]) {
                     agent.relationships[otherAgent.id] = { type: 'stranger', score: 0, disposition: { happiness: 0.1, sadness: 0.1, anger: 0.1, fear: 0.1, trust: 0.3, love: 0.1 }};
                }
                const currentScore = agent.relationships[otherAgent.id].score;
                agent.relationships[otherAgent.id].score = Math.min(100, currentScore + RELATIONSHIP_INCREMENT_PROXIMITY);
            }
        });

        return logs;
    }

    private chooseAction(agent: Agent): Action | null {
        // --- 1. Critical Survival Needs ---
        if (agent.fatigue > 90 && this.actions.has("Rest")) {
            return this.actions.get("Rest")!;
        }
        if (agent.thirst > 75 && this.actions.has("Drink Water")) {
            return this.actions.get("Drink Water")!;
        }
        if (agent.hunger > 75) {
            if ((agent.inventory['food'] || 0) > 0 && this.actions.has("Eat Food")) {
                return this.actions.get("Eat Food")!;
            }
            if (this.actions.has("Gather Food")) {
                 return this.actions.get("Gather Food")!;
            }
        }
        
        // Sick agents prioritize resting
        const restAction = this.actions.get("Rest");
        if (restAction && agent.sickness && agent.health < 80) {
            return restAction;
        }

        // Elder agents are more likely to rest
        if (agent.age > ADULTHOOD_MAX_AGE && Math.random() < 0.25) {
            if (restAction) return restAction;
        }

        // --- 2. Default weighted random action ---
        const availableActions = this.getAvailableActions();
        if (availableActions.length === 0) return null;
        
        const weightedActions = availableActions.map(action => {
            const beliefWeight = action.beliefKey ? agent.beliefNetwork[action.beliefKey] || 0 : 0.5;
            const resonanceBonus = agent.resonance[action.name] || 0;
            const totalWeight = beliefWeight + resonanceBonus;
            return { action, weight: totalWeight > 0 ? totalWeight : 0 };
        });
        
        const totalWeightSum = weightedActions.reduce((sum, wa) => sum + wa.weight, 0);

        if (totalWeightSum <= 0) {
            // Fallback if all weights are zero
            return availableActions[Math.floor(Math.random() * availableActions.length)];
        }

        let random = Math.random() * totalWeightSum;
        for (const wa of weightedActions) {
            if (random < wa.weight) {
                return wa.action;
            }
            random -= wa.weight;
        }

        return availableActions[availableActions.length - 1]; // Fallback
    }
    
    private executeAction(agentId: string, action: Action): { logs: LogEntry[], sideEffects?: ActionExecutionResult['sideEffects'] } {
        const agent = this.agents.get(agentId);
        if (!agent) return { logs: [{ key: 'log_execution_agentNotFound', params: { agentId } }] };

        if (!agent.isAlive) {
            return { logs: [{ key: 'log_execution_deceased', params: { agentName: agent.name } }] };
        }

        const { newEnvironment, log, sideEffects } = action.execute!(agent, this.agents, this.entities, this.environment);
        this.environment = newEnvironment;

        agent.lastActions = [action, ...agent.lastActions].slice(0, MAX_LAST_ACTIONS);
        
        const newResonance: Resonance = {};
        for (const key in agent.resonance) {
            const decayedValue = agent.resonance[key] * RESONANCE_DECAY_RATE;
            if (decayedValue > RESONANCE_THRESHOLD) {
                newResonance[key] = decayedValue;
            }
        }
        newResonance[action.name] = (newResonance[action.name] || 0) + RESONANCE_UPDATE_AMOUNT;
        agent.resonance = newResonance;

        return { logs: [log], sideEffects };
    }
    
    private async handleConversations(language: Language): Promise<LogEntry[]> {
        const allLogs: LogEntry[] = [];
        const agentList = Array.from(this.agents.values()).filter(a => a.isAlive && !a.adminAgent);
        const handledThisStep = new Set<string>();

        // Conversation cleanup
        for (const [key, conversation] of this.conversations.entries()) {
            if (this.environment.time - conversation.lastInteractionTime > 10) {
                this.conversations.delete(key);
            }
        }
        
        for (const agentA of agentList) {
            if (handledThisStep.has(agentA.id)) continue;
            
            const willInitiateConversation = agentA.genome.includes("G-SOCIAL") ? (Math.random() < 0.4) : (Math.random() < 0.1);
            if (!willInitiateConversation) continue;

            const otherAgentsAtLocation = agentList.filter(agentB => 
                agentA.id !== agentB.id && !handledThisStep.has(agentB.id) &&
                Math.abs(agentA.x - agentB.x) <= 1 && Math.abs(agentA.y - agentB.y) <= 1
            );

            if (otherAgentsAtLocation.length === 0) continue;
            
            const agentB = otherAgentsAtLocation[0];
            const conversationKey = [agentA.id, agentB.id].sort().join('-');
            
            let conversation = this.conversations.get(conversationKey);

            if (!conversation) {
                conversation = {
                    participants: [agentA.id, agentB.id], history: [], turn: agentA.id, lastInteractionTime: this.environment.time
                };
                this.conversations.set(conversationKey, conversation);
                allLogs.push({ key: 'log_interaction_start', params: { agentName1: agentA.name, agentName2: agentB.name } });
            }

            if (conversation.turn === agentA.id) {
                const speaker = agentA;
                const listener = agentB;
                
                try {
                    const response = await generateAgentConversation(speaker, listener, conversation.history.slice(-5), this.getState(), language);
                    
                    if (response) {
                        const { dialogue, action: actionName } = response;
                        
                        allLogs.push({ key: 'log_interaction_dialogue', params: { speakerName: speaker.name, dialogue } });
                        
                        conversation.history.push({ speakerName: speaker.name, message: dialogue });
                        
                        // Relationship and Disposition update
                        if (!speaker.relationships[listener.id]) speaker.relationships[listener.id] = {type: 'acquaintance', score: 0, disposition: { happiness: 0.1, sadness: 0.1, anger: 0.1, fear: 0.1, trust: 0.3, love: 0.1 }};
                        if (!listener.relationships[speaker.id]) listener.relationships[speaker.id] = {type: 'acquaintance', score: 0, disposition: { happiness: 0.1, sadness: 0.1, anger: 0.1, fear: 0.1, trust: 0.3, love: 0.1 }};
                        speaker.relationships[listener.id].score = Math.min(100, speaker.relationships[listener.id].score + RELATIONSHIP_INCREMENT_CONVERSATION);
                        listener.relationships[speaker.id].score = Math.min(100, listener.relationships[speaker.id].score + RELATIONSHIP_INCREMENT_CONVERSATION);
                        speaker.relationships[listener.id].disposition.trust = Math.min(1, speaker.relationships[listener.id].disposition.trust + EMOTIONAL_LEARNING_RATE);

                        const chosenAction = this.promptParser.parse(actionName, this.getAvailableActions());
                        if (chosenAction) {
                            const { logs: actionLogs, sideEffects } = this.executeAction(speaker.id, chosenAction);
                            allLogs.push(...actionLogs);

                             if (sideEffects?.createAgent) {
                                this.addNewbornAgent(sideEffects.createAgent);
                             }
                             if (sideEffects?.createEntity) {
                                this.addEntityToSimulation(sideEffects.createEntity as Entity);
                             }
                             if (sideEffects?.updateReligion) {
                                this.handleReligionChange(sideEffects.updateReligion.agentId, sideEffects.updateReligion.newReligionId);
                            }

                            if (chosenAction.name.toLowerCase().includes('move')) {
                                this.conversations.delete(conversationKey);
                            } else {
                                conversation.turn = listener.id;
                            }
                        } else {
                             conversation.turn = listener.id;
                        }
                    }
                } catch (error) {
                    console.error(`Conversation error for ${speaker.name}:`, error);
                    conversation.turn = listener.id; // Ensure turn passes on error
                }
                conversation.lastInteractionTime = this.environment.time;
            }
            handledThisStep.add(agentA.id).add(agentB.id);
        }
        return allLogs;
    }

    private updateCultures(): void {
        this.cultures.forEach(culture => {
            const members = culture.memberIds.map(id => this.agents.get(id)).filter((a): a is Agent => !!a);
            if (members.length === 0) return;

            const averageBeliefs: Beliefs = {};
            const beliefKeys = new Set(members.flatMap(m => Object.keys(m.beliefNetwork)));
            
            beliefKeys.forEach(key => {
                const sum = members.reduce((acc, member) => acc + (member.beliefNetwork[key] || 0), 0);
                averageBeliefs[key] = sum / members.length;
            });
            
            // Slowly move culture's beliefs towards the average
            for(const key in averageBeliefs) {
                culture.sharedBeliefs[key] = (1 - CULTURAL_ASSIMILATION_RATE) * (culture.sharedBeliefs[key] || 0) + CULTURAL_ASSIMILATION_RATE * averageBeliefs[key];
            }
        });
    }

    public async step(language: Language): Promise<{ logs: LogEntry[] }> {
        const allLogs: LogEntry[] = [];
        this.environment.time = (this.environment.time || 0) + 1;

        if (this.environment.time % CULTURAL_EVOLUTION_INTERVAL === 0) {
            this.updateCultures();
        }

        const agentsToProcess = Array.from(this.agents.values());

        const conversationLogs = await this.handleConversations(language);
        allLogs.push(...conversationLogs);
        
        const agentsInConversation = new Set(Array.from(this.conversations.values()).flatMap(c => c.participants));

        for (const agent of agentsToProcess) {
            const perStepLogs = this.applyPerStepMechanisms(agent);
            allLogs.push(...perStepLogs);
            
            if (agentsInConversation.has(agent.id) || !agent.isAlive || agent.adminAgent) continue;
            
            const action = this.chooseAction(agent);
            if (action) {
                const { logs, sideEffects } = this.executeAction(agent.id, action);
                allLogs.push(...logs);
                if (sideEffects?.createAgent) {
                    this.addNewbornAgent(sideEffects.createAgent);
                }
                 if (sideEffects?.createEntity) {
                    this.addEntityToSimulation(sideEffects.createEntity as Entity);
                }
                if (sideEffects?.updateReligion) {
                    this.handleReligionChange(sideEffects.updateReligion.agentId, sideEffects.updateReligion.newReligionId);
                }
            }
        }
        
        return { logs: allLogs };
    }
    
    public processAgentPrompt(agentId: string, prompt: string): { logs: LogEntry[] } {
        const agent = this.agents.get(agentId);
        if (!agent) return { logs: [{ key: 'log_execution_agentNotFound', params: { agentId } }] };

        if (!agent.isAlive) {
            return { logs: [{ key: 'log_execution_deceasedPrompt', params: { agentName: agent.name } }] };
        }

        const action = this.promptParser.parse(prompt, this.getAvailableActions());
        
        if (action) {
            const { logs, sideEffects } = this.executeAction(agentId, action);
             if (sideEffects?.createAgent) {
                this.addNewbornAgent(sideEffects.createAgent);
            }
             if (sideEffects?.createEntity) {
                this.addEntityToSimulation(sideEffects.createEntity as Entity);
             }
             if (sideEffects?.updateReligion) {
                this.handleReligionChange(sideEffects.updateReligion.agentId, sideEffects.updateReligion.newReligionId);
            }
            return { logs };
        }

        return { logs: [{ key: 'log_execution_actionNotFound', params: { agentName: agent.name, prompt } }] };
    }
}
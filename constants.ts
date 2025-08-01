
import type { WorldState, Agent, Action, RelationshipType, EnvironmentState, Emotions, Beliefs, Entity } from './types';

export const RESONANCE_DECAY_RATE = 0.95;
export const RESONANCE_THRESHOLD = 0.1;
export const RESONANCE_UPDATE_AMOUNT = 0.2;
export const MAX_LAST_ACTIONS = 5;
export const AGE_INCREMENT = 0.1;
export const MIN_REPRODUCTION_AGE = 20;
export const MAX_REPRODUCTION_AGE = 50;
export const MAX_AGE = 80;
export const AGE_RELATED_HEALTH_DECLINE = 0.5;
export const RELATIONSHIP_INCREMENT_CONVERSATION = 5;
export const RELATIONSHIP_INCREMENT_PROXIMITY = 0.1;
export const PROXIMITY_DISTANCE_THRESHOLD = 3;
export const GENOME_OPTIONS = ["G-RESISTANT", "G-AGILE", "G-SOCIAL", "G-LONGEVITY", "G-FASTHEAL", "G-INTELLIGENT", "G-FERTILE"];
export const EMOTION_DECAY_RATE = 0.98;
export const DISPOSITION_DECAY_RATE = 0.998;
export const MAX_SOCIAL_MEMORIES = 20;
export const MUTATION_RATE = 0.05; // 5% chance of a gene mutating
export const MAX_OFFSPRING = 2;
export const CULTURAL_ASSIMILATION_RATE = 0.01;
export const RELIGIOUS_ASSIMILATION_RATE = 0.02;
export const CULTURAL_EVOLUTION_INTERVAL = 20; // every 20 steps
export const EMOTIONAL_LEARNING_RATE = 0.1;

export const CHILDHOOD_MAX_AGE = 12;
export const ADOLESCENCE_MAX_AGE = 19;
export const ADULTHOOD_MAX_AGE = 65;

export const ROLES = ['Worker', 'Healer', 'Scientist', 'Leader'];
export const RESOURCE_TYPES = ['food', 'water', 'wood', 'medicine'];

// New Survival Constants
export const HUNGER_INCREASE_RATE = 0.5;
export const THIRST_INCREASE_RATE = 0.8;
export const FATIGUE_INCREASE_RATE = 0.4;
export const HEALTH_LOSS_FROM_STARVATION = 2;
export const HEALTH_LOSS_FROM_DEHYDRATION = 3;
export const FATIGUE_RECOVERY_RATE = 40;
export const EAT_HUNGER_REDUCTION = 50;
export const DRINK_THIRST_REDUCTION = 60;
export const GATHER_AMOUNT = 5;

const findNearestAgent = (agent: Agent, allAgents: Map<string, Agent>, filter?: (other: Agent) => boolean) => {
    let target: Agent | null = null;
    let minDistance = Infinity;
    for (const otherAgent of allAgents.values()) {
        if (otherAgent.id === agent.id || !otherAgent.isAlive) continue;
        if (filter && !filter(otherAgent)) continue;

        const distance = Math.sqrt(Math.pow(agent.x - otherAgent.x, 2) + Math.pow(agent.y - otherAgent.y, 2));
        if (distance < minDistance) {
            minDistance = distance;
            target = otherAgent;
        }
    }
    return { target, distance: minDistance };
}

const findNearestEntity = (agent: Agent, allEntities: Map<string, Entity>, filter: (other: Entity) => boolean) => {
    let target: Entity | null = null;
    let minDistance = Infinity;
    for (const entity of allEntities.values()) {
        if (!filter(entity)) continue;

        const distance = Math.sqrt(Math.pow(agent.x - entity.x, 2) + Math.pow(agent.y - entity.y, 2));
        if (distance < minDistance) {
            minDistance = distance;
            target = entity;
        }
    }
    return { target, distance: minDistance };
}

const moveTowards = (agent: Agent, target: { x: number, y: number }, env: EnvironmentState) => {
    const stepSize = agent.genome.includes("G-AGILE") ? 2 : 1;
    const dx = target.x - agent.x;
    const dy = target.y - agent.y;
    
    if (dx === 0 && dy === 0) return;

    if (Math.abs(dx) > Math.abs(dy)) {
        agent.x += Math.sign(dx) * Math.min(stepSize, Math.abs(dx));
    } else {
        agent.y += Math.sign(dy) * Math.min(stepSize, Math.abs(dy));
    }
    agent.x = Math.max(0, Math.min(env.width - 1, agent.x));
    agent.y = Math.max(0, Math.min(env.height - 1, agent.y));
};

const wander = (agent: Agent, env: EnvironmentState) => {
    const stepSize = agent.genome.includes("G-AGILE") ? 2 : 1;
    const dirX = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    const dirY = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    agent.x = Math.max(0, Math.min(env.width - 1, agent.x + dirX * stepSize));
    agent.y = Math.max(0, Math.min(env.height - 1, agent.y + dirY * stepSize));
};

const defaultDisposition = (): Emotions => ({ happiness: 0.1, sadness: 0.1, anger: 0.1, fear: 0.1, trust: 0.3, love: 0.1 });


export const initialWorldState: WorldState = {
  environment: {
    time: 0,
    weather: "sonnig",
    location: "Zuhause",
    width: 20,
    height: 20,
  },
  agents: [
    {
      id: 'agent-1',
      name: 'Alice',
      description: 'Ein neugieriger Agent, der optimistisch ist und gerne über das Wetter spricht.',
      x: 1,
      y: 1,
      beliefNetwork: { 'weather_sunny': 0.7, 'weather_rainy': 0.3, 'progress_good': 0.8, 'nature_good': 0.4 },
      emotions: { happiness: 0.7, sadness: 0.1, anger: 0.1, love: 0.2, trust: 0.5, fear: 0.1 },
      resonance: {},
      socialMemory: [],
      lastActions: [],
      adminAgent: false,
      health: 100,
      isAlive: true,
      sickness: null,
      conversationHistory: [],
      age: 25,
      genome: ["G-SOCIAL", "G-LONGEVITY", "G-INTELLIGENT"],
      relationships: {},
      cultureId: 'culture-utopian',
      religionId: 'religion-technotheism',
      role: 'Scientist',
      offspringCount: 0,
      hunger: 10,
      thirst: 15,
      fatigue: 20,
      inventory: { food: 5 },
    },
    {
      id: 'agent-2',
      name: 'Bob',
      description: 'Ein pragmatischer und leicht zynischer Agent, der sich oft über Kleinigkeiten beschwert.',
      x: 18,
      y: 18,
      beliefNetwork: { 'weather_rainy': 0.6, 'weather_sunny': 0.4, 'progress_good': 0.3, 'nature_good': 0.9 },
      emotions: { happiness: 0.4, sadness: 0.2, anger: 0.3, love: 0.1, trust: 0.4, fear: 0.2 },
      resonance: {},
      socialMemory: [],
      lastActions: [],
      adminAgent: false,
      health: 100,
      isAlive: true,
      sickness: null,
      conversationHistory: [],
      age: 30,
      genome: ["G-AGILE", "G-RESISTANT"],
      relationships: {},
      cultureId: 'culture-primitivist',
      religionId: 'religion-gaianism',
      role: 'Worker',
      offspringCount: 0,
      hunger: 25,
      thirst: 20,
      fatigue: 40,
      inventory: { wood: 10 },
    },
    {
      id: 'agent-admin',
      name: 'Admin',
      description: 'Der Admin-Agent mit besonderen Fähigkeiten',
      x: 10,
      y: 10,
      beliefNetwork: { 'admin_access': 1.0 },
      emotions: {},
      resonance: {},
      socialMemory: [],
      lastActions: [],
      adminAgent: true,
      health: 100,
      isAlive: true,
      sickness: null,
      conversationHistory: [],
      age: 999,
      genome: [],
      relationships: {},
      cultureId: null,
      religionId: null,
      role: null,
      offspringCount: 0,
      hunger: 0,
      thirst: 0,
      fatigue: 0,
      inventory: {},
    }
  ],
  entities: [
    {
      id: 'entity-1',
      name: 'Haus',
      description: 'Ein kleines Haus',
      x: 5,
      y: 2,
    },
     {
      id: 'entity-2',
      name: 'Spring',
      description: 'A source of fresh water.',
      x: 3,
      y: 15,
      isResource: true,
      resourceType: 'water',
      quantity: Infinity,
    },
    {
      id: 'entity-3',
      name: 'Berry Bush',
      description: 'A bush with edible berries.',
      x: 15,
      y: 5,
      isResource: true,
      resourceType: 'food',
      quantity: 25,
    },
    {
      id: 'entity-4',
      name: 'Forest',
      description: 'A dense patch of trees.',
      x: 17,
      y: 15,
      isResource: true,
      resourceType: 'wood',
      quantity: 100,
    }
  ],
  cultures: [
    {
      id: 'culture-utopian',
      name: 'Utopian Technocrats',
      sharedBeliefs: { 'progress_good': 0.8, 'nature_good': 0.3 },
      memberIds: [],
    },
    {
      id: 'culture-primitivist',
      name: 'Primitivist Collective',
      sharedBeliefs: { 'progress_good': 0.2, 'nature_good': 0.8 },
      memberIds: [],
    }
  ],
  religions: [
    {
      id: 'religion-technotheism',
      name: 'Technotheism',
      dogma: { 'progress_good': 0.95, 'nature_good': 0.5 },
      memberIds: [],
    },
    {
      id: 'religion-gaianism',
      name: 'Gaianism',
      dogma: { 'progress_good': 0.1, 'nature_good': 0.95 },
      memberIds: [],
    }
  ],
  actions: [
    {
      name: 'Say: Hallo Welt!',
      description: "Sagt 'Hallo Welt!'",
      execute: (agent, allAgents, allEntities, env) => ({ newEnvironment: env, log: { key: 'log_action_sayHelloWorld', params: { agentName: agent.name } } })
    },
    {
        name: "Eat Food",
        description: "Eats food from inventory to reduce hunger.",
        execute: (agent, allAgents, allEntities, env) => {
            if ((agent.inventory['food'] || 0) > 0) {
                agent.inventory['food']--;
                agent.hunger = Math.max(0, agent.hunger - EAT_HUNGER_REDUCTION);
                return { newEnvironment: env, log: { key: 'log_action_eat', params: { agentName: agent.name } } };
            }
            return { newEnvironment: env, log: { key: 'log_action_eat_no_food', params: { agentName: agent.name } } };
        }
    },
    {
        name: "Drink Water",
        description: "Drinks water from a nearby water source to reduce thirst.",
        execute: (agent, allAgents, allEntities, env) => {
            const { target, distance } = findNearestEntity(agent, allEntities, e => e.isResource && e.resourceType === 'water');
            if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
                agent.thirst = Math.max(0, agent.thirst - DRINK_THIRST_REDUCTION);
                return { newEnvironment: env, log: { key: 'log_action_drink', params: { agentName: agent.name, sourceName: target.name } } };
            }
            if (target) {
                moveTowards(agent, target, env);
                return { newEnvironment: env, log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: target.name } } };
            }
            return { newEnvironment: env, log: { key: 'log_action_drink_no_source', params: { agentName: agent.name } } };
        }
    },
    {
        name: "Gather Food",
        description: "Gathers food from a nearby food source.",
        execute: (agent, allAgents, allEntities, env) => {
            const { target, distance } = findNearestEntity(agent, allEntities, e => e.isResource && e.resourceType === 'food' && (e.quantity ?? 0) > 0);
            if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
                const gathered = Math.min(GATHER_AMOUNT, target.quantity!);
                target.quantity! -= gathered;
                agent.inventory['food'] = (agent.inventory['food'] || 0) + gathered;
                let logKey = 'log_action_gather_food';
                if (target.quantity! <= 0) {
                    logKey = 'log_action_gather_food_depleted';
                    // In a real implementation, you might remove the entity here or have it regrow.
                }
                return { newEnvironment: env, log: { key: logKey, params: { agentName: agent.name, amount: gathered, sourceName: target.name } } };
            }
            if (target) {
                moveTowards(agent, target, env);
                return { newEnvironment: env, log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: target.name } } };
            }
            return { newEnvironment: env, log: { key: 'log_action_gather_food_no_source', params: { agentName: agent.name } } };
        }
    },
    {
        name: "Gather Wood",
        description: "Gathers wood from a nearby forest or trees.",
        execute: (agent, allAgents, allEntities, env) => {
            const { target, distance } = findNearestEntity(agent, allEntities, e => e.isResource && e.resourceType === 'wood' && (e.quantity ?? 0) > 0);
            if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
                const gathered = Math.min(GATHER_AMOUNT, target.quantity!);
                target.quantity! -= gathered;
                agent.inventory['wood'] = (agent.inventory['wood'] || 0) + gathered;
                return { newEnvironment: env, log: { key: 'log_action_gather_wood', params: { agentName: agent.name, amount: gathered, sourceName: target.name } } };
            }
            if (target) {
                moveTowards(agent, target, env);
                return { newEnvironment: env, log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: target.name } } };
            }
            return { newEnvironment: env, log: { key: 'log_action_gather_wood_no_source', params: { agentName: agent.name } } };
        }
    },
    {
        name: "Build Shelter",
        description: "Uses wood from inventory to build a small shelter.",
        execute: (agent, allAgents, allEntities, env) => {
            const woodCost = 10;
            if ((agent.inventory['wood'] || 0) >= woodCost) {
                agent.inventory['wood'] -= woodCost;
                const newShelter: Partial<Entity> = {
                    id: `entity-shelter-${Date.now()}`,
                    name: `Shelter (${agent.name})`,
                    description: `A crude shelter built by ${agent.name}.`,
                    x: agent.x,
                    y: agent.y,
                };
                return { 
                    newEnvironment: env, 
                    log: { key: 'log_action_build_shelter', params: { agentName: agent.name } },
                    sideEffects: { createEntity: newShelter }
                };
            }
            return { newEnvironment: env, log: { key: 'log_action_build_shelter_no_wood', params: { agentName: agent.name, woodCost } } };
        }
    },
    {
        name: "Rest",
        description: "Agent rests to recover from fatigue, recover health, and potentially heal from sickness.",
        execute: (agent: Agent, allAgents, allEntities, env) => {
            let recovery = 5;
            if (agent.genome.includes("G-FASTHEAL")) {
                recovery = 10;
            }
            agent.fatigue = Math.max(0, agent.fatigue - FATIGUE_RECOVERY_RATE);
            const newHealth = Math.min(100, agent.health + recovery);
            const oldSickness = agent.sickness;
            agent.health = newHealth;

            let logKey = 'log_action_rest';
            let logParams: any = { agentName: agent.name, newHealth: newHealth.toFixed(0) };

            if (oldSickness) {
                let cureChance = 0.10; // Lower chance now, medicine should be better
                if (agent.genome.includes("G-RESISTANT")) {
                    cureChance += 0.15;
                }
                if (Math.random() < cureChance) {
                    agent.sickness = null;
                    logKey = 'log_action_rest_cured';
                    logParams = { agentName: agent.name, sickness: oldSickness };
                }
            }
            
            return { newEnvironment: env, log: { key: logKey, params: logParams } };
        }
    },
    {
        name: "Pray",
        description: "Agent prays, reinforcing religious beliefs and finding peace.",
        execute: (agent, allAgents, allEntities, env) => {
            if (!agent.religionId) {
                return { newEnvironment: env, log: { key: 'log_action_pray_no_religion', params: { agentName: agent.name } } };
            }
            agent.emotions.happiness = Math.min(1, agent.emotions.happiness + 0.15);
            agent.emotions.fear = Math.max(0, agent.emotions.fear - 0.1);
            return { newEnvironment: env, log: { key: 'log_action_pray', params: { agentName: agent.name, religionId: agent.religionId } } };
        }
    },
    {
        name: "Heal",
        description: "A Healer can cure a sick agent nearby.",
        execute: (agent, allAgents, allEntities, env) => {
            if (agent.role !== 'Healer') {
                return { newEnvironment: env, log: { key: 'log_action_fail_role', params: { agentName: agent.name, requiredRole: 'Healer' } } };
            }
            const { target, distance } = findNearestAgent(agent, allAgents, other => !!other.sickness);
            if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
                const sickness = target.sickness;
                target.sickness = null;
                target.health = Math.min(100, target.health + 10);
                return { newEnvironment: env, log: { key: 'log_action_heal', params: { healerName: agent.name, targetName: target.name, sickness } } };
            }
            return { newEnvironment: env, log: { key: 'log_action_heal_no_target', params: { agentName: agent.name } } };
        }
    },
    {
        name: "Missionize",
        description: "Attempts to spread one's religious beliefs to others.",
        execute: (agent, allAgents, allEntities, env) => {
             if (!agent.religionId) {
                return { newEnvironment: env, log: { key: 'log_action_pray_no_religion', params: { agentName: agent.name } } };
            }
            const { target, distance } = findNearestAgent(agent, allAgents, other => other.religionId !== agent.religionId);
            if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
                return { newEnvironment: env, log: { key: 'log_action_missionize', params: { agentName: agent.name, targetName: target.name, religionId: agent.religionId } } };
            }
            return { newEnvironment: env, log: { key: 'log_action_missionize_no_target', params: { agentName: agent.name } } };
        }
    },
    {
        name: "Convert",
        description: "Tries to convert another agent to one's religion.",
        execute: (agent, allAgents, allEntities, env) => {
            if (!agent.religionId) {
                return { newEnvironment: env, log: { key: 'log_action_pray_no_religion', params: { agentName: agent.name } } };
            }
            const { target, distance } = findNearestAgent(agent, allAgents, other => other.religionId !== agent.religionId);
            if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
                 if (Math.random() > 0.5) { // 50% success rate
                    return { 
                        newEnvironment: env, 
                        log: { key: 'log_action_convert_success', params: { converter: agent.name, target: target.name, religionId: agent.religionId } },
                        sideEffects: { updateReligion: { agentId: target.id, newReligionId: agent.religionId } }
                    };
                } else {
                    return { newEnvironment: env, log: { key: 'log_action_convert_fail', params: { converter: agent.name, target: target.name } } };
                }
            }
            return { newEnvironment: env, log: { key: 'log_action_missionize_no_target', params: { agentName: agent.name } } };
        }
    },
    {
        name: "Excommunicate",
        description: "A Leader can excommunicate a member from their religion.",
        execute: (agent, allAgents, allEntities, env) => {
            if (agent.role !== 'Leader' || !agent.religionId) {
                return { newEnvironment: env, log: { key: 'log_action_fail_role_or_religion', params: { agentName: agent.name, requiredRole: 'Leader' } } };
            }
            const { target, distance } = findNearestAgent(agent, allAgents, other => other.religionId === agent.religionId);
             if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
                return { 
                    newEnvironment: env, 
                    log: { key: 'log_action_excommunicate', params: { leader: agent.name, target: target.name, religionId: agent.religionId } },
                    sideEffects: { updateReligion: { agentId: target.id, newReligionId: null } }
                };
            }
            return { newEnvironment: env, log: { key: 'log_action_excommunicate_no_target', params: { agentName: agent.name } } };
        }
    },
    {
      name: 'Change Weather to sonnig',
      description: 'Ändert das Wetter zu sonnig',
      beliefKey: 'weather_sunny',
      execute: (agent, allAgents, allEntities, env) => {
        const newEnv = { ...env, weather: 'sonnig' };
        return { newEnvironment: newEnv, log: { key: 'log_action_changeWeatherToSunny', params: { agentName: agent.name } } };
      }
    },
    {
      name: 'Change Weather to regnerisch',
      description: 'Ändert das Wetter zu regnerisch',
      beliefKey: 'weather_rainy',
      execute: (agent, allAgents, allEntities, env) => {
        const newEnv = { ...env, weather: 'regnerisch' };
        return { newEnvironment: newEnv, log: { key: 'log_action_changeWeatherToRainy', params: { agentName: agent.name } } };
      }
    },
    {
        name: "Move North",
        description: "Moves the agent one step north.",
        execute: (agent, allAgents, allEntities, env) => {
            const stepSize = agent.genome.includes("G-AGILE") ? 2 : 1;
            agent.y = Math.max(0, agent.y - stepSize);
            return { newEnvironment: env, log: { key: 'log_action_move', params: { agentName: agent.name, direction: 'North', x: agent.x, y: agent.y } } };
        }
    },
    {
        name: "Move South",
        description: "Moves the agent one step south.",
        execute: (agent, allAgents, allEntities, env) => {
            const stepSize = agent.genome.includes("G-AGILE") ? 2 : 1;
            agent.y = Math.min(env.height - 1, agent.y + stepSize);
            return { newEnvironment: env, log: { key: 'log_action_move', params: { agentName: agent.name, direction: 'South', x: agent.x, y: agent.y } } };
        }
    },
    {
        name: "Move East",
        description: "Moves the agent one step east.",
        execute: (agent, allAgents, allEntities, env) => {
            const stepSize = agent.genome.includes("G-AGILE") ? 2 : 1;
            agent.x = Math.min(env.width - 1, agent.x + stepSize);
            return { newEnvironment: env, log: { key: 'log_action_move', params: { agentName: agent.name, direction: 'East', x: agent.x, y: agent.y } } };
        }
    },
    {
        name: "Move West",
        description: "Moves the agent one step west.",
        execute: (agent, allAgents, allEntities, env) => {
            const stepSize = agent.genome.includes("G-AGILE") ? 2 : 1;
            agent.x = Math.max(0, agent.x - stepSize);
            return { newEnvironment: env, log: { key: 'log_action_move', params: { agentName: agent.name, direction: 'West', x: agent.x, y: agent.y } } };
        }
    },
    {
      name: "Promote Cultural Belief",
      description: "Tries to convince others of a core cultural belief.",
      beliefKey: 'progress_good', // Example, could be dynamic
      execute: (agent, allAgents, allEntities, env) => {
          const log = { key: 'log_action_promote_culture', params: { agentName: agent.name, cultureId: agent.cultureId }};
          // In a more complex system, this would affect nearby agents' beliefs.
          return { newEnvironment: env, log };
      }
    },
    {
        name: "Propose Marriage",
        description: "Proposes marriage to a partner.",
        execute: (agent, allAgents, allEntities, env) => {
            if (agent.age < ADOLESCENCE_MAX_AGE) {
                 return { newEnvironment: env, log: { key: 'log_action_fail_age', params: { agentName: agent.name, actionName: "Propose Marriage", requiredAge: ADOLESCENCE_MAX_AGE } } };
            }
            const { target, distance } = findNearestAgent(agent, allAgents, other => agent.relationships[other.id]?.type === 'partner');
            
            if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
                const targetRelationship = target.relationships[agent.id];
                if (targetRelationship && targetRelationship.score > 80 && (target.emotions.love || 0) > 0.7 && targetRelationship.disposition.trust > 0.6) {
                    agent.relationships[target.id].type = 'spouse';
                    target.relationships[agent.id].type = 'spouse';
                    agent.relationships[target.id].disposition.love = 1.0;
                    target.relationships[agent.id].disposition.love = 1.0;

                    return { newEnvironment: env, log: { key: 'log_action_marry', params: { agentName1: agent.name, agentName2: target.name } } };
                } else {
                    agent.emotions.sadness = Math.min(1, (agent.emotions.sadness || 0) + 0.5);
                    agent.relationships[target.id].disposition.trust = Math.max(0, agent.relationships[target.id].disposition.trust - 0.2);
                    
                    return { newEnvironment: env, log: { key: 'log_action_propose_rejected', params: { proposer: agent.name, target: target.name } } };
                }
            }
            if (target) {
                moveTowards(agent, target, env);
                return { newEnvironment: env, log: { key: 'log_action_move_towards_love', params: { agentName: agent.name, targetName: target.name } } };
            }
            wander(agent, env);
            return { newEnvironment: env, log: { key: 'log_action_wander_sadly', params: { agentName: agent.name } } };
        }
    },
     {
        name: "Reproduce",
        description: "Attempts to have a child with a partner.",
        execute: (agent, allAgents, allEntities, env) => {
            if (agent.age < MIN_REPRODUCTION_AGE || agent.age > MAX_REPRODUCTION_AGE) {
                 return { newEnvironment: env, log: { key: 'log_action_fail_age_reproduce', params: { agentName: agent.name, minAge: MIN_REPRODUCTION_AGE, maxAge: MAX_REPRODUCTION_AGE } } };
            }

            const { target, distance } = findNearestAgent(agent, allAgents, other => ['partner', 'spouse'].includes(agent.relationships[other.id]?.type));

            if (!target || distance > PROXIMITY_DISTANCE_THRESHOLD) {
                return { newEnvironment: env, log: { key: 'log_action_reproduce_no_partner', params: { agentName: agent.name } } };
            }
            
            if (target.age < MIN_REPRODUCTION_AGE || target.age > MAX_REPRODUCTION_AGE) {
                return { newEnvironment: env, log: { key: 'log_action_reproduce_fail_partner_age', params: { agentName: agent.name, partnerName: target.name } } };
            }


            const agentFertile = agent.genome.includes("G-FERTILE") ? 1.5 : 1;
            const targetFertile = target.genome.includes("G-FERTILE") ? 1.5 : 1;
            const canReproduce = agent.offspringCount < MAX_OFFSPRING && target.offspringCount < MAX_OFFSPRING;

            if (canReproduce && Math.random() < (0.2 * agentFertile * targetFertile) ) {
                agent.offspringCount++;
                target.offspringCount++;

                const newAgentData = {
                    name: `Child of ${agent.name.substring(0,3)} & ${target.name.substring(0,3)}`,
                    description: `Offspring of ${agent.name} and ${target.name}`,
                    parents: [agent, target] as [Agent, Agent],
                };
                
                return { 
                    newEnvironment: env, 
                    log: { key: 'log_action_reproduce_success', params: { parent1: agent.name, parent2: target.name }},
                    sideEffects: { createAgent: newAgentData }
                };
            }
            
            return { newEnvironment: env, log: { key: 'log_action_reproduce_fail', params: { parent1: agent.name, parent2: target.name } } };
        }
    },
    {
        name: "Fight",
        description: "Starts a fight with another agent.",
        execute: (agent, allAgents, allEntities, env) => {
            let filter = (other: Agent) => agent.relationships[other.id]?.type === 'rival' || (agent.relationships[other.id]?.disposition?.anger || 0) > 0.6;
            let { target, distance } = findNearestAgent(agent, allAgents, filter);
            
            if (!target && (agent.emotions.anger || 0) > 0.7) {
                 ({ target, distance } = findNearestAgent(agent, allAgents));
            }

             if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
                if (!agent.relationships[target.id]) agent.relationships[target.id] = { type: 'acquaintance', score: 20, disposition: defaultDisposition() };
                if (!target.relationships[agent.id]) target.relationships[agent.id] = { type: 'acquaintance', score: 20, disposition: defaultDisposition() };
                
                agent.relationships[target.id].score = Math.max(0, agent.relationships[target.id].score - 20);
                target.relationships[agent.id].score = Math.max(0, target.relationships[agent.id].score - 20);
                
                agent.relationships[target.id].disposition.anger = Math.min(1, agent.relationships[target.id].disposition.anger + 0.3);
                agent.relationships[target.id].disposition.trust = Math.max(0, agent.relationships[target.id].disposition.trust - 0.2);
                target.relationships[agent.id].disposition.anger = Math.min(1, target.relationships[agent.id].disposition.anger + 0.3);
                target.relationships[agent.id].disposition.trust = Math.max(0, target.relationships[agent.id].disposition.trust - 0.2);

                if (agent.relationships[target.id].score < 10) agent.relationships[target.id].type = 'rival';
                if (target.relationships[agent.id].score < 10) target.relationships[agent.id].type = 'rival';
                
                agent.health = Math.max(0, agent.health - 5);
                target.health = Math.max(0, target.health - 5);
                 
                return { newEnvironment: env, log: { key: 'log_action_fight', params: { agentName1: agent.name, agentName2: target.name } } };
             }
             if (target) {
                moveTowards(agent, target, env);
                return { newEnvironment: env, log: { key: 'log_action_move_towards_fight', params: { agentName: agent.name, targetName: target.name } } };
             }
             wander(agent, env);
             return { newEnvironment: env, log: { key: 'log_action_wander_thoughtfully', params: { agentName: agent.name } } };
        }
    }
  ]
};
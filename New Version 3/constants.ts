


import type { WorldState, Agent, Action, EnvironmentState, Emotions, Beliefs, Entity, Goal, Personality, Skills, Technology, Recipe, Law, Government, LogEntry } from './types';
import { generateAgentConversation } from './services/geminiService';

export const RESONANCE_DECAY_RATE = 0.95;
export const RESONANCE_THRESHOLD = 0.1;
export const RESONANCE_UPDATE_AMOUNT = 0.2;
export const MAX_LAST_ACTIONS = 5;
export const AGE_INCREMENT = 0.1;
export const MIN_REPRODUCTION_AGE = 20;
export const MAX_REPRODUCTION_AGE = 50;
export const MAX_AGE = 80;
export const AGE_RELATED_HEALTH_DECLINE = 0.5;
export const RELATIONSHIP_INCREMENT_PROXIMITY = 0.1;
export const PROXIMITY_DISTANCE_THRESHOLD = 3;
export const GENOME_OPTIONS = ["G-RESISTANT", "G-AGILE", "G-SOCIAL", "G-LONGEVITY", "G-FASTHEAL", "G-INTELLIGENT", "G-FERTILE"];
export const EMOTION_DECAY_RATE = 0.98;
export const DISPOSITION_DECAY_RATE = 0.998;
export const MAX_SOCIAL_MEMORIES = 20;
export const MUTATION_RATE = 0.05;
export const MAX_OFFSPRING = 2;
export const CULTURAL_ASSIMILATION_RATE = 0.01;
export const RELIGIOUS_ASSIMILATION_RATE = 0.02;
export const CULTURAL_EVOLUTION_INTERVAL = 20;
export const EMOTIONAL_LEARNING_RATE = 0.1;

export const CHILDHOOD_MAX_AGE = 12;
export const ADOLESCENCE_MAX_AGE = 19;
export const ADULTHOOD_MAX_AGE = 65;

export const ROLES = ['Worker', 'Healer', 'Scientist', 'Leader', 'Trader', 'Crafter', 'Guard', 'Counselor'];
export const RESOURCE_TYPES = ['food', 'water', 'wood', 'medicine', 'iron'];
export const SKILL_TYPES = ['healing', 'woodcutting', 'rhetoric', 'combat', 'construction', 'farming', 'mining', 'crafting', 'trading'];

// --- NEW CONSTANTS ---

// Economy
export const INITIAL_CURRENCY = 50;
export const WORK_FOR_MONEY_AMOUNT = 10;
export const RECIPES: Recipe[] = [
    { name: 'Craft Iron Ingot', output: { item: 'iron_ingot', quantity: 1 }, ingredients: { iron: 2 }, requiredSkill: { skill: 'crafting', level: 5 }, requiredTech: 'metallurgy' },
    { name: 'Craft Sword', output: { item: 'sword', quantity: 1 }, ingredients: { wood: 1, iron_ingot: 2 }, requiredSkill: { skill: 'crafting', level: 10 }, requiredTech: 'metallurgy' },
    { name: 'Craft Plow', output: { item: 'plow', quantity: 1 }, ingredients: { wood: 8, iron: 2 }, requiredSkill: { skill: 'crafting', level: 5 }, requiredTech: 'agriculture' },
    { name: 'Craft Advanced Medicine', output: { item: 'advanced_medicine', quantity: 1 }, ingredients: { medicine: 5, water: 2 }, requiredSkill: { skill: 'healing', level: 15 }, requiredTech: 'chemistry' },
];

// Politics
export const ELECTION_TERM_LENGTH = 100; // An election is held every 100 steps
export const INITIAL_LAWS: Law[] = [
    { id: 'law-no-theft', name: 'Anti-Theft Law', description: 'Stealing from others is illegal.', violatingAction: 'Steal', punishment: { type: 'arrest', amount: 20 } },
    { id: 'law-no-fighting', name: 'Peace Mandate', description: 'Initiating a fight is illegal.', violatingAction: 'Fight', punishment: { type: 'fine', amount: 25 } },
];
export const INITIAL_GOVERNMENT: Government = { type: 'democracy', leaderId: null, laws: INITIAL_LAWS };

// Technology
export const RESEARCH_PER_ACTION = 10;
export const TECH_TREE: Technology[] = [
    { id: 'agriculture', name: 'Agriculture', description: 'Improves farming efficiency and unlocks the Plow.', researchCost: 100, unlocks: { recipes: ['Craft Plow'] } },
    { id: 'metallurgy', name: 'Metallurgy', description: 'Allows the smelting of iron and crafting of metal tools.', researchCost: 150, requiredTech: ['agriculture'], unlocks: { actions: ['Mine Iron'], recipes: ['Craft Sword', 'Craft Iron Ingot'] } },
    { id: 'writing', name: 'Writing', description: 'Enables knowledge to be shared more effectively.', researchCost: 200, requiredTech: ['agriculture'], unlocks: { actions: ['Share Knowledge'] } },
    { id: 'chemistry', name: 'Chemistry', description: 'Unlocks advanced potions and medicines.', researchCost: 300, requiredTech: ['writing'], unlocks: { recipes: ['Craft Advanced Medicine'] } },
    { id: 'governance', name: 'Governance', description: 'Unlocks the ability to enact new laws.', researchCost: 250, requiredTech: ['writing'], unlocks: { actions: ['Enact Law'] } },
];


// Survival Constants
export const HUNGER_INCREASE_RATE = 0.5;
export const THIRST_INCREASE_RATE = 0.8;
export const FATIGUE_INCREASE_RATE = 0.4;
export const HEALTH_LOSS_FROM_STARVATION = 2;
export const HEALTH_LOSS_FROM_DEHYDRATION = 3;
export const FATIGUE_RECOVERY_RATE = 40;
export const EAT_HUNGER_REDUCTION = 50;
export const DRINK_THIRST_REDUCTION = 60;
export const GATHER_AMOUNT = 5;
export const SICKNESS_HEALTH_LOSS = 5;

// Psychology and Social Constants
export const STRESS_FROM_NEEDS = 0.2;
export const STRESS_FROM_FIGHT = 15;
export const STRESS_FROM_REJECTION = 10;
export const STRESS_RECOVERY_REST = 20;
export const STRESS_DECAY_RATE = 0.99;
export const DEFAULT_SKILL_GAIN = 0.5;
export const STATUS_FROM_FIGHT_WIN = 5;
export const STATUS_FROM_SUCCESSFUL_TRADE = 2;
export const STATUS_FROM_GOAL_COMPLETION = 10;
export const PERSONALITY_TRAITS = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];


// --- HELPER FUNCTIONS ---
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
    const dirX = Math.floor(Math.random() * 3) - 1;
    const dirY = Math.floor(Math.random() * 3) - 1;
    agent.x = Math.max(0, Math.min(env.width - 1, agent.x + dirX * stepSize));
    agent.y = Math.max(0, Math.min(env.height - 1, agent.y + dirY * stepSize));
};

const defaultDisposition = (): Emotions => ({ happiness: 0.1, sadness: 0.1, anger: 0.1, fear: 0.1, trust: 0.3, love: 0.1 });
const defaultPersonality = (): Personality => ({ openness: 0.5, conscientiousness: 0.5, extraversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 });
const defaultSkills = (): Skills => ({ healing: 1, woodcutting: 1, rhetoric: 1, combat: 1, construction: 1, farming: 1, mining: 1, crafting: 1, trading: 1 });


// --- INITIAL WORLD STATE ---
export const initialWorldState: WorldState = {
  environment: {
    time: 0,
    weather: "sonnig",
    width: 20,
    height: 20,
    election: null,
  },
  agents: [
    {
      id: 'agent-1',
      name: 'Alice',
      description: 'Ein neugieriger Agent, der optimistisch ist und gerne über das Wetter spricht.',
      x: 1, y: 1,
      beliefNetwork: { 'weather_sunny': 0.7, 'weather_rainy': 0.3, 'progress_good': 0.8, 'nature_good': 0.4 },
      emotions: { happiness: 0.7, sadness: 0.1, anger: 0.1, love: 0.2, trust: 0.5, fear: 0.1 },
      resonance: {}, socialMemory: [], lastActions: [], adminAgent: false, health: 100, isAlive: true,
      sickness: null, conversationHistory: [], age: 25, genome: ["G-SOCIAL", "G-LONGEVITY", "G-INTELLIGENT"],
      relationships: {}, cultureId: 'culture-utopian', religionId: 'religion-technotheism',
      role: 'Scientist', offspringCount: 0, hunger: 10, thirst: 15, fatigue: 20, inventory: { food: 5 },
      personality: { openness: 0.8, conscientiousness: 0.7, extraversion: 0.6, agreeableness: 0.7, neuroticism: 0.3 },
      goals: [{ type: 'masterSkill', status: 'active', progress: 10, description: "Become a master scientist.", targetId: 'healing' }],
      stress: 10, socialStatus: 50,
      skills: { healing: 15, rhetoric: 10, farming: 5, combat: 3, construction: 8, woodcutting: 7, mining: 2, crafting: 4, trading: 8 },
      trauma: [], currency: INITIAL_CURRENCY,
    },
    {
      id: 'agent-2',
      name: 'Bob',
      description: 'Ein pragmatischer und leicht zynischer Agent, der sich oft über Kleinigkeiten beschwert.',
      x: 18, y: 18,
      beliefNetwork: { 'weather_rainy': 0.6, 'weather_sunny': 0.4, 'progress_good': 0.3, 'nature_good': 0.9 },
      emotions: { happiness: 0.4, sadness: 0.2, anger: 0.3, love: 0.1, trust: 0.4, fear: 0.2 },
      resonance: {}, socialMemory: [], lastActions: [], adminAgent: false, health: 100, isAlive: true,
      sickness: null, conversationHistory: [], age: 30, genome: ["G-AGILE", "G-RESISTANT"],
      relationships: {}, cultureId: 'culture-primitivist', religionId: 'religion-gaianism', role: 'Worker',
      offspringCount: 0, hunger: 25, thirst: 20, fatigue: 40, inventory: { wood: 10 },
      personality: { openness: 0.3, conscientiousness: 0.8, extraversion: 0.3, agreeableness: 0.4, neuroticism: 0.6 },
      goals: [{ type: 'buildLargeHouse', status: 'active', progress: 5, description: "Build a sturdy house for the family." }],
      stress: 25, socialStatus: 40,
      skills: { healing: 2, rhetoric: 4, farming: 10, combat: 8, construction: 12, woodcutting: 15, mining: 8, crafting: 6, trading: 3 },
      trauma: [], currency: INITIAL_CURRENCY,
    },
    {
      id: 'agent-guard-1',
      name: 'Garrus',
      description: 'Eine strenge Wache mit einem starken Pflichtbewusstsein.',
      x: 10, y: 12,
      beliefNetwork: { 'law_is_absolute': 0.9, 'progress_good': 0.5 },
      emotions: { happiness: 0.3, sadness: 0.1, anger: 0.2, love: 0.1, trust: 0.6, fear: 0.1 },
      resonance: {}, socialMemory: [], lastActions: [], adminAgent: false, health: 100, isAlive: true,
      sickness: null, conversationHistory: [], age: 35, genome: ["G-RESISTANT", "G-AGILE"],
      relationships: {}, cultureId: 'culture-utopian', religionId: null, role: 'Guard',
      offspringCount: 0, hunger: 15, thirst: 10, fatigue: 10, inventory: { food: 2 },
      personality: { openness: 0.2, conscientiousness: 0.9, extraversion: 0.5, agreeableness: 0.3, neuroticism: 0.4 },
      goals: [], stress: 15, socialStatus: 60,
      skills: { combat: 15, rhetoric: 5 }, trauma: [], currency: 70,
    },
    {
      id: 'agent-admin',
      name: 'Admin',
      description: 'Der Admin-Agent mit besonderen Fähigkeiten',
      x: 10, y: 10,
      beliefNetwork: { 'admin_access': 1.0 }, emotions: {}, resonance: {}, socialMemory: [],
      lastActions: [], adminAgent: true, health: 100, isAlive: true, sickness: null,
      conversationHistory: [], age: 999, genome: [], relationships: {}, cultureId: null, religionId: null, role: null,
      offspringCount: 0, hunger: 0, thirst: 0, fatigue: 0, inventory: {},
      personality: defaultPersonality(), goals: [], stress: 0, socialStatus: 100, skills: defaultSkills(), trauma: [], currency: 99999,
    }
  ],
  entities: [
    { id: 'entity-1', name: 'Haus', description: 'Ein kleines Haus', x: 5, y: 2, ownerId: 'agent-1' },
    { id: 'entity-2', name: 'Spring', description: 'A source of fresh water.', x: 3, y: 15, isResource: true, resourceType: 'water', quantity: Infinity },
    { id: 'entity-3', name: 'Berry Bush', description: 'A bush with edible berries.', x: 15, y: 5, isResource: true, resourceType: 'food', quantity: 25 },
    { id: 'entity-4', name: 'Forest', description: 'A dense patch of trees.', x: 17, y: 15, isResource: true, resourceType: 'wood', quantity: 100 },
    { id: 'entity-5', name: 'Iron Vein', description: 'A deposit of iron ore.', x: 2, y: 18, isResource: true, resourceType: 'iron', quantity: 50 },
    { id: 'entity-marketplace', name: 'Marketplace', description: 'A central place for trade.', x: 10, y: 11, isMarketplace: true },
    { id: 'entity-jail', name: 'Jail', description: 'A place for lawbreakers.', x: 1, y: 19, isJail: true, inmates: [] },
  ],
  cultures: [
    { id: 'culture-utopian', name: 'Utopian Technocrats', sharedBeliefs: { 'progress_good': 0.8, 'nature_good': 0.3 }, memberIds: [], researchPoints: 50, knownTechnologies: [] },
    { id: 'culture-primitivist', name: 'Primitivist Collective', sharedBeliefs: { 'progress_good': 0.2, 'nature_good': 0.8 }, memberIds: [], researchPoints: 10, knownTechnologies: [] }
  ],
  religions: [
    { id: 'religion-technotheism', name: 'Technotheism', dogma: { 'progress_good': 0.95, 'nature_good': 0.5 }, memberIds: [] },
    { id: 'religion-gaianism', name: 'Gaianism', dogma: { 'progress_good': 0.1, 'nature_good': 0.95 }, memberIds: [] }
  ],
  government: INITIAL_GOVERNMENT,
  markets: [{ id: 'market-central', name: 'Central Market', listings: [] }],
  techTree: TECH_TREE,
  actions: [
    // --- BASIC & SURVIVAL ACTIONS ---
    { name: "Eat Food", description: "Eats food from inventory to reduce hunger.", execute: async (agent, allAgents, allEntities, worldState) => {
        if ((agent.inventory['food'] || 0) > 0) {
            agent.inventory['food']--;
            agent.hunger = Math.max(0, agent.hunger - EAT_HUNGER_REDUCTION);
            return { log: { key: 'log_action_eat', params: { agentName: agent.name } } };
        }
        return { log: { key: 'log_action_eat_no_food', params: { agentName: agent.name } } };
    }},
    { name: "Drink Water", description: "Drinks water from a nearby water source to reduce thirst.", execute: async (agent, allAgents, allEntities, worldState) => {
        const { target, distance } = findNearestEntity(agent, allEntities, e => e.isResource && e.resourceType === 'water');
        if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
            agent.thirst = Math.max(0, agent.thirst - DRINK_THIRST_REDUCTION);
            return { log: { key: 'log_action_drink', params: { agentName: agent.name, sourceName: target.name } } };
        }
        if (target) { moveTowards(agent, target, worldState.environment); return { log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: target.name } } }; }
        return { log: { key: 'log_action_drink_no_source', params: { agentName: agent.name } } };
    }},
    { name: "Gather Food", description: "Gathers food from a nearby food source.", execute: async (agent, allAgents, allEntities, worldState) => {
        const { target, distance } = findNearestEntity(agent, allEntities, e => e.isResource && e.resourceType === 'food' && (e.quantity ?? 0) > 0);
        if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
            const agentCulture = worldState.cultures.find(c => c.id === agent.cultureId);
            let efficiencyBonus = 1;
            if (agentCulture?.knownTechnologies.includes('agriculture')) efficiencyBonus = 1.5;
            const gathered = Math.min(GATHER_AMOUNT * efficiencyBonus, target.quantity!);
            target.quantity! -= gathered;
            agent.inventory['food'] = (agent.inventory['food'] || 0) + gathered;
            let skillGain = DEFAULT_SKILL_GAIN;
            if (agent.genome.includes("G-INTELLIGENT")) skillGain *= 1.25;
            agent.skills.farming = (agent.skills.farming || 0) + skillGain;
            return { log: { key: 'log_action_gather_food', params: { agentName: agent.name, amount: gathered, sourceName: target.name } } };
        }
        if (target) { moveTowards(agent, target, worldState.environment); return { log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: target.name } } }; }
        return { log: { key: 'log_action_gather_food_no_source', params: { agentName: agent.name } } };
    }},
    { name: "Gather Wood", description: "Gathers wood from a nearby forest or trees.", execute: async (agent, allAgents, allEntities, worldState) => {
        const { target, distance } = findNearestEntity(agent, allEntities, e => e.isResource && e.resourceType === 'wood' && (e.quantity ?? 0) > 0);
        if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
            const gathered = Math.min(GATHER_AMOUNT, target.quantity!);
            target.quantity! -= gathered;
            agent.inventory['wood'] = (agent.inventory['wood'] || 0) + gathered;
            let skillGain = DEFAULT_SKILL_GAIN;
            if (agent.genome.includes("G-INTELLIGENT")) skillGain *= 1.25;
            agent.skills.woodcutting = (agent.skills.woodcutting || 0) + skillGain;
            return { log: { key: 'log_action_gather_wood', params: { agentName: agent.name, amount: gathered, sourceName: target.name } } };
        }
        if (target) { moveTowards(agent, target, worldState.environment); return { log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: target.name } } }; }
        return { log: { key: 'log_action_gather_wood_no_source', params: { agentName: agent.name } } };
    }},
    { name: "Build Shelter", description: "Uses wood from inventory to build a small shelter.", execute: async (agent, allAgents, allEntities, worldState) => {
        const woodCost = 10;
        if ((agent.inventory['wood'] || 0) >= woodCost) {
            agent.inventory['wood'] -= woodCost;
            let skillGain = DEFAULT_SKILL_GAIN * 5;
            if (agent.genome.includes("G-INTELLIGENT")) skillGain *= 1.25;
            agent.skills.construction = (agent.skills.construction || 0) + skillGain;
            const newShelter: Partial<Entity> = { id: `entity-shelter-${Date.now()}`, name: `Shelter (${agent.name})`, description: `A crude shelter built by ${agent.name}.`, x: agent.x, y: agent.y, ownerId: agent.id };
            return { log: { key: 'log_action_build_shelter', params: { agentName: agent.name } }, sideEffects: { createEntity: newShelter } };
        }
        return { log: { key: 'log_action_build_shelter_no_wood', params: { agentName: agent.name, woodCost } } };
    }},
    { name: "Rest", description: "Agent rests to recover from fatigue, health, and stress.", execute: async (agent, allAgents, allEntities, worldState) => {
        let recovery = 5;
        if (agent.genome.includes("G-FASTHEAL")) recovery = 10;

        const ownShelter = Array.from(allEntities.values()).find(e => e.ownerId === agent.id && e.x === agent.x && e.y === agent.y);
        if (ownShelter) recovery *= 1.5;

        agent.fatigue = Math.max(0, agent.fatigue - FATIGUE_RECOVERY_RATE);
        agent.stress = Math.max(0, agent.stress - STRESS_RECOVERY_REST);
        agent.health = Math.min(100, agent.health + recovery);

        let log: LogEntry = { key: 'log_action_rest', params: { agentName: agent.name, newHealth: agent.health.toFixed(0) } };

        if (agent.sickness && agent.genome.includes("G-RESISTANT") && Math.random() < 0.15) {
            const sickness = agent.sickness;
            agent.sickness = null;
            log = { key: 'log_action_rest_and_cured', params: { agentName: agent.name, newHealth: agent.health.toFixed(0), sickness: sickness } };
        }

        return { log };
    }},

    // --- ECONOMIC ACTIONS ---
    { name: "Work for money", description: "Performs a day's labor for a fixed wage.", execute: async (agent, allAgents, allEntities, worldState) => {
        agent.currency += WORK_FOR_MONEY_AMOUNT;
        agent.fatigue = Math.min(100, agent.fatigue + 30);
        return { log: { key: 'log_action_work_for_money', params: { agentName: agent.name, amount: WORK_FOR_MONEY_AMOUNT } } };
    }},
    { name: "Mine Iron", description: "Mines iron from a vein.", execute: async (agent, allAgents, allEntities, worldState) => {
        const { target, distance } = findNearestEntity(agent, allEntities, e => e.isResource && e.resourceType === 'iron' && (e.quantity ?? 0) > 0);
        if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
            const mined = Math.min(GATHER_AMOUNT / 2, target.quantity!);
            target.quantity! -= mined;
            agent.inventory['iron'] = (agent.inventory['iron'] || 0) + mined;
            let skillGain = DEFAULT_SKILL_GAIN;
            if (agent.genome.includes("G-INTELLIGENT")) skillGain *= 1.25;
            agent.skills.mining = (agent.skills.mining || 0) + skillGain;
            return { log: { key: 'log_action_mine_iron', params: { agentName: agent.name, amount: mined.toFixed(1), sourceName: target.name } } };
        }
        if (target) { moveTowards(agent, target, worldState.environment); return { log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: target.name } } }; }
        return { log: { key: 'log_action_mine_iron_no_source', params: { agentName: agent.name } } };
    }},
    ...RECIPES.map(recipe => ({
        name: recipe.name,
        description: `Crafts ${recipe.output.quantity} ${recipe.output.item}.`,
        execute: async (agent: Agent, allAgents: Map<string, Agent>, allEntities: Map<string, Entity>, worldState: WorldState) => {
            const agentCulture = worldState.cultures.find(c => c.id === agent.cultureId);
            if (recipe.requiredTech && !agentCulture?.knownTechnologies.includes(recipe.requiredTech)) {
                return { log: { key: 'log_action_craft_fail_tech', params: { agentName: agent.name, tech: recipe.requiredTech } } };
            }
            if (recipe.requiredSkill && (agent.skills[recipe.requiredSkill.skill] || 0) < recipe.requiredSkill.level) {
                return { log: { key: 'log_action_craft_fail_skill', params: { agentName: agent.name, skill: recipe.requiredSkill.skill, level: recipe.requiredSkill.level } } };
            }
            const hasIngredients = Object.entries(recipe.ingredients).every(([item, qty]) => (agent.inventory[item] || 0) >= qty!);
            if (hasIngredients) {
                Object.entries(recipe.ingredients).forEach(([item, qty]) => { agent.inventory[item] -= qty!; });
                agent.inventory[recipe.output.item] = (agent.inventory[recipe.output.item] || 0) + recipe.output.quantity;
                let skillGain = DEFAULT_SKILL_GAIN * 2;
                if (agent.genome.includes("G-INTELLIGENT")) skillGain *= 1.25;
                agent.skills.crafting = (agent.skills.crafting || 0) + skillGain;
                return { log: { key: 'log_action_craft_success', params: { agentName: agent.name, itemName: recipe.output.item } } };
            }
            return { log: { key: 'log_action_craft_fail_ingredients', params: { agentName: agent.name, itemName: recipe.output.item } } };
        }
    })),
    { name: "List Item on Market", description: "Lists an item from inventory on the marketplace.", execute: async (agent, allAgents, allEntities, worldState, engine) => {
        const marketEntity = Array.from(allEntities.values()).find(e => e.isMarketplace);
        if (!marketEntity || Math.sqrt(Math.pow(agent.x - marketEntity.x, 2) + Math.pow(agent.y - marketEntity.y, 2)) > PROXIMITY_DISTANCE_THRESHOLD) {
            if(marketEntity) moveTowards(agent, marketEntity, worldState.environment);
            return { log: { key: 'log_action_market_too_far', params: { agentName: agent.name } } };
        }
        const itemToSell = Object.keys(agent.inventory).find(item => agent.inventory[item] > 0);
        if (!itemToSell) {
            return { log: { key: 'log_action_market_no_items', params: { agentName: agent.name } } };
        }
        engine.addListingToMarket('market-central', { fromAgentId: agent.id, item: itemToSell, quantity: 1 });
        agent.inventory[itemToSell]--;
        const price = engine.marketPrices[itemToSell] || 'N/A';
        return { log: { key: 'log_action_market_list_item', params: { agentName: agent.name, item: itemToSell, price } } };
    }},
    { name: "Buy from Market", description: "Buys a listed item from the marketplace.", execute: async (agent, allAgents, allEntities, worldState, engine) => {
        const marketEntity = Array.from(allEntities.values()).find(e => e.isMarketplace);
        if (!marketEntity || Math.sqrt(Math.pow(agent.x - marketEntity.x, 2) + Math.pow(agent.y - marketEntity.y, 2)) > PROXIMITY_DISTANCE_THRESHOLD) {
            if(marketEntity) moveTowards(agent, marketEntity, worldState.environment);
            return { log: { key: 'log_action_market_too_far', params: { agentName: agent.name } } };
        }
        const market = worldState.markets[0];
        if (!market || market.listings.length === 0) {
            return { log: { key: 'log_action_market_is_empty', params: { agentName: agent.name } } };
        }
        const affordableListing = market.listings.find(l => {
            const price = engine.marketPrices[l.item] || 9999;
            return agent.currency >= price && l.fromAgentId !== agent.id;
        });
        if (affordableListing) {
            const price = engine.marketPrices[affordableListing.item];
            engine.executeTrade(agent, affordableListing);
            return { log: { key: 'log_action_market_buy_item', params: { agentName: agent.name, item: affordableListing.item, price: price, sellerName: allAgents.get(affordableListing.fromAgentId)?.name } } };
        }
        return { log: { key: 'log_action_market_cannot_afford', params: { agentName: agent.name } } };
    }},

    // --- POLITICAL ACTIONS ---
    { name: "Vote", description: "Votes for a candidate in an active election.", execute: async (agent, allAgents, allEntities, worldState, engine) => {
        if (!worldState.environment.election?.isActive) {
            return { log: { key: 'log_action_vote_no_election', params: { agentName: agent.name } } };
        }
        const candidates = worldState.environment.election.candidates;
        if (candidates.length === 0) return { log: { key: 'log_action_vote_no_candidates', params: { agentName: agent.name } } };
        // Simple voting logic: vote for the candidate with the best relationship
        let bestCandidate: string | null = null;
        let maxScore = -Infinity;
        candidates.forEach(id => {
            const score = agent.relationships[id]?.score || 0;
            if(score > maxScore) {
                maxScore = score;
                bestCandidate = id;
            }
        });
        if(bestCandidate) {
            engine.castVote(bestCandidate);
            const candidateName = allAgents.get(bestCandidate)?.name;
            return { log: { key: 'log_action_vote_cast', params: { agentName: agent.name, candidateName } } };
        }
        return { log: { key: 'log_action_vote_undecided', params: { agentName: agent.name } } };
    }},
    { name: "Run for Election", description: "Declares candidacy in the next election.", execute: async (agent, allAgents, allEntities, worldState, engine) => {
        if (!worldState.environment.election?.isActive) {
            return { log: { key: 'log_action_run_for_election_no_election', params: { agentName: agent.name } } };
        }
        if (worldState.environment.election.candidates.includes(agent.id)) {
            return { log: { key: 'log_action_run_for_election_already_running', params: { agentName: agent.name } } };
        }
        if (agent.socialStatus < 50) {
             return { log: { key: 'log_action_run_for_election_low_status', params: { agentName: agent.name } } };
        }
        engine.declareCandidacy(agent.id);
        return { log: { key: 'log_action_run_for_election_success', params: { agentName: agent.name } } };
    }},
    { name: "Enact Law", description: "As leader, enact a new law for the society.", execute: async (agent, allAgents, allEntities, worldState, engine) => {
        if(worldState.government.leaderId !== agent.id) {
            return { log: { key: 'log_action_enact_law_not_leader', params: { agentName: agent.name } } };
        }
        // For simplicity, we'll have a predefined law to enact. A real implementation would have a UI.
        const newLaw: Law = { id: 'law-curfew', name: 'Curfew', description: 'Wandering at night is illegal.', violatingAction: 'Move', punishment: { type: 'fine', amount: 10 } };
        if (worldState.government.laws.some(l => l.id === newLaw.id)) {
             return { log: { key: 'log_action_enact_law_exists', params: { agentName: agent.name, lawName: newLaw.name } } };
        }
        engine.enactLaw(newLaw);
        return { log: { key: 'log_action_enact_law_success', params: { agentName: agent.name, lawName: newLaw.name } } };
    }},

    // --- TECHNOLOGY & LEARNING ACTIONS ---
    { name: "Research", description: "A Scientist can perform research to generate knowledge for their culture.", execute: async (agent, allAgents, allEntities, worldState, engine) => {
        if (agent.role !== 'Scientist') {
            return { log: { key: 'log_action_fail_role', params: { agentName: agent.name, requiredRole: 'Scientist' } } };
        }
        if (!agent.cultureId) {
            return { log: { key: 'log_action_research_no_culture', params: { agentName: agent.name } } };
        }
        let researchPoints = RESEARCH_PER_ACTION;
        if (agent.genome.includes("G-INTELLIGENT")) {
            researchPoints *= 1.25;
        }
        engine.addResearchPoints(agent.cultureId, researchPoints);
        return { log: { key: 'log_action_research', params: { agentName: agent.name, points: researchPoints } } };
    }},
    { name: "Share Knowledge", description: "Two scientists share insights, boosting research.", execute: async (agent, allAgents, allEntities, worldState, engine) => {
        const { target, distance } = findNearestAgent(agent, allAgents, other => other.role === 'Scientist' && other.cultureId === agent.cultureId);
        if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
             if (!agent.cultureId) return { log: { key: 'log_action_research_no_culture', params: { agentName: agent.name } } };
             engine.addResearchPoints(agent.cultureId, RESEARCH_PER_ACTION * 2);
             return { log: { key: 'log_action_share_knowledge', params: { agentName1: agent.name, agentName2: target.name } } };
        }
        return { log: { key: 'log_action_share_knowledge_no_one', params: { agentName: agent.name } } };
    }},
    
    // --- SOCIAL & PERSONAL ACTIONS --- (some modified)
    { name: "Propose Marriage", description: "Proposes marriage to a friendly agent nearby.", execute: async (agent, allAgents, allEntities, worldState, engine) => {
        if (agent.relationships && Object.values(agent.relationships).some(r => r.type === 'spouse')) {
            return { log: { key: 'log_action_propose_fail_already_married', params: { agentName: agent.name } } };
        }
        const { target, distance } = findNearestAgent(agent, allAgents, other =>
            !other.adminAgent &&
            agent.relationships[other.id]?.type === 'friend' &&
            (agent.relationships[other.id]?.score || 0) > 80 &&
            !Object.values(other.relationships).some(r => r.type === 'spouse')
        );

        if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
            const successChance = 0.5 + (target.relationships[agent.id]?.score || 0) / 200;
            if (Math.random() < successChance) {
                engine.addSocialMemory(target.id, { agentId: agent.id, action: 'propose_marriage', result: 'initiated', emotionalImpact: 0.8, timestamp: worldState.environment.time });
                return { log: { key: 'log_action_propose_marriage_success', params: { agentName: agent.name, targetName: target.name } } };
            } else {
                return { log: { key: 'log_action_propose_marriage_fail', params: { agentName: agent.name, targetName: target.name } } };
            }
        }
        return { log: { key: 'log_action_propose_no_one_suitable', params: { agentName: agent.name } } };
    }},
    { name: "Accept Proposal", description: "Accepts a marriage proposal from another agent.", execute: async (agent, allAgents, allEntities, worldState, engine) => {
        const proposal = agent.socialMemory.find(mem => mem.action === 'propose_marriage' && mem.result === 'initiated');
        if (proposal) {
            const proposer = allAgents.get(proposal.agentId);
            if (proposer) {
                agent.relationships[proposer.id] = { ...agent.relationships[proposer.id], type: 'spouse', score: Math.min(100, (agent.relationships[proposer.id]?.score || 80) + 20) };
                proposer.relationships[agent.id] = { ...proposer.relationships[agent.id], type: 'spouse', score: Math.min(100, (proposer.relationships[agent.id]?.score || 80) + 20) };
                agent.socialMemory = agent.socialMemory.filter(mem => mem !== proposal);
                return { log: { key: 'log_action_accept_proposal_success', params: { agentName: agent.name, targetName: proposer.name } } };
            }
        }
        return { log: { key: 'log_action_accept_proposal_none', params: { agentName: agent.name } } };
    }},
    { name: "Reproduce", description: "Attempts to have a child with a spouse.", execute: async (agent, allAgents, allEntities, worldState) => {
        const spouseEntry = Object.entries(agent.relationships).find(([, rel]) => rel.type === 'spouse');
        if (!spouseEntry) return { log: { key: 'log_action_reproduce_no_partner', params: { agentName: agent.name } } };
        
        const spouse = allAgents.get(spouseEntry[0]);
        if (!spouse || Math.sqrt(Math.pow(agent.x - spouse.x, 2) + Math.pow(agent.y - spouse.y, 2)) > PROXIMITY_DISTANCE_THRESHOLD) {
             return { log: { key: 'log_action_reproduce_no_partner', params: { agentName: agent.name } } };
        }
        if (agent.age < MIN_REPRODUCTION_AGE || agent.age > MAX_REPRODUCTION_AGE || spouse.age < MIN_REPRODUCTION_AGE || spouse.age > MAX_REPRODUCTION_AGE) {
            return { log: { key: 'log_action_reproduce_fail_age', params: { agentName: agent.name, partnerName: spouse.name } } };
        }
        if (agent.offspringCount >= MAX_OFFSPRING || spouse.offspringCount >= MAX_OFFSPRING) {
             return { log: { key: 'log_action_reproduce_fail_max_offspring', params: { agentName: agent.name, partnerName: spouse.name } } };
        }

        let successChance = 0.15;
        if (agent.genome.includes("G-FERTILE") || spouse.genome.includes("G-FERTILE")) {
            successChance *= 1.5;
        }

        if (Math.random() < successChance) {
            agent.offspringCount++;
            spouse.offspringCount++;
            const childName = `${agent.name.substring(0, 3)}${spouse.name.slice(-3)}`;
            const childDescription = `The child of ${agent.name} and ${spouse.name}.`;
            const newAgentData: Partial<Agent> & { name: string, description: string, parents: [Agent, Agent] } = { name: childName, description: childDescription, parents: [agent, spouse] };
            return { log: { key: 'log_action_reproduce_success', params: { agentName: agent.name, partnerName: spouse.name } }, sideEffects: { createAgent: newAgentData } };
        }
        
        return { log: { key: 'log_action_reproduce_fail', params: { agentName: agent.name, partnerName: spouse.name } } };
    }},
    { name: "Talk", description: "Initiates a conversation with a nearby agent.", execute: async (agent, allAgents, allEntities, worldState, engine) => {
        const { target, distance } = findNearestAgent(agent, allAgents, other => other.isAlive);

        if (!target || distance > PROXIMITY_DISTANCE_THRESHOLD) {
            wander(agent, worldState.environment);
            return { log: { key: 'log_action_talk_no_one_near', params: { agentName: agent.name } } };
        }

        const conversationHistory = agent.conversationHistory.slice(-5);
        const response = await generateAgentConversation(agent, target, conversationHistory, worldState, engine.language);

        if (response && response.dialogue) {
            const dialogue = response.dialogue;
            agent.conversationHistory.push({ speakerName: agent.name, message: dialogue });
            target.conversationHistory.push({ speakerName: agent.name, message: dialogue });
            
            if (agent.conversationHistory.length > 10) agent.conversationHistory.shift();
            if (target.conversationHistory.length > 10) target.conversationHistory.shift();
            
            return { log: { key: 'log_action_talk', params: { speakerName: agent.name, listenerName: target.name, dialogue: dialogue } } };
        } else {
            wander(agent, worldState.environment);
            return { log: { key: 'log_action_talk_failed', params: { agentName: agent.name } } };
        }
    }},
    { name: "Mentor young agent", description: "Teaches a skill to a younger agent, improving their ability and the mentor's social standing.", execute: async (agent, allAgents, allEntities, worldState, engine) => {
        const { target, distance } = findNearestAgent(agent, allAgents, other => other.age < ADULTHOOD_MAX_AGE && other.id !== agent.id);
        if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
            const skillToTeach = Object.keys(agent.skills).sort((a,b) => agent.skills[b] - agent.skills[a])[0];
            if (skillToTeach && agent.skills[skillToTeach] > 20) {
                target.skills[skillToTeach] = (target.skills[skillToTeach] || 0) + DEFAULT_SKILL_GAIN * 2;
                agent.socialStatus = Math.min(100, agent.socialStatus + 2);
                agent.emotions.happiness = Math.min(1, (agent.emotions.happiness || 0) + 0.1);
                return { log: { key: 'log_action_mentor_success', params: { mentorName: agent.name, studentName: target.name, skill: skillToTeach } } };
            }
            return { log: { key: 'log_action_mentor_fail_skill', params: { agentName: agent.name } } };
        }
        return { log: { key: 'log_action_mentor_no_one', params: { agentName: agent.name } } };
    }},
    { name: "Seek Counseling", description: "Seeks out a counselor to reduce stress.", execute: async (agent, allAgents, allEntities, worldState, engine) => {
        const { target, distance } = findNearestAgent(agent, allAgents, other => other.role === 'Counselor');
        if (target) {
            moveTowards(agent, target, worldState.environment);
            return { log: { key: 'log_action_seek_counseling', params: { agentName: agent.name, counselorName: target.name } } };
        }
        return { log: { key: 'log_action_seek_counseling_fail', params: { agentName: agent.name } } };
    }},
    { name: "Provide Counseling", description: "Provides counseling to a nearby agent to reduce their stress.", execute: async (agent, allAgents, allEntities, worldState, engine) => {
        const { target, distance } = findNearestAgent(agent, allAgents, other => other.stress > 50);
        if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
            const counselingEffectiveness = (agent.skills.rhetoric || 1) / 100 * 30; // Max 30 stress reduction
            target.stress = Math.max(0, target.stress - counselingEffectiveness);
            agent.skills.rhetoric = (agent.skills.rhetoric || 0) + DEFAULT_SKILL_GAIN;
            agent.currency += 5; // Counselors get paid a little
            return { log: { key: 'log_action_provide_counseling_success', params: { counselorName: agent.name, patientName: target.name } } };
        }
        return { log: { key: 'log_action_provide_counseling_fail', params: { agentName: agent.name } } };
    }},
    { name: "Fight", description: "Starts a fight with another agent.", execute: async (agent, allAgents, allEntities, worldState) => {
        const { target, distance } = findNearestAgent(agent, allAgents);
         if (target && distance < PROXIMITY_DISTANCE_THRESHOLD) {
            const agentDamage = 5 + (agent.skills.combat || 0) / 2;
            const targetDamage = 5 + (target.skills.combat || 0) / 2;
            agent.health = Math.max(0, agent.health - targetDamage);
            target.health = Math.max(0, target.health - agentDamage);
            
            const loser = agent.health < target.health ? agent : target;
            const winner = loser.id === agent.id ? target : agent;
            if(!loser.goals.some(g => g.type === 'avengeRival' && g.targetId === winner.id)) {
                 const newGoal: Goal = {
                    type: 'avengeRival', status: 'active', progress: 0,
                    description: `Avenge the loss against ${winner.name}.`, targetId: winner.id,
                };
                loser.goals.push(newGoal);
            }
            loser.socialStatus = Math.max(0, loser.socialStatus - STATUS_FROM_FIGHT_WIN);
            winner.socialStatus = Math.min(100, winner.socialStatus + STATUS_FROM_FIGHT_WIN);

            return { log: { key: 'log_action_fight', params: { agentName1: agent.name, agentName2: target.name } } };
         }
         return { log: { key: 'log_action_wander_thoughtfully', params: { agentName: agent.name } } };
    }},
    { name: "Steal", description: "Attempts to steal an item from another agent's inventory.", execute: async (agent, allAgents, allEntities, worldState) => {
        const { target, distance } = findNearestAgent(agent, allAgents, other => Object.keys(other.inventory).length > 0);
        if (!target || distance > PROXIMITY_DISTANCE_THRESHOLD) {
            return { log: { key: 'log_action_steal_no_target', params: { agentName: agent.name } } };
        }
        const successChance = 0.3 + (agent.personality.conscientiousness < 0.3 ? 0.2 : 0);
        if (Math.random() < successChance) {
            const itemToSteal = Object.keys(target.inventory).find(item => target.inventory[item] > 0);
            if (itemToSteal) {
                target.inventory[itemToSteal]--;
                agent.inventory[itemToSteal] = (agent.inventory[itemToSteal] || 0) + 1;
                return { log: { key: 'log_action_steal_success', params: { stealer: agent.name, victim: target.name, item: itemToSteal } } };
            }
        }
        return { log: { key: 'log_action_steal_fail', params: { stealer: agent.name, victim: target.name } } };
    }},
    { name: "Move North", description: "Moves the agent one step north.", execute: async (agent, allAgents, allEntities, worldState) => {
        const stepSize = agent.genome.includes("G-AGILE") ? 2 : 1;
        agent.y = Math.max(0, agent.y - stepSize);
        return { log: { key: 'log_action_move', params: { agentName: agent.name, direction: 'North', x: agent.x, y: agent.y } } };
    }},
    { name: "Move South", description: "Moves the agent one step south.", execute: async (agent, allAgents, allEntities, worldState) => {
        const stepSize = agent.genome.includes("G-AGILE") ? 2 : 1;
        agent.y = Math.min(worldState.environment.height - 1, agent.y + stepSize);
        return { log: { key: 'log_action_move', params: { agentName: agent.name, direction: 'South', x: agent.x, y: agent.y } } };
    }},
    { name: "Move East", description: "Moves the agent one step east.", execute: async (agent, allAgents, allEntities, worldState) => {
        const stepSize = agent.genome.includes("G-AGILE") ? 2 : 1;
        agent.x = Math.min(worldState.environment.width - 1, agent.x + stepSize);
        return { log: { key: 'log_action_move', params: { agentName: agent.name, direction: 'East', x: agent.x, y: agent.y } } };
    }},
    { name: "Move West", description: "Moves the agent one step west.", execute: async (agent, allAgents, allEntities, worldState) => {
        const stepSize = agent.genome.includes("G-AGILE") ? 2 : 1;
        agent.x = Math.max(0, agent.x - stepSize);
        return { log: { key: 'log_action_move', params: { agentName: agent.name, direction: 'West', x: agent.x, y: agent.y } } };
    }},
    // --- NEW GUARD ACTIONS ---
    { name: "Patrol", description: "Patrols the area to look for criminal activity.", execute: async(agent, allAgents, allEntities, worldState) => {
        wander(agent, worldState.environment);
        return { log: { key: 'log_action_patrol', params: { agentName: agent.name } } };
    }},
    { name: "Arrest", description: "Arrests a target agent and takes them to jail.", execute: async(agent, allAgents, allEntities, worldState) => {
        // This action is triggered by the system when a crime is witnessed.
        // As a fallback, a guard choosing this will look for a nearby low-status agent.
        const { target } = findNearestAgent(agent, allAgents, other => other.socialStatus < 40);
        if (target) {
            const jail = Array.from(allEntities.values()).find(e => e.isJail);
            if (jail) {
                moveTowards(agent, target, worldState.environment);
                if (Math.sqrt(Math.pow(agent.x - target.x, 2) + Math.pow(agent.y - target.y, 2)) < PROXIMITY_DISTANCE_THRESHOLD) {
                    target.x = jail.x;
                    target.y = jail.y;
                    const law = worldState.government.laws.find(l => l.punishment.type === 'arrest');
                    target.imprisonedUntil = worldState.environment.time + (law?.punishment.amount || 20);
                    jail.inmates = [...(jail.inmates || []), target.id];
                    return { log: { key: 'log_action_arrest_success', params: { guardName: agent.name, criminalName: target.name } } };
                }
                return { log: { key: 'log_action_move_towards_agent', params: { agentName: agent.name, targetName: target.name } } };
            }
        }
        return { log: { key: 'log_action_patrol', params: { agentName: agent.name } } };
    }},
  ]
};

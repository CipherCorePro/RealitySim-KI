import type { WorldState, Agent, Action, EnvironmentState, Emotions, Beliefs, Entity, Goal, Personality, Skills, Technology, Recipe, Law, Government, LogEntry, Psyche } from './types';

export const RESONANCE_DECAY_RATE = 0.95;
export const RESONANCE_THRESHOLD = 0.1;
export const RESONANCE_UPDATE_AMOUNT = 0.2;
export const MAX_LAST_ACTIONS = 5;
export const AGE_INCREMENT = 0.1;
export const MIN_REPRODUCTION_AGE = 20;
export const MAX_REPRODUCTION_AGE = 50;
export const MAX_AGE = 80;
export const AGE_RELATED_HEALTH_DECLINE = 0.5;
export const RELATIONSHIP_INCREMENT_PROXIMITY = 2.0;
export const PROXIMITY_DISTANCE_THRESHOLD = 3;
export const GENOME_OPTIONS = ["G-RESISTANT", "G-AGILE", "G-SOCIAL", "G-LONGEVITY", "G-FASTHEAL", "G-INTELLIGENT", "G-FERTILE"];
export const EMOTION_DECAY_RATE = 0.98;
export const DISPOSITION_DECAY_RATE = 0.998;
export const MAX_SOCIAL_MEMORIES = 20;
export const MAX_LONG_TERM_MEMORIES = 200;
export const MAX_TRANSACTIONS = 500;
export const MUTATION_RATE = 0.05;
export const MAX_OFFSPRING = 2;
export const CULTURAL_ASSIMILATION_RATE = 0.01;
export const RELIGIOUS_ASSIMILATION_RATE = 0.02;
export const CULTURAL_EVOLUTION_INTERVAL = 20;
export const EMOTIONAL_LEARNING_RATE = 0.1;

export const CHILDHOOD_MAX_AGE = 12;
export const ADOLESCENCE_MAX_AGE = 19;
export const ADULTHOOD_MAX_AGE = 65;

export const ROLES = ['Worker', 'Healer', 'Scientist', 'Leader', 'Trader', 'Crafter', 'Guard', 'Counselor', 'Entrepreneur'];
export const RESOURCE_TYPES = ['food', 'water', 'wood', 'medicine', 'iron', 'stone', 'coal', 'sand', 'clay'];
export const SKILL_TYPES = ['healing', 'woodcutting', 'rhetoric', 'combat', 'construction', 'farming', 'mining', 'crafting', 'trading'];

// --- NEW CONSTANTS ---

// Learning & Personality
export const Q_LEARNING_RATE = 0.1;
export const Q_DISCOUNT_FACTOR = 0.9;
export const EPSILON_GREEDY = 0.1; // 10% chance to explore a random action
export const PERSONALITY_SHIFT_RATE = 0.001;
export const STRESS_THRESHOLD_FOR_PERSONALITY_SHIFT = 70;

// Economy
export const INITIAL_CURRENCY = 50;
export const RESOURCE_PURCHASE_COST = 150;
export const WORK_FOR_MONEY_AMOUNT = 10;
export const FOUND_FACTORY_COST = { currency: 300, wood: 20, stone: 20 };
export const FACTORY_WAGE = 15;
export const FACTORY_OWNER_PROFIT_PER_WORKER = 5;


// Random Data for Generation
export const RANDOM_FIRST_NAMES = ['Elara', 'Rhys', 'Silvana', 'Orion', 'Nadia', 'Marius', 'Lyra', 'Kai', 'Jasmine', 'Isaac', 'Helena', 'Gareth', 'Fiona', 'Elias', 'Dahlia', 'Caspian', 'Bram', 'Anya', 'Ralf', 'Garrus', 'Bob', 'Alice', 'Xavier', 'Willow', 'Vera', 'Ulysses', 'Thalia', 'Silas', 'Rhiannon', 'Quentin', 'Phoebe'];
export const RANDOM_LAST_NAMES = ['Meadowbrook', 'Stonehand', 'Riverwind', 'Blackwood', 'Ironhide', 'Swiftfoot', 'Sunstrider', 'Shadowend'];
export const RANDOM_DESCRIPTORS = ['A curious', 'A pragmatic', 'A cheerful', 'A cynical', 'An optimistic', 'A cautious', 'A brave', 'A timid'];
export const RANDOM_AGENT_ROLES = ['explorer', 'artisan', 'scholar', 'hermit', 'warrior', 'trader', 'healer'];
export const RANDOM_HOBBIES = ['who loves to talk about the weather', 'who complains about small things', 'who is optimistic about the future', 'who is wary of strangers', 'who secretly writes poetry', 'who collects rare stones'];
export const RANDOM_BELIEF_KEYS = ['progress_good', 'nature_good', 'wealth_is_power', 'community_first', 'tradition_important', 'knowledge_is_sacred'];


export const RECIPES: Recipe[] = [
    { name: 'Craft Advanced Medicine', output: { item: 'advanced_medicine', quantity: 1 }, ingredients: { medicine: 5, water: 2 }, requiredSkill: { skill: 'healing', level: 15 }, requiredTech: 'chemistry' },
    { name: 'Craft Charcoal', output: { item: 'charcoal', quantity: 2 }, ingredients: { wood: 5 }, requiredSkill: { skill: 'crafting', level: 3 } },
    { name: 'Smelt Steel Ingot', output: { item: 'steel_ingot', quantity: 1 }, ingredients: { iron: 3, charcoal: 1 }, requiredSkill: { skill: 'crafting', level: 12 }, requiredTech: 'metallurgy' },
    { name: 'Craft Sword', output: { item: 'sword', quantity: 1 }, ingredients: { wood: 1, steel_ingot: 2 }, requiredSkill: { skill: 'crafting', level: 10 }, requiredTech: 'metallurgy' },
    { name: 'Craft Plow', output: { item: 'plow', quantity: 1 }, ingredients: { wood: 8, iron: 2 }, requiredSkill: { skill: 'crafting', level: 5 }, requiredTech: 'agriculture' },
    { name: 'Craft Bricks', output: { item: 'bricks', quantity: 5 }, ingredients: { clay: 10 }, requiredSkill: { skill: 'construction', level: 5 }, requiredTech: 'advanced_construction' },
    { name: 'Craft Glass', output: { item: 'glass', quantity: 1 }, ingredients: { sand: 5, charcoal: 2 }, requiredSkill: { skill: 'crafting', level: 8 }, requiredTech: 'manufacturing' },
    { name: 'Craft Tools', output: { item: 'tools', quantity: 1 }, ingredients: { steel_ingot: 2, wood: 2 }, requiredSkill: { skill: 'crafting', level: 15 }, requiredTech: 'manufacturing' },
    { name: 'Craft Furniture', output: { item: 'furniture', quantity: 1 }, ingredients: { wood: 10, tools: 1 }, requiredSkill: { skill: 'construction', level: 10 }, requiredTech: 'manufacturing' },
    { name: 'Craft Pottery', output: { item: 'pottery', quantity: 1 }, ingredients: { clay: 5 }, requiredSkill: { skill: 'crafting', level: 6 } },
];

// Politics
export const ELECTION_TERM_LENGTH = 100; // An election is held every 100 steps
export const INITIAL_LAWS: Law[] = [
    { id: 'law-no-theft', name: 'Anti-Theft Law', description: 'Stealing from others is illegal.', violatingAction: 'Steal', punishment: { type: 'arrest', amount: 20 } },
    { id: 'law-no-fighting', name: 'Peace Mandate', description: 'Initiating a fight is illegal.', violatingAction: 'Fight', punishment: { type: 'arrest', amount: 15 } },
];
export const INITIAL_GOVERNMENT: Government = { type: 'democracy', leaderId: null, laws: INITIAL_LAWS };

// Technology
export const RESEARCH_PER_ACTION = 10;
export const TECH_TREE: Technology[] = [
    { id: 'agriculture', name: 'Agriculture', description: 'Improves farming efficiency and unlocks the Plow.', researchCost: 100, unlocks: { recipes: ['Craft Plow'] } },
    { id: 'advanced_construction', name: 'Advanced Construction', description: 'Allows for the creation of more durable building materials like bricks.', researchCost: 120, requiredTech: ['agriculture'], unlocks: { recipes: ['Craft Bricks'] } },
    { id: 'metallurgy', name: 'Metallurgy', description: 'Allows the smelting of iron and crafting of metal tools.', researchCost: 150, requiredTech: ['agriculture'], unlocks: { actions: ['Mine Iron'], recipes: ['Craft Sword', 'Smelt Steel Ingot'] } },
    { id: 'manufacturing', name: 'Manufacturing', description: 'Unlocks complex production processes for tools and goods.', researchCost: 250, requiredTech: ['metallurgy'], unlocks: { actions: ['Found Factory'], recipes: ['Craft Tools', 'Craft Furniture', 'Craft Glass'] } },
    { id: 'writing', name: 'Writing', description: 'Enables knowledge to be shared more effectively.', researchCost: 200, requiredTech: ['agriculture'], unlocks: { actions: ['Share Knowledge'] } },
    { id: 'chemistry', name: 'Chemistry', description: 'Unlocks advanced potions and medicines.', researchCost: 300, requiredTech: ['writing'], unlocks: { recipes: ['Craft Advanced Medicine'] } },
    { id: 'bioengineering', name: 'Bioengineering', description: 'Unlocks advanced biological manipulation techniques like artificial insemination.', researchCost: 500, requiredTech: ['chemistry'], unlocks: { actions: ['Artificial Insemination'] } },
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
export const BOREDOM_INCREASE_RATE = 0.05;
export const PSYCHE_DECAY_RATE = 0.995;


export const defaultEmotions = (): Emotions => ({ happiness: 0.5, sadness: 0.1, anger: 0.1, fear: 0.1, trust: 0.3, love: 0.1 });
export const defaultPersonality = (): Personality => ({ openness: 0.5, conscientiousness: 0.5, extraversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 });
export const defaultSkills = (): Skills => ({ healing: 1, woodcutting: 1, rhetoric: 1, combat: 1, construction: 1, farming: 1, mining: 1, crafting: 1, trading: 1 });
export const defaultPsyche = (): Psyche => ({
    empathy: 0.5, vengefulness: 0.1, forgiveness: 0.5, searchForMeaning: 0.2, decisionPressure: 0.1,
    fearOfDeath: 0.2, boredom: 0.0, inspiration: 0.1, fanaticism: 0.1, spiritualNeed: 0.3, jealousy: 0.1,
});
export const defaultQTable = (): { [key: string]: number } => ({});


// --- INITIAL WORLD STATE ---
export const initialWorldState: WorldState = {
  environment: {
    time: 0,
    weather: "sonnig",
    width: 30,
    height: 30,
    election: null,
  },
  agents: [
    {
      id: 'agent-1',
      name: 'Alice',
      description: 'Ein neugieriger Agent, der optimistisch ist und gerne über das Wetter spricht.',
      x: 1, y: 1,
      beliefNetwork: { 'weather_sunny': 0.7, 'weather_rainy': 0.3, 'progress_good': 0.8, 'nature_good': 0.4 },
      emotions: { happiness: 0.7, sadness: 0.1, anger: 0.1, love: 0.2, trust: 0.5, fear: 0.1, shame: 0.1, pride: 0.4, grief: 0.0 },
      resonance: {}, socialMemory: [], longTermMemory: [], lastActions: [], adminAgent: false, health: 100, isAlive: true,
      sickness: null, conversationHistory: [], age: 25, genome: ["G-SOCIAL", "G-LONGEVITY", "G-INTELLIGENT"],
      relationships: {
        'agent-2': { type: 'acquaintance', score: 35, disposition: {} },
        'agent-guard-1': { type: 'stranger', score: 25, disposition: {} },
        'agent-admin': { type: 'friend', score: 100, disposition: {} }
      }, 
      cultureId: 'culture-utopian', religionId: 'religion-technotheism',
      role: 'Scientist', offspringCount: 0, childrenIds: [], hunger: 10, thirst: 15, fatigue: 20, inventory: { food: 5 },
      personality: { openness: 0.8, conscientiousness: 0.7, extraversion: 0.6, agreeableness: 0.7, neuroticism: 0.3 },
      goals: [{ type: 'masterSkill', status: 'active', progress: 10, description: "Become a master scientist.", targetId: 'healing' }],
      stress: 10, socialStatus: 50,
      skills: { healing: 15, rhetoric: 10, farming: 5, combat: 3, construction: 8, woodcutting: 7, mining: 2, crafting: 4, trading: 8 },
      trauma: [], currency: INITIAL_CURRENCY,
      psyche: { empathy: 0.7, vengefulness: 0.1, forgiveness: 0.8, searchForMeaning: 0.5, decisionPressure: 0.2, fearOfDeath: 0.1, boredom: 0.1, inspiration: 0.6, fanaticism: 0.2, spiritualNeed: 0.4, jealousy: 0.1 },
      qTable: {}, lastStressLevel: 10,
    },
    {
      id: 'agent-2',
      name: 'Bob',
      description: 'Ein pragmatischer und leicht zynischer Agent, der sich oft über Kleinigkeiten beschwert.',
      x: 18, y: 18,
      beliefNetwork: { 'weather_rainy': 0.6, 'weather_sunny': 0.4, 'progress_good': 0.3, 'nature_good': 0.9 },
      emotions: { happiness: 0.4, sadness: 0.2, anger: 0.3, love: 0.1, trust: 0.4, fear: 0.2, shame: 0.3, pride: 0.2, grief: 0.1 },
      resonance: {}, socialMemory: [], longTermMemory: [], lastActions: [], adminAgent: false, health: 100, isAlive: true,
      sickness: null, conversationHistory: [], age: 30, genome: ["G-AGILE", "G-RESISTANT"],
      relationships: {
        'agent-1': { type: 'acquaintance', score: 35, disposition: {} },
        'agent-admin': { type: 'friend', score: 100, disposition: {} }
      }, 
      cultureId: 'culture-primitivist', religionId: 'religion-gaianism', role: 'Worker',
      offspringCount: 0, childrenIds: [], hunger: 25, thirst: 20, fatigue: 40, inventory: { wood: 10 },
      personality: { openness: 0.3, conscientiousness: 0.8, extraversion: 0.3, agreeableness: 0.4, neuroticism: 0.6 },
      goals: [{ type: 'buildLargeHouse', status: 'active', progress: 5, description: "Build a sturdy house for the family." }],
      stress: 25, socialStatus: 40,
      skills: { healing: 2, rhetoric: 4, farming: 10, combat: 8, construction: 12, woodcutting: 15, mining: 8, crafting: 6, trading: 3 },
      trauma: [], currency: INITIAL_CURRENCY,
      psyche: { empathy: 0.3, vengefulness: 0.4, forgiveness: 0.2, searchForMeaning: 0.1, decisionPressure: 0.4, fearOfDeath: 0.4, boredom: 0.3, inspiration: 0.2, fanaticism: 0.4, spiritualNeed: 0.6, jealousy: 0.3 },
      qTable: {}, lastStressLevel: 25,
    },
    {
      id: 'agent-guard-1',
      name: 'Garrus',
      description: 'Eine strenge Wache mit einem starken Pflichtbewusstsein.',
      x: 10, y: 12,
      beliefNetwork: { 'law_is_absolute': 0.9, 'progress_good': 0.5 },
      emotions: { happiness: 0.3, sadness: 0.1, anger: 0.2, love: 0.1, trust: 0.6, fear: 0.1, shame: 0.1, pride: 0.7, grief: 0.0 },
      resonance: {}, socialMemory: [], longTermMemory: [], lastActions: [], adminAgent: false, health: 100, isAlive: true,
      sickness: null, conversationHistory: [], age: 35, genome: ["G-RESISTANT", "G-AGILE"],
      relationships: {
        'agent-1': { type: 'stranger', score: 25, disposition: {} },
        'agent-admin': { type: 'friend', score: 100, disposition: {} }
      }, 
      cultureId: 'culture-utopian', religionId: null, role: 'Guard',
      offspringCount: 0, childrenIds: [], hunger: 15, thirst: 10, fatigue: 10, inventory: { food: 2 },
      personality: { openness: 0.2, conscientiousness: 0.9, extraversion: 0.5, agreeableness: 0.3, neuroticism: 0.4 },
      goals: [], stress: 15, socialStatus: 60,
      skills: { combat: 15, rhetoric: 5 }, trauma: [], currency: 70,
      psyche: { empathy: 0.4, vengefulness: 0.2, forgiveness: 0.6, searchForMeaning: 0.1, decisionPressure: 0.6, fearOfDeath: 0.3, boredom: 0.5, inspiration: 0.1, fanaticism: 0.8, spiritualNeed: 0.1, jealousy: 0.1 },
      qTable: {}, lastStressLevel: 15,
    },
    {
      id: 'agent-admin',
      name: 'Admin',
      description: 'Der Admin-Agent mit besonderen Fähigkeiten',
      x: 10, y: 10,
      beliefNetwork: { 'admin_access': 1.0 }, emotions: {}, resonance: {}, socialMemory: [],
      longTermMemory: [], lastActions: [], adminAgent: true, health: 100, isAlive: true, sickness: null,
      conversationHistory: [], age: 999, genome: [], 
      relationships: {
        'agent-1': { type: 'friend', score: 100, disposition: {} },
        'agent-2': { type: 'friend', score: 100, disposition: {} },
        'agent-guard-1': { type: 'friend', score: 100, disposition: {} }
      }, 
      cultureId: null, religionId: null, role: null,
      offspringCount: 0, childrenIds: [], hunger: 0, thirst: 0, fatigue: 0, inventory: {},
      personality: defaultPersonality(), goals: [], stress: 0, socialStatus: 100, skills: defaultSkills(), trauma: [], currency: 99999,
      psyche: defaultPsyche(),
      qTable: {}, lastStressLevel: 0,
    }
  ],
  entities: [
    { id: 'entity-1', name: 'Haus', description: 'Ein kleines Haus', x: 5, y: 2, ownerId: 'agent-1' },
    { id: 'entity-2', name: 'Spring', description: 'A source of fresh water.', x: 3, y: 15, isResource: true, resourceType: 'water', quantity: Infinity },
    { id: 'entity-3', name: 'Berry Bush', description: 'A bush with edible berries.', x: 15, y: 5, isResource: true, resourceType: 'food', quantity: 25 },
    { id: 'entity-4', name: 'Forest', description: 'A dense patch of trees.', x: 17, y: 15, isResource: true, resourceType: 'wood', quantity: 100 },
    { id: 'entity-5', name: 'Iron Vein', description: 'A deposit of iron ore.', x: 2, y: 18, isResource: true, resourceType: 'iron', quantity: 50 },
    { id: 'entity-stone-1', name: 'Rocky Outcrop', description: 'A source of stone.', x: 25, y: 25, isResource: true, resourceType: 'stone', quantity: 100 },
    { id: 'entity-coal-1', name: 'Coal Deposit', description: 'A source of coal.', x: 2, y: 8, isResource: true, resourceType: 'coal', quantity: 80 },
    { id: 'entity-sand-1', name: 'Sandy Patch', description: 'A source of sand.', x: 28, y: 5, isResource: true, resourceType: 'sand', quantity: 120 },
    { id: 'entity-clay-1', name: 'Clay Pit', description: 'A source of clay.', x: 15, y: 28, isResource: true, resourceType: 'clay', quantity: 120 },
    { id: 'entity-marketplace', name: 'Marketplace', description: 'A central place for trade.', x: 10, y: 11, isMarketplace: true },
    { id: 'entity-jail', name: 'Jail', description: 'A place for lawbreakers.', x: 1, y: 19, isJail: true, inmates: [] },
  ],
  cultures: [
    { id: 'culture-utopian', name: 'Utopian Technocrats', sharedBeliefs: { 'progress_good': 0.8, 'nature_good': 0.3 }, memberIds: [], researchPoints: 25, knownTechnologies: [] },
    { id: 'culture-primitivist', name: 'Primitivist Collective', sharedBeliefs: { 'progress_good': 0.2, 'nature_good': 0.8 }, memberIds: [], researchPoints: 25, knownTechnologies: [] }
  ],
  religions: [
    { id: 'religion-technotheism', name: 'Technotheism', dogma: { 'progress_good': 0.95, 'nature_good': 0.5 }, memberIds: [] },
    { id: 'religion-gaianism', name: 'Gaianism', dogma: { 'progress_good': 0.1, 'nature_good': 0.95 }, memberIds: [] }
  ],
  government: INITIAL_GOVERNMENT,
  markets: [{ id: 'market-central', name: 'Central Market', listings: [] }],
  techTree: TECH_TREE,
  recipes: RECIPES,
  actions: [],
  transactions: [],
};
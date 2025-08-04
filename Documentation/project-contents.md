# Project Code Dump

This document contains a dump of all the files from the uploaded project.

---

## `metadata.json`

```json
{
  "name": "Ver. 20 RealitySim AI",
  "description": "An interactive web-based simulation environment where AI agents with unique beliefs and memories interact with a dynamic world. Control agents with natural language, run simulation steps, and visualize the emergent cognitive behavior of the system.",
  "requestFramePermissions": [],
  "prompt": ""
}
```

---

## `types.ts`

```typescript
import type { Language } from "./contexts/LanguageContext";

export interface Psyche {
    empathy: number; // 0-1
    vengefulness: number; // 0-1
    forgiveness: number; // 0-1
    searchForMeaning: number; // 0-1
    decisionPressure: number; // 0-1
    fearOfDeath: number; // 0-1
    boredom: number; // 0-1
    inspiration: number; // 0-1
    fanaticism: number; // 0-1
    spiritualNeed: number; // 0-1
    jealousy: number; // 0-1
}


export interface Beliefs {
  [key: string]: number;
}

export interface Emotions {
    [key: string]: number; 
}

export interface Personality {
    openness: number; // 0-1
    conscientiousness: number; // 0-1
    extraversion: number; // 0-1
    agreeableness: number; // 0-1
    neuroticism: number; // 0-1
}

export interface Skills {
    [key: string]: number; // e.g. { healing: 15, woodcutting: 22, rhetoric: 5 }
}

export type GoalType = 'becomeLeader' | 'buildLargeHouse' | 'masterSkill' | 'avengeRival' | 'achieveWealth' | 'mentorYoungAgent' | 'seekCounseling' | 'findMeaning' | 'forgiveRival' | 'expressGrief';
export interface Goal {
    type: GoalType;
    status: 'active' | 'completed' | 'failed';
    progress: number; // 0-100
    description: string;
    targetId?: string;
}

export interface Trauma {
    event: string;
    timestamp: number;
    intensity: number; // 0-1
}

export type RelationshipType = 'stranger' | 'acquaintance' | 'friend' | 'rival' | 'partner' | 'spouse' | 'ex-partner';

export interface Relationship {
    type: RelationshipType;
    score: number;
    disposition: Emotions;
}

export interface Resonance {
  [key:string]: number;
}

export interface LogEntry {
  key: string;
  params?: { [key: string]: any };
}

export interface SocialMemoryEntry {
  agentId: string;
  action: string;
  result: 'accepted' | 'rejected' | 'initiated' | 'reciprocated' | 'observed';
  emotionalImpact: number; // -1 to 1
  timestamp: number;
  info?: string;
}

// --- NEW & EXPANDED TYPES ---

export type ResourceType = 'food' | 'water' | 'wood' | 'medicine' | 'iron';
export type CraftedItemType = 'sword' | 'plow' | 'advanced_medicine' | 'iron_ingot';
export type ItemType = ResourceType | CraftedItemType;

export interface Inventory {
  [item: string]: number;
}

export interface Recipe {
    name: string;
    output: { item: CraftedItemType, quantity: number };
    ingredients: { [key in ItemType]?: number };
    requiredSkill?: { skill: keyof Skills, level: number };
    requiredTech?: string;
}

export interface TradeOffer {
    offerId: string;
    fromAgentId: string;
    item: ItemType;
    quantity: number;
    price: number; // price per unit
}

export interface Market {
    id: string;
    name: string;
    listings: TradeOffer[];
}

export interface Law {
    id: string;
    name: string;
    description: string;
    violatingAction: string; // The action name that this law prohibits
    punishment: {
        type: 'fine' | 'arrest';
        amount: number; // For fine: amount, for arrest: duration in steps
    };
}

export interface Government {
    type: 'monarchy' | 'democracy';
    leaderId: string | null;
    laws: Law[];
}

export interface Election {
    isActive: boolean;
    candidates: string[];
    votes: { [candidateId: string]: number };
    termEndDate: number;
}

export interface Technology {
    id: string;
    name: string;
    description: string;
    researchCost: number;
    unlocks: {
        actions?: string[];
        recipes?: string[];
    };
    requiredTech?: string[];
}

export interface LongTermMemory {
    content: string;
    embedding: number[];
    timestamp: number;
}

export interface JailJournalEntry {
  timestamp: number;
  entry: string;
}


export interface Agent {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  beliefNetwork: Beliefs;
  emotions: Emotions;
  resonance: Resonance;
  socialMemory: SocialMemoryEntry[];
  longTermMemory: LongTermMemory[];
  lastActions: Action[];
  adminAgent: boolean;
  health: number;
  isAlive: boolean;
  sickness?: string | null;
  conversationHistory: { speakerName: string; message: string; }[];
  age: number;
  genome: string[];
  relationships: { [agentId: string]: Relationship };
  cultureId: string | null;
  religionId: string | null;
  role: string | null;
  offspringCount: number;
  childrenIds?: string[];
  hunger: number;
  thirst: number;
  fatigue: number;
  inventory: Inventory;
  personality: Personality;
  goals: Goal[];
  stress: number;
  socialStatus: number;
  skills: Skills;
  trauma: Trauma[];
  psyche: Psyche;
  unconsciousState?: { [key: string]: number };
  // --- NEW ECONOMIC PROPERTIES ---
  currency: number;
  imprisonedUntil?: number;
  jailJournal?: JailJournalEntry[];
  // --- NEW LEARNING PROPERTIES ---
  qTable: { [stateAction: string]: number; };
  lastStressLevel?: number;
}

export interface Entity {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  isResource?: boolean;
  resourceType?: ResourceType;
  quantity?: number;
  ownerId?: string | null;
  // --- NEW PROPERTIES ---
  isMarketplace?: boolean;
  isJail?: boolean;
  inmates?: string[];
}

export interface EnvironmentState {
  [key: string]: any;
  width: number;
  height: number;
  time: number;
  // --- NEW POLITICAL PROPERTIES ---
  election: Election | null;
}

export interface Religion {
  id: string;
  name: string;
  dogma: Beliefs;
  memberIds: string[];
}

export interface Culture {
  id:string;
  name: string;
  sharedBeliefs: Beliefs;
  memberIds: string[];
  // --- NEW TECH/LEARNING PROPERTIES ---
  researchPoints: number;
  knownTechnologies: string[];
}

export interface Transaction {
    from: string; // agentId or special source like 'WORLD', 'NATURE'
    to: string; // agentId or special sink like 'MARKET'
    item: ItemType | 'currency';
    quantity: number;
    step: number;
}

export interface ActionContext {
    language: Language;
    marketPrices: { [item: string]: number };
    addListingToMarket: (marketId: string, offer: { fromAgentId: string, item: ItemType, quantity: number}) => void;
    executeTrade: (buyer: Agent, offer: TradeOffer) => void;
    castVote: (candidateId: string) => void;
    declareCandidacy: (agentId: string) => void;
    enactLaw: (law: Law) => void;
    addResearchPoints: (cultureId: string, points: number) => void;
    addSocialMemory: (agentId: string, memory: SocialMemoryEntry) => void;
    logTransaction: (transaction: Omit<Transaction, 'step'>) => void;
}

export interface ActionEffect {
    statChanges?: {
        health?: number;
        hunger?: number;
        thirst?: number;
        fatigue?: number;
        stress?: number;
        currency?: number;
    };
    costs?: { [item: string]: number };
    skillGain?: {
        skill: keyof Skills;
        amount: number;
    };
}

export interface Action {
  name: string;
  description: string;
  beliefKey?: string;
  isIllegal?: boolean; // Dynamically set by simulation based on laws
  onSuccess?: { belief: string; delta: number; };
  onFailure?: { belief: string; delta: number; };
  effects?: ActionEffect;
  execute?: (agent: Agent, allAgents: Map<string, Agent>, allEntities: Map<string, Entity>, worldState: WorldState, context: ActionContext) => Promise<ActionExecutionResult>;
}

export interface WorldState {
  environment: EnvironmentState;
  agents: Agent[];
  entities: Entity[];
  actions: Action[];
  cultures: Culture[];
  religions: Religion[];
  // --- NEW WORLD-LEVEL STATES ---
  government: Government;
  markets: Market[];
  techTree: Technology[];
  marketPrices?: { [item: string]: number };
  transactions?: Transaction[];
}


// Data returned from an action's execution
export interface ActionExecutionResult {
    log: LogEntry;
    status: 'success' | 'failure' | 'neutral';
    reward: number;
    sideEffects?: {
        createAgent?: Partial<Agent> & { description: string, parents: [Agent, Agent] };
        updateReligion?: { agentId: string, newReligionId: string | null };
        createEntity?: Partial<Entity> & { ownerId?: string };
        addTrauma?: { agentId: string, trauma: Trauma };
    }
}

export interface PsychoReport {
  Psychodynamik: string;
  Persönlichkeitsbild: string;
  Beziehungsdynamik: string;
  'Traumatische Spuren oder psychische Belastung': string;
  'Kulturelle & spirituelle Verarbeitung': string;
  'Projektionen oder Verschiebungen': string;
  'Therapeutische Empfehlung': string;
  unconscious_modifiers?: { [key: string]: number };
  suggested_goal?: Omit<Goal, 'status' | 'progress'>;
}

export type TimedLogEntry = LogEntry & { timestamp: number };
```

---

## `constants.ts`

```typescript
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
export const RESOURCE_TYPES = ['food', 'water', 'wood', 'medicine', 'iron'];
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
export const WORK_FOR_MONEY_AMOUNT = 10;
export const RESOURCE_PURCHASE_COST = 250;
export const WORK_FOR_OWNER_PAY_WORKER = 15;

// Random Data for Generation
export const RANDOM_FIRST_NAMES = ['Elara', 'Rhys', 'Silvana', 'Orion', 'Nadia', 'Marius', 'Lyra', 'Kai', 'Jasmine', 'Isaac', 'Helena', 'Gareth', 'Fiona', 'Elias', 'Dahlia', 'Caspian', 'Bram', 'Anya', 'Ralf', 'Garrus', 'Bob', 'Alice', 'Xavier', 'Willow', 'Vera', 'Ulysses', 'Thalia', 'Silas', 'Rhiannon', 'Quentin', 'Phoebe'];
export const RANDOM_LAST_NAMES = ['Meadowbrook', 'Stonehand', 'Riverwind', 'Blackwood', 'Ironhide', 'Swiftfoot', 'Sunstrider', 'Shadowend'];
export const RANDOM_DESCRIPTORS = ['A curious', 'A pragmatic', 'A cheerful', 'A cynical', 'An optimistic', 'A cautious', 'A brave', 'A timid'];
export const RANDOM_AGENT_ROLES = ['explorer', 'artisan', 'scholar', 'hermit', 'warrior', 'trader', 'healer'];
export const RANDOM_HOBBIES = ['who loves to talk about the weather', 'who complains about small things', 'who is optimistic about the future', 'who is wary of strangers', 'who secretly writes poetry', 'who collects rare stones'];
export const RANDOM_BELIEF_KEYS = ['progress_good', 'nature_good', 'wealth_is_power', 'community_first', 'tradition_important', 'knowledge_is_sacred'];


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
  actions: [],
  transactions: [],
};
```

---

## `components/BeliefsChart.tsx`

```typescript
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTranslations } from '../hooks/useTranslations';
import { TranslationKey } from '../translations';

interface BeliefsChartProps {
    data: { name: string; value: number }[];
    barColor?: string;
    keyPrefix?: string;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const displayValue = (typeof value === 'number' && !isNaN(value)) ? value.toFixed(2) : String(value);

        return (
            <div className="bg-slate-700/80 backdrop-blur-sm p-2 border border-slate-600 rounded-md text-sm">
                <p className="label text-slate-200">{`${label}`}</p>
                <p className="intro text-sky-400">{`Value: ${displayValue}`}</p>
            </div>
        );
    }
    return null;
};


export const BeliefsChart: React.FC<BeliefsChartProps> = ({ data, barColor = '#8884d8', keyPrefix }) => {
    const t = useTranslations();
    
    const translatedData = React.useMemo(() => {
        if (!keyPrefix) {
            return data;
        }
        return data.map(item => {
             const key = `${keyPrefix}${item.name}` as TranslationKey;
             const translatedName = t(key);
             return {
                ...item,
                name: translatedName === key ? item.name : translatedName,
            };
        });
    }, [data, keyPrefix, t]);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={translatedData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} domain={[0, 1]} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={120} tick={{ fill: '#cbd5e1' }} interval={0} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}/>
                <Bar dataKey="value" fill={barColor} barSize={15} />
            </BarChart>
        </ResponsiveContainer>
    );
};
```

---

## `components/ControlPanel.tsx`

```typescript

import React, { useState } from 'react';
import { Play, RotateCcw, FastForward, Globe, PlusSquare } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';

interface ControlPanelProps {
    onStep: () => void;
    onRunSteps: (steps: number) => void;
    onReset: () => void;
    onGenerateWorld: () => void;
    onGenerateContent: () => void;
    isGenerating: boolean;
    isProcessing: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onStep, onRunSteps, onReset, onGenerateWorld, onGenerateContent, isGenerating, isProcessing }) => {
    const [runSteps, setRunSteps] = useState(10);
    const t = useTranslations();
    const generatingText = t('log_generating');

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onGenerateWorld}
                disabled={isGenerating || isProcessing}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-wait"
            >
                <Globe className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? generatingText : t('controlPanel_generateWorld')}
            </button>
            <button
                onClick={onGenerateContent}
                disabled={isGenerating || isProcessing}
                className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 px-3 rounded-md transition-colors flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-wait"
            >
                <PlusSquare className="w-4 h-4" />
                {isGenerating ? generatingText : t('controlPanel_addWithAI')}
            </button>
            <button
                onClick={onStep}
                disabled={isGenerating || isProcessing}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                <Play className="w-4 h-4" />
                {t('controlPanel_step')}
            </button>
            <div className="flex items-center bg-slate-700 rounded-md">
                 <input 
                    type="number"
                    value={runSteps}
                    onChange={e => setRunSteps(parseInt(e.target.value, 10))}
                    disabled={isGenerating || isProcessing}
                    className="bg-transparent w-16 text-center focus:outline-none p-2 disabled:opacity-50"
                 />
                <button
                    onClick={() => onRunSteps(runSteps)}
                    disabled={isGenerating || isProcessing}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-r-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <FastForward className="w-4 h-4" />
                    {t('controlPanel_run')}
                </button>
            </div>
            <button
                onClick={onReset}
                disabled={isGenerating || isProcessing}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                 <RotateCcw className="w-4 h-4" />
                {t('controlPanel_reset')}
            </button>
        </div>
    );
};
```

---

## `components/LogPanel.tsx`

```typescript
import React from 'react';
import { BookText } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';
import type { TimedLogEntry } from '../types';
import { TranslationKey } from '../translations';

interface LogPanelProps {
  logs: TimedLogEntry[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const t = useTranslations();
  return (
    <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
        <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
            <BookText className="w-5 h-5 text-emerald-400"/>
            {t('logPanel_eventLog')}
        </h2>
        <div className="h-48 bg-slate-900/50 p-2 rounded-md overflow-y-auto flex flex-col-reverse">
            <ul className="text-xs text-slate-400 font-mono space-y-1">
                {logs.map((log, index) => {
                    const message = t(log.key as TranslationKey, log.params);
                    const time = new Date(log.timestamp).toLocaleTimeString();
                    return <li key={index}>{`[${time}] ${message}`}</li>;
                })}
            </ul>
        </div>
    </div>
  );
};

```

---

## `components/WorldGraph.tsx`

```typescript
import React from 'react';
import type { Agent, Entity, EnvironmentState, Culture } from '../types';
import { Share2, Home, User, Skull, Award, HeartPulse, FlaskConical, Apple, Droplet, Log, PlusSquare, Hammer, Users, Gavel } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';

interface WorldGraphProps {
    agents: Agent[];
    entities: Entity[];
    environment: EnvironmentState;
    cultures: Culture[];
}

const getEntityIcon = (entity: Entity) => {
    if (entity.isJail) {
        return Gavel;
    }
    if (entity.isMarketplace) {
        return Users;
    }
    if (entity.isResource) {
        switch (entity.resourceType) {
            case 'food': return Apple;
            case 'water': return Droplet;
            case 'wood': return Log;
            case 'medicine': return PlusSquare;
            case 'iron': return Hammer;
            default: return Home;
        }
    }
    switch (entity.name.toLowerCase()) {
        case 'haus':
        case 'house':
        case 'shelter':
            return Home;
        default:
            return Home;
    }
}

const getRoleIcon = (role: string | null) => {
    switch (role) {
        case 'Leader': return Award;
        case 'Healer': return HeartPulse;
        case 'Scientist': return FlaskConical;
        default: return null;
    }
}


const cultureColors: { [key: string]: string } = {
    'culture-utopian': '#38bdf8', // sky-400
    'culture-primitivist': '#34d399', // emerald-400
};

const WorldGraphComponent: React.FC<WorldGraphProps> = ({ agents, entities, environment, cultures }) => {
    const t = useTranslations();

    const { width, height } = environment;
    const svgDisplaySize = 500;
    const cellWidth = svgDisplaySize / width;
    const cellHeight = svgDisplaySize / height;

    // --- Dynamic ViewBox Calculation ---
    const allItems = [...agents, ...entities];
    let viewBoxStr = `0 0 ${svgDisplaySize} ${svgDisplaySize}`;

    if (allItems.length > 0) {
        let minX = width, minY = height, maxX = 0, maxY = 0;
        
        allItems.forEach(item => {
            minX = Math.min(minX, item.x);
            minY = Math.min(minY, item.y);
            maxX = Math.max(maxX, item.x);
            maxY = Math.max(maxY, item.y);
        });
        
        const padding = 4; // in grid cells
        
        let vbX = (minX - padding) * cellWidth;
        let vbY = (minY - padding) * cellHeight;
        let vbW = (maxX - minX + 1 + padding * 2) * cellWidth;
        let vbH = (maxY - minY + 1 + padding * 2) * cellHeight;
        
        // Maintain 1:1 aspect ratio by matching the larger dimension
        if (vbW > vbH) {
            vbY -= (vbW - vbH) / 2;
            vbH = vbW;
        } else {
            vbX -= (vbH - vbW) / 2;
            vbW = vbH;
        }

        // Prevent extreme zoom-in
        const minViewboxDim = 15 * Math.max(cellWidth, cellHeight);
        if (vbW < minViewboxDim) {
            const diff = minViewboxDim - vbW;
            vbX -= diff / 2;
            vbY -= diff / 2;
            vbW = minViewboxDim;
            vbH = minViewboxDim;
        }

        viewBoxStr = `${vbX} ${vbY} ${vbW} ${vbH}`;
    }
    // --- End Dynamic ViewBox Calculation ---

    const relationshipLines: { x1: number, y1: number, x2: number, y2: number, opacity: number, key: string, type: string }[] = [];
    const processedPairs = new Set<string>();

    agents.forEach(agentA => {
        if (!agentA.relationships || !agentA.isAlive) return;
        Object.keys(agentA.relationships).forEach(agentBId => {
            const pairKey = [agentA.id, agentBId].sort().join('-');
            if (processedPairs.has(pairKey)) return;

            const agentB = agents.find(a => a.id === agentBId);
            if (!agentB || !agentB.isAlive) return;
            
            const relationship = agentA.relationships[agentBId];
            if (relationship && relationship.score > 20) { 
                relationshipLines.push({
                    x1: agentA.x * cellWidth + cellWidth / 2,
                    y1: agentA.y * cellHeight + cellHeight / 2,
                    x2: agentB.x * cellWidth + cellWidth / 2,
                    y2: agentB.y * cellHeight + cellHeight / 2,
                    opacity: Math.max(0.1, (relationship.score) / 100),
                    key: pairKey,
                    type: relationship.type
                });
            }
            processedPairs.add(pairKey);
        });
    });

    return (
        <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-sky-400"/>
                    {t('worldGraph_title')}
                </h2>
                <div className="flex items-center gap-4 text-xs">
                    {(cultures || []).map(culture => (
                        <div key={culture.id} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cultureColors[culture.id] || '#94a3b8' }}></div>
                            <span>{culture.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-slate-900/50 rounded-md max-h-[70vh] overflow-auto">
                <svg width={svgDisplaySize} height={svgDisplaySize} viewBox={viewBoxStr}>
                    {/* Grid Lines for the entire canvas */}
                    {Array.from({ length: width + 1 }).map((_, i) => (
                        <line key={`v-${i}`} x1={i * cellWidth} y1="0" x2={i * cellWidth} y2={height * cellHeight} stroke="#334155" strokeWidth="0.5" />
                    ))}
                    {Array.from({ length: height + 1 }).map((_, i) => (
                        <line key={`h-${i}`} x1="0" y1={i * cellHeight} x2={width * cellWidth} y2={i * cellHeight} stroke="#334155" strokeWidth="0.5" />
                    ))}

                    {/* Relationship lines */}
                    {relationshipLines.map(line => {
                        let strokeColor = "rgba(107, 114, 128, 0.7)";
                        if (line.type === 'spouse') strokeColor = "rgba(236, 72, 153, 0.8)";
                        if (line.type === 'friend') strokeColor = "rgba(16, 185, 129, 0.7)";
                        if (line.type === 'rival') strokeColor = "rgba(239, 68, 68, 0.7)";
                        return <line key={line.key} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={strokeColor} strokeWidth="1" opacity={line.opacity}/>
                    })}


                    {/* Entities */}
                    {entities.map(entity => {
                        const Icon = getEntityIcon(entity);
                        const iconSize = Math.min(cellWidth, cellHeight) * 0.6;
                        const x = entity.x * cellWidth + (cellWidth - iconSize) / 2;
                        const y = entity.y * cellHeight + (cellHeight - iconSize) / 2;
                        const owner = entity.ownerId ? agents.find(a => a.id === entity.ownerId) : null;
                        const ownerName = owner ? owner.name : 'Unowned';
                        let color = 'text-emerald-400';
                        if (entity.isMarketplace) color = 'text-yellow-400';
                        if (entity.isJail) color = 'text-red-400';
                        const ownerCultureColor = owner && owner.cultureId ? cultureColors[owner.cultureId] : null;

                        return (
                            <g key={entity.id} transform={`translate(${entity.x * cellWidth}, ${entity.y * cellHeight})`}>
                               <title>{entity.name}{entity.isResource ? ` (${entity.quantity})` : ''} - Owner: ${ownerName}</title>
                               {ownerCultureColor && (
                                   <rect
                                        x={cellWidth * 0.1} y={cellHeight * 0.1}
                                        width={cellWidth * 0.8} height={cellHeight * 0.8}
                                        fill="none"
                                        stroke={ownerCultureColor}
                                        strokeWidth="1"
                                        rx="2"
                                        opacity="0.7"
                                   />
                               )}
                               <g transform={`translate(${(cellWidth - iconSize) / 2}, ${(cellHeight - iconSize) / 2})`}>
                                 <Icon width={iconSize} height={iconSize} className={color} />
                               </g>
                            </g>
                        )
                    })}
                    
                    {/* Agents */}
                    {agents.map(agent => {
                        const agentIconSize = Math.min(cellWidth, cellHeight) * 0.7;
                        const cx = agent.x * cellWidth + cellWidth / 2;
                        const cy = agent.y * cellHeight + cellHeight / 2;
                        const x = cx - agentIconSize / 2;
                        const y = cy - agentIconSize / 2;
                        const AgentIcon = agent.isAlive ? User : Skull;
                        const cultureColor = agent.cultureId ? cultureColors[agent.cultureId] : 'transparent';
                        const RoleIcon = agent.isAlive ? getRoleIcon(agent.role) : null;
                        const roleIconSize = agentIconSize * 0.5;

                        return (
                            <g key={agent.id} transform={`translate(${x}, ${y})`} opacity={agent.imprisonedUntil ? 0.5 : 1}>
                                <title>{agent.name} ({agent.health.toFixed(0)} HP, {agent.age.toFixed(1)} yrs)</title>
                                {agent.isAlive && agent.cultureId && (
                                     <circle cx={agentIconSize/2} cy={agentIconSize/2} r={agentIconSize/2 + 3} fill={cultureColor} opacity="0.3" />
                                )}
                                <AgentIcon width={agentIconSize} height={agentIconSize} className={agent.adminAgent ? 'text-red-400' : 'text-sky-400'} opacity={agent.isAlive ? 1 : 0.6} />
                                {RoleIcon && (
                                    <g transform={`translate(${agentIconSize - roleIconSize/2}, ${-roleIconSize/2})`}>
                                        <circle cx={roleIconSize/2} cy={roleIconSize/2} r={roleIconSize/2 + 1} fill="#1e293b" />
                                        <RoleIcon width={roleIconSize} height={roleIconSize} className="text-yellow-400" />
                                    </g>
                                )}
                                <text
                                    x={agentIconSize/2}
                                    y={agentIconSize + 5}
                                    fill={agent.isAlive ? "#cbd5e1" : "#64748b"}
                                    fontSize="8"
                                    textAnchor="middle"
                                >
                                    {agent.name.substring(0,3)}
                                </text>
                            </g>
                        );
                    })}

                </svg>
            </div>
        </div>
    );
};

export const WorldGraph = React.memo(WorldGraphComponent);
```

---

## `components/CreateObjectPanel.tsx`

```typescript

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

```

---

## `components/ExporterPanel.tsx`

```typescript
import React from 'react';
import { Download, Upload, History, BarChart2 } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';

interface ExporterPanelProps {
    onExport: (type: 'environment' | 'agents' | 'entities' | 'all') => void;
    onLoad: () => void;
    onExportConversations: () => void;
    onExportStatistics: () => void;
}

export const ExporterPanel: React.FC<ExporterPanelProps> = ({ onExport, onLoad, onExportConversations, onExportStatistics }) => {
    const t = useTranslations();
    return (
        <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400"/>
                {t('stateManagement_title')}
            </h2>
            <div className="space-y-2 text-sm">
                <button onClick={() => onExport('all')} className="w-full text-left bg-emerald-600 hover:bg-emerald-500 p-2 rounded-md transition-colors font-semibold flex items-center gap-2">
                    <Download className="w-4 h-4"/>
                    {t('stateManagement_save')}
                </button>
                 <button onClick={onLoad} className="w-full text-left bg-sky-600 hover:bg-sky-500 p-2 rounded-md transition-colors font-semibold flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {t('stateManagement_load')}
                </button>
                <button onClick={onExportConversations} className="w-full text-left bg-purple-600 hover:bg-purple-500 p-2 rounded-md transition-colors font-semibold flex items-center gap-2">
                    <History className="w-4 h-4" />
                    {t('export_conversations')}
                </button>
                <button onClick={onExportStatistics} className="w-full text-left bg-teal-600 hover:bg-teal-500 p-2 rounded-md transition-colors font-semibold flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" />
                    {t('export_statistics')}
                </button>
                <details className="pt-2">
                    <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-200 transition-colors">{t('stateManagement_advanced')}</summary>
                    <div className="space-y-2 text-sm mt-2">
                         <button onClick={() => onExport('environment')} className="w-full text-left bg-slate-700 hover:bg-slate-600/80 p-2 rounded-md transition-colors">{t('export_env')}</button>
                         <button onClick={() => onExport('agents')} className="w-full text-left bg-slate-700 hover:bg-slate-600/80 p-2 rounded-md transition-colors">{t('export_agents')}</button>
                         <button onClick={() => onExport('entities')} className="w-full text-left bg-slate-700 hover:bg-slate-600/80 p-2 rounded-md transition-colors">{t('export_entities')}</button>
                    </div>
                </details>
            </div>
        </div>
    );
};

```

---

## `components/AdminPanel.tsx`

```typescript


import React, { useState, useEffect } from 'react';
import type { Action, EnvironmentState, Agent, Law, Culture, Technology } from '../types';
import { Shield, Settings, Zap, Trash2, PlusCircle, Users, MapPin, Gavel, Vote, BookOpenCheck, CircleDollarSign, HeartPulse } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';

interface AdminPanelProps {
    environment: EnvironmentState;
    actions: Action[];
    agents: Agent[];
    government: any; // Simplified for prop drilling
    cultures: Culture[];
    techTree: Technology[];
    onUpdateEnvironment: (newEnvironment: EnvironmentState) => void;
    onCreateAction: (data: { name: string; description: string; beliefKey?: string }) => void;
    onDeleteAction: (name: string) => void;
    onSetAgentHealth: (agentId: string, health: number) => void;
    onSetAgentCurrency: (agentId: string, currency: number) => void;
    onInflictSickness: (agentId: string, sickness: string | null) => void;
    onResurrectAgent: (agentId: string) => void;
    onSetAgentPosition: (agentId: string, x: number, y: number) => void;
    onImprisonAgent: (agentId: string, duration: number) => void;
    // New admin actions
    onEnactLaw: (law: Law) => void;
    onRepealLaw: (lawId: string) => void;
    onStartElection: () => void;
    onSetLeader: (agentId: string) => void;
    onUnlockTech: (cultureId: string, techId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const { 
        environment, actions, agents, government, cultures, techTree,
        onUpdateEnvironment, onCreateAction, onDeleteAction, onSetAgentHealth, onSetAgentCurrency,
        onInflictSickness, onResurrectAgent, onSetAgentPosition, onImprisonAgent,
        onEnactLaw, onRepealLaw, onStartElection, onSetLeader, onUnlockTech
    } = props;

    const t = useTranslations();
    const [envState, setEnvState] = useState(environment);
    const [agentHealthInputs, setAgentHealthInputs] = useState<{ [key: string]: string }>({});
    const [agentCurrencyInputs, setAgentCurrencyInputs] = useState<{ [key: string]: string }>({});
    const [agentSicknessInputs, setAgentSicknessInputs] = useState<{ [key: string]: string }>({});
    const [agentPositionInputs, setAgentPositionInputs] = useState<{ [key: string]: { x: string, y: string } }>({});
    const [agentImprisonInputs, setAgentImprisonInputs] = useState<{ [key: string]: string }>({});
    const [selectedLeaderId, setSelectedLeaderId] = useState('');
    
    useEffect(() => {
        setEnvState(environment);
        const initialHealths: { [key: string]: string } = {};
        const initialSicknesses: { [key: string]: string } = {};
        const initialPositions: { [key: string]: { x: string, y: string } } = {};
        const initialCurrencies: { [key: string]: string } = {};
        const initialImprison: { [key: string]: string } = {};
        agents.forEach(agent => {
            initialHealths[agent.id] = String(agent.health);
            initialSicknesses[agent.id] = agent.sickness || '';
            initialPositions[agent.id] = { x: String(agent.x), y: String(agent.y) };
            initialCurrencies[agent.id] = String(agent.currency);
            initialImprison[agent.id] = '20';
        });
        setAgentHealthInputs(initialHealths);
        setAgentSicknessInputs(initialSicknesses);
        setAgentPositionInputs(initialPositions);
        setAgentCurrencyInputs(initialCurrencies);
        setAgentImprisonInputs(initialImprison);
        setSelectedLeaderId(government.leaderId || '');
    }, [environment, agents, government]);

    const handleHealthInputChange = (agentId: string, value: string) => setAgentHealthInputs(p => ({ ...p, [agentId]: value }));
    const handleSicknessInputChange = (agentId: string, value: string) => setAgentSicknessInputs(p => ({ ...p, [agentId]: value }));
    const handleCurrencyInputChange = (agentId: string, value: string) => setAgentCurrencyInputs(p => ({ ...p, [agentId]: value }));
    const handlePositionInputChange = (agentId: string, axis: 'x' | 'y', value: string) => setAgentPositionInputs(p => ({ ...p, [agentId]: { ...p[agentId], [axis]: value } }));
    const handleImprisonInputChange = (agentId: string, value: string) => setAgentImprisonInputs(p => ({ ...p, [agentId]: value }));

    const handleSetHealth = (agentId: string) => onSetAgentHealth(agentId, parseInt(agentHealthInputs[agentId], 10));
    const handleSetSickness = (agentId: string) => onInflictSickness(agentId, agentSicknessInputs[agentId].trim() || null);
    const handleSetCurrency = (agentId: string) => onSetAgentCurrency(agentId, parseInt(agentCurrencyInputs[agentId], 10));
    const handleSetPosition = (agentId: string) => onSetAgentPosition(agentId, parseInt(agentPositionInputs[agentId].x, 10), parseInt(agentPositionInputs[agentId].y, 10));
    const handleImprison = (agentId: string) => onImprisonAgent(agentId, parseInt(agentImprisonInputs[agentId], 10));


    const [newLawName, setNewLawName] = useState('');
    const [newLawAction, setNewLawAction] = useState('');
    const [newLawFine, setNewLawFine] = useState('25');
    const handleAddLaw = () => {
        if(!newLawName || !newLawAction) return;
        const newLaw: Law = {
            id: `law-${Date.now()}`,
            name: newLawName,
            description: `It is illegal to ${newLawAction}`,
            violatingAction: newLawAction,
            punishment: { type: 'fine', amount: parseInt(newLawFine, 10) }
        };
        onEnactLaw(newLaw);
        setNewLawName('');
        setNewLawAction('');
    };

    return (
        <div className="bg-slate-850 p-4 rounded-lg border border-red-500/30 space-y-6 max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-red-300 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5"/>
                {t('admin_title')}
            </h2>

            {/* Political Management */}
            <div className="space-y-3">
                <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2"><Gavel className="w-5 h-5 text-emerald-400"/>{t('admin_politicalManagement')}</h3>
                <div className="text-sm space-y-2 bg-slate-900/50 p-3 rounded-lg">
                    <p>{t('admin_currentLeader')}: <span className="font-bold">{agents.find(a=>a.id === government.leaderId)?.name || 'None'}</span></p>
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedLeaderId}
                            onChange={e => setSelectedLeaderId(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs"
                        >
                            <option value="">{t('admin_selectAgent')}</option>
                            {agents.filter(a => !a.adminAgent).map(agent => (
                                <option key={agent.id} value={agent.id}>{agent.name}</option>
                            ))}
                        </select>
                        <button onClick={() => onSetLeader(selectedLeaderId)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md whitespace-nowrap">{t('admin_setLeader')}</button>
                    </div>
                    <button onClick={onStartElection} className="w-full text-xs py-1 mt-2 bg-sky-600 hover:bg-sky-500 rounded flex items-center justify-center gap-2"><Vote className="w-4 h-4" />{t('admin_startElection')}</button>
                    <div>
                        <h4 className="text-xs font-bold my-2">{t('admin_laws')}</h4>
                        {government.laws.map((law: Law) => <div key={law.id} className="flex justify-between items-center text-xs p-1"><span>{law.name}</span><button onClick={()=> onRepealLaw(law.id)}><Trash2 className="w-3 h-3 text-slate-500 hover:text-red-400"/></button></div>)}
                    </div>
                    <div className="pt-2 border-t border-slate-700 space-y-1">
                         <input type="text" value={newLawName} onChange={e => setNewLawName(e.target.value)} placeholder={t('admin_lawName')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                         <input type="text" value={newLawAction} onChange={e => setNewLawAction(e.target.value)} placeholder={t('admin_violatingAction')} className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                         <button onClick={handleAddLaw} className="w-full text-xs py-1 bg-emerald-600 hover:bg-emerald-500 rounded">{t('admin_addLaw')}</button>
                    </div>
                </div>
            </div>

            {/* Tech Management */}
            <div className="space-y-3">
                 <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2"><BookOpenCheck className="w-5 h-5 text-emerald-400"/>{t('admin_techManagement')}</h3>
                 {cultures.map(culture => (
                     <div key={culture.id} className="text-sm space-y-2 bg-slate-900/50 p-3 rounded-lg">
                         <h4 className="font-bold">{culture.name}</h4>
                         <p className="text-xs text-slate-400">{t('admin_researchPoints')}: {culture.researchPoints.toFixed(0)}</p>
                         <div>
                            <h5 className="text-xs font-semibold my-1">{t('agentCard_tech')}</h5>
                             {techTree.map(tech => {
                                 const isKnown = culture.knownTechnologies.includes(tech.id);
                                 return (
                                     <div key={tech.id} className="flex justify-between items-center text-xs p-1">
                                         <span className={isKnown ? 'text-green-400' : 'text-slate-400'}>{t(`tech_${tech.id}` as any) || tech.name}</span>
                                         {!isKnown && (
                                             <button onClick={() => onUnlockTech(culture.id, tech.id)} className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-0.5 px-2 rounded-md">{t('admin_unlock')}</button>
                                         )}
                                     </div>
                                 )
                             })}
                         </div>
                     </div>
                 ))}
            </div>

            {/* Agent Management */}
            <div className="space-y-3">
                <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2"><Users className="w-5 h-5 text-emerald-400"/>{t('admin_agentManagement')}</h3>
                <div className="space-y-4 text-sm">
                    {agents.filter(a => !a.adminAgent).map(agent => (
                        <div key={agent.id} className="bg-slate-900/50 p-3 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                                <span className={`font-bold ${agent.isAlive ? 'text-slate-200' : 'text-slate-500'}`}>{agent.name}</span>
                                {!agent.isAlive && (
                                    <button onClick={() => onResurrectAgent(agent.id)} className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-1 px-3 rounded-md transition-colors">{t('admin_resurrect')}</button>
                                )}
                            </div>
                            {agent.isAlive && ( <>
                                <div className="flex items-center gap-2">
                                    <label className="text-slate-400 w-20 flex items-center gap-1"><CircleDollarSign className="w-3 h-3"/> {t('agentCard_currency')}:</label>
                                    <input type="number" value={agentCurrencyInputs[agent.id] || ''} onChange={e => handleCurrencyInputChange(agent.id, e.target.value)} className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    <button onClick={() => handleSetCurrency(agent.id)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md">{t('admin_set')}</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-slate-400 w-20 flex items-center gap-1"><HeartPulse className="w-3 h-3" /> {t('agentCard_health')}:</label>
                                    <input type="number" value={agentHealthInputs[agent.id] || ''} onChange={e => handleHealthInputChange(agent.id, e.target.value)} className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    <button onClick={() => handleSetHealth(agent.id)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md">{t('admin_set')}</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-slate-400 w-20">{t('agentCard_sickness')}:</label>
                                    <input type="text" placeholder={t('admin_sicknessPlaceholder')} value={agentSicknessInputs[agent.id] || ''} onChange={e => handleSicknessInputChange(agent.id, e.target.value)} className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    <button onClick={() => handleSetSickness(agent.id)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md">{t('admin_set')}</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-slate-400 w-20 flex items-center gap-1"><MapPin className="w-3 h-3"/> Pos:</label>
                                    <input type="number" value={agentPositionInputs[agent.id]?.x || ''} onChange={e => handlePositionInputChange(agent.id, 'x', e.target.value)} className="w-1/2 bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    <input type="number" value={agentPositionInputs[agent.id]?.y || ''} onChange={e => handlePositionInputChange(agent.id, 'y', e.target.value)} className="w-1/2 bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    <button onClick={() => handleSetPosition(agent.id)} className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold py-1 px-3 rounded-md">{t('admin_set')}</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-slate-400 w-20">{t('admin_imprisonDuration')}:</label>
                                    <input type="number" value={agentImprisonInputs[agent.id] || ''} onChange={e => handleImprisonInputChange(agent.id, e.target.value)} className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs" />
                                    <button onClick={() => handleImprison(agent.id)} className="bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold py-1 px-3 rounded-md">{t('admin_imprison')}</button>
                                </div>
                            </>)}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* World Rule Editor */}
            <div className="space-y-3">
                <h3 className="text-md font-semibold text-slate-100 mb-2 flex items-center gap-2"><Settings className="w-5 h-5 text-emerald-400"/>{t('admin_ruleEditor')}</h3>
                <div className="text-sm space-y-2 bg-slate-900/50 p-3 rounded-lg">
                    <p className="text-xs text-slate-400">Environment override, action editor, etc. would go here.</p>
                    {/* Placeholder for future functionality */}
                </div>
            </div>
        </div>
    );
};

```

---

## `contexts/LanguageContext.tsx`

```typescript

import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Language = 'en' | 'de';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('de');

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

```

---

## `hooks/useTranslations.ts`

```typescript


import { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations, TranslationKey } from '../translations';

export const useTranslations = () => {
    const { language } = useLanguage();
    
    const t = useCallback((key: TranslationKey, params: { [key: string]: string | number | undefined } = {}) => {
        let str: string = (translations[language] as any)[key] || (translations.en as any)[key] || key;
        for (const p in params) {
            const value = params[p];
            if (value !== undefined) {
                 str = str.replace(`{${p}}`, String(value));
            }
        }
        return str;
    }, [language]);
    
    return t;
};
```

---

## `components/LanguageSwitcher.tsx`

```typescript

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'de' ? 'en' : 'de');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-3 rounded-md transition-colors text-sm uppercase"
            aria-label={`Switch language to ${language === 'de' ? 'English' : 'Deutsch'}`}
        >
            {language}
        </button>
    );
};

```

---

## `components/ProcessingIndicator.tsx`

```typescript

import React from 'react';
import { BrainCircuit } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';

interface ProcessingIndicatorProps {
    isOpen: boolean;
}

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ isOpen }) => {
    const t = useTranslations();

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center" role="status" aria-live="polite">
            <BrainCircuit className="w-20 h-20 text-sky-400 animate-pulse" />
            <p className="text-xl font-bold text-slate-200 mt-4 tracking-wider animate-pulse">
                {t('processingSteps')}
            </p>
        </div>
    );
};

```

---

## `contexts/SettingsContext.tsx`

```typescript
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

const SETTINGS_KEY = 'realitysim_settings';

export interface Settings {
    provider: 'lm_studio' | 'gemini';
    lmStudioUrl: string;
    lmStudioModel: string;
    lmStudioEmbeddingModel: string;
    geminiModel: string;
}

interface SettingsContextType {
    settings: Settings;
    setSettings: (settings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettingsState] = useState<Settings>({
        provider: 'lm_studio',
        lmStudioUrl: '',
        lmStudioModel: '',
        lmStudioEmbeddingModel: '',
        geminiModel: 'gemini-2.5-flash',
    });

    useEffect(() => {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
            try {
                const parsed = JSON.parse(storedSettings);
                // Merge with defaults to ensure new fields are present
                setSettingsState(currentSettings => ({...currentSettings, ...parsed}));
            } catch (e) {
                console.error("Failed to parse settings from localStorage", e);
            }
        }
    }, []);

    const setSettings = (newSettings: Settings) => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
        setSettingsState(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

```

---

## `services/simulationUtils.ts`

```typescript
import type { Agent, Entity, EnvironmentState } from '../types';

export function findNearestEntity(agent: Agent, entities: Map<string, Entity>, filter: (e: Entity) => boolean): Entity | null {
    let nearest: Entity | null = null;
    let minDistance = Infinity;

    for (const entity of entities.values()) {
        if (filter(entity)) {
            const distance = Math.sqrt(Math.pow(agent.x - entity.x, 2) + Math.pow(agent.y - entity.y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                nearest = entity;
            }
        }
    }
    return nearest;
}

export function findNearestAgent(agent: Agent, agents: Map<string, Agent>, filter: (a: Agent) => boolean): Agent | null {
    let nearest: Agent | null = null;
    let minDistance = Infinity;

    for (const otherAgent of agents.values()) {
        if (agent.id !== otherAgent.id && filter(otherAgent)) {
            const distance = Math.sqrt(Math.pow(agent.x - otherAgent.x, 2) + Math.pow(agent.y - otherAgent.y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                nearest = otherAgent;
            }
        }
    }
    return nearest;
}

export function moveTowards(agent: Agent, target: { x: number, y: number }, environment: EnvironmentState) {
    const dx = target.x - agent.x;
    const dy = target.y - agent.y;
    const speed = agent.genome.includes("G-AGILE") ? 2 : 1;

    let moveX = 0;
    let moveY = 0;

    if (Math.abs(dx) > Math.abs(dy)) {
        moveX = Math.sign(dx) * speed;
    } else {
        moveY = Math.sign(dy) * speed;
    }

    agent.x += moveX;
    agent.y += moveY;

    agent.x = Math.max(0, Math.min(environment.width - 1, agent.x));
    agent.y = Math.max(0, Math.min(environment.height - 1, agent.y));
}

export function wander(agent: Agent, environment: EnvironmentState) {
    const direction = Math.floor(Math.random() * 4);
    switch (direction) {
        case 0: agent.y = Math.max(0, agent.y - 1); break; // North
        case 1: agent.y = Math.min(environment.height - 1, agent.y + 1); break; // South
        case 2: agent.x = Math.min(environment.width - 1, agent.x + 1); break; // East
        case 3: agent.x = Math.max(0, agent.x - 1); break; // West
    }
    return { log: { key: 'log_action_wander_thoughtfully', params: { agentName: agent.name } } };
}

```

---

## `services/memoryService.ts`

```typescript
import type { LongTermMemory } from '../types';
import { MAX_LONG_TERM_MEMORIES } from '../constants';

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) {
        return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}


export class VectorDB {
    private memories: LongTermMemory[] = [];

    public addMemory(content: string, timestamp: number, embedding: number[]): void {
        this.memories.push({ content, timestamp, embedding });

        // Enforce memory limit
        if (this.memories.length > MAX_LONG_TERM_MEMORIES) {
            this.memories.shift(); // Remove the oldest memory
        }
    }

    public search(queryVector: number[], topK: number): LongTermMemory[] {
        if (this.memories.length === 0) {
            return [];
        }

        const scoredMemories = this.memories.map(memory => ({
            ...memory,
            similarity: cosineSimilarity(queryVector, memory.embedding),
        }));

        scoredMemories.sort((a, b) => b.similarity - a.similarity);

        return scoredMemories.slice(0, topK);
    }
    
    public loadMemories(memories: LongTermMemory[]) {
        this.memories = memories;
    }
}

```

---

## `package.json`

```json
{
  "name": "ver.-20-realitysim-ai",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "@google/genai": "^1.11.0",
    "recharts": "^3.1.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}

```

---

## `index.html`

```html

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RealitySim AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              slate: {
                850: '#172033'
              }
            }
          }
        }
      }
    </script>
  <script type="importmap">
{
  "imports": {
    "react/": "https://esm.sh/react@^19.1.1/",
    "react": "https://esm.sh/react@^19.1.1",
    "react-dom/": "https://esm.sh/react-dom@^19.1.1/",
    "@google/genai": "https://esm.sh/@google/genai@^1.11.0",
    "recharts": "https://esm.sh/recharts@^3.1.0"
  }
}
</script>
<link rel="stylesheet" href="/index.css">
</head>
  <body class="bg-slate-900 text-slate-200">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>

```

---

## `index.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { SettingsProvider } from './contexts/SettingsContext';


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </LanguageProvider>
  </React.StrictMode>
);
```

---

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

---

## `vite.config.ts`

```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

```

---

## `.env.local`

```
[BINARY_FILE:.env.local]
```

---

## `.gitignore`

```
[BINARY_FILE:.gitignore]
```

---

## `README.md`

```markdown
# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

```

---

## `components/AgentCard.tsx`

```typescript
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
```

---

## `components/IconComponents.tsx`

```typescript
import React from 'react';

export const BrainCircuit: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 5a3 3 0 1 0-5.993 1.004M12 5a3 3 0 1 1 5.993 1.004M12 5V3M7 9a3 3 0 0 0-3 3M7 9h5M7 9V7.004M17.994 13.003A3.001 3.001 0 1 0 12 15m5.994-1.997V12m-5.993 1.004A3 3 0 1 0 7 15m5-2.003V12M12 17v2M12 21a3 3 0 1 1 0-6M4.007 12.004A3 3 0 1 0 7 9M12 21a3 3 0 1 0 0-6m0 6V9"/><circle cx="12" cy="12" r="1"/>
  </svg>
);

export const Cpu: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

export const Zap: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

export const Microscope: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14.32A7 7 0 1 0 9 22Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/><path d="m14 14-4 4"/>
  </svg>
);

export const Boxes: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.75l7 4a2 2 0 0 0 2.06 0l7-4a2 2 0 0 0 .97-1.75v-3.24a2 2 0 0 0-.97-1.75l-7-4a2 2 0 0 0-2.06 0l-7 4Z"/><path d="M12 17.63v-5.26"/><path d="m7.69 13.9-4.32-2.47"/>
    <path d="m16.31 13.9 4.32-2.47"/><path d="M2.97 8.18A2 2 0 0 0 2 9.9v3.24a2 2 0 0 0 .97 1.75l7 4a2 2 0 0 0 2.06 0l7-4a2 2 0 0 0 .97-1.75V9.9a2 2 0 0 0-.97-1.75l-7-4a2 2 0 0 0-2.06 0l-7 4Z"/><path d="M12 13.13V7.87"/>
    <path d="m7.69 9.4-4.32-2.47"/><path d="m16.31 9.4 4.32-2.47"/>
  </svg>
);

export const Code: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
);

export const Play: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
);

export const RotateCcw: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 2v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/>
    </svg>
);

export const FastForward: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/>
    </svg>
);

export const MessageSquare: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export const Sparkles: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m12 3-1.9 4.8-4.8 1.9 4.8 1.9L12 21l1.9-4.8 4.8-1.9-4.8-1.9L12 3z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

export const Send: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
);

export const Share2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
);

export const BookText: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h6"/><path d="M8 11h8"/>
    </svg>
);

export const PlusCircle: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
);

export const Trash2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

export const Download: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

export const Upload: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

export const Shield: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

export const Settings: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.01l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.01l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2-0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

export const X: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

export const Globe: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

export const Users: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/>
  </svg>
);

export const PlusSquare: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

export const Apple: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/>
    </svg>
);

export const Droplet: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4.5-6.5c-1 2.5-2.5 4.9-4.5 6.5C3 11.1 2 13 2 15a7 7 0 0 0 7 7z"/>
    </svg>
);

export const Log: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22a8 8 0 0 0 8-8V8a8 8 0 0 0-8-8h-4a8 8 0 0 0-8 8v8a8 8 0 0 0 8 8Z"/><path d="M9 4h6"/><path d="M9 20h6"/>
    </svg>
);

export const Hammer: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7 1.09-1.09a2.12 2.12 0 0 0-3-3l-1.09 1.09"/><path d="m14 13 4 4"/><path d="m5 6 3 3"/>
    </svg>
);

export const Home: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
);

export const Vote: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22V6H4v16Z"/><path d="m16 4-4 4-4-4"/><path d="M20 6H12"/>
    </svg>
);

export const PanelLeft: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
);
export const PanelRight: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="15" y1="3" x2="15" y2="21"/>
    </svg>
);

export const Map: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
);

export const CircleDollarSign: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>
    </svg>
);

export const Briefcase: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
);

export const HeartPulse: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.7-1.5L13.5 14l.7-1.5H20.8"/>
    </svg>
);

export const Skull: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/>
    </svg>
);

export const MapPin: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
);

export const Dna: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M15.5 4.5a5 5 0 0 1 0 7"/><path d="M8.5 4.5a5 5 0 0 0 0 7"/><path d="M15.5 12.5a5 5 0 0 1 0 7"/><path d="M8.5 12.5a5 5 0 0 0 0 7"/><path d="M12 4.5v15"/><path d="M4.5 8h15"/><path d="M4.5 16h15"/>
    </svg>
);

export const User: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);

export const Heart: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
);

export const Award: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88"/>
    </svg>
);

export const Church: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14 22v-4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4"/><path d="M18 22V8.5L12 3l-6 5.5V22"/><path d="M12 13h.01"/><path d="M12 7h.01"/>
    </svg>
);

export const PersonStanding: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>
    </svg>
);

export const Baby: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 12.5c0 .5.5 1 1 1h4c.5 0 1-.5 1-1v-1c0-.5-.5-1-1-1h-2a1 1 0 0 1-1-1V8a1 1 0 0 0-1-1H9.5a1.5 1.5 0 0 0 0 3z"/><path d="M16 20.5c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5-1.5.7-1.5 1.5.7 1.5 1.5 1.5z"/><path d="M8 20.5c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5-1.5.7-1.5 1.5.7 1.5 1.5 1.5z"/><path d="M12 4c-2.5 0-4.5 2-4.5 4.5S9.5 13 12 13s4.5-2 4.5-4.5S14.5 4 12 4z"/>
    </svg>
);

export const CookingPot: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 12h20"/><path d="M2 6h20"/><path d="M12 2v20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/>
    </svg>
);

export const GlassWater: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M15.2 22H8.8a2 2 0 0 1-2-1.79L5 3h14l-1.81 17.21A2 2 0 0 1 15.2 22Z"/><path d="M6 12h12"/>
    </svg>
);

export const Bed: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 4v16h20V4"/><path d="M2 10h20"/><path d="M6 8v-2"/>
    </svg>
);

export const BookOpenCheck: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M8 3H2v15h7c1.7 0 3 1.3 3 3V7c0-2.2-1.8-4-4-4Z" /><path d="m16 12 2 2 4-4" /><path d="M16 3h6v15h-7c-1.7 0-3 1.3-3 3V7c0-2.2 1.8-4 4-4Z" />
    </svg>
);

export const Gavel: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m14 13-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10"/><path d="m15.5 5 3 3"/><path d="M2 22l3-3"/><path d="M12 8l4 4"/><path d="M22 2l-3 3"/>
    </svg>
);

export const ClipboardList: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>
    </svg>
);

export const TrendingUp: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
);

export const ShieldAlert: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/>
    </svg>
);

export const Smile: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
);

export const Activity: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
);

export const FlaskConical: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m10 20.7 5-5-5-5-5 5a5 5 0 0 0 5 5z"/><path d="m10 20.7 5-5a5 5 0 0 0-5-5"/><path d="M10 4.3V2"/><path d="M8.5 2h7"/><path d="M14 10.7V8"/>
    </svg>
);

export const BarChart2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
);

export const History: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
    </svg>
);

export const Notebook: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4 22h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4"/>
        <path d="M18 22V4"/>
        <path d="M10 6h4"/>
        <path d="M10 12h4"/>
        <path d="M10 18h4"/>
    </svg>
);
```

---

## `components/AnalyticsDashboard.tsx`

```typescript

import React, { useState, useMemo } from 'react';
import type { WorldState, Agent, Transaction, Culture } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { BarChart2, X, Users, CircleDollarSign, Map as MapIcon, BookOpenCheck } from './IconComponents';

type Tab = 'social' | 'economic' | 'cultural' | 'tech';

const cultureColors: { [key: string]: string } = {
    'culture-utopian': 'rgba(56, 189, 248, 0.5)', // sky-400
    'culture-primitivist': 'rgba(52, 211, 153, 0.5)', // emerald-400
    'default': 'rgba(148, 163, 184, 0.5)', // slate-400
};

// --- Social Network Graph ---
const SocialNetworkGraph: React.FC<{ agents: Agent[], cultures: Culture[] }> = ({ agents, cultures }) => {
    const t = useTranslations();
    const liveAgents = agents.filter(a => a.isAlive);

    const agentGroups = useMemo(() => {
        const groups: { [key: string]: Agent[] } = {};
        liveAgents.forEach(agent => {
            const cultureId = agent.cultureId || 'unaffiliated';
            if (!groups[cultureId]) {
                groups[cultureId] = [];
            }
            groups[cultureId].push(agent);
        });
        return groups;
    }, [liveAgents]);

    const layout = useMemo(() => {
        const agentPositions = new Map<string, { x: number, y: number, name: string }>();
        const groupLayouts: { id: string, name: string, x: number, y: number }[] = [];
        const svgSize = 500;
        const mainRadius = 180;
        const mainCenterX = svgSize / 2;
        const mainCenterY = svgSize / 2;

        const groupIds = Object.keys(agentGroups);
        const numGroups = groupIds.length;

        groupIds.forEach((groupId, i) => {
            const groupAgents = agentGroups[groupId];
            const numAgentsInGroup = groupAgents.length;
            const groupAngle = (i / numGroups) * 2 * Math.PI;
            
            const groupCenterX = mainCenterX + (numGroups > 1 ? mainRadius * Math.cos(groupAngle) : 0);
            const groupCenterY = mainCenterY + (numGroups > 1 ? mainRadius * Math.sin(groupAngle) : 0);
            
            const culture = cultures.find(c => c.id === groupId);
            groupLayouts.push({ id: groupId, name: culture?.name || 'Unaffiliated', x: groupCenterX, y: groupCenterY });

            const clusterRadius = 30 + numAgentsInGroup * 4.5;

            groupAgents.forEach((agent, j) => {
                const agentAngle = (j / numAgentsInGroup) * 2 * Math.PI;
                agentPositions.set(agent.id, {
                    x: groupCenterX + clusterRadius * Math.cos(agentAngle),
                    y: groupCenterY + clusterRadius * Math.sin(agentAngle),
                    name: agent.name
                });
            });
        });
        return { agentPositions, groupLayouts };
    }, [agentGroups, cultures]);

    const relationshipLines = useMemo(() => {
        const lines: { x1: number, y1: number, x2: number, y2: number, opacity: number, key: string, color: string }[] = [];
        const processedPairs = new Set<string>();

        liveAgents.forEach(agentA => {
            if (!agentA.relationships) return;
            Object.entries(agentA.relationships).forEach(([agentBId, relationship]) => {
                const pairKey = [agentA.id, agentBId].sort().join('-');
                if (processedPairs.has(pairKey)) return;

                const posA = layout.agentPositions.get(agentA.id);
                const posB = layout.agentPositions.get(agentBId);

                if (posA && posB && relationship && relationship.score > 25) {
                    let color = "rgba(107, 114, 128, 0.7)";
                    if (relationship.type === 'spouse' || relationship.type === 'partner') color = "rgba(236, 72, 153, 0.8)";
                    else if (relationship.type === 'friend') color = "rgba(16, 185, 129, 0.7)";
                    else if (relationship.type === 'rival') color = "rgba(239, 68, 68, 0.7)";

                    lines.push({
                        x1: posA.x, y1: posA.y, x2: posB.x, y2: posB.y,
                        opacity: Math.max(0.2, relationship.score / 100),
                        key: pairKey, color
                    });
                }
                processedPairs.add(pairKey);
            });
        });
        return lines;
    }, [liveAgents, layout.agentPositions]);

    if (liveAgents.length === 0) {
        return <p className="text-slate-400 text-center p-8">{t('analytics_social_no_relations')}</p>;
    }

    const renderNodes = () => (
        <>
            {layout.groupLayouts.map(group => (
                <g key={group.id}>
                    <text x={group.x} y={group.y} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="bold">{group.name}</text>
                </g>
            ))}
            {Array.from(layout.agentPositions.entries()).map(([id, pos]) => (
                <g key={id}>
                     <title>{pos.name}</title>
                     <circle cx={pos.x} cy={pos.y} r="6" fill="#1e293b" stroke="#60a5fa" strokeWidth="1.5" />
                     <text x={pos.x} y={pos.y + 15} textAnchor="middle" fill="#cbd5e1" fontSize="9">{pos.name}</text>
                </g>
            ))}
        </>
    );
    
    if (relationshipLines.length === 0) {
        return (
            <div className="relative w-full h-full">
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 text-center p-8 bg-slate-850/50 rounded-lg z-10">{t('analytics_social_no_relations')}</p>
                 <svg viewBox="0 0 500 500" className="w-full h-full">
                    {renderNodes()}
                </svg>
            </div>
        );
    }

    return (
        <svg viewBox="0 0 500 500" className="w-full h-full">
            {layout.groupLayouts.map(group => (
                <g key={group.id}>
                    <text x={group.x} y={group.y} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="bold">{group.name}</text>
                </g>
            ))}
            {relationshipLines.map(line => (
                <line key={line.key} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={line.color} strokeWidth="1.5" opacity={line.opacity}/>
            ))}
            {renderNodes()}
        </svg>
    );
};

// --- Economic Flow (Sankey-like) ---
const EconomicFlowDiagram: React.FC<{ transactions: Transaction[], agents: Agent[], currentTime: number }> = ({ transactions, agents, currentTime }) => {
    const t = useTranslations();
    const [timeWindow, setTimeWindow] = useState(100);

    const filteredTransactions = transactions.filter(tx => tx.step >= currentTime - timeWindow);

    const flows = useMemo(() => {
        const flowMap: { [key: string]: number } = {};
        filteredTransactions.forEach(tx => {
            if (tx.item === 'currency') {
                const key = `${tx.from} -> ${tx.to}`;
                flowMap[key] = (flowMap[key] || 0) + tx.quantity;
            }
        });
        return Object.entries(flowMap).map(([key, value]) => {
            const [from, to] = key.split(' -> ');
            return { from, to, value };
        });
    }, [filteredTransactions]);

    if (flows.length === 0) {
         return (
            <div className="flex flex-col items-center p-8">
                 <p className="text-slate-400 text-center mb-4">{t('analytics_eco_no_transactions')}</p>
                 <label className="text-sm text-slate-300">{t('analytics_time_window')}: {timeWindow}</label>
                 <input type="range" min="10" max={currentTime > 10 ? currentTime : 10} step="10" value={timeWindow} onChange={e => setTimeWindow(parseInt(e.target.value))} className="w-64 mt-2" />
            </div>
        );
    }
    
    const agentNameMap = agents.reduce((acc, agent) => ({...acc, [agent.id]: agent.name}), {} as {[id: string]: string});

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-center items-center gap-4">
                 <label className="text-sm text-slate-300">{t('analytics_time_window')}: {timeWindow}</label>
                 <input type="range" min="10" max={currentTime > 10 ? currentTime : 10} step="10" value={timeWindow} onChange={e => setTimeWindow(parseInt(e.target.value))} className="w-64" />
            </div>
            <div className="space-y-2">
                {flows.sort((a,b) => b.value - a.value).slice(0, 20).map((flow, i) => ( // Show top 20 flows
                    <div key={i} className="flex items-center justify-between bg-slate-800/50 p-2 rounded-md">
                        <span className="font-mono text-cyan-400 truncate w-1/3 text-left">{agentNameMap[flow.from] || flow.from}</span>
                        <div className="flex-grow mx-4 h-1 bg-slate-700 rounded-full flex items-center">
                            <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (flow.value / 500) * 100)}%` }}></div>
                            <span className="text-xs text-emerald-300 ml-2">{flow.value}$</span>
                        </div>
                        <span className="font-mono text-purple-400 truncate w-1/3 text-right">{agentNameMap[flow.to] || flow.to}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Cultural Spread Map ---
const CulturalSpreadMap: React.FC<{ agents: Agent[], cultures: Culture[], environment: WorldState['environment'] }> = ({ agents, cultures, environment }) => {
    const gridDivisions = 10;
    const cellWidth = 100 / gridDivisions;
    const cellHeight = 100 / gridDivisions;

    const culturalDensity = useMemo(() => {
        const grid: { [cultureId: string]: number }[][] = Array.from({ length: gridDivisions }, () => 
            Array.from({ length: gridDivisions }, () => ({}))
        );

        agents.forEach(agent => {
            if (agent.isAlive && agent.cultureId) {
                const gridX = Math.floor((agent.x / environment.width) * gridDivisions);
                const gridY = Math.floor((agent.y / environment.height) * gridDivisions);
                if (grid[gridY] && grid[gridY][gridX]) {
                    grid[gridY][gridX][agent.cultureId] = (grid[gridY][gridX][agent.cultureId] || 0) + 1;
                }
            }
        });
        return grid;
    }, [agents, environment.width, environment.height]);

    return (
        <div className="relative w-full aspect-square bg-slate-900/50 border border-slate-700 rounded-md">
            {culturalDensity.map((row, y) => 
                row.map((cell, x) => {
                    const dominantCulture = Object.keys(cell).length > 0 
                        ? Object.entries(cell).sort((a, b) => b[1] - a[1])[0][0] 
                        : null;
                    
                    if (!dominantCulture) return null;

                    return (
                        <div
                            key={`${x}-${y}`}
                            className="absolute rounded-sm"
                            style={{
                                left: `${x * cellWidth}%`,
                                top: `${y * cellHeight}%`,
                                width: `${cellWidth}%`,
                                height: `${cellHeight}%`,
                                backgroundColor: cultureColors[dominantCulture] || cultureColors.default,
                                opacity: 0.6,
                            }}
                        ></div>
                    );
                })
            )}
        </div>
    );
};

// --- Technology Chart ---
const TechnologyChart: React.FC<{ cultures: Culture[], techTree: WorldState['techTree'] }> = ({ cultures, techTree }) => {
     const t = useTranslations();
    return (
        <div className="p-4 space-y-4">
            <h3 className="text-md font-semibold text-slate-100">{t('analytics_tech_progress')}</h3>
            <div className="space-y-6">
                {cultures.map(culture => (
                    <div key={culture.id}>
                        <h4 className="text-sm font-bold text-sky-300">{culture.name}</h4>
                        <p className="text-xs text-slate-400 mb-2">{t('admin_researchPoints')}: {culture.researchPoints.toFixed(0)}</p>
                        <div className="space-y-3">
                            {techTree.map(tech => {
                                const isKnown = culture.knownTechnologies.includes(tech.id);
                                const progress = isKnown ? 100 : Math.min(100, (culture.researchPoints / tech.researchCost) * 100);
                                const hasRequired = tech.requiredTech ? tech.requiredTech.every(req => culture.knownTechnologies.includes(req)) : true;
                                
                                return (
                                    <div key={tech.id} className={!hasRequired ? 'opacity-50' : ''}>
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="text-slate-300">{t(`tech_${tech.id}` as any) || tech.name}</span>
                                            <span className="text-slate-400">{tech.researchCost} RP</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${isKnown ? 'bg-green-500' : 'bg-purple-500 transition-all duration-300'}`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                         {!hasRequired && <p className="text-red-400 text-xs mt-1">Requires: {tech.requiredTech?.map(tId => t(`tech_${tId}` as any) || tId).join(', ')}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface AnalyticsDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    worldState: WorldState;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isOpen, onClose, worldState }) => {
    const [activeTab, setActiveTab] = useState<Tab>('social');
    const t = useTranslations();

    if (!isOpen) {
        return null;
    }

    const tabs: { id: Tab, label: string, icon: React.ReactNode }[] = [
        { id: 'social', label: t('analytics_tab_social'), icon: <Users className="w-4 h-4 mr-2"/> },
        { id: 'economic', label: t('analytics_tab_economic'), icon: <CircleDollarSign className="w-4 h-4 mr-2"/> },
        { id: 'cultural', label: t('analytics_tab_cultural'), icon: <MapIcon className="w-4 h-4 mr-2"/> },
        { id: 'tech', label: t('analytics_tab_tech'), icon: <BookOpenCheck className="w-4 h-4 mr-2"/> },
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-850 p-4 rounded-lg border border-slate-700 w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-purple-400"/>
                        {t('analytics_title')}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-200 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-shrink-0 border-b border-slate-700">
                    <div className="flex -mb-px">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-center px-4 py-3 border-b-2 text-sm font-medium transition-colors
                                    ${activeTab === tab.id
                                        ? 'border-sky-500 text-sky-400'
                                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                                    }`}
                            >
                                {tab.icon}{tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto mt-4">
                    {activeTab === 'social' && <SocialNetworkGraph agents={worldState.agents} cultures={worldState.cultures} />}
                    {activeTab === 'economic' && <EconomicFlowDiagram transactions={worldState.transactions || []} agents={worldState.agents} currentTime={worldState.environment.time} />}
                    {activeTab === 'cultural' && <CulturalSpreadMap agents={worldState.agents} cultures={worldState.cultures} environment={worldState.environment} />}
                    {activeTab === 'tech' && <TechnologyChart cultures={worldState.cultures} techTree={worldState.techTree} />}
                </div>
            </div>
        </div>
    );
};

```

---

## `Dokumentation.md`

```markdown
# RealitySim AI Dokumentation

## Inhaltsverzeichnis
1. [Einleitung](#1-einleitung)
2. [Installation & Konfiguration](#2-installation--konfiguration)
3. [Die Simulationswelt](#3-die-simulationswelt)
    - [Umgebung](#umgebung)
    - [Entitäten](#entitäten)
4. [Die Anatomie eines Agenten](#4-die-anatomie-eines-agenten)
    - [Grundlagen & Überleben](#grundlagen--überleben)
    - [Geist & Psyche](#geist--psyche)
    - [Gefängnistagebuch: Die innere Welt der Inhaftierten](#gefängnistagebuch-die-innere-welt-der-inhaftierten)
    - [Soziales Gefüge](#soziales-gefüge)
5. [Langzeitgedächtnis: Die Vektor-Datenbank](#5-langzeitgedächtnis-die-vektor-datenbank)
    - [Das Konzept des "Echten" Gedächtnisses](#das-konzept-des-echten-gedächtnisses)
    - [Der Prozess: Von der Handlung zur Erinnerung](#der-prozess-von-der-handlung-zur-erinnerung)
    - [Intelligenter Abruf durch Ähnlichkeitssuche](#intelligenter-abruf-durch-ähnlichkeitssuche)
    - [Auswirkungen auf das Agentenverhalten](#auswirkungen-auf-das-agentenverhalten)
6. [Der Simulationszyklus & KI-Entscheidungsfindung](#6-der-simulationszyklus--ki-entscheidungsfindung)
7. [Benutzerinteraktion](#7-benutzerinteraktion)
    - [Steuerungspanel](#steuerungspanel)
    - [Agentensteuerung & KI-Interaktion](#agentensteuerung--ki-interaktion)
    - [Welterschaffung & Psychoanalyse](#welterschaffung--psychoanalyse)
    - [Zustand, Gespräche & Statistiken verwalten](#zustand-gespräche--statistiken-verwalten)
    - [Manuelle Erstellung (Create New Panel)](#manuelle-erstellung-create-new-panel)
    - [Das Admin-Panel (Gott-Modus)](#das-admin-panel-gott-modus)
8. [Analyse & Beobachtung: Das Analytics Dashboard](#8-analyse--beobachtung-das-analytics-dashboard)
    - [Soziales Netzwerk](#soziales-netzwerk)
    - [Wirtschaftsflüsse](#wirtschaftsflüsse)
    - [Kulturelle Ausbreitung](#kulturelle-ausbreitung)
    - [Technologie](#technologie)
9. [Erweiterbarkeit](#9-erweiterbarkeit)
    - [Neue Aktionen hinzufügen](#91-neue-aktionen-hinzufügen)
    - [Neue Agenten-Attribute (Psyche, Bedürfnisse etc)](#92-neue-agenten-attribute-psyche-bedürfnisse-etc)
    - [Neue Technologien oder Rezepte](#93-neue-technologien-oder-rezepte)
    - [Erweiterung der Benutzeroberfläche](#94-erweiterung-der-benutzeroberfläche)
10. [Kerntechnologien & Architektur](#10-kerntechnologien--architektur)

---

## 1. Einleitung

**RealitySim AI** ist eine interaktive, webbasierte Simulationsumgebung, die das Leben einer kleinen Gesellschaft von KI-gesteuerten Agenten darstellt. Jeder Agent ist eine einzigartige Entität mit eigenen Überzeugungen, einer komplexen Persönlichkeit, psychologischen Trieben und einem dynamischen Gedächtnis.

Das Kernziel der Simulation ist nicht, ein Spiel zu gewinnen, sondern emergentes Verhalten zu beobachten: Wie entwickeln sich Kulturen? Wie bilden sich soziale Strukturen? Wie beeinflussen individuelle Traumata und Ziele das Schicksal einer Gemeinschaft? Als Benutzer können Sie die Simulation beobachten, sie Schritt für Schritt vorantreiben, direkt mit den Agenten über natürliche Sprache interagieren, um deren Verhalten zu beeinflussen, oder sogar in die Gedanken inhaftierter Agenten durch ihre KI-generierten Tagebücher eintauchen.

## 2. Installation & Konfiguration

Die Anwendung ist vollständig browserbasiert und erfordert keine serverseitige Installation. Öffnen Sie einfach die `index.html`-Datei in einem modernen Webbrowser.

Die Intelligenz der Agenten wird durch einen KI-Anbieter im Hintergrund angetrieben. Sie können dies über das **Einstellungsmenü** (Zahnrad-Icon) konfigurieren:

- **Google Gemini (Empfohlen):**
  - **Funktionalität:** Bietet die fortschrittlichsten Funktionen, einschließlich der Erstellung von Vektor-Embeddings für das Langzeitgedächtnis.
  - **Konfiguration:** Erfordert einen Google AI API-Schlüssel. Dieser Schlüssel darf **NICHT** in der UI eingegeben werden. Er muss als Umgebungsvariable `API_KEY` in der Umgebung, in der die Anwendung läuft, verfügbar sein. Die App liest diesen Schlüssel automatisch aus.

- **LM Studio:**
  - **Funktionalität:** Eine Alternative für Benutzer, die Modelle lokal ausführen möchten.
  - **Konfiguration:**
    1. Starten Sie einen lokalen Server in Ihrer LM Studio-Anwendung.
    2. Geben Sie die angezeigte Server-URL (z.B. `http://localhost:1234`) in den App-Einstellungen ein.
    3. Geben Sie den Identifier des geladenen **Chat-Modells** an.
    4. Geben Sie optional den Identifier für ein separates **Embedding-Modell** an. Damit das Langzeitgedächtnis (Vektor-DB) lokal funktioniert, muss in LM Studio ein entsprechendes Modell geladen und für den Embedding-Endpunkt konfiguriert sein (z.B. `text-embedding-granite-embedding-278m-multilingual`). Wenn das Feld in den App-Einstellungen leer gelassen wird, wird versucht, das Chat-Modell für Embeddings zu verwenden.
    5. **WICHTIG:** Aktivieren Sie die **CORS**-Option in den Servereinstellungen von LM Studio, da der Browser sonst die Verbindung blockiert.

## 3. Die Simulationswelt

### Umgebung
Die Welt ist ein 2D-Gitter definierter Größe (`width` x `height`). Sie hat globale Eigenschaften wie die `Zeit` (gemessen in Schritten) und kann dynamische Ereignisse wie Wahlen umfassen.

### Entitäten
Dies sind die statischen oder semi-statischen Objekte in der Welt:
- **Ressourcen:** Nahrungsquellen, Wasserquellen, Wälder oder Erzvorkommen. Sie haben eine begrenzte Menge und können von Agenten abgebaut werden.
- **Gebäude:** Von Agenten gebaute Unterkünfte oder spezielle Gebäude wie der **Marktplatz** (für Handel) und das **Gefängnis** (für Gesetzesbrecher).
- **Eigentum:** Entitäten können einem Agenten gehören, was andere daran hindert, sie frei zu nutzen.

## 4. Die Anatomie eines Agenten

Jeder Agent ist weit mehr als nur eine Figur auf der Karte. Sein Verhalten wird durch ein vielschichtiges internes Zustandsmodell bestimmt.

### Grundlagen & Überleben
- **Attribute:** Jeder Agent hat grundlegende Werte wie `Position (x, y)`, `Alter`, `Gesundheit`, `Inventar` und `jailJournal` (eine Liste von Tagebucheinträgen, falls inhaftiert).
- **Bedürfnisse:** Die primären Überlebenstriebe sind `Hunger`, `Durst` und `Müdigkeit`. Diese Werte steigen kontinuierlich an. Wenn sie einen kritischen Schwellenwert überschreiten, verursachen sie `Stress` und `Gesundheitsschaden`. Unbehandelt führen sie zum Tod des Agenten.
- **Zustand:** Agenten können `inhaftiert` sein, was ihre Handlungsfähigkeit stark einschränkt. Ihr `imprisonedUntil`-Wert gibt an, wann sie wieder freikommen.
- **Genom:** Agenten besitzen genetische Merkmale (z.B. `G-AGILE` für schnellere Bewegung, `G-INTELLIGENT` für schnelleres Lernen), die ihre Fähigkeiten und ihr Überleben beeinflussen.

### Geist & Psyche
- **Persönlichkeit (Big Five):** Jeder Agent wird durch fünf stabile Persönlichkeitsmerkmale definiert (`Offenheit`, `Gewissenhaftigkeit`, `Extraversion`, `Verträglichkeit`, `Neurotizismus`). Ein Agent mit hoher Extraversion wird eher soziale Interaktionen suchen, während ein Agent mit hohem Neurotizismus risikoreiche Aktionen meidet.
- **Psyche & Triebe:** Dies sind tiefere, langsam veränderliche psychologische Antriebe, die das Verhalten stark färben. Dazu gehören:
  - `Eifersucht`: Kann zu konfrontativen Handlungen führen.
  - `Rachsucht`: Priorisiert aggressive Aktionen gegen Rivalen.
  - `Sinnsuche` & `Spirituelles Bedürfnis`: Führt zu meditativen oder introspektiven Handlungen.
  - `Langeweile`: Fördert neuartiges oder zufälliges Verhalten.
  - `Todesangst`: Steigt bei niedriger Gesundheit und priorisiert sichere, heilende Aktionen.
- **Emotionen:** Kurzfristige Gefühle wie `Freude`, `Trauer`, `Wut`, die als direkte Reaktion auf Ereignisse entstehen und mit der Zeit abklingen. Hohe `Trauer` kann z.B. die Aktion "Trauern" auslösen.
- **Überzeugungen:** Ein Netzwerk von Überzeugungen (`beliefNetwork`), das die Weltsicht des Agenten darstellt (z.B. `natur_ist_gut: 0.8`). Erfolgreiche oder fehlgeschlagene Aktionen können diese Überzeugungen stärken oder schwächen.
- **Ziele:** Agenten können dynamisch Ziele entwickeln (z.B. "Anführer werden", "Rache am Rivalen nehmen"). Diese Ziele geben ihrem Handeln eine langfristige Richtung und werden bei der Aktionsauswahl stark gewichtet.

### Gefängnistagebuch: Die innere Welt der Inhaftierten
Ein einzigartiges Feature, das die psychologische Tiefe der Simulation erweitert, ist das Gefängnistagebuch. Wenn ein Agent inhaftiert wird, beginnt er, ein Tagebuch zu führen.
- **Automatische Generierung:** Für jeden Simulationsschritt (der einer Woche im Gefängnis entspricht), generiert die KI einen detaillierten, persönlichen Tagebucheintrag aus der Perspektive des Agenten.
- **Kontextbezogene Inhalte:** Diese Einträge sind nicht zufällig. Sie spiegeln die `Persönlichkeit`, die `Psyche`, die aktuellen `Emotionen` und die `Erinnerungen` des Agenten an die Tat wider, die zu seiner Verhaftung führte. Ein optimistischer Agent schreibt vielleicht hoffnungsvoll, während ein zynischer Agent verbittert oder wütend klingen wird.
- **Beobachtung:** Das Tagebuch kann direkt auf der **Agentenkarte** eingesehen werden (erkennbar am Notizbuch-Icon) und bietet einen faszinierenden Einblick in die Gedanken und Gefühle eines Agenten während seiner Zeit im Gefängnis.

### Soziales Gefüge
- **Beziehungen:** Agenten bauen Beziehungen zu anderen auf, die von `Fremder` über `Freund` bis hin zu `Rivale` oder `Ehepartner` reichen. Jede Beziehung hat einen numerischen Wert, der durch Interaktionen und Nähe beeinflusst wird.
- **Kultur & Religion:** Die Zugehörigkeit zu einer Kultur oder Religion stattet Agenten mit einem gemeinsamen Satz von Grundüberzeugungen aus und ermöglicht ihnen, an kollektiven Zielen wie der Erforschung neuer Technologien teilzuhaben.

## 5. Langzeitgedächtnis: Die Vektor-Datenbank

Dies ist eines der fortschrittlichsten Features der Simulation und der Schlüssel zu wirklich intelligentem, kontextbewusstem Verhalten. Es ersetzt ein einfaches, chronologisches Protokoll durch ein semantisches, assoziatives Gedächtnis.

### Das Konzept des "Echten" Gedächtnisses
Ein menschliches Gedächtnis funktioniert nicht wie eine Liste. Wir erinnern uns an Ereignisse basierend auf ihrer Relevanz für die aktuelle Situation. Wenn wir über "Urlaub" nachdenken, kommen uns Erinnerungen an Strände, Berge oder bestimmte Reisen in den Sinn – nicht die Erinnerung an das Zähneputzen von letzter Woche. Dieses System ahmt dieses Prinzip nach.

### Der Prozess: Von der Handlung zur Erinnerung
1.  **Aktion & Ergebnis:** Ein Agent führt eine Aktion aus, z.B. "Sammle 5 Nahrung von Beerenbusch". Das Ergebnis wird als Textprotokoll erfasst.
2.  **Embedding-Erstellung:** Dieser Text wird an die Gemini API (`text-embedding-004` Modell) gesendet. Die API wandelt den semantischen Inhalt des Textes in einen numerischen Vektor (ein "Embedding") um. Dieses Embedding ist eine mathematische Repräsentation der Bedeutung der Erinnerung.
3.  **Speicherung:** Jede Erinnerung – bestehend aus dem Textinhalt, dem Vektor-Embedding und einem Zeitstempel – wird in der persönlichen **Vektor-Datenbank** des Agenten gespeichert (`VectorDB`-Klasse in `memoryService.ts`). Diese Datenbank ist das Langzeitgedächtnis des Agenten.

### Intelligenter Abruf durch Ähnlichkeitssuche
Wenn der Benutzer dem Agenten einen komplexen Befehl gibt (z.B. "Was hältst du von Bob?"), passiert Folgendes:
1.  **Anfrage-Vektor:** Der Befehl des Benutzers wird ebenfalls in einen Anfrage-Vektor umgewandelt.
2.  **Ähnlichkeitssuche:** Das System durchsucht die Vektor-Datenbank des Agenten und vergleicht den Anfrage-Vektor mit den Vektoren aller gespeicherten Erinnerungen mithilfe der **Kosinus-Ähnlichkeit**.
3.  **Relevanz-Ranking:** Erinnerungen, deren Vektoren dem Anfrage-Vektor am ähnlichsten sind, werden als am relevantesten eingestuft. Dies bedeutet, dass Erinnerungen an vergangene Interaktionen mit "Bob" (sowohl positive als auch negative) eine hohe Ähnlichkeit aufweisen werden, während irrelevante Erinnerungen (wie das Sammeln von Holz) eine niedrige Ähnlichkeit haben.

### Auswirkungen auf das Agentenverhalten
Die Top 3-5 relevantesten Erinnerungen werden dem Haupt-KI-Modell (Gemini) als zusätzlicher Kontext für seine Entscheidung bereitgestellt. Statt nur zu fragen: "Was soll der Agent tun?", fragt das System nun:

> "Basierend auf dem Zustand des Agenten, der aktuellen Welt UND diesen spezifischen, relevanten Erinnerungen aus seiner Vergangenheit – was ist die logischste Aktion oder Antwort?"

Dies ermöglicht ein unglaublich nuanciertes Verhalten:
- Ein Agent wird sich an einen vergangenen, unfairen Handel erinnern, wenn er erneut mit demselben Partner interagiert.
- Ein Agent kann seine Meinung über einen Ort bilden, basierend auf wiederholten positiven oder negativen Erfahrungen dort.
- Ein Agent kann auf Fragen zu vergangenen Ereignissen antworten, die hunderte von Schritten zurückliegen, solange sie für die Frage relevant sind.

Das Vektor-Gedächtnis verwandelt die Agenten von rein reaktiven Wesen zu Wesen, die aus ihrer gesamten Lebenserfahrung lernen und reflektieren können.

## 6. Der Simulationszyklus & KI-Entscheidungsfindung

Jeder "Schritt" der Simulation durchläuft einen festen Zyklus:
1.  **Globale Updates:** Die Zeit schreitet voran, politische Ereignisse wie Wahlen werden geprüft.
2.  **Agenten-Zyklus (für jeden Agenten):**
    a. **Passive Updates:** Bedürfnisse steigen, Gesundheit verändert sich, Emotionen klingen ab. Wenn ein Agent inhaftiert ist, wird geprüft, ob ein Tagebucheintrag generiert werden muss.
    b. **Aktionsauswahl (`chooseAction`):** Dies ist das "Gehirn" des Agenten. Ein ausgeklügeltes Bewertungssystem wägt verschiedene Faktoren ab, um die beste Aktion auszuwählen:
        - **Überlebenspriorität:** Hoher Hunger oder Durst erhält eine massive Priorität.
        - **Psychologische Triebe:** Starke Antriebe (z.B. hohe Trauer, hohe Rachsucht) geben bestimmten Aktionen einen hohen Bonus.
        - **Ziele:** Aktive Ziele werden stark gewichtet.
        - **Gesetze & Persönlichkeit:** Illegale Handlungen erhalten einen Malus, besonders bei gewissenhaften Agenten.
        - **Q-Learning:** Ein einfaches Verstärkungslernen-System (`qTable`) merkt sich, welche Aktionen in bestimmten Zuständen zu positiven Ergebnissen geführt haben.
    c. **Aktionsausführung:** Die gewählte Aktion wird ausgeführt.
    d. **Gedächtnisbildung:** Das Ergebnis wird, wie oben beschrieben, in eine Erinnerung umgewandelt und im Vektor-Gedächtnis gespeichert.

## 7. Benutzerinteraktion

### Steuerungspanel
- **Step / Run:** Führt die Simulation für einen oder mehrere Schritte aus.
- **Reset:** Setzt die Welt auf ihren ursprünglichen Zustand zurück.
- **Generate World / Add with AI:** Nutzt die generative Kraft der KI, um die Welt mit einzigartigen Agenten und Entitäten zu bevölkern oder zur bestehenden Welt hinzuzufügen.

### Agentensteuerung & KI-Interaktion
Über die **Agentenkarte** können Sie direkt mit einem Agenten interagieren:
- **Direkter Befehl:** Deaktivieren Sie "KI verwenden", um exakte Aktionsnamen einzugeben (z.B. "Move North").
- **Natürliche Sprache (Use AI):** Geben Sie einen Befehl in natürlicher Sprache ein (z.B. "Geh etwas essen" oder "Räche dich an deinem Rivalen"). Dies aktiviert den intelligenten Entscheidungsprozess, einschließlich des Abrufs von Erinnerungen aus der Vektor-Datenbank.

### Welterschaffung & Psychoanalyse
- **Generate World:** Erstellt eine komplett neue Weltbevölkerung basierend auf Ihren Vorgaben (Anzahl der Agenten/Entitäten). Die KI sorgt für einzigartige Namen, Persönlichkeiten und Hintergrundgeschichten.
- **Psychoanalyse:** Sie können eine tiefenpsychologische Analyse eines Agenten anfordern. Die KI analysiert den gesamten Zustand des Agenten (Persönlichkeit, Traumata, Beziehungen, Überzeugungen) und erstellt einen detaillierten Bericht, der sogar unbewusste Konflikte und therapeutische Empfehlungen enthält. Diese Ergebnisse können dann direkt in die Psyche des Agenten integriert werden, um z.B. neue Ziele zu schaffen.

### Zustand, Gespräche & Statistiken verwalten
In der rechten Seitenleiste befindet sich das Panel zum Verwalten des Simulationszustands und zum Exportieren von Daten:
- **Zustand Speichern/Laden:** Ermöglicht das Exportieren der gesamten Simulation in eine JSON-Datei und das spätere erneute Laden.
- **Gespräche exportieren:** Erstellt eine Markdown-Datei mit allen bisherigen Konversationen der Agenten.
- **Statistiken exportieren:** Generiert einen zusammenfassenden Bericht im Markdown-Format über wichtige Ereignisse wie Eheschließungen (wer mit wem), Geburten (Eltern und Kind), Inhaftierungen (wer wie oft) und Kämpfe. Dies bietet eine hervorragende statistische Übersicht über die soziale Dynamik der Welt.

### Manuelle Erstellung (Create New Panel)
Dieses Panel, sichtbar in der Standardansicht des rechten Bereichs (wenn kein Admin ausgewählt ist), erlaubt es Ihnen, manuell neue Elemente in die Simulation einzufügen, ohne KI-Generierung zu verwenden. Sie können erstellen:
- **Agenten:** Definieren Sie einen neuen Agenten von Grund auf, einschließlich Name, Beschreibung, Überzeugungen und Persönlichkeitsmerkmale.
- **Entitäten:** Fügen Sie neue Objekte oder Landmarken zur Welt hinzu.
- **Aktionen:** Entwerfen Sie eine neue, benutzerdefinierte Aktion mit spezifischen mechanischen Effekten (Kosten, Statusänderungen, Fähigkeitsgewinne). Dies ist ein mächtiges Werkzeug zum Testen neuer Spielmechaniken.

### Das Admin-Panel (Gott-Modus)
Wenn ein Agent mit dem Attribut `adminAgent: true` ausgewählt ist, wechselt die rechte Ansicht zum Admin-Panel. Dieses Panel bietet direkte "gottgleiche" Kontrolle über die Kernparameter der Simulation:
- **Politische Verwaltung:** Starten Sie Wahlen, setzen Sie einen Anführer manuell ein, erlassen oder widerrufen Sie Gesetze.
- **Technologie-Management:** Beobachten Sie den Forschungsfortschritt jeder Kultur und schalten Sie Technologien bei Bedarf manuell frei.
- **Agenten-Management:** Passen Sie die Attribute jedes Agenten an – setzen Sie Gesundheit, Währung, Position oder infizieren Sie ihn mit einer Krankheit. Tote Agenten können wiederbelebt werden.

## 8. Analyse & Beobachtung: Das Analytics Dashboard

Das Analytics Dashboard (erreichbar über das Balkendiagramm-Icon) bietet einen Makro-Blick auf die Simulation und hilft, emergente Muster zu erkennen, die im normalen Ereignisprotokoll untergehen würden.

### Soziales Netzwerk
Dieser Tab visualisiert das Beziehungsgeflecht der Gesellschaft als Graphen. Agenten sind Knoten, und Linien zwischen ihnen stellen Beziehungen dar.
- **Farbe & Art:** Die Farbe der Linie zeigt die Art der Beziehung an (z.B. pink für Partner, grün für Freunde, rot für Rivalen).
- **Stärke:** Die Deckkraft der Linie korreliert mit der Stärke der Beziehung.
Dies ermöglicht es, auf einen Blick soziale Cliquen, zentrale Individuen oder isolierte Agenten zu erkennen.

### Wirtschaftsflüsse
Dieses Diagramm zeigt den Fluss von Währung (`currency`) zwischen den Agenten und der Welt (z.B. durch Arbeit).
- **Sankey-ähnliche Darstellung:** Pfeile zeigen die Richtung des Geldflusses an, ihre Dicke repräsentiert das transferierte Volumen.
- **Zeitfenster-Regler:** Sie können den Analysezeitraum anpassen, um kurzfristige Handelsmuster oder langfristige Wirtschaftsbeziehungen zu untersuchen.

### Kulturelle Ausbreitung
Diese Ansicht zeigt eine Heatmap der Weltkarte.
- **Farbkodierung:** Jede Kultur hat eine eigene Farbe.
- **Dichte:** Die Farbintensität in einem Gitterbereich zeigt die Konzentration von Mitgliedern einer bestimmten Kultur an. So lässt sich die Bildung von kulturellen Enklaven oder die Vermischung von Kulturen visuell nachvollziehen.

### Technologie
Hier wird der technologische Fortschritt jeder Kultur visualisiert.
- **Fortschrittsbalken:** Für jede Technologie im Technologiebaum (`techTree`) wird der Forschungsfortschritt jeder Kultur als Prozentbalken dargestellt.
- **Abhängigkeiten:** Technologien, deren Voraussetzungen noch nicht erfüllt sind, werden ausgegraut dargestellt, was die Entwicklungswege der Kulturen verdeutlicht.

## 9. Erweiterbarkeit

Die Simulation ist modular aufgebaut, um leicht erweitert werden zu können. Hier sind die wichtigsten Ansatzpunkte für Erweiterungen:

### 9.1 Neue Aktionen hinzufügen
Dies ist die häufigste Art der Erweiterung. Wie bereits erwähnt, können neue Aktionen in `services/actions.ts` definiert und zur `availableActions`-Liste hinzugefügt werden. Dies ermöglicht neue Verhaltensweisen, die sofort in das KI-Entscheidungssystem integriert werden. Alternativ können Aktionen auch zur Laufzeit über das "Create New"-Panel hinzugefügt werden.

### 9.2 Neue Agenten-Attribute (Psyche, Bedürfnisse etc.)
Die Simulation kann durch neue interne Zustände für Agenten erweitert werden.
1.  **Typdefinition:** Fügen Sie das neue Attribut zur `Agent`-Schnittstelle in `types.ts` hinzu (z.B. ein neuer Psyche-Wert wie `courage` oder ein Bedürfnis wie `social`).
2.  **Initialisierung:** Geben Sie einen Standardwert in `constants.ts` (z.B. in `defaultPsyche`) und in den Generierungsfunktionen (`sanitizeAndCreateAgents` in `hooks/useSimulation.ts`) an.
3.  **Simulation-Engine:** Integrieren Sie die Logik für das neue Attribut in `services/simulation.ts`. Wie verändert es sich pro Schritt (`applyPerStepMechanisms`)?
4.  **KI-Integration (entscheidend):** Damit die KI das neue Attribut versteht und berücksichtigt, müssen die Prompts in `services/geminiService.ts` aktualisiert werden. Fügen Sie das Attribut zur Agenten-Zustandsbeschreibung hinzu und erklären Sie in der `instructions`-Sektion, wie es die Aktionsauswahl beeinflussen soll (z.B. "Hoher `courage` erhöht die Wahrscheinlichkeit für die Aktion 'Fight'").

### 9.3 Neue Technologien oder Rezepte
1.  **Technologien:** Fügen Sie einen neuen Eintrag zum `TECH_TREE` in `constants.ts` hinzu. Definieren Sie die Kosten, Voraussetzungen und was die Technologie freischaltet (neue Aktionen, Rezepte).
2.  **Rezepte:** Fügen Sie einen neuen Eintrag zur `RECIPES`-Liste in `constants.ts` hinzu. Definieren Sie das Ergebnis, die Zutaten und eventuelle Fähigkeits- oder Technologieanforderungen. Das System erstellt daraus automatisch eine `Craft...`-Aktion.

### 9.4 Erweiterung der Benutzeroberfläche
Neue Informationen können in den Komponenten in `components/` visualisiert werden, z.B. durch Hinzufügen eines neuen Diagramms in `AgentCard.tsx` oder einer neuen Visualisierung im `AnalyticsDashboard.tsx`.

## 10. Kerntechnologien & Architektur

- **Frontend-Framework:** **React & TypeScript** werden für den Aufbau einer robusten, typsicheren und komponentenbasierten Benutzeroberfläche verwendet.

- **Styling:** **TailwindCSS** ermöglicht ein schnelles, "Utility-First"-Styling direkt im HTML, was die Entwicklung beschleunigt und für ein konsistentes Design sorgt.

- **Künstliche Intelligenz (KI):** Die **Google Gemini API** dient als kognitiver Kern der Simulation.
  - `gemini-2.5-flash`: Wird für komplexe Entscheidungsfindung, Dialoggenerierung, Psychoanalyse und die prozedurale Erstellung von Welten und Agenten genutzt.
  - `text-embedding-004`: Erstellt die Vektor-Embeddings, die das Fundament des semantischen Langzeitgedächtnisses bilden.

- **Gedächtnissystem:** Eine **benutzerdefinierte, im Arbeitsspeicher laufende Vektor-Datenbank** (`VectorDB`). Sie verwendet Kosinus-Ähnlichkeit, um semantisch relevante Erinnerungen abzurufen, was ein kontextbezogenes Verhalten der Agenten ermöglicht.

- **Zustandsverwaltung (State Management):** Die gesamte Anwendung nutzt **React Hooks** für die Zustandsverwaltung. Es gibt keine externen State-Management-Bibliotheken. Der zentrale `useSimulation`-Hook fungiert als Haupt-Controller, der die Simulations-Engine (`RealityEngine.ts`) mit der React-UI verbindet. `useContext` wird verwendet, um globale Zustände wie Einstellungen und Sprache bereitzustellen.

- **Datenvisualisierung:**
  - **Recharts:** Eine leichtgewichtige Diagrammbibliothek, die für die Visualisierung von Agenten-Attributen (Persönlichkeit, Fähigkeiten) und in Teilen des Analytics Dashboards verwendet wird.
  - **Custom SVG:** Die Weltkarte (`WorldGraph.tsx`) ist eine vollständig benutzerdefinierte SVG-Komponente. Dies bietet maximale Kontrolle und Performance bei der Darstellung von Agenten, Entitäten und ihren Beziehungen auf dem Gitter.

- **Modul-System & Build-Prozess:** Die Anwendung verfolgt einen modernen, **build-freien Ansatz** unter Verwendung von **nativen ES-Modulen mit Import Maps** (definiert in `index.html`). Alle Abhängigkeiten (wie React, Recharts) werden zur Laufzeit direkt aus einem CDN (`esm.sh`) geladen. Dies vereinfacht die Entwicklungsumgebung erheblich, da keine komplexen Tools wie Webpack oder Vite erforderlich sind.

- **Datenpersistenz:**
  - **`localStorage`:** Die Browser-API `localStorage` wird verwendet, um benutzerspezifische Einstellungen (wie den KI-Anbieter) dauerhaft zu speichern.
  - **File API:** Die Funktionalität zum Speichern und Laden des gesamten Simulationszustands wird über die browserbasierte File API realisiert, die es dem Benutzer ermöglicht, JSON-Dateien zu exportieren und zu importieren.
```

---

## `App.tsx`

```typescript

import React, { useMemo, useState, useEffect } from 'react';
import type { Agent, PsychoReport } from './types';
import { AgentCard } from './components/AgentCard';
import { ControlPanel } from './components/ControlPanel';
import { LogPanel } from './components/LogPanel';
import { WorldGraph } from './components/WorldGraph';
import { CreateObjectPanel } from './components/CreateObjectPanel';
import { ExporterPanel } from './components/ExporterPanel';
import { AdminPanel } from './components/AdminPanel';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { BrainCircuit, Cpu, Zap, Microscope, Boxes, Trash2, Settings, X, Globe, Users, PlusSquare, Apple, Droplet, Log, Hammer, Home, Vote, PanelLeft, PanelRight, Map, BarChart2 } from './components/IconComponents';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useSettings } from './contexts/SettingsContext';
import { useTranslations } from './hooks/useTranslations';
import { useSimulation } from './hooks/useSimulation';
import { ProcessingIndicator } from './components/ProcessingIndicator';

// --- View Toggle Panel ---
interface ViewTogglePanelProps {
    visibility: {
        left: boolean;
        agentCard: boolean;
        worldMap: boolean;
        right: boolean;
    };
    onToggle: (panel: keyof ViewTogglePanelProps['visibility']) => void;
}

const ViewTogglePanel: React.FC<ViewTogglePanelProps> = ({ visibility, onToggle }) => {
    const t = useTranslations();
    const baseClass = "p-2 rounded-md transition-colors";
    const activeClass = "bg-sky-600 hover:bg-sky-500 text-white";
    const inactiveClass = "bg-slate-700 hover:bg-slate-600 text-slate-300";

    return (
        <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
            <button onClick={() => onToggle('left')} title={t('viewtoggle_left')} className={`${baseClass} ${visibility.left ? activeClass : inactiveClass}`}>
                <PanelLeft className="w-5 h-5" />
            </button>
            <button onClick={() => onToggle('agentCard')} title={t('viewtoggle_agentcard')} className={`${baseClass} ${visibility.agentCard ? activeClass : inactiveClass}`}>
                <Users className="w-5 h-5" />
            </button>
            <button onClick={() => onToggle('worldMap')} title={t('viewtoggle_map')} className={`${baseClass} ${visibility.worldMap ? activeClass : inactiveClass}`}>
                <Map className="w-5 h-5" />
            </button>
            <button onClick={() => onToggle('right')} title={t('viewtoggle_right')} className={`${baseClass} ${visibility.right ? activeClass : inactiveClass}`}>
                <PanelRight className="w-5 h-5" />
            </button>
        </div>
    );
};
// --- End View Toggle Panel ---

// --- Settings Modal Component ---
interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, setSettings } = useSettings();
    const t = useTranslations();

    const [provider, setProvider] = useState(settings.provider);
    const [url, setUrl] = useState(settings.lmStudioUrl);
    const [model, setModel] = useState(settings.lmStudioModel);
    const [embeddingModel, setEmbeddingModel] = useState(settings.lmStudioEmbeddingModel);
    const [geminiModel, setGeminiModel] = useState(settings.geminiModel);

    useEffect(() => {
        if (isOpen) {
            setProvider(settings.provider);
            setUrl(settings.lmStudioUrl);
            setModel(settings.lmStudioModel);
            setEmbeddingModel(settings.lmStudioEmbeddingModel);
            setGeminiModel(settings.geminiModel);
        }
    }, [settings, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        setSettings({ provider, lmStudioUrl: url, lmStudioModel: model, lmStudioEmbeddingModel: embeddingModel, geminiModel });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-850 p-6 rounded-lg border border-slate-700 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-sky-400"/>
                        {t('settings_title')}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-200 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t('settings_aiProvider_label')}</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setProvider('lm_studio')}
                                className={`p-3 rounded-md border text-center transition-colors ${provider === 'lm_studio' ? 'bg-sky-600 border-sky-500' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                            >
                                LM Studio
                            </button>
                             <button
                                onClick={() => setProvider('gemini')}
                                className={`p-3 rounded-md border text-center transition-colors ${provider === 'gemini' ? 'bg-sky-600 border-sky-500' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                            >
                                Google Gemini
                            </button>
                        </div>
                    </div>

                    {provider === 'lm_studio' && (
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="lm-studio-url" className="block text-sm font-medium text-slate-300 mb-1">{t('settings_lmStudioUrl_label')}</label>
                                <input id="lm-studio-url" type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="http://localhost:1234" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"/>
                                <p className="text-xs text-slate-500 mt-2">{t('settings_lmStudioUrl_description')}</p>
                            </div>
                            <div>
                                <label htmlFor="lm-studio-model" className="block text-sm font-medium text-slate-300 mb-1">{t('settings_lmStudioModel_label')}</label>
                                <input id="lm-studio-model" type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. google/gemma-2b-it" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"/>
                                <p className="text-xs text-slate-500 mt-2">{t('settings_lmStudioModel_description')}</p>
                            </div>
                             <div>
                                <label htmlFor="lm-studio-embedding-model" className="block text-sm font-medium text-slate-300 mb-1">{t('settings_lmStudioEmbeddingModel_label')}</label>
                                <input id="lm-studio-embedding-model" type="text" value={embeddingModel} onChange={(e) => setEmbeddingModel(e.target.value)} placeholder="e.g. text-embedding-granite-embedding-278m-multilingual" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"/>
                                <p className="text-xs text-slate-500 mt-2">{t('settings_lmStudioEmbeddingModel_description')}</p>
                            </div>
                        </div>
                    )}
                    
                     {provider === 'gemini' && (
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="gemini-model" className="block text-sm font-medium text-slate-300 mb-1">{t('settings_geminiModel_label')}</label>
                                <select id="gemini-model" value={geminiModel} onChange={e => setGeminiModel(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition">
                                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                                    <option value="gemini-1.5-flash-latest">gemini-1.5-flash-latest</option>
                                    <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option>
                                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                                    <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
                                </select>
                                 <p className="text-xs text-slate-500 mt-2">{t('settings_geminiModel_description')}</p>
                            </div>
                            <div>
                                 <label htmlFor="gemini-api-key" className="block text-sm font-medium text-slate-300 mb-1">{t('settings_geminiApiKey_label')}</label>
                                 <div className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-400">
                                     {t('settings_geminiApiKey_value')}
                                 </div>
                                 <p className="text-xs text-slate-500 mt-2">{t('settings_geminiApiKey_description')}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">{t('settings_cancel')}</button>
                        <button onClick={handleSave} className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">{t('settings_save')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- End Settings Modal ---

// --- Generate World Modal ---
interface GenerateWorldModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (agentCount: number, entityCounts: { [key: string]: number }) => void;
    isGenerating: boolean;
}

const GenerateWorldModal: React.FC<GenerateWorldModalProps> = ({ isOpen, onClose, onGenerate, isGenerating }) => {
    const [agentCount, setAgentCount] = useState(20);
    const [entityCounts, setEntityCounts] = useState({ food: 5, water: 3, wood: 5, iron: 4, buildings: 3 });
    const t = useTranslations();

    if (!isOpen) {
        return null;
    }
    
    const handleEntityCountChange = (type: string, value: string) => {
        const count = Math.max(0, parseInt(value, 10) || 0);
        setEntityCounts(prev => ({...prev, [type]: count}));
    }

    const handleGenerateClick = () => {
        onGenerate(agentCount, entityCounts);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-850 p-6 rounded-lg border border-slate-700 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Globe className="w-6 h-6 text-purple-400"/>
                        {t('generateWorldModal_title')}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-200 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label htmlFor="agent-count" className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2"><Users className="w-4 h-4" />{t('generateWorldModal_agentsLabel')}</label>
                        <input
                            id="agent-count"
                            type="number"
                            value={agentCount}
                            onChange={(e) => setAgentCount(Math.max(1, parseInt(e.target.value, 10)))}
                            min="1"
                            max="100"
                            disabled={isGenerating}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"
                        />
                         <p className="text-xs text-slate-500 mt-2">{t('generateWorldModal_agentsDescription')}</p>
                    </div>

                     <div>
                        <h3 className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2"><Boxes className="w-4 h-4"/>{t('generateWorldModal_entitiesLabel')}</h3>
                         <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="entity-count-food-world" className="text-xs text-slate-400 flex items-center gap-1"><Apple className="w-3 h-3"/>{t('generateContent_foodSources')}</label>
                                <input id="entity-count-food-world" type="number" value={entityCounts.food} onChange={e => handleEntityCountChange('food', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                             <div className="flex flex-col gap-1">
                                <label htmlFor="entity-count-water-world" className="text-xs text-slate-400 flex items-center gap-1"><Droplet className="w-3 h-3"/>{t('generateContent_waterSources')}</label>
                                <input id="entity-count-water-world" type="number" value={entityCounts.water} onChange={e => handleEntityCountChange('water', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="entity-count-wood-world" className="text-xs text-slate-400 flex items-center gap-1"><Log className="w-3 h-3"/>{t('generateContent_woodSources')}</label>
                                <input id="entity-count-wood-world" type="number" value={entityCounts.wood} onChange={e => handleEntityCountChange('wood', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="entity-count-iron-world" className="text-xs text-slate-400 flex items-center gap-1"><Hammer className="w-3 h-3"/>{t('generateContent_ironSources')}</label>
                                <input id="entity-count-iron-world" type="number" value={entityCounts.iron} onChange={e => handleEntityCountChange('iron', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                             <div className="flex flex-col gap-1 col-span-2 lg:col-span-1">
                                <label htmlFor="entity-count-buildings-world" className="text-xs text-slate-400 flex items-center gap-1"><Home className="w-3 h-3"/>{t('generateContent_buildings')}</label>
                                <input id="entity-count-buildings-world" type="number" value={entityCounts.buildings} onChange={e => handleEntityCountChange('buildings', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                         </div>
                        <p className="text-xs text-slate-500 mt-2">{t('generateWorldModal_entitiesDescription')}</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">{t('settings_cancel')}</button>
                        <button onClick={handleGenerateClick} disabled={isGenerating} className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-wait">{isGenerating ? t('log_generating') : t('generateWorldModal_generate')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- End Generate World Modal ---

// --- Generate Content Modal ---
interface GenerateContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerateAgents: (count: number) => void;
    onGenerateEntities: (counts: { [key: string]: number }) => void;
    isGenerating: boolean;
}

const GenerateContentModal: React.FC<GenerateContentModalProps> = ({ isOpen, onClose, onGenerateAgents, onGenerateEntities, isGenerating }) => {
    const [agentCount, setAgentCount] = useState(5);
    const [entityCounts, setEntityCounts] = useState({ food: 2, water: 2, wood: 2, iron: 2, buildings: 2 });
    const t = useTranslations();

    if (!isOpen) {
        return null;
    }

    const handleEntityCountChange = (type: string, value: string) => {
        const count = Math.max(0, parseInt(value, 10) || 0);
        setEntityCounts(prev => ({...prev, [type]: count}));
    }

    const handleGenerateAgentsClick = () => {
        onGenerateAgents(agentCount);
    };
    
    const handleGenerateEntitiesClick = () => {
        onGenerateEntities(entityCounts);
    };

    const generatingText = t('log_generating');

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-850 p-6 rounded-lg border border-slate-700 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <PlusSquare className="w-6 h-6 text-purple-400"/>
                        {t('generateContent_title')}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-200 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-8">
                    {/* Agent Generation */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2"><Users className="w-5 h-5"/>{t('generateContent_addAgents')}</h3>
                        <div>
                            <label htmlFor="agent-count-add" className="block text-sm font-medium text-slate-300 mb-1">{t('generateContent_agentsLabel')}</label>
                            <input
                                id="agent-count-add"
                                type="number"
                                value={agentCount}
                                onChange={(e) => setAgentCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                min="1"
                                max="50"
                                disabled={isGenerating}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"
                            />
                            <p className="text-xs text-slate-500 mt-2">{t('generateContent_agentsDescription')}</p>
                        </div>
                        <button 
                            onClick={handleGenerateAgentsClick}
                            disabled={isGenerating}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-wait flex items-center justify-center gap-2"
                        >
                            <Globe className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? generatingText : t('generateContent_generateAgentsBtn')}
                        </button>
                    </div>

                    {/* Entity Generation */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2"><Boxes className="w-5 h-5"/>{t('generateContent_addEntities')}</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="entity-count-food" className="block text-sm font-medium text-slate-300 mb-1">{t('generateContent_foodSources')}</label>
                                <input id="entity-count-food" type="number" value={entityCounts.food} onChange={(e) => handleEntityCountChange('food', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                            <div>
                                <label htmlFor="entity-count-water" className="block text-sm font-medium text-slate-300 mb-1">{t('generateContent_waterSources')}</label>
                                <input id="entity-count-water" type="number" value={entityCounts.water} onChange={(e) => handleEntityCountChange('water', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                            <div>
                                <label htmlFor="entity-count-wood" className="block text-sm font-medium text-slate-300 mb-1">{t('generateContent_woodSources')}</label>
                                <input id="entity-count-wood" type="number" value={entityCounts.wood} onChange={(e) => handleEntityCountChange('wood', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                            <div>
                                <label htmlFor="entity-count-iron" className="block text-sm font-medium text-slate-300 mb-1">{t('generateContent_ironSources')}</label>
                                <input id="entity-count-iron" type="number" value={entityCounts.iron} onChange={(e) => handleEntityCountChange('iron', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                             <div className="col-span-2">
                                <label htmlFor="entity-count-buildings" className="block text-sm font-medium text-slate-300 mb-1">{t('generateContent_buildings')}</label>
                                <input id="entity-count-buildings" type="number" value={entityCounts.buildings} onChange={(e) => handleEntityCountChange('buildings', e.target.value)} min="0" disabled={isGenerating} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none transition disabled:opacity-50"/>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{t('generateContent_entitiesDescriptionCategorized')}</p>
                         <button 
                            onClick={handleGenerateEntitiesClick}
                            disabled={isGenerating}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-wait flex items-center justify-center gap-2"
                         >
                            <Globe className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? generatingText : t('generateContent_generateEntitiesBtn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- End Generate Content Modal ---

// --- Psychoanalysis Modal ---
interface PsychoanalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: PsychoReport | null;
    isGenerating: boolean;
    agentName: string | null;
}

const ReportSection: React.FC<{ title: string; content: string | undefined }> = ({ title, content }) => (
    <div className="space-y-1">
        <h3 className="text-md font-semibold text-sky-300">{title}</h3>
        <p className="text-sm text-slate-300 whitespace-pre-wrap">{content || '...'}</p>
    </div>
);

const PsychoanalysisModal: React.FC<PsychoanalysisModalProps> = ({ isOpen, onClose, report, isGenerating, agentName }) => {
    const t = useTranslations();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-850 p-6 rounded-lg border border-slate-700 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-850 py-2 -mt-6 -mx-6 px-6 z-10 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-sky-400"/>
                        {t('psychoanalysis_title')} {agentName && `- ${agentName}`}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-200 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {isGenerating && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <BrainCircuit className="w-16 h-16 text-sky-400 animate-pulse" />
                        <p className="text-lg text-slate-300 mt-4 animate-pulse">{t('psychoanalysis_generating')}</p>
                    </div>
                )}
                
                {report && !isGenerating && (
                    <div className="space-y-6">
                        <ReportSection title={t('report_psychodynamik')} content={report.Psychodynamik} />
                        <ReportSection title={t('report_persoenlichkeitsbild')} content={report.Persönlichkeitsbild} />
                        <ReportSection title={t('report_beziehungsdynamik')} content={report.Beziehungsdynamik} />
                        <ReportSection title={t('report_trauma')} content={report['Traumatische Spuren oder psychische Belastung']} />
                        <ReportSection title={t('report_kultur')} content={report['Kulturelle & spirituelle Verarbeitung']} />
                        <ReportSection title={t('report_projektionen')} content={report['Projektionen oder Verschiebungen']} />
                        <ReportSection title={t('report_empfehlung')} content={report['Therapeutische Empfehlung']} />
                    </div>
                )}
            </div>
        </div>
    );
};
// --- End Psychoanalysis Modal ---

export default function App() {
    const t = useTranslations();
    const {
        worldState,
        logs,
        selectedAgent,
        isGenerating,
        isProcessingSteps,
        isSettingsOpen,
        isGenerateWorldModalOpen,
        isGenerateContentModalOpen,
        isAnalyticsOpen,
        isPsychoanalysisModalOpen,
        psychoanalysisReport,
        isGeneratingAnalysis,
        analyzedAgent,
        panelVisibility,
        setSelectedAgent,
        setIsSettingsOpen,
        setIsGenerateWorldModalOpen,
        setIsGenerateContentModalOpen,
        setIsAnalyticsOpen,
        setIsPsychoanalysisModalOpen,
        togglePanel,
        handlers,
    } = useSimulation();

    const cultureName = useMemo(() => {
        if (!selectedAgent?.cultureId || !worldState.cultures) return t('culture_none');
        return worldState.cultures.find(c => c.id === selectedAgent.cultureId)?.name || t('culture_none');
    }, [selectedAgent?.cultureId, worldState.cultures, t]);

    const religionName = useMemo(() => {
        if (!selectedAgent?.religionId || !worldState.religions) return t('religion_none');
        return worldState.religions.find(r => r.id === selectedAgent.religionId)?.name || t('religion_none');
    }, [selectedAgent?.religionId, worldState.religions, t]);

    const leaderName = useMemo(() => {
        if (!worldState.government?.leaderId) return t('role_none');
        return worldState.agents.find(a => a.id === worldState.government.leaderId)?.name || t('role_none');
    }, [worldState.government?.leaderId, worldState.agents, t]);
    
    const middleIsVisible = panelVisibility.agentCard || panelVisibility.worldMap;

    const gridClasses = useMemo(() => {
        const { left, right } = panelVisibility;
        
        if (left && middleIsVisible && right) return { left: 'lg:col-span-3', middle: 'lg:col-span-6', right: 'lg:col-span-3' };
        if (left && middleIsVisible && !right) return { left: 'lg:col-span-4', middle: 'lg:col-span-8', right: 'hidden' };
        if (!left && middleIsVisible && right) return { left: 'hidden', middle: 'lg:col-span-8', right: 'lg:col-span-4' };
        if (left && !middleIsVisible && right) return { left: 'lg:col-span-6', middle: 'hidden', right: 'lg:col-span-6' };
        if (!left && !middleIsVisible && right) return { left: 'hidden', middle: 'hidden', right: 'lg:col-span-12' };
        if (left && !middleIsVisible && !right) return { left: 'lg:col-span-12', middle: 'hidden', right: 'hidden' };
        if (!left && middleIsVisible && !right) return { left: 'hidden', middle: 'lg:col-span-12', right: 'hidden' };
        
        return { left: 'hidden', middle: 'hidden', right: 'hidden' };
    }, [panelVisibility, middleIsVisible]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans">
      <ProcessingIndicator isOpen={isProcessingSteps} />
      <header className="bg-slate-950/70 backdrop-blur-sm p-4 border-b border-slate-700/50 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-sky-400" />
            <h1 className="text-2xl font-bold text-slate-100 tracking-wider">{t('realitySimAI')}</h1>
            <LanguageSwitcher />
        </div>
        <div className="flex items-center gap-2">
            <ViewTogglePanel visibility={panelVisibility} onToggle={togglePanel} />
            <div className="h-8 w-px bg-slate-700 mx-2"></div>
            <ControlPanel 
                onStep={handlers.handleStep} 
                onRunSteps={handlers.handleRunSteps} 
                onReset={handlers.handleReset} 
                onGenerateWorld={() => setIsGenerateWorldModalOpen(true)} 
                onGenerateContent={() => setIsGenerateContentModalOpen(true)} 
                isGenerating={isGenerating} 
                isProcessing={isProcessingSteps} 
            />
             <button
                onClick={() => setIsAnalyticsOpen(true)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold p-2.5 rounded-md transition-colors"
                aria-label={t('analytics_title')}
            >
                <BarChart2 className="w-5 h-5" />
            </button>
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold p-2.5 rounded-md transition-colors"
                aria-label={t('settings_title')}
            >
                <Settings className="w-5 h-5" />
            </button>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-4 p-4">
        {panelVisibility.left && (
            <div className={`col-span-12 ${gridClasses.left} space-y-4`}>
                <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-sky-400"/>
                        {t('agents')}
                    </h2>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {worldState.agents.map(agent => (
                        <div key={agent.id} className="flex items-center gap-1">
                            <button onClick={() => setSelectedAgent(agent)} className={`flex-grow text-left p-2 rounded-l-md transition-colors ${selectedAgent?.id === agent.id ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-700/50 hover:bg-slate-700'} ${!agent.isAlive ? 'text-slate-500' : ''}`}>
                                {agent.name} {!agent.isAlive && ` (${t('deceased')})`}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handlers.handleDelete('agent', agent.id)}} className={`p-2 text-slate-500 hover:text-red-400 rounded-r-md transition-colors ${selectedAgent?.id === agent.id ? 'bg-sky-500/20' : 'bg-slate-700/50 hover:bg-slate-700'}`}>
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    </div>
                </div>
                <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                        <Boxes className="w-5 h-5 text-sky-400"/>
                        {t('entities')}
                    </h2>
                    <ul className="space-y-1 max-h-[20vh] overflow-y-auto pr-2">
                        {worldState.entities.map((entity) => (
                            <li key={entity.id} className="flex items-center justify-between text-sm p-2 bg-slate-700/50 rounded-md">
                                <span>{entity.name}</span>
                                <button onClick={() => handlers.handleDelete('entity', entity.id)} className="p-1 -mr-1 text-slate-500 hover:text-red-400 rounded-md transition-colors">
                                     <Trash2 className="w-3 h-3" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}

        {middleIsVisible && (
            <div className={`col-span-12 ${gridClasses.middle} space-y-4`}>
              {panelVisibility.agentCard && (
                selectedAgent ? (
                    <AgentCard 
                        agent={selectedAgent} 
                        allAgents={worldState.agents} 
                        entities={worldState.entities} 
                        cultureName={cultureName}
                        religionName={religionName}
                        leaderName={leaderName}
                        onPrompt={handlers.handlePrompt} 
                        onGeneratePsychoanalysis={handlers.handleGeneratePsychoanalysis} 
                    />
                ) : (
                    <div className="bg-slate-850 p-4 rounded-lg border border-slate-700 h-full flex items-center justify-center">
                        <p className="text-slate-400">{t('agentCard_selectAgent')}</p>
                    </div>
                )
              )}
              {panelVisibility.worldMap && (
                <WorldGraph agents={worldState.agents} entities={worldState.entities} environment={worldState.environment} cultures={worldState.cultures || []}/>
              )}
            </div>
        )}

        {panelVisibility.right && (
            <div className={`col-span-12 ${gridClasses.right} space-y-4`}>
                {selectedAgent?.adminAgent ? (
                    <AdminPanel
                        environment={worldState.environment}
                        actions={worldState.actions}
                        agents={worldState.agents}
                        government={worldState.government}
                        cultures={worldState.cultures || []}
                        techTree={worldState.techTree || []}
                        onUpdateEnvironment={handlers.handleUpdateEnvironment}
                        onCreateAction={(data) => handlers.handleCreate('action', data)}
                        onDeleteAction={(name) => handlers.handleDelete('action', name)}
                        onSetAgentHealth={handlers.handleSetAgentHealth}
                        onInflictSickness={handlers.handleInflictSickness}
                        onResurrectAgent={handlers.handleResurrectAgent}
                        onSetAgentPosition={handlers.handleSetAgentPosition}
                        onSetAgentCurrency={handlers.handleSetAgentCurrency}
                        onImprisonAgent={handlers.handleImprisonAgent}
                        onEnactLaw={handlers.handleEnactLaw}
                        onRepealLaw={handlers.handleRepealLaw}
                        onStartElection={handlers.handleStartElection}
                        onSetLeader={handlers.handleSetLeader}
                        onUnlockTech={handlers.handleUnlockTech}
                    />
                ) : (
                    <>
                        <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                                <Microscope className="w-5 h-5 text-emerald-400"/>
                                {t('environment')}
                            </h2>
                            <ul className="space-y-2 text-sm">
                                {Object.entries(worldState.environment).map(([key, value]) => {
                                    if (key === 'election') {
                                        const election = value as any | null;
                                        let displayValue = t('election_status_none');
                                        if (election) {
                                            displayValue = election.isActive 
                                                ? t('election_status_active', { endDate: election.termEndDate }) 
                                                : t('election_status_inactive');
                                        }
                                        
                                        return (
                                             <li key={key} className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Vote className="w-4 h-4 text-slate-400"/>
                                                    <span className="capitalize text-slate-400">{t('election_title')}:</span>
                                                </div>
                                                <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-xs">{displayValue}</span>
                                            </li>
                                        );
                                    }
                                    return (
                                        <li key={key} className="flex justify-between items-center">
                                            <span className="capitalize text-slate-400">{key}:</span>
                                            <span className="font-mono bg-slate-700 px-2 py-0.5 rounded">{String(value)}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-emerald-400"/>
                                {t('availableActions')}
                            </h2>
                            <ul className="space-y-1 max-h-[25vh] overflow-y-auto pr-2">
                                {worldState.actions.map(action => (
                                    <li key={action.name} className="flex items-center justify-between text-xs p-2 bg-slate-700/50 rounded-md">
                                        <span className="truncate pr-2">{action.name}</span>
                                         <button onClick={() => handlers.handleDelete('action', action.name)} className="p-1 -mr-1 text-slate-500 hover:text-red-400 rounded-md transition-colors flex-shrink-0">
                                             <Trash2 className="w-3 h-3" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <CreateObjectPanel onCreate={handlers.handleCreate} />
                    </>
                )}

                <LogPanel logs={logs} />
                <ExporterPanel onExport={handlers.handleExport} onLoad={handlers.handleLoadState} onExportConversations={handlers.handleExportConversations} onExportStatistics={handlers.handleExportStatistics} />
            </div>
        )}
      </main>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <GenerateWorldModal 
        isOpen={isGenerateWorldModalOpen}
        onClose={() => setIsGenerateWorldModalOpen(false)}
        isGenerating={isGenerating}
        onGenerate={async (agentCount, entityCounts) => {
            await handlers.handleGenerateWorld(agentCount, entityCounts);
        }}
       />
       <GenerateContentModal
        isOpen={isGenerateContentModalOpen}
        onClose={() => setIsGenerateContentModalOpen(false)}
        onGenerateAgents={handlers.handleGenerateAgents}
        onGenerateEntities={handlers.handleGenerateEntities}
        isGenerating={isGenerating}
       />
       <PsychoanalysisModal 
        isOpen={isPsychoanalysisModalOpen}
        onClose={() => setIsPsychoanalysisModalOpen(false)}
        report={psychoanalysisReport}
        isGenerating={isGeneratingAnalysis}
        agentName={analyzedAgent?.name || null}
       />
       <AnalyticsDashboard 
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        worldState={worldState}
       />
    </div>
  );
}
```

---

## `hooks/useSimulation.ts`

```typescript

import { useState, useEffect, useCallback } from 'react';
import { RealityEngine } from '../services/simulation';
import type { WorldState, Agent, Entity, EnvironmentState, LogEntry, Culture, Law, Personality, PsychoReport, Election, ActionEffect, LongTermMemory, Relationship, TimedLogEntry } from '../types';
import { initialWorldState, GENOME_OPTIONS, INITIAL_CURRENCY, SKILL_TYPES, defaultPsyche, defaultQTable } from '../constants';
import { generateActionFromPrompt, generateWorld, generateAgents, generateEntities, LmStudioError, generatePsychoanalysis, generateEmbedding } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from './useTranslations';
import { useSettings } from '../contexts/SettingsContext';
import { TranslationKey } from '../translations';


// --- Data Sanitization Helpers ---
const safeParseInt = (val: any, fallback: number): number => {
    const num = parseInt(String(val), 10);
    return isNaN(num) ? fallback : num;
};

const sanitizeObjectToNumber = (obj: any): { [key: string]: number } => {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        return {};
    }
    return Object.entries(obj).reduce((acc, [key, value]) => {
        const num = parseFloat(String(value));
        if (typeof key === 'string' && !isNaN(num)) {
            acc[key] = num;
        }
        return acc;
    }, {} as { [key: string]: number });
};

const sanitizePersonality = (p: any): Personality => {
    const defaults: Personality = { openness: 0.5, conscientiousness: 0.5, extraversion: 0.5, agreeableness: 0.5, neuroticism: 0.5 };
    const sanitized = sanitizeObjectToNumber(p);
    return {
        openness: (sanitized.openness >= 0 && sanitized.openness <= 1) ? sanitized.openness : defaults.openness,
        conscientiousness: (sanitized.conscientiousness >= 0 && sanitized.conscientiousness <= 1) ? sanitized.conscientiousness : defaults.conscientiousness,
        extraversion: (sanitized.extraversion >= 0 && sanitized.extraversion <= 1) ? sanitized.extraversion : defaults.extraversion,
        agreeableness: (sanitized.agreeableness >= 0 && sanitized.agreeableness <= 1) ? sanitized.agreeableness : defaults.agreeableness,
        neuroticism: (sanitized.neuroticism >= 0 && sanitized.neuroticism <= 1) ? sanitized.neuroticism : defaults.neuroticism,
    };
};

const sanitizeAndCreateAgents = (generatedAgents: any[], worldState: WorldState): Agent[] => {
    return generatedAgents.map((geminiAgent: any, index: number) => {
        const beliefNetwork = sanitizeObjectToNumber(geminiAgent.beliefs);
        const personality = sanitizePersonality(geminiAgent.personality);
        
        const defaultSkills = SKILL_TYPES.reduce((acc, skill) => ({ ...acc, [skill]: 1 }), {} as { [key: string]: number });
        const skills = { ...defaultSkills, ...sanitizeObjectToNumber(geminiAgent.skills) };
        
        const defaultEmotions = { happiness: 0.5, sadness: 0.1, anger: 0.1, fear: 0.1, trust: 0.3, love: 0.1 };
        const emotions = { ...defaultEmotions, ...sanitizeObjectToNumber(geminiAgent.emotions) };
        const inventory = typeof geminiAgent.inventory === 'object' && geminiAgent.inventory !== null && !Array.isArray(geminiAgent.inventory) 
            ? sanitizeObjectToNumber(geminiAgent.inventory) 
            : {};

        const x = safeParseInt(geminiAgent.x, Math.floor(Math.random() * worldState.environment.width));
        const y = safeParseInt(geminiAgent.y, Math.floor(Math.random() * worldState.environment.height));
        const age = safeParseInt(geminiAgent.age, 25);
        const hunger = safeParseInt(geminiAgent.hunger, Math.floor(Math.random() * 50));
        const thirst = safeParseInt(geminiAgent.thirst, Math.floor(Math.random() * 50));
        const fatigue = safeParseInt(geminiAgent.fatigue, Math.floor(Math.random() * 50));
        const stress = safeParseInt(geminiAgent.stress, Math.floor(Math.random() * 30));
        const socialStatus = safeParseInt(geminiAgent.socialStatus, Math.floor(Math.random() * 40) + 30);
        const currency = safeParseInt(geminiAgent.currency, INITIAL_CURRENCY);

        return {
            id: `agent-gen-${Date.now()}-${index}`,
            name: String(geminiAgent.name || `Agent ${index + 1}`),
            description: String(geminiAgent.description || 'An agent generated by the AI.'),
            x: Math.max(0, Math.min(worldState.environment.width - 1, x)),
            y: Math.max(0, Math.min(worldState.environment.height - 1, y)),
            beliefNetwork,
            emotions,
            resonance: {},
            socialMemory: [],
            longTermMemory: [],
            lastActions: [],
            adminAgent: false,
            health: 100,
            isAlive: true,
            sickness: null,
            conversationHistory: [],
            age,
            genome: (Array.isArray(geminiAgent.genome) ? geminiAgent.genome : []).filter((g: any) => typeof g === 'string' && GENOME_OPTIONS.includes(g)),
            relationships: {},
            cultureId: geminiAgent.cultureId || null,
            religionId: geminiAgent.religionId || null,
            role: geminiAgent.role || null,
            offspringCount: 0,
            childrenIds: [],
            hunger,
            thirst,
            fatigue,
            inventory,
            personality,
            goals: (Array.isArray(geminiAgent.goals) ? geminiAgent.goals : []).filter((g: any) => typeof g === 'object' && g !== null && g.type && g.description),
            stress,
            socialStatus,
            skills,
            trauma: [],
            psyche: defaultPsyche(),
            currency,
            qTable: defaultQTable(),
            lastStressLevel: stress,
            jailJournal: [],
        };
    });
};

const sanitizeAndCreateEntities = (generatedEntities: any[], worldState: WorldState): Entity[] => {
    return generatedEntities.map((geminiEntity, index) => {
        const x = safeParseInt(geminiEntity.x, Math.floor(Math.random() * worldState.environment.width));
        const y = safeParseInt(geminiEntity.y, Math.floor(Math.random() * worldState.environment.height));
        return {
            id: `entity-gen-${Date.now()}-${index}`,
            name: geminiEntity.name,
            description: geminiEntity.description,
            x: Math.max(0, Math.min(worldState.environment.width - 1, x)),
            y: Math.max(0, Math.min(worldState.environment.height - 1, y)),
            isMarketplace: !!geminiEntity.isMarketplace,
            isJail: !!geminiEntity.isJail,
            isResource: !!geminiEntity.isResource,
            resourceType: geminiEntity.resourceType,
            quantity: safeParseInt(geminiEntity.quantity, 10),
        };
    });
};

export const useSimulation = () => {
    const { settings } = useSettings();
    const [engine, setEngine] = useState(() => new RealityEngine(initialWorldState, settings));
    const [worldState, setWorldState] = useState<WorldState>(engine.getState());
    const [logs, setLogs] = useState<TimedLogEntry[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isProcessingSteps, setIsProcessingSteps] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isGenerateWorldModalOpen, setIsGenerateWorldModalOpen] = useState(false);
    const [isGenerateContentModalOpen, setIsGenerateContentModalOpen] = useState(false);
  
    // Analytics Dashboard
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

    // Psychoanalysis feature
    const [isPsychoanalysisModalOpen, setIsPsychoanalysisModalOpen] = useState(false);
    const [psychoanalysisReport, setPsychoanalysisReport] = useState<PsychoReport | null>(null);
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
    const [analyzedAgent, setAnalyzedAgent] = useState<Agent | null>(null);
  
    // Panel visibility
    const [panelVisibility, setPanelVisibility] = useState({
      left: true,
      agentCard: true,
      worldMap: true,
      right: true,
    });
  
    const t = useTranslations();
    const { language } = useLanguage();
    
    useEffect(() => {
        setEngine(new RealityEngine(engine.getState(), settings));
    }, [settings]);
  
    const addLog = useCallback((logEntry: LogEntry) => {
        const timedLog: TimedLogEntry = { ...logEntry, timestamp: Date.now() };
        setLogs(prevLogs => [timedLog, ...prevLogs].slice(0, 500));
    }, []);
    
    const addRawLog = useCallback((message: string) => {
       addLog({ key: message });
    }, [addLog]);
  
    useEffect(() => {
        addLog({ key: 'log_simulationInitialized' });
    }, [addLog]);
  
    useEffect(() => {
      const selectedAgentFromState = selectedAgent && worldState.agents.find(a => a.id === selectedAgent.id);
      if (!selectedAgentFromState) {
        setSelectedAgent(worldState.agents[0] || null);
      } else {
        if(JSON.stringify(selectedAgent) !== JSON.stringify(selectedAgentFromState)) {
          setSelectedAgent(selectedAgentFromState);
        }
      }
    }, [worldState.agents, selectedAgent]);
  
    const handleStep = useCallback(async () => {
      setIsProcessingSteps(true);
      try {
          const { logs: newLogs } = await engine.step(language);
          setWorldState({ ...engine.getState() });
          newLogs.forEach(log => addLog(log));
          addLog({ key: 'log_simulationStepped' });
      } catch (error) {
          console.error("Error during step processing:", error);
          addRawLog(`Error during step processing: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
          setIsProcessingSteps(false);
      }
    }, [engine, addLog, language, addRawLog]);
  
    const handleRunSteps = useCallback(async (steps: number) => {
      setIsProcessingSteps(true);
      addRawLog(t('log_runningSimulation', { steps }));
      try {
          let allLogs: LogEntry[] = [];
          for (let i = 0; i < steps; i++) {
            const { logs: newLogs } = await engine.step(language);
            allLogs.push(...newLogs);
          }
          setWorldState({ ...engine.getState() });
          
          const logsWithTimestamp = allLogs.map(log => ({ ...log, timestamp: Date.now() }));
  
          setLogs(prevLogs => [...logsWithTimestamp.reverse(), ...prevLogs].slice(0, 500));
          addLog({ key: 'log_simulationRanSteps', params: { steps } });
      } catch (error) {
          console.error("Error during run steps processing:", error);
          addRawLog(`Error during run steps processing: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
          setIsProcessingSteps(false);
      }
    }, [engine, addLog, addRawLog, t, language]);
  
    const handleReset = useCallback(() => {
      const newEngine = new RealityEngine(initialWorldState, settings);
      setEngine(newEngine);
      setWorldState(newEngine.getState());
      setSelectedAgent(newEngine.getState().agents[0] || null);
      setLogs([{ key: 'log_simulationReset', timestamp: Date.now() }]);
    }, [t, settings]);
  
    const isAiConfigured = useCallback(() => {
      return (settings.provider === 'gemini' && process.env.API_KEY) || (!!settings.lmStudioUrl && !!settings.lmStudioModel);
    }, [settings]);
  
    const handleGenerateWorld = useCallback(async (agentCount: number, entityCounts: { [key: string]: number }) => {
      if (!isAiConfigured()) {
          addRawLog(t('log_configure_ai_full'));
          setIsSettingsOpen(true);
          return;
      }
  
      setIsGenerating(true);
      addRawLog(t('log_generatingWorld'));
  
      try {
          const generatedData = await generateWorld(worldState.environment, language, agentCount, entityCounts);
  
          if (!generatedData || !generatedData.agents || !generatedData.entities) throw new Error("Invalid data from world generation.");
          
          const totalEntityCount = Object.values(entityCounts).reduce((sum, val) => sum + val, 0);
          if (generatedData.agents.length !== agentCount || generatedData.entities.length !== totalEntityCount) {
              addRawLog(t('log_worldGenerated_warning', { reqAgents: agentCount, genAgents: generatedData.agents.length, reqEntities: totalEntityCount, genEntities: generatedData.entities.length }));
          }
  
          const newAgents: Agent[] = sanitizeAndCreateAgents(generatedData.agents, worldState);
          const adminAgent = engine.getAgentById('agent-admin');
          
          // Post-processing step to create initial relationships
          const processedPairs = new Set<string>();
          newAgents.forEach(agentA => {
              if (!agentA.relationships) agentA.relationships = {};
              newAgents.forEach(agentB => {
                  if (agentA.id === agentB.id) return;
                  const pairKey = [agentA.id, agentB.id].sort().join('-');
                  if (processedPairs.has(pairKey)) return;

                  const distance = Math.sqrt(Math.pow(agentA.x - agentB.x, 2) + Math.pow(agentA.y - agentB.y, 2));
                  let score = 0;
                  let type: Relationship['type'] = 'stranger';
                  if (distance < 5) {
                      score = 35;
                      type = 'acquaintance';
                  } else if (distance < 10) {
                      score = 15;
                  }

                  if (score > 0) {
                       if (!agentA.relationships) agentA.relationships = {};
                       if (!agentB.relationships) agentB.relationships = {};
                       
                       const relationship = { type, score, disposition: {} };
                       agentA.relationships[agentB.id] = relationship;
                       agentB.relationships[agentA.id] = relationship;
                  }
                  processedPairs.add(pairKey);
              });
          });

          // Post-processing: Make all new agents friends with the Admin
          if (adminAgent) {
              newAgents.forEach(agent => {
                  if (!agent.adminAgent) {
                      if (!agent.relationships) agent.relationships = {};
                      agent.relationships[adminAgent.id] = { type: 'friend', score: 100, disposition: {} };

                      if (!adminAgent.relationships) adminAgent.relationships = {};
                      adminAgent.relationships[agent.id] = { type: 'friend', score: 100, disposition: {} };
                  }
              });
          }

          const newEntities: Entity[] = sanitizeAndCreateEntities(generatedData.entities, worldState);
          
          const finalAgents = adminAgent ? [...newAgents, adminAgent] : newAgents;
  
          const currentEngineState = engine.getState();
          const newWorldState: WorldState = { ...currentEngineState, agents: finalAgents, entities: newEntities };
          
          const newEngine = new RealityEngine(newWorldState, settings);
          setEngine(newEngine);
          setWorldState(newEngine.getState());
          setSelectedAgent(newEngine.getState().agents.find(a => !a.adminAgent) || null);
          addRawLog(t('log_worldGenerated'));
  
      } catch (error) {
          if (error instanceof LmStudioError && error.translationKey) addRawLog(t(error.translationKey as TranslationKey));
          else addRawLog(t('log_aiError', { error: `World generation failed: ${error instanceof Error ? error.message : String(error)}` }));
      } finally {
          setIsGenerating(false);
      }
    }, [engine, addRawLog, t, language, worldState, settings, isAiConfigured]);
  
    const handleGenerateAgents = useCallback(async (count: number) => {
      if (!isAiConfigured()) {
          addRawLog(t('log_configure_ai_full'));
          setIsSettingsOpen(true);
          return;
      }
  
      setIsGenerating(true);
      addRawLog(t('log_generatingAgents', { count }));
      setIsGenerateContentModalOpen(false);
  
      try {
          const generatedData = await generateAgents(worldState.environment, language, count);
          if (!generatedData || !generatedData.agents) throw new Error("Invalid data from agent generation.");
          
          const newAgents = sanitizeAndCreateAgents(generatedData.agents, worldState);
          
          const adminAgent = engine.getAgentById('agent-admin');
          if (adminAgent) {
              newAgents.forEach(agent => {
                  if (!agent.relationships) agent.relationships = {};
                  agent.relationships[adminAgent.id] = { type: 'friend', score: 100, disposition: {} };
                  if (!adminAgent.relationships) adminAgent.relationships = {};
                  adminAgent.relationships[agent.id] = { type: 'friend', score: 100, disposition: {} };
              });
          }
          
          newAgents.forEach(agent => {
              engine.addNewSanitizedAgent(agent);
          });
          setWorldState({ ...engine.getState() });
          
          addRawLog(t('log_addedAgents', { count: newAgents.length }));
  
      } catch (error) {
          if (error instanceof LmStudioError && error.translationKey) addRawLog(t(error.translationKey as TranslationKey));
          else addRawLog(t('log_aiError', { error: `Agent generation failed: ${error instanceof Error ? error.message : String(error)}` }));
      } finally {
          setIsGenerating(false);
      }
    }, [engine, addRawLog, t, language, worldState, settings, isAiConfigured]);
  
    const handleGenerateEntities = useCallback(async (counts: { [key: string]: number }) => {
        if (!isAiConfigured()) {
            addRawLog(t('log_configure_ai_full'));
            setIsSettingsOpen(true);
            return;
        }

        setIsGenerating(true);
        const totalCount = Object.values(counts).reduce((sum, val) => sum + val, 0);
        addRawLog(t('log_generatingEntities', { count: totalCount }));
        setIsGenerateContentModalOpen(false);

        try {
            const generatedData = await generateEntities(worldState.environment, language, counts);
            if (!generatedData || !generatedData.entities) throw new Error("Invalid data from entity generation.");

            const newEntities = sanitizeAndCreateEntities(generatedData.entities, worldState);
            
            newEntities.forEach(entity => {
                engine.addNewSanitizedEntity(entity);
            });
            setWorldState({ ...engine.getState() });

            addRawLog(t('log_addedEntities', { count: newEntities.length }));

        } catch (error) {
            if (error instanceof LmStudioError && error.translationKey) addRawLog(t(error.translationKey as TranslationKey));
            else addRawLog(t('log_aiError', { error: `Entity generation failed: ${error instanceof Error ? error.message : String(error)}` }));
        } finally {
            setIsGenerating(false);
        }
    }, [engine, addRawLog, t, language, worldState, settings, isAiConfigured]);

    const handlePrompt = useCallback(async (agentId: string, prompt: string, useAi: boolean) => {
      const agent = engine.getAgentById(agentId);
      if (!agent) return;

      if (!isAiConfigured()) {
          addRawLog(t('log_configure_ai_full'));
          setIsSettingsOpen(true);
          return;
      }
  
      setIsProcessingSteps(true);
      addLog({ key: 'log_agentProcessingPrompt', params: { agentId, prompt, aiInfo: useAi ? 'AI' : 'Direct' } });
  
      try {
          if (useAi) {
              const memoryDB = engine.searchAgentMemory(agentId, await generateEmbedding(prompt, settings), 5);
              const recalledMemories = memoryDB.map(m => `[T-${worldState.environment.time - m.timestamp}] ${m.content}`);
              const actionName = await generateActionFromPrompt(prompt, engine.getAvailableActions(), agent, worldState, language, recalledMemories);
              if (actionName && actionName !== 'Keine Aktion') {
                  addLog({ key: 'log_aiSuggestedAction', params: { action: actionName } });
                  const { logs: newLogs } = await engine.processAgentPrompt(agentId, actionName);
                  newLogs.forEach(addLog);
              } else {
                  addLog({ key: 'log_aiFailed' });
              }
          } else {
              const { logs: newLogs } = await engine.processAgentPrompt(agentId, prompt);
              newLogs.forEach(addLog);
          }
          setWorldState({ ...engine.getState() });
      } catch (error) {
           if (error instanceof LmStudioError && error.translationKey) addRawLog(t(error.translationKey as TranslationKey));
           else addRawLog(t('log_aiError', { error: (error as Error).message }));
      } finally {
          setIsProcessingSteps(false);
      }
    }, [engine, addLog, t, language, worldState, isAiConfigured, addRawLog, settings]);
  
    const handleExport = (type: 'environment' | 'agents' | 'entities' | 'all') => {
      const state = engine.getState();
      let data;
      let filename = `reality_sim_export_${type}.json`;
      if (type === 'all') {
        data = state;
        filename = `reality_sim_save_${new Date().toISOString()}.json`;
      } else {
        data = state[type];
      }
  
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addLog({ key: type === 'all' ? 'log_stateSaved' : 'log_exported', params: { type } });
    };

    const handleExportConversations = useCallback(() => {
        const state = engine.getState();
        let markdownString = "# Conversation Histories\n\n";

        state.agents.forEach(agent => {
            if (agent.conversationHistory && agent.conversationHistory.length > 0) {
                markdownString += `## Agent: ${agent.name}\n\n`;
                agent.conversationHistory.forEach(h => {
                    markdownString += `- **${h.speakerName}:** "${h.message}"\n`;
                });
                markdownString += `\n---\n\n`;
            }
        });

        const blob = new Blob([markdownString], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reality_sim_conversations_${new Date().toISOString()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addLog({ key: 'export_conversations' as any });
    }, [engine, addLog]);
  
    const handleLoadState = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const loadedState = JSON.parse(event.target?.result as string);
              // Merge with initial state to ensure all keys are present for robustness with older save files
              const mergedState: WorldState = {
                  ...initialWorldState,
                  ...loadedState,
                  environment: { ...initialWorldState.environment, ...(loadedState.environment || {}) },
                  government: { ...initialWorldState.government, ...(loadedState.government || {}) },
                  agents: loadedState.agents || initialWorldState.agents,
                  entities: loadedState.entities || initialWorldState.entities,
                  actions: loadedState.actions || initialWorldState.actions,
                  cultures: loadedState.cultures || initialWorldState.cultures,
                  religions: loadedState.religions || initialWorldState.religions,
                  markets: loadedState.markets || initialWorldState.markets,
                  techTree: loadedState.techTree || initialWorldState.techTree,
                  transactions: loadedState.transactions || initialWorldState.transactions,
              };
              const newEngine = new RealityEngine(mergedState, settings);
              setEngine(newEngine);
              setWorldState(newEngine.getState());
              setSelectedAgent(newEngine.getState().agents[0] || null);
              addLog({ key: 'log_stateLoaded' });
            } catch (error) {
              addLog({ key: 'log_loadError', params: { error: (error as Error).message } });
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    };

    const handleGeneratePsychoanalysis = useCallback(async (agent: Agent) => {
        if (!isAiConfigured()) {
            addRawLog(t('log_configure_ai_full'));
            setIsSettingsOpen(true);
            return;
        }

        setAnalyzedAgent(agent);
        setIsPsychoanalysisModalOpen(true);
        setIsGeneratingAnalysis(true);
        setPsychoanalysisReport(null);

        try {
            const report = await generatePsychoanalysis(agent, worldState, language);
            setPsychoanalysisReport(report);
            if (report) {
                const { logs } = engine.applyPsychoanalysis(agent.id, report);
                logs.forEach(addLog);
                setWorldState({ ...engine.getState() });
            }
        } catch (error) {
             if (error instanceof LmStudioError && error.translationKey) addRawLog(t(error.translationKey as TranslationKey));
             else addRawLog(t('log_aiError', { error: `Psychoanalysis failed: ${error instanceof Error ? error.message : String(error)}` }));
        } finally {
            setIsGeneratingAnalysis(false);
        }
    }, [engine, worldState, language, addLog, addRawLog, t, isAiConfigured]);

    const handleExportStatistics = useCallback(() => {
        const stats = {
            marriages: {} as { [pair: string]: number },
            births: [] as { parents: string, child: string }[],
            imprisonments: {} as { [agent: string]: number },
            fights: {} as { [pair:string]: number },
        };

        // Iterate chronologically
        [...logs].reverse().forEach(log => {
            const p = log.params || {};
            switch (log.key) {
                case 'log_action_accept_proposal_success': {
                    const pair = [p.agentName, p.targetName].sort().join(' & ');
                    stats.marriages[pair] = (stats.marriages[pair] || 0) + 1;
                    break;
                }
                case 'log_new_child': {
                    stats.births.push({
                        parents: [p.parent1Name, p.parent2Name].sort().join(' & '),
                        child: p.childName,
                    });
                    break;
                }
                case 'log_action_arrest_success': {
                    stats.imprisonments[p.criminalName] = (stats.imprisonments[p.criminalName] || 0) + 1;
                    break;
                }
                case 'log_action_fight': {
                    const pair = [p.agentName1, p.agentName2].sort().join(' & ');
                    stats.fights[pair] = (stats.fights[pair] || 0) + 1;
                    break;
                }
            }
        });

        let md = `# ${t('stats_report_title')}\n\n`;

        md += `## ${t('stats_marriages')}\n`;
        if (Object.keys(stats.marriages).length > 0) {
            Object.entries(stats.marriages).forEach(([pair, count]) => {
                md += `- ${pair} (x${count})\n`;
            });
        } else {
            md += `- None\n`;
        }
        md += `\n`;

        md += `## ${t('stats_births')}\n`;
        if (stats.births.length > 0) {
            stats.births.forEach(birth => {
                md += `- ${birth.child} (Parents: ${birth.parents})\n`;
            });
        } else {
            md += `- None\n`;
        }
        md += `\n`;

        md += `## ${t('stats_imprisonments')}\n`;
        if (Object.keys(stats.imprisonments).length > 0) {
            Object.entries(stats.imprisonments)
                .sort((a, b) => b[1] - a[1])
                .forEach(([agent, count]) => {
                    md += `- ${agent}: ${count} times\n`;
                });
        } else {
            md += `- None\n`;
        }
        md += `\n`;

        md += `## ${t('stats_fights')}\n`;
        if (Object.keys(stats.fights).length > 0) {
             Object.entries(stats.fights)
                .sort((a, b) => b[1] - a[1])
                .forEach(([pair, count]) => {
                    md += `- ${pair}: ${count} times\n`;
                });
        } else {
            md += `- None\n`;
        }
        md += `\n`;

        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reality_sim_statistics_${new Date().toISOString()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addLog({ key: 'export_statistics' as any });
    }, [logs, t, addLog]);

    const handleCreate = useCallback((type: 'agent' | 'entity' | 'action', data: any) => {
      if (type === 'agent') {
        engine.addAgent(data.name, data.description, data.beliefs || {}, data.genome || [], data.role, data.personality);
        addLog({ key: 'log_createdAgent', params: { name: data.name } });
      } else if (type === 'entity') {
        engine.addEntity(data.name, data.description);
        addLog({ key: 'log_createdEntity', params: { name: data.name } });
      } else if (type === 'action') {
        engine.addAction(data.name, data.description, data.beliefKey, data.effects);
        addLog({ key: 'log_createdAction', params: { name: data.name } });
      }
      setWorldState({ ...engine.getState() });
    }, [engine, addLog]);
  
    const handleDelete = useCallback((type: 'agent' | 'entity' | 'action', id: string) => {
      const name = type === 'agent' ? worldState.agents.find(a => a.id === id)?.name :
                   type === 'entity' ? worldState.entities.find(e => e.id === id)?.name : id;
                   
      if (window.confirm(t('confirmDelete', { type: t(`type_${type}` as TranslationKey) }))) {
        if (type === 'agent') engine.removeAgent(id);
        else if (type === 'entity') engine.removeEntity(id);
        else if (type === 'action') engine.removeAction(id);
        
        setWorldState({ ...engine.getState() });
        addLog({ key: 'log_removed', params: { type: t(`type_${type}` as TranslationKey), name: name || id } });
      }
    }, [engine, worldState.agents, worldState.entities, addLog, t]);
  
    const handleUpdateEnvironment = useCallback((newEnv: EnvironmentState) => {
      engine.setEnvironment(newEnv);
      setWorldState({ ...engine.getState() });
      addLog({ key: 'log_adminModifiedEnv' });
    }, [engine, addLog]);

    const handleSetAgentHealth = useCallback((agentId: string, health: number) => {
      engine.setAgentHealth(agentId, health);
      const agent = engine.getAgentById(agentId);
      setWorldState({ ...engine.getState() });
      addLog({ key: 'log_adminSetHealth', params: { name: agent?.name, health } });
    }, [engine, addLog]);

    const handleInflictSickness = useCallback((agentId: string, sickness: string | null) => {
      engine.setAgentSickness(agentId, sickness);
      const agent = engine.getAgentById(agentId);
      setWorldState({ ...engine.getState() });
      if(sickness) addLog({ key: 'log_adminInflictedSickness', params: { name: agent?.name, sickness } });
      else addLog({ key: 'log_adminCured', params: { name: agent?.name } });
    }, [engine, addLog]);
    
    const handleResurrectAgent = useCallback((agentId: string) => {
        engine.resurrectAgent(agentId);
        const agent = engine.getAgentById(agentId);
        setWorldState({...engine.getState()});
        addLog({ key: 'log_adminResurrected', params: { name: agent?.name } });
    }, [engine, addLog]);

    const handleSetAgentPosition = useCallback((agentId: string, x: number, y: number) => {
        engine.setAgentPosition(agentId, x, y);
        const agent = engine.getAgentById(agentId);
        setWorldState({...engine.getState()});
        addLog({ key: 'log_adminSetPosition', params: { name: agent?.name, x, y }});
    }, [engine, addLog]);

    const handleSetAgentCurrency = useCallback((agentId: string, currency: number) => {
        engine.setAgentCurrency(agentId, currency);
        const agent = engine.getAgentById(agentId);
        setWorldState({...engine.getState()});
        addLog({ key: 'log_adminSetCurrency', params: { name: agent?.name, currency }});
    }, [engine, addLog]);

    const handleImprisonAgent = useCallback((agentId: string, duration: number) => {
        const success = engine.imprisonAgent(agentId, duration);
        if (success) {
            const agent = engine.getAgentById(agentId);
            setWorldState({ ...engine.getState() });
            addLog({ key: 'log_adminImprisoned', params: { name: agent?.name, duration } });
        }
    }, [engine, addLog]);
    
    const handleEnactLaw = useCallback((law: Law) => {
        engine.enactLaw(law);
        setWorldState({...engine.getState()});
        addLog({ key: 'log_action_enact_law_success', params: { agentName: 'Admin', lawName: law.name }});
    }, [engine, addLog]);

    const handleRepealLaw = useCallback((lawId: string) => {
        const lawName = worldState.government.laws.find(l=>l.id===lawId)?.name || 'Unknown Law';
        engine.repealLaw(lawId);
        setWorldState({...engine.getState()});
        addLog({ key: 'log_adminRepealedLaw', params: { lawName }});
    }, [engine, addLog, worldState.government.laws]);

    const handleStartElection = useCallback(() => {
        engine.startElection();
        setWorldState({...engine.getState()});
        addLog({ key: 'log_election_started' });
    }, [engine, addLog]);

    const handleSetLeader = useCallback((agentId: string) => {
        const agentName = engine.getAgentById(agentId)?.name || 'Unknown';
        const { techUnlocked, cultureName } = engine.setLeader(agentId);
        setWorldState({...engine.getState()});
        addLog({ key: 'log_adminSetLeader', params: { name: agentName }});
        if (techUnlocked) {
            addLog({ key: 'log_leader_unlocks_governance', params: { leaderName: agentName, cultureName } });
        }
    }, [engine, addLog]);

    const handleUnlockTech = useCallback((cultureId: string, techId: string) => {
        engine.unlockTech(cultureId, techId);
        const cultureName = worldState.cultures.find(c=>c.id === cultureId)?.name || 'Unknown';
        setWorldState({...engine.getState()});
        addLog({ key: 'log_adminUnlockedTech', params: { techId, cultureName }});
    }, [engine, addLog, worldState.cultures]);

    const togglePanel = useCallback((panel: keyof typeof panelVisibility) => {
      setPanelVisibility(prev => ({ ...prev, [panel]: !prev[panel] }));
    }, []);

    const handlers = {
        handleStep, handleRunSteps, handleReset, handlePrompt, handleExport, handleLoadState,
        handleExportConversations, handleCreate, handleDelete, handleUpdateEnvironment, 
        handleGenerateWorld, handleGenerateAgents, handleGenerateEntities,
        handleGeneratePsychoanalysis, handleSetAgentHealth, handleInflictSickness, handleResurrectAgent, handleSetAgentPosition,
        handleSetAgentCurrency, handleEnactLaw, handleRepealLaw, handleStartElection, handleSetLeader, handleUnlockTech,
        handleImprisonAgent, handleExportStatistics
    };
    
    return {
        worldState,
        logs,
        selectedAgent,
        isGenerating,
        isProcessingSteps,
        isSettingsOpen,
        isGenerateWorldModalOpen,
        isGenerateContentModalOpen,
        isAnalyticsOpen,
        isPsychoanalysisModalOpen,
        psychoanalysisReport,
        isGeneratingAnalysis,
        analyzedAgent,
        panelVisibility,
        setSelectedAgent,
        setIsSettingsOpen,
        setIsGenerateWorldModalOpen,
        setIsGenerateContentModalOpen,
        setIsAnalyticsOpen,
        setIsPsychoanalysisModalOpen,
        togglePanel,
        handlers,
    };
}
```

---

## `services/actions.ts`

```typescript


import type { Action, Agent, Entity, WorldState, ActionContext, Law } from '../types';
import { findNearestEntity, findNearestAgent, moveTowards, wander } from './simulationUtils';
import { 
    EAT_HUNGER_REDUCTION, DRINK_THIRST_REDUCTION, GATHER_AMOUNT, FATIGUE_RECOVERY_RATE, 
    STRESS_RECOVERY_REST, WORK_FOR_MONEY_AMOUNT, WORK_FOR_OWNER_PAY_WORKER,
    RESOURCE_PURCHASE_COST, RECIPES, RESEARCH_PER_ACTION, MIN_REPRODUCTION_AGE,
    MAX_REPRODUCTION_AGE, MAX_OFFSPRING, ADOLESCENCE_MAX_AGE
} from '../constants';
import { generateAgentConversation } from '../services/geminiService';

const moveAction = (direction: 'North' | 'South' | 'East' | 'West'): Action => ({
    name: `Move ${direction}`,
    description: `Move one step ${direction.toLowerCase()}.`,
    execute: async (agent, allAgents, allEntities, worldState) => {
        const speed = agent.genome.includes("G-AGILE") ? 2 : 1;
        switch (direction) {
            case 'North': agent.y = Math.max(0, agent.y - speed); break;
            case 'South': agent.y = Math.min(worldState.environment.height - 1, agent.y + speed); break;
            case 'East': agent.x = Math.min(worldState.environment.width - 1, agent.x + speed); break;
            case 'West': agent.x = Math.max(0, agent.x - speed); break;
        }
        return { log: { key: 'log_action_move', params: { agentName: agent.name, direction: direction.toLowerCase(), x: agent.x, y: agent.y } }, status: 'neutral', reward: -0.1 };
    }
});

export const availableActions: Action[] = [
    // --- Survival Actions ---
    {
        name: 'Eat Food',
        description: 'Eat food from inventory to reduce hunger.',
        onSuccess: { belief: 'planning_ahead_good', delta: 0.02 },
        execute: async (agent) => {
            if ((agent.inventory['food'] || 0) > 0) {
                const hungerBefore = agent.hunger;
                agent.inventory['food']--;
                agent.hunger = Math.max(0, agent.hunger - EAT_HUNGER_REDUCTION);
                const reward = (hungerBefore - agent.hunger) / 10;
                return { log: { key: 'log_action_eat', params: { agentName: agent.name } }, status: 'success', reward };
            }
            return { log: { key: 'log_action_eat_no_food', params: { agentName: agent.name } }, status: 'failure', reward: -10 };
        }
    },
    {
        name: 'Drink Water',
        description: 'Find a water source and drink to reduce thirst.',
        execute: async (agent, allAgents, allEntities, worldState) => {
            const waterSource = findNearestEntity(agent, allEntities, e => e.isResource === true && e.resourceType === 'water' && e.quantity !== 0);
            if (waterSource && Math.sqrt(Math.pow(agent.x - waterSource.x, 2) + Math.pow(agent.y - waterSource.y, 2)) < 2) {
                const thirstBefore = agent.thirst;
                agent.thirst = Math.max(0, agent.thirst - DRINK_THIRST_REDUCTION);
                const reward = (thirstBefore - agent.thirst) / 10;
                return { log: { key: 'log_action_drink', params: { agentName: agent.name, sourceName: waterSource.name } }, status: 'success', reward };
            } else if (waterSource) {
                moveTowards(agent, waterSource, worldState.environment);
                return { log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: waterSource.name } }, status: 'neutral', reward: 0.5 };
            }
            return { log: { key: 'log_action_drink_no_source', params: { agentName: agent.name } }, status: 'failure', reward: -5 };
        }
    },
    {
        name: 'Gather Food',
        description: 'Gather food from a nearby source.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const foodSource = findNearestEntity(agent, allEntities, e => e.isResource === true && e.resourceType === 'food' && (e.quantity ?? 0) > 0);
            if (foodSource && Math.sqrt(Math.pow(agent.x - foodSource.x, 2) + Math.pow(agent.y - foodSource.y, 2)) < 2) {
                if (foodSource.ownerId && foodSource.ownerId !== agent.id) {
                    return { log: { key: 'log_action_gather_fail_private', params: { agentName: agent.name, resourceName: foodSource.name } }, status: 'failure', reward: -5 };
                }
                const amount = GATHER_AMOUNT;
                foodSource.quantity = Math.max(0, (foodSource.quantity || 0) - amount);
                agent.inventory['food'] = (agent.inventory['food'] || 0) + amount;
                agent.skills.farming = (agent.skills.farming || 0) + 0.5;
                context.logTransaction({ from: foodSource.id, to: agent.id, item: 'food', quantity: amount });
                return { log: { key: 'log_action_gather_food', params: { agentName: agent.name, amount, sourceName: foodSource.name } }, status: 'success', reward: 5 };
            } else if (foodSource) {
                 moveTowards(agent, foodSource, worldState.environment);
                 return { log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: foodSource.name } }, status: 'neutral', reward: 0.5 };
            }
            return { log: { key: 'log_action_gather_food_no_source', params: { agentName: agent.name } }, status: 'failure', reward: -2 };
        }
    },
     {
        name: 'Gather Wood',
        description: 'Gather wood from a nearby forest.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const woodSource = findNearestEntity(agent, allEntities, e => e.isResource === true && e.resourceType === 'wood' && (e.quantity ?? 0) > 0);
            if (woodSource && Math.sqrt(Math.pow(agent.x - woodSource.x, 2) + Math.pow(agent.y - woodSource.y, 2)) < 2) {
                if (woodSource.ownerId && woodSource.ownerId !== agent.id) {
                    return { log: { key: 'log_action_gather_fail_private', params: { agentName: agent.name, resourceName: woodSource.name }}, status: 'failure', reward: -5 };
                }
                const amount = GATHER_AMOUNT;
                woodSource.quantity = Math.max(0, (woodSource.quantity || 0) - amount);
                agent.inventory['wood'] = (agent.inventory['wood'] || 0) + amount;
                agent.skills.woodcutting = (agent.skills.woodcutting || 0) + 0.5;
                context.logTransaction({ from: woodSource.id, to: agent.id, item: 'wood', quantity: amount });
                return { log: { key: 'log_action_gather_wood', params: { agentName: agent.name, amount, sourceName: woodSource.name } }, status: 'success', reward: 5 };
            } else if (woodSource) {
                 moveTowards(agent, woodSource, worldState.environment);
                 return { log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: woodSource.name } }, status: 'neutral', reward: 0.5 };
            }
            return { log: { key: 'log_action_gather_wood_no_source', params: { agentName: agent.name } }, status: 'failure', reward: -2 };
        }
    },
    {
        name: 'Build Shelter',
        description: 'Build a small shelter using 10 wood.',
        execute: async (agent) => {
            const woodCost = 10;
            if ((agent.inventory['wood'] || 0) >= woodCost) {
                agent.inventory['wood'] -= woodCost;
                agent.skills.construction = (agent.skills.construction || 0) + 2;
                const newShelter: Partial<Entity> = {
                    name: `${agent.name}'s Shelter`,
                    description: 'A simple, self-made shelter.',
                    x: agent.x,
                    y: agent.y,
                    ownerId: agent.id,
                };
                return { 
                    log: { key: 'log_action_build_shelter', params: { agentName: agent.name } },
                    sideEffects: { createEntity: newShelter },
                    status: 'success',
                    reward: 20
                };
            }
            return { log: { key: 'log_action_build_shelter_no_wood', params: { agentName: agent.name, woodCost } }, status: 'failure', reward: -2 };
        }
    },
    {
        name: 'Rest',
        description: 'Rest to recover fatigue and health.',
        execute: async (agent) => {
            let healthGain = 10;
            if (agent.genome.includes("G-FASTHEAL")) healthGain = 15;
            const healthBefore = agent.health;
            agent.health = Math.min(100, agent.health + healthGain);
            const fatigueBefore = agent.fatigue;
            agent.fatigue = Math.max(0, agent.fatigue - FATIGUE_RECOVERY_RATE);
            agent.stress = Math.max(0, agent.stress - STRESS_RECOVERY_REST);
            
            const reward = ((agent.health - healthBefore) + (fatigueBefore - agent.fatigue)) / 10;
            
            if (agent.sickness && Math.random() < 0.2) {
                const curedSickness = agent.sickness;
                agent.sickness = null;
                return { log: { key: 'log_action_rest_and_cured', params: { agentName: agent.name, sickness: curedSickness } }, status: 'success', reward: reward + 30 };
            }

            return { log: { key: 'log_action_rest', params: { agentName: agent.name, newHealth: agent.health.toFixed(0) } }, status: 'success', reward };
        }
    },

    // --- Economic Actions ---
    {
        name: 'Work for money',
        description: 'Perform a day of generic labor to earn a small amount of currency.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            agent.currency += WORK_FOR_MONEY_AMOUNT;
            agent.fatigue = Math.min(100, agent.fatigue + 20);
            context.logTransaction({ from: 'WORLD', to: agent.id, item: 'currency', quantity: WORK_FOR_MONEY_AMOUNT });
            return { log: { key: 'log_action_work_for_money', params: { agentName: agent.name, amount: WORK_FOR_MONEY_AMOUNT }}, status: 'success', reward: WORK_FOR_MONEY_AMOUNT / 2 };
        }
    },
    {
        name: 'Found Company',
        description: "Buy an unowned resource-producing entity to become an entrepreneur.",
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const property = findNearestEntity(agent, allEntities, e => e.isResource && !e.ownerId);
            if (property && agent.currency >= RESOURCE_PURCHASE_COST) {
                agent.currency -= RESOURCE_PURCHASE_COST;
                property.ownerId = agent.id;
                agent.role = 'Entrepreneur';
                agent.socialStatus = Math.min(100, agent.socialStatus + 15);
                context.logTransaction({ from: agent.id, to: 'WORLD', item: 'currency', quantity: RESOURCE_PURCHASE_COST });
                return { log: { key: 'log_action_found_company_success', params: { agentName: agent.name, resourceName: property.name, cost: RESOURCE_PURCHASE_COST }}, status: 'success', reward: 50 };
            }
            if (!property) {
                return { log: { key: 'log_action_found_company_fail_none', params: { agentName: agent.name }}, status: 'failure', reward: -5 };
            }
            return { log: { key: 'log_action_found_company_fail_funds', params: { agentName: agent.name, cost: RESOURCE_PURCHASE_COST }}, status: 'failure', reward: -5 };
        }
    },
    {
        name: 'Work for Company',
        description: "Work at a privately owned company to earn a wage from the owner.",
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const company = findNearestEntity(agent, allEntities, e => !!e.isResource && !!e.ownerId && e.ownerId !== agent.id);
            if (!company) {
                return { log: { key: 'log_action_work_for_company_fail_none', params: { agentName: agent.name }}, status: 'failure', reward: -2 };
            }

            if ((company.quantity || 0) <= 0) {
                return { log: { key: 'log_action_work_for_company_fail_no_resources', params: { agentName: agent.name, resourceName: company.name }}, status: 'failure', reward: -2 };
            }
            
            const owner = allAgents.get(company.ownerId!);
            if (!owner) {
                return { log: { key: 'log_action_work_for_company_fail_no_owner', params: { agentName: agent.name }}, status: 'failure', reward: -2 };
            }
            
            if (owner.currency < WORK_FOR_OWNER_PAY_WORKER) {
                return { log: { key: 'log_action_work_for_company_fail_owner_broke', params: { agentName: agent.name, ownerName: owner.name }}, status: 'failure', reward: -2 };
            }

            owner.currency -= WORK_FOR_OWNER_PAY_WORKER;
            agent.currency += WORK_FOR_OWNER_PAY_WORKER;
            agent.fatigue = Math.min(100, agent.fatigue + 15);
            owner.inventory[company.resourceType!] = (owner.inventory[company.resourceType!] || 0) + GATHER_AMOUNT;
            company.quantity = Math.max(0, company.quantity! - GATHER_AMOUNT);

            context.logTransaction({ from: owner.id, to: agent.id, item: 'currency', quantity: WORK_FOR_OWNER_PAY_WORKER });
            context.logTransaction({ from: company.id, to: owner.id, item: company.resourceType!, quantity: GATHER_AMOUNT });

            return { log: { key: 'log_action_work_for_company_success', params: { agentName: agent.name, resourceName: company.name, ownerName: owner.name, wage: WORK_FOR_OWNER_PAY_WORKER }}, status: 'success', reward: WORK_FOR_OWNER_PAY_WORKER / 2 };
        }
    },
    {
        name: 'Mine Iron',
        description: 'Mine iron from a nearby ore vein.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const ironSource = findNearestEntity(agent, allEntities, e => e.isResource === true && e.resourceType === 'iron' && (e.quantity ?? 0) > 0);
            if (ironSource && Math.sqrt(Math.pow(agent.x - ironSource.x, 2) + Math.pow(agent.y - ironSource.y, 2)) < 2) {
                if (ironSource.ownerId && ironSource.ownerId !== agent.id) {
                    return { log: { key: 'log_action_gather_fail_private', params: { agentName: agent.name, resourceName: ironSource.name } }, status: 'failure', reward: -5 };
                }
                const amount = GATHER_AMOUNT;
                ironSource.quantity = Math.max(0, (ironSource.quantity || 0) - amount);
                agent.inventory['iron'] = (agent.inventory['iron'] || 0) + amount;
                agent.skills.mining = (agent.skills.mining || 0) + 0.5;
                context.logTransaction({ from: ironSource.id, to: agent.id, item: 'iron', quantity: amount });
                return { log: { key: 'log_action_mine_iron', params: { agentName: agent.name, amount, sourceName: ironSource.name } }, status: 'success', reward: 5 };
            } else if (ironSource) {
                 moveTowards(agent, ironSource, worldState.environment);
                 return { log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: ironSource.name } }, status: 'neutral', reward: 0.5 };
            }
            return { log: { key: 'log_action_mine_iron_no_source', params: { agentName: agent.name } }, status: 'failure', reward: -2 };
        }
    },

    // --- Crafting Actions ---
    ...RECIPES.map((recipe): Action => ({
        name: recipe.name,
        description: `Crafts ${recipe.output.item} from ingredients.`,
        execute: async (agent, allAgents, allEntities, worldState) => {
            const agentCulture = worldState.cultures.find(c => c.id === agent.cultureId);
            if (recipe.requiredTech && (!agentCulture || !agentCulture.knownTechnologies.includes(recipe.requiredTech))) {
                return { log: { key: 'log_action_craft_fail_tech', params: { agentName: agent.name, tech: worldState.techTree.find(t=>t.id === recipe.requiredTech)?.name || recipe.requiredTech }}, status: 'failure', reward: -1 };
            }
            if (recipe.requiredSkill && (agent.skills[recipe.requiredSkill.skill] || 0) < recipe.requiredSkill.level) {
                return { log: { key: 'log_action_craft_fail_skill', params: { agentName: agent.name, skill: recipe.requiredSkill.skill, level: recipe.requiredSkill.level }}, status: 'failure', reward: -1 };
            }
            const hasIngredients = Object.entries(recipe.ingredients).every(([item, quantity]) => (agent.inventory[item] || 0) >= quantity!);
            if (hasIngredients) {
                Object.entries(recipe.ingredients).forEach(([item, quantity]) => {
                    agent.inventory[item] -= quantity!;
                });
                agent.inventory[recipe.output.item] = (agent.inventory[recipe.output.item] || 0) + recipe.output.quantity;
                agent.skills.crafting = (agent.skills.crafting || 0) + 1.0;
                return { log: { key: 'log_action_craft_success', params: { agentName: agent.name, itemName: recipe.output.item }}, status: 'success', reward: 15 };
            }
            return { log: { key: 'log_action_craft_fail_ingredients', params: { agentName: agent.name, itemName: recipe.output.item }}, status: 'failure', reward: -3 };
        }
    })),

    // --- Market Actions ---
    {
        name: 'List Item on Market',
        description: 'List an item from inventory on the public market.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const marketplace = findNearestEntity(agent, allEntities, e => e.isMarketplace === true);
            if (!marketplace || Math.sqrt(Math.pow(agent.x - marketplace.x, 2) + Math.pow(agent.y - marketplace.y, 2)) > 5) {
                return { log: { key: 'log_action_market_too_far', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
    
            const itemToSell = Object.keys(agent.inventory).find(item => agent.inventory[item] > 0);
            if (itemToSell) {
                agent.inventory[itemToSell]--;
                context.addListingToMarket(marketplace.id, { fromAgentId: agent.id, item: itemToSell as any, quantity: 1 });
                return { log: { key: 'log_action_market_list_item', params: { agentName: agent.name, item: itemToSell, price: context.marketPrices[itemToSell] || 0 }}, status: 'success', reward: 5 };
            }
            return { log: { key: 'log_action_market_no_items', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
        }
    },
    {
        name: 'Buy from Market',
        description: 'Buy an item listed on the market.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const marketplace = findNearestEntity(agent, allEntities, e => e.isMarketplace === true);
            if (!marketplace || Math.sqrt(Math.pow(agent.x - marketplace.x, 2) + Math.pow(agent.y - marketplace.y, 2)) > 5) {
                return { log: { key: 'log_action_market_too_far', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
            const market = worldState.markets.find(m => m.id === marketplace.id);
            if (!market || market.listings.length === 0) {
                return { log: { key: 'log_action_market_is_empty', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
    
            const affordableListing = market.listings.find(l => agent.currency >= (context.marketPrices[l.item] || 9999) * l.quantity);
            if (affordableListing) {
                const seller = allAgents.get(affordableListing.fromAgentId);
                context.executeTrade(agent, affordableListing);
                return { log: { key: 'log_action_market_buy_item', params: { agentName: agent.name, item: affordableListing.item, sellerName: seller?.name || 'Unknown', price: context.marketPrices[affordableListing.item] || 0 }}, status: 'success', reward: 5 };
            }
            return { log: { key: 'log_action_market_cannot_afford', params: { agentName: agent.name }}, status: 'failure', reward: -2 };
        }
    },

    // --- Political Actions ---
    {
        name: 'Vote',
        description: 'Vote for a candidate in the current election.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const election = worldState.environment.election;
            if (!election || !election.isActive) {
                return { log: { key: 'log_action_vote_no_election', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
            if (election.candidates.length === 0) {
                return { log: { key: 'log_action_vote_no_candidates', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
            const candidates = election.candidates.map(id => allAgents.get(id)!).filter(Boolean);
            const bestCandidate = candidates.sort((a,b) => b.socialStatus - a.socialStatus)[0];
    
            if (bestCandidate) {
                context.castVote(bestCandidate.id);
                return { log: { key: 'log_action_vote_cast', params: { agentName: agent.name, candidateName: bestCandidate.name }}, status: 'success', reward: 2 };
            }
            return { log: { key: 'log_action_vote_undecided', params: { agentName: agent.name }}, status: 'neutral', reward: 0 };
        }
    },
    {
        name: 'Run for Election',
        description: 'Declare candidacy in the current election.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const election = worldState.environment.election;
            if (!election || !election.isActive) {
                return { log: { key: 'log_action_run_for_election_no_election', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
            if (election.candidates.includes(agent.id)) {
                return { log: { key: 'log_action_run_for_election_already_running', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
            if (agent.socialStatus < 50) {
                return { log: { key: 'log_action_run_for_election_low_status', params: { agentName: agent.name }}, status: 'failure', reward: -2 };
            }
            context.declareCandidacy(agent.id);
            agent.socialStatus += 5;
            return { log: { key: 'log_action_run_for_election_success', params: { agentName: agent.name }}, status: 'success', reward: 10 };
        }
    },
    {
        name: 'Enact Law',
        description: 'As a leader, enact a new law.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            if (worldState.government.leaderId !== agent.id) {
                return { log: { key: 'log_action_enact_law_not_leader', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
            const agentCulture = worldState.cultures.find(c => c.id === agent.cultureId);
            if (!agentCulture || !agentCulture.knownTechnologies.includes('governance')) {
                 return { log: { key: 'log_action_craft_fail_tech', params: { agentName: agent.name, tech: 'Governance' }}, status: 'failure', reward: -1 };
            }
            const newLawName = "Curfew";
            const newLawAction = "Wander";
            if (worldState.government.laws.some(l => l.name === newLawName)) {
                return { log: { key: 'log_action_enact_law_exists', params: { agentName: agent.name, lawName: newLawName }}, status: 'failure', reward: -1 };
            }
            const newLaw: Law = { id: `law-${Date.now()}`, name: newLawName, description: 'No wandering at night.', violatingAction: newLawAction, punishment: { type: 'fine', amount: 10 } };
            context.enactLaw(newLaw);
            return { log: { key: 'log_action_enact_law_success', params: { agentName: agent.name, lawName: newLaw.name }}, status: 'success', reward: 10 };
        }
    },

    // --- Tech & Social Actions ---
    {
        name: 'Research',
        description: 'Contribute to cultural research.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            if (agent.role !== 'Scientist') return { log: { key: 'log_action_fail_role', params: { agentName: agent.name, requiredRole: 'Scientist' } }, status: 'failure', reward: -1 };
            if (!agent.cultureId) return { log: { key: 'log_action_research_no_culture', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            
            let researchPoints = RESEARCH_PER_ACTION;
            if (agent.genome.includes("G-INTELLIGENT")) researchPoints *= 1.5;
            if ((agent.psyche.inspiration || 0) > 0.7) researchPoints *= 2;
    
            context.addResearchPoints(agent.cultureId, researchPoints);
            agent.psyche.inspiration = Math.max(0, (agent.psyche.inspiration || 0) - 0.2);
            return { log: { key: 'log_action_research', params: { agentName: agent.name, points: researchPoints.toFixed(0) }}, status: 'success', reward: researchPoints / 5 };
        }
    },
    {
        name: 'Share Knowledge',
        description: 'Collaborate with another scientist to boost research.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            if (agent.role !== 'Scientist' || !agent.cultureId) return { log: { key: 'log_action_fail_role', params: { agentName: agent.name, requiredRole: 'Scientist' } }, status: 'failure', reward: -1 };
            const otherScientist = findNearestAgent(agent, allAgents, a => a.isAlive && a.role === 'Scientist' && a.cultureId === agent.cultureId);
            if (otherScientist) {
                context.addResearchPoints(agent.cultureId, 15); // Bonus for collaboration
                return { log: { key: 'log_action_share_knowledge', params: { agentName1: agent.name, agentName2: otherScientist.name }}, status: 'success', reward: 5 };
            }
            return { log: { key: 'log_action_share_knowledge_no_one', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
        }
    },
    {
        name: 'Propose Marriage',
        description: 'Propose marriage to a suitable nearby agent.',
        execute: async (agent, allAgents) => {
            const isMarried = Object.values(agent.relationships).some(r => r.type === 'spouse');
            if (isMarried) return { log: { key: 'log_action_propose_fail_already_married', params: { agentName: agent.name } }, status: 'failure', reward: -2 };
            const target = findNearestAgent(agent, allAgents, a => 
                a.isAlive && 
                !Object.values(a.relationships).some(r => r.type === 'spouse') &&
                (agent.relationships[a.id]?.score || 0) > 70
            );

            if (target) {
                if (Math.random() < 0.7) { 
                     agent.relationships[target.id].type = 'spouse';
                     target.relationships[agent.id] = { type: 'spouse', score: 100, disposition: {} };
                     return { log: { key: 'log_action_accept_proposal_success', params: { agentName: target.name, targetName: agent.name }}, status: 'success', reward: 50 };
                }
                return { log: { key: 'log_action_propose_marriage_fail', params: { agentName: agent.name, targetName: target.name }}, status: 'failure', reward: -10 };
            }
            return { log: { key: 'log_action_propose_no_one_suitable', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
        }
    },
    {
        name: 'Accept Proposal',
        description: 'Accept a marriage proposal.',
        execute: async (agent) => {
            // This action is now implicitly handled by "Propose Marriage" for simplicity.
            return { log: { key: 'log_action_accept_proposal_none', params: { agentName: agent.name }}, status: 'neutral', reward: 0 };
        }
    },
    {
        name: 'Reproduce',
        description: 'Attempt to have a child with a spouse.',
        execute: async (agent, allAgents) => {
            const partnerEntry = Object.entries(agent.relationships).find(([, rel]) => rel.type === 'spouse');
            if (!partnerEntry) return { log: { key: 'log_action_reproduce_no_partner', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            
            const partner = allAgents.get(partnerEntry[0]);
            if (!partner || !partner.isAlive) return { log: { key: 'log_action_reproduce_no_partner', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            
            if (agent.age < MIN_REPRODUCTION_AGE || agent.age > MAX_REPRODUCTION_AGE || partner.age < MIN_REPRODUCTION_AGE || partner.age > MAX_REPRODUCTION_AGE) {
                return { log: { key: 'log_action_reproduce_fail_age', params: { agentName: agent.name, partnerName: partner.name }}, status: 'failure', reward: -1 };
            }
            if (agent.offspringCount >= MAX_OFFSPRING) {
                 return { log: { key: 'log_action_reproduce_fail_max_offspring', params: { agentName: agent.name, partnerName: partner.name }}, status: 'failure', reward: 0 };
            }

            if (Math.random() > 0.5) {
                agent.offspringCount++;
                partner.offspringCount++;
                return { 
                    log: { key: 'log_action_reproduce_success', params: { agentName: agent.name, partnerName: partner.name }},
                    sideEffects: { createAgent: { description: 'A newborn child.', parents: [agent, partner] } },
                    status: 'success',
                    reward: 100
                };
            }
            return { log: { key: 'log_action_reproduce_fail', params: { agentName: agent.name, partnerName: partner.name }}, status: 'failure', reward: -5 };
        }
    },
    {
        name: 'Artificial Insemination',
        description: 'Use advanced technology to conceive a child.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const agentCulture = worldState.cultures.find(c => c.id === agent.cultureId);
            if (!agentCulture || !agentCulture.knownTechnologies.includes('bioengineering')) {
                 return { log: { key: 'log_action_craft_fail_tech', params: { agentName: agent.name, tech: 'Bioengineering' }}, status: 'failure', reward: -1 };
            }
            const cost = 500;
            if (agent.currency < cost) {
                return { log: { key: 'log_action_insemination_fail_funds', params: { agentName: agent.name, cost }}, status: 'failure', reward: -5 };
            }
            agent.currency -= cost;
            context.logTransaction({ from: agent.id, to: 'WORLD', item: 'currency', quantity: cost });
            if (Math.random() > 0.3) {
                 agent.offspringCount++;
                return { 
                    log: { key: 'log_action_insemination_success', params: { agentName: agent.name }},
                    sideEffects: { createAgent: { description: 'A child of science.', parents: [agent, agent] } },
                    status: 'success',
                    reward: 80
                };
            }
            return { log: { key: 'log_action_insemination_fail', params: { agentName: agent.name }}, status: 'failure', reward: -20 };
        }
    },
    {
        name: 'Mentor young agent',
        description: 'Teach a skill to a younger agent.',
        execute: async (agent, allAgents) => {
            const student = findNearestAgent(agent, allAgents, a => a.isAlive && a.age < ADOLESCENCE_MAX_AGE);
            const bestSkill = Object.entries(agent.skills).sort((a,b) => b[1] - a[1])[0];
            if (!student || !bestSkill) return { log: { key: 'log_action_mentor_no_one', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            if (bestSkill[1] < 20) return { log: { key: 'log_action_mentor_fail_skill', params: { agentName: agent.name }}, status: 'failure', reward: -1 };

            student.skills[bestSkill[0]] = (student.skills[bestSkill[0]] || 0) + 1.5;
            agent.socialStatus += 1;
            return { log: { key: 'log_action_mentor_success', params: { mentorName: agent.name, studentName: student.name, skill: bestSkill[0] }}, status: 'success', reward: 15 };
        }
    },
    {
        name: 'Seek Counseling',
        description: 'Seek help from a counselor to reduce stress.',
        execute: async (agent, allAgents, allEntities, worldState) => {
            const counselor = findNearestAgent(agent, allAgents, a => a.isAlive && a.role === 'Counselor');
            if (counselor) {
                 moveTowards(agent, counselor, worldState.environment);
                 return { log: { key: 'log_action_seek_counseling', params: { agentName: agent.name, counselorName: counselor.name }}, status: 'neutral', reward: 0.5 };
            }
            return { log: { key: 'log_action_seek_counseling_fail', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
        }
    },
    {
        name: 'Provide Counseling',
        description: 'As a counselor, help an agent reduce stress.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            if (agent.role !== 'Counselor') return { log: { key: 'log_action_fail_role', params: { agentName: agent.name, requiredRole: 'Counselor' } }, status: 'failure', reward: -1 };
            const patient = findNearestAgent(agent, allAgents, a => a.isAlive && a.stress > 50);
            if (patient) {
                const stressBefore = patient.stress;
                patient.stress = Math.max(0, patient.stress - 30);
                agent.skills.healing = (agent.skills.healing || 0) + 0.5;
                const payment = 5;
                patient.currency -= payment;
                agent.currency += payment;
                context.logTransaction({ from: patient.id, to: agent.id, item: 'currency', quantity: payment });
                return { log: { key: 'log_action_provide_counseling_success', params: { counselorName: agent.name, patientName: patient.name }}, status: 'success', reward: (stressBefore - patient.stress) / 2 };
            }
            return { log: { key: 'log_action_provide_counseling_fail', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
        }
    },
    {
        name: 'Talk',
        description: 'Talk to a nearby agent or move towards them to talk.',
        onSuccess: { belief: 'social_interaction_good', delta: 0.01 },
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const nearestAgent = findNearestAgent(agent, allAgents, a => a.isAlive && !a.adminAgent);

            if (!nearestAgent) {
                return { log: { key: 'log_action_talk_no_one_near', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }

            const distance = Math.sqrt(Math.pow(agent.x - nearestAgent.x, 2) + Math.pow(agent.y - nearestAgent.y, 2));

            if (distance < 5) { // If close enough, talk
                const conversationResult = await generateAgentConversation(agent, nearestAgent, agent.conversationHistory, worldState, context.language);
            
                if (!conversationResult || !conversationResult.dialogue) {
                     return { log: { key: 'log_action_talk_failed', params: { agentName: agent.name } }, status: 'failure', reward: -2 };
                }
    
                const { dialogue } = conversationResult;
                
                agent.conversationHistory.push({ speakerName: agent.name, message: dialogue });
                if(agent.conversationHistory.length > 10) agent.conversationHistory.shift();
    
                nearestAgent.conversationHistory.push({ speakerName: agent.name, message: dialogue });
                if(nearestAgent.conversationHistory.length > 10) nearestAgent.conversationHistory.shift();
                
                context.addSocialMemory(agent.id, { agentId: nearestAgent.id, action: 'Talk', result: 'initiated', emotionalImpact: 0.1, timestamp: worldState.environment.time });
                context.addSocialMemory(nearestAgent.id, { agentId: agent.id, action: 'Talk', result: 'reciprocated', emotionalImpact: 0.1, timestamp: worldState.environment.time });
    
                return { log: { key: 'log_action_talk', params: { speakerName: agent.name, listenerName: nearestAgent.name, dialogue } }, status: 'success', reward: 5 };
            } else { // If not close enough, move towards them
                moveTowards(agent, nearestAgent, worldState.environment);
                return { log: { key: 'log_action_move_towards_agent', params: { agentName: agent.name, targetName: nearestAgent.name } }, status: 'neutral', reward: 1 };
            }
        }
    },
    {
        name: 'Fight',
        description: 'Fight with a nearby agent.',
        beliefKey: 'aggression',
        execute: async (agent, allAgents) => {
            const target = findNearestAgent(agent, allAgents, a => a.isAlive && !a.adminAgent);
            if (!target) {
                return { log: { key: 'log_action_talk_no_one_near', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }
            
            const agentHealthBefore = agent.health;
            const targetHealthBefore = target.health;

            const agentCombatSkill = agent.skills.combat || 1;
            const targetCombatSkill = target.skills.combat || 1;
            const agentDamage = Math.max(1, Math.round(5 * (agentCombatSkill / (targetCombatSkill + 1)) * Math.random()));
            const targetDamage = Math.max(1, Math.round(5 * (targetCombatSkill / (agentCombatSkill + 1)) * Math.random()));

            agent.health -= targetDamage;
            target.health -= agentDamage;

            const reward = (agent.health - agentHealthBefore) + (targetHealthBefore - target.health); // Reward is net damage dealt
            
            return { log: { key: 'log_action_fight', params: { agentName1: agent.name, agentName2: target.name } }, status: 'neutral', reward };
        }
    },
    {
        name: 'Steal',
        description: 'Attempt to steal from a nearby agent.',
        onSuccess: { belief: 'immorality_ok', delta: 0.05 },
        onFailure: { belief: 'immorality_ok', delta: -0.05 },
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const victim = findNearestAgent(agent, allAgents, a => a.isAlive && !a.adminAgent && (Object.keys(a.inventory).length > 0 || a.currency > 0));
            if(!victim) return { log: { key: 'log_action_steal_no_target', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            
            // Failure case: Got caught
            if(Math.random() < 0.5) {
                context.addSocialMemory(agent.id, { agentId: victim.id, action: 'Steal', result: 'rejected', emotionalImpact: -0.5, timestamp: worldState.environment.time });
                context.addSocialMemory(victim.id, { agentId: agent.id, action: 'Steal', result: 'observed', emotionalImpact: -0.3, timestamp: worldState.environment.time });

                // NEW: Check for nearby guards and apply punishment
                const law = worldState.government.laws.find(l => l.violatingAction === 'Steal');
                const nearbyGuards = Array.from(allAgents.values()).filter(a => a.role === 'Guard' && a.isAlive && Math.sqrt(Math.pow(agent.x - a.x, 2) + Math.pow(agent.y - a.y, 2)) < 5);
                
                if (law && nearbyGuards.length > 0) {
                     const guard = nearbyGuards[0];
                     agent.socialStatus = Math.max(0, agent.socialStatus - 15);
                     agent.emotions.shame = Math.min(1, (agent.emotions.shame || 0) + 0.5);
                     if (law.punishment.type === 'fine') {
                         context.logTransaction({ from: agent.id, to: 'WORLD', item: 'currency', quantity: law.punishment.amount });
                         agent.currency = Math.max(0, agent.currency - law.punishment.amount);
                         return { log: { key: 'log_law_violation', params: { agentName: agent.name, lawName: law.name, punishment: law.punishment.amount } }, status: 'failure', reward: -30 };
                     } else if (law.punishment.type === 'arrest') {
                         const jail = findNearestEntity(agent, allEntities, e => e.isJail === true);
                         if (jail) {
                             agent.x = jail.x;
                             agent.y = jail.y;
                             agent.imprisonedUntil = worldState.environment.time + law.punishment.amount;
                             jail.inmates = [...(jail.inmates || []), agent.id];
                             return { log: { key: 'log_action_arrest_success', params: { guardName: guard.name, criminalName: agent.name } }, status: 'failure', reward: -50 };
                         }
                     }
                }
                
                return { log: { key: 'log_action_steal_fail', params: { stealer: agent.name, victim: victim.name } }, status: 'failure', reward: -20 };
            }
            
            // Success case
            const stolenItem = Object.keys(victim.inventory).find(i => victim.inventory[i] > 0);
            if(stolenItem) {
                victim.inventory[stolenItem]--;
                if(victim.inventory[stolenItem] <= 0) delete victim.inventory[stolenItem];
                agent.inventory[stolenItem] = (agent.inventory[stolenItem] || 0) + 1;
                context.logTransaction({ from: victim.id, to: agent.id, item: stolenItem as any, quantity: 1 });
                return { log: { key: 'log_action_steal_success', params: { stealer: agent.name, victim: victim.name, item: stolenItem } }, status: 'success', reward: 15 };
            }
             return { log: { key: 'log_action_steal_fail', params: { stealer: agent.name, victim: victim.name } }, status: 'failure', reward: -10 };
        }
    },

    // --- Personal/Psychological Actions ---
    {
        name: 'Meditate',
        description: 'Meditate to reduce stress and find inspiration.',
        execute: async (agent) => {
            const stressBefore = agent.stress;
            agent.stress = Math.max(0, agent.stress - 15);
            let reward = (stressBefore - agent.stress) / 5;

            if (Math.random() < 0.2) {
                agent.psyche.inspiration = Math.min(1, (agent.psyche.inspiration || 0) + 0.5);
                reward += 10;
                return { log: { key: 'log_action_meditate_inspiration', params: { agentName: agent.name }}, status: 'success', reward };
            }
            return { log: { key: 'log_action_meditate', params: { agentName: agent.name }}, status: 'success', reward };
        }
    },
    {
        name: 'Mourn',
        description: 'Take a moment to mourn and process grief.',
        execute: async (agent) => {
            const griefBefore = agent.emotions.grief || 0;
            agent.emotions.grief = Math.max(0, griefBefore - 0.3);
            const reward = (griefBefore - agent.emotions.grief) * 20;
            return { log: { key: 'log_action_mourn', params: { agentName: agent.name }}, status: 'success', reward };
        }
    },
    {
        name: 'Offer Forgiveness',
        description: 'Offer forgiveness to a rival to mend the relationship.',
        execute: async (agent, allAgents) => {
            const rivalEntry = Object.entries(agent.relationships).find(([, rel]) => rel.type === 'rival');
            if (!rivalEntry) return { log: { key: 'log_action_forgive_no_rival', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            const rival = allAgents.get(rivalEntry[0]);
            if (rival) {
                agent.relationships[rival.id].type = 'acquaintance';
                agent.relationships[rival.id].score = 10;
                rival.relationships[agent.id].type = 'acquaintance';
                rival.relationships[agent.id].score = 10;
                return { log: { key: 'log_action_forgive_success', params: { agentName: agent.name, rivalName: rival.name }}, status: 'success', reward: 30 };
            }
            return { log: { key: 'log_action_forgive_no_rival', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
        }
    },
    {
        name: 'Confront Partner',
        description: 'Confront a partner out of jealousy.',
        execute: async (agent, allAgents) => {
            const partnerEntry = Object.entries(agent.relationships).find(([, rel]) => rel.type === 'spouse' || rel.type === 'partner');
            if (!partnerEntry) return { log: { key: 'log_action_confront_no_partner', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            const partner = allAgents.get(partnerEntry[0]);
            if (partner) {
                agent.psyche.jealousy = Math.max(0, (agent.psyche.jealousy || 0) - 0.4);
                agent.stress += 10;
                partner.stress += 10;
                agent.relationships[partner.id].score = Math.max(-100, agent.relationships[partner.id].score - 10);
                return { log: { key: 'log_action_confront_success', params: { agentName: agent.name, partnerName: partner.name }}, status: 'neutral', reward: -15 };
            }
            return { log: { key: 'log_action_confront_no_partner', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
        }
    },

    // --- Movement & Role-specific Actions ---
    moveAction('North'),
    moveAction('South'),
    moveAction('East'),
    moveAction('West'),
    {
        name: 'Patrol',
        description: 'As a guard, patrol the area.',
        execute: async (agent, allAgents, allEntities, worldState) => {
            if (agent.role !== 'Guard') return { log: { key: 'log_action_fail_role', params: { agentName: agent.name, requiredRole: 'Guard' } }, status: 'failure', reward: -1 };
            wander(agent, worldState.environment);
            return { log: { key: 'log_action_patrol', params: { agentName: agent.name }}, status: 'success', reward: 2 };
        }
    },
    {
        name: 'Arrest',
        description: 'As a guard, arrest a nearby lawbreaker.',
        execute: async (agent) => {
             if (agent.role !== 'Guard') return { log: { key: 'log_action_fail_role', params: { agentName: agent.name, requiredRole: 'Guard' } }, status: 'failure', reward: -1 };
             // This is complex and handled reactively by the engine. This is a placeholder for the guard's intent.
             return { log: { key: 'log_action_patrol', params: { agentName: agent.name }}, status: 'neutral', reward: 0 };
        }
    },
];

```

---

## `services/simulation.ts`

```typescript


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
```

---

## `services/geminiService.ts`

```typescript
import { GoogleGenAI } from "@google/genai";
import type { Action, Agent, EnvironmentState, WorldState, Culture, PsychoReport, Goal } from '../types';
import { Language } from "../contexts/LanguageContext";
import { GENOME_OPTIONS, CHILDHOOD_MAX_AGE, ADOLESCENCE_MAX_AGE, ADULTHOOD_MAX_AGE, ROLES } from "../constants";
import { translations, TranslationKey } from '../translations';

export class LmStudioError extends Error {
    constructor(message: string, public translationKey?: TranslationKey) {
        super(message);
        this.name = 'AIProviderError';
    }
}

const prompts = {
    en: {
        system_base: `You are an assistant for a reality simulation. Your task is to interpret a user's prompt and select the most appropriate action for an AI agent to perform from a given list.
Consider the agent's current state, survival needs, personality, goals, stress, skills, role, religion, culture, health, beliefs, emotions, relationships, inventory, currency, position, and the overall world state including laws, technology, and market prices. The world is a {width}x{height} grid.`,
        agent_state: `**Agent State:**`,
        agent_name: 'Name',
        agent_age: 'Age',
        agent_lifeStage: 'Life Stage',
        agent_role: 'Role',
        agent_religion: 'Religion',
        agent_genome: 'Genome',
        agent_culture: 'Culture',
        agent_relationships: 'Relationships & Dispositions',
        agent_relationships_none: 'None',
        agent_position: 'Position',
        agent_health: 'Health',
        agent_isAlive: 'Is Alive',
        agent_sickness: 'Sickness',
        agent_sickness_none: 'None',
        agent_beliefs: 'Beliefs',
        agent_emotions: 'Current Emotions',
        agent_psyche: 'Drives & Psyche (0-1)',
        agent_needs: 'Needs',
        agent_hunger: 'Hunger',
        agent_thirst: 'Thirst',
        agent_fatigue: 'Fatigue',
        agent_inventory: 'Inventory',
        agent_inventory_none: 'Empty',
        agent_currency: 'Currency',
        agent_personality: 'Personality (0-1)',
        agent_goals: 'Active Goals',
        agent_goals_none: 'None',
        agent_stress: 'Stress Level (0-100)',
        agent_status: 'Social Status (0-100)',
        agent_skills: 'Skills',
        agent_trauma: 'Traumas',
        agent_trauma_none: 'None',
        agent_property: 'Owned Property',
        agent_property_none: 'None',
        agent_imprisoned: 'IMPRISONED until step {until}',
        recalled_memories: `**Recalled Memories (from most to least relevant):**`,
        social_history: 'Social History:',
        other_agents: `**Other Agents:**`,
        entities_on_map: `**Entities on Map (incl. Resources):**`,
        available_actions: `**Available Actions:**`,
        world_state: `**World State:**`,
        world_leader: 'Current Leader',
        world_laws: 'Current Laws',
        world_tech: 'Known Technologies by Culture',
        world_market: 'Market Listings (Dynamic Prices)',
        user_prompt: `**User's Prompt:**`,
        instructions: `Based on all the information, which single action is the most logical for the agent?
- **PRIORITIZE SURVIVAL & FREEDOM:** If imprisoned, the only option is 'Rest'. If hunger, thirst, or fatigue are very high (over 80), resolving them is a high priority. High 'fearOfDeath' also heavily prioritizes safety and 'Rest'.
- **PSYCHOLOGICAL DRIVES:** An agent with high 'grief' will prefer to 'Mourn'. High 'vengefulness' will prioritize 'Fight' against their rival. High 'boredom' suggests a novel or random action. High 'jealousy' points to 'Confront Partner'. High 'spiritualNeed' or 'searchForMeaning' strongly suggests 'Meditate'.
- **THINK ECONOMICALLY:** Wealth is the primary driver for investment. If the agent is wealthy, 'Found Company' (to start a business) is a very strong option, boosted by high openness and reduced by high neuroticism (risk-aversion). If the agent is poor, they should consider 'Work for Company'. If an 'Entrepreneur' (owns property), prioritize actions that use that property (like gathering from it).
- **OBEY THE LAW:** If an action is illegal (e.g., 'Steal'), do not choose it, especially if the agent has high conscientiousness or there are Guards nearby.
- **FOLLOW GOALS:** If the agent has a goal like 'avengeRival', they should prioritize fighting that specific rival when nearby.
- **USE THE MARKET:** Prices are dynamic. If an item is cheap, buy it. If an item is expensive, consider selling it via 'List Item on Market'.
- **CONSIDER ROLE:** A 'Guard' should 'Patrol'. A 'Scientist' should 'Research', especially if 'inspiration' is high.
- **CONSIDER PERSONALITY:** High extraversion and high 'pride' suggest social actions. Low agreeableness and high 'shame' suggest withdrawal or 'Rest'.
- Analyze the user's prompt and the agent's situation deeply.
Return ONLY the name of the chosen action (e.g., "Move North"). If no action is suitable, return "Keine Aktion".`,
        conversation_system_base: `You are a character in a reality simulation. You are playing the role of an AI agent named {agentName}.
Your personality is: "{agentDescription}". Your personality traits are: {agentPersonality}. Your core drives are: {agentPsyche}.
Your current role is: {agentRole}. Your religion is: {agentReligion}. Your culture is '{agentCulture}'.
Your age is {agentAge} ({agentLifeStage}). Health: {agentHealth}/100. Needs: Hunger {agentHunger}/100, Thirst {agentThirst}/100, Fatigue {agentFatigue}/100. Stress: {agentStress}/100. Currency: {agentCurrency}. Property: {agentProperty}.
Your skills are: {agentSkills}. Your inventory: {agentInventory}. Your goals: {agentGoals}.
You are at ({agentX}, {agentY}). The world leader is {worldLeader}. Active laws: {worldLaws}.
You are talking to {otherAgentName}. Your relationship is '{relationshipType}' ({relationshipScore}/100). Your disposition towards them: {relationshipDisposition}.`,
        agent_recent_experiences: 'Your Recent Experiences (what you did, what you saw):',
        agent_recent_experiences_none: 'Nothing of note has happened recently.',
        conversation_history: `**Recent Conversation History (last 5 messages):**`,
        conversation_no_history: `This is the start of your conversation.`,
        conversation_instruction: `Based on your personality, needs, and relationship, generate a response. Your response MUST be a JSON object with "dialogue" (what you say) and "action" (your next move from the list below).
Your dialogue should be natural and psychologically realistic. Let your psychological state (grief, jealousy, inspiration) color your words. Talk about what's on your mind. Gossip, complain, boast, or propose a trade. Keep your dialogue to one or two short sentences.
Available actions for your next move: {availableActions}.`,
        agent_analysis_instruction: `
Generate a deep psychological analysis of this agent based on the following data:

- Personality (Big Five): {personality}
- Emotional State: {emotions}
- Current Status: Health {health}, Hunger {hunger}, Fatigue {fatigue}, Social status {social_status}
- Beliefs: {beliefs}
- Skills: {skills}
- Age & Life Phase: {age}, {life_phase}
- Cultural & Religious Affiliation: {culture}, {religion}
- Last Utterance: "{last_utterance}"
- Relationships: {relationships}
- Jail Journal (if applicable): {jail_journal_entries}

Return a JSON object with the following fields. The first 7 fields are for human-readable text analysis. The last two fields are for the simulation engine and MUST be structured data.
- "unconscious_modifiers": An object with 1-3 keys representing latent psychological states (e.g., "suppressed_melancholy", "fear_of_being_a_burden", "hidden_aggression"). Values must be between 0.0 and 1.0.
- "suggested_goal": A single machine-readable goal object based on the "Therapeutische Empfehlung". It must have a "type" (from the list: 'becomeLeader', 'buildLargeHouse', 'masterSkill', 'avengeRival', 'achieveWealth', 'mentorYoungAgent', 'seekCounseling', 'findMeaning', 'forgiveRival', 'expressGrief') and a "description". If no specific goal fits, return null for this field.

{
  "Psychodynamik": "Explain central unconscious motives, potential conflicts, compensations, defense mechanisms.",
  "Persönlichkeitsbild": "Describe the character traits and the resulting psychological dynamics.",
  "Beziehungsdynamik": "How does this agent interact with others? What do they seek or avoid in relationships?",
  "Traumatische Spuren oder psychische Belastung": "Are there signs of old losses, fears, isolation, melancholy, or existential themes?",
  "Kulturelle & spirituelle Verarbeitung": "How do their beliefs and cultural background influence their inner world?",
  "Projektionen oder Verschiebungen": "What internal conflicts might be unconsciously projected onto other characters?",
  "Therapeutische Empfehlung": "What intervention, relationship, or task could help this agent find mental balance? Be creative and specific to the agent's situation.",
  "unconscious_modifiers": { "latent_perfectionism": 0.8, "fear_of_irrelevance": 0.5 },
  "suggested_goal": { "type": "achieveWealth", "description": "Achieve wealth to overcome feelings of inadequacy." }
}
`,
        lifeStage_child: 'Child',
        lifeStage_adolescent: 'Adolescent',
        lifeStage_adult: 'Adult',
        lifeStage_elder: 'Elder',
        jail_journal_instruction: `You are the AI agent {agentName}. A week has passed in jail. Write a detailed, first-person journal entry reflecting on this past week.
        **Your Current State:**
        - Personality: {agentPersonality}
        - Psyche/Drives: {agentPsyche}
        - Current Emotions: {agentEmotions}
        - Health: {agentHealth}/100, Stress: {agentStress}/100
        - Imprisoned until step: {imprisonedUntil} (Current step: {currentTime})
        **Reason for Imprisonment (based on your memories):**
        {reasonForImprisonment}
        **Instructions:**
        - Write in the first person ("I feel...", "I remember...").
        - Let your personality and emotions color your writing. An agreeable, low-neuroticism agent might be hopeful, while a cynical, high-neuroticism agent might be despairing or angry.
        - Reflect on why you are here. What do you remember about the crime?
        - Describe your life in jail this week. Did you talk to anyone? Did you get into a fight? What are the conditions like?
        - Express your feelings about your sentence. How much longer do you have? What are your hopes or fears for when you get out?
        - Keep the entry to a few paragraphs. Return ONLY the text of the journal entry, without any titles or formatting.`,
    },
    de: {
        system_base: `Sie sind ein Assistent für eine Realitätssimulation. Ihre Aufgabe ist es, die Eingabe eines Benutzers zu interpretieren und die am besten geeignete Aktion für einen KI-Agenten auszuwählen.
Berücksichtigen Sie Zustand, Bedürfnisse, Persönlichkeit, Ziele, Stress, Fähigkeiten, Rolle, Religion, Kultur, Gesundheit, Überzeugungen, Emotionen, Beziehungen, Inventar, Währung, Position des Agenten und den Weltzustand inkl. Gesetzen, Technologie und Marktpreisen. Die Welt ist ein {width}x{height} Raster.`,
        agent_state: `**Agentenzustand:**`,
        agent_name: 'Name',
        agent_age: 'Alter',
        agent_lifeStage: 'Lebensphase',
        agent_role: 'Rolle',
        agent_religion: 'Religion',
        agent_genome: 'Genom',
        agent_culture: 'Kultur',
        agent_relationships: 'Beziehungen & Dispositionen',
        agent_relationships_none: 'Keine',
        agent_position: 'Position',
        agent_health: 'Gesundheit',
        agent_isAlive: 'Lebt',
        agent_sickness: 'Krankheit',
        agent_sickness_none: 'Keine',
        agent_beliefs: 'Überzeugungen',
        agent_emotions: 'Aktuelle Emotionen',
        agent_psyche: 'Triebe & Psyche (0-1)',
        agent_needs: 'Bedürfnisse',
        agent_hunger: 'Hunger',
        agent_thirst: 'Durst',
        agent_fatigue: 'Müdigkeit',
        agent_inventory: 'Inventar',
        agent_inventory_none: 'Leer',
        agent_currency: 'Währung',
        agent_personality: 'Persönlichkeit (0-1)',
        agent_goals: 'Aktive Ziele',
        agent_goals_none: 'Keine',
        agent_stress: 'Stresslevel (0-100)',
        agent_status: 'Sozialer Status (0-100)',
        agent_skills: 'Fähigkeiten',
        agent_trauma: 'Traumata',
        agent_trauma_none: 'Keine',
        agent_property: 'Eigentum',
        agent_property_none: 'Keine',
        agent_imprisoned: 'INHAFTIERT bis Schritt {until}',
        recalled_memories: `**Erinnerte Ereignisse (von relevantestem zu irrelevantestem):**`,
        social_history: 'Soziale Historie:',
        other_agents: `**Andere Agenten:**`,
        entities_on_map: `**Entitäten auf der Karte (inkl. Ressourcen):**`,
        available_actions: `**Verfügbare Aktionen:**`,
        world_state: `**Weltzustand:**`,
        world_leader: 'Aktueller Anführer',
        world_laws: 'Aktuelle Gesetze',
        world_tech: 'Bekannte Technologien nach Kultur',
        world_market: 'Marktangebote (Dynamische Preise)',
        user_prompt: `**Eingabe des Benutzers:**`,
        instructions: `Welche einzelne Aktion ist auf Basis aller Informationen die logischste für den Agenten?
- **ÜBERLEBEN & FREIHEIT PRIORISIEREN:** Wenn inhaftiert, ist 'Ausruhen' die einzige Option. Wenn Hunger, Durst oder Müdigkeit **sehr hoch** (über 80) sind, hat deren Lösung hohe Priorität. Hohe 'Todesangst' priorisiert ebenfalls stark Sicherheit und 'Ausruhen'.
- **PSYCHOLOGISCHE TRIEBE:** Ein Agent mit hoher 'Trauer' wird 'Trauern' bevorzugen. Hohe 'Rachsucht' priorisiert 'Kämpfen' gegen den Rivalen. Hohe 'Langeweile' deutet auf eine neue oder zufällige Aktion hin. Hohe 'Eifersucht' führt zu 'Partner konfrontieren'. Hoher 'spiritueller Bedarf' oder 'Sinnsuche' legt 'Meditieren' nahe.
- **WIRTSCHAFTLICH DENKEN:** Reichtum ist der Hauptantrieb für Investitionen. Wenn der Agent wohlhabend ist, ist 'Found Company' (Unternehmen gründen) eine sehr starke Option, die durch hohe Offenheit gefördert und durch hohen Neurotizismus (Risikoscheu) gemindert wird. Wenn der Agent arm ist, sollte er 'Für Unternehmen arbeiten' in Betracht ziehen. Wenn ein 'Unternehmer' (besitzt Eigentum), priorisiere Aktionen, die dieses Eigentum nutzen (z.B. darauf sammeln).
- **GESETZE BEACHTEN:** Wenn eine Aktion illegal ist, wähle sie nicht, besonders bei hoher Gewissenhaftigkeit oder wenn Wachen in der Nähe sind.
- **ZIELE VERFOLGEN:** Wenn der Agent ein Ziel wie 'avengeRival' hat, sollte er den Kampf mit diesem Rivalen priorisieren, wenn er in der Nähe ist.
- **MARKT NUTZEN:** Die Preise sind dynamisch. Wenn ein Gegenstand billig ist, kaufe ihn. Wenn er teuer ist, erwäge, ihn über 'Gegenstand auf Markt anbieten' zu verkaufen.
- **ROLLE BEACHTEN:** Eine 'Wache' sollte 'Patrouillieren'. Ein 'Wissenschaftler' sollte 'Forschen', besonders bei hoher 'Inspiration'.
- **PERSÖNLICHKEIT BEACHTEN:** Hohe Extraversion und hoher 'Stolz' legen soziale Aktionen nahe. Geringe Verträglichkeit und hohe 'Scham' deuten auf Rückzug oder 'Ausruhen' hin.
- Analysieren Sie die Benutzereingabe und die Situation des Agenten genau.
Geben Sie NUR den Namen der gewählten Aktion zurück (z.B. "Move North"). Wenn keine Aktion geeignet ist, geben Sie "Keine Aktion" zurück.`,
        conversation_system_base: `Sie sind eine Figur in einer Realitätssimulation. Sie spielen die Rolle eines KI-Agenten namens {agentName}.
Ihre Persönlichkeit ist: "{agentDescription}". Ihre Persönlichkeitsmerkmale sind: {agentPersonality}. Ihre Kerntriebe sind: {agentPsyche}.
Ihre aktuelle Rolle ist: {agentRole}. Ihre Religion ist: {agentReligion}. Ihre Kultur ist '{agentCulture}'.
Ihr Alter ist {agentAge} ({agentLifeStage}). Gesundheit: {agentHealth}/100. Bedürfnisse: Hunger {agentHunger}/100, Durst {agentThirst}/100, Müdigkeit {agentFatigue}/100. Stress: {agentStress}/100. Währung: {agentCurrency}. Eigentum: {agentProperty}.
Ihre Fähigkeiten sind: {agentSkills}. Ihr Inventar: {agentInventory}. Ihre Ziele: {agentGoals}.
Sie sind bei ({agentX}, {agentY}). Der Anführer der Welt ist {worldLeader}. Aktive Gesetze: {worldLaws}.
Sie sprechen mit {otherAgentName}. Ihre Beziehung ist '{relationshipType}' ({relationshipScore}/100). Ihre Disposition: {relationshipDisposition}.`,
        agent_recent_experiences: 'Ihre jüngsten Erfahrungen (was Sie getan, was Sie gesehen haben):',
        agent_recent_experiences_none: 'Nichts Bemerkenswertes ist kürzlich passiert.',
        conversation_history: `**Kürzlicher Gesprächsverlauf (letzte 5 Nachrichten):**`,
        conversation_no_history: `Dies ist der Beginn Ihres Gesprächs.`,
        conversation_instruction: `Basierend auf Ihrer Persönlichkeit, Ihren Bedürfnissen und Ihrer Beziehung, generieren Sie eine Antwort. Ihre Antwort MUSS ein JSON-Objekt sein mit "dialogue" (was Sie sagen) und "action" (Ihre nächste Aktion aus der untenstehenden Liste).
Ihr Dialog soll natürlich und psychologisch realistisch sein. Lassen Sie Ihren psychologischen Zustand (Trauer, Eifersucht, Inspiration) Ihre Worte färben. Sprechen Sie über das, was Sie beschäftigt. Tratschen, beschweren, prahlen oder schlagen Sie einen Handel vor. Halten Sie Ihren Dialog auf ein oder zwei kurze Sätze beschränkt.
Verfügbare Aktionen für Ihren nächsten Schritt: {availableActions}.`,
        agent_analysis_instruction: `
Erstelle eine tiefenpsychologische Analyse dieses Agenten basierend auf folgenden Daten:

- Persönlichkeit (Big Five): {personality}
- Emotionale Verfassung: {emotions}
- Aktueller Status: Gesundheit {health}, Hunger {hunger}, Müdigkeit {fatigue}, Sozialstatus {social_status}
- Überzeugungen: {beliefs}
- Fähigkeiten: {skills}
- Alter & Lebensphase: {age}, {life_phase}
- Kulturelle & religiöse Zugehörigkeit: {culture}, {religion}
- Letzte Kommunikation: "{last_utterance}"
- Beziehungen: {relationships}
- Gefängnistagebuch (falls vorhanden): {jail_journal_entries}

Gib ein JSON-Objekt mit den folgenden Feldern zurück. Die ersten 7 Felder sind für die für Menschen lesbare Textanalyse. Die letzten beiden Felder sind für die Simulations-Engine und MÜSSEN strukturierte Daten sein.
- "unconscious_modifiers": Ein Objekt mit 1-3 Schlüsseln, die latente psychologische Zustände repräsentieren (z.B. "suppressed_melancholy", "fear_of_being_a_burden", "hidden_aggression"). Die Werte müssen zwischen 0.0 und 1.0 liegen.
- "suggested_goal": Ein einzelnes, maschinenlesbares Zielobjekt, basierend auf der "Therapeutische Empfehlung". Es muss einen "type" (aus der Liste: 'becomeLeader', 'buildLargeHouse', 'masterSkill', 'avengeRival', 'achieveWealth', 'mentorYoungAgent', 'seekCounseling', 'findMeaning', 'forgiveRival', 'expressGrief') und eine "description" haben. Wenn kein spezifisches Ziel passt, gib für dieses Feld null zurück.

{
  "Psychodynamik": "Erkläre zentrale unbewusste Motive, mögliche Konflikte, Kompensationen, Abwehrmechanismen.",
  "Persönlichkeitsbild": "Beschreibe die Charakterzüge und welche psychologische Dynamik daraus resultiert.",
  "Beziehungsdynamik": "Wie geht dieser Agent mit anderen um? Was sucht oder vermeidet er in Beziehungen?",
  "Traumatische Spuren oder psychische Belastung": "Gibt es Hinweise auf alte Verluste, Ängste, Isolation, Melancholie oder existenzielle Themen?",
  "Kulturelle & spirituelle Verarbeitung": "Wie beeinflussen seine Überzeugungen und sein kultureller Hintergrund seine innere Welt?",
  "Projektionen oder Verschiebungen": "Welche inneren Konflikte könnten unbewusst auf andere Figuren übertragen werden?",
  "Therapeutische Empfehlung": "Welche Intervention, Beziehung oder Aufgabe könnte diesem Agenten helfen, seelisches Gleichgewicht zu finden? Sei kreativ und beziehe dich auf die spezifische Situation des Agenten.",
  "unconscious_modifiers": { "latenter_perfektionismus": 0.8, "angst_vor_bedeutungslosigkeit": 0.5 },
  "suggested_goal": { "type": "achieveWealth", "description": "Reichtum erlangen, um Gefühle der Unzulänglichkeit zu überwinden." }
}
`,
        lifeStage_child: 'Kind',
        lifeStage_adolescent: 'Jugendlicher',
        lifeStage_adult: 'Erwachsener',
        lifeStage_elder: 'Ältester',
        jail_journal_instruction: `Du bist der KI-Agent {agentName}. Eine Woche ist im Gefängnis vergangen. Schreibe einen detaillierten Tagebucheintrag in der Ich-Perspektive, der über die vergangene Woche reflektiert.
        **Dein aktueller Zustand:**
        - Persönlichkeit: {agentPersonality}
        - Psyche/Triebe: {agentPsyche}
        - Aktuelle Emotionen: {agentEmotions}
        - Gesundheit: {agentHealth}/100, Stress: {agentStress}/100
        - Inhaftiert bis Schritt: {imprisonedUntil} (Aktueller Schritt: {currentTime})
        **Grund für die Inhaftierung (basierend auf deinen Erinnerungen):**
        {reasonForImprisonment}
        **Anweisungen:**
        - Schreibe in der Ich-Perspektive ("Ich fühle...", "Ich erinnere mich...").
        - Lass deine Persönlichkeit und deine Emotionen deinen Schreibstil prägen. Ein verträglicher Agent mit niedrigem Neurotizismus könnte hoffnungsvoll sein, während ein zynischer Agent mit hohem Neurotizismus verzweifelt oder wütend sein könnte.
        - Reflektiere darüber, warum du hier bist. Woran erinnerst du dich bezüglich des Verbrechens?
        - Beschreibe dein Leben im Gefängnis diese Woche. Hast du mit jemandem gesprochen? Hattest du einen Kampf? Wie sind die Bedingungen?
        - Drücke deine Gefühle bezüglich deiner Strafe aus. Wie lange hast du noch? Was sind deine Hoffnungen oder Ängste für die Zeit nach deiner Entlassung?
        - Halte den Eintrag auf wenige Absätze beschränkt. Gib NUR den Text des Tagebucheintrags zurück, ohne Titel oder Formatierungen.`,
    }
};

interface AiConfig {
    provider: 'lm_studio' | 'gemini';
    lmStudioUrl: string;
    lmStudioModel: string;
    lmStudioEmbeddingModel: string;
    geminiModel: string;
}

const getAiConfig = (): AiConfig => {
    const storedSettings = localStorage.getItem('realitysim_settings');
    if (storedSettings) {
        try {
            const parsed = JSON.parse(storedSettings);
            // Default to lm_studio if provider isn't set for backwards compatibility
            if (!parsed.provider) {
                parsed.provider = 'lm_studio';
            }
            return parsed;
        } catch (e) { console.error("Could not parse settings from localStorage", e); }
    }
    throw new Error("AI provider not configured.");
};

export async function generateEmbedding(text: string, aiConfig: AiConfig): Promise<number[]> {
    if (aiConfig.provider === 'gemini') {
        if (!process.env.API_KEY) {
            throw new LmStudioError('Google Gemini API key not found in environment variables.', 'error_gemini_no_key');
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const result = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: text,
        });
        return result.embeddings[0].values;
    } else { // LM Studio (assuming it has a compatible endpoint)
        const modelToUse = aiConfig.lmStudioEmbeddingModel || aiConfig.lmStudioModel;
        const body = { input: text, model: modelToUse };
        let fullUrl: string;
        try {
            const userUrl = new URL(aiConfig.lmStudioUrl);
            fullUrl = `${userUrl.protocol}//${userUrl.host}/v1/embeddings`;
        } catch (e) {
            throw new LmStudioError("Invalid LM Studio URL format.", 'error_lmStudio_url_invalid');
        }
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`LM Studio Embeddings API Error (${response.status}): ${await response.text()}`);
        }
        const data = await response.json();
        if (!data.data || !data.data[0] || !data.data[0].embedding) {
            throw new Error("Received an invalid embedding response from LM Studio.");
        }
        return data.data[0].embedding;
    }
}

const callAi = async (systemPrompt: string, userPrompt: string | null, jsonMode: boolean = false) => {
    const config = getAiConfig();

    if (config.provider === 'gemini') {
        if (!process.env.API_KEY) {
            throw new LmStudioError('Google Gemini API key not found in environment variables.', 'error_gemini_no_key');
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const modelConfig: any = {
            systemInstruction: systemPrompt,
        };
        if (jsonMode) {
            modelConfig.responseMimeType = "application/json";
        }

        const promptContent = userPrompt || "Please provide the response based on the system instructions. Generate JSON if requested.";

        try {
            const response = await ai.models.generateContent({
                model: config.geminiModel,
                contents: promptContent,
                config: modelConfig,
            });
            let content = response.text.trim();
            if (jsonMode) {
                // Handle cases where the model wraps the JSON in markdown
                const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch && jsonMatch[1]) {
                    content = jsonMatch[1].trim();
                }
            }
            return content;
        } catch (error) {
            console.error("Gemini API Error:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new LmStudioError(`Gemini API Error: ${errorMessage}`, 'log_aiError');
        }

    } else { // LM Studio
        const messages = [{ role: 'system', content: systemPrompt }];
        if (userPrompt) { messages.push({ role: 'user', content: userPrompt }); }
        else { messages.push({ role: 'user', content: "Please provide the response based on the system instructions. Generate JSON if requested." }); }

        const body: any = { messages: messages, temperature: 0.7, model: config.lmStudioModel };
        // The 'response_format' parameter is removed for better compatibility with various LM Studio models/versions
        // that may not support the 'json_object' type. The prompt itself is responsible for requesting JSON.

        let fullUrl: string;
        try {
            const userUrl = new URL(config.lmStudioUrl);
            fullUrl = `${userUrl.protocol}//${userUrl.host}/v1/chat/completions`;
        } catch (e) {
            throw new LmStudioError("Invalid LM Studio URL format.", 'error_lmStudio_url_invalid');
        }

        try {
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) { throw new Error(`LM Studio API Error (${response.status}): ${await response.text()}`); }
            const data = await response.json();
            if (!data.choices || !data.choices[0].message.content) { throw new Error("Received an invalid response from LM Studio."); }
            
            let content = data.choices[0].message.content;
            return content;
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) { throw new LmStudioError('Failed to fetch from LM Studio.', 'error_lmStudio_cors'); }
            if (error instanceof Error) { throw error; }
            throw new Error("An unknown error occurred while contacting the LM Studio API.");
        }
    }
};

export async function generateActionFromPrompt(
    prompt: string, availableActions: Action[], agent: Agent, worldState: WorldState, language: Language, recalledMemories: string[]
): Promise<string | null> {
    const t = prompts[language];
    const { environment, agents: allAgents, entities, religions, government, markets, cultures, marketPrices } = worldState;

    const actionDescriptions = availableActions.map(action => `- ${action.name}${action.isIllegal ? ' (Illegal!)' : ''}: ${action.description}`).join('\n');
    const leaderName = government.leaderId ? allAgents.find(a => a.id === government.leaderId)?.name : 'None';
    const lawsStr = government.laws.map(l => l.name).join(', ') || 'None';
    const techStr = cultures.map(c => `${c.name}: [${c.knownTechnologies.join(', ') || 'None'}]`).join(' | ');
    const marketStr = markets[0].listings.map(l => {
        const price = marketPrices ? marketPrices[l.item] : 'N/A';
        const sellerName = allAgents.find(a => a.id === l.fromAgentId)?.name || 'Unknown';
        return `${l.quantity} ${l.item} for ${price}$ each by ${sellerName}`;
    }).join('\n') || 'None';

    const formatAgentDataForPrompt = (a: Agent) => {
        const inventoryStr = Object.entries(a.inventory || {}).map(([key, value]) => `${key}: ${value}`).join(', ') || t.agent_inventory_none;
        const personalityStr = JSON.stringify(a.personality, (k,v) => v.toFixed ? Number(v.toFixed(2)) : v);
        const psycheStr = JSON.stringify(a.psyche, (k,v) => v.toFixed ? Number(v.toFixed(2)) : v);
        const skillsStr = JSON.stringify(a.skills, (k,v) => v.toFixed ? Number(v.toFixed(0)) : v);
        const ownedPropertiesStr = entities.filter(e => e.ownerId === a.id).map(e => e.name).join(', ') || t.agent_property_none;
        return `
${t.agent_state}
- ${t.agent_name}: ${a.name} (${t.agent_age}: ${a.age.toFixed(1)}, ${t.agent_role}: ${a.role || 'None'})
- ${t.agent_culture}: ${a.cultureId || 'None'} (${t.agent_religion}: ${(religions || []).find(r => r.id === a.religionId)?.name || 'None'})
- ${t.agent_position}: (${a.x}, ${a.y}) | ${t.agent_health}: ${a.health.toFixed(0)}/100 | ${t.agent_currency}: ${a.currency}$
${a.imprisonedUntil ? `- **${t.agent_imprisoned.replace('{until}', String(a.imprisonedUntil))}**` : ''}
- ${t.agent_needs}: ${t.agent_hunger} ${a.hunger.toFixed(0)}, ${t.agent_thirst} ${a.thirst.toFixed(0)}, ${t.agent_fatigue} ${a.fatigue.toFixed(0)}
- ${t.agent_stress}: ${a.stress.toFixed(0)} | ${t.agent_status}: ${a.socialStatus.toFixed(0)}
- ${t.agent_inventory}: ${inventoryStr}
- ${t.agent_property}: ${ownedPropertiesStr}
- ${t.agent_personality}: ${personalityStr}
- ${t.agent_psyche}: ${psycheStr}
- ${t.agent_skills}: ${skillsStr}`;
    };

    const agentStr = formatAgentDataForPrompt(agent);
    const entitiesStr = entities.map(e => `- ${e.name} at (${e.x}, ${e.y}) ${e.ownerId ? '(Owned by ' + (allAgents.find(a => a.id === e.ownerId)?.name || 'Unknown') + ')' : '(Unowned)'}`).join('\n');

    const recalledMemoriesStr = recalledMemories.length > 0
        ? `\n${t.recalled_memories}\n${recalledMemories.join('\n')}`
        : '';

    const systemPrompt = `${t.system_base.replace('{width}', String(environment.width)).replace('{height}', String(environment.height))}
${agentStr}
${recalledMemoriesStr}
${t.world_state}
- ${t.world_leader}: ${leaderName}
- ${t.world_laws}: ${lawsStr}
- ${t.world_tech}: ${techStr}
- ${t.world_market}:\n${marketStr}
${t.entities_on_map}
${entitiesStr || 'None'}
${t.available_actions}
${actionDescriptions}
${t.instructions.replace("Return ONLY the name", "Consider the recalled memories to understand long-term context. Return ONLY the name")}`;

    const userPromptContent = `${t.user_prompt}\n"${prompt}"`;

    try {
        const content = await callAi(systemPrompt, userPromptContent, false);
        const text = content.trim();
        const matchingAction = availableActions.find(a => a.name.toLowerCase() === text.toLowerCase());
        return matchingAction ? matchingAction.name : "Keine Aktion";
    } catch (error) {
        console.error("Error generating action with AI:", error);
        if (error instanceof LmStudioError) throw error;
        throw new Error(`AI Error: ${(error as Error).message}`);
    }
}

export async function generateAgentConversation(
    speaker: Agent, listener: Agent, history: { speakerName: string; message: string }[], worldState: WorldState, language: Language
): Promise<{ dialogue: string; action: string; } | null> {
    const getLifeStage = (age: number, t: any) => {
        if (age <= CHILDHOOD_MAX_AGE) return t.lifeStage_child;
        if (age <= ADOLESCENCE_MAX_AGE) return t.lifeStage_adolescent;
        if (age <= ADULTHOOD_MAX_AGE) return t.lifeStage_adult;
        return t.lifeStage_elder;
    }
    
    const t = prompts[language];
    const { actions: availableActions, government, entities } = worldState;

    const actionNames = availableActions.map(a => a.name).join(', ');
    const historyStr = history.length > 0 ? history.map(h => `${h.speakerName}: "${h.message}"`).join('\n') : t.conversation_no_history;
    const relationshipWithListener = speaker.relationships[listener.id] || { type: 'stranger', score: 0, disposition: {} };
    const personalityStr = JSON.stringify(speaker.personality, (k,v) => v.toFixed ? Number(v.toFixed(2)) : v);
    const psycheStr = JSON.stringify(speaker.psyche, (k,v) => v.toFixed ? Number(v.toFixed(2)) : v);
    const leaderName = government.leaderId ? worldState.agents.find(a => a.id === government.leaderId)?.name : 'None';
    const lawsStr = government.laws.map(l => l.name).join(', ') || 'None';
    const ownedPropertiesStr = entities.filter(e => e.ownerId === speaker.id).map(e => e.name).join(', ') || t.agent_property_none;

    const recentExperienceList: string[] = [];
    const lastAction = speaker.lastActions?.[0];
    if (lastAction) {
        recentExperienceList.push(`You just performed the action '${lastAction.name}'.`);
    }
    const lastMemory = speaker.socialMemory?.[0];
    if (lastMemory && lastMemory.timestamp > worldState.environment.time - 10) {
        const otherAgentName = worldState.agents.find(a => a.id === lastMemory.agentId)?.name || 'someone';
        recentExperienceList.push(`You recently observed ${otherAgentName} involved in an event related to '${lastMemory.action}'.`);
    }
    const recentExperiencesStr = recentExperienceList.length > 0 ? recentExperienceList.join(' ') : t.agent_recent_experiences_none;

    const conversationInstruction = t.conversation_instruction
        .replace('{availableActions}', actionNames);

    const systemPrompt = `${t.conversation_system_base
        .replace('{agentName}', speaker.name)
        .replace('{agentDescription}', speaker.description)
        .replace('{agentPersonality}', personalityStr)
        .replace('{agentPsyche}', psycheStr)
        .replace('{agentRole}', String(speaker.role || 'None'))
        .replace('{agentReligion}', String(worldState.religions.find(r => r.id === speaker.religionId)?.name || 'None'))
        .replace('{agentLifeStage}', getLifeStage(speaker.age, t))
        .replace('{agentCulture}', String(speaker.cultureId))
        .replace('{agentHealth}', String(speaker.health.toFixed(0)))
        .replace('{agentAge}', speaker.age.toFixed(1))
        .replace('{agentHunger}', speaker.hunger.toFixed(0))
        .replace('{agentThirst}', speaker.thirst.toFixed(0))
        .replace('{agentFatigue}', speaker.fatigue.toFixed(0))
        .replace('{agentStress}', speaker.stress.toFixed(0))
        .replace('{agentCurrency}', String(speaker.currency))
        .replace('{agentProperty}', ownedPropertiesStr)
        .replace('{agentSkills}', JSON.stringify(speaker.skills))
        .replace('{agentInventory}', JSON.stringify(speaker.inventory))
        .replace('{agentGoals}', speaker.goals.map(g=>g.description).join(', ') || 'None')
        .replace('{agentX}', String(speaker.x))
        .replace('{agentY}', String(speaker.y))
        .replace('{worldLeader}', leaderName)
        .replace('{worldLaws}', lawsStr)
        .replace('{otherAgentName}', listener.name)
        .replace('{relationshipType}', relationshipWithListener.type)
        .replace('{relationshipScore}', relationshipWithListener.score.toFixed(1))
        .replace('{relationshipDisposition}', JSON.stringify(relationshipWithListener.disposition))}

${t.agent_recent_experiences} ${recentExperiencesStr}

${history.length > 0 ? t.conversation_history : ''}
${historyStr}

${conversationInstruction}`;

    try {
        const jsonText = await callAi(systemPrompt, null, true);
        const result = JSON.parse(jsonText);
        return availableActions.some(a => a.name === result.action) ? result : { ...result, action: "Rest" };
    } catch (error) {
        console.error("Error generating conversation with AI:", error);
        return null;
    }
}

export async function generatePsychoanalysis(
    agent: Agent, worldState: WorldState, language: Language
): Promise<PsychoReport | null> {
    const getLifeStage = (age: number, t: any) => {
        if (age <= CHILDHOOD_MAX_AGE) return t.lifeStage_child;
        if (age <= ADOLESCENCE_MAX_AGE) return t.lifeStage_adolescent;
        if (age <= ADULTHOOD_MAX_AGE) return t.lifeStage_adult;
        return t.lifeStage_elder;
    }
    const t = prompts[language];
    const t_global = translations[language] as typeof translations.en;

    const agentCulture = worldState.cultures.find(c => c.id === agent.cultureId)?.name || t_global.culture_none;
    const agentReligion = worldState.religions.find(r => r.id === agent.religionId)?.name || t_global.religion_none;
    const lastUtterance = agent.conversationHistory.length > 0 ? agent.conversationHistory[agent.conversationHistory.length - 1].message : '';
    
    const relationshipsStr = Object.entries(agent.relationships || {}).map(([id, rel]) => {
        const otherAgentName = worldState.agents.find(a => a.id === id)?.name;
        if (!otherAgentName) return '';
        return `${otherAgentName}: ${rel.type} (Score: ${rel.score.toFixed(0)})`;
    }).filter(Boolean).join(', ') || 'None';

    const jailJournalStr = (agent.jailJournal && agent.jailJournal.length > 0)
        ? agent.jailJournal.slice(-3).map(entry => `[Step ${entry.timestamp}]\n${entry.entry}`).join('\n\n---\n\n')
        : t_global.agentCard_noJournalEntries;

    const systemPrompt = t.agent_analysis_instruction
        .replace('{personality}', JSON.stringify(agent.personality, (k, v) => typeof v === 'number' ? v.toFixed(2) : v))
        .replace('{emotions}', JSON.stringify(agent.emotions, (k, v) => typeof v === 'number' ? v.toFixed(2) : v))
        .replace('{health}', agent.health.toFixed(0))
        .replace('{hunger}', agent.hunger.toFixed(0))
        .replace('{fatigue}', agent.fatigue.toFixed(0))
        .replace('{social_status}', agent.socialStatus.toFixed(0))
        .replace('{beliefs}', JSON.stringify(agent.beliefNetwork))
        .replace('{skills}', JSON.stringify(agent.skills, (k, v) => typeof v === 'number' ? v.toFixed(0) : v))
        .replace('{age}', agent.age.toFixed(1))
        .replace('{life_phase}', getLifeStage(agent.age, t))
        .replace('{culture}', agentCulture)
        .replace('{religion}', agentReligion)
        .replace('{last_utterance}', lastUtterance)
        .replace('{relationships}', relationshipsStr)
        .replace('{jail_journal_entries}', jailJournalStr);

    try {
        const jsonText = await callAi(systemPrompt, null, true);
        const result: PsychoReport = JSON.parse(jsonText);
        if (result.Psychodynamik && result.Persönlichkeitsbild) {
            return result;
        }
        return null;
    } catch (error) {
        console.error("Error generating psychoanalysis with AI:", error);
        if (error instanceof LmStudioError) throw error;
        throw new Error(`AI Error: ${(error as Error).message}`);
    }
}


const getWorldGenPrompts = (language: Language) => ({
    en: {
        world_system_base: `You are a data generation bot. Your only task is to create a JSON object.
Generate a world with EXACTLY {agentCount} unique human agents and EXACTLY {entityCount} unique entities.
The world is a {width}x{height} grid.`,
        agent_details: `For each agent, provide: **name (a unique, creative, human-sounding name like 'Elara' or 'Finnian', not 'Agent 1')**, description, age (1-80), x, y, cultureId ('culture-utopian' or 'culture-primitivist'), religionId ('religion-technotheism' or 'religion-gaianism'), role ('${ROLES.join("', '")}'), genome (an array of 1-3 strings from '${GENOME_OPTIONS.join("', '")}'), beliefs (an object mapping belief keys like 'progress_good' to a value between 0.0 and 1.0), emotions (an object with keys like 'happiness', 'sadness' with values 0.0-1.0), personality (an object with keys 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' with values 0.0-1.0), skills (an object mapping skill names to a numeric level, e.g., {"healing": 15, "woodcutting": 5}), socialStatus (a numeric value between 30-70), stress (a numeric value between 5-30), hunger, thirst, fatigue (numeric values between 0-50), inventory (an object like {"wood": 10}), and currency (a numeric value between 20-100).`,
        entity_base_details: `For each entity: **name (a unique, descriptive name like 'Whispering Falls' or 'Old Town Market', not 'Resource 1')**, description, x, y.`,
        world_response_instructions: `Your response MUST be a JSON object: { "agents": [ ... ], "entities": [ ... ] }. DO NOT add extra text. Ensure all numeric values are actually numbers, not strings.`,
        agents_response_instructions: `Your response MUST be a JSON object: { "agents": [ ... ] }. DO NOT add extra text or entity data. Ensure all numeric values are actually numbers, not strings.`,
        entities_response_instructions: `Your response MUST be a JSON object: { "entities": [ ... ] }. DO NOT add extra text or agent data. Ensure all numeric values are actually numbers, not strings.`,
    },
    de: {
        world_system_base: `Sie sind ein Datengenerierungs-Bot. Ihre einzige Aufgabe ist die Erstellung eines JSON-Objekts.
Generieren Sie eine Welt mit EXAKT {agentCount} Agenten und EXAKT {entityCount} Entitäten auf einem {width}x{height} Raster.`,
        agent_details: `Für jeden Agenten: **name (ein einzigartiger, kreativer, menschlich klingender Name wie 'Elara' oder 'Finnian', nicht 'Agent 1')**, description, age (1-80), x, y, cultureId ('culture-utopian' oder 'culture-primitivist'), religionId ('religion-technotheism' oder 'religion-gaianism'), role ('${ROLES.join("', '")}'), genome (ein Array mit 1-3 Strings aus '${GENOME_OPTIONS.join("', '")}'), beliefs (ein Objekt, das Belief-Schlüssel wie 'progress_good' auf einen Wert zwischen 0.0 und 1.0 abbildet), emotions (ein Objekt mit Schlüsseln wie 'happiness', 'sadness' mit Werten von 0.0-1.0), personality (ein Objekt mit den Schlüsseln 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' mit Werten von 0.0-1.0), skills (ein Objekt, das Fähigkeitsnamen auf ein numerisches Level abbildet, z.B. {"healing": 15, "woodcutting": 5}), socialStatus (ein numerischer Wert zwischen 30-70), stress (ein numerischer Wert zwischen 5-30), hunger, thirst, fatigue (numerische Werte zwischen 0-50), inventory (ein Objekt wie {"wood": 10}), und currency (ein numerischer Wert zwischen 20-100).`,
        entity_base_details: `Für jede Entität: **name (ein einzigartiger, beschreibender Name wie 'Flüsterwasserfall' oder 'Alter Stadtmarkt', nicht 'Resource 1')**, description, x, y.`,
        world_response_instructions: `Ihre Antwort MUSS ein JSON-Objekt sein: { "agents": [ ... ], "entities": [ ... ] }. Fügen Sie KEINEN zusätzlichen Text hinzu. Stellen Sie sicher, dass alle numerischen Werte Zahlen sind, keine Strings.`,
        agents_response_instructions: `Ihre Antwort MUSS ein JSON-Objekt sein: { "agents": [ ... ] }. Fügen Sie KEINEN zusätzlichen Text oder Entitätsdaten hinzu. Stellen Sie sicher, dass alle numerischen Werte Zahlen sind, keine Strings.`,
        entities_response_instructions: `Ihre Antwort MUSS ein JSON-Objekt sein: { "entities": [ ... ] }. Fügen Sie KEINEN zusätzlichen Text oder Agentendaten hinzu. Stellen Sie sicher, dass alle numerischen Werte Zahlen sind, keine Strings.`,
    }
}[language]);

export async function generateWorld(
    environment: EnvironmentState, language: Language, agentCount: number, entityCounts: { [key: string]: number }
): Promise<{ agents: any[], entities: any[] } | null> {
    const t = getWorldGenPrompts(language);
    const totalEntityCount = Object.values(entityCounts).reduce((sum, val) => sum + val, 0);

    const buildingCount = entityCounts.buildings || 0;
    let building_instruction_en = '';
    if (buildingCount > 0) {
        building_instruction_en = `EXACTLY ${buildingCount} building/general entities. IMPORTANT: Among these, one MUST be a marketplace ('isMarketplace': true) and one MUST be a jail ('isJail': true), assuming the count is 2 or more. If the count is 1, make it a marketplace.`;
    }
    let building_instruction_de = '';
     if (buildingCount > 0) {
        building_instruction_de = `EXAKT ${buildingCount} Gebäude/allgemeine Entitäten. WICHTIG: Darunter MUSS ein Marktplatz ('isMarketplace': true) und ein Gefängnis ('isJail': true) sein, sofern die Anzahl 2 oder mehr beträgt. Wenn die Anzahl 1 ist, erstellen Sie einen Marktplatz.`;
    }

    const details_en = [
        entityCounts.food > 0 ? `EXACTLY ${entityCounts.food} food resources ('isResource': true, 'resourceType': 'food', 'quantity').` : '',
        entityCounts.water > 0 ? `EXACTLY ${entityCounts.water} water resources ('isResource': true, 'resourceType': 'water', 'quantity').` : '',
        entityCounts.wood > 0 ? `EXACTLY ${entityCounts.wood} wood resources ('isResource': true, 'resourceType': 'wood', 'quantity').` : '',
        entityCounts.iron > 0 ? `EXACTLY ${entityCounts.iron} iron resources ('isResource': true, 'resourceType': 'iron', 'quantity').` : '',
        building_instruction_en
    ].filter(Boolean).join('\n');
    
    const details_de = [
        entityCounts.food > 0 ? `EXAKT ${entityCounts.food} Nahrungsquellen ('isResource': true, 'resourceType': 'food', 'quantity').` : '',
        entityCounts.water > 0 ? `EXAKT ${entityCounts.water} Wasserquellen ('isResource': true, 'resourceType': 'water', 'quantity').` : '',
        entityCounts.wood > 0 ? `EXAKT ${entityCounts.wood} Holzquellen ('isResource': true, 'resourceType': 'wood', 'quantity').` : '',
        entityCounts.iron > 0 ? `EXAKT ${entityCounts.iron} Eisenquellen ('isResource': true, 'resourceType': 'iron', 'quantity').` : '',
        building_instruction_de
    ].filter(Boolean).join('\n');

    const specificEntityDetails = language === 'de' ? details_de : details_en;
    
    const systemPrompt = `${t.world_system_base
        .replace('{agentCount}', String(agentCount))
        .replace('{entityCount}', String(totalEntityCount))
        .replace('{width}', String(environment.width)).replace('{height}', String(environment.height))
    }\n${t.agent_details}\n
For entities: ${t.entity_base_details}
You must follow these specific counts for entities:
${specificEntityDetails}\n
${t.world_response_instructions}`;
    
    try {
        const jsonText = await callAi(systemPrompt, null, true);
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating world with AI:", error);
        if (error instanceof LmStudioError) throw error;
        throw new Error(`AI Error: ${(error as Error).message}`);
    }
}

export async function generateAgents(
    environment: EnvironmentState, language: Language, agentCount: number
): Promise<{ agents: any[] } | null> {
    const t = getWorldGenPrompts(language);
    const systemPrompt = `${t.world_system_base
        .replace(' and EXACTLY {entityCount} unique entities', '')
        .replace(' und EXAKT {entityCount} Entitäten', '')
        .replace('{agentCount}', String(agentCount))
        .replace('{entityCount}', '0') // Fallback
        .replace('{width}', String(environment.width))
        .replace('{height}', String(environment.height))}\n${t.agent_details}\n\n${t.agents_response_instructions}`;
    
    try {
        const jsonText = await callAi(systemPrompt, null, true);
        const result = JSON.parse(jsonText);
        return { agents: result.agents || [] };
    } catch (error) {
        console.error("Error generating agents with AI:", error);
        if (error instanceof LmStudioError) throw error;
        throw new Error(`AI Error: ${(error as Error).message}`);
    }
}

export async function generateEntities(
    environment: EnvironmentState, language: Language, entityCounts: { [key: string]: number }
): Promise<{ entities: any[] } | null> {
    const t = getWorldGenPrompts(language);
    const totalCount = Object.values(entityCounts).reduce((sum, val) => sum + val, 0);

    const details_en = [
        entityCounts.food > 0 ? `EXACTLY ${entityCounts.food} food resources ('isResource': true, 'resourceType': 'food', 'quantity').` : '',
        entityCounts.water > 0 ? `EXACTLY ${entityCounts.water} water resources ('isResource': true, 'resourceType': 'water', 'quantity').` : '',
        entityCounts.wood > 0 ? `EXACTLY ${entityCounts.wood} wood resources ('isResource': true, 'resourceType': 'wood', 'quantity').` : '',
        entityCounts.iron > 0 ? `EXACTLY ${entityCounts.iron} iron resources ('isResource': true, 'resourceType': 'iron', 'quantity').` : '',
        entityCounts.buildings > 0 ? `EXACTLY ${entityCounts.buildings} general entities (like buildings, landmarks, non-resource objects).` : '',
    ].filter(Boolean).join('\n');

    const details_de = [
        entityCounts.food > 0 ? `EXAKT ${entityCounts.food} Nahrungsquellen ('isResource': true, 'resourceType': 'food', 'quantity').` : '',
        entityCounts.water > 0 ? `EXAKT ${entityCounts.water} Wasserquellen ('isResource': true, 'resourceType': 'water', 'quantity').` : '',
        entityCounts.wood > 0 ? `EXAKT ${entityCounts.wood} Holzquellen ('isResource': true, 'resourceType': 'wood', 'quantity').` : '',
        entityCounts.iron > 0 ? `EXAKT ${entityCounts.iron} Eisenquellen ('isResource': true, 'resourceType': 'iron', 'quantity').` : '',
        entityCounts.buildings > 0 ? `EXAKT ${entityCounts.buildings} allgemeine Entitäten (wie Gebäude, Sehenswürdigkeiten, nicht-Ressourcen Objekte).` : '',
    ].filter(Boolean).join('\n');
    
    const specificDetails = language === 'de' ? details_de : details_en;

    const systemPrompt = `${t.world_system_base
        .replace('EXACTLY {agentCount} unique human agents and ', '')
        .replace('EXAKT {agentCount} Agenten und ', '')
        .replace('EXACTLY {entityCount} unique entities', `a total of ${totalCount} unique entities`)
        .replace('EXAKT {entityCount} Entitäten', `insgesamt ${totalCount} einzigartigen Entitäten`)
        .replace('{agentCount}', '0') // Fallback
        .replace('{entityCount}', String(totalCount))
        .replace('{width}', String(environment.width))
        .replace('{height}', String(environment.height))}
${t.entity_base_details}
The generation must follow these specific counts:
${specificDetails}

${t.entities_response_instructions}`;

    try {
        const jsonText = await callAi(systemPrompt, null, true);
        const result = JSON.parse(jsonText);
        return { entities: result.entities || [] };
    } catch (error) {
        console.error("Error generating entities with AI:", error);
        if (error instanceof LmStudioError) throw error;
        throw new Error(`AI Error: ${(error as Error).message}`);
    }
}

export async function generateJailJournalEntry(
    agent: Agent,
    worldState: WorldState,
    language: Language,
    reasonForImprisonment: string
): Promise<string | null> {
    const t = prompts[language];

    const personalityStr = JSON.stringify(agent.personality, (k,v) => v.toFixed ? Number(v.toFixed(2)) : v);
    const psycheStr = JSON.stringify(agent.psyche, (k,v) => v.toFixed ? Number(v.toFixed(2)) : v);
    const emotionsStr = JSON.stringify(agent.emotions, (k,v) => v.toFixed ? Number(v.toFixed(2)) : v);

    const systemPrompt = t.jail_journal_instruction
        .replace('{agentName}', agent.name)
        .replace('{agentPersonality}', personalityStr)
        .replace('{agentPsyche}', psycheStr)
        .replace('{agentEmotions}', emotionsStr)
        .replace('{agentHealth}', agent.health.toFixed(0))
        .replace('{agentStress}', agent.stress.toFixed(0))
        .replace('{imprisonedUntil}', String(agent.imprisonedUntil))
        .replace('{currentTime}', String(worldState.environment.time))
        .replace('{reasonForImprisonment}', reasonForImprisonment);
    
    try {
        const journalEntry = await callAi(systemPrompt, null, false);
        return journalEntry.trim();
    } catch (error) {
        console.error("Error generating jail journal entry with AI:", error);
        return null;
    }
}
```

---

## `translations.ts`

```typescript


export const translations = {
  en: {
    // App.tsx
    realitySimAI: 'RealitySim AI',
    agents: 'Agents',
    deceased: 'Deceased',
    entities: 'Entities',
    environment: 'Environment',
    availableActions: 'Available Actions',
    agentCard_selectAgent: 'Select an agent to view details.',
    confirmDelete: 'Are you sure you want to delete this {type}? This action cannot be undone.',
    type_agent: 'agent',
    type_entity: 'entity',
    type_action: 'action',
    processingSteps: 'Processing step(s)...',
    // Logs
    log_simulationInitialized: 'Simulation initialized.',
    log_simulationStepped: 'Simulation stepped forward.',
    log_simulationRanSteps: 'Simulation ran for {steps} steps.',
    log_simulationReset: 'Simulation reset to initial state.',
    log_agentProcessingPrompt: 'Agent {agentId} processing prompt: "{prompt}" (using {aiInfo})',
    log_aiSuggestedAction: 'AI suggested action: "{action}"',
    log_aiFailed: 'AI could not find a suitable action. No action taken.',
    log_aiError: 'Error with AI API: {error}',
    error_lmStudio_cors: 'Failed to connect to LM Studio. This is usually a Cross-Origin Resource Sharing (CORS) issue. Please check the following in your LM Studio application: 1. Go to the "Local Server" tab. 2. Ensure the server is "Running". 3. **Crucially, find the "CORS" option and make sure it is checked/enabled.** 4. Verify the URL in this app\'s settings matches the one shown in LM Studio.',
    error_lmStudio_url_invalid: "Invalid LM Studio URL format. Please provide a valid base URL like 'http://localhost:1234'.",
    error_gemini_no_key: 'Google Gemini API key not found in environment variables. Please ensure it is set.',
    log_createdAgent: 'Created new agent: {name}',
    log_createdEntity: 'Created new entity: {name}',
    log_createdAction: 'Created new action: {name}',
    log_removed: 'Removed {type}: {name}',
    log_adminSetHealth: "Admin set {name}'s health to {health}.",
    log_adminSetPosition: "Admin set {name}'s position to ({x}, {y}).",
    log_adminInflictedSickness: "Admin inflicted {name} with {sickness}.",
    log_adminCured: 'Admin cured {name}.',
    log_adminResurrected: 'Admin resurrected {name}.',
    log_adminModifiedEnv: 'Admin directly modified the environment.',
    log_exported: 'Exported partial {type} data.',
    log_stateSaved: 'Simulation state saved to file.',
    log_stateLoaded: 'Simulation state successfully loaded from file.',
    log_loadError: 'Failed to load state from file: {error}',
    log_runningSimulation: 'Running simulation for {steps} steps...',
    log_generating: 'Generating...',
    log_generatingWorld: 'Generating world...',
    log_worldGenerated: 'New world processed successfully.',
    log_worldGenerated_warning: '⚠️ AI generated {genAgents}/{reqAgents} agents and {genEntities}/{reqEntities} entities. Continuing with generated results.',
    log_generatingAgents: 'Generating {count} new agents...',
    log_generatingEntities: 'Generating {count} new entities...',
    log_addedAgents: 'Added {count} new agents to the world.',
    log_addedEntities: 'Added {count} new entities to the world.',
    log_configure_ai_full: 'AI provider not configured. Please open settings to select and configure an AI provider.',
    log_adminSetCurrency: "Admin set {name}'s currency to {currency}$.",
    log_adminRepealedLaw: "Admin repealed the law: {lawName}.",
    log_adminSetLeader: "Admin has appointed {name} as the new leader.",
    log_adminUnlockedTech: "Admin unlocked technology \"{techId}\" for {cultureName}.",
    log_adminImprisoned: "Admin has imprisoned {name} for {duration} steps.",
    log_psychoanalysis_applied: '🧬 Psychoanalysis results have been integrated into {agentName}\'s psyche.',
    log_grief: '💔 {agentName} is struck with grief over the death of {deceasedName}.',
    log_sickness_spread: '☣️ {infectedName} caught {sickness} from {sourceName}!',
    log_action_custom_success: '{agentName} successfully performed the custom action: "{actionName}".',
    log_action_custom_fail_cost: '{agentName} tried to perform "{actionName}" but lacked {amount} {item}.',
    // Settings
    settings_title: 'Settings',
    settings_aiProvider_label: 'AI Provider',
    settings_lmStudioUrl_label: 'LM Studio API Endpoint',
    settings_lmStudioUrl_description: 'Enter the base URL from your local LM Studio server (e.g., http://localhost:1234). The API path will be added automatically.',
    settings_lmStudioModel_label: 'Model Name',
    settings_lmStudioModel_description: "Enter the model's API identifier from LM Studio for chat completions (e.g., google/gemma-2b-it). This model must be loaded in the server.",
    settings_lmStudioEmbeddingModel_label: 'Embedding Model Name (optional)',
    settings_lmStudioEmbeddingModel_description: 'Enter the model identifier for embeddings. If empty, the chat model will be used. This model must be loaded in your LM Studio server and selected for the embeddings endpoint.',
    settings_geminiModel_label: 'Gemini Model',
    settings_geminiModel_description: 'Select the Google Gemini model to use.',
    settings_geminiApiKey_label: 'Gemini API Key',
    settings_geminiApiKey_value: 'Loaded from environment variable',
    settings_geminiApiKey_description: 'Your Google AI API key must be available as an environment variable named API_KEY.',
    settings_save: 'Save',
    settings_cancel: 'Cancel',
    // Generate World Modal
    generateWorldModal_title: 'Generate New World',
    generateWorldModal_agentsLabel: 'Number of Agents',
    generateWorldModal_agentsDescription: 'How many agents should populate the new world?',
    generateWorldModal_entitiesLabel: 'Entities',
    generateWorldModal_entitiesDescription: 'Specify how many of each entity type should exist in the new world. Marketplace and Jail will be included in the Buildings count.',
    generateWorldModal_generate: 'Generate',
    // Generate Content Modal
    generateContent_title: 'Generate Content with AI',
    generateContent_addAgents: 'Add New Agents',
    generateContent_addEntities: 'Add New Entities',
    generateContent_agentsLabel: 'Number of new agents',
    generateContent_agentsDescription: 'How many new agents to generate and add to the world?',
    generateContent_entitiesLabel: 'Number of new entities',
    generateContent_entitiesDescription: 'How many new entities/resources to generate and add to the world?',
    generateContent_generateAgentsBtn: 'Generate Agents',
    generateContent_generateEntitiesBtn: 'Generate Entities',
    generateContent_foodSources: 'Food Sources',
    generateContent_waterSources: 'Water Sources',
    generateContent_woodSources: 'Wood Sources',
    generateContent_ironSources: 'Iron Sources',
    generateContent_buildings: 'Buildings/Objects',
    generateContent_entitiesDescriptionCategorized: 'Specify how many of each entity type to generate and add to the world.',
    // AgentCard.tsx
    agentCard_statusAndNeeds: 'Status & Needs',
    agentCard_age: 'Age',
    agentCard_culture: 'Culture',
    agentCard_religion: 'Religion',
    agentCard_role: 'Role',
    world_leader: 'Current Leader',
    agentCard_lifeStage: 'Life Stage',
    agentCard_health: 'Health',
    agentCard_hunger: 'Hunger',
    agentCard_thirst: 'Thirst',
    agentCard_fatigue: 'Fatigue',
    agentCard_sickness: 'Sickness',
    agentCard_stress: 'Stress',
    agentCard_socialStatus: 'Social Status',
    agentCard_currency: 'Currency',
    agentCard_healthy: 'Healthy',
    agentCard_deceased: 'DECEASED',
    agentCard_imprisoned: 'IMPRISONED',
    agentCard_release_at: 'Release at step:',
    agentCard_beliefs: 'Beliefs',
    agentCard_emotions: 'Situational Emotions',
    agentCard_interact: 'Interact',
    agentCard_promptPlaceholder: 'Prompt for {name} (AI will interpret)...',
    agentCard_promptPlaceholderRaw: 'Enter exact action name...',
    agentCard_promptPlaceholderDeceased: '{name} cannot respond.',
    agentCard_useAi: 'Use AI',
    agentCard_noBeliefs: 'No beliefs',
    agentCard_noEmotions: 'No emotions',
    agentCard_relationships: 'Relationships',
    agentCard_noRelationships: 'No relationships established.',
    agentCard_inventory: 'Inventory',
    agentCard_noInventory: 'Inventory is empty.',
    agentCard_personality: 'Personality',
    agentCard_skills: 'Skills',
    agentCard_goals: 'Active Goals',
    agentCard_noGoals: 'No active goals.',
    agentCard_trauma: 'Trauma',
    agentCard_noTrauma: 'No traumas recorded.',
    agentCard_tech: 'Known Technologies',
    agentCard_noTech: 'No technologies known.',
    agentCard_noData: 'No data.',
    agentCard_genome: 'Genome & Traits',
    agentCard_noGenome: 'No notable genetic traits.',
    agentCard_property: 'Property',
    agentCard_noProperty: 'Owns no property.',
    agentCard_longTermMemory: 'Long-Term Memory',
    agentCard_noMemories: 'No memories recorded.',
    agentCard_family: 'Family',
    agentCard_child_relation: 'Child',
    agentCard_no_children: 'No children.',
    agentCard_jailJournal: 'Jail Journal',
    agentCard_noJournalEntries: 'No journal entries yet.',
    // Psychoanalysis
    psychoanalysis_title: 'Psychological Profile',
    psyche_title: 'Psyche & Drives',
    psychoanalysis_generate_button: 'View Psychological Profile',
    psychoanalysis_generating: 'Generating profile...',
    report_psychodynamik: 'Psychodynamics',
    report_persoenlichkeitsbild: 'Personality Profile',
    report_beziehungsdynamik: 'Relationship Dynamics',
    report_trauma: 'Traumatic Traces / Psychological Stress',
    report_kultur: 'Cultural & Spiritual Processing',
    report_projektionen: 'Projections or Displacements',
    report_empfehlung: 'Therapeutic Recommendation',
    // Genes
    'gene_G-RESISTANT': 'Resistant',
    'gene_G-AGILE': 'Agile',
    'gene_G-SOCIAL': 'Social',
    'gene_G-LONGEVITY': 'Longevity',
    'gene_G-FASTHEAL': 'Fast Heal',
    'gene_G-INTELLIGENT': 'Intelligent',
    'gene_G-FERTILE': 'Fertile',
    'gene_desc_G-RESISTANT': 'Reduces health loss from sickness and increases recovery chance.',
    'gene_desc_G-AGILE': 'Moves faster (2 steps instead of 1).',
    'gene_desc_G-SOCIAL': 'More likely to initiate conversations.',
    'gene_desc_G-LONGEVITY': 'Reduces health loss from old age.',
    'gene_desc_G-FASTHEAL': 'Recovers more health when resting.',
    'gene_desc_G-INTELLIGENT': 'Gains skills and research points more quickly.',
    'gene_desc_G-FERTILE': 'Increased chance of successful reproduction.',
    // Resource & Item Types
    resource_food: 'Food',
    resource_water: 'Water',
    resource_wood: 'Wood',
    resource_medicine: 'Medicine',
    resource_iron: 'Iron',
    item_food: 'Food',
    item_water: 'Water',
    item_wood: 'Wood',
    item_medicine: 'Medicine',
    item_iron: 'Iron',
    item_sword: 'Sword',
    item_plow: 'Plow',
    item_advanced_medicine: 'Advanced Medicine',
    item_iron_ingot: 'Iron Ingot',
    item_local_produce: 'Local Produce',
    // Relationship Types
    relationship_stranger: 'Stranger',
    relationship_acquaintance: 'Acquaintance',
    relationship_friend: 'Friend',
    relationship_rival: 'Rival',
    relationship_partner: 'Partner',
    relationship_spouse: 'Spouse',
    'relationship_ex-partner': 'Ex-Partner',
    // Life Stages & Roles
    lifeStage_child: 'Child',
    lifeStage_adolescent: 'Adolescent',
    lifeStage_adult: 'Adult',
    lifeStage_elder: 'Elder',
    role_worker: 'Worker',
    role_healer: 'Healer',
    role_scientist: 'Scientist',
    role_leader: 'Leader',
    role_trader: 'Trader',
    role_crafter: 'Crafter',
    role_guard: 'Guard',
    role_counselor: 'Counselor',
    role_entrepreneur: 'Entrepreneur',
    role_none: 'None',
    // Cultures & Religions
    culture_none: 'None',
    religion_none: 'None',
    // ControlPanel.tsx
    controlPanel_step: 'Step',
    controlPanel_run: 'Run',
    controlPanel_reset: 'Reset',
    controlPanel_generateWorld: 'Generate World',
    controlPanel_addWithAI: 'Add with AI',
    // CreateObjectPanel.tsx
    create_createNew: 'Create New',
    create_agent: 'Agent',
    create_entity: 'Entity',
    create_action: 'Action',
    create_name: 'Name',
    create_description: 'Description',
    create_beliefsPlaceholder: 'Beliefs (JSON format e.g. {"key":0.5})',
    create_beliefKeyPlaceholder: 'Belief Key (optional)',
    create_genome_placeholder: 'Genes (e.g. G-AGILE, G-SOCIAL)',
    create_generate_genes_title: 'Generate random genes',
    create_generate_random_name: 'Generate random name',
    create_generate_random_description: 'Generate random description',
    create_generate_random_beliefs: 'Generate random beliefs',
    create_create: 'Create',
    create_invalidJson: 'Invalid JSON for beliefs. Please use {"key": value} format.',
    create_role_label: 'Role:',
    create_randomize_personality: 'Randomize Personality',
    create_mechanical_effects: 'Mechanical Effects (Optional)',
    create_costs_placeholder: 'Costs (JSON, e.g. {"wood": 5})',
    create_stat_changes_label: 'Stat Changes (Deltas)',
    create_skill_gain_label: 'Skill Gain',
    stat_health: 'Health',
    stat_hunger: 'Hunger',
    stat_thirst: 'Thirst',
    stat_fatigue: 'Fatigue',
    stat_stress: 'Stress',
    stat_currency: 'Currency',
    create_skill_to_gain: 'Skill',
    create_amount: 'Amount',
    // LogPanel.tsx
    logPanel_eventLog: 'Event Log',
    // WorldGraph.tsx
    worldGraph_title: 'World Map',
    // ExporterPanel.tsx
    stateManagement_title: 'Save & Load State',
    stateManagement_save: 'Save Full State',
    stateManagement_load: 'Load Full State',
    stateManagement_advanced: 'Advanced Export Options',
    export_env: 'Export Environment Only',
    export_agents: 'Export Agents Only',
    export_entities: 'Export Entities Only',
    export_conversations: 'Export All Conversations (.md)',
    export_statistics: 'Export Statistics',
    // AdminPanel.tsx
    admin_title: 'Admin Control Panel',
    admin_politicalManagement: 'Political Management',
    admin_currentLeader: 'Current Leader',
    admin_startElection: 'Start Election',
    admin_setLeader: 'Set Leader',
    admin_selectAgent: 'Select an Agent',
    admin_laws: 'Laws',
    admin_addLaw: 'Add Law',
    admin_lawName: 'Law Name',
    admin_violatingAction: 'Violating Action Name',
    admin_techManagement: 'Technology Management',
    admin_researchPoints: 'Research Points',
    admin_unlock: 'Unlock',
    admin_envOverride: 'Environment Override',
    admin_updateEnv: 'Update Environment',
    admin_ruleEditor: 'World Rule Editor',
    admin_createAction: 'Create New Action',
    admin_createActionBtn: 'Create Action',
    admin_existingActions: 'Existing Actions',
    admin_agentManagement: 'Agent Management',
    admin_resurrect: 'Resurrect',
    admin_set: 'Set',
    admin_sicknessPlaceholder: 'None',
    admin_imprison: 'Imprison',
    admin_imprisonDuration: 'Duration (steps)',
    // Election
    election_title: 'Election',
    election_status_active: 'Active until step {endDate}',
    election_status_inactive: 'Inactive',
    election_status_none: 'No election',
    // View Toggles
    viewtoggle_left: 'Toggle Left Panel',
    viewtoggle_agentcard: 'Toggle Agent Card',
    viewtoggle_map: 'Toggle World Map',
    viewtoggle_right: 'Toggle Right Panel',
    // Analytics Dashboard
    analytics_title: 'Advanced Analytics',
    analytics_tab_social: 'Social Network',
    analytics_tab_economic: 'Economic Flow',
    analytics_tab_cultural: 'Cultural Spread',
    analytics_tab_tech: 'Technology',
    analytics_time_window: 'Time Window (Steps)',
    analytics_social_no_relations: 'No significant relationships to display.',
    analytics_eco_no_transactions: 'No economic transactions in the selected time window.',
    analytics_tech_progress: 'Research Progress',
    // Statistics Report
    stats_report_title: 'Statistics Report',
    stats_marriages: 'Marriages',
    stats_births: 'Births',
    stats_imprisonments: 'Imprisonments',
    stats_fights: 'Fights',
    // AI Prompts
    reason_for_imprisonment_unknown: "You are not entirely sure what specific event led to your arrest, which is confusing and frustrating.",
    // Action Logs
    log_action_eat: '🍎 {agentName} eats some food, reducing their hunger.',
    log_action_eat_no_food: '{agentName} wants to eat, but has no food in their inventory.',
    log_action_drink: '💧 {agentName} drinks from {sourceName}, quenching their thirst.',
    log_action_drink_no_source: '{agentName} is thirsty, but cannot find a water source nearby.',
    log_action_gather_food: '🧺 {agentName} gathers {amount} food from {sourceName}.',
    log_action_gather_food_no_source: '{agentName} looks for food, but finds no sources nearby.',
    log_action_gather_fail_private: '{agentName} tries to gather from {resourceName}, but it is privately owned.',
    log_action_gather_wood: '🪵 {agentName} gathers {amount} wood from {sourceName}.',
    log_action_gather_wood_no_source: '{agentName} looks for wood, but finds no sources nearby.',
    log_action_build_shelter: '🏡 {agentName} uses 10 wood to build a small shelter.',
    log_action_build_shelter_no_wood: '{agentName} wants to build a shelter but needs {woodCost} wood.',
    log_action_move_towards_resource: '{agentName} moves towards {resourceName}.',
    log_action_move_towards_agent: '{agentName} moves towards {targetName}.',
    log_action_move: '{agentName} moves {direction} to ({x}, {y}).',
    log_action_custom: 'Custom action "{actionName}" executed by {agentName}.',
    log_action_fight: '💥 {agentName1} and {agentName2} got into a fight!',
    log_action_steal_success: '✋ {stealer} stole 1 {item} from {victim}!',
    log_action_steal_fail: ' botched a theft attempt on {victim} and was caught!',
    log_action_steal_no_target: '{agentName} looked for someone to steal from, but found no suitable targets.',
    log_action_rest: '💤 {agentName} rests and recovers health to {newHealth}.',
    log_action_rest_and_cured: '💤 {agentName} rests, recovers, and feels their {sickness} subsiding!',
    log_action_talk: '💬 {speakerName} says to {listenerName}: "{dialogue}"',
    log_action_talk_no_one_near: '{agentName} wanted to talk, but no one was nearby.',
    log_action_talk_failed: '{agentName} tried to start a conversation, but got lost in thought.',
    log_survival_starving: '‼️ {agentName} is starving and losing health!',
    log_survival_dehydrated: '‼️ {agentName} is dehydrated and losing health!',
    log_survival_sickness: '🤢 {agentName} is suffering from {sickness} and loses health.',
    log_survival_succumbed_needs: '💀 {agentName} has succumbed to hunger or thirst.',
    log_execution_deceased: '{agentName} cannot execute actions as they are deceased.',
    log_execution_actionNotFound: '{agentName} could not find a matching action for prompt: "{prompt}"',
    log_execution_imprisoned: '{agentName} cannot perform actions while imprisoned.',
    log_action_fail_role: '{agentName} cannot perform this action, requires role: {requiredRole}.',
    log_action_work_for_money: '💰 {agentName} works for a day, earning {amount}$.',
    log_action_found_company_success: '🏢 {agentName} founded a company by buying the property "{resourceName}" for {cost}$ and became an entrepreneur!',
    log_action_found_company_fail_funds: '{agentName} wants to found a company, but cannot afford the {cost}$ price.',
    log_action_found_company_fail_none: '{agentName} looked for property to buy to found a company, but none was available.',
    log_action_work_for_company_success: '💼 {agentName} worked at {resourceName} for {ownerName} and earned {wage}$!',
    log_action_work_for_company_fail_none: '{agentName} looked for work, but no companies were hiring nearby.',
    log_action_work_for_company_fail_no_owner: '{agentName} tried to work, but the owner could not be found.',
    log_action_work_for_company_fail_owner_broke: "{agentName} wanted to work for {ownerName}, but they couldn't afford the wage.",
    log_action_work_for_company_fail_no_resources: "{agentName} tried to work at {resourceName}, but it has been depleted.",
    log_action_mine_iron: '⛏️ {agentName} mines {amount} iron from {sourceName}.',
    log_action_mine_iron_no_source: '{agentName} looks for iron, but finds no sources nearby.',
    log_action_craft_success: '🛠️ {agentName} successfully crafted a {itemName}.',
    log_action_craft_fail_ingredients: '{agentName} tried to craft a {itemName} but lacked ingredients.',
    log_action_craft_fail_skill: '{agentName} lacks the skill ({skill} {level}) to craft.',
    log_action_craft_fail_tech: '{agentName} lacks the technology ({tech}) to craft.',
    log_action_market_list_item: '📈 {agentName} listed 1 {item} on the market for a system price of {price}$.',
    log_action_market_buy_item: '🛒 {agentName} bought 1 {item} from {sellerName} for {price}$.',
    log_action_market_too_far: '{agentName} is too far from the marketplace to trade.',
    log_action_market_no_items: '{agentName} went to the market but has nothing to sell.',
    log_action_market_is_empty: '{agentName} visited the market, but it was empty.',
    log_action_market_cannot_afford: '{agentName} could not afford any items at the market.',
    log_law_violation: '⚖️ {agentName} violated the "{lawName}" law and was fined {punishment}$.',
    log_law_violation_arrest: '⚖️ Guard {guardName} witnessed {criminalName} breaking the law and arrested them!',
    log_action_arrest_success: '⛓️ {guardName} arrested {criminalName} and sent them to jail.',
    log_action_release_from_jail: '{agentName} has served their time and is released from jail.',
    log_action_patrol: '🛡️ Guard {agentName} is patrolling the area.',
    log_election_started: '🗳️ An election for a new leader has begun!',
    log_election_winner: '🏆 {winnerName} has won the election with {votes} votes and is the new leader!',
    log_election_no_winner: 'The election ended with no winner. {oldLeaderName} remains in power.',
    log_action_vote_cast: '{agentName} voted for {candidateName}.',
    log_action_vote_no_election: '{agentName} wants to vote, but there is no active election.',
    log_action_vote_no_candidates: '{agentName} wants to vote, but there are no candidates.',
    log_action_vote_undecided: '{agentName} could not decide who to vote for.',
    log_action_run_for_election_success: '{agentName} has announced their candidacy for leader!',
    log_action_run_for_election_no_election: '{agentName} wants to run, but there is no active election.',
    log_action_run_for_election_already_running: '{agentName} is already running for leader.',
    log_action_run_for_election_low_status: '{agentName} lacks the social status to run for leader.',
    log_action_enact_law_success: '📜 Leader {agentName} has enacted a new law: "{lawName}".',
    log_action_enact_law_not_leader: '{agentName} tried to enact a law, but is not the leader.',
    log_action_enact_law_exists: 'Leader {agentName} tried to enact law "{lawName}", but it already exists.',
    log_tech_unlocked: '💡 The {cultureName} culture has discovered {techName}!',
    log_leader_unlocks_governance: '👑 As {leaderName} becomes leader, their culture, {cultureName}, gains insight into Governance!',
    log_action_research: '🔬 Scientist {agentName} contributes {points} points to their culture\'s research.',
    log_action_research_no_culture: '{agentName} cannot research without a culture.',
    log_action_share_knowledge: '🤝 {agentName1} and {agentName2} share insights, boosting research.',
    log_action_share_knowledge_no_one: '{agentName} looked for another scientist to collaborate with, but found none.',
    log_action_wander_thoughtfully: '{agentName} wanders thoughtfully.',
    log_goal_generated: '💡 {agentName} has a new goal: {goalDescription}',
    log_promotion: '🎉 {agentName} has been promoted to a new role: {newRole}!',
    log_action_propose_marriage_success: '💍 {agentName} proposes to {targetName}!',
    log_action_propose_marriage_fail: '{targetName} is not interested in {agentName}\'s proposal.',
    log_action_propose_no_one_suitable: '{agentName} wants to propose, but finds no one suitable nearby.',
    log_action_propose_fail_already_married: '{agentName} tried to propose, but is already married.',
    log_action_accept_proposal_success: '💒 {agentName} accepts {targetName}\'s proposal! They are now married.',
    log_action_accept_proposal_none: '{agentName} has no pending proposals to accept.',
    log_action_reproduce_success: '❤️ Congratulations! {agentName} and {partnerName} are having a child!',
    log_action_reproduce_fail: '{agentName} and {partnerName} tried to have a child, but it was not the right time.',
    log_action_reproduce_fail_age: '{agentName} (or partner {partnerName}) is not in the right age range to have children.',
    log_action_reproduce_fail_max_offspring: '{agentName} and {partnerName} have already reached the maximum number of children.',
    log_action_reproduce_no_partner: '{agentName} wants a child, but has no partner or is not near them.',
    log_action_insemination_success: '🔬 Science prevails! {agentName} successfully conceived a child through artificial insemination.',
    log_action_insemination_fail: '🔬 The artificial insemination procedure for {agentName} failed.',
    log_action_insemination_fail_funds: '{agentName} cannot afford the {cost}$ for artificial insemination.',
    log_new_child: '👶 A new child, {childName}, was born to {parent1Name} and {parent2Name}.',
    log_action_mentor_success: '🎓 {mentorName} successfully mentors {studentName} in the skill of {skill}.',
    log_action_mentor_fail_skill: '{agentName} wanted to mentor, but lacks sufficient expertise.',
    log_action_mentor_no_one: '{agentName} looked for a young agent to mentor, but found no one suitable.',
    log_action_seek_counseling: '{agentName} is seeking counseling from {counselorName}.',
    log_action_seek_counseling_fail: '{agentName} wanted to seek counseling, but no counselors are available.',
    log_action_provide_counseling_success: '🛋️ Counselor {counselorName} provides a helpful session to {patientName}, reducing their stress.',
    log_action_provide_counseling_fail: '{agentName} looked for someone to counsel, but found no one in need.',
    log_action_meditate: '🧘 {agentName} meditates, finding a moment of peace.',
    log_action_meditate_inspiration: '💡 {agentName} has an epiphany while meditating!',
    log_action_mourn: '🖤 {agentName} takes a moment to mourn.',
    log_action_forgive_no_rival: '{agentName} considered offering forgiveness, but has no one to forgive.',
    log_action_forgive_success: '🕊️ {agentName} forgave {rivalName}, ending their rivalry.',
    log_action_confront_no_partner: '{agentName} feels jealous but has no partner to confront.',
    log_action_confront_success: '😠 {agentName} confronts {partnerName} out of jealousy, increasing tension.',
    personality_title: 'Personality Traits',
    personality_openness: 'Openness',
    personality_conscientiousness: 'Conscientiousness',
    personality_extraversion: 'Extraversion',
    personality_agreeableness: 'Agreeableness',
    personality_neuroticism: 'Neuroticism',
    psyche_empathy: 'Empathy',
    psyche_vengefulness: 'Vengefulness',
    psyche_forgiveness: 'Forgiveness',
    psyche_searchForMeaning: 'Search for Meaning',
    psyche_decisionPressure: 'Decision Pressure',
    psyche_fearOfDeath: 'Fear of Death',
    psyche_boredom: 'Boredom',
    psyche_inspiration: 'Inspiration',
    psyche_fanaticism: 'Fanaticism',
    psyche_spiritualNeed: 'Spiritual Need',
    psyche_jealousy: 'Jealousy',
    emotion_shame: 'Shame',
    emotion_pride: 'Pride',
    emotion_grief: 'Grief',
    skill_healing: 'Healing',
    skill_woodcutting: 'Woodcutting',
    skill_rhetoric: 'Rhetoric',
    skill_combat: 'Combat',
    skill_construction: 'Construction',
    skill_farming: 'Farming',
    skill_mining: 'Mining',
    skill_crafting: 'Crafting',
    skill_trading: 'Trading',
    goal_becomeLeader: 'Become Leader',
    goal_buildLargeHouse: 'Build a House',
    goal_masterSkill: 'Master a Skill',
    goal_avengeRival: 'Avenge Rival',
    goal_achieveWealth: 'Achieve Wealth',
    goal_mentorYoungAgent: 'Mentor a Young Agent',
    goal_seekCounseling: 'Seek Counseling',
    goal_findMeaning: 'Find Meaning',
    goal_forgiveRival: 'Forgive Rival',
    goal_expressGrief: 'Express Grief',
    tech_agriculture: 'Agriculture',
    tech_metallurgy: 'Metallurgy',
    tech_writing: 'Writing',
    tech_chemistry: 'Chemistry',
    tech_governance: 'Governance',
    tech_bioengineering: 'Bioengineering',
  },
  de: {
    // App.tsx
    realitySimAI: 'RealitySim KI',
    agents: 'Agenten',
    deceased: 'Verstorben',
    entities: 'Entitäten',
    environment: 'Umgebung',
    availableActions: 'Verfügbare Aktionen',
    agentCard_selectAgent: 'Wähle einen Agenten aus, um Details anzuzeigen.',
    confirmDelete: 'Möchtest du diesen {type} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    type_agent: 'Agent',
    type_entity: 'Entität',
    type_action: 'Aktion',
    processingSteps: 'Verarbeite Schritt(e)...',
    // Logs
    log_simulationInitialized: 'Simulation initialisiert.',
    log_simulationStepped: 'Simulation einen Schritt weiter.',
    log_simulationRanSteps: 'Simulation lief für {steps} Schritte.',
    log_simulationReset: 'Simulation auf Anfangszustand zurückgesetzt.',
    log_agentProcessingPrompt: 'Agent {agentId} verarbeitet Befehl: "{prompt}" (mit {aiInfo})',
    log_aiSuggestedAction: 'KI schlug Aktion vor: "{action}"',
    log_aiFailed: 'KI konnte keine passende Aktion finden. Keine Aktion ausgeführt.',
    log_aiError: 'Fehler bei der KI-API: {error}',
    error_lmStudio_cors: 'Verbindung zu LM Studio fehlgeschlagen. Dies ist normalerweise ein Cross-Origin Resource Sharing (CORS) Problem. Bitte überprüfe Folgendes in deiner LM Studio Anwendung: 1. Gehe zum "Local Server" Tab. 2. Stelle sicher, dass der Server "Running" ist. 3. **Wichtig: Finde die "CORS" Option und stelle sicher, dass sie aktiviert ist.** 4. Überprüfe, ob die URL in den Einstellungen dieser App mit der in LM Studio angezeigten übereinstimmt.',
    error_lmStudio_url_invalid: "Ungültiges LM Studio URL-Format. Bitte gib eine gültige Basis-URL wie 'http://localhost:1234' an.",
    error_gemini_no_key: 'Google Gemini API-Schlüssel nicht in Umgebungsvariablen gefunden. Bitte sicherstellen, dass er gesetzt ist.',
    log_createdAgent: 'Neuer Agent erstellt: {name}',
    log_createdEntity: 'Neue Entität erstellt: {name}',
    log_createdAction: 'Neue Aktion erstellt: {name}',
    log_removed: '{type} entfernt: {name}',
    log_adminSetHealth: "Admin hat die Gesundheit von {name} auf {health} gesetzt.",
    log_adminSetPosition: "Admin hat die Position von {name} auf ({x}, {y}) gesetzt.",
    log_adminInflictedSickness: "Admin hat {name} mit {sickness} infiziert.",
    log_adminCured: 'Admin hat {name} geheilt.',
    log_adminResurrected: 'Admin hat {name} wiederbelebt.',
    log_adminModifiedEnv: 'Admin hat die Umgebung direkt modifiziert.',
    log_exported: 'Teil-Daten exportiert: {type}.',
    log_stateSaved: 'Simulationszustand in Datei gespeichert.',
    log_stateLoaded: 'Simulationszustand erfolgreich aus Datei geladen.',
    log_loadError: 'Fehler beim Laden des Zustands aus Datei: {error}',
    log_runningSimulation: 'Führe Simulation für {steps} Schritte aus...',
    log_generating: 'Generiere...',
    log_generatingWorld: 'Generiere Welt...',
    log_worldGenerated: 'Neue Welt erfolgreich verarbeitet.',
    log_worldGenerated_warning: '⚠️ KI hat {genAgents}/{reqAgents} Agenten und {genEntities}/{reqEntities} Entitäten generiert. Fahre mit generierten Ergebnissen fort.',
    log_generatingAgents: 'Generiere {count} neue Agenten...',
    log_generatingEntities: 'Generiere {count} neue Entitäten...',
    log_addedAgents: '{count} neue Agenten zur Welt hinzugefügt.',
    log_addedEntities: '{count} neue Entitäten zur Welt hinzugefügt.',
    log_configure_ai_full: 'KI-Anbieter nicht konfiguriert. Bitte öffne die Einstellungen, um einen KI-Anbieter auszuwählen und zu konfigurieren.',
    log_adminSetCurrency: "Admin hat die Währung von {name} auf {currency}$ gesetzt.",
    log_adminRepealedLaw: "Admin hat das Gesetz aufgehoben: {lawName}.",
    log_adminSetLeader: "Admin hat {name} zum neuen Anführer ernannt.",
    log_adminUnlockedTech: "Admin hat Technologie \"{techId}\" für {cultureName} freigeschaltet.",
    log_adminImprisoned: "Admin hat {name} für {duration} Schritte inhaftiert.",
    log_psychoanalysis_applied: '🧬 Psychoanalyse-Ergebnisse wurden in die Psyche von {agentName} integriert.',
    log_grief: '💔 {agentName} wird von Trauer über den Tod von {deceasedName} erfasst.',
    log_sickness_spread: '☣️ {infectedName} hat sich bei {sourceName} mit {sickness} angesteckt!',
    log_action_custom_success: '{agentName} hat die benutzerdefinierte Aktion erfolgreich ausgeführt: "{actionName}".',
    log_action_custom_fail_cost: '{agentName} versuchte, "{actionName}" auszuführen, aber es fehlten {amount} {item}.',
    // Settings
    settings_title: 'Einstellungen',
    settings_aiProvider_label: 'KI-Anbieter',
    settings_lmStudioUrl_label: 'LM Studio API-Endpunkt',
    settings_lmStudioUrl_description: 'Gib die Basis-URL von deinem lokalen LM Studio Server ein (z.B. http://localhost:1234). Der API-Pfad wird automatisch hinzugefügt.',
    settings_lmStudioModel_label: 'Modellname',
    settings_lmStudioModel_description: 'Gib den API-Identifier des Modells aus LM Studio für Chat-Antworten ein (z.B. google/gemma-2b-it). Dieses Modell muss auf dem Server geladen sein.',
    settings_lmStudioEmbeddingModel_label: 'Embedding-Modellname (optional)',
    settings_lmStudioEmbeddingModel_description: 'Gib den Modell-Identifier für Embeddings ein. Wenn leer, wird das Chat-Modell verwendet. Dieses Modell muss auf deinem LM Studio Server geladen und für den Embedding-Endpunkt ausgewählt sein.',
    settings_geminiModel_label: 'Gemini-Modell',
    settings_geminiModel_description: 'Wähle das zu verwendende Google Gemini Modell.',
    settings_geminiApiKey_label: 'Gemini API-Schlüssel',
    settings_geminiApiKey_value: 'Geladen aus Umgebungsvariable',
    settings_geminiApiKey_description: 'Dein Google AI API-Schlüssel muss als Umgebungsvariable mit dem Namen API_KEY verfügbar sein.',
    settings_save: 'Speichern',
    settings_cancel: 'Abbrechen',
    // Generate World Modal
    generateWorldModal_title: 'Neue Welt generieren',
    generateWorldModal_agentsLabel: 'Anzahl der Agenten',
    generateWorldModal_agentsDescription: 'Wie viele Agenten sollen die neue Welt bevölkern?',
    generateWorldModal_entitiesLabel: 'Entitäten',
    generateWorldModal_entitiesDescription: 'Gib an, wie viele von jedem Entitätstyp in der neuen Welt existieren sollen. Marktplatz und Gefängnis werden in der Anzahl der Gebäude berücksichtigt.',
    generateWorldModal_generate: 'Generieren',
    // Generate Content Modal
    generateContent_title: 'Inhalte mit KI generieren',
    generateContent_addAgents: 'Neue Agenten hinzufügen',
    generateContent_addEntities: 'Neue Entitäten hinzufügen',
    generateContent_agentsLabel: 'Anzahl neuer Agenten',
    generateContent_agentsDescription: 'Wie viele neue Agenten sollen generiert und zur Welt hinzugefügt werden?',
    generateContent_entitiesLabel: 'Anzahl neuer Entitäten',
    generateContent_entitiesDescription: 'Wie viele neue Entitäten/Ressourcen sollen generiert und zur Welt hinzugefügt werden?',
    generateContent_generateAgentsBtn: 'Agenten generieren',
    generateContent_generateEntitiesBtn: 'Entitäten generieren',
    generateContent_foodSources: 'Nahrungsquellen',
    generateContent_waterSources: 'Wasserquellen',
    generateContent_woodSources: 'Holzquellen',
    generateContent_ironSources: 'Eisenquellen',
    generateContent_buildings: 'Gebäude/Objekte',
    generateContent_entitiesDescriptionCategorized: 'Gib an, wie viele von jedem Entitätstyp generiert und zur Welt hinzugefügt werden sollen.',
    // AgentCard.tsx
    agentCard_statusAndNeeds: 'Status & Bedürfnisse',
    agentCard_age: 'Alter',
    agentCard_culture: 'Kultur',
    agentCard_religion: 'Religion',
    agentCard_role: 'Rolle',
    world_leader: 'Aktueller Anführer',
    agentCard_lifeStage: 'Lebensphase',
    agentCard_health: 'Gesundheit',
    agentCard_hunger: 'Hunger',
    agentCard_thirst: 'Durst',
    agentCard_fatigue: 'Müdigkeit',
    agentCard_sickness: 'Krankheit',
    agentCard_stress: 'Stress',
    agentCard_socialStatus: 'Sozialstatus',
    agentCard_currency: 'Währung',
    agentCard_healthy: 'Gesund',
    agentCard_deceased: 'VERSTORBEN',
    agentCard_imprisoned: 'INHAFTIERT',
    agentCard_release_at: 'Freilassung bei Schritt:',
    agentCard_beliefs: 'Überzeugungen',
    agentCard_emotions: 'Situative Emotionen',
    agentCard_interact: 'Interagieren',
    agentCard_promptPlaceholder: 'Befehl für {name} (KI interpretiert)...',
    agentCard_promptPlaceholderRaw: 'Exakten Aktionsnamen eingeben...',
    agentCard_promptPlaceholderDeceased: '{name} kann nicht antworten.',
    agentCard_useAi: 'KI verwenden',
    agentCard_noBeliefs: 'Keine Überzeugungen',
    agentCard_noEmotions: 'Keine Emotionen',
    agentCard_relationships: 'Beziehungen',
    agentCard_noRelationships: 'Keine Beziehungen etabliert.',
    agentCard_inventory: 'Inventar',
    agentCard_noInventory: 'Inventar ist leer.',
    agentCard_personality: 'Persönlichkeit',
    agentCard_skills: 'Fähigkeiten',
    agentCard_goals: 'Aktive Ziele',
    agentCard_noGoals: 'Keine aktiven Ziele.',
    agentCard_trauma: 'Traumata',
    agentCard_noTrauma: 'Keine Traumata verzeichnet.',
    agentCard_tech: 'Bekannte Technologien',
    agentCard_noTech: 'Keine Technologien bekannt.',
    agentCard_noData: 'Keine Daten.',
    agentCard_genome: 'Genom & Merkmale',
    agentCard_noGenome: 'Keine nennenswerten genetischen Merkmale.',
    agentCard_property: 'Eigentum',
    agentCard_noProperty: 'Besitzt kein Eigentum.',
    agentCard_longTermMemory: 'Langzeitgedächtnis',
    agentCard_noMemories: 'Keine Erinnerungen aufgezeichnet.',
    agentCard_family: 'Familie',
    agentCard_child_relation: 'Kind',
    agentCard_no_children: 'Keine Kinder.',
    agentCard_jailJournal: 'Gefängnistagebuch',
    agentCard_noJournalEntries: 'Noch keine Tagebucheinträge.',
    // Psychoanalysis
    psychoanalysis_title: 'Psychologisches Profil',
    psyche_title: 'Psyche & Triebe',
    psychoanalysis_generate_button: 'Psychologisches Profil ansehen',
    psychoanalysis_generating: 'Generiere Profil...',
    report_psychodynamik: 'Psychodynamik',
    report_persoenlichkeitsbild: 'Persönlichkeitsbild',
    report_beziehungsdynamik: 'Beziehungsdynamik',
    report_trauma: 'Traumatische Spuren oder psychische Belastung',
    report_kultur: 'Kulturelle & spirituelle Verarbeitung',
    report_projektionen: 'Projektionen oder Verschiebungen',
    report_empfehlung: 'Therapeutische Empfehlung',
    // Genes
    'gene_G-RESISTANT': 'Resistent',
    'gene_G-AGILE': 'Agil',
    'gene_G-SOCIAL': 'Sozial',
    'gene_G-LONGEVITY': 'Langlebigkeit',
    'gene_G-FASTHEAL': 'Schnellheilung',
    'gene_G-INTELLIGENT': 'Intelligent',
    'gene_G-FERTILE': 'Fruchtbar',
    'gene_desc_G-RESISTANT': 'Reduziert Gesundheitsverlust durch Krankheit und erhöht die Heilungschance.',
    'gene_desc_G-AGILE': 'Bewegt sich schneller (2 Schritte statt 1).',
    'gene_desc_G-SOCIAL': 'Initiert eher Gespräche.',
    'gene_desc_G-LONGEVITY': 'Reduziert Gesundheitsverlust durch hohes Alter.',
    'gene_desc_G-FASTHEAL': 'Stellt mehr Gesundheit beim Ausruhen wieder her.',
    'gene_desc_G-INTELLIGENT': 'Lernt Fähigkeiten und Forschungspunkte schneller.',
    'gene_desc_G-FERTILE': 'Erhöhte Chance auf erfolgreiche Fortpflanzung.',
    // Resource & Item Types
    resource_food: 'Nahrung',
    resource_water: 'Wasser',
    resource_wood: 'Holz',
    resource_medicine: 'Medizin',
    resource_iron: 'Eisen',
    item_food: 'Nahrung',
    item_water: 'Wasser',
    item_wood: 'Holz',
    item_medicine: 'Medizin',
    item_iron: 'Eisen',
    item_sword: 'Schwert',
    item_plow: 'Pflug',
    item_advanced_medicine: 'Fortschrittliche Medizin',
    item_iron_ingot: 'Eisenbarren',
    item_local_produce: 'Lokale Produkte',
    // Relationship Types
    relationship_stranger: 'Fremder',
    relationship_acquaintance: 'Bekannter',
    relationship_friend: 'Freund',
    relationship_rival: 'Rivale',
    relationship_partner: 'Partner',
    relationship_spouse: 'Ehepartner',
    'relationship_ex-partner': 'Ex-Partner',
    // Life Stages & Roles
    lifeStage_child: 'Kind',
    lifeStage_adolescent: 'Jugendlicher',
    lifeStage_adult: 'Erwachsener',
    lifeStage_elder: 'Ältester',
    role_worker: 'Arbeiter',
    role_healer: 'Heiler',
    role_scientist: 'Wissenschaftler',
    role_leader: 'Anführer',
    role_trader: 'Händler',
    role_crafter: 'Handwerker',
    role_guard: 'Wache',
    role_counselor: 'Berater',
    role_entrepreneur: 'Unternehmer',
    role_none: 'Keine',
    // Cultures & Religions
    culture_none: 'Keine',
    religion_none: 'Keine',
    // ControlPanel.tsx
    controlPanel_step: 'Schritt',
    controlPanel_run: 'Laufen',
    controlPanel_reset: 'Zurücksetzen',
    controlPanel_generateWorld: 'Welt generieren',
    controlPanel_addWithAI: 'Mit KI hinzufügen',
    // CreateObjectPanel.tsx
    create_createNew: 'Neu erstellen',
    create_agent: 'Agent',
    create_entity: 'Entität',
    create_action: 'Aktion',
    create_name: 'Name',
    create_description: 'Beschreibung',
    create_beliefsPlaceholder: 'Überzeugungen (JSON-Format z.B. {"key":0.5})',
    create_beliefKeyPlaceholder: 'Belief Key (optional)',
    create_genome_placeholder: 'Gene (z.B. G-AGILE, G-SOCIAL)',
    create_generate_genes_title: 'Zufällige Gene generieren',
    create_generate_random_name: 'Zufälligen Namen generieren',
    create_generate_random_description: 'Zufällige Beschreibung generieren',
    create_generate_random_beliefs: 'Zufällige Überzeugungen generieren',
    create_create: 'Erstellen',
    create_invalidJson: 'Ungültiges JSON für Überzeugungen. Bitte Format {"key": value} verwenden.',
    create_role_label: 'Rolle:',
    create_randomize_personality: 'Zufällige Persönlichkeit',
    create_mechanical_effects: 'Mechanische Auswirkungen (Optional)',
    create_costs_placeholder: 'Kosten (JSON, z.B. {"wood": 5})',
    create_stat_changes_label: 'Status-Änderungen (Deltas)',
    create_skill_gain_label: 'Fähigkeits-Gewinn',
    stat_health: 'Gesundheit',
    stat_hunger: 'Hunger',
    stat_thirst: 'Durst',
    stat_fatigue: 'Müdigkeit',
    stat_stress: 'Stress',
    stat_currency: 'Währung',
    create_skill_to_gain: 'Fähigkeit',
    create_amount: 'Menge',
    // LogPanel.tsx
    logPanel_eventLog: 'Ereignisprotokoll',
    // WorldGraph.tsx
    worldGraph_title: 'Weltkarte',
    // ExporterPanel.tsx
    stateManagement_title: 'Zustand speichern & laden',
    stateManagement_save: 'Ganzen Zustand speichern',
    stateManagement_load: 'Ganzen Zustand laden',
    stateManagement_advanced: 'Erweiterte Exportoptionen',
    export_env: 'Nur Umgebung exportieren',
    export_agents: 'Nur Agenten exportieren',
    export_entities: 'Nur Entitäten exportieren',
    export_conversations: 'Alle Gespräche exportieren (.md)',
    export_statistics: 'Statistiken exportieren',
    // AdminPanel.tsx
    admin_title: 'Admin-Kontrollpanel',
    admin_politicalManagement: 'Politische Verwaltung',
    admin_currentLeader: 'Aktueller Anführer',
    admin_startElection: 'Wahl starten',
    admin_setLeader: 'Anführer setzen',
    admin_selectAgent: 'Agent auswählen',
    admin_laws: 'Gesetze',
    admin_addLaw: 'Gesetz hinzufügen',
    admin_lawName: 'Gesetzname',
    admin_violatingAction: 'Verletzende Aktion',
    admin_techManagement: 'Technologieverwaltung',
    admin_researchPoints: 'Forschungspunkte',
    admin_unlock: 'Freischalten',
    admin_envOverride: 'Umgebung überschreiben',
    admin_updateEnv: 'Umgebung aktualisieren',
    admin_ruleEditor: 'Weltregel-Editor',
    admin_createAction: 'Neue Aktion erstellen',
    admin_createActionBtn: 'Aktion erstellen',
    admin_existingActions: 'Bestehende Aktionen',
    admin_agentManagement: 'Agentenverwaltung',
    admin_resurrect: 'Wiederbeleben',
    admin_set: 'Setzen',
    admin_sicknessPlaceholder: 'Keine',
    admin_imprison: 'Inhaftieren',
    admin_imprisonDuration: 'Dauer (Schritte)',
    // Election
    election_title: 'Wahl',
    election_status_active: 'Aktiv bis Schritt {endDate}',
    election_status_inactive: 'Inaktiv',
    election_status_none: 'Keine Wahl',
    // View Toggles
    viewtoggle_left: 'Linkes Panel umschalten',
    viewtoggle_agentcard: 'Agentenkarte umschalten',
    viewtoggle_map: 'Weltkarte umschalten',
    viewtoggle_right: 'Rechtes Panel umschalten',
    // Analytics Dashboard
    analytics_title: 'Erweiterte Analyse',
    analytics_tab_social: 'Soziales Netzwerk',
    analytics_tab_economic: 'Wirtschaftsflüsse',
    analytics_tab_cultural: 'Kulturelle Ausbreitung',
    analytics_tab_tech: 'Technologie',
    analytics_time_window: 'Zeitfenster (Schritte)',
    analytics_social_no_relations: 'Keine signifikanten Beziehungen zum Anzeigen.',
    analytics_eco_no_transactions: 'Keine wirtschaftlichen Transaktionen im ausgewählten Zeitfenster.',
    analytics_tech_progress: 'Forschungsfortschritt',
    // Statistics Report
    stats_report_title: 'Statistik-Bericht',
    stats_marriages: 'Eheschließungen',
    stats_births: 'Geburten',
    stats_imprisonments: 'Inhaftierungen',
    stats_fights: 'Kämpfe',
    // AI Prompts
    reason_for_imprisonment_unknown: "Du bist dir nicht ganz sicher, welches spezifische Ereignis zu deiner Verhaftung geführt hat, was verwirrend und frustrierend ist.",
    // Action Logs
    log_action_eat: '🍎 {agentName} isst etwas und reduziert seinen Hunger.',
    log_action_eat_no_food: '{agentName} möchte essen, hat aber nichts im Inventar.',
    log_action_drink: '💧 {agentName} trinkt aus {sourceName} und löscht seinen Durst.',
    log_action_drink_no_source: '{agentName} ist durstig, kann aber keine Wasserquelle in der Nähe finden.',
    log_action_gather_food: '🧺 {agentName} sammelt {amount} Nahrung von {sourceName}.',
    log_action_gather_food_no_source: '{agentName} sucht nach Nahrung, findet aber keine Quellen in der Nähe.',
    log_action_gather_fail_private: '{agentName} versucht, von {resourceName} zu sammeln, aber es ist in Privatbesitz.',
    log_action_gather_wood: '🪵 {agentName} sammelt {amount} Holz von {sourceName}.',
    log_action_gather_wood_no_source: '{agentName} sucht nach Holz, findet aber keine Quellen in der Nähe.',
    log_action_build_shelter: '🏡 {agentName} benutzt 10 Holz, um einen kleinen Unterschlupf zu bauen.',
    log_action_build_shelter_no_wood: '{agentName} möchte einen Unterschlupf bauen, benötigt aber {woodCost} Holz.',
    log_action_move_towards_resource: '{agentName} bewegt sich in Richtung {resourceName}.',
    log_action_move_towards_agent: '{agentName} bewegt sich in Richtung {targetName}.',
    log_action_move: '{agentName} bewegt sich nach {direction} zu ({x}, {y}).',
    log_action_custom: 'Benutzerdefinierte Aktion "{actionName}" von {agentName} ausgeführt.',
    log_action_fight: '💥 {agentName1} und {agentName2} sind in einen Kampf geraten!',
    log_action_steal_success: '✋ {stealer} hat 1 {item} von {victim} gestohlen!',
    log_action_steal_fail: ' ist bei einem Diebstahlversuch bei {victim} erwischt worden!',
    log_action_steal_no_target: '{agentName} hat nach jemandem zum Bestehlen gesucht, aber kein passendes Ziel gefunden.',
    log_action_rest: '💤 {agentName} ruht sich aus und stellt Gesundheit auf {newHealth} wieder her.',
    log_action_rest_and_cured: '💤 {agentName} ruht sich aus, erholt sich und spürt, wie seine {sickness} nachlässt!',
    log_action_talk: '💬 {speakerName} sagt zu {listenerName}: "{dialogue}"',
    log_action_talk_no_one_near: '{agentName} wollte reden, aber niemand war in der Nähe.',
    log_action_talk_failed: '{agentName} versuchte, ein Gespräch zu beginnen, verlor sich aber in Gedanken.',
    log_survival_starving: '‼️ {agentName} verhungert und verliert Gesundheit!',
    log_survival_dehydrated: '‼️ {agentName} ist dehydriert und verliert Gesundheit!',
    log_survival_sickness: '🤢 {agentName} leidet an {sickness} und verliert Gesundheit.',
    log_survival_succumbed_needs: '💀 {agentName} ist Hunger oder Durst erlegen.',
    log_execution_deceased: '{agentName} kann keine Aktionen ausführen, da er verstorben ist.',
    log_execution_actionNotFound: '{agentName} konnte keine passende Aktion für den Befehl finden: "{prompt}"',
    log_execution_imprisoned: '{agentName} kann im Gefängnis keine Aktionen ausführen.',
    log_action_fail_role: '{agentName} kann diese Aktion nicht ausführen, benötigt Rolle: {requiredRole}.',
    log_action_work_for_money: '💰 {agentName} arbeitet einen Tag und verdient {amount}$.',
    log_action_found_company_success: '🏢 {agentName} hat eine Firma gegründet, indem er das Grundstück "{resourceName}" für {cost}$ gekauft hat und wurde zum Unternehmer!',
    log_action_found_company_fail_funds: '{agentName} möchte eine Firma gründen, kann sich aber den Preis von {cost}$ nicht leisten.',
    log_action_found_company_fail_none: '{agentName} suchte nach einem Grundstück zum Kauf, um eine Firma zu gründen, aber es war keines verfügbar.',
    log_action_work_for_company_success: '💼 {agentName} hat bei {resourceName} für {ownerName} gearbeitet und {wage}$ verdient!',
    log_action_work_for_company_fail_none: '{agentName} suchte nach Arbeit, aber keine Firmen stellten in der Nähe ein.',
    log_action_work_for_company_fail_no_owner: '{agentName} versuchte zu arbeiten, aber der Besitzer konnte nicht gefunden werden.',
    log_action_work_for_company_fail_owner_broke: "{agentName} wollte für {ownerName} arbeiten, aber dieser konnte sich den Lohn nicht leisten.",
    log_action_work_for_company_fail_no_resources: "{agentName} versuchte bei {resourceName} zu arbeiten, aber es war erschöpft.",
    log_action_mine_iron: '⛏️ {agentName} baut {amount} Eisen von {sourceName} ab.',
    log_action_mine_iron_no_source: '{agentName} sucht nach Eisen, findet aber keine Quellen in der Nähe.',
    log_action_craft_success: '🛠️ {agentName} hat erfolgreich einen {itemName} hergestellt.',
    log_action_craft_fail_ingredients: '{agentName} versuchte, einen {itemName} herzustellen, aber es fehlten Zutaten.',
    log_action_craft_fail_skill: '{agentName} fehlt die Fähigkeit ({skill} {level}) zum Herstellen.',
    log_action_craft_fail_tech: '{agentName} fehlt die Technologie ({tech}) zum Herstellen.',
    log_action_market_list_item: '📈 {agentName} hat 1 {item} auf dem Markt für einen Systempreis von {price}$ angeboten.',
    log_action_market_buy_item: '🛒 {agentName} hat 1 {item} von {sellerName} für {price}$ gekauft.',
    log_action_market_too_far: '{agentName} ist zu weit vom Marktplatz entfernt, um zu handeln.',
    log_action_market_no_items: '{agentName} ging zum Markt, hat aber nichts zu verkaufen.',
    log_action_market_is_empty: '{agentName} besuchte den Markt, aber er war leer.',
    log_action_market_cannot_afford: '{agentName} konnte sich keine Artikel auf dem Markt leisten.',
    log_law_violation: '⚖️ {agentName} hat das Gesetz "{lawName}" verletzt und wurde mit {punishment}$ bestraft.',
    log_law_violation_arrest: '⚖️ Wache {guardName} hat {criminalName} beim Gesetzesbruch beobachtet und verhaftet!',
    log_action_arrest_success: '⛓️ {guardName} hat {criminalName} verhaftet und ins Gefängnis geschickt.',
    log_action_release_from_jail: '{agentName} hat seine Zeit abgesessen und wird aus dem Gefängnis entlassen.',
    log_action_patrol: '🛡️ Wache {agentName} patrouilliert das Gebiet.',
    log_election_started: '🗳️ Eine Wahl für einen neuen Anführer hat begonnen!',
    log_election_winner: '🏆 {winnerName} hat die Wahl mit {votes} Stimmen gewonnen und ist der neue Anführer!',
    log_election_no_winner: 'Die Wahl endete ohne Gewinner. {oldLeaderName} bleibt an der Macht.',
    log_action_vote_cast: '{agentName} hat für {candidateName} gestimmt.',
    log_action_vote_no_election: '{agentName} möchte wählen, aber es gibt keine aktive Wahl.',
    log_action_vote_no_candidates: '{agentName} möchte wählen, aber es gibt keine Kandidaten.',
    log_action_vote_undecided: '{agentName} konnte sich nicht entscheiden, für wen er stimmen soll.',
    log_action_run_for_election_success: '{agentName} hat seine Kandidatur für den Anführerposten bekannt gegeben!',
    log_action_run_for_election_no_election: '{agentName} möchte kandidieren, aber es gibt keine aktive Wahl.',
    log_action_run_for_election_already_running: '{agentName} kandidiert bereits für den Anführerposten.',
    log_action_run_for_election_low_status: '{agentName} hat nicht den sozialen Status, um für den Anführerposten zu kandidieren.',
    log_action_enact_law_success: '📜 Anführer {agentName} hat ein neues Gesetz erlassen: "{lawName}".',
    log_action_enact_law_not_leader: '{agentName} versuchte, ein Gesetz zu erlassen, ist aber nicht der Anführer.',
    log_action_enact_law_exists: 'Anführer {agentName} versuchte, das Gesetz "{lawName}" zu erlassen, aber es existiert bereits.',
    log_tech_unlocked: '💡 Die {cultureName}-Kultur hat {techName} entdeckt!',
    log_leader_unlocks_governance: '👑 Da {leaderName} Anführer wird, erlangt dessen Kultur, {cultureName}, Einblicke in die Regierungsführung!',
    log_action_research: '🔬 Wissenschaftler {agentName} trägt {points} Punkte zur Forschung seiner Kultur bei.',
    log_action_research_no_culture: '{agentName} kann ohne Kultur nicht forschen.',
    log_action_share_knowledge: '🤝 {agentName1} und {agentName2} tauschen Erkenntnisse aus und fördern die Forschung.',
    log_action_share_knowledge_no_one: '{agentName} suchte einen anderen Wissenschaftler zur Zusammenarbeit, fand aber keinen.',
    log_action_wander_thoughtfully: '{agentName} wandert nachdenklich umher.',
    log_goal_generated: '💡 {agentName} hat ein neues Ziel: {goalDescription}',
    log_promotion: '🎉 {agentName} wurde in eine neue Rolle befördert: {newRole}!',
    log_action_propose_marriage_success: '💍 {agentName} macht {targetName} einen Heiratsantrag!',
    log_action_propose_marriage_fail: '{targetName} ist an dem Antrag von {agentName} nicht interessiert.',
    log_action_propose_no_one_suitable: '{agentName} möchte einen Antrag machen, findet aber niemanden in der Nähe.',
    log_action_propose_fail_already_married: '{agentName} versuchte einen Antrag zu machen, ist aber bereits verheiratet.',
    log_action_accept_proposal_success: '💒 {agentName} nimmt den Antrag von {targetName} an! Sie sind nun verheiratet.',
    log_action_accept_proposal_none: '{agentName} hat keine offenen Anträge zum Annehmen.',
    log_action_reproduce_success: '❤️ Herzlichen Glückwunsch! {agentName} und {partnerName} bekommen ein Kind!',
    log_action_reproduce_fail: '{agentName} und {partnerName} haben versucht, ein Kind zu bekommen, aber es war nicht der richtige Zeitpunkt.',
    log_action_reproduce_fail_age: '{agentName} (oder Partner {partnerName}) ist nicht im richtigen Alter, um Kinder zu bekommen.',
    log_action_reproduce_fail_max_offspring: '{agentName} und {partnerName} haben bereits die maximale Anzahl an Kindern erreicht.',
    log_action_reproduce_no_partner: '{agentName} möchte ein Kind, hat aber keinen Partner oder ist nicht in dessen Nähe.',
    log_action_insemination_success: '🔬 Die Wissenschaft siegt! {agentName} hat erfolgreich ein Kind durch künstliche Befruchtung empfangen.',
    log_action_insemination_fail: '🔬 Das künstliche Befruchtungsverfahren für {agentName} ist fehlgeschlagen.',
    log_action_insemination_fail_funds: '{agentName} kann sich die {cost}$ für die künstliche Befruchtung nicht leisten.',
    log_new_child: '👶 Ein neues Kind, {childName}, wurde von {parent1Name} und {parent2Name} geboren.',
    log_action_mentor_success: '🎓 {mentorName} unterrichtet erfolgreich {studentName} in der Fähigkeit {skill}.',
    log_action_mentor_fail_skill: '{agentName} wollte unterrichten, hat aber nicht genügend Fachwissen.',
    log_action_mentor_no_one: '{agentName} suchte einen jungen Agenten zum Unterrichten, fand aber niemanden Geeigneten.',
    log_action_seek_counseling: '{agentName} sucht Beratung bei {counselorName}.',
    log_action_seek_counseling_fail: '{agentName} wollte Beratung suchen, aber es sind keine Berater verfügbar.',
    log_action_provide_counseling_success: '🛋️ Berater {counselorName} gibt {patientName} eine hilfreiche Sitzung, was dessen Stress reduziert.',
    log_action_provide_counseling_fail: '{agentName} suchte jemanden zum Beraten, fand aber niemanden in Not.',
    log_action_meditate: '🧘 {agentName} meditiert und findet einen Moment der Ruhe.',
    log_action_meditate_inspiration: '💡 {agentName} hat während der Meditation eine Erleuchtung!',
    log_action_mourn: '🖤 {agentName} nimmt sich einen Moment zum Trauern.',
    log_action_forgive_no_rival: '{agentName} überlegte, Vergebung anzubieten, hat aber niemanden zum Vergeben.',
    log_action_forgive_success: '🕊️ {agentName} hat {rivalName} vergeben und ihre Rivalität beendet.',
    log_action_confront_no_partner: '{agentName} fühlt sich eifersüchtig, hat aber keinen Partner zum Konfrontieren.',
    log_action_confront_success: '😠 {agentName} konfrontiert {partnerName} aus Eifersucht, was die Spannung erhöht.',
    personality_title: 'Persönlichkeitsmerkmale',
    personality_openness: 'Offenheit',
    personality_conscientiousness: 'Gewissenhaftigkeit',
    personality_extraversion: 'Extraversion',
    personality_agreeableness: 'Verträglichkeit',
    personality_neuroticism: 'Neurotizismus',
    psyche_empathy: 'Empathie',
    psyche_vengefulness: 'Rachsucht',
    psyche_forgiveness: 'Vergebung',
    psyche_searchForMeaning: 'Sinnsuche',
    psyche_decisionPressure: 'Entscheidungsdruck',
    psyche_fearOfDeath: 'Todesangst',
    psyche_boredom: 'Langeweile',
    psyche_inspiration: 'Inspiration',
    psyche_fanaticism: 'Fanatismus',
    psyche_spiritualNeed: 'Spiritueller Bedarf',
    psyche_jealousy: 'Eifersucht',
    emotion_shame: 'Scham',
    emotion_pride: 'Stolz',
    emotion_grief: 'Trauer',
    skill_healing: 'Heilung',
    skill_woodcutting: 'Holzfällen',
    skill_rhetoric: 'Rhetorik',
    skill_combat: 'Kampf',
    skill_construction: 'Bauen',
    skill_farming: 'Landwirtschaft',
    skill_mining: 'Bergbau',
    skill_crafting: 'Handwerk',
    skill_trading: 'Handel',
    goal_becomeLeader: 'Anführer werden',
    goal_buildLargeHouse: 'Ein Haus bauen',
    goal_masterSkill: 'Eine Fähigkeit meistern',
    goal_avengeRival: 'Rivalen rächen',
    goal_achieveWealth: 'Reichtum erlangen',
    goal_mentorYoungAgent: 'Einen jungen Agenten betreuen',
    goal_seekCounseling: 'Beratung suchen',
    goal_findMeaning: 'Sinn finden',
    goal_forgiveRival: 'Rivalen vergeben',
    goal_expressGrief: 'Trauer ausdrücken',
    tech_agriculture: 'Landwirtschaft',
    tech_metallurgy: 'Metallurgie',
    tech_writing: 'Schrift',
    tech_chemistry: 'Chemie',
    tech_governance: 'Regierungsführung',
    tech_bioengineering: 'Bioingenieurwesen',
  },
};

export type TranslationKey = keyof typeof translations.en;
```

---





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

export type GoalType = 'becomeLeader' | 'buildLargeHouse' | 'masterSkill' | 'avengeRival' | 'achieveWealth';
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
  // --- NEW ECONOMIC PROPERTIES ---
  currency: number;
  imprisonedUntil?: number;
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

export interface Action {
  name: string;
  description: string;
  beliefKey?: string;
  isIllegal?: boolean; // Dynamically set by simulation based on laws
  // @ts-ignore
  execute?: (agent: Agent, allAgents: Map<string, Agent>, allEntities: Map<string, Entity>, worldState: WorldState, engine: any) => Promise<ActionExecutionResult>;
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
}


// Data returned from an action's execution
export interface ActionExecutionResult {
    log: LogEntry;
    sideEffects?: {
        createAgent?: Partial<Agent> & { name: string, description: string, parents: [Agent, Agent] };
        updateReligion?: { agentId: string, newReligionId: string | null };
        createEntity?: Partial<Entity> & { ownerId?: string };
        addTrauma?: { agentId: string, trauma: Trauma };
    }
}
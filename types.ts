
export interface Beliefs {
  [key: string]: number;
}

export interface Emotions {
    [key: string]: number; 
}

export type RelationshipType = 'stranger' | 'acquaintance' | 'friend' | 'rival' | 'partner' | 'spouse' | 'ex-partner';

export interface Relationship {
    type: RelationshipType;
    score: number;
    // Learned, long-term emotions towards this agent
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
  result: 'accepted' | 'rejected' | 'initiated' | 'reciprocated';
  emotionalImpact: number; // -1 to 1
  timestamp: number;
}

// Data returned from an action's execution
export interface ActionExecutionResult {
    newEnvironment: EnvironmentState;
    log: LogEntry;
    sideEffects?: {
        createAgent?: Partial<Agent> & { name: string, description: string, parents: [Agent, Agent] };
        updateReligion?: { agentId: string, newReligionId: string | null };
        createEntity?: Partial<Entity>;
    }
}

export interface Action {
  name: string;
  description: string;
  beliefKey?: string;
  // @ts-ignore
  execute?: (agent: Agent, allAgents: Map<string, Agent>, allEntities: Map<string, Entity>, environment: EnvironmentState) => ActionExecutionResult;
}

export type ResourceType = 'food' | 'water' | 'wood' | 'medicine';

export interface Inventory {
  [resourceType: string]: number;
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
  hunger: number; // 0-100, where 100 is starving
  thirst: number; // 0-100, where 100 is dehydrated
  fatigue: number; // 0-100, where 100 is exhausted
  inventory: Inventory;
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
}

export interface EnvironmentState {
  [key: string]: any;
  width: number;
  height: number;
}

export interface Religion {
  id: string;
  name: string;
  dogma: Beliefs; // shared beliefs
  memberIds: string[];
}

export interface WorldState {
  environment: EnvironmentState;
  agents: Agent[];
  entities: Entity[];
  actions: Action[];
  cultures?: Culture[];
  religions?: Religion[];
}

export interface Culture {
  id: string;
  name: string;
  sharedBeliefs: Beliefs;
  memberIds: string[];
}

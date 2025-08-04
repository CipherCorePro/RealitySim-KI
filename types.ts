

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export interface FileContents {
  [path:string]: string;
}

export type Language = 'en' | 'de';

export interface Translations {
    [key: string]: string;
}

export interface ThemeSettings {
    background: string;
    primaryColor: string;
    secondaryColor: string;
    primaryTextColor: string;
    lineColor: string;
    fontSize: number;
}

export type DiagramType = 'classDiagram' | 'flowchart TD' | 'sequenceDiagram' | 'stateDiagram-v2';

export type DiagrammingLanguage = 'mermaid' | 'plantuml';

export interface ManualSection {
  title: string;
  content: string;
}

export interface Manual {
  title: string;
  introduction: string;
  sections: ManualSection[];
}

// Types for the new Agent System
export type AppMode = 'analyze' | 'generate' | 'agentSystem' | 'businessPlan' | 'pitchDeck' | 'startupPlanner';

export interface AgentLogEntry {
  agent: string;
  message: string;
  timestamp: string;
  replacements?: {[key: string]: string | number}; // Added for dynamic translation
}

export interface AgentJob {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  logs: AgentLogEntry[];
  progress: number;
  currentTask: string;
  fileContents: FileContents | null;
  error?: string | null;
  type?: 'generate' | 'debug';
}

// Types for Business Plan Generator
export interface BusinessPlanSection {
    title: string;
    content: string;
    estimated_data?: string[];
}

export interface BusinessPlan {
    executive_summary: BusinessPlanSection;
    company_description: BusinessPlanSection;
    products_services: BusinessPlanSection;
    market_analysis: BusinessPlanSection;
    marketing_sales_strategy: BusinessPlanSection;
    management_team: BusinessPlanSection;
    financial_plan: BusinessPlanSection;
    roadmap: BusinessPlanSection;
    risks_and_mitigation: BusinessPlanSection;
    appendix?: BusinessPlanSection;
}

export interface BusinessPlanJob {
    status: 'idle' | 'parsing' | 'generating' | 'completed' | 'failed';
    progress: number;
    logs: { agent: string; message: string; data?: any }[];
    error: string | null;
    result: BusinessPlan | null;
}

// Types for Pitch Deck Generator
export interface PitchDeck {
    markdown: string;
    html: string;
}

export interface PitchDeckJob {
    status: 'idle' | 'parsing' | 'generating' | 'completed' | 'failed';
    progress: number;
    logs: { agent: string; message: string; data?: any }[];
    error: string | null;
    result: PitchDeck | null;
}

// Types for Startup Planner
export interface StartupPlanJob {
    status: 'idle' | 'parsing' | 'generating' | 'completed' | 'failed';
    progress: number;
    error: string | null;
    result: string | null; // The markdown plan
}

// Types for Idea Architect Scaffolding
export interface ScaffoldingJob {
    status: 'idle' | 'running' | 'completed' | 'failed';
    progress: number;
    currentTask: string;
    error: string | null;
    fileContents?: FileContents | null;
}

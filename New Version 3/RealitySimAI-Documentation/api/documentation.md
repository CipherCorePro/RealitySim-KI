```markdown
# Ver. 4 RealitySim AI - Technical Documentation
An interactive web-based simulation environment where AI agents with unique beliefs and memories interact with a dynamic world. Control agents with natural language, run simulation steps, and visualize the emergent cognitive behavior of the system.

---

### Inhaltsverzeichnis
*   [metadata.json](#metadata-json)
*   [types.ts](#types-ts)
    *   [Beliefs](#interface-beliefs)
    *   [Emotions](#interface-emotions)
    *   [Personality](#interface-personality)
    *   [Skills](#interface-skills)
    *   [GoalType](#type-goaltype)
    *   [Goal](#interface-goal)
    *   [Trauma](#interface-trauma)
    *   [RelationshipType](#type-relationshiptype)
    *   [Relationship](#interface-relationship)
    *   [Resonance](#interface-resonance)
    *   [LogEntry](#interface-logentry)
    *   [SocialMemoryEntry](#interface-socialmemoryentry)
    *   [ResourceType](#type-resourcetype)
    *   [CraftedItemType](#type-crafteditemtype)
    *   [ItemType](#type-itemtype)
    *   [Inventory](#interface-inventory)
    *   [Recipe](#interface-recipe)
    *   [TradeOffer](#interface-tradeoffer)
    *   [Market](#interface-market)
    *   [Law](#interface-law)
    *   [Government](#interface-government)
    *   [Election](#interface-election)
    *   [Technology](#interface-technology)
    *   [Agent](#interface-agent)
    *   [Entity](#interface-entity)
    *   [EnvironmentState](#interface-environmentstate)
    *   [Religion](#interface-religion)
    *   [Culture](#interface-culture)
    *   [Action](#interface-action)
    *   [WorldState](#interface-worldstate)
    *   [ActionExecutionResult](#interface-actionexecutionresult)
    *   [PsychoReport](#interface-psychoreport)
*   [components/BeliefsChart.tsx](#componentsbeliefscharttsx)
*   [components/ControlPanel.tsx](#componentscontrolpaneltsx)
*   [components/LogPanel.tsx](#componentslogpaneltsx)
*   [components/WorldGraph.tsx](#componentsworldgraphtsx)
*   [components/CreateObjectPanel.tsx](#componentscreateobjectpaneltsx)
*   [components/ExporterPanel.tsx](#componentsexporterpaneltsx)
*   [components/AdminPanel.tsx](#componentsadminpaneltsx)
*   [contexts/LanguageContext.tsx](#contextslanguagecontexttsx)
*   [hooks/useTranslations.ts](#hooksusetranslationsts)
*   [components/LanguageSwitcher.tsx](#componentslanguageswitchertsx)
*   [components/ProcessingIndicator.tsx](#componentsprocessingindicatortsx)
*   [package.json](#packagejson)
*   [index.html](#indexhtml)
*   [index.tsx](#indextsx)
*   [tsconfig.json](#tsconfigjson)
*   [vite.config.ts](#viteconfigts)
*   [.env.local](#envlocal)
*   [.gitignore](#gitignore)
*   [README.md](#readmemd)

---

## metadata.json
Diese Datei enthält Metadaten über das Projekt, die typischerweise für die Bereitstellung oder externe Beschreibungen verwendet werden.

| Key                      | Value                                                                                                                                                                                   | Description                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `name`                   | "Ver. 4 RealitySim AI"                                                                                                                                                                  | Der Name der Anwendung.                                                      |
| `description`            | "An interactive web-based simulation environment where AI agents with unique beliefs and memories interact with a dynamic world. Control agents with natural language, run simulation steps, and visualize the emergent cognitive behavior of the system." | Eine kurze Beschreibung des Zwecks und der Funktionalität des Projekts.    |
| `requestFramePermissions`| []                                                                                                                                                                                      | Ein Array von angeforderten Berechtigungen für das Framing, derzeit leer. |
| `prompt`                 | ""                                                                                                                                                                                      | Ein Platzhalter für einen Prompt, derzeit leer.                           |

---

## types.ts
Diese Datei definiert die zentralen TypeScript-Interfaces und -Typen, die im gesamten RealitySim AI-Projekt verwendet werden. Sie legt die Datenstrukturen für Agenten, Entitäten, den Weltzustand sowie verschiedene kognitive und ökonomische Attribute fest.

#### Interface: Beliefs
Repräsentiert eine Sammlung von Überzeugungen, bei der jede Überzeugung ein String-Schlüssel ist, der einem numerischen Wert zugeordnet ist.
```typescript
interface Beliefs { [key: string]: number; }
```

#### Interface: Emotions
Repräsentiert eine Sammlung von Emotionen, bei der jede Emotion ein String-Schlüssel ist, der einem numerischen Wert zugeordnet ist.
```typescript
interface Emotions { [key: string]: number; }
```

#### Interface: Personality
Definiert die fünf Kernpersönlichkeitsmerkmale für einen Agenten, die jeweils durch einen numerischen Wert zwischen 0 und 1 repräsentiert werden.
**Eigenschaften:**
*   `openness`: `number` (0-1) - Grad an Vorstellungskraft, Einsicht und Gefühl.
*   `conscientiousness`: `number` (0-1) - Maß an Organisation, Bedachtsamkeit und zielgerichtetem Verhalten.
*   `extraversion`: `number` (0-1) - Wie aufgeschlossen und sozial eine Person ist.
*   `agreeableness`: `number` (0-1) - Wie kooperativ und mitfühlend eine Person ist.
*   `neuroticism`: `number` (0-1) - Tendenz, unangenehme Emotionen leicht zu erleben.
```typescript
interface Personality { 
    openness: number; 
    conscientiousness: number; 
    extraversion: number; 
    agreeableness: number; 
    neuroticism: number; 
}
```

#### Interface: Skills
Repräsentiert eine Sammlung von Fähigkeiten, bei der jede Fähigkeit ein String-Schlüssel ist, der einem numerischen Level zugeordnet ist. Beispiel: `{ healing: 15, woodcutting: 22, rhetoric: 5 }`
```typescript
interface Skills { [key: string]: number; }
```

#### Type: GoalType
Ein Union-Typ, der die möglichen Arten von Zielen definiert, die ein Agent haben kann.
```typescript
type GoalType = 'becomeLeader' | 'buildLargeHouse' | 'masterSkill' | 'avengeRival' | 'achieveWealth' | 'mentorYoungAgent' | 'seekCounseling';
```

#### Interface: Goal
Definiert die Struktur eines Ziels für einen Agenten.
**Eigenschaften:**
*   `type`: `GoalType` - Der spezifische Typ des Ziels.
*   `status`: `'active' | 'completed' | 'failed'` - Der aktuelle Status des Ziels.
*   `progress`: `number` (0-100) - Der Fortschritt bei der Erreichung des Ziels.
*   `description`: `string` - Eine textuelle Beschreibung des Ziels.
*   `targetId?`: `string` - Die ID eines Agenten oder einer Entität, die mit dem Ziel in Verbindung steht (optional).
```typescript
interface Goal { 
    type: GoalType; 
    status: 'active' | 'completed' | 'failed'; 
    progress: number; 
    description: string; 
    targetId?: string; 
}
```

#### Interface: Trauma
Repräsentiert ein traumatisches Ereignis, das ein Agent erlebt hat.
**Eigenschaften:**
*   `event`: `string` - Eine Beschreibung des traumatischen Ereignisses.
*   `timestamp`: `number` - Die Zeit (Simulationsschritt), zu der das Trauma aufgetreten ist.
*   `intensity`: `number` (0-1) - Die Schwere des Traumas.
```typescript
interface Trauma { 
    event: string; 
    timestamp: number; 
    intensity: number; 
}
```

#### Type: RelationshipType
Ein Union-Typ, der die möglichen Arten von Beziehungen zwischen Agenten definiert.
```typescript
type RelationshipType = 'stranger' | 'acquaintance' | 'friend' | 'rival' | 'partner' | 'spouse' | 'ex-partner';
```

#### Interface: Relationship
Definiert die Struktur einer Beziehung, die ein Agent zu einem anderen Agenten hat.
**Eigenschaften:**
*   `type`: `RelationshipType` - Die Kategorie der Beziehung.
*   `score`: `number` - Ein numerischer Wert, der die Stärke oder Qualität der Beziehung darstellt.
*   `disposition`: `Emotions` - Die emotionale Haltung gegenüber dem anderen Agenten.
```typescript
interface Relationship { 
    type: RelationshipType; 
    score: number; 
    disposition: Emotions; 
}
```

#### Interface: Resonance
Repräsentiert die Resonanz, die ein Agent mit verschiedenen Konzepten oder anderen Agenten hat, typischerweise ein String-Schlüssel, der einem numerischen Wert zugeordnet ist.
```typescript
interface Resonance { [key: string]: number; }
```

#### Interface: LogEntry
Definiert die Struktur eines Eintrags im Simulationsprotokoll.
**Eigenschaften:**
*   `key`: `string` - Ein Schlüssel zur Übersetzung oder Identifizierung der Protokollnachricht.
*   `params?`: `object` - Parameter, die in die Protokollnachricht eingefügt werden sollen (optional).
```typescript
interface LogEntry { 
    key: string; 
    params?: { [key: string]: any }; 
}
```

#### Interface: SocialMemoryEntry
Definiert einen Eintrag im sozialen Gedächtnis eines Agenten, der Interaktionen mit anderen Agenten detailliert beschreibt.
**Eigenschaften:**
*   `agentId`: `string` - Die ID des an der Interaktion beteiligten Agenten.
*   `action`: `string` - Die durchgeführte Aktion.
*   `result`: `'accepted' | 'rejected' | 'initiated' | 'reciprocated' | 'observed'` - Das Ergebnis der Interaktion.
*   `emotionalImpact`: `number` (-1 bis 1) - Die emotionale Auswirkung der Interaktion auf den sich erinnernden Agenten.
*   `timestamp`: `number` - Die Zeit (Simulationsschritt), zu der die Interaktion stattfand.
*   `info?`: `string` - Zusätzliche Informationen zur Interaktion (optional).
```typescript
interface SocialMemoryEntry { 
    agentId: string; 
    action: string; 
    result: 'accepted' | 'rejected' | 'initiated' | 'reciprocated' | 'observed'; 
    emotionalImpact: number; 
    timestamp: number; 
    info?: string; 
}
```

#### Type: ResourceType
Ein Union-Typ, der die grundlegenden Ressourcentypen definiert, die in der Simulation verfügbar sind.
```typescript
type ResourceType = 'food' | 'water' | 'wood' | 'medicine' | 'iron';
```

#### Type: CraftedItemType
Ein Union-Typ, der Gegenstände definiert, die in der Simulation hergestellt werden können.
```typescript
type CraftedItemType = 'sword' | 'plow' | 'advanced_medicine' | 'iron_ingot';
```

#### Type: ItemType
Ein Union-Typ, der alle Ressourcen- und hergestellten Gegenstandstypen kombiniert.
```typescript
type ItemType = ResourceType | CraftedItemType;
```

#### Interface: Inventory
Repräsentiert das Inventar eines Agenten, das Gegenstandsnamen ihren Mengen zuordnet.
```typescript
interface Inventory { [item: string]: number; }
```

#### Interface: Recipe
Definiert die Struktur eines Herstellungsrezepts.
**Eigenschaften:**
*   `name`: `string` - Der Name des Rezepts.
*   `output`: `object` - Der Gegenstand und die Menge, die durch das Rezept hergestellt werden.
*   `ingredients`: `object` - Eine Zuordnung der benötigten Zutaten und ihrer Mengen.
*   `requiredSkill?`: `object` - Eine bestimmte Fähigkeit und Stufe, die zum Herstellen erforderlich ist (optional).
*   `requiredTech?`: `string` - Die ID einer Technologie, die zum Herstellen erforderlich ist (optional).
```typescript
interface Recipe { 
    name: string; 
    output: { item: CraftedItemType, quantity: number }; 
    ingredients: { [key in ItemType]?: number }; 
    requiredSkill?: { skill: keyof Skills, level: number }; 
    requiredTech?: string; 
}
```

#### Interface: TradeOffer
Definiert die Struktur eines Handelsangebots auf dem Markt.
**Eigenschaften:**
*   `offerId`: `string` - Eindeutiger Bezeichner für das Angebot.
*   `fromAgentId`: `string` - Die ID des Agenten, der das Angebot macht.
*   `item`: `ItemType` - Der Typ des angebotenen Gegenstands.
*   `quantity`: `number` - Die Menge des Gegenstands.
*   `price`: `number` - Der Preis pro Einheit des Gegenstands.
```typescript
interface TradeOffer { 
    offerId: string; 
    fromAgentId: string; 
    item: ItemType; 
    quantity: number; 
    price: number; 
}
```

#### Interface: Market
Definiert die Struktur einer Marktentität in der Welt.
**Eigenschaften:**
*   `id`: `string` - Eindeutiger Bezeichner für den Markt.
*   `name`: `string` - Der Name des Marktes.
*   `listings`: `TradeOffer[]` - Ein Array von aktiven Handelsangeboten auf diesem Markt.
```typescript
interface Market { 
    id: string; 
    name: string; 
    listings: TradeOffer[]; 
}
```

#### Interface: Law
Definiert die Struktur eines Gesetzes innerhalb der Regierung der Simulation.
**Eigenschaften:**
*   `id`: `string` - Eindeutiger Bezeichner für das Gesetz.
*   `name`: `string` - Der Name des Gesetzes.
*   `description`: `string` - Eine Beschreibung, was das Gesetz beinhaltet.
*   `violatingAction`: `string` - Der Name der Aktion, die dieses Gesetz verletzt.
*   `punishment`: `object` - Details der Strafe für die Verletzung des Gesetzes.
```typescript
interface Law { 
    id: string; 
    name: string; 
    description: string; 
    violatingAction: string; 
    punishment: { type: 'fine' | 'arrest'; amount: number; }; 
}
```

#### Interface: Government
Definiert die Struktur des Regierungsgremiums in der Simulation.
**Eigenschaften:**
*   `type`: `'monarchy' | 'democracy'` - Die Art der Regierung.
*   `leaderId`: `string | null` - Die ID des aktuellen Anführers oder null, wenn keiner vorhanden ist.
*   `laws`: `Law[]` - Ein Array von Gesetzen, die von der Regierung erlassen wurden.
```typescript
interface Government { 
    type: 'monarchy' | 'democracy'; 
    leaderId: string | null; 
    laws: Law[]; 
}
```

#### Interface: Election
Definiert den Status einer laufenden oder vergangenen Wahl.
**Eigenschaften:**
*   `isActive`: `boolean` - Gibt an, ob eine Wahl derzeit aktiv ist.
*   `candidates`: `string[]` - Ein Array von Agenten-IDs, die Kandidaten sind.
*   `votes`: `object` - Eine Zuordnung von Kandidaten-IDs zu ihren Stimmenzahlen.
*   `termEndDate`: `number` - Der Simulationsschritt, an dem die Amtszeit des aktuellen Anführers endet.
```typescript
interface Election { 
    isActive: boolean; 
    candidates: string[]; 
    votes: { [candidateId: string]: number }; 
    termEndDate: number; 
}
```

#### Interface: Technology
Definiert die Struktur einer Technologie, die von Kulturen erforscht werden kann.
**Eigenschaften:**
*   `id`: `string` - Eindeutiger Bezeichner für die Technologie.
*   `name`: `string` - Der Name der Technologie.
*   `description`: `string` - Eine Beschreibung der Technologie.
*   `researchCost`: `number` - Die Kosten in Forschungspunkten, um diese Technologie freizuschalten.
*   `unlocks`: `object` - Gibt an, welche Aktionen oder Rezepte diese Technologie freischaltet.
*   `requiredTech?`: `string[]` - Ein Array von Technologie-IDs, die zuerst freigeschaltet werden müssen (optional).
```typescript
interface Technology { 
    id: string; 
    name: string; 
    description: string; 
    researchCost: number; 
    unlocks: { actions?: string[]; recipes?: string[]; }; 
    requiredTech?: string[]; 
}
```

#### Interface: Agent
Das zentrale Interface, das einen KI-Agenten in der Simulation darstellt, einschließlich seiner physischen, kognitiven, sozialen und ökonomischen Attribute.
```typescript
interface Agent {
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
    unconsciousState?: { [key: string]: number };
    currency: number;
    imprisonedUntil?: number;
}
```

#### Interface: Entity
Definiert ein Nicht-Agenten-Objekt in der Simulationsumgebung, wie Ressourcen, Gebäude oder andere interaktive Elemente.
```typescript
interface Entity {
    id: string;
    type: 'resource' | 'building' | 'marketplace' | 'jail' | 'altar';
    name: string;
    x: number;
    y: number;
    resourceType?: ResourceType;
    quantity?: number;
    durability?: number;
    marketId?: string;
}
```

#### Interface: EnvironmentState
Beschreibt den globalen Zustand der Simulationsumgebung, einschließlich Zeit, Wetter und anderer globaler Parameter.
```typescript
interface EnvironmentState {
    time: number;
    isDay: boolean;
    weather: 'clear' | 'rainy' | 'stormy';
    size: { width: number; height: number; };
    government: Government;
    election?: Election;
    markets: Market[];
    recipes: Recipe[];
    techTree: Technology[];
}
```

#### Interface: Religion
Definiert die Struktur einer Religion, der Agenten angehören können.
```typescript
interface Religion {
    id: string;
    name: string;
    description: string;
    coreBeliefs: Beliefs;
    leaderId: string | null;
}
```

#### Interface: Culture
Definiert die Struktur einer Kultur, die gemeinsame Überzeugungen und Technologien teilt.
```typescript
interface Culture {
    id: string;
    name: string;
    description: string;
    coreBeliefs: Beliefs;
    leaderId: string | null;
    researchProgress: { [techId: string]: number };
    unlockedTech: string[];
}
```

#### Interface: Action
Definiert eine Aktion, die ein Agent ausführen kann.
```typescript
interface Action {
    id: string;
    name: string;
    description: string;
    cost: { energy?: number, time?: number, resources?: { [key in ItemType]?: number } };
    effect: (agent: Agent, world: WorldState, target?: Agent | Entity) => ActionExecutionResult;
    requiresTarget: boolean;
    socialEffect?: (observer: Agent, actor: Agent, target?: Agent | Entity) => void;
}
```

#### Interface: WorldState
Die umfassende Datenstruktur, die den gesamten aktuellen Zustand der Simulation darstellt.
```typescript
interface WorldState {
    environment: EnvironmentState;
    agents: Agent[];
    entities: Entity[];
    actions: Action[];
    cultures: Culture[];
    religions: Religion[];
    log: LogEntry[];
}```

#### Interface: ActionExecutionResult
Das Ergebnis der Ausführung einer Aktion, das Aktualisierungen des Weltzustands und Protokolleinträge enthält.
```typescript
interface ActionExecutionResult {
    worldState: WorldState;
    logEntry: LogEntry;
}
```

#### Interface: PsychoReport
Ein Bericht, der die psychologische Analyse eines Agenten zusammenfasst.
```typescript
interface PsychoReport {
    agentId: string;
    summary: string;
    keyBeliefs: Beliefs;
    emotionalState: Emotions;
    activeGoals: Goal[];
    potentialTrauma: Trauma[];
    socialStanding: { [agentId: string]: number };
}
```

---

## package.json
Diese Datei definiert die Projektabhängigkeiten und Skripte.

```json
{
  "name": "ver-4-realitysim-ai",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^0.2.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.12.2",
    "tailwindcss": "^3.4.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.0"
  }
}```

---

## index.html
Der Einstiegspunkt der HTML-Seite für die Anwendung.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ver. 4 RealitySim AI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

---

## index.tsx
Der Haupt-Einstiegspunkt der React-Anwendung, der die globalen Provider (Settings, Language) und die Haupt-App-Komponente rendert.

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { SettingsProvider } from './contexts/SettingsContext'; // Assuming SettingsContext is in its own file
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </SettingsProvider>
  </React.StrictMode>,
);
```

---

## tsconfig.json
Die TypeScript-Konfigurationsdatei für das Projekt.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## vite.config.ts
Die Konfigurationsdatei für den Vite-Build-Tool.

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

---

## .env.local
Eine Datei zur Speicherung lokaler Umgebungsvariablen, wie z.B. API-Schlüssel. **Diese Datei sollte nicht in die Versionskontrolle eingecheckt werden.**

```
VITE_GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

---

## .gitignore
Gibt an, welche Dateien und Verzeichnisse von Git ignoriert werden sollen.

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (http://gruntjs.com/creating-plugins#storing-intermediate-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# Vite
dist
dist-ssr

```

import { GoogleGenAI } from "@google/genai";
import type { Action, Agent, EnvironmentState, WorldState, Culture, PsychoReport, Goal, Technology } from '../types';
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
        invent_technology_instruction: `You are a creative historian and technologist for a reality simulation. Your task is to invent a plausible new technology for a specific culture.
**Context:**
- Inventor: {agentName}, a {agentRole} with skills in {agentSkills}.
- Culture: {cultureName}, which already knows these technologies: {knownTech}.
- World Tech Tree (all existing techs): {techTree}.
- Recent Memories of Inventor: {memories}

**Instructions:**
- Invent a NEW technology that logically follows from the culture's existing knowledge. It should not be something already in the World Tech Tree.
- The new technology should be creative and fit the theme of the culture ('Utopian Technocrats' or 'Primitivist Collective').
- Give it a name, a description, a research cost (between 200 and 800), and one or more prerequisite technologies from what the culture already knows.
- Suggest one new unique action NAME or recipe NAME it could unlock. The name should be creative and fit the technology.
- Return ONLY a JSON object with the following structure. Do not add any extra text.
{
  "id": "a-unique-lowercase-id-from-name",
  "name": "The Technology Name",
  "description": "What it does.",
  "researchCost": 500,
  "requiredTech": ["existing_tech_id"],
  "unlocks": {
    "actions": ["New Action Name"],
    "recipes": []
  }
}
If it unlocks a recipe, put it in the "recipes" array. If you cannot think of a new technology, return null.`,
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
        invent_technology_instruction: `Sie sind ein kreativer Historiker und Technologe für eine Realitätssimulation. Ihre Aufgabe ist es, eine plausible neue Technologie für eine bestimmte Kultur zu erfinden.
**Kontext:**
- Erfinder: {agentName}, ein {agentRole} mit Fähigkeiten in {agentSkills}.
- Kultur: {cultureName}, die bereits diese Technologien kennt: {knownTech}.
- Welt-Technologiebaum (alle existierenden Technologien): {techTree}.
- Jüngste Erinnerungen des Erfinders: {memories}

**Anweisungen:**
- Erfinden Sie eine NEUE Technologie, die logisch aus dem bestehenden Wissen der Kultur folgt. Sie sollte nicht bereits im Welt-Technologiebaum vorhanden sein.
- Die neue Technologie sollte kreativ sein und zum Thema der Kultur ('Utopian Technocrats' oder 'Primitivist Collective') passen.
- Geben Sie ihr einen Namen, eine Beschreibung, Forschungskosten (zwischen 200 und 800) und eine oder mehrere vorausgesetzte Technologien aus dem, was die Kultur bereits kennt.
- Schlagen Sie einen neuen einzigartigen AKTIONsNAMEN oder REZEPTNAMEN vor, den sie freischalten könnte. Der Name sollte kreativ sein und zur Technologie passen.
- Geben Sie NUR ein JSON-Objekt mit der folgenden Struktur zurück. Fügen Sie keinen zusätzlichen Text hinzu.
{
  "id": "eine-eindeutige-kleingeschriebene-id-vom-namen",
  "name": "Der Technologiename",
  "description": "Was sie bewirkt.",
  "researchCost": 500,
  "requiredTech": ["existierende_tech_id"],
  "unlocks": {
    "actions": ["Name der neuen Aktion"],
    "recipes": []
  }
}
Wenn es ein Rezept freischaltet, fügen Sie es in das "recipes"-Array ein. Wenn Ihnen keine neue Technologie einfällt, geben Sie null zurück.`,
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
        agent_details: `For each agent, provide: **name (Unique, human-sounding name. CRITICAL: The name MUST consist of a first and last name, e.g., 'Elara Meadowbrook' or 'Finnian Stonehand'. Single names like 'Bob' or identifiers like 'Agent1' are INVALID. Each full name in the entire list MUST be unique.)**, description, age (1-80), x, y, cultureId ('culture-utopian' or 'culture-primitivist'), religionId ('religion-technotheism' or 'religion-gaianism'), role ('${ROLES.join("', '")}'), genome (an array of 1-3 strings from '${GENOME_OPTIONS.join("', '")}'), beliefs (an object mapping belief keys like 'progress_good' to a value between 0.0 and 1.0), emotions (an object with keys like 'happiness', 'sadness' with values 0.0-1.0), personality (an object with keys 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' with values 0.0-1.0), skills (an object mapping skill names to a numeric level, e.g., {"healing": 15, "woodcutting": 5}), socialStatus (a numeric value between 30-70), stress (a numeric value between 5-30), hunger, thirst, fatigue (numeric values between 0-50), inventory (an object like {"wood": 10}), and currency (a numeric value between 20-100).`,
        entity_base_details: `For each entity: **name (a unique, descriptive name like 'Whispering Falls' or 'Old Town Market', not 'Resource 1')**, description, x, y.`,
        world_response_instructions: `Your response MUST be a JSON object: { "agents": [ ... ], "entities": [ ... ] }. DO NOT add extra text. Ensure all numeric values are actually numbers, not strings.`,
        agents_response_instructions: `Your response MUST be a JSON object: { "agents": [ ... ] }. DO NOT add extra text or entity data. Ensure all numeric values are actually numbers, not strings.`,
        entities_response_instructions: `Your response MUST be a JSON object: { "entities": [ ... ] }. DO NOT add extra text or agent data. Ensure all numeric values are actually numbers, not strings.`,
    },
    de: {
        world_system_base: `Sie sind ein Datengenerierungs-Bot. Ihre einzige Aufgabe ist die Erstellung eines JSON-Objekts.
Generieren Sie eine Welt mit EXAKT {agentCount} Agenten und EXAKT {entityCount} Entitäten auf einem {width}x{height} Raster.`,
        agent_details: `Für jeden Agenten: **name (Einzigartiger, menschlich klingender Name. KRITISCH: Der Name MUSS aus einem Vor- und Nachnamen bestehen, z.B. 'Elara Meadowbrook' oder 'Finnian Steinfels'. Namen wie 'Bob' oder 'Agent1' sind UNGÜLTIG. Jeder vollständige Name in der gesamten Liste MUSS einzigartig sein.)**, description, age (1-80), x, y, cultureId ('culture-utopian' oder 'culture-primitivist'), religionId ('religion-technotheism' oder 'religion-gaianism'), role ('${ROLES.join("', '")}'), genome (ein Array mit 1-3 Strings aus '${GENOME_OPTIONS.join("', '")}'), beliefs (ein Objekt, das Belief-Schlüssel wie 'progress_good' auf einen Wert zwischen 0.0 und 1.0 abbildet), emotions (ein Objekt mit Schlüsseln wie 'happiness', 'sadness' mit Werten von 0.0-1.0), personality (ein Objekt mit den Schlüsseln 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' mit Werten von 0.0-1.0), skills (ein Objekt, das Fähigkeitsnamen auf ein numerisches Level abbildet, z.B. {"healing": 15, "woodcutting": 5}), socialStatus (ein numerischer Wert zwischen 30-70), stress (ein numerischer Wert zwischen 5-30), hunger, thirst, fatigue (numerische Werte zwischen 0-50), inventory (ein Objekt wie {"wood": 10}), und currency (ein numerischer Wert zwischen 20-100).`,
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

export async function generateNewTechnology(
    agent: Agent,
    worldState: WorldState,
    language: Language
): Promise<Technology | null> {
    const t = prompts[language];
    const culture = worldState.cultures.find(c => c.id === agent.cultureId);
    if (!culture) return null;

    const agentSkills = Object.entries(agent.skills).filter(([, level]) => level > 10).map(([skill]) => skill).join(', ') || 'basic skills';
    const knownTech = culture.knownTechnologies.join(', ') || 'None';
    const techTree = worldState.techTree.map(tech => tech.name).join(', ');
    const memories = (agent.longTermMemory || []).slice(-3).map(m => m.content).join('\n') || 'None';

    const systemPrompt = t.invent_technology_instruction
        .replace('{agentName}', agent.name)
        .replace('{agentRole}', agent.role || 'worker')
        .replace('{agentSkills}', agentSkills)
        .replace('{cultureName}', culture.name)
        .replace('{knownTech}', knownTech)
        .replace('{techTree}', techTree)
        .replace('{memories}', memories);

    try {
        const jsonText = await callAi(systemPrompt, null, true);
        if (!jsonText || jsonText.toLowerCase() === 'null') return null;

        const result: Technology = JSON.parse(jsonText);

        // Basic validation
        if (typeof result.id !== 'string' || typeof result.name !== 'string' || typeof result.description !== 'string' || typeof result.researchCost !== 'number' || !result.unlocks) {
            console.error("AI returned invalid technology structure:", result);
            return null;
        }
        
        // Ensure unlocks are arrays of strings
        result.unlocks.actions = (result.unlocks.actions || []).filter(item => typeof item === 'string');
        result.unlocks.recipes = (result.unlocks.recipes || []).filter(item => typeof item === 'string');

        // Ensure requiredTech is an array of strings
        result.requiredTech = (result.requiredTech || []).filter(item => typeof item === 'string');


        return result;
    } catch (error) {
        console.error("Error generating technology with AI:", error);
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
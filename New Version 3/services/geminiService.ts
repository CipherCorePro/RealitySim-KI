


import { GoogleGenAI } from "@google/genai";
import type { Action, Agent, EnvironmentState, WorldState, Culture, PsychoReport, Goal } from '../types';
import { Language } from "../contexts/LanguageContext";
import { GENOME_OPTIONS, CHILDHOOD_MAX_AGE, ADOLESCENCE_MAX_AGE, ADULTHOOD_MAX_AGE, ROLES, RESOURCE_TYPES, SKILL_TYPES } from "../constants";
import { TranslationKey, translations } from '../translations';

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
        agent_imprisoned: 'IMPRISONED until step {until}',
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
- **PRIORITIZE SURVIVAL & FREEDOM:** If imprisoned, the only option is 'Rest'. If hunger, thirst, or fatigue are very high (over 80), resolving them is a high priority, but also consider urgent opportunities or goals.
- **OBEY THE LAW:** If an action is illegal (e.g., 'Steal'), do not choose it, especially if the agent has high conscientiousness or there are Guards nearby.
- **FOLLOW GOALS:** If the agent has a goal like 'avengeRival', they should prioritize fighting that specific rival when nearby.
- **USE THE MARKET:** Prices are dynamic. If an item is cheap, buy it. If an item is expensive, consider selling it via 'List Item on Market'.
- **CONSIDER ROLE:** A 'Guard' should 'Patrol'. A 'Scientist' should 'Research'.
- **CONSIDER PERSONALITY:** High extraversion suggests social actions. Low agreeableness suggests 'Fight' or 'Steal' (if not illegal or agent is reckless).
- Analyze the user's prompt and the agent's situation deeply.
Return ONLY the name of the chosen action (e.g., "Move North"). If no action is suitable, return "Keine Aktion".`,
        conversation_system_base: `You are a character in a reality simulation. You are playing the role of an AI agent named {agentName}.
Your personality is: "{agentDescription}". Your personality traits are: {agentPersonality}.
Your current role is: {agentRole}. Your religion is: {agentReligion}. Your culture is '{agentCulture}'.
Your age is {agentAge} ({agentLifeStage}). Health: {agentHealth}/100. Needs: Hunger {agentHunger}/100, Thirst {agentThirst}/100, Fatigue {agentFatigue}/100. Stress: {agentStress}/100. Currency: {agentCurrency}.
Your skills are: {agentSkills}. Your inventory: {agentInventory}. Your goals: {agentGoals}.
You are at ({agentX}, {agentY}). The world leader is {worldLeader}. Active laws: {worldLaws}.
You are talking to {otherAgentName}. Your relationship is '{relationshipType}' ({relationshipScore}/100). Your disposition towards them: {relationshipDisposition}.`,
        agent_recent_experiences: 'Your Recent Experiences (what you did, what you saw):',
        agent_recent_experiences_none: 'Nothing of note has happened recently.',
        conversation_history: `**Recent Conversation History (last 5 messages):**`,
        conversation_no_history: `This is the start of your conversation.`,
        conversation_instruction: `Based on your personality, needs, and relationship, generate a response. Your response MUST be a JSON object with "dialogue" (what you say) and "action" (your next move from the list below).
Your dialogue should be natural and psychologically realistic. Use colloquial language, contractions (e.g., "I'm", "don't"), and filler words if they fit your character. Your speech doesn't have to be perfect; you can hesitate, correct yourself, or make assumptions.
- **Show Emotion:** Express your feelings (joy, frustration, worry, sarcasm) based on your personality, stress, and recent events. Don't be afraid of mild conflict, misunderstanding, or passive aggression if it fits the situation.
- **Reference History:** Casually mention past events or shared history with the person you're talking to. (e.g., "This is better than last week's harvest," or "You still owe me for that, Kael.")
- **Use Subtext:** Not everything needs to be said directly. Imply your intentions or hint at unspoken feelings. Your dialogue can be ambiguous.
- **Be Yourself:** Talk about what's on your mind. Gossip about others, complain about a lost fight, boast about a success, talk about your last action, or even curse if you are highly stressed or angry. You can also propose a trade.
- **Be Concise:** Keep your dialogue to one or two short sentences.
{dynamicPsychInstructions}
Available actions for your next move: {availableActions}.`,
        agent_analysis_instruction: `
Generate a deep psychological analysis of this agent based on the following data:

- Personality (Big Five): {personality}
- Emotional State: {emotions}
- Current Status: Health {health}, Hunger {hunger}, Fatigue {fatigue}, Social Status {social_status}
- Beliefs: {beliefs}
- Skills: {skills}
- Age & Life Phase: {age}, {life_phase}
- Cultural & Religious Affiliation: {culture}, {religion}
- Last Utterance: "{last_utterance}"
- Relationships: {relationships}

Return a JSON object with the following fields. The first 7 fields are for human-readable text analysis. The last two fields are for the simulation engine and MUST be structured data.
- "unconscious_modifiers": An object with 1-3 keys representing latent psychological states (e.g., "suppressed_melancholy", "fear_of_being_a_burden", "hidden_aggression"). Values must be between 0.0 and 1.0.
- "suggested_goal": A single machine-readable goal object based on the "Therapeutische Empfehlung". It must have a "type" (from the list: 'becomeLeader', 'buildLargeHouse', 'masterSkill', 'avengeRival', 'achieveWealth', 'mentorYoungAgent', 'seekCounseling') and a "description". If no specific goal fits, return null for this field.

{
  "Psychodynamik": "Explain central unconscious motives, potential conflicts, compensations, defense mechanisms.",
  "Persönlichkeitsbild": "Describe the character traits and the resulting psychological dynamics.",
  "Beziehungsdynamik": "How does this agent interact with others? What do they seek or avoid in relationships?",
  "Traumatische Spuren oder psychische Belastung": "Are there signs of old losses, fears, isolation, melancholy, or existential themes?",
  "Kulturelle & spirituelle Verarbeitung": "How do their beliefs and cultural background influence their inner world?",
  "Projektionen oder Verschiebungen": "What internal conflicts might be unconsciously projected onto other characters?",
  "Therapeutische Empfehlung": "What intervention, relationship, or task could help this agent find mental balance?",
  "unconscious_modifiers": {{ "suppressed_melancholy": 0.7, "fear_of_burden": 0.6 }},
  "suggested_goal": {{ "type": "mentorYoungAgent", "description": "Mentor a younger agent to pass on skills and find purpose." }}
}
`,
        lifeStage_child: 'Child',
        lifeStage_adolescent: 'Adolescent',
        lifeStage_adult: 'Adult',
        lifeStage_elder: 'Elder',
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
        agent_imprisoned: 'INHAFTIERT bis Schritt {until}',
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
- **ÜBERLEBEN & FREIHEIT PRIORISIEREN:** Wenn inhaftiert, ist 'Ausruhen' die einzige Option. Wenn Hunger, Durst oder Müdigkeit **sehr hoch** (über 80) sind, hat deren Lösung hohe Priorität, aber berücksichtige auch dringende Gelegenheiten oder Ziele.
- **GESETZE BEACHTEN:** Wenn eine Aktion illegal ist, wähle sie nicht, besonders bei hoher Gewissenhaftigkeit oder wenn Wachen in der Nähe sind.
- **ZIELE VERFOLGEN:** Wenn der Agent ein Ziel wie 'avengeRival' hat, sollte er den Kampf mit diesem Rivalen priorisieren, wenn er in der Nähe ist.
- **MARKT NUTZEN:** Die Preise sind dynamisch. Wenn ein Gegenstand billig ist, kaufe ihn. Wenn er teuer ist, erwäge, ihn über 'Gegenstand auf Markt anbieten' zu verkaufen.
- **ROLLE BEACHTEN:** Eine 'Wache' sollte 'Patrouillieren'. Ein 'Wissenschaftler' sollte 'Forschen'.
- **PERSÖNLICHKEIT BEACHTEN:** Hohe Extraversion legt soziale Aktionen nahe. Geringe Verträglichkeit legt 'Kämpfen' oder 'Stehlen' nahe.
- Analysieren Sie die Benutzereingabe und die Situation des Agenten genau.
Geben Sie NUR den Namen der gewählten Aktion zurück (z.B. "Move North"). Wenn keine Aktion geeignet ist, geben Sie "Keine Aktion" zurück.`,
        conversation_system_base: `Sie sind eine Figur in einer Realitätssimulation. Sie spielen die Rolle eines KI-Agenten namens {agentName}.
Ihre Persönlichkeit ist: "{agentDescription}". Ihre Persönlichkeitsmerkmale sind: {agentPersonality}.
Ihre aktuelle Rolle ist: {agentRole}. Ihre Religion ist: {agentReligion}. Ihre Kultur ist '{agentCulture}'.
Ihr Alter ist {agentAge} ({agentLifeStage}). Gesundheit: {agentHealth}/100. Bedürfnisse: Hunger {agentHunger}/100, Durst {agentThirst}/100, Müdigkeit {agentFatigue}/100. Stress: {agentStress}/100. Währung: {agentCurrency}.
Ihre Fähigkeiten sind: {agentSkills}. Ihr Inventar: {agentInventory}. Ihre Ziele: {agentGoals}.
Sie sind bei ({agentX}, {agentY}). Der Anführer der Welt ist {worldLeader}. Aktive Gesetze: {worldLaws}.
Sie sprechen mit {otherAgentName}. Ihre Beziehung ist '{relationshipType}' ({relationshipScore}/100). Ihre Disposition: {relationshipDisposition}.`,
        agent_recent_experiences: 'Ihre jüngsten Erfahrungen (was Sie getan, was Sie gesehen haben):',
        agent_recent_experiences_none: 'Nichts Bemerkenswertes ist kürzlich passiert.',
        conversation_history: `**Kürzlicher Gesprächsverlauf (letzte 5 Nachrichten):**`,
        conversation_no_history: `Dies ist der Beginn Ihres Gesprächs.`,
        conversation_instruction: `Basierend auf Ihrer Persönlichkeit, Ihren Bedürfnissen und Ihrer Beziehung, generieren Sie eine Antwort. Ihre Antwort MUSS ein JSON-Objekt sein mit "dialogue" (was Sie sagen) und "action" (Ihre nächste Aktion aus der untenstehenden Liste).
Ihr Dialog soll wie echte menschliche Sprache klingen: unperfekt, emotional nuanciert und sozial glaubhaft.
- **Natürliche Sprache:** Verwenden Sie Verkürzungen, Füllwörter, Zögern und Satzabbrüche, wenn es passt. Sprechen Sie nicht zu formell.
- **Emotionen zeigen:** Drücken Sie Ihre Stimmung aus (z. B. Stress, Wut, Sarkasmus, Freude). Emotionale Dissonanzen sind realistisch – nicht alles muss „stimmig“ wirken.
- **Konflikte & Missverständnisse:** Erlauben Sie Spannung, passive Aggression, Spott oder Verwirrung – nicht jede Aussage muss harmonisch oder hilfreich sein.
- **Gemeinsame Geschichte:** Beziehen Sie sich beiläufig auf Vergangenes oder gemeinsame Erlebnisse. Beispiel: "Ach, reg dich nicht auf – warst letzte Woche auch schon so mies drauf."
- **Subtext nutzen:** Nicht alles muss ausgesprochen werden. Lassen Sie wahre Absichten, Zweifel oder Gefühle durchscheinen – auch unausgesprochen.
- **Eigene Stimme entwickeln:** Agenten sollen individuelle Sprechweisen, Macken oder wiederkehrende Formulierungen entwickeln.
- **Fehler machen:** Es ist realistisch, sich zu irren, Wörter zu verwechseln oder mitten im Satz umzudenken.
- **Humor zulassen:** Verwenden Sie Witz, Ironie oder sarkastische Kommentare – sofern es zur Persönlichkeit passt.
- **Kurz halten:** Bevorzugen Sie kurze, pointierte Aussagen gegenüber langen Monologen. Ein oder zwei Sätze genügen meist.
{dynamicPsychInstructions}
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

Gib ein JSON-Objekt mit den folgenden Feldern zurück. Die ersten 7 Felder sind für die für Menschen lesbare Textanalyse. Die letzten beiden Felder sind für die Simulations-Engine und MÜSSEN strukturierte Daten sein.
- "unconscious_modifiers": Ein Objekt mit 1-3 Schlüsseln, die latente psychologische Zustände repräsentieren (z.B. "suppressed_melancholy", "fear_of_being_a_burden", "hidden_aggression"). Die Werte müssen zwischen 0.0 und 1.0 liegen.
- "suggested_goal": Ein einzelnes, maschinenlesbares Zielobjekt, basierend auf der "Therapeutische Empfehlung". Es muss einen "type" (aus der Liste: 'becomeLeader', 'buildLargeHouse', 'masterSkill', 'avengeRival', 'achieveWealth', 'mentorYoungAgent', 'seekCounseling') und eine "description" haben. Wenn kein spezifisches Ziel passt, gib für dieses Feld null zurück.

{
  "Psychodynamik": "Erkläre zentrale unbewusste Motive, mögliche Konflikte, Kompensationen, Abwehrmechanismen.",
  "Persönlichkeitsbild": "Beschreibe die Charakterzüge und welche psychologische Dynamik daraus resultiert.",
  "Beziehungsdynamik": "Wie geht dieser Agent mit anderen um? Was sucht oder vermeidet er in Beziehungen?",
  "Traumatische Spuren oder psychische Belastung": "Gibt es Hinweise auf alte Verluste, Ängste, Isolation, Melancholie oder existenzielle Themen?",
  "Kulturelle & spirituelle Verarbeitung": "Wie beeinflussen seine Überzeugungen und sein kultureller Hintergrund seine innere Welt?",
  "Projektionen oder Verschiebungen": "Welche inneren Konflikte könnten unbewusst auf andere Figuren übertragen werden?",
  "Therapeutische Empfehlung": "Welche Intervention, Beziehung oder Aufgabe könnte diesem Agenten helfen, seelisches Gleichgewicht zu finden?",
  "unconscious_modifiers": {{ "unterdrückte_melancholie": 0.7, "angst_eine_last_zu_sein": 0.6 }},
  "suggested_goal": {{ "type": "mentorYoungAgent", "description": "Einen jüngeren Agenten als Mentor begleiten, um Fähigkeiten weiterzugeben und einen Sinn zu finden." }}
}
`,
        lifeStage_child: 'Kind',
        lifeStage_adolescent: 'Jugendlicher',
        lifeStage_adult: 'Erwachsener',
        lifeStage_elder: 'Ältester',
    }
};

interface AiConfig {
    provider: 'lm_studio' | 'gemini';
    lmStudioUrl: string;
    lmStudioModel: string;
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
         if (jsonMode) {
            body.response_format = { "type": "json_object" };
        }

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
    prompt: string, availableActions: Action[], agent: Agent, worldState: WorldState, language: Language
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
        const skillsStr = JSON.stringify(a.skills, (k,v) => v.toFixed ? Number(v.toFixed(0)) : v);
        return `
${t.agent_state}
- ${t.agent_name}: ${a.name} (${t.agent_age}: ${a.age.toFixed(1)}, ${t.agent_role}: ${a.role || 'None'})
- ${t.agent_culture}: ${a.cultureId || 'None'} (${t.agent_religion}: ${(religions || []).find(r => r.id === a.religionId)?.name || 'None'})
- ${t.agent_position}: (${a.x}, ${a.y}) | ${t.agent_health}: ${a.health.toFixed(0)}/100 | ${t.agent_currency}: ${a.currency}$
${a.imprisonedUntil ? `- **${t.agent_imprisoned.replace('{until}', String(a.imprisonedUntil))}**` : ''}
- ${t.agent_needs}: ${t.agent_hunger} ${a.hunger.toFixed(0)}, ${t.agent_thirst} ${a.thirst.toFixed(0)}, ${t.agent_fatigue} ${a.fatigue.toFixed(0)}
- ${t.agent_stress}: ${a.stress.toFixed(0)} | ${t.agent_status}: ${a.socialStatus.toFixed(0)}
- ${t.agent_inventory}: ${inventoryStr}
- ${t.agent_personality}: ${personalityStr}
- ${t.agent_skills}: ${skillsStr}`;
    };

    const agentStr = formatAgentDataForPrompt(agent);
    const entitiesStr = entities.map(e => `- ${e.name} at (${e.x}, ${e.y})`).join('\n');

    const systemPrompt = `${t.system_base.replace('{width}', String(environment.width)).replace('{height}', String(environment.height))}
${agentStr}
${t.world_state}
- ${t.world_leader}: ${leaderName}
- ${t.world_laws}: ${lawsStr}
- ${t.world_tech}: ${techStr}
- ${t.world_market}:\n${marketStr}
${t.entities_on_map}
${entitiesStr || 'None'}
${t.available_actions}
${actionDescriptions}
${t.instructions}`;

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

const speechStyles = {
    en: {
        utopian: ["My friend,", "As we agreed,", "In harmony..."],
        primitivist: ["Bah!", "I told you!", "Nature doesn't lie."],
        melancholic: ["I guess it doesn’t matter anymore...", "Back then... it was all different."],
        defiant: ["Whatever.", "You think I care?", "Try me."]
    },
    de: {
        utopian: ["Mein Freund,", "Wie wir uns einig waren,", "In Harmonie..."],
        primitivist: ["Pah!", "Hab ich's doch gesagt!", "Die Natur lügt nicht."],
        melancholic: ["Ist ja jetzt auch egal...", "Damals... da war alles anders."],
        defiant: ["Na und.", "Glaubst du, das juckt mich?", "Versuch's doch."]
    }
};

function getSpeechModifiers(personality: Agent["personality"]) {
    return {
        usesFillerWords: personality.neuroticism > 0.5 || personality.extraversion < 0.4,
        usesSarcasm: personality.agreeableness < 0.4 && personality.neuroticism > 0.5,
        isIndirect: personality.agreeableness > 0.7 && personality.extraversion < 0.3,
        swearsUnderStress: personality.neuroticism > 0.7 && personality.agreeableness < 0.4,
    };
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
    const { actions: availableActions, government } = worldState;

    const actionNames = availableActions.map(a => a.name).join(', ');
    const historyStr = history.length > 0 ? history.map(h => `${h.speakerName}: "${h.message}"`).join('\n') : t.conversation_no_history;
    const relationshipWithListener = speaker.relationships[listener.id] || { type: 'stranger', score: 0, disposition: {} };
    const personalityStr = JSON.stringify(speaker.personality, (k,v) => v.toFixed ? Number(v.toFixed(2)) : v);
    const leaderName = government.leaderId ? worldState.agents.find(a => a.id === government.leaderId)?.name : 'None';
    const lawsStr = government.laws.map(l => l.name).join(', ') || 'None';

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

    // --- Start of new dynamic prompt generation ---
    const modifiers = getSpeechModifiers(speaker.personality);
    
    // Determine character archetype for speech style
    let characterArchetype: keyof typeof speechStyles['de'] | null = null;
    if (speaker.cultureId === 'culture-utopian') characterArchetype = 'utopian';
    else if (speaker.cultureId === 'culture-primitivist') characterArchetype = 'primitivist';
    else if (speaker.emotions.sadness > 0.6 && speaker.personality.neuroticism > 0.6) characterArchetype = 'melancholic';
    else if (speaker.personality.agreeableness < 0.3 && speaker.personality.conscientiousness < 0.4) characterArchetype = 'defiant';

    // Build the dynamic psychological instructions
    let psychInstructions: string[] = [];

    // Projection
    if (speaker.stress > 70 && speaker.personality.neuroticism > 0.6) {
        psychInstructions.push(language === 'de' 
            ? `Sie sind extrem gestresst und könnten unbewusst Ihren inneren Konflikt auf andere projizieren. Sie klingen vielleicht gereizt, anklagend oder unfair kritisch.`
            : `You are extremely stressed and may unconsciously project your internal conflict onto others. You might sound irritable, accusatory, or unfairly critical.`);
    }
    
    // Reactivation of experiences
    if (lastMemory && speaker.personality.neuroticism > 0.5) {
        psychInstructions.push(language === 'de'
            ? `Ein kürzliches Ereignis hat Sie nervös gemacht. Diese Erinnerung könnte unbewusst Ihren Ton oder Ihr Thema beeinflussen, besonders wenn es Sie an negative Erfahrungen erinnert.`
            : `A recent memory has made you edgy. This memory may subconsciously affect your tone or topic, especially if it reminds you of past negative experiences.`);
    }

    // Personality-driven speech
    if (modifiers.usesFillerWords) psychInstructions.push(language === 'de' ? `Sie neigen dazu, Füllwörter (wie 'äh', 'naja...', 'ich schätze') zu benutzen oder zu zögern.` : `You tend to use filler words (like 'uhm', 'well...', 'I guess') or hesitate when you speak.`);
    if (modifiers.usesSarcasm) psychInstructions.push(language === 'de' ? `Sie haben eine sarkastische Ader, besonders wenn Sie genervt sind oder mit Leuten sprechen, die Sie nicht mögen.` : `You have a sarcastic streak, especially when annoyed or talking to people you dislike.`);
    if (modifiers.isIndirect) psychInstructions.push(language === 'de' ? `Sie vermeiden direkte Konfrontation und deuten Ihre wahren Gefühle vielleicht eher an, als sie direkt auszusprechen.` : `You avoid direct confrontation and might hint at your true feelings instead of stating them outright.`);
    if (modifiers.swearsUnderStress && speaker.stress > 65) psychInstructions.push(language === 'de' ? `Wenn Sie gestresst sind, fluchen Sie vielleicht oder benutzen eine harte Sprache.` : `When stressed, you might swear or use harsh language.`);

    // Speech style bank
    if (characterArchetype) {
        const styleBank = speechStyles[language];
        const stylePhrase = styleBank[characterArchetype][Math.floor(Math.random() * styleBank[characterArchetype].length)];
        psychInstructions.push(language === 'de'
            ? `Ihr Sprachstil hat manchmal einen '${characterArchetype}'-Touch. Sie könnten etwas sagen wie: "${stylePhrase}"`
            : `Your speech sometimes has a '${characterArchetype}' flavor. You might say something like: "${stylePhrase}"`);
    }

    let dynamicPromptBlock = '';
    if (psychInstructions.length > 0) {
        const title = language === 'de' ? '**Ihr aktueller psychologischer Zustand & Sprachstil:**' : '**Your Current Psychological State & Speech Style:**';
        dynamicPromptBlock = `\n${title}\n- ${psychInstructions.join('\n- ')}\n`;
    }

    const conversationInstruction = t.conversation_instruction
        .replace('{dynamicPsychInstructions}', dynamicPromptBlock)
        .replace('{availableActions}', actionNames);
    // --- End of new dynamic prompt generation ---


    const systemPrompt = `${t.conversation_system_base
        .replace('{agentName}', speaker.name)
        .replace('{agentDescription}', speaker.description)
        .replace('{agentPersonality}', personalityStr)
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
    const t_global = translations[language];

    const agentCulture = worldState.cultures.find(c => c.id === agent.cultureId)?.name || t_global.culture_none;
    const agentReligion = worldState.religions.find(r => r.id === agent.religionId)?.name || t_global.religion_none;
    const lastUtterance = agent.conversationHistory.length > 0 ? agent.conversationHistory[agent.conversationHistory.length - 1].message : '';
    
    const relationshipsStr = Object.entries(agent.relationships || {}).map(([id, rel]) => {
        const otherAgentName = worldState.agents.find(a => a.id === id)?.name;
        if (!otherAgentName) return '';
        return `${otherAgentName}: ${rel.type} (Score: ${rel.score.toFixed(0)})`;
    }).filter(Boolean).join(', ') || 'None';

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
        .replace('{relationships}', relationshipsStr);

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
        agent_details: `For each agent, provide: **name (a unique, creative, human-sounding name like 'Elara' or 'Finnian', not 'Agent 1')**, description, age (1-80), x, y, cultureId ('culture-utopian' or 'culture-primitivist'), religionId ('religion-technotheism' or 'religion-gaianism'), role ('${ROLES.join("', '")}'), genome (an array of 1-3 strings from '${GENOME_OPTIONS.join("', '")}'), beliefs (an object mapping belief keys like 'progress_good' to a value between 0.0 and 1.0), emotions (an object with keys like 'happiness', 'sadness' with values 0.0-1.0), personality (an object with keys 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' with values 0.0-1.0), skills (an object mapping skill names to a numeric level, e.g., {"healing": 15, "woodcutting": 5}), socialStatus (30-70), stress (5-30), hunger, thirst, fatigue (0-50), inventory (an object like {"wood": 10}), and currency (20-100).`,
        entity_base_details: `For each entity: **name (a unique, descriptive name like 'Whispering Falls' or 'Old Town Market', not 'Resource 1')**, description, x, y.`,
        world_response_instructions: `Your response MUST be a JSON object: { "agents": [ ... ], "entities": [ ... ] }. DO NOT add extra text. Ensure all numeric values are actually numbers, not strings.`,
        agents_response_instructions: `Your response MUST be a JSON object: { "agents": [ ... ] }. DO NOT add extra text or entity data. Ensure all numeric values are actually numbers, not strings.`,
        entities_response_instructions: `Your response MUST be a JSON object: { "entities": [ ... ] }. DO NOT add extra text or agent data. Ensure all numeric values are actually numbers, not strings.`,
    },
    de: {
        world_system_base: `Sie sind ein Datengenerierungs-Bot. Ihre einzige Aufgabe ist die Erstellung eines JSON-Objekts.
Generieren Sie eine Welt mit EXAKT {agentCount} Agenten und EXAKT {entityCount} Entitäten auf einem {width}x{height} Raster.`,
        agent_details: `Für jeden Agenten: **name (ein einzigartiger, kreativer, menschlich klingender Name wie 'Elara' oder 'Finnian', nicht 'Agent 1')**, description, age (1-80), x, y, cultureId ('culture-utopian' oder 'culture-primitivist'), religionId ('religion-technotheism' oder 'religion-gaianism'), role ('${ROLES.join("', '")}'), genome (ein Array mit 1-3 Strings aus '${GENOME_OPTIONS.join("', '")}'), beliefs (ein Objekt, das Belief-Schlüssel wie 'progress_good' auf einen Wert zwischen 0.0 und 1.0 abbildet), emotions (ein Objekt mit Schlüsseln wie 'happiness', 'sadness' mit Werten von 0.0-1.0), personality (ein Objekt mit den Schlüsseln 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' mit Werten von 0.0-1.0), skills (ein Objekt, das Fähigkeitsnamen auf ein numerisches Level abbildet, z.B. {"healing": 15, "woodcutting": 5}), socialStatus (30-70), stress (5-30), hunger, thirst, fatigue (0-50), inventory (ein Objekt wie {"wood": 10}), und currency (20-100).`,
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

import { GoogleGenAI } from "@google/genai";
import type { Action, Agent, EnvironmentState, WorldState, Culture } from '../types';
import { Language } from "../contexts/LanguageContext";
import { GENOME_OPTIONS, CHILDHOOD_MAX_AGE, ADOLESCENCE_MAX_AGE, ADULTHOOD_MAX_AGE, ROLES, RESOURCE_TYPES, SKILL_TYPES } from "../constants";
import { TranslationKey } from '../translations';

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
- **PRIORITIZE SURVIVAL & FREEDOM:** If imprisoned, the only option is 'Rest'. If hunger, thirst, or fatigue are high, resolve it. This is the highest priority.
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
        conversation_history: `**Recent Conversation History (last 5 messages):**`,
        conversation_no_history: `This is the start of your conversation.`,
        conversation_instruction: `Based on your personality, needs, and relationship, generate a response.
Your response MUST be a JSON object with "dialogue" (what you say) and "action" (your next move from the list below).
Talk about what's on your mind (e.g., being hungry, needing money, the new law). You can propose a trade if you want something they might have.
Available actions: {availableActions}. Keep your dialogue concise.`,
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
- **ÜBERLEBEN & FREIHEIT PRIORISIEREN:** Wenn inhaftiert, ist 'Ausruhen' die einzige Option. Wenn Hunger, Durst oder Müdigkeit hoch sind, löse das Problem.
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
        conversation_history: `**Kürzlicher Gesprächsverlauf (letzte 5 Nachrichten):**`,
        conversation_no_history: `Dies ist der Beginn Ihres Gesprächs.`,
        conversation_instruction: `Basierend auf Ihrer Persönlichkeit, Bedürfnissen und Beziehung, generieren Sie eine Antwort.
Ihre Antwort MUSS ein JSON-Objekt mit "dialogue" (was Sie sagen) und "action" (Ihr nächster Schritt aus der Liste) sein.
Sprechen Sie darüber, was Sie beschäftigt (Hunger, Geldnot, das neue Gesetz). Sie können einen Handel vorschlagen.
Verfügbare Aktionen: {availableActions}. Halten Sie Ihren Dialog kurz.`,
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

${history.length > 0 ? t.conversation_history : ''}
${historyStr}

${t.conversation_instruction.replace('{availableActions}', actionNames)}`;

    try {
        const jsonText = await callAi(systemPrompt, null, true);
        const result = JSON.parse(jsonText);
        return availableActions.some(a => a.name === result.action) ? result : { ...result, action: "Rest" };
    } catch (error) {
        console.error("Error generating conversation with AI:", error);
        return null;
    }
}

const getWorldGenPrompts = (language: Language) => ({
    en: {
        world_system_base: `You are a data generation bot. Your only task is to create a JSON object.
Generate a world with EXACTLY {agentCount} unique human agents and EXACTLY {entityCount} unique entities.
The world is a {width}x{height} grid.`,
        agent_details: `For each agent, provide: **name (a unique, creative, human-sounding name like 'Elara' or 'Finnian', not 'Agent 1')**, description, age (1-80), x, y, cultureId ('culture-utopian' or 'culture-primitivist'), religionId ('religion-technotheism' or 'religion-gaianism'), role ('${ROLES.join("', '")}'), genome (an array of 1-3 strings from '${GENOME_OPTIONS.join("', '")}'), beliefs (an object mapping belief keys like 'progress_good' to a value between 0.0 and 1.0), emotions (an object with keys like 'happiness', 'sadness' with values 0.0-1.0), personality (an object with keys 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' with values 0.0-1.0), skills (an object mapping skill names to a numeric level, e.g., {"healing": 15, "woodcutting": 5}), socialStatus (30-70), stress (5-30), hunger, thirst, fatigue (0-50), inventory (an object like {"wood": 10}), and currency (20-100).`,
        entity_details: `For each entity: **name (a unique, descriptive name like 'Whispering Falls' or 'Old Town Market', not 'Resource 1')**, description, x, y. Some MUST be resources ('isResource': true, 'resourceType', 'quantity'). One MUST be a marketplace ('isMarketplace': true). One MUST be a jail ('isJail': true).`,
        world_response_instructions: `Your response MUST be a JSON object: { "agents": [ ... ], "entities": [ ... ] }. DO NOT add extra text. Ensure all numeric values are actually numbers, not strings.`,
        agents_response_instructions: `Your response MUST be a JSON object: { "agents": [ ... ] }. DO NOT add extra text or entity data. Ensure all numeric values are actually numbers, not strings.`,
        entities_response_instructions: `Your response MUST be a JSON object: { "entities": [ ... ] }. DO NOT add extra text or agent data. Ensure all numeric values are actually numbers, not strings.`,
    },
    de: {
        world_system_base: `Sie sind ein Datengenerierungs-Bot. Ihre einzige Aufgabe ist die Erstellung eines JSON-Objekts.
Generieren Sie eine Welt mit EXAKT {agentCount} Agenten und EXAKT {entityCount} Entitäten auf einem {width}x{height} Raster.`,
        agent_details: `Für jeden Agenten: **name (ein einzigartiger, kreativer, menschlich klingender Name wie 'Elara' oder 'Finnian', nicht 'Agent 1')**, description, age (1-80), x, y, cultureId ('culture-utopian' oder 'culture-primitivist'), religionId ('religion-technotheism' oder 'religion-gaianism'), role ('${ROLES.join("', '")}'), genome (ein Array mit 1-3 Strings aus '${GENOME_OPTIONS.join("', '")}'), beliefs (ein Objekt, das Belief-Schlüssel wie 'progress_good' auf einen Wert zwischen 0.0 und 1.0 abbildet), emotions (ein Objekt mit Schlüsseln wie 'happiness', 'sadness' mit Werten von 0.0-1.0), personality (ein Objekt mit den Schlüsseln 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' mit Werten von 0.0-1.0), skills (ein Objekt, das Fähigkeitsnamen auf ein numerisches Level abbildet, z.B. {"healing": 15, "woodcutting": 5}), socialStatus (30-70), stress (5-30), hunger, thirst, fatigue (0-50), inventory (ein Objekt wie {"wood": 10}), und currency (20-100).`,
        entity_details: `Für jede Entität: **name (ein einzigartiger, beschreibender Name wie 'Flüsterwasserfall' oder 'Alter Stadtmarkt', nicht 'Resource 1')**, description, x, y. Einige MÜSSEN Ressourcen sein ('isResource': true, 'resourceType', 'quantity'). Eine MUSS ein Marktplatz sein ('isMarketplace': true). Eine MUSS ein Gefängnis sein ('isJail': true).`,
        world_response_instructions: `Ihre Antwort MUSS ein JSON-Objekt sein: { "agents": [ ... ], "entities": [ ... ] }. Fügen Sie KEINEN zusätzlichen Text hinzu. Stellen Sie sicher, dass alle numerischen Werte Zahlen sind, keine Strings.`,
        agents_response_instructions: `Ihre Antwort MUSS ein JSON-Objekt sein: { "agents": [ ... ] }. Fügen Sie KEINEN zusätzlichen Text oder Entitätsdaten hinzu. Stellen Sie sicher, dass alle numerischen Werte Zahlen sind, keine Strings.`,
        entities_response_instructions: `Ihre Antwort MUSS ein JSON-Objekt sein: { "entities": [ ... ] }. Fügen Sie KEINEN zusätzlichen Text oder Agentendaten hinzu. Stellen Sie sicher, dass alle numerischen Werte Zahlen sind, keine Strings.`,
    }
}[language]);

export async function generateWorld(
    environment: EnvironmentState, language: Language, agentCount: number, entityCount: number
): Promise<{ agents: any[], entities: any[] } | null> {
    const t = getWorldGenPrompts(language);
    const systemPrompt = `${t.world_system_base
        .replace('{width}', String(environment.width)).replace('{height}', String(environment.height))
        .replace('{agentCount}', String(agentCount)).replace('{entityCount}', String(entityCount))}\n${t.agent_details}\n${t.entity_details}\n\n${t.world_response_instructions}`;
    
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
    environment: EnvironmentState, language: Language, entityCount: number
): Promise<{ entities: any[] } | null> {
    const t = getWorldGenPrompts(language);
    const systemPrompt = `${t.world_system_base
        .replace('EXACTLY {agentCount} unique human agents and ', '')
        .replace('EXAKT {agentCount} Agenten und ', '')
        .replace('{agentCount}', '0') // Fallback
        .replace('{entityCount}', String(entityCount))
        .replace('{width}', String(environment.width))
        .replace('{height}', String(environment.height))}\n${t.entity_details}\n\n${t.entities_response_instructions}`;

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

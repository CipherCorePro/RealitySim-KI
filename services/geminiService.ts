
import type { Action, Agent, EnvironmentState, WorldState } from '../types';
import { Language } from "../contexts/LanguageContext";
import { GENOME_OPTIONS, CHILDHOOD_MAX_AGE, ADOLESCENCE_MAX_AGE, ADULTHOOD_MAX_AGE, ROLES, RESOURCE_TYPES } from "../constants";
import type { TranslationKey } from '../translations';

export class LmStudioError extends Error {
    constructor(message: string, public translationKey?: TranslationKey) {
        super(message);
        this.name = 'LmStudioError';
    }
}

const getLifeStage = (age: number, t: any) => {
    if (age <= CHILDHOOD_MAX_AGE) return t.lifeStage_child;
    if (age <= ADOLESCENCE_MAX_AGE) return t.lifeStage_adolescent;
    if (age <= ADULTHOOD_MAX_AGE) return t.lifeStage_adult;
    return t.lifeStage_elder;
}

const prompts = {
    en: {
        system_base: `You are an assistant for a reality simulation. Your task is to interpret a user's prompt and select the most appropriate action for an AI agent to perform from a given list.
Consider the agent's current state, survival needs (hunger, thirst, fatigue), role, religion, life stage, health, beliefs, emotions, relationships, inventory, position, and the overall environment to make the best choice. The world is a {width}x{height} grid.`,
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
        social_history: 'Social History:',
        other_agents: `**Other Agents:**`,
        entities_on_map: `**Entities on Map (incl. Resources):**`,
        available_actions: `**Available Actions:**`,
        current_env: `**Current Environment State:**`,
        user_prompt: `**User's Prompt:**`,
        instructions: `Based on all the information, which single action is the most logical for the agent?
- **PRIORITIZE SURVIVAL:** If hunger, thirst, or fatigue are high, choose an action to resolve it (e.g., 'Eat Food', 'Drink Water', 'Rest'). This is the highest priority.
- Consider life stage: Children can't perform adult actions. Elders might prefer to 'Rest'.
- Consider role: A 'Healer' should 'Heal' sick people. A 'Worker' might 'Gather Wood' or 'Build Shelter'.
- Consider religion: A religious agent might 'Pray'. Their actions should align with their dogma.
- Consider relationships: High 'love' could lead to 'Reproduce'. High 'anger' could lead to 'Fight'.
- Analyze the user's prompt and the agent's situation deeply.
Return ONLY the name of the chosen action (e.g., "Move North").
If no action is suitable, return "Keine Aktion".`,
        conversation_system_base: `You are a character in a reality simulation. You are playing the role of an AI agent named {agentName}.
Your personality is: "{agentDescription}".
Your current role in society is: {agentRole}.
Your religion is: {agentReligion}.
Your current life stage is: {agentLifeStage}.
Your culture is '{agentCulture}'.
Your current health is {agentHealth}/100 and your age is {agentAge}.
Your survival needs are: Hunger {agentHunger}/100, Thirst {agentThirst}/100, Fatigue {agentFatigue}/100.
Your inventory contains: {agentInventory}.
Your genetic markers are: [{agentGenome}].
Your current situational emotional state is: {agentEmotions}.
You are currently located at position ({agentX}, {agentY}).
The environment around you is: {environment}.
You are about to have a conversation with another agent named {otherAgentName}.
Their personality is: "{otherAgentDescription}".
Their current health is {otherAgentHealth}/100.
Your current relationship with them is '{relationshipType}' with a score of {relationshipScore} (0=hate, 100=love).
Your long-term learned feelings (disposition) towards them are: {relationshipDisposition}.
{socialHistorySection}`,
        conversation_history: `**Recent Conversation History (last 5 messages):**`,
        conversation_no_history: `This is the start of your conversation.`,
        conversation_instruction: `Based on your personality, role, needs (are you hungry?), emotions, relationship, and the conversation so far, generate a response.
Your response MUST be a JSON object with two keys: "dialogue" (what you say out loud, as a string) and "action" (the name of the *next* single action you want to take from the list below).
The "dialogue" should reflect your character. If you are very hungry, you might mention it.
The "action" should be your immediate next move. If you are thirsty, maybe you should 'Drink Water'.
Available actions: {availableActions}.
Keep your dialogue concise and human-like.`,
        lifeStage_child: 'Child',
        lifeStage_adolescent: 'Adolescent',
        lifeStage_adult: 'Adult',
        lifeStage_elder: 'Elder',
    },
    de: {
        system_base: `Sie sind ein Assistent für eine Realitätssimulation. Ihre Aufgabe ist es, die Eingabe eines Benutzers zu interpretieren und die am besten geeignete Aktion für einen KI-Agenten aus einer gegebenen Liste auszuwählen.
Berücksichtigen Sie den aktuellen Zustand, die Überlebensbedürfnisse (Hunger, Durst, Müdigkeit), Rolle, Religion, Lebensphase, Gesundheit, Überzeugungen, Emotionen, Beziehungen, Inventar, Position des Agenten und die gesamte Umgebung, um die beste Wahl zu treffen. Die Welt ist ein {width}x{height} Raster.`,
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
        social_history: 'Soziale Historie:',
        other_agents: `**Andere Agenten:**`,
        entities_on_map: `**Entitäten auf der Karte (inkl. Ressourcen):**`,
        available_actions: `**Verfügbare Aktionen:**`,
        current_env: `**Aktueller Umgebungszustand:**`,
        user_prompt: `**Eingabe des Benutzers:**`,
        instructions: `Welche einzelne Aktion ist auf Basis aller Informationen die logischste für den Agenten?
- **ÜBERLEBEN PRIORISIEREN:** Wenn Hunger, Durst oder Müdigkeit hoch sind, wähle eine Aktion, um das Problem zu lösen (z.B. 'Essen', 'Wasser trinken', 'Ausruhen'). Dies hat höchste Priorität.
- Berücksichtigen Sie die Lebensphase: Kinder können keine Erwachsenen-Aktionen ausführen. Ältere bevorzugen vielleicht 'Ausruhen'.
- Berücksichtigen Sie die Rolle: Ein 'Heiler' sollte 'Heilen'. Ein 'Arbeiter' könnte 'Holz sammeln' oder 'Unterkunft bauen'.
- Berücksichtigen Sie die Religion: Ein religiöser Agent könnte 'Beten'.
- Berücksichtigen Sie Beziehungen: Hohe 'Liebe' könnte zu 'Fortpflanzen' führen. Hohe 'Wut' zu einem 'Kampf'.
- Analysieren Sie die Benutzereingabe und die Situation des Agenten genau.
Geben Sie NUR den Namen der gewählten Aktion zurück (z.B. "Move North").
Wenn keine Aktion geeignet ist, geben Sie "Keine Aktion" zurück.`,
        conversation_system_base: `Sie sind eine Figur in einer Realitätssimulation. Sie spielen die Rolle eines KI-Agenten namens {agentName}.
Ihre Persönlichkeit ist: "{agentDescription}".
Ihre aktuelle gesellschaftliche Rolle ist: {agentRole}.
Ihre Religion ist: {agentReligion}.
Ihre aktuelle Lebensphase ist: {agentLifeStage}.
Ihre Kultur ist '{agentCulture}'.
Ihre aktuelle Gesundheit beträgt {agentHealth}/100 und Ihr Alter ist {agentAge}.
Ihre Überlebensbedürfnisse sind: Hunger {agentHunger}/100, Durst {agentThirst}/100, Müdigkeit {agentFatigue}/100.
Ihr Inventar enthält: {agentInventory}.
Ihre genetischen Marker sind: [{agentGenome}].
Ihr aktueller situativer emotionaler Zustand ist: {agentEmotions}.
Sie befinden sich derzeit an Position ({agentX}, {agentY}).
Die Umgebung um Sie herum ist: {environment}.
Sie sind im Begriff, ein Gespräch mit einem anderen Agenten namens {otherAgentName} zu führen.
Dessen Persönlichkeit ist: "{otherAgentDescription}".
Dessen aktuelle Gesundheit beträgt {otherAgentHealth}/100.
Ihre aktuelle Beziehung zu dieser Person ist '{relationshipType}' mit einem Wert von {relationshipScore} (0=Hass, 100=Liebe).
Ihre langfristig erlernten Gefühle (Disposition) dieser Person gegenüber sind: {relationshipDisposition}.
{socialHistorySection}`,
        conversation_history: `**Kürzlicher Gesprächsverlauf (letzte 5 Nachrichten):**`,
        conversation_no_history: `Dies ist der Beginn Ihres Gesprächs.`,
        conversation_instruction: `Basierend auf Ihrer Persönlichkeit, Rolle, Bedürfnissen (sind Sie hungrig?), Emotionen, Beziehung und dem bisherigen Gespräch, generieren Sie eine Antwort.
Ihre Antwort MUSS ein JSON-Objekt mit zwei Schlüsseln sein: "dialogue" (was Sie laut sagen, als Zeichenkette) und "action" (der Name der *nächsten* einzelnen Aktion, die Sie aus der folgenden Liste ausführen möchten).
Der "dialogue" sollte Ihren Charakter widerspiegeln. Wenn Sie sehr hungrig sind, könnten Sie das erwähnen.
Die "action" sollte Ihr unmittelbarer nächster Schritt sein. Wenn Sie durstig sind, sollten Sie vielleicht 'Wasser trinken'.
Verfügbare Aktionen: {availableActions}.
Halten Sie Ihren Dialog kurz und menschenähnlich.`,
        lifeStage_child: 'Kind',
        lifeStage_adolescent: 'Jugendlicher',
        lifeStage_adult: 'Erwachsener',
        lifeStage_elder: 'Ältester',
    }
};

interface LmStudioConfig {
    url: string;
    model: string;
}

const getLmStudioConfig = (): LmStudioConfig => {
    const storedSettings = localStorage.getItem('realitysim_settings');
    if (storedSettings) {
        try {
            const parsed = JSON.parse(storedSettings);
            if (parsed.lmStudioUrl && parsed.lmStudioModel) {
                return { url: parsed.lmStudioUrl, model: parsed.lmStudioModel };
            }
        } catch (e) {
             console.error("Could not parse settings from localStorage", e);
        }
    }
    throw new Error("LM Studio URL and/or Model not configured. Please configure them in the settings menu.");
};


const callLmStudio = async (systemPrompt: string, userPrompt: string | null, jsonMode: boolean = false) => {
    const config = getLmStudioConfig();
    
    const messages = [{ role: 'system', content: systemPrompt }];
    if(userPrompt) {
        messages.push({ role: 'user', content: userPrompt });
    } else {
        messages.push({ role: 'user', content: "Please provide the response based on the system instructions. Generate JSON if requested." });
    }

    const body: any = {
        messages: messages,
        temperature: 0.7,
        model: config.model,
    };

    // This parameter can cause issues with some LM Studio versions.
    // The prompts already instruct the model to return JSON, which is more compatible.
    /*
    if (jsonMode) {
        body.response_format = { type: 'json_object' };
    }
    */

    let fullUrl: string;
    try {
        const userUrl = new URL(config.url);
        const baseUrl = `${userUrl.protocol}//${userUrl.host}`;
        const endpoint = '/v1/chat/completions';
        fullUrl = `${baseUrl}${endpoint}`;
    } catch (e) {
        throw new LmStudioError("Invalid LM Studio URL format.", 'error_lmStudio_url_invalid');
    }

    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`LM Studio API Error (${response.status}): ${errorBody}`);
        }

        const data = await response.json();
        if (!data.choices || data.choices.length === 0 || !data.choices[0].message.content) {
            throw new Error("Received an invalid response from LM Studio.");
        }
        
        let content = data.choices[0].message.content;
        
        // Clean up markdown code blocks if the model wraps the JSON
        if(jsonMode && content.startsWith("```json")) {
            content = content.substring(7, content.length - 3).trim();
        }
        
        return content;
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
             throw new LmStudioError('Failed to fetch from LM Studio.', 'error_lmStudio_cors');
        }
        if (error instanceof Error) {
            throw error; // Re-throw other known errors
        }
        throw new Error("An unknown error occurred while contacting the LM Studio API.");
    }
};


export async function generateActionFromPrompt(
    prompt: string, 
    availableActions: Action[], 
    agent: Agent, 
    worldState: WorldState,
    language: Language
): Promise<string | null> {
    
    const t = prompts[language];
    const { environment, agents: allAgents, entities, religions } = worldState;

    const actionDescriptions = availableActions.map(action => `- ${action.name}: ${action.description}`).join('\n');
    const environmentStr = JSON.stringify(environment, null, 2);
    const beliefNetworkStr = JSON.stringify(agent.beliefNetwork, (k,v) => v.toFixed ? Number(v.toFixed(2)) : v, 2);
    const emotionsStr = JSON.stringify(agent.emotions, (k,v) => v.toFixed ? Number(v.toFixed(2)) : v, 2);
    
    const otherAgentsStr = allAgents
        .filter(a => a.id !== agent.id)
        .map(a => `- ${a.name} at (${a.x}, ${a.y}) ${a.isAlive ? '' : '(deceased)'}`)
        .join('\n');

     const entitiesStr = entities
        .map(e => `- ${e.name} at (${e.x}, ${e.y})${e.isResource ? ` [${e.resourceType}: ${e.quantity}]` : ''}`)
        .join('\n');

    const inventoryStr = Object.entries(agent.inventory || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

    const relationshipsStr = Object.entries(agent.relationships || {})
        .map(([agentId, rel]) => {
            const otherAgent = allAgents.find(a => a.id === agentId);
            if (!otherAgent) return '';
            const dispositionStr = JSON.stringify(rel.disposition, (k,v) => v.toFixed ? Number(v.toFixed(2)) : v);
            return `- ${otherAgent.name}: ${rel.type} (Score: ${rel.score.toFixed(1)}), Disposition: ${dispositionStr}`;
        })
        .filter(Boolean)
        .join('\n');
    
    const socialHistoryStr = (agent.socialMemory || [])
        .map(mem => {
            const otherAgent = allAgents.find(a => a.id === mem.agentId);
            if (!otherAgent) return '';
            const timeAgo = environment.time - mem.timestamp;
            return `- With ${otherAgent.name} (${timeAgo} steps ago): Action '${mem.action}' result was '${mem.result}'. (Emotional Impact: ${mem.emotionalImpact.toFixed(1)})`;
        })
        .filter(Boolean)
        .join('\n');
    
    const agentReligion = (religions || []).find(r => r.id === agent.religionId);

    const systemPrompt = `
${t.system_base.replace('{width}', String(environment.width)).replace('{height}', String(environment.height))}

${t.agent_state}
- ${t.agent_name}: ${agent.name}
- ${t.agent_age}: ${agent.age.toFixed(1)}
- ${t.agent_lifeStage}: ${getLifeStage(agent.age, t)}
- ${t.agent_role}: ${agent.role || 'None'}
- ${t.agent_religion}: ${agentReligion?.name || 'None'}
- ${t.agent_genome}: [${(agent.genome || []).join(', ')}]
- ${t.agent_culture}: ${agent.cultureId || 'None'}
- ${t.agent_position}: (${agent.x}, ${agent.y})
- ${t.agent_health}: ${agent.health.toFixed(0)}/100
- ${t.agent_sickness}: ${agent.sickness || t.agent_sickness_none}
- ${t.agent_needs}: ${t.agent_hunger} ${agent.hunger.toFixed(0)}/100, ${t.agent_thirst} ${agent.thirst.toFixed(0)}/100, ${t.agent_fatigue} ${agent.fatigue.toFixed(0)}/100
- ${t.agent_inventory}: ${inventoryStr || t.agent_inventory_none}
- ${t.agent_beliefs}: ${beliefNetworkStr}
- ${t.agent_emotions}: ${emotionsStr}
- ${t.agent_relationships}:
${relationshipsStr || t.agent_relationships_none}

${socialHistoryStr ? `${t.social_history}\n${socialHistoryStr}` : ''}

${t.other_agents}
${otherAgentsStr || 'None'}

${t.entities_on_map}
${entitiesStr || 'None'}

${t.available_actions}
${actionDescriptions}

${t.current_env}
${environmentStr}

${t.instructions}
    `;

    const userPromptContent = `${t.user_prompt}\n"${prompt}"`;

    try {
        const content = await callLmStudio(systemPrompt, userPromptContent, false);
        const text = content.trim();
        
        const matchingAction = availableActions.find(a => a.name === text);
        if (matchingAction) {
            return matchingAction.name;
        }

        if (text === "Keine Aktion") {
            return "Keine Aktion";
        }

        const bestMatch = availableActions.find(a => text.toLowerCase().includes(a.name.toLowerCase()));
        return bestMatch ? bestMatch.name : "Keine Aktion";

    } catch (error) {
        console.error("Error generating action with local AI:", error);
        if (error instanceof Error) {
            // Re-throw custom errors to be handled by the UI
            if (error instanceof LmStudioError) throw error;
            throw new Error(`AI Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred with the local AI API.");
    }
}


export async function generateAgentConversation(
    speaker: Agent,
    listener: Agent,
    history: { speakerName: string; message: string }[],
    worldState: WorldState,
    language: Language
): Promise<{ dialogue: string; action: string; } | null> {
    const t = prompts[language];
    const { environment, actions: availableActions, religions } = worldState;

    const actionNames = availableActions.map(a => a.name).join(', ');
    const historyStr = history.length > 0
        ? history.map(h => `${h.speakerName}: "${h.message}"`).join('\n')
        : t.conversation_no_history;

    const relationshipWithListener = (speaker.relationships && speaker.relationships[listener.id]) || { type: 'stranger', score: 0, disposition: { happiness: 0.1, sadness: 0.1, anger: 0.1, fear: 0.1, trust: 0.3, love: 0.1 } };
    const emotionsStr = JSON.stringify(speaker.emotions, (k,v) => v.toFixed ? Number(v.toFixed(2)) : v, 2);
    const dispositionStr = JSON.stringify(relationshipWithListener.disposition, (k,v) => v.toFixed ? Number(v.toFixed(2)) : v, 2);
    const inventoryStr = Object.entries(speaker.inventory || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ') || t.agent_inventory_none;

    const socialHistoryWithListenerStr = (speaker.socialMemory || [])
        .filter(mem => mem.agentId === listener.id)
        .map(mem => {
            const timeAgo = environment.time - mem.timestamp;
            return `- ${timeAgo} steps ago: Action '${mem.action}' result was '${mem.result}'. (My Emotional Impact: ${mem.emotionalImpact.toFixed(1)})`;
        })
        .filter(Boolean)
        .join('\n');
    
    const socialHistorySection = socialHistoryWithListenerStr 
        ? `${t.social_history}\n${socialHistoryWithListenerStr}`
        : '';
    
    const speakerReligion = (religions || []).find(r => r.id === speaker.religionId);


    const systemPrompt = `
${t.conversation_system_base
    .replace('{agentName}', speaker.name)
    .replace('{agentDescription}', speaker.description)
    .replace('{agentRole}', String(speaker.role || 'None'))
    .replace('{agentReligion}', String(speakerReligion?.name || 'None'))
    .replace('{agentLifeStage}', getLifeStage(speaker.age, t))
    .replace('{agentCulture}', String(speaker.cultureId))
    .replace('{agentHealth}', String(speaker.health.toFixed(0)))
    .replace('{agentAge}', speaker.age.toFixed(1))
    .replace('{agentHunger}', speaker.hunger.toFixed(0))
    .replace('{agentThirst}', speaker.thirst.toFixed(0))
    .replace('{agentFatigue}', speaker.fatigue.toFixed(0))
    .replace('{agentInventory}', inventoryStr)
    .replace('{agentGenome}', (speaker.genome || []).join(', '))
    .replace('{agentEmotions}', emotionsStr)
    .replace('{agentX}', String(speaker.x))
    .replace('{agentY}', String(speaker.y))
    .replace('{environment}', JSON.stringify(environment))
    .replace('{otherAgentName}', listener.name)
    .replace('{otherAgentDescription}', listener.description)
    .replace('{otherAgentHealth}', String(listener.health.toFixed(0)))
    .replace('{relationshipType}', relationshipWithListener.type)
    .replace('{relationshipScore}', relationshipWithListener.score.toFixed(1))
    .replace('{relationshipDisposition}', dispositionStr)
    .replace('{socialHistorySection}', socialHistorySection)
}

${history.length > 0 ? t.conversation_history : ''}
${historyStr}

${t.conversation_instruction.replace('{availableActions}', actionNames)}
    `;

    try {
        const jsonText = await callLmStudio(systemPrompt, null, true);
        const result = JSON.parse(jsonText);
        
        const actionExists = availableActions.some(a => a.name === result.action);
        if (actionExists) {
            return result;
        } else {
            // Fallback to a safe action if the generated one is invalid
            return { ...result, action: "Rest" };
        }

    } catch (error) {
        console.error("Error generating conversation with local AI:", error);
        return null;
    }
}


export async function generateWorld(
    environment: EnvironmentState,
    language: Language,
    agentCount: number,
    entityCount: number
): Promise<{ agents: any[], entities: any[] } | null> {
    
    const worldGenPrompts = {
        en: {
            system_base: `You are a data generation bot. Your only task is to create a JSON object.
Generate a world with EXACTLY {agentCount} unique human agents and EXACTLY {entityCount} unique entities.
The world is a {width}x{height} grid.

For each agent, provide: name, one-sentence description, age (1-80), x/y coordinates.
- Assign a 'cultureId': 'culture-utopian' or 'culture-primitivist'.
- Assign a 'religionId': 'religion-technotheism' or 'religion-gaianism'.
- Assign a 'role': '${ROLES.join("', '")}'. Distribute them evenly.
- Assign a 'genome' array with 1 to 3 unique strings from: '${GENOME_OPTIONS.join("', '")}'.
- Assign initial 'hunger', 'thirst', 'fatigue' between 0 and 50.
- Assign a starting 'inventory' object, maybe with some food or wood.

For each entity, provide: name, one-sentence description, x/y coordinates.
- **A portion of entities MUST be resources.** For these, add:
- 'isResource': true
- 'resourceType': one of '${RESOURCE_TYPES.join("', '")}'.
- 'quantity': a number (e.g., 25 for food, 100 for wood, or 1000000 for water).
- Example resource entity: { "name": "Berry Bush", ..., "isResource": true, "resourceType": "food", "quantity": 25 }
- Example normal entity: { "name": "Old Statue", ... }`,
            response_instructions: `Your response MUST be a JSON object that strictly follows this structure: { "agents": [ { "name": "...", "description": "...", "age": ..., "x": ..., "y": ..., "cultureId": "...", "religionId": "...", "role": "...", "beliefs": [ { "key": "...", "value": 0.5 } ], "genome": [ "..." ], "hunger": ..., "thirst": ..., "fatigue": ..., "inventory": { "food": 5 } } ], "entities": [ { "name": "...", "description": "...", "x": ..., "y": ..., "isResource": true, "resourceType": "food", "quantity": 25 } ] }.
DO NOT add any extra text, explanations, or markdown. Only output the raw JSON. The agent and entity arrays MUST contain the exact number requested.`,
        },
        de: {
            system_base: `Sie sind ein Datengenerierungs-Bot. Ihre einzige Aufgabe ist es, ein JSON-Objekt zu erstellen.
Generieren Sie eine Welt mit EXAKT {agentCount} einzigartigen menschlichen Agenten und EXAKT {entityCount} einzigartigen Entitäten.
Die Welt ist ein {width}x{height}-Raster.

Geben Sie für jeden Agenten an: Name, einzeilige Beschreibung, Alter (1-80), x/y-Koordinaten.
- Weisen Sie eine 'cultureId' zu: 'culture-utopian' oder 'culture-primitivist'.
- Weisen Sie eine 'religionId' zu: 'religion-technotheism' oder 'religion-gaianism'.
- Weisen Sie eine 'role' zu: '${ROLES.join("', '")}'. Verteilen Sie sie gleichmäßig.
- Weisen Sie ein 'genome'-Array mit 1 bis 3 einzigartigen Zeichenketten zu aus: '${GENOME_OPTIONS.join("', '")}'.
- Weisen Sie anfängliche Werte für 'hunger', 'thirst', 'fatigue' zwischen 0 und 50 zu.
- Weisen Sie ein anfängliches 'inventory'-Objekt zu, vielleicht mit etwas Nahrung oder Holz.

Geben Sie für jede Entität an: Name, einzeilige Beschreibung, x/y-Koordinaten.
- **Ein Teil der Entitäten MUSS eine Ressource sein.** Fügen Sie für diese hinzu:
- 'isResource': true
- 'resourceType': eine von '${RESOURCE_TYPES.join("', '")}'.
- 'quantity': eine Zahl (z.B. 25 für Nahrung, 100 für Holz oder 1000000 für Wasser).
- Beispiel Ressourcen-Entität: { "name": "Beerenbusch", ..., "isResource": true, "resourceType": "food", "quantity": 25 }
- Beispiel normale Entität: { "name": "Alte Statue", ... }`,
            response_instructions: `Ihre Antwort MUSS ein JSON-Objekt sein, das dem Schema strikt folgt: { "agents": [ { "name": "...", "description": "...", "age": ..., "x": ..., "y": ..., "cultureId": "...", "religionId": "...", "role": "...", "beliefs": [ { "key": "...", "value": 0.5 } ], "genome": [ "..." ], "hunger": ..., "thirst": ..., "fatigue": ..., "inventory": { "food": 5 } } ], "entities": [ { "name": "...", "description": "...", "x": ..., "y": ..., "isResource": true, "resourceType": "food", "quantity": 25 } ] }.
Fügen Sie KEINEN zusätzlichen Text, Erklärungen oder Markdown hinzu. Geben Sie nur das rohe JSON aus. Die Agenten- und Entitäten-Arrays MÜSSEN die exakt angeforderte Anzahl enthalten.`,
        }
    };

    const t = worldGenPrompts[language];
    const systemPrompt = `${t.system_base
        .replace('{width}', String(environment.width))
        .replace('{height}', String(environment.height))
        .replace('{agentCount}', String(agentCount))
        .replace('{entityCount}', String(entityCount))
    }\n\n${t.response_instructions}`;
    
    try {
        const jsonText = await callLmStudio(systemPrompt, null, true);
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating world with local AI:", error);
        if (error instanceof Error) {
             // Re-throw custom errors to be handled by the UI
            if (error instanceof LmStudioError) throw error;
            throw new Error(`AI Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the world.");
    }
}
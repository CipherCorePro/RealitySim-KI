# RealitySim AI User Manual

_Welcome to the user manual for RealitySim AI, an interactive web-based simulation environment. This application allows you to observe and control a dynamic world where AI agents with unique beliefs, complex psychological profiles, and memories interact with each other and their environment. You can control agents using natural language, run simulation steps, and visualize the emergent cognitive and social behavior of the system. Dive into a living world that evolves with every step._

## 1. Getting Started

Before you delve into the details of the simulation, here are the basic controls to get you started:

*   **Settings** (Gear icon button in the header): **IMPORTANT:** Before you can use any AI features, you must enter the API endpoint and model name of your local LM Studio server here.
*   **Generate World** (Globe icon button): Click this to open a dialog where you can set the number of agents and entities to generate. After confirmation, the AI will create a completely new world based on your specifications.
*   **Step** (Play icon button): Advances the simulation by a single time step. Agents make decisions, interact, and the environment evolves.
*   **Run** (Fast-Forward icon button): Allows you to automatically run the simulation for a predefined number of steps (default is 10). The number of steps can be adjusted in the input field next to the button.
*   **Reset** (Undo arrow icon button): Resets the entire simulation to its original starting state. All changes and progress will be lost.
*   **Language Switcher** (Button with language code like 'EN' or 'DE'): Click this to toggle the user interface between English and German.

### 1.1. Configuring the Local AI Model
This application uses an AI model that runs locally via LM Studio. You must configure the application to connect to your LM Studio server.

1.  **Start LM Studio:** Ensure LM Studio is running on your computer and you have loaded a model.
2.  **Start the Local Server:** In LM Studio, go to the **Local Server** tab (icon: `<->`) and click **Start Server**.
3.  **Find the Configuration Details:**
    *   **Server URL:** LM Studio will display an accessible address at the top (e.g., `http://localhost:1234`). You only need this base part of the URL.
    *   **Model Identifier:** In the right sidebar under "API Usage," you will find the "API Identifier" of the model (e.g., `google/gemma-2b-it`). This is **not** the filename of the `.gguf` file.
4.  **Configure RealitySim AI:**
    *   Click the **Settings** (Gear icon) button in the application's header.
    *   Enter the **Base URL** (e.g., `http://localhost:1234`) into the "LM Studio API Endpoint" field. **Do not** add the path `/v1/chat/completions`.
    *   Enter the **API Identifier** of the model (e.g., `google/gemma-2b-it`) into the "Model Name" field.
    *   Click "Save".

### 1.2 The Role of AI
All intelligent functions in RealitySim AI are driven by the local AI model you configure in the settings (via LM Studio). This includes:

*   **World Generation**: Creating new, complex worlds with psychologically differentiated agents.
*   **Interactive Prompts**: Interpreting your instructions to agents when the AI toggle is enabled.

**No** communication with external AI services takes place. All AI processing occurs locally on your machine via LM Studio.

### 1.3 Generating Additional Content with AI
Beyond generating an entire world, you can also add new agents and entities to an existing simulation using AI.

1.  Click the **"Add with AI"** button (Plus Square icon) in the header.
2.  A modal window will appear with two sections: "Add New Agents" and "Add New Entities."
3.  **To add Agents:**
    *   In the "Add New Agents" section, enter the desired "Number of new agents" (e.g., 5).
    *   Click the **"Generate Agents"** button. The AI will create new agents with unique personalities, beliefs, and starting inventories, adding them to your world.
4.  **To add Entities:**
    *   In the "Add New Entities" section, specify the number of each entity type you wish to add (Food Sources, Water Sources, Wood Sources, Iron Sources, Buildings/Objects).
    *   Click the **"Generate Entities"** button. The AI will create and place these new resources or objects in your world.

This allows for dynamic expansion of your simulation without resetting the entire world.

## 2. The User Interface (UI) at a Glance

The RealitySim AI application is divided into several key areas:

*   **Header**: Located at the top, it contains the application title, the **Control Panel** (simulation controls), **Settings** button, and **Language Switcher**.
*   **Left Sidebar**: Displays lists of all **Agents** and **Entities** currently in the simulation. You can click on an agent's name to select them and view their detailed information in the central area. Agents can be deleted using the trashcan icon next to their name. Entities can also be deleted.
*   **Central Area**: This is the main interactive space.
    *   **Agent Card**: When an agent is selected from the left sidebar, their detailed profile is displayed here. This card provides in-depth information about their status, needs, personality, beliefs, emotions, relationships, inventory, goals, and genetic traits. It also includes the **Interaction** panel for prompting the agent and the **"View Psychological Profile"** button.
    *   **World Map**: Below the Agent Card, this visual representation shows the agents and entities on a grid. Agents are represented by icons (e.g., a person for living agents, a skull for deceased), and entities by relevant icons (e.g., a house, an apple for food, a hammer for iron). Lines connect agents with strong relationships.
*   **Right Sidebar**: Provides global information and creation tools.
    *   **Environment**: Displays current world parameters like time, width, height, and election status.
    *   **Available Actions**: Lists all possible actions agents can perform in the simulation. Actions can be deleted from this list.
    *   **Create New Panel**: Allows you to manually create new agents, entities, or custom actions.
    *   **Event Log**: A chronological list of all significant events and actions that occur in the simulation.
    *   **Save & Load State Panel**: Tools to save the current simulation state to a file or load a previously saved state.
*   **Admin Control Panel**: This panel replaces the 'Environment', 'Available Actions', and 'Create New' panels in the right sidebar when the special 'Admin' agent is selected. It offers advanced control and manipulation capabilities over the simulation.

## 3. Core Workflows

This section details the primary ways you will interact with and manage the simulation.

### 3.1. Running the Simulation

1.  **Advance One Step:** Click the **"Step"** button (Play icon) in the header. The simulation will advance by one time unit, and all active agents will attempt to perform one action based on their internal state and the world conditions. The Event Log will update with the outcomes.
2.  **Run Multiple Steps:** To run the simulation continuously for a set number of steps:
    *   Enter the desired number of steps into the input field next to the "Run" button (Fast-Forward icon).
    *   Click the **"Run"** button. The simulation will automatically advance for the specified number of steps, and a "Processing step(s)..." indicator will appear.
3.  **Resetting the Simulation:** To clear the current simulation and start fresh, click the **"Reset"** button (Undo arrow icon) in the header. A confirmation dialog will appear. Confirm to revert to the initial world state.

### 3.2. Interacting with Agents (Prompting)
You can directly influence an agent's behavior by giving them prompts.

1.  **Select an Agent:** In the left sidebar, click on the name of the agent you wish to interact with. Their detailed **Agent Card** will appear in the central area.
2.  **Enter a Prompt:** In the "Interact" section at the bottom of the Agent Card, type your instruction into the input field.
3.  **Choose AI Interpretation Mode:**
    *   **"Use AI" (Toggle ON, Sparkles icon is blue):** This is the default and recommended mode. The AI will interpret your natural language prompt and try to find the most logical action for the agent from its list of available actions. For example, typing "Go find some food" might lead the AI to select the "Gather Food" action.
    *   **"Use AI" (Toggle OFF, Sparkles icon is grey):** In this mode, the agent will attempt to execute your prompt as an exact action name. You must type the action name precisely (e.g., "Gather Food"). This is useful for testing specific actions.
4.  **Send Prompt:** Click the **"Send"** button (Paper Plane icon) or press Enter. The agent will attempt to perform the action, and the outcome will be recorded in the Event Log.

### 3.3. Creating New Agents, Entities, or Actions
Use the "Create New" panel in the right sidebar to manually add elements to your simulation.

1.  **Select Type:** Use the dropdown menu at the top of the panel to choose what you want to create: "Agent", "Entity", or "Action."
2.  **Enter Details:**
    *   **For Agents:** Provide a Name, Description, optional Beliefs (in JSON format, e.g., `{"key":0.5}`), Genes (comma-separated, e.g., `G-AGILE, G-SOCIAL`), a Role, and adjust their Personality traits using sliders or randomize them. Genes provide passive bonuses (e.g., `G-AGILE` for faster movement).
    *   **For Entities:** Provide a Name and Description. Entities are objects in the world like houses, resources, or landmarks.
    *   **For Actions:** Provide a Name, Description, and an optional Belief Key. Actions define what agents can do.
3.  **Create:** Click the **"Create"** button at the bottom of the panel. The new element will be added to the simulation and appear in the relevant lists (Agents, Entities, or Available Actions).

### 3.4. Saving and Loading Simulation State
To preserve or restore your simulation progress, use the "Save & Load State" panel in the right sidebar.

1.  **Save Full State:** Click the **"Save Full State"** button (Download icon). This will download a JSON file containing all agents, entities, environment settings, and actions to your computer. The file name will include a timestamp.
2.  **Load Full State:** Click the **"Load Full State"** button (Upload icon). A file selection dialog will appear. Choose a previously saved JSON state file to load it into the simulation. This will overwrite the current simulation.
3.  **Advanced Export Options:** Click the "Advanced Export Options" summary to reveal buttons for exporting only specific parts of the simulation (Environment Only, Agents Only, Entities Only). These are useful for debugging or sharing specific components.

## 4. Detailed Feature Explanations

RealitySim AI incorporates advanced systems that govern the behavior and evolution of its simulated world.

### 4.1. Extended Economic Models
The economy now goes beyond simple resource gathering.

*   **Currency**: Agents now possess a currency ("Simoleons," symbolized by '$'), displayed on the Agent Card. They can earn money through the "Work for money" action.
*   **Markets and Trade**: A central **Marketplace** entity exists in the world. Agents must be near it to trade.
    *   **List Item on Market**: Agents can offer items from their inventory for sale on the marketplace. The price is calculated by the system based on supply.
    *   **Buy from Market**: Agents can view offers from others and purchase items if they have enough currency.
*   **Complex Production Chains (Crafting)**: The simulation now includes **Crafting**. Agents can combine raw materials like wood and iron (a new resource) to create new items (e.g., a sword or a plow). This requires:
    *   **Recipes**: Knowledge of the correct recipe.
    *   **Skills**: A sufficiently high "Crafting" skill.
    *   **Technology**: Some advanced recipes are only available after researching the corresponding technology.

### 4.2. Political Systems and Governance
The society of agents now organizes itself politically.

*   **Government Type**: The world is governed by a government, by default a **Democracy**.
*   **Leaders and Elections**: Elections take place at regular intervals (every 100 steps).
    *   **Candidacy**: Agents with high social status can run for the leader position.
    *   **Voting**: Agents vote for the candidate with whom they have the best relationship.
    *   **Leader**: The election winner becomes the leader, and their name is displayed in the Admin Panel.
*   **Laws and Punishments**: The leader can enact laws.
    *   **Lawbreaking**: If an agent performs an action prohibited by a law (e.g., "Steal"), they are punished.
    *   **Punishments**: The default punishment is a fine, deducted from the agent's account and credited to the leader. Arrests are also possible, sending the agent to jail for a set number of steps.
    *   **Behavior**: Agents with high conscientiousness tend to obey laws.

### 4.3. Technological Development
Cultures can now collectively accumulate knowledge and research technologies.

*   **Research Points**: Scientists can perform the "Research" action to generate research points for their culture.
*   **Technology Tree**: There is a predefined technology tree. When a culture has accumulated enough research points and met the prerequisites, it unlocks a new technology.
*   **Effects**: Technologies can improve the efficiency of actions (e.g., "Agriculture" improves food gathering), unlock new actions ("Metallurgy" unlocks "Mine Iron"), or make new crafting recipes available.
*   **Collective Learning**: Scientists can perform the "Share Knowledge" action when they meet to accelerate their culture's research process.

### 4.4. Understanding Agents (Agent Card Details)
Each agent is a complex entity. The Agent Card provides deep insight into their inner world.

*   **Basic Information**: Name, description, current position (X, Y), health, age, currency, and social status. An "Admin" tag indicates the special administrative agent.
*   **Status & Needs**: Visual bars show Health, Stress, Hunger, Thirst, and Fatigue levels. These needs must be managed by the agent to stay healthy and alive.
*   **Personality**: A chart displays the agent's "Big Five" personality traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) on a scale of 0-1. These traits heavily influence their decision-making.
*   **Skills**: A chart showing the agent's proficiency in various skills (e.g., Healing, Woodcutting, Rhetoric, Combat, Crafting, Trading). Skills improve as agents perform related actions.
*   **Beliefs**: A chart representing the agent's internal belief network, showing their conviction in various concepts (e.g., 'weather_sunny', 'progress_good').
*   **Emotions**: A chart displaying the agent's current situational emotions (e.g., Happiness, Sadness, Anger, Fear, Trust, Love).
*   **Relationships**: A list of other agents they have interacted with, showing the relationship type (e.g., Friend, Rival, Spouse) and a score (0-100). Relationships dynamically change based on interactions.
*   **Active Goals**: A list of the agent's current objectives (e.g., 'Become Leader', 'Build a House', 'Master a Skill'). Agents will prioritize actions that help them achieve these goals.
*   **Genome & Traits**: A list of genetic markers (e.g., `G-RESISTANT`, `G-AGILE`) that provide passive bonuses or influence specific behaviors and abilities. Hover over a gene to see its description.
*   **Inventory**: A list of items the agent currently possesses (e.g., Food, Wood, Iron Ingots).
*   **Conversation History**: Displays recent dialogue the agent has participated in.

### 4.5. Deep Psychological Profile (Psychoanalysis)
To gain an even deeper understanding of agents, you can request an AI-generated psychological profile.

1.  **Display Profile**: Click the **Brain icon** (🧠) in the top right corner of the Agent Card.
2.  **Analysis**: The AI will then analyze all available data about the agent—from their personality and recent actions to their relationships—and generate a detailed report.
3.  **Report Content**: The report includes insights into:
    *   **Psychodynamics**: Unconscious motives and internal conflicts.
    *   **Personality Profile**: A description of character traits.
    *   **Relationship Dynamics**: Typical behavioral patterns in relationships.
    *   **Potential Stressors**: Indications of fears, traumas, or stress factors.
    *   **Cultural & Spiritual Processing**: How culture and religion influence their inner world.
    *   **Projections or Displacements**: What internal conflicts might be unconsciously projected onto other characters.
    *   **Therapeutic Recommendation**: A suggestion for what could help the agent regain mental balance.

#### Automatic Integration of Analysis
The analysis is more than just a passive report. The results are **immediately and automatically** used to adapt the agent's behavior and goals. The analysis becomes a driving force for the agent's further development:

1.  **Dynamic Goal Generation**: The AI reads the "Therapeutic Recommendation" and converts it into a concrete, new goal for the agent. For example, if the recommendation is that an agent should be a mentor, that agent automatically receives the new goal "Mentor a young agent" and will proactively try to pursue this goal.
2.  **Unconscious Influences**: The analysis report also identifies latent psychological states (e.g., "suppressed melancholy," "hidden aggression"). These are stored as "unconscious modifiers" in the agent's state and subtly influence their action choices. An agent with "suppressed melancholy" might, for example, avoid social interactions, even if it contradicts their current goal.

This tool makes psychoanalysis an active mechanism that allows agents to analyze themselves and evolve based on this analysis.

### 4.6. Genetics and Reproduction

#### 4.6.1. Agent Genome
Each AI agent in RealitySim AI has a "Genome," represented as a list of genetic markers (string[]). These genes are not just passive descriptions but provide agents with "passive bonuses" or influence specific behaviors and abilities within the simulation.

Available genes include:
*   **G-RESISTANT**: Reduces health loss from sickness (halves it from 5 HP to 2 HP per step) and increases the chance of healing when resting by 15%.
*   **G-AGILE**: Allows the agent to move faster (step size 2 instead of 1).
*   **G-SOCIAL**: Increases the probability of the agent initiating a conversation (40% instead of 10%).
*   **G-LONGEVITY**: Halves health loss due to old age after 80 years.
*   **G-FASTHEAL**: Enables faster health recovery when resting (10 HP instead of 5 HP).
*   **G-INTELLIGENT**: (Exact impact not detailed in sources, but listed as a gene that can boost "intelligence"). Increases skill gain and research points.
*   **G-FERTILE**: Increases the agent's reproduction chances by a factor of 1.5.

You can specify a comma-separated list of these genes when manually creating new agents or choose to generate random genes.

#### 4.6.2. Gene Inheritance in Reproduction
When agents in RealitySim AI reproduce and have a child, the newborn child inherits genes from both parents. This process involves a combination and a small mutation rate to ensure genetic diversity.

The inheritance process works as follows:
1.  **Combination of Unique Genes**: First, all unique genes from both parents are collected. Duplicates are removed, resulting in a combined list of all genes present in the parents.
2.  **Inheritance of Half**: The child then inherits approximately half of these combined, unique genes. The selection is random.
3.  **Mutation**: Subsequently, a small mutation rate of 5% (`MUTATION_RATE = 0.05`) is applied to each inherited gene. If a gene mutates, it is replaced by a randomly selected gene from the entire list of available genes (`GENOME_OPTIONS`).
4.  **Uniqueness After Mutation**: After mutation, it is ensured that the child's genome contains no duplicate genes.

The newborn child starts at age 0 in the 'Worker' role and inherits the religion of the first parent. The genes it has inherited are active from the beginning and influence its development and behavior throughout the simulation.

#### 4.6.3. Reproduction as a Mechanism for Gene Transfer
The ability of agents to have children is the central mechanism for genetic inheritance. Agents can perform the "Reproduce" action if certain conditions are met:
*   They must be within reproductive age (typically between 20 and 50 years).
*   They need a "Partner" or "Spouse" within range.
*   They must not have exceeded the maximum number of offspring per agent (MAX_OFFSPRING = 2).

This comprehensive modeling of genes and their inheritance contributes to the complexity and emergent behavior of agents in RealitySim AI by enabling long-term, intergenerational influences on the population.

You can view an agent's specific genome and associated abilities directly on their **Agent Card**. Under the heading **"Genome & Traits,"** you will find a list of all genes. Hovering over a gene will display a precise description of its effects in the simulation.

## 5. Admin Control Center

When the special 'Admin' agent is selected from the Agents list, the Admin Panel appears in the right sidebar, offering advanced control and manipulation capabilities over the simulation.

*   **Political Management**:
    *   **Current Leader**: Displays the name of the current leader.
    *   **Start Election**: Manually initiate an election for a new leader.
    *   **Laws**: View existing laws. You can repeal (delete) a law by clicking the trashcan icon next to it.
    *   **Add Law**: Create a new law by providing a name and the exact name of the "Violating Action" it prohibits (e.g., "Steal"). Click "Add Law" to enact it.
*   **Technology Management**:
    *   View each culture's current "Research Points" and "Known Technologies."
    *   **Unlock Tech**: Manually unlock a specific technology for a culture. (This functionality is typically handled by agents but can be overridden here).
*   **Agent Management**:
    *   For each agent (excluding the Admin agent), you can:
        *   **Currency**: Adjust their current currency amount.
        *   **Health**: Set their health level (0-100).
        *   **Sickness**: Inflict a sickness (e.g., "flu") or cure an existing one.
        *   **Position**: Manually set their X and Y coordinates on the map.
        *   **Resurrect**: Bring a deceased agent back to life.
*   **World Rule Editor (Actions)**:
    *   **Create New Action**: Define custom actions with a name, description, and optional belief key. These actions will then be available for agents to perform.
    *   **Existing Actions**: View all actions in the simulation. You can delete custom actions using the trashcan icon.

## 6. Troubleshooting / FAQ

This section addresses common issues and questions you might encounter.

*   **"Processing step(s)..." indicator is stuck or simulation is slow.**
    *   **Check LM Studio/AI Provider:** Ensure your LM Studio server is running, a model is loaded, and the CORS setting is enabled. Verify your API endpoint and model name in the RealitySim AI Settings. If using Gemini, ensure your API key is correctly set as an environment variable.
    *   **AI Model Performance:** Some AI models are more resource-intensive than others. If you're using a large model, try a smaller, faster one in LM Studio or switch to a 'flash' version of Gemini if available.
    *   **System Resources:** Close other demanding applications. Ensure your computer has enough RAM and CPU power for both LM Studio/AI model and RealitySim AI.
    *   **Number of Agents/Entities:** A very large number of agents or entities can slow down the simulation. Consider starting with fewer.

*   **"Failed to connect to LM Studio. This is usually a Cross-Origin Resource Sharing (CORS) issue."**
    *   This error message (or similar) indicates that your browser is preventing the application from communicating with your local LM Studio server. **The most common fix is to enable CORS in LM Studio.** Open LM Studio, go to the "Local Server" tab, and ensure the "CORS" option is checked/enabled. Also, double-check that the "LM Studio API Endpoint" in RealitySim AI's settings exactly matches the base URL shown in LM Studio.

*   **"AI could not find a suitable action. No action taken."**
    *   This means the AI model, based on the agent's state and available actions, could not determine a logical action from your prompt. Try rephrasing your prompt to be clearer or more aligned with the agent's current situation and available actions. Ensure the AI toggle is enabled if you expect AI interpretation.

*   **Agents are not doing what I expect.**
    *   **Check Agent Card:** Review the selected agent's "Personality," "Beliefs," "Emotions," and "Active Goals" on their Agent Card. Agents act based on these internal states. For example, a highly conscientious agent is unlikely to "Steal" if it's illegal.
    *   **Needs:** Agents prioritize survival. If hunger, thirst, or fatigue are high, they will likely try to address those needs first.
    *   **Proximity:** Many actions (like "Talk," "Gather Food," "Trade") require agents to be near other agents or specific entities. Check the agent's position on the World Map relative to potential targets.
    *   **Skills/Technology:** Some actions require specific skills or unlocked technologies. Check the agent's skills and their culture's known technologies.

*   **How do I make agents interact more socially?**
    *   Agents with high "Extraversion" and "Social" genes are more likely to initiate conversations. Ensure agents are in close proximity to each other. You can also manually prompt agents to "Talk" to others.

*   **Why are my agents dying?**
    *   Agents have basic needs (Hunger, Thirst, Fatigue) and Health. If these needs are neglected (e.g., hunger/thirst reach 100), their health will decline, eventually leading to death. Sickness and old age also reduce health. Ensure there are sufficient resources (food, water) and opportunities to rest in the world.

*   **Can I create custom rules or behaviors?**
    *   Yes, you can create new "Actions" via the "Create New" panel. While the AI will still interpret prompts based on its training, adding custom actions expands the range of what agents *can* do. For more direct control, use the Admin Panel to set agent states or enact laws.


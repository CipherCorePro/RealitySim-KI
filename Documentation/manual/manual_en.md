# Ver. 20 RealitySim AI User Manual

_Welcome to **RealitySim AI**, an interactive web-based simulation environment where AI agents with unique beliefs, memories, and psychological profiles interact within a dynamic world. This application allows you to observe emergent cognitive and social behavior, control agents with natural language, run simulation steps, and visualize the complex dynamics of the system.

RealitySim AI solves the problem of understanding complex system behaviors by providing a sandbox for emergent AI. It's not a game to be won, but a tool for observation and experimentation. You can witness the formation of cultures, the evolution of social structures, and how individual traumas and goals shape a community's destiny. Dive deep into the minds of your agents, influence their actions, or simply watch their world unfold._

## 1. Getting Started

RealitySim AI is a browser-based application, meaning there's no complex installation process. You simply open the application in your web browser.

### 1.1. Running the Application
To run the application locally:
1.  **Prerequisites:** Ensure you have Node.js installed on your system.
2.  **Install Dependencies:** Open your terminal or command prompt, navigate to the project's root directory, and run `npm install`.
3.  **Set up API Key:** The AI agents' intelligence is powered by an external AI provider. For Google Gemini, you **must** set your Gemini API key as an environment variable named `API_KEY` or `GEMINI_API_KEY` in a `.env.local` file in the project's root directory.
    *   Example `.env.local` content:
        ```
        API_KEY=YOUR_GEMINI_API_KEY_HERE
        ```
4.  **Launch the Application:** Run `npm run dev` in your terminal. This will start a local development server, and the application will open in your default web browser.

### 1.2. Configuring AI Providers
The core intelligence of the agents is driven by an AI model. You can configure this via the **Settings Modal** (accessible by clicking the `⚙️ Settings` icon in the top right corner).

*   **Google Gemini (Recommended):**
    *   **Functionality:** Offers the most advanced features, including the creation of vector embeddings for long-term memory.
    *   **Configuration:** Requires a Google AI API key. This key is read from your environment variables (as set in `1.1. Running the Application`). You select the desired Gemini model from a dropdown list (e.g., `gemini-2.5-flash`).

*   **LM Studio:**
    *   **Functionality:** An alternative for users who prefer to run models locally on their machine.
    *   **Configuration:**
        1.  **Start LM Studio Server:** Launch your LM Studio application and start a local server within it.
        2.  **Enter Server URL:** Input the displayed server URL (e.g., `http://localhost:1234`) into the `LM Studio API Endpoint` field in RealitySim AI's settings.
        3.  **Specify Model Name:** Enter the API identifier of the loaded **Chat Model** (e.g., `google/gemma-2b-it`).
        4.  **Specify Embedding Model (Optional):** For the long-term memory (Vector Database) to function locally, you need to load a compatible embedding model in LM Studio and configure it for the embedding endpoint (e.g., `text-embedding-granite-embedding-278m-multilingual`). If this field is left empty, the chat model will be attempted for embeddings.
        5.  **Enable CORS:** **Crucially**, enable the **CORS** option in LM Studio's server settings. Without this, your browser will block the connection to the local server.

After making changes, click the `Save` button to apply them.

## 2. The User Interface (UI) at a Glance

The RealitySim AI interface is designed to provide a comprehensive overview and detailed control over your simulation. It is divided into several key areas:

*   **Header Bar (Top):** Contains the application title, a language switcher (`EN`/`DE`), and global control buttons.
    *   `⚙️ Settings`: Opens the AI provider configuration modal.
    *   `📊 Advanced Analytics`: Opens a dashboard for in-depth analysis of social, economic, cultural, and technological trends.
    *   `▶️ Step`: Advances the simulation by one step.
    *   `⏩ Run`: Advances the simulation by a specified number of steps.
    *   `🌐 Generate World`: Opens a modal to create a completely new world with AI-generated agents and entities.
    *   `➕ Add with AI`: Opens a modal to add new AI-generated agents or entities to the *current* world.
    *   `🔄 Reset`: Resets the simulation to its initial state.
    *   `👁️ View Toggles`: A set of four buttons (`Panel Left`, `Agent Card`, `World Map`, `Panel Right`) that allow you to show or hide the main content panels, customizing your view.

*   **Left Panel:** (Toggleable via `Panel Left` button)
    *   **Agents List:** Displays a list of all agents in the simulation. Click an agent's name to select them and view their detailed information in the Agent Card. You can also delete agents using the `🗑️` icon.
    *   **Entities List:** Shows a list of all entities (objects, resources, buildings) in the world. You can delete entities using the `🗑️` icon.

*   **Middle Panel:** (Toggleable via `Agent Card` and `World Map` buttons)
    *   **Agent Card:** (Visible when an agent is selected) Provides a detailed psychological and statistical profile of the currently selected agent. This is where you interact directly with agents.
    *   **World Map:** Visualizes the 2D grid world, showing agents, entities, and their relationships. Agent colors indicate their culture, and lines represent relationships.

*   **Right Panel:** (Toggleable via `Panel Right` button)
    *   **Environment Panel:** Displays global environment properties like time, weather, and election status.
    *   **Available Actions:** Lists all actions agents can perform in the simulation. You can delete custom actions here.
    *   **Create New Panel:** Allows you to manually create new agents, entities, or custom actions.
    *   **Event Log:** A chronological feed of all significant events happening in the simulation.
    *   **Save & Load State Panel:** Provides options to save and load the entire simulation state, or export specific data like conversations and statistics.

## 3. Core Workflows

This section details the primary ways you will interact with and manage the RealitySim AI simulation.

### 3.1. Running the Simulation

To advance the simulation and observe agent behavior:
1.  **Step by Step:** Click the `▶️ Step` button in the top header. The simulation will advance by one time unit, and all agents will perform an action based on their internal state and AI logic. Events will appear in the Event Log.
2.  **Run Multiple Steps:** To run the simulation continuously for a set number of steps, enter a number into the input field next to the `⏩ Run` button (default is 10 steps), then click `⏩ Run`. The simulation will process these steps automatically.

### 3.2. Resetting the Simulation

To start over with the initial world state:
1.  Click the `🔄 Reset` button in the top header.
2.  Confirm the reset action when prompted. This will clear all current agents, entities, and logs, and load the default world.

### 3.3. Generating a New World

To create a completely new simulation environment with AI-generated content:
1.  Click the `🌐 Generate World` button in the top header. This opens the "Generate New World" modal.
2.  **Specify Agent Count:** Enter the desired number of agents to populate your new world.
3.  **Specify Entity Counts:** Enter the desired number for each resource type (Food, Water, Wood, Iron) and general Buildings/Objects. The system will automatically include a Marketplace and a Jail within the 'Buildings' count if the number is sufficient.
4.  Click the `Generate` button. The AI will create a new world with unique agents and entities, which will then replace your current simulation state.

### 3.4. Adding Content with AI

To add new AI-generated agents or entities to your *existing* world:
1.  Click the `➕ Add with AI` button in the top header. This opens the "Generate Content with AI" modal.
2.  **Add New Agents:** In the "Add New Agents" section, specify the `Number of new agents` you wish to add.
3.  Click `Generate Agents`. The AI will create new agents and add them to your current world.
4.  **Add New Entities:** In the "Add New Entities" section, specify the desired quantity for each resource type (Food, Water, Wood, Iron) and general Buildings/Objects.
5.  Click `Generate Entities`. The AI will create new entities and add them to your current world.

### 3.5. Interacting with Agents

To influence or query an individual agent:
1.  **Select an Agent:** In the Left Panel, click on the name of an agent from the `Agents` list. Their detailed `Agent Card` will appear in the Middle Panel.
2.  **Enter a Prompt:** At the bottom of the Agent Card, type your command or question into the input field.
3.  **Choose Interaction Mode:**
    *   **Use AI (Recommended):** Ensure the `Use AI` checkbox is checked. The AI will interpret your natural language prompt (e.g., "Go get some food," "Talk to Bob about the weather") and select the most logical action for the agent, considering their personality, needs, and memories.
    *   **Direct Command:** Uncheck the `Use AI` checkbox. You must enter the exact name of an available action (e.g., "Eat Food", "Move North"). The agent will attempt to perform this action directly.
4.  **Send Prompt:** Click the `Create` (or `Send`) button next to the input field. The agent will process your prompt, and the result will be logged in the Event Log.

## 4. Detailed Feature Explanations

RealitySim AI offers a rich set of features for observation and control.

### 4.1. Agent Card: Understanding an Agent's Inner World
When you select an agent from the Left Panel, their `Agent Card` appears in the Middle Panel, providing a deep dive into their complex state:

*   **Status & Needs:** Displays core information like age, life stage, culture, religion, role, health, hunger, thirst, fatigue, stress, social status, currency, and any sickness. It also indicates if the agent is `IMPRISONED` and until which step.
*   **Genome & Traits:** Shows genetic traits (e.g., `Resistant`, `Agile`) that influence their abilities and survival.
*   **Personality (Big Five):** Visualizes their `Openness`, `Conscientiousness`, `Extraversion`, `Agreeableness`, and `Neuroticism` scores on a bar chart.
*   **Psyche & Drives:** Visualizes deeper psychological drives like `Empathy`, `Vengefulness`, `Fear of Death`, `Boredom`, `Inspiration`, and `Jealousy` on a bar chart.
*   **Skills:** Shows their proficiency in various skills (e.g., `Healing`, `Woodcutting`, `Rhetoric`) on a bar chart.
*   **Inventory:** Lists items the agent possesses, along with quantities.
*   **Relationships:** Details their connections with other agents (e.g., `Friend`, `Rival`, `Spouse`) and their relationship scores.
*   **Active Goals:** Displays the agent's current long-term objectives (e.g., `Become Leader`, `Achieve Wealth`), along with their progress.
*   **Long-Term Memory:** Shows a snippet of the agent's most recent long-term memories, which are stored in a semantic Vector Database.
*   **Jail Journal:** If an agent is imprisoned, this section displays their AI-generated journal entries, offering a unique insight into their thoughts and feelings while incarcerated.

### 4.2. World Map: Visualizing the Environment
The `World Map` in the Middle Panel provides a visual representation of your simulation:

*   **Grid:** The world is a 2D grid. Agents and entities occupy specific coordinates.
*   **Agents:** Represented by `👤` (or `💀` if deceased). Admin agents are highlighted in red. A circle around an agent indicates their culture.
*   **Entities:** Represented by icons (e.g., `🏠` for houses, `🍎` for food sources, `⛓️` for jail). Entities owned by an agent are outlined in their culture's color.
*   **Relationships:** Lines connect agents who have significant relationships. The color of the line indicates the relationship type (e.g., pink for spouse, green for friend, red for rival), and its opacity reflects the relationship strength.

### 4.3. Event Log: Tracking Simulation Events
The `Event Log` in the Right Panel provides a chronological record of all significant events in the simulation, including agent actions, status changes, and AI responses. This is crucial for understanding what is happening in your world.

### 4.4. Create New Panel: Manual Content Creation
In the Right Panel, the `Create New` section allows you to manually add elements to your simulation:

*   **Create Agent:** Define a new agent by providing a name, description, beliefs (in JSON format), genome (comma-separated), role, and personality traits using sliders. You can also use the `✨` (Sparkles) or `🧬` (DNA) buttons to generate random names, descriptions, beliefs, or genomes.
*   **Create Entity:** Add new objects or landmarks to the world by providing a name and description.
*   **Create Action:** Design custom actions with specific mechanical effects. You can define `Costs` (items consumed), `Stat Changes` (deltas for health, hunger, stress, etc.), and `Skill Gain` (which skill increases by how much). This is a powerful tool for experimenting with new game mechanics.

### 4.5. Save & Load State
Found in the Right Panel, the `Save & Load State` section allows you to manage your simulation data:

*   **Save Full State:** Click `Save Full State` to export the entire current simulation state (agents, entities, environment, logs, etc.) as a JSON file to your computer. This file can be reloaded later.
*   **Load Full State:** Click `Load Full State` to import a previously saved JSON file, restoring the simulation to that exact state.
*   **Export Conversations:** Creates a Markdown (`.md`) file containing all conversation histories of your agents.
*   **Export Statistics:** Generates a Markdown (`.md`) report summarizing key statistics like marriages, births, imprisonments, and fights.
*   **Advanced Export Options:** Under the `Advanced Export Options` dropdown, you can choose to export only specific parts of the simulation (Environment, Agents, or Entities) as separate JSON files.

## 5. Admin Control Panel (God Mode)

The `Admin Control Panel` provides powerful, direct manipulation capabilities over the simulation. This panel becomes visible in the Right Panel only when the special `Admin` agent is selected from the Agents list.

*   **Political Management:**
    *   **Current Leader:** View the current leader.
    *   **Set Leader:** Manually appoint any agent as the new leader using the dropdown and `Set Leader` button.
    *   **Start Election:** Initiate a new election cycle.
    *   **Laws:** View existing laws. You can repeal a law by clicking the `🗑️` icon next to it.
    *   **Add Law:** Create a new law by providing a `Law Name` and the `Violating Action Name` (the exact action that will be deemed illegal).

*   **Technology Management:**
    *   View the research progress (`Research Points`) of each culture.
    *   See which technologies are `Known Technologies` for each culture.
    *   `Unlock` any technology for a specific culture, even if they haven't met the research cost or prerequisites.

*   **Agent Management:**
    *   For each agent (excluding the Admin agent itself), you can directly modify their core attributes:
        *   **Currency:** Adjust their money.
        *   **Health:** Set their health level (0-100).
        *   **Sickness:** Inflict a sickness (e.g., "flu") or cure them by leaving the field empty and clicking `Set`.
        *   **Position:** Manually set their X and Y coordinates on the map.
        *   **Imprison Duration:** Imprison an agent for a specified number of steps.
        *   **Resurrect:** Bring a deceased agent back to life.

*   **World Rule Editor:** This section is a placeholder for future advanced rule editing capabilities.

## 6. Advanced Analytics Dashboard

The `Advanced Analytics` dashboard (accessible via the `📊` icon in the top header) provides macro-level insights into the simulation, helping you identify emergent patterns that might be missed in the event log. Click anywhere outside the modal or the `X` button to close it.

### 6.1. Social Network
This tab visualizes the social fabric of your simulation as a graph:
*   **Nodes:** Each agent is a node.
*   **Lines:** Lines between agents represent relationships. The color indicates the type (e.g., pink for spouse, green for friend, red for rival), and the opacity correlates with the relationship strength.
*   **Cultural Grouping:** Agents are visually clustered by their culture, allowing you to easily spot social cliques, central figures, or isolated individuals.

### 6.2. Economic Flow
This diagram illustrates the flow of currency between agents and the world:
*   **Flows:** Shows who is paying whom, and for what (e.g., `Agent A -> Agent B` for currency).
*   **Volume:** The thickness of the flow bar indicates the amount of currency transferred.
*   **Time Window:** Use the `Time Window (Steps)` slider to adjust the period over which transactions are analyzed, allowing you to examine short-term trading patterns or long-term economic relationships.

### 6.3. Cultural Spread
This view presents a heatmap of the world map, showing the geographical distribution of cultures:
*   **Color-Coding:** Each culture is assigned a unique color.
*   **Density:** The intensity of a color in a grid area indicates the concentration of members of that specific culture. This helps visualize the formation of cultural enclaves or the mixing of cultures.

### 6.4. Technology
This tab visualizes the technological progress of each culture:
*   **Research Progress Bars:** For each technology in the tech tree, a progress bar shows how close each culture is to unlocking it, based on their `Research Points`.
*   **Dependencies:** Technologies with unfulfilled prerequisites are visually dimmed, illustrating the cultural development paths.

## 7. Troubleshooting / FAQ

### 7.1. AI Errors (e.g., "Failed to fetch from LM Studio", "Google Gemini API key not found")
*   **LM Studio CORS Issue:** If you see an error related to "Failed to fetch" or "CORS", it's likely that Cross-Origin Resource Sharing (CORS) is not enabled in your LM Studio server settings. Open LM Studio, go to the "Local Server" tab, and ensure the "CORS" checkbox is enabled.
*   **LM Studio URL/Model Mismatch:** Double-check that the `LM Studio API Endpoint` and `Model Name` in RealitySim AI's settings exactly match what's running in your LM Studio application.
*   **Google Gemini API Key:** Ensure your `API_KEY` or `GEMINI_API_KEY` environment variable is correctly set in your `.env.local` file and that you've restarted the application after setting it.
*   **General AI Errors:** If AI generation fails, check your internet connection (for Gemini), ensure the selected model is loaded/available, and review the console for more specific error messages.

### 7.2. Agents Not Moving or Performing Actions
*   **Imprisoned Agents:** Check the Agent Card. If an agent is `IMPRISONED`, they can only perform the 'Rest' action until their sentence is over.
*   **No Suitable Actions:** The AI might not find a suitable action based on the agent's current state, needs, and personality. Try giving a direct command (uncheck "Use AI" and type an exact action name like "Eat Food").
*   **AI Configuration:** Ensure your AI provider is correctly configured in the Settings modal.
*   **Needs are too low/high:** Agents prioritize survival. If their hunger, thirst, or fatigue are very low, they might not perform other actions.

### 7.3. Simulation Appears Frozen or Slow
*   **Processing Indicator:** If the `Processing step(s)...` indicator is visible, the AI is actively calculating. This can take a few seconds, especially for complex prompts or world generation. Wait for it to complete.
*   **Too Many Agents/Entities:** While the simulation is designed to handle many elements, a very large number of agents or entities might slow down performance, especially on less powerful machines.
*   **Browser Performance:** Ensure your browser is up to date and close other demanding tabs or applications.

### 7.4. Data Not Saving/Loading Correctly
*   **File Format:** Ensure that when loading, you are selecting a valid JSON file that was previously exported from RealitySim AI. Corrupted or incorrectly formatted JSON files will cause errors.
*   **Browser Permissions:** Ensure your browser has permission to download and upload files.

### 7.5. Agent Behavior is Unexpected
*   **Review Agent Card:** Check the agent's `Personality`, `Psyche`, `Beliefs`, and `Goals` on their Agent Card. These attributes heavily influence their decisions.
*   **Event Log:** The Event Log provides insights into why an agent chose a particular action. Look for messages indicating their thought process or reasons for failure.
*   **Psychoanalysis:** Generate a `Psychological Profile` for the agent to get a deep AI-driven analysis of their motivations and conflicts.


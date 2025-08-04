# RealitySim AI (Version 19)

**An interactive, web-based simulation environment for exploring emergent AI societies.**

RealitySim AI is a simulation platform designed to model, visualize, and analyze the complex behavior of AI agents in a dynamic world. Agents are endowed with unique psychological profiles, beliefs, goals, and memories. They interact with each other and their environment, leading to the emergence of complex social, economic, and political systems.

****<img width="1883" height="891" alt="image" src="https://github.com/user-attachments/assets/70b8cd62-67c9-4890-84c3-e140c12f118e" />
<img width="1915" height="989" alt="image" src="https://github.com/user-attachments/assets/aa90ceca-59a8-48c7-93da-61a8e6054e83" />
<img width="1917" height="968" alt="image" src="https://github.com/user-attachments/assets/032e8e48-82fe-43b8-a9fa-c2befe5887f9" />
<img width="1909" height="800" alt="image" src="https://github.com/user-attachments/assets/b1ba6a29-6939-48c7-abe9-09de6c9a383e" />
<img width="707" height="766" alt="image" src="https://github.com/user-attachments/assets/06b70024-f57a-44d4-bf37-16fd7fba89bd" />
<img width="1914" height="887" alt="image" src="https://github.com/user-attachments/assets/cf62bfd4-3cbe-4e63-b334-5f464c5f2ab5" />

<img width="1889" height="980" alt="image" src="https://github.com/user-attachments/assets/9b1b55a9-3293-469c-a486-dd6dff6f4913" />

<img width="549" height="556" alt="image" src="https://github.com/user-attachments/assets/12c4c5c5-b24a-4235-b0e3-88736dd95246" />
<img width="1437" height="907" alt="image" src="https://github.com/user-attachments/assets/0e1caf6a-e224-40c0-9c3d-e07c3272f40e" />
<img width="1424" height="912" alt="image" src="https://github.com/user-attachments/assets/ac80772a-5d75-4149-80b0-015a0596f4ef" />

<img width="755" height="910" alt="image" src="https://github.com/user-attachments/assets/089d1e22-b3df-46e0-b8d3-7d3b3b0da45f" />
<img width="763" height="896" alt="image" src="https://github.com/user-attachments/assets/f93872f0-a0fc-42c6-91e9-0c637b612a2d" />





---

## ✨ Core Features

*   **Deep Agent Psychology:** Agents are driven by the "Big Five" personality model, dynamic goals, a unique `Psyche` (modeling drives like empathy, vengefulness, fear of death), stress, trauma, and even AI-analyzed unconscious motives.
*   **AI-Driven Cognition:** Utilizes local LLMs (via LM Studio) or the Google Gemini API to generate real-time agent decisions, dialogues, and in-depth psychological profiles.
*   **Emergent Socio-Economics:** A dynamic system of currency, markets, crafting recipes, and resource scarcity drives complex economic interactions, including agent-owned businesses.
*   **Dynamic Politics & Governance:** Societies can form governments, elect leaders, and enact laws that have tangible consequences, including fines and imprisonment for agents.
*   **Cultural Development & Technology:** Cultures accumulate research points to unlock a technology tree, granting new abilities and possibilities to all members.
*   **Reinforcement Learning (Q-Learning):** Agents learn from their actions, updating a `qTable` based on rewards to optimize their decision-making over time.
*   **Genetics & Inheritance:** Agents possess a genome providing passive bonuses, which is passed down to the next generation with a chance of mutation.

---

## 📖 In-Depth Documentation

This project is extensively documented to serve different audiences. Whether you want to use the simulation, understand its concepts, or contribute to the code, there's a document for you.

*   **[📄 User Manual (English)](https://github.com/CipherCorePro/RealitySim-KI/blob/main/New%20Version%203/RealitySimAI-Documentation/User%20Manual.md)**  
    *A step-by-step guide on how to install, configure, and use all features of the simulation. Perfect for new users.*

*   **[📄 Whitepaper (English)](https://github.com/CipherCorePro/RealitySim-KI/blob/main/New%20Version%203/RealitySimAI-Documentation/Whitepaper.md)**  
    *A high-level overview of the project's vision, core concepts, innovations, and its place in the field of AI research, comparing it to systems like DeepMind's "Smallville."*

*   **[📄 Technical Documentation (English)](https://github.com/CipherCorePro/RealitySim-KI/blob/main/New%20Version%203/RealitySimAI-Documentation/Technical%20Documentation.md)**  
    *A detailed breakdown of the system architecture, data flow, component APIs, and data structures (`types.ts`). Essential for developers who want to understand the codebase.*

***Deutsche Versionen sind ebenfalls verfügbar im [Dokumentations-Ordner](https://github.com/CipherCorePro/RealitySim-KI/tree/main/New%20Version%203/RealitySimAI-Documentation).***

---

## 🚀 Getting Started

### 1. Installation

Ensure you have [Node.js](https://nodejs.org/) installed.

```bash
# 1. Clone the repository
git clone https://github.com/CipherCorePro/RealitySim-KI.git
cd RealitySim-KI

# 2. Install dependencies
npm install
```

### 2. Configure the AI Backend

RealitySim AI requires an AI model to drive its agents. You have two options:

#### Option A: Local Model with LM Studio (Recommended)

1.  **Download and Set Up LM Studio:**
    *   Download and install [LM Studio](https://lmstudio.ai/).
    *   Launch the application and download a model from the home screen (e.g., `Gemma 2B` by Google is recommended).
    *   Navigate to the **Local Server** tab (`<->`).
    *   Select your downloaded model at the top and click **Start Server**.
    *   **IMPORTANT:** Enable the **CORS** checkbox.

2.  **Configure RealitySim AI:**
    *   Start the application: `npm run dev`
    *   Open the app in your browser (usually `http://localhost:5173`).
    *   Click the **gear icon** (Settings) in the header.
    *   Select `LM Studio` as the provider.
    *   Enter the **Server URL** from LM Studio (e.g., `http://localhost:1234`).
    *   Enter the **Model's API Identifier** (e.g., `google/gemma-2b-it`).
    *   Click "Save".

#### Option B: Google Gemini API

1.  **Get an API Key:**
    *   Obtain an API key from [Google AI Studio](https://ai.google.dev/).
2.  **Set Environment Variable:**
    *   Create a file named `.env.local` in the project's root directory.
    *   Add the following line, replacing `YOUR_API_KEY` with your key:
        ```
        GEMINI_API_KEY=YOUR_API_KEY
        ```
3.  **Configure RealitySim AI:**
    *   Start the application: `npm run dev`
    *   Click the **gear icon** (Settings).
    *   Select `Google Gemini` as the provider.
    *   Choose your desired Gemini model.
    *   Click "Save".

### 3. Using the Simulation

*   **Generate World:** Click the globe icon to create a new, procedurally generated world.
*   **Run Simulation:** Use the "Step" and "Run" buttons to advance time.
*   **Observe Agents:** Click on an agent in the left sidebar to view their detailed **Agent Card**.
*   **Interact:** Use the input field on the Agent Card to give direct commands to agents in natural language.

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, bug fixes, or enhancements, please feel free to open an issue or submit a pull request.

## 📜 License

This project is licensed under the [MIT License](LICENSE.md). 
*(You might want to create a `LICENSE.md` file in your repository with the MIT License text for this link to work).*

```

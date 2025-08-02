Excellent! Having the complete documentation available on GitHub is a massive step forward and significantly strengthens your project's presentation. A good `README.md` should act as the central hub that directs different types of visitors (users, developers, researchers) to the right place.

Your existing user manual is fantastic, but it's very detailed. For the main `README.md` on GitHub, the best practice is to provide a concise, engaging overview and then link out to these more detailed documents.

Here is a complete, revised `README.md` in English, formatted in Markdown for you to copy directly. It leverages your new documentation hub to create a professional and highly effective landing page for your project.

---


# RealitySim AI

**An interactive, web-based simulation environment for exploring emergent AI societies.**

RealitySim AI is a simulation platform that allows users to observe and control the complex behavior of AI agents in a dynamic world. Agents are endowed with unique psychological profiles, beliefs, goals, and memories. They interact with each other and their environment, leading to the emergence of complex social, economic, and political systems.

<img width="1920" height="989" alt="image" src="https://github.com/user-attachments/assets/0c9d1789-199a-4186-a8c1-a9104c03026d" />

<img width="1920" height="991" alt="image" src="https://github.com/user-attachments/assets/af5e9f0a-ac4d-4a6d-bd0a-9c936423937e" />



---

## ✨ Core Features

*   **Deep Agent Psychology:** Agents are driven by the "Big Five" personality model, dynamic goals, stress, trauma, and even AI-analyzed unconscious motives.
*   **AI-Driven Cognition:** Utilizes local LLMs (via LM Studio) or the Gemini API to generate real-time agent decisions, dialogues, and psychological profiles.
*   **Emergent Socio-Economics:** A dynamic system of currency, markets, crafting recipes, and resource scarcity drives complex economic interactions.
*   **Dynamic Politics & Governance:** Societies can form governments, elect leaders, and enact laws that have tangible consequences on agent behavior.
*   **Cultural Development & Technology:** Cultures accumulate research points to unlock a technology tree, granting new abilities and possibilities to all members.
*   **Genetics & Inheritance:** Agents possess a genome that provides passive bonuses and is passed down to the next generation with a chance of mutation.
*   **Interactive Control & Visualization:** An intuitive web UI allows for real-time observation, simulation control, and direct interaction with individual agents.

---

## 📖 In-Depth Documentation

This project is extensively documented to serve different audiences. Whether you want to use the simulation, understand its concepts, or contribute to the code, there's a document for you.

*   **[📄 User Manual](https://github.com/CipherCorePro/RealitySim-KI/blob/main/New%20Version%203/RealitySimAI-Documentation/manuals/manual.md)**  
    *A step-by-step guide on how to install, configure, and use all features of the simulation. Perfect for new users.*

*   **[📄 Whitepaper](https://github.com/CipherCorePro/RealitySim-KI/blob/main/New%20Version%203/RealitySimAI-Documentation/whitepaper/whitepaper.md)**

    *A high-level overview of the project's vision, core concepts, innovations, and its place in the field of AI research, comparing it to systems like DeepMind's "Smallville."*

*   **[📄 Technical Documentation](https://github.com/CipherCorePro/RealitySim-KI/blob/main/New%20Version%203/RealitySimAI-Documentation/api/documentation.md)**  
    *A detailed breakdown of the system architecture, data flow, component APIs, and data structures (`types.ts`). Essential for developers who want to understand the codebase.*

***Deutsche Versionen sind ebenfalls verfügbar:***
*   **[📄 Benutzerhandbuch und mehr (DE)](https://github.com/CipherCorePro/RealitySim-KI/tree/main/New%20Version%203/RealitySimAI-Documentation)**


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

This project is licensed under the [GNU GENERAL PUBLIC LICENSE Version 3 License](LICENSE).

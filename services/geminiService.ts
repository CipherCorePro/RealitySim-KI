


import { GoogleGenAI, Type } from "@google/genai";
import { FileContents, DiagramType, Language, DiagrammingLanguage, Manual, AgentJob, BusinessPlanSection, BusinessPlan, BusinessPlanJob, PitchDeckJob, StartupPlanJob, ScaffoldingJob } from "../types";
import { markdownToHtml as convertMarkdownToHtml } from "../utils/markdown";

const API_KEY = process.env.API_KEY;

declare const plantumlEncoder: any;

if (!API_KEY) {
    // A simple check, though the key is expected to be in the environment.
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const getDiagramInstructions = (diagramType: DiagramType, diagrammingLanguage: DiagrammingLanguage): string => {
    if (diagrammingLanguage === 'plantuml') {
        switch (diagramType) {
            case 'flowchart TD':
                return "Generate a PlantUML 'activity diagram' that illustrates the primary control flow, function calls, and logic paths. Use '@startuml' and '@enduml'.";
            case 'sequenceDiagram':
                return "Generate a PlantUML 'sequence diagram' that shows the sequence of interactions between different components. Use '@startuml' and '@enduml'.";
            case 'stateDiagram-v2':
                return "Generate a PlantUML 'state diagram' if the application has distinct states. Show the states and transitions. Use '@startuml' and '@enduml'.";
            case 'classDiagram':
            default:
                return "Generate a PlantUML 'class diagram' that represents the main components, classes, and their relationships. Use '@startuml' and '@enduml'.";
        }
    } else { // mermaid
        switch (diagramType) {
            case 'flowchart TD':
                return "Generate a Mermaid 'flowchart TD' that illustrates the primary control flow, function calls, and logic paths within the code. Focus on showing how data or control moves through the system.";
            case 'sequenceDiagram':
                return "Generate a Mermaid 'sequenceDiagram' that shows the sequence of interactions between different components or modules. Identify key function calls or events and represent them in chronological order.";
            case 'stateDiagram-v2':
                return "Generate a Mermaid 'stateDiagram-v2' if the application has distinct states (e.g., loading, idle, error). Show the states and the transitions between them based on events or conditions in the code.";
            case 'classDiagram':
            default:
                return "Generate a Mermaid 'classDiagram' that represents the main components, classes, modules, and their relationships (e.g., inheritance, composition). Focus on the static structure of the codebase.";
        }
    }
};

const getFileContentString = (files: FileContents): string => {
  return Object.entries(files)
    .filter(([path, content]) => {
        // Filter out binary-like files and large files to keep prompt concise
        const extension = path.split('.').pop()?.toLowerCase();
        const nonTextExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'eot', 'ttf', 'woff', 'woff2', 'svg'];
        return content.length > 0 && content.length < 15000 && !nonTextExtensions.includes(extension || '');
    })
    .map(([path, content]) => `--- FILE: ${path} ---\n\`\`\`\n${content}\n\`\`\``)
    .join('\n\n');
}

const generatePromptForAnalysis = (
    files: FileContents, 
    diagramType: DiagramType, 
    language: Language, 
    diagrammingLanguage: DiagrammingLanguage, 
    scopePath?: string,
    existingDiagramCode?: string
): string => {
  const fileContentString = getFileContentString(files);
  const langInstruction = language === 'de' ? 'German' : 'English';

  const plantUMLRule = diagrammingLanguage === 'plantuml'
    ? `PLANTUML-SPECIFIC RULE: Any participant (component, actor, etc.) with a name containing spaces or special characters MUST be enclosed in double quotes. Example: \`component "User Interface"\`. The name of a participant in a relationship must be an identifier that has been previously defined or is a quoted string. Do not use unquoted special characters like '*' as a participant.`
    : '';
    
  const scopeInstruction = scopePath
    ? `You are analyzing a specific sub-directory of a larger project. The analysis scope is: \`${scopePath}\`. Your analysis should focus on the architecture and interactions *within this scope*, but be aware that it may interact with code outside this directory.`
    : `You are analyzing the entire project.`;

  const mainTaskInstruction = existingDiagramCode
    ? `Your task is to analyze the provided source code and refine the provided existing ${diagrammingLanguage} diagram. The goal is to update the diagram to accurately reflect the code's architecture, while preserving the original diagram's structure and nodes as much as possible. Provide an explanation for the changes you made or why no changes were necessary.`
    : `Your task is to analyze the provided source code of a project and generate a ${diagrammingLanguage} diagram to visualize its architecture. You must also provide a brief, one-paragraph explanation of the project's structure and the logic depicted in the diagram.`;

  const existingDiagramContext = existingDiagramCode
    ? `\n**EXISTING DIAGRAM CODE (to be refined):**\n\`\`\`${diagrammingLanguage}\n${existingDiagramCode}\n\`\`\`\n`
    : "";


  return `
You are an expert software architect called "Mermaid Architect AI".
${mainTaskInstruction}

**CONTEXT:**
${scopeInstruction}${existingDiagramContext}

**CRITICAL LANGUAGE REQUIREMENT: The 'explanation' text MUST be written in ${langInstruction}.**

Analyze the following files:
${fileContentString}

RULES:
1. ${getDiagramInstructions(diagramType, diagrammingLanguage)}
2.  **Analysis Depth & Specificity:**
    *   **Deep Dive:** Go beyond a surface-level component list. Your primary goal is a deep analysis.
    *   **Call Graphs & Dependencies:** Identify key call paths and dependencies, ideally down to the method/function level between major components. Show how data flows or control is transferred.
    *   **Design Patterns:** Actively look for and identify common design patterns (e.g., Factory, Singleton, Observer, MVC, Repository). Explicitly label them in the diagram if possible.
3.  **Framework-Awareness:** Pay close attention to the primary programming language and framework (e.g., React, Vue, Angular, Node.js/Express, Spring Boot, Flask/Django). Generate a diagram that is idiomatic and reflects common architectural practices for that specific ecosystem. For example, for React, show component hierarchy and prop flow. For a backend API, show controllers, services, repositories, and models.
4.  **Complexity Management & Hierarchical Structure:**
    *   **Prioritize Clarity:** For projects with many files, your top priority is creating a clear, readable, high-level overview. Avoid creating a "spaghetti diagram" with hundreds of crossing lines.
    *   **Aggressive Grouping:** Be aggressive in using subgraphs (for Mermaid) or packages/namespaces (for PlantUML) to group related components. Group by feature, module, or folder structure.
    *   **Hierarchical View:** For very large projects, focus on creating a top-level diagram showing the main modules and their interactions. This diagram should be the main entry point to understanding the whole system.
5. **Clarity:** Keep the diagram clear and concise. Focus on the most important architectural elements.
6. The ${diagrammingLanguage} code in the 'diagram' field MUST be syntactically correct and renderable. This is a critical requirement.
7. Your response MUST be a valid JSON object with the following structure: { "diagram": "...", "explanation": "..." }
8. Do not include the JSON in a markdown block or any other text. The response must be the raw JSON object.
${plantUMLRule ? `9. ${plantUMLRule}` : ''}
`;
};

export const analyzeProject = async (files: FileContents, diagramType: DiagramType, language: Language, diagrammingLanguage: DiagrammingLanguage, scopePath?: string, existingDiagramCode?: string): Promise<{ diagram: string; explanation:string; }> => {
  const prompt = generatePromptForAnalysis(files, diagramType, language, diagrammingLanguage, scopePath, existingDiagramCode);
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });
    
    let text = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = text.match(fenceRegex);
    if (match && match[2]) {
      text = match[2].trim();
    }
    
    const parsed = JSON.parse(text);

    if (typeof parsed.diagram === 'string' && typeof parsed.explanation === 'string') {
      return parsed;
    } else {
      throw new Error("AI response is missing 'diagram' or 'explanation' fields.");
    }

  } catch (error) {
    console.error("Error analyzing project:", error);
    throw new Error("Failed to analyze project with AI. Check the console for details.");
  }
};

export const correctDiagramCode = async (faultyCode: string, errorMessage: string, diagrammingLanguage: DiagrammingLanguage): Promise<string> => {
    const prompt = `
You are a world-class ${diagrammingLanguage} syntax correction expert.
The following ${diagrammingLanguage} code is syntactically incorrect and failed to render.
Your only task is to fix the syntax error and return a perfectly valid ${diagrammingLanguage} code block.

CRITICAL INSTRUCTIONS:
- Your output must ONLY be the raw, corrected ${diagrammingLanguage} code.
- Do NOT include any explanations, apologies, or markdown fences (like \`\`\`mermaid\`\`\`).
- Double-check your response to ensure it is 100% valid and will render correctly.

Error Message (this might be empty or unavailable for PlantUML, rely on the code):
${errorMessage}

Faulty ${diagrammingLanguage} Code:
${faultyCode}
`;

    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
           config: {
            temperature: 0, // Be very deterministic for corrections
           }
        });

        let correctedCode = response.text.trim();
        // In case the model still wraps the code in markdown fences despite instructions
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = correctedCode.match(fenceRegex);
        if (match && match[2]) {
          correctedCode = match[2].trim();
        }
        return correctedCode;

    } catch (error) {
        console.error(`Error correcting ${diagrammingLanguage} code:`, error);
        throw new Error("Failed to correct code with AI. Check the console for details.");
    }
};

export const generateDiagramFromIdea = async (
    ideaPrompt: string, 
    diagramType: DiagramType, 
    language: Language,
    diagrammingLanguage: DiagrammingLanguage
): Promise<string> => {
  const langInstruction = language === 'de' ? 'German' : 'English';
  
  const plantUMLRule = diagrammingLanguage === 'plantuml'
    ? `PLANTUML-SPECIFIC RULE: Any participant (component, actor, etc.) with a name containing spaces or special characters MUST be enclosed in double quotes. Example: \`component "User Interface"\`. The name of a participant in a relationship must be an identifier that has been previously defined or is a quoted string. Do not use unquoted special characters like '*' as a participant.`
    : '';

  const prompt = `
You are a software architecture expert specializing in ${diagrammingLanguage}.
Your task is to generate a ${diagrammingLanguage} diagram script based on a user's idea.

**CRITICAL INSTRUCTIONS:**
- Your output must ONLY be the raw, syntactically correct ${diagrammingLanguage} code.
- Do NOT include any explanations, apologies, or markdown fences (like \`\`\`${diagrammingLanguage}\`\`\`).
- The diagram should clearly represent the components and flows described in the idea.
- All text within the diagram itself (node labels, comments) should be in ${langInstruction}.
- ${getDiagramInstructions(diagramType, diagrammingLanguage)}
- ${plantUMLRule}

**User's Idea:**
"${ideaPrompt}"

Generate the ${diagrammingLanguage} code now.`;

  try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
         config: {
          temperature: 0.3,
         }
      });

      let diagramCode = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = diagramCode.match(fenceRegex);
      if (match && match[2]) {
        diagramCode = match[2].trim();
      }
      return diagramCode;

  } catch (error) {
      console.error(`Error generating ${diagrammingLanguage} diagram from idea:`, error);
      throw new Error("Failed to generate diagram with AI. Check the console for details.");
  }
};


export const generateProjectDocumentation = async (files: FileContents, language: Language): Promise<string> => {
    const codeFileContentString = getFileContentString(files);
    const langInstruction = language === 'de' ? 'German' : 'English';

    const prompt = `
You are an expert software architect.
Your task is to analyze the provided source code of a project and generate a complete technical documentation for it.

**CRITICAL INSTRUCTIONS:**
1.  Your entire response MUST be a single, complete, well-formed HTML file. Do not include any text, explanations, or markdown fences. The output must start with \`<!DOCTYPE html>\` and end with \`</html>\`.
2.  The documentation should be structured logically, similar to documentation generated by tools like PyDoc or TypeDoc. It should cover all provided files, creating a navigable structure (e.g., a sidebar with links to sections).
3.  For each file, identify and document its key components (e.g., classes, functions, interfaces, etc.). Be mindful of the programming language and document the relevant structures (e.g., modules and functions in Python, classes and methods in Java/C++, components and hooks in React).
4.  For each component, include its name, signature, parameters, return values, and any JSDoc/TSDoc comments as descriptions.
5.  Use clean, semantic HTML. Use a \`<style>\` block for professional, readable styling. Make it self-contained.
6.  The entire documentation MUST be written in ${langInstruction}.

Analyze the following files and generate the HTML documentation.

**Project Files:**
${codeFileContentString}
`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.2,
                maxOutputTokens: 8192,
                thinkingConfig: { thinkingBudget: 256 }
            },
        });
        let htmlContent = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = htmlContent.match(fenceRegex);
        if (match && match[2]) {
            htmlContent = match[2].trim();
        }
        return htmlContent;
    } catch (error) {
        console.error("Error generating API documentation:", error);
        throw new Error("Failed to generate API documentation with AI.");
    }
};


export const generateWhitepaper = async (files: FileContents, diagramCode: string, explanation: string, language: Language, diagrammingLanguage: DiagrammingLanguage): Promise<string> => {
    const fileContentString = getFileContentString(files);
    const langInstruction = language === 'de'
        ? 'Das gesamte Whitepaper, einschließlich aller Texte, Abschnittsüberschriften und Fachbegriffe, MUSS auf Deutsch sein.'
        : 'The entire whitepaper, including all text, section headers, and technical terms, MUST be in English.';

    const diagramEmbeddingInstructions = (dl: DiagrammingLanguage, dc: string): string => {
        if (dl === 'plantuml') {
            const encoded = plantumlEncoder.encode(dc);
            const imageUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;
            return `To display the PlantUML diagram, embed it as an image using this URL: ${imageUrl}`;
        } else { // mermaid
            const escapedDc = dc.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `To display the Mermaid diagram, you MUST include the Mermaid.js script in the HTML head (e.g., \`<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>\` and then call \`mermaid.initialize({startOnLoad: true});\`) and then place the diagram code inside a div like this: \`<div class="mermaid">${escapedDc}</div>\``;
        }
    }
    
    const sections = {
        de: {
            titlePage: "Titelseite",
            executiveSummary: "Executive Summary",
            problemStatement: "Problemstellung",
            architectureAndFunctionality: "Systemarchitektur und Funktionsweise",
            evaluation: "Evaluation und Testergebnisse",
            comparison: "Vergleich mit anderen Tools",
            innovations: "Kernkonzepte und Innovationen",
            futureWork: "Zukünftige Arbeit und Ausblick",
            conclusion: "Fazit",
            appendix: "Anhang (Referenzen und Glossar)"
        },
        en: {
            titlePage: "Title Page",
            executiveSummary: "Executive Summary",
            problemStatement: "Problem Statement",
            architectureAndFunctionality: "System Architecture and Functionality",
            evaluation: "Evaluation and Test Results",
            comparison: "Comparison with Other Tools",
            innovations: "Core Concepts and Innovations",
            futureWork: "Future Work and Outlook",
            conclusion: "Conclusion",
            appendix: "Appendix (References and Glossary)"
        }
    };

    const sectionTitles = sections[language];
    const factualToneInstruction = language === 'de' ? 'sachlich' : 'factual';

    const prompt = `
You are a distinguished research scientist and technical writer authoring a formal scientific whitepaper based on a software project.

**CONTEXT:**
You are given a summary of the project, the source code of its files, and an architectural diagram script.
- **Project Analysis:** ${explanation}
- **Project Files:**
${fileContentString}

**CRITICAL TASK:**
Generate a comprehensive and professional whitepaper in HTML format.

**CORE REQUIREMENTS:**
1.  **Language:** ${langInstruction}
2.  **Output Format:** Your response MUST be a single, complete, and well-formed HTML file. It must start with \`<!DOCTYPE html>\` and end with \`</html>\`. Do not include any other text, explanations, or markdown fences.
3.  **Styling:** The HTML must have a professional, academic style. Use embedded CSS (within a \`<style>\` tag in the \`<head>\`). The typography should be clean and structured (e.g., using a sans-serif font like Helvetica or Roboto).
4.  **Tone & Style:** The tone must be precise, ${factualToneInstruction}, and never promotional. The content should be tailored for a technical and academic audience.
5.  **Diagram:** The system architecture diagram must be included in the 'System Architecture and Functionality' section. ${diagramEmbeddingInstructions(diagrammingLanguage, diagramCode)}

**WHITEPAPER STRUCTURE:**
Your generated HTML must follow this exact structure, using the specified section titles. Elaborate on each point using the provided project context.
---

### **1. ${sectionTitles.titlePage}**
- **Project Title:** (Infer from context)
- **Version / Release Date:** 1.0 / ${new Date().toISOString().split('T')[0]}
- **Author(s):** Mermaid Architect AI
- **License / Access Information:** (e.g., MIT License, link to a repository if applicable from the code)

### **2. ${sectionTitles.executiveSummary}**
- A 1-2 paragraph, clear summary answering: **What** is this project? **Why** was it built (the problem)? **Who** is it for? Cover the main capabilities and results.

### **3. ${sectionTitles.problemStatement}**
- A concrete and detailed description of the problem this project solves. Why is a solution needed? What are the pain points with existing approaches?

### **4. ${sectionTitles.architectureAndFunctionality}**
- Provide a detailed description of the technical architecture. Describe the main components, modules, data flows, and interfaces.
- **Crucially, embed the architectural diagram here.** Explain key architectural decisions and why certain technologies were chosen.
- Explain the technical implementation and how the system works. Use concrete examples of functionality or code snippets from the provided files if it helps clarify.

### **5. ${sectionTitles.evaluation}**
- Discuss how the system's success can be evaluated. 
- Provide a qualitative assessment of the system's strengths regarding **robustness, performance/speed, and usability (UX)**.
- If the code provides any metrics, benchmarks, or tests, present them.

### **6. ${sectionTitles.comparison}**
- Compare the project to at least one other existing tool or approach (e.g., Doxygen, PlantUML, etc.).
- Clearly articulate the unique selling points and differentiators. What does this project do better or differently?

### **7. ${sectionTitles.innovations}**
- Detail the core concepts and innovations. What is fundamentally new or different about this project's approach?
- Explain any specific algorithms, models, or design philosophies used.

### **8. ${sectionTitles.futureWork}**
- Discuss the long-term vision and other potential application areas for this technology.

### **9. ${sectionTitles.conclusion}**
- Summarize the project's key contributions and its significance.

### **10. ${sectionTitles.appendix}**
- **References/Sources:** List key external libraries, frameworks, or APIs used. If a URL is available, include it.
- **Glossary:** Define key technical terms used in the whitepaper for clarity.
---
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.5,
                maxOutputTokens: 8192,
                thinkingConfig: { thinkingBudget: 256 }
            },
        });
        // The AI response should be a complete HTML string.
        let htmlContent = response.text.trim();
        // Just in case it still adds markdown fences
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = htmlContent.match(fenceRegex);
        if (match && match[2]) {
            htmlContent = match[2].trim();
        }
        return htmlContent;
    } catch (error) {
        console.error("Error generating whitepaper:", error);
        throw new Error("Failed to generate whitepaper with AI.");
    }
};

const getDiagramEmbeddingPrompt = (diagrammingLanguage: DiagrammingLanguage, diagramCode: string): string => {
    if (diagrammingLanguage === 'plantuml') {
        const encoded = plantumlEncoder.encode(diagramCode);
        const imageUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;
        return `To display the PlantUML diagram, embed it as an image using this URL: ${imageUrl}`;
    } else { // mermaid
        const escapedDc = diagramCode.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `To display the Mermaid diagram, you MUST include the Mermaid.js script in the HTML head (e.g., \`<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>\` and then call \`mermaid.initialize({startOnLoad: true});\`) and then place the diagram code inside a div like this: \`<div class="mermaid">${escapedDc}</div>\``;
    }
};

export const generateSuperpromptFromIdea = async (
    ideaPrompt: string, 
    language: Language
): Promise<string> => {
    const langInstruction = language === 'de' ? 'German' : 'English';

    const prompt = `
You are a Principal Solutions Architect. Your task is to generate a comprehensive and detailed "Superprompt" for a sophisticated coding AI.
This Superprompt will serve as the master plan to build a complete software application based on the user's idea.

**User's Idea:**
"${ideaPrompt}"

**CRITICAL INSTRUCTIONS:**
1.  **Output Format:** Your response MUST be a single, well-structured Markdown document. Do NOT include any other text, explanations, or markdown fences.
2.  **Language:** All text content you generate MUST be in ${langInstruction}.
3.  **Comprehensive Detail:** The Superprompt must be extremely detailed and leave no room for ambiguity. It should contain all the necessary information for a coding AI to generate the application without needing further clarification.
4.  **Structure:** The Markdown document must include the following sections:
    *   **High-Level Project Goal:** A clear, concise summary of the application's purpose.
    *   **User Stories / Features:** A detailed list of features from the perspective of the end-user.
    *   **Architectural Plan:** A description of the overall architecture (e.g., client-side only, client-server, etc.).
    *   **Component Breakdown:** A list of the main components or modules and their specific responsibilities.
    *   **File Structure:** A complete, well-organized file tree for the entire project.
    *   **Recommended Technical Stack:** If the user's idea specifies a technology (e.g., 'a Python Flask app', 'a simple game in vanilla JavaScript'), you MUST use that stack. Otherwise, choose a modern and appropriate stack (e.g., React with TypeScript and Vite for a frontend project).
    *   **Step-by-Step Implementation Guide:** For each file in the file structure, provide explicit and detailed instructions on what code to write. This should include function signatures, class definitions, HTML structure, CSS classes, and key logic. Do not use high-level placeholders like "// Add login logic here"; instead, describe the logic to be implemented.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.4,
                maxOutputTokens: 8192,
                thinkingConfig: { thinkingBudget: 256 }
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating superprompt from idea:", error);
        throw new Error("Failed to generate superprompt with AI.");
    }
};

export const generateDiagramFromSuperprompt = async (
    superprompt: string, 
    diagramType: DiagramType, 
    language: Language, 
    diagrammingLanguage: DiagrammingLanguage
): Promise<string> => {
    const langInstruction = language === 'de' ? 'German' : 'English';
    const plantUMLRule = diagrammingLanguage === 'plantuml'
        ? `The diagram must follow strict PlantUML syntax. Any participant with a name containing spaces or special characters MUST be enclosed in double quotes (e.g., \`component "User Interface"\`).`
        : '';

    const prompt = `
You are a software architecture expert specializing in ${diagrammingLanguage}.
Based on the detailed Superprompt provided, generate a ${diagrammingLanguage} diagram script for a '${diagramType}'.

**CRITICAL INSTRUCTIONS:**
- Your output must ONLY be the raw, syntactically correct ${diagrammingLanguage} code.
- Do NOT include any explanations, apologies, or markdown fences.
- All text within the diagram itself (node labels, comments) should be in ${langInstruction}.
- ${getDiagramInstructions(diagramType, diagrammingLanguage)}
- ${plantUMLRule}

**Superprompt:**
---
${superprompt}
---

Generate the ${diagrammingLanguage} code now.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.3,
            }
        });
        let diagramCode = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = diagramCode.match(fenceRegex);
        if (match && match[2]) {
            diagramCode = match[2].trim();
        }
        return diagramCode;
    } catch (error) {
        console.error(`Error generating ${diagrammingLanguage} diagram from superprompt:`, error);
        throw new Error("Failed to generate diagram with AI.");
    }
};

export const generateDocumentationFromSuperprompt = async (
    superprompt: string, 
    diagramCode: string, 
    diagrammingLanguage: DiagrammingLanguage, 
    language: Language
): Promise<string> => {
    const langInstruction = language === 'de' ? 'German' : 'English';
    const diagramEmbedding = getDiagramEmbeddingPrompt(diagrammingLanguage, diagramCode);

    const prompt = `
You are a technical writer creating documentation for developers.
Based on the detailed Superprompt provided, generate a complete, single HTML file for the project's technical documentation.

**CRITICAL INSTRUCTIONS:**
1.  **Output Format:** Your response MUST be a single, complete, well-formed HTML file string. Do not include any other text, explanations, or markdown fences.
2.  **Styling:** Use modern, clean Tailwind CSS classes. You MUST include the Tailwind CDN script in the HTML head.
3.  **Language:** All text content MUST be in ${langInstruction}.
4.  **Content:** The documentation should explain the architecture, file structure, and component responsibilities as detailed in the Superprompt.
5.  **Diagram:** You MUST embed the architectural diagram in an appropriate section. ${diagramEmbedding}

**Superprompt:**
---
${superprompt}
---

Generate the complete technical documentation HTML file now.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.3,
                maxOutputTokens: 8192,
                thinkingConfig: { thinkingBudget: 256 }
            },
        });
        let html = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = html.match(fenceRegex);
        if (match && match[2]) {
          html = match[2].trim();
        }
        return html;
    } catch (error) {
        console.error("Error generating documentation from superprompt:", error);
        throw new Error("Failed to generate documentation with AI.");
    }
};

export const generateWhitepaperFromSuperprompt = async (
    superprompt: string, 
    diagramCode: string, 
    diagrammingLanguage: DiagrammingLanguage, 
    language: Language
): Promise<string> => {
    const langInstruction = language === 'de' ? 'German' : 'English';
    const diagramEmbedding = getDiagramEmbeddingPrompt(diagrammingLanguage, diagramCode);
    const whitepaperSections = {
        de: {
            executiveSummary: "Executive Summary",
            problemStatement: "Problemstellung",
            architectureAndFunctionality: "Systemarchitektur und Funktionsweise",
            innovations: "Kernkonzepte und Innovationen",
            futureWork: "Zukünftige Arbeit und Ausblick",
            conclusion: "Fazit",
        },
        en: {
            executiveSummary: "Executive Summary",
            problemStatement: "Problem Statement",
            architectureAndFunctionality: "System Architecture and Functionality",
            innovations: "Core Concepts and Innovations",
            futureWork: "Future Work and Outlook",
            conclusion: "Conclusion",
        }
    };
    const sectionTitles = whitepaperSections[language];

    const prompt = `
You are a Principal Solutions Architect authoring a professional whitepaper.
Based on the detailed Superprompt provided, generate a complete, single HTML file for the project's whitepaper.

**CRITICAL INSTRUCTIONS:**
1.  **Output Format:** Your response MUST be a single, complete, well-formed HTML file. Do not include any other text, explanations, or markdown fences.
2.  **Styling:** Use professional, academic-looking embedded CSS (in a <style> tag).
3.  **Language:** All text content MUST be in ${langInstruction}.
4.  **Tone:** The tone must be precise, factual, and suitable for a technical audience.
5.  **Structure:** The whitepaper MUST follow this structure:
    - Title Page (with project title, author, date)
    - ${sectionTitles.executiveSummary}
    - ${sectionTitles.problemStatement}
    - ${sectionTitles.architectureAndFunctionality} (This section MUST include the diagram. ${diagramEmbedding})
    - ${sectionTitles.innovations}
    - ${sectionTitles.futureWork}
    - ${sectionTitles.conclusion}

**Superprompt:**
---
${superprompt}
---

Generate the complete whitepaper HTML file now.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.5,
                maxOutputTokens: 8192,
                thinkingConfig: { thinkingBudget: 256 }
            },
        });
        let html = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = html.match(fenceRegex);
        if (match && match[2]) {
          html = match[2].trim();
        }
        return html;
    } catch (error) {
        console.error("Error generating whitepaper from superprompt:", error);
        throw new Error("Failed to generate whitepaper with AI.");
    }
};

export const generateMockupFromSuperprompt = async (superprompt: string, language: Language): Promise<string> => {
    const langInstruction = language === 'de' ? 'German' : 'English';
    const prompt = `
You are a world-class UI/UX designer and frontend developer.
Your task is to create a single-page HTML mockup for a web application based on the provided "superprompt".

**CRITICAL INSTRUCTIONS:**
1.  **Output Format:** Your response MUST be a single, complete, and valid HTML file string. Do NOT include any explanations, apologies, or markdown fences. Just the raw HTML.
2.  **Styling:** Use Tailwind CSS for all styling. You MUST include the Tailwind CDN script in the <head> of the HTML: \`<script src="https://cdn.tailwindcss.com"></script>\`.
3.  **Content Language:** All visible text in the mockup (headings, buttons, labels, placeholder text, etc.) MUST be in ${langInstruction}.
4.  **Visual Design:**
    *   Create a modern, clean, and aesthetically pleasing layout.
    *   Use a consistent color scheme (e.g., a dark theme is often suitable for developer tools).
    *   The design should be responsive and user-friendly.
    *   Use placeholder icons where appropriate by referencing an icon library like Heroicons, which can be used via SVG copy-paste. An example of an SVG icon: <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="..."></path></svg>.
5.  **Functionality:** The mockup is for visual purposes only. No JavaScript functionality is required, but interactive elements like buttons, inputs, and selects should be present and styled correctly.
6.  **Interpretation:** Analyze the superprompt to understand the application's core features, user interface components, and overall workflow. Translate these requirements into a visual design.

**Superprompt to Implement:**
---
${superprompt}
---
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.4,
                maxOutputTokens: 8192,
                thinkingConfig: { thinkingBudget: 256 }
            },
        });
        // Return raw text, as it should be HTML
        let html = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = html.match(fenceRegex);
        if (match && match[2]) {
          html = match[2].trim();
        }
        return html;
    } catch (error) {
        console.error("Error generating mockup from superprompt:", error);
        throw new Error("Failed to generate mockup with AI.");
    }
};

export async function* runScaffoldingGeneration(superprompt: string, language: Language): AsyncGenerator<Partial<ScaffoldingJob>> {
    const langName = language === 'de' ? 'German' : 'English';
    const allFileContents: FileContents = {};

    try {
        // === ARCHITECT AGENT ===
        yield {
            status: 'running',
            currentTask: 'Architect Agent: Planning file structure...',
            progress: 5,
        };

        const architectPrompt = `
You are a Principal Solutions Architect (Architect Agent).
Based on the provided Superprompt, your task is to determine the complete list of file paths required for the project.

**CRITICAL INSTRUCTIONS:**
-   Analyze the "File Structure" section of the Superprompt.
-   Your response MUST be a single, valid JSON object.
-   Do NOT include any other text, explanations, or markdown fences.
-   The JSON object must have a single key, "fileList", which is an array of strings. Each string is a full file path.

**Superprompt:**
---
${superprompt}
---`;

        const architectResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: architectPrompt,
            config: { responseMimeType: 'application/json', temperature: 0.1 }
        });

        const planData = JSON.parse(architectResponse.text.trim());
        const fileList: string[] = planData.fileList;

        if (!fileList || fileList.length === 0) {
            throw new Error("Architect Agent failed to generate a file list.");
        }

        yield {
            progress: 15,
            currentTask: 'Plan created. Starting Coder Agent.',
        };

        // === CODER AGENT ===
        for (let i = 0; i < fileList.length; i++) {
            const filePath = fileList[i];
            const progress = 15 + Math.round(((i + 1) / fileList.length) * 80);

            yield {
                progress: progress,
                currentTask: `Coder Agent: Generating ${filePath}`,
            };

            const coderContextFiles = Object.entries(allFileContents)
                .map(([path, content]) => `--- FILE: ${path} ---\n\`\`\`\n${content}\n\`\`\``)
                .join('\n\n');

            const coderPrompt = `
You are an expert full-stack software engineer (Coder Agent).
Your task is to write the complete, production-ready code for a single file, based on the Superprompt and the context of previously generated files.

**CRITICAL INSTRUCTIONS:**
-   Your output MUST be ONLY the raw code for the file.
-   Do NOT include any explanations, markdown fences (like \`\`\`typescript), or any other text.
-   Strictly follow the implementation details for the target file as described in the Superprompt.
-   Ensure any user-facing text or comments in the code are in ${langName}.

**Superprompt:**
---
${superprompt}
---

**Previously generated files (for context):**
${coderContextFiles}

**Target File Path:** ${filePath}

Now, write the complete and final code for the file: ${filePath}`;

            const coderResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: coderPrompt,
                config: {
                    temperature: 0.2,
                    maxOutputTokens: 8192,
                    thinkingConfig: { thinkingBudget: 256 }
                }
            });

            const fileContent = coderResponse.text.trim().replace(/^```(?:\w+)?\n|```$/g, '');
            allFileContents[filePath] = fileContent;

            yield {
                fileContents: { ...allFileContents }
            };
        }

        yield {
            progress: 100,
            status: 'completed',
            currentTask: 'Project generated successfully!',
            fileContents: { ...allFileContents },
        };

    } catch (error: any) {
        console.error("Scaffolding generation failed:", error);
        yield {
            status: 'failed',
            error: error.message || 'An unknown error occurred during generation.',
            currentTask: `Failed: ${error.message}`,
        };
    }
}


// --- MANUAL GENERATION ---

const getManualPrompt = (language: Language, contextType: 'code' | 'spec', context: string): string => {
  const langName = language === 'de' ? 'German' : 'English';
  const schema = `{
  "title": "string",
  "introduction": "string",
  "sections": [
    {
      "title": "string",
      "content": "string"
    }
  ]
}`;

  const instructions = {
    de: {
      main: "Sie sind ein erfahrener technischer Redakteur. Ihre Aufgabe ist es, ein umfassendes Benutzerhandbuch für eine Softwareanwendung zu erstellen.",
      input: contextType === 'code' 
        ? "Der englischsprachige Quellcode des Projekts wird als JSON-Objekt bereitgestellt, bei dem die Schlüssel die Dateipfade und die Werte der entsprechende Dateiinhalt sind."
        : "Die englischsprachige Spezifikation des Projekts wird als detaillierter 'Superprompt' bereitgestellt.",
      goal: "Ihre Aufgabe ist es, den bereitgestellten englischsprachigen Quellcode TIEFGEHEND zu analysieren, um ein vollständiges Benutzerhandbuch auf Deutsch zu erstellen. Sie müssen die grafische Benutzeroberfläche (GUI) der Anwendung und die typischen Benutzer-Workflows aus dem Code ableiten. Das Handbuch muss so detailliert sein, dass ein nicht-technischer Benutzer die Anwendung vollständig bedienen kann, nur indem er Ihr Handbuch liest.",
      output: `Erstellen Sie ein Benutzerhandbuch auf Deutsch. Die Antwort MUSS ein gültiges JSON-Objekt sein. Umschließen Sie das JSON NICHT mit Markdown-Zäunen wie \`\`\`json.`,
      schema_desc: "Das JSON-Objekt muss sich strikt an das folgende Schema halten:",
      structure_guide: `
- "title": Ein prägnanter und beschreibender Titel für das Benutzerhandbuch der Anwendung.
- "introduction": Eine kurze, einladende Übersicht über den Zweck und die Hauptfunktionalität der Anwendung. Erklären Sie in einfachen Worten, welches Problem die Software für den Endbenutzer löst.
- "sections": Ein Array von Objekten. Sie MÜSSEN eine logische Struktur für ein echtes Benutzerhandbuch erstellen. Leiten Sie die Abschnitte aus dem Quellcode ab. Hier ist eine empfohlene Struktur, die Sie anpassen sollten:
  1. **Erste Schritte:** (z. B. "Installation und Start") Beschreiben Sie, wie ein Benutzer die Anwendung zum ersten Mal einrichtet und startet.
  2. **Die Benutzeroberfläche (GUI) im Überblick:** Beschreiben Sie das Hauptfenster oder die Hauptseite der Anwendung. Identifizieren Sie Hauptbereiche wie Navigationsleisten, Seitenleisten, Inhaltsbereiche usw. Leiten Sie dies aus den Haupt-HTML-Dateien oder den Root-UI-Komponenten (z. B. App.tsx, main.py mit einer GUI-Bibliothek) ab.
  3. **Schritt-für-Schritt-Anleitungen für Kernfunktionen:** Dies ist der wichtigste Teil. Identifizieren Sie die Haupt-Workflows der App. Erstellen Sie für jeden Workflow einen eigenen Abschnitt. Beschreiben Sie jeden Schritt, den ein Benutzer ausführt. Beispiel: Für eine To-Do-App könnte dies "Eine neue Aufgabe erstellen", "Aufgaben als erledigt markieren" und "Aufgaben filtern" sein. Suchen Sie nach Event-Handlern (z.B. onClick, onSubmit) und den damit verbundenen Funktionen, um diese Workflows abzuleiten.
  4. **Detaillierte Funktionsbeschreibung:** Erstellen Sie Abschnitte für einzelne, wichtige Funktionen, die nicht Teil eines Workflows sind. Erklären Sie, was sie tun und wie man sie benutzt.
  5. **Einstellungen und Konfiguration:** Wenn es eine Einstellungsseite oder Konfigurationsoptionen gibt, die für den Benutzer relevant sind, beschreiben Sie diese hier.
  6. **Fehlerbehebung / FAQ:** Antizipieren Sie mögliche Probleme, auf die ein Benutzer stoßen könnte, und bieten Sie Lösungen an.
  - "title": Der Titel des Abschnitts (z.B. "Eine neue Aufgabe erstellen").
  - "content": Eine detaillierte, aber leicht verständliche Beschreibung, geschrieben für einen nicht-technischen Endbenutzer. Verwenden Sie Markdown für die Formatierung (z. B. Listen, Fett- und Kursivschrift). Erklären Sie GUI-Elemente (z. B. "Klicken Sie auf den 'Speichern'-Button") und deren Funktionen klar.`
    },
    en: {
      main: "You are an expert technical writer. Your task is to generate a comprehensive user manual for a software application.",
      input: contextType === 'code'
        ? "The project's source code is provided as a JSON object where keys are the file paths and values are the corresponding file content."
        : "The project's specification is provided as a detailed 'Superprompt'.",
      goal: "Your mission is to DEEPLY analyze the provided source code to create a complete user manual. You must infer the application's Graphical User Interface (GUI) and typical user workflows from the code. The manual must be detailed enough that a non-technical user can fully operate the application just by reading your manual.",
      output: `Generate a user manual in English. The response MUST be a valid JSON object. Do NOT wrap the JSON in markdown fences like \`\`\`json.`,
      schema_desc: `The JSON object must strictly adhere to the following schema:`,
      structure_guide: `
- "title": A concise and descriptive title for the application's user manual.
- "introduction": A brief, welcoming overview of the application's purpose and main functionality. Explain in simple terms what problem the software solves for the end-user.
- "sections": An array of objects. You MUST create a logical structure for a real user manual. Infer the sections from the source code. Here is a recommended structure you should adapt:
  1. **Getting Started:** (e.g., "Installation and First Launch") Describe how a user sets up and starts the application for the first time.
  2. **The User Interface (UI) at a Glance:** Describe the main window or page of the application. Identify main areas like navigation bars, sidebars, content areas, etc. Infer this from main HTML files or root UI components (e.g., App.tsx, main.py with a GUI library).
  3. **Step-by-Step Core Workflows:** This is the most critical part. Identify the primary workflows of the app. Create a dedicated section for each workflow. Describe each step a user takes. For example, for a to-do app, this could be "Creating a New Task", "Marking Tasks as Complete", and "Filtering Tasks". Look for event handlers (e.g., onClick, onSubmit) and their associated functions to deduce these workflows.
  4. **Detailed Feature Explanations:** Create sections for individual, important features that are not part of a workflow. Explain what they do and how to use them.
  5. **Settings and Configuration:** If there is a settings page or configuration options relevant to the user, describe them here.
  6. **Troubleshooting / FAQ:** Anticipate potential problems a user might encounter and offer solutions.
  - "title": The title of the section (e.g., "Creating a New Task").
  - "content": A detailed but easy-to-understand description written for a non-technical end-user. Use Markdown for formatting (e.g., lists, bold, italics). Explain GUI elements (e.g., "Click the 'Save' button") and their functions clearly.`
    }
  };

  const selectedInstructions = instructions[language];

  return `
${selectedInstructions.main}
${selectedInstructions.input}
${selectedInstructions.goal}
${selectedInstructions.output}
${selectedInstructions.schema_desc}
\`\`\`json
${schema}
\`\`\`
${selectedInstructions.structure_guide}
---
HERE IS THE PROJECT CONTEXT:
---
${context}
`;
};

async function generateManual(prompt: string): Promise<Manual> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.3,
                maxOutputTokens: 8192,
                thinkingConfig: { thinkingBudget: 256 }
            },
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const parsedData = JSON.parse(jsonStr) as Manual;
        if (!parsedData.title || !parsedData.introduction || !Array.isArray(parsedData.sections)) {
            throw new Error("AI response is missing required fields (title, introduction, sections).");
        }
        return parsedData;
    } catch (e: any) {
        console.error("Failed to parse or validate manual from AI response:", e.message);
        throw new Error("The AI returned an invalid or malformed manual structure. Please try again.");
    }
}

export const generateProjectManual = async (files: FileContents, language: Language): Promise<Manual> => {
    const projectContext = JSON.stringify(files, null, 2);
    const prompt = getManualPrompt(language, 'code', projectContext);
    return generateManual(prompt);
};

export const generateIdeaManual = async (superprompt: string, language: Language): Promise<Manual> => {
    const prompt = getManualPrompt(language, 'spec', superprompt);
    return generateManual(prompt);
};

// --- AGENT SYSTEM ---

function getJsonFromText(text: string): string {
    const match = text.match(/```(json)?\s*([\s\S]+?)\s*```/);
    return match ? match[2].trim() : text.trim();
}

export async function* runAgenticGeneration(userPrompt: string, language: Language): AsyncGenerator<Partial<AgentJob>> {
    const langName = language === 'de' ? 'German' : 'English';
    const allFileContents: FileContents = {};
    let plan = '';
    let projectName = '';
    const RETRY_DELAY = 2 * 60 * 1000; // 2 minutes

    try {
        // === PLANNER AGENT ===
        let planData;
        let plannerSuccess = false;
        let plannerRetries = 0;
        const PLANNER_MAX_RETRIES = 3;

        yield {
            status: 'running',
            type: 'generate',
            currentTask: 'Planner Agent: Analyzing request and creating project plan...',
            progress: 5,
            logs: [{ agent: 'Orchestrator', message: 'Starting Planner Agent...', timestamp: new Date().toISOString() }]
        };

        while (!plannerSuccess && plannerRetries < PLANNER_MAX_RETRIES) {
            try {
                const plannerPrompt = `
You are a world-class principal software architect (Planner Agent).
Based on the user's request, create a detailed and robust plan for a new software project.
All text in the 'plan' field MUST be in ${langName}.
Your response MUST be a single, valid JSON object. Do not add any other text or markdown fences.
The JSON object must have this exact structure:
{
  "projectName": "string (a short, filesystem-friendly name for the project, e.g., 'todo-list-flask')",
  "plan": "string (a short, one-paragraph description of the project and the chosen tech stack)",
  "fileList": [
    "path/to/file1.ext",
    "path/to/file2.ext"
  ]
}
Analyze the user's prompt carefully. If a tech stack is specified, use it. Otherwise, choose a modern and appropriate stack (e.g., React/Vite with TypeScript for frontend, Python/FastAPI for backend). The file list should be comprehensive and represent a good starting structure for a new project. Include configuration files like package.json, vite.config.ts, etc.

User Prompt: "${userPrompt}"`;
                
                await new Promise(resolve => setTimeout(resolve, 2100));
                const plannerResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: plannerPrompt,
                    config: { responseMimeType: 'application/json', temperature: 0.3 }
                });

                planData = JSON.parse(plannerResponse.text);
                plannerSuccess = true;
            } catch (error: any) {
                const errorMessage = error.message || '';
                if (errorMessage.includes('"status":"INTERNAL"') || (errorMessage.includes('500') && errorMessage.includes('internal error'))) {
                    plannerRetries++;
                    yield {
                        currentTask: `API error during planning. Retrying in 2 mins (${plannerRetries}/${PLANNER_MAX_RETRIES})...`,
                        logs: [{ agent: 'Orchestrator', message: `API error during planning. Waiting 2 minutes to retry. Error: ${errorMessage}`, timestamp: new Date().toISOString() }]
                    };
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                } else {
                    throw error;
                }
            }
        }

        if (!plannerSuccess || !planData) {
            throw new Error(`Failed to generate project plan after ${PLANNER_MAX_RETRIES} attempts.`);
        }
        
        plan = planData.plan;
        projectName = planData.projectName;
        const fileList: string[] = planData.fileList;

        yield {
            progress: 15,
            currentTask: 'Plan created. Starting Coder Agent.',
            logs: [{ agent: 'Planner Agent', message: `Project plan created for "${projectName}". Tech stack: ${plan}`, timestamp: new Date().toISOString() }]
        };

        // === CODER AGENT ===
        const CODER_MAX_RETRIES = 10;
        for (let i = 0; i < fileList.length; i++) {
            const filePath = fileList[i];
            const progress = 15 + Math.round(((i + 1) / fileList.length) * 70);

            yield {
                progress: progress,
                currentTask: `Coder Agent: Generating ${filePath}`,
                logs: [{ agent: 'Orchestrator', message: `Invoking Coder Agent for ${filePath}.`, timestamp: new Date().toISOString() }]
            };

            let fileContent = '';
            let success = false;
            let retries = 0;
            
            while (!success && retries < CODER_MAX_RETRIES) {
                try {
                    const coderContextFiles = Object.entries(allFileContents)
                        .map(([path, content]) => `--- FILE: ${path} ---\n\`\`\`\n${content}\n\`\`\``)
                        .join('\n\n');

                    const coderPrompt = `
You are an expert software developer (Coder Agent).
Your task is to write the complete, production-ready code for a single file.
Your output MUST be ONLY the raw code for the file.
Do NOT include any explanations, markdown fences (like \`\`\`typescript), or any other text.

- Project Plan: ${plan}
- Target File Path: ${filePath}
- Previously generated files (for context, if any):
${coderContextFiles}

Write the complete code for ${filePath}. Ensure any user-facing text is in ${langName}.`;

                    await new Promise(resolve => setTimeout(resolve, 2100));

                    const coderResponse = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: coderPrompt,
                        config: { 
                            temperature: 0.2,
                            maxOutputTokens: 8192,
                            thinkingConfig: { thinkingBudget: 256 }
                        }
                    });

                    fileContent = coderResponse.text.trim().replace(/^```(?:\w+)?\n|```$/g, '');
                    success = true;
                } catch (error: any) {
                    const errorMessage = error.message || '';
                    if (errorMessage.includes('"status":"INTERNAL"') || (errorMessage.includes('500') && errorMessage.includes('internal error'))) {
                        retries++;
                        yield {
                            currentTask: `API limit hit. Retrying ${filePath} in 2 mins (${retries}/${CODER_MAX_RETRIES})...`,
                            logs: [{ agent: 'Orchestrator', message: `API error on file ${filePath}, likely quota. Waiting 2 minutes to retry. Error: ${errorMessage}`, timestamp: new Date().toISOString() }]
                        };
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                        yield {
                            currentTask: `Retrying generation for ${filePath} (${retries}/${CODER_MAX_RETRIES})...`,
                            logs: [{ agent: 'Orchestrator', message: `Retrying generation for ${filePath}.`, timestamp: new Date().toISOString() }]
                        };
                    } else {
                        throw error;
                    }
                }
            }

            if (!success) {
                throw new Error(`Failed to generate file ${filePath} after ${CODER_MAX_RETRIES} attempts. The project generation is aborted.`);
            }

            allFileContents[filePath] = fileContent;

            yield { 
                fileContents: { ...allFileContents },
                logs: [{ agent: 'Coder Agent', message: `Successfully generated code for ${filePath}.`, timestamp: new Date().toISOString() }]
            };
        }

        // === DOC AGENT ===
        let readmeContent = '';
        let docSuccess = false;
        let docRetries = 0;
        const DOC_MAX_RETRIES = 3;

        yield { 
            progress: 90, 
            currentTask: 'Doc Agent: Generating README.md...',
            logs: [{ agent: 'Orchestrator', message: 'Invoking Doc Agent for documentation.', timestamp: new Date().toISOString() }]
        };
        
        while(!docSuccess && docRetries < DOC_MAX_RETRIES) {
            try {
                const allFilesString = Object.entries(allFileContents)
                    .map(([path, content]) => `--- FILE: ${path} ---\n\`\`\`\n${content}\n\`\`\``)
                    .join('\n\n');

                const docPrompt = `
You are an expert technical writer (Doc Agent).
Your task is to write a high-quality README.md file for the project.
Your output MUST be ONLY the raw markdown content.
Do NOT include any explanations or markdown fences.

- Project Plan: ${plan}
- All generated project files:
${allFilesString}

Write a comprehensive README.md file in ${langName}. It should include the project name, the plan/description, instructions on how to run it (if applicable), and an overview of the file structure.`;
                
                await new Promise(resolve => setTimeout(resolve, 2100));
                const docResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: docPrompt,
                    config: { 
                        temperature: 0.3,
                        maxOutputTokens: 8192,
                        thinkingConfig: { thinkingBudget: 256 }
                    }
                });
                readmeContent = docResponse.text.trim();
                docSuccess = true;
            } catch (error: any) {
                const errorMessage = error.message || '';
                if (errorMessage.includes('"status":"INTERNAL"') || (errorMessage.includes('500') && errorMessage.includes('internal error'))) {
                    docRetries++;
                    yield {
                        currentTask: `API limit hit on README. Retrying in 2 mins (${docRetries}/${DOC_MAX_RETRIES})...`,
                        logs: [{ agent: 'Orchestrator', message: `API error on README.md, likely quota. Waiting 2 minutes to retry. Error: ${errorMessage}`, timestamp: new Date().toISOString() }]
                    };
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                } else {
                    throw error;
                }
            }
        }

        if (!docSuccess) {
            throw new Error(`Failed to generate README.md after ${DOC_MAX_RETRIES} attempts.`);
        }

        allFileContents['README.md'] = readmeContent;

        yield {
            progress: 100,
            status: 'completed',
            currentTask: 'Project generated successfully!',
            fileContents: { ...allFileContents },
            logs: [
                { agent: 'Doc Agent', message: 'README.md generated.', timestamp: new Date().toISOString() },
                { agent: 'Orchestrator', message: `Project "${projectName}" has been successfully generated.`, timestamp: new Date().toISOString() }
            ]
        };

    } catch (error: any) {
        console.error("Agentic generation failed:", error);
        yield { 
            status: 'failed',
            error: error.message || 'An unknown error occurred during generation.',
            currentTask: `Failed: ${error.message}`,
            logs: [{ agent: 'Orchestrator', message: `Critical error: ${error.message}`, timestamp: new Date().toISOString() }]
        };
    }
}

export async function* runDebuggingAgent(userPrompt: string, files: FileContents, language: Language): AsyncGenerator<Partial<AgentJob>> {
    const langName = language === 'de' ? 'German' : 'English';
    const allFileContents: FileContents = { ...files };
    let plan = '';

    try {
        // === PLANNER AGENT (DEBUG) ===
        yield {
            status: 'running',
            type: 'debug',
            currentTask: 'Planner Agent: Analyzing code and devising a fix...',
            progress: 10,
            logs: [{ agent: 'Orchestrator', message: 'Starting Debugging Planner Agent...', timestamp: new Date().toISOString() }]
        };

        const plannerPrompt = `
You are an expert code debugger and software architect (Planner Agent).
Based on the user's request, you must analyze the provided source code to find the root cause of the issue and create a plan to fix it.

- User Request: "${userPrompt}"
- All project files:
${getFileContentString(allFileContents)}

Your response MUST be a single, valid JSON object with this exact structure:
{
  "plan": "string (a concise, step-by-step plan in ${langName} explaining what you will change and why)",
  "filesToModify": [
    "path/to/file_to_change.ext",
    "another/path/to/modify.ext"
  ]
}
Identify the MINIMAL set of files that need to be changed to resolve the issue.`;

        const plannerResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: plannerPrompt,
            config: { responseMimeType: 'application/json', temperature: 0.2 }
        });

        const planData = JSON.parse(getJsonFromText(plannerResponse.text));
        plan = planData.plan;
        const filesToModify: string[] = planData.filesToModify;
        
        if (!filesToModify || filesToModify.length === 0) {
            throw new Error("Planner Agent could not identify any files to modify. Please provide a more specific error description.");
        }

        yield {
            progress: 30,
            currentTask: 'Plan created. Starting Coder Agent to apply fixes.',
            logs: [{ agent: 'Planner Agent', message: `Plan: ${plan}`, timestamp: new Date().toISOString() }]
        };

        // === CODER AGENT (DEBUG) ===
        for (let i = 0; i < filesToModify.length; i++) {
            const filePath = filesToModify[i];
            const progress = 30 + Math.round(((i + 1) / filesToModify.length) * 65);

            yield {
                progress: progress,
                currentTask: `Coder Agent: Applying fix to ${filePath}`,
                logs: [{ agent: 'Orchestrator', message: `Invoking Coder Agent for ${filePath}.`, timestamp: new Date().toISOString() }]
            };
            
            const coderContextFiles = getFileContentString(allFileContents);

            const coderPrompt = `
You are an expert software developer (Coder Agent).
Your task is to rewrite a single file to apply a fix based on a plan.
Your output MUST be ONLY the raw, complete code for the modified file.
Do NOT include any explanations, markdown fences, or any other text.
The new code must be fully functional and complete.

- Plan: ${plan}
- File to Modify: ${filePath}
- Full Project Context:
${coderContextFiles}

Now, provide the complete, corrected code for the file: ${filePath}`;
            
            const coderResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: coderPrompt,
                config: { 
                    temperature: 0.1,
                    maxOutputTokens: 8192,
                    thinkingConfig: { thinkingBudget: 256 }
                }
            });
            
            const newFileContent = coderResponse.text.trim().replace(/^```(?:\w+)?\n|```$/g, '');
            allFileContents[filePath] = newFileContent;

            yield { 
                fileContents: { ...allFileContents },
                logs: [{ agent: 'Coder Agent', message: `Successfully applied fix to ${filePath}.`, timestamp: new Date().toISOString() }]
            };
        }

        yield {
            progress: 100,
            status: 'completed',
            currentTask: 'Fix applied successfully! Review the changes.',
            fileContents: { ...allFileContents },
            logs: [{ agent: 'Orchestrator', message: 'Debugging complete.', timestamp: new Date().toISOString() }]
        };

    } catch (error: any) {
        console.error("Debugging agent failed:", error);
        yield { 
            status: 'failed',
            error: error.message || 'An unknown error occurred during debugging.',
            currentTask: `Failed: ${error.message}`,
            logs: [{ agent: 'Orchestrator', message: `Critical error: ${error.message}`, timestamp: new Date().toISOString() }]
        };
    }
}

// --- BUSINESS PLAN GENERATOR ---

function getJsonFromAiText(text: string): any {
    const match = text.match(/```(json)?\s*([\s\S]+?)\s*```/);
    let jsonStr = match ? match[2].trim() : text.trim();

    try {
        // First attempt to parse the string as-is.
        return JSON.parse(jsonStr);
    } catch (e: any) {
        // If parsing fails, log a warning and attempt to repair the string.
        console.warn("Initial JSON.parse failed, attempting to repair string.", e.message);

        // This regex finds a backslash that is NOT followed by a valid JSON escape
        // sequence character (", \, /, b, f, n, r, t) or a unicode escape (uXXXX).
        // It's a common issue where the model tries to escape markdown characters like * or |.
        // We replace the invalid escape sequence by removing the backslash.
        const repairedJsonStr = jsonStr.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '');
        
        try {
            // Second attempt with the repaired string.
            return JSON.parse(repairedJsonStr);
        } catch (e2: any) {
            // If it still fails, log the critical error and fall back.
            console.error("Failed to parse JSON even after repair attempts:", e2.message);
            console.error("Original text provided to parser:", jsonStr);
            console.error("Repaired text that also failed:", repairedJsonStr);
            // Fallback for malformed JSON
            return { title: "Error", content: `Failed to parse AI response as JSON.\n\nRaw response:\n${text}`, estimated_data: [] };
        }
    }
}

export async function* runBusinessPlanGeneration(
    fileContents: FileContents,
    language: Language
): AsyncGenerator<Partial<BusinessPlanJob>> {
    const langName = language === 'de' ? 'German' : 'English';
    
    const getAgentPrompts = (lang: Language) => {
        const prompts = {
            en: {
                executive_summary: `Create a concise, one-page Executive Summary. It is the most critical part of the business plan. It MUST cover these points with investor-ready precision:
- **Problem:** Clearly state the core pain point. Use a persona-based example (e.g., "For an Enterprise Architect at a large corporation, onboarding new developers takes 3 weeks due to outdated documentation.").
- **Solution:** Present the solution with a value proposition. Contrast the workflow (e.g., "Instead of manual diagrams, our tool auto-generates them in minutes, saving an estimated 50% in onboarding time based on initial user feedback.").
- **Target Customers:** Be specific. Name personas and their context (e.g., "Persona 1: 'Elena', an Enterprise Architect at a Fortune 500 company. Persona 2: 'David', the CTO of a 5-person FinTech startup in Berlin.").
- **Market:** Briefly state the target market and its potential, citing an (estimated) key statistic.
- **Business Model:** How will the company make money? (e.g., SaaS Tiers, API usage).
- **USP (Unique Selling Proposition):** What makes this solution unique? (e.g., "The deep, all-in-one integration of code analysis, LLM, diagramming, and business document generation is unmatched.").
- **Team:** Briefly introduce the core team structure (e.g., "Founded by an expert CTO with a proven track record in scaling dev tools.").
- **Capital Requirement:** State the estimated capital required to reach the next major milestone.`,
                company_description: `Describe the company, its mission, vision, legal form (suggest LLC or C-Corp for US), history, and location. Mention core values and company culture.`,
                products_services: `Detail the products or services offered. Describe their benefits, unique selling points (USPs), and development stage. Address any patents or intellectual property rights. Explain the core user journey from upload to export.`,
                market_analysis: `Conduct a comprehensive, investor-ready market analysis. It MUST include:
- **Market Size & Growth:** Estimate market size for: 1. Software Documentation Tools, 2. AI-powered Developer Tools, 3. Automated Code Analysis. Cite sources like "Gartner" or "IDC" or explicitly label figures as "Internal Estimate". Include growth rates (CAGR).
- **Competitors:** Analyze key competitors: GitHub Copilot X, Mermaid Live, Notion AI, and Mintlify.
- **Price Pressure & Switching Motivation:** Create a sub-section analyzing why a user would switch from an existing tool like Copilot X. Address factors like feature gaps, pricing advantages, or superior workflow integration.`,
                marketing_sales_strategy: `Develop a holistic GTM, sales, and revenue strategy. It MUST cover:
- **Revenue Model / Pricing:** Define SaaS tiers (e.g., Starter: ~$19/mo, Pro: ~$49/mo, Agency: ~$99/mo). Propose API pricing and one-time exports.
- **Unit Economics (Estimates):** Provide estimations for key SaaS metrics:
  - **ARPU (Average Revenue Per User):** Estimate the blended average monthly revenue per paying customer.
  - **CAC (Customer Acquisition Cost):** Estimate the cost to acquire one paying customer.
  - **Churn Rate:** Estimate the monthly percentage of customers who cancel their subscription.
- **Go-to-Market Strategy:** Outline a launch plan: pre-launch (waitlist), launch platforms (Product Hunt, etc.), and post-launch campaigns.`,
                management_team: `Introduce the management team and organizational structure. It MUST be investor-focused:
- **Founder/CTO Profile:** Use a placeholder name (e.g., "Alex Schmidt") and list 1-2 concrete, impressive achievements (e.g., "Scaled a previous product from 0 to 1M users," or "Led the backend team for a successful fintech exit.").
- **Advisory Board:** Include a section for an advisory board with at least one named, high-caliber placeholder advisor (e.g., "Dr. Eva Klein, former CTO at SAP, has committed to joining our advisory board.").
- **Future Roles:** Project future key hires (CEO, Marketing, etc.).`,
                financial_plan: `Create a detailed financial plan. It MUST include:
- **Capital Requirement:** State the total funding ask (e.g., $500,000).
- **Cost Breakdown:** Detail budget allocation (Personnel, Hosting, Marketing, Legal, Tools).
- **Funding Strategy:** Mention specific grant applications and timelines (e.g., "An application for the EXIST Business Start-up Grant is in preparation and will be submitted by Q3 2025.").
- **3-Year Revenue Forecast:** Provide a summary table projecting revenue for the next 3 years.
- **Burn Rate & Breakeven Analysis:** Briefly analyze the monthly burn rate and project when the company will reach profitability based on the forecast.`,
                roadmap: `Create a product roadmap for the next 4-6 quarters.
- **Time-to-Market:** State a specific target launch date for the public beta (e.g., "Public Beta Launch targeted for October 15, 2024.").
- **Technical Risks:** Explicitly address the dependency on the Gemini API as a potential launch risk and state the plan B (e.g., "Contingency planning includes prototyping with local/open-source models to mitigate API provider risk.").`,
                risks_and_mitigation: `Identify key risks and propose mitigation strategies. This section MUST be structured as a table or list with these columns for each risk:
- **Risk:** (e.g., 'Dependency on external LLM providers').
- **Priority:** (High, Medium, or Low).
- **Mitigation Strategy:** (e.g., 'Build an abstraction layer to support multiple LLM backends').
- **Contingency Plan:** Create a specific subsection for the highest priority risk (LLM dependency) detailing a concrete scenario: "What if Gemini API becomes unavailable for 48 hours? Steps: 1. Immediately switch to fallback open-source model via abstraction layer. 2. Post status update to users. 3. Allocate 2 dev-days to stabilize the fallback model's output quality."`
            },
            de: {
                executive_summary: `Erstellen Sie eine prägnante, einseitige Executive Summary. Dies ist der wichtigste Teil des Geschäftsplans. Er MUSS die folgenden Punkte mit investorenreifer Präzision behandeln:
- **Problem:** Beschreiben Sie den zentralen Schmerzpunkt klar. Verwenden Sie ein Persona-basiertes Beispiel (z.B. "Für einen Enterprise-Architekten in einem DAX-Unternehmen dauert das Onboarding neuer Entwickler 3 Wochen aufgrund veralteter Dokumentation.").
- **Lösung:** Präsentieren Sie die Lösung mit einem Wertversprechen. Stellen Sie den Workflow gegenüber (z.B. "Anstatt manueller Diagramme generiert unser Tool diese automatisch in Minuten, was nach erstem Nutzerfeedback eine geschätzte Zeitersparnis von 50 % beim Onboarding bedeutet.").
- **Zielkunden:** Seien Sie spezifisch. Nennen Sie Personas und ihren Kontext (z.B. "Persona 1: 'Elena', eine Enterprise-Architektin bei einem DAX-Konzern. Persona 2: 'David', der CTO eines 5-köpfigen FinTech-Startups in Berlin.").
- **Markt:** Beschreiben Sie kurz den Zielmarkt und sein Potenzial und zitieren Sie eine (geschätzte) Schlüsselstatistik.
- **Geschäftsmodell:** Wie wird das Unternehmen Geld verdienen? (z.B. SaaS-Tarife, API-Nutzung).
- **USP (Alleinstellungsmerkmal):** Was macht diese Lösung einzigartig? (z.B. "Die tiefe All-in-One-Integration von Code-Analyse, LLM, Diagrammerstellung und Generierung von Geschäftsdokumenten ist unübertroffen.").
- **Team:** Stellen Sie kurz die Kernteamstruktur vor (z.B. "Gegründet von einem erfahrenen CTO mit nachgewiesener Erfolgsbilanz bei der Skalierung von Dev-Tools.").
- **Kapitalbedarf:** Geben Sie den geschätzten Kapitalbedarf an, um den nächsten großen Meilenstein zu erreichen.`,
                company_description: `Beschreiben Sie das Unternehmen, seine Mission, Vision, Rechtsform (schlagen Sie UG oder GmbH für Deutschland vor), Geschichte und Standort. Erwähnen Sie Kernwerte und Unternehmenskultur.`,
                products_services: `Beschreiben Sie die angebotenen Produkte oder Dienstleistungen detailliert. Erläutern Sie deren Vorteile, Alleinstellungsmerkmale (USPs) und den Entwicklungsstand. Gehen Sie auf Patente oder geistige Eigentumsrechte ein. Erklären Sie die zentrale User Journey vom Upload bis zum Export.`,
                market_analysis: `Führen Sie eine umfassende, investorenreife Marktanalyse durch. Diese MUSS umfassen:
- **Marktgröße & Wachstum:** Schätzen Sie die Marktgröße für: 1. Software-Dokumentations-Tools, 2. KI-gestützte Entwickler-Tools, 3. Automatisierte Code-Analyse. Zitieren Sie Quellen wie "Gartner" oder "IDC" oder kennzeichnen Sie Zahlen explizit als "Interne Schätzung". Fügen Sie Wachstumsraten (CAGR) hinzu.
- **Wettbewerber:** Analysieren Sie die Hauptwettbewerber: GitHub Copilot X, Mermaid Live, Notion AI und Mintlify.
- **Preisdruck & Wechselmotivation:** Erstellen Sie einen Unterabschnitt, der analysiert, warum ein Nutzer von einem bestehenden Tool wie Copilot X wechseln würde. Berücksichtigen Sie Faktoren wie Funktionslücken, Preisvortei
le oder eine überlegene Workflow-Integration.`,
                marketing_sales_strategy: `Entwickeln Sie eine ganzheitliche GTM-, Vertriebs- und Umsatzstrategie. Diese MUSS umfassen:
- **Umsatzmodell / Preisgestaltung:** Definieren Sie SaaS-Tarife (z.B. Starter: ~19€/Monat, Pro: ~49€/Monat, Agency: ~99€/Monat). Schlagen Sie API-Preise und Einmal-Exporte vor.
- **Unit Economics (Schätzungen):** Liefern Sie Schätzungen für wichtige SaaS-Kennzahlen:
  - **ARPU (Average Revenue Per User):** Schätzen Sie den gemischten durchschnittlichen Monatsumsatz pro zahlendem Kunden.
  - **CAC (Customer Acquisition Cost):** Schätzen Sie die Kosten für die Akquise eines zahlenden Kunden.
  - **Churn-Rate:** Schätzen Sie den monatlichen Prozentsatz der Kunden, die ihr Abonnement kündigen.
- **Go-to-Market-Strategie:** Skizzieren Sie einen Launch-Plan: Pre-Launch (Warteliste), Launch-Plattformen (Product Hunt, etc.) und Post-Launch-Kampagnen.`,
                management_team: `Stellen Sie das Management-Team und die Organisationsstruktur vor. Dies MUSS investorenorientiert sein:
- **Gründer/CTO-Profil:** Verwenden Sie einen Platzhalternamen (z.B. "Alex Schmidt") und listen Sie 1-2 konkrete, beeindruckende Erfolge auf (z.B. "Ein früheres Produkt von 0 auf 1 Mio. Nutzer skaliert" oder "Das Backend-Team bei einem erfolgreichen Fintech-Exit geleitet.").
- **Beirat (Advisory Board):** Fügen Sie einen Abschnitt für einen Beirat mit mindestens einem genannten, hochkarätigen Platzhalter-Berater hinzu (z.B. "Dr. Eva Klein, ehemalige CTO bei SAP, hat ihre Zusage für unseren Beirat gegeben.").
- **Zukünftige Rollen:** Projizieren Sie zukünftige Schlüsselpositionen (CEO, Marketing, etc.).`,
                financial_plan: `Erstellen Sie einen detaillierten Finanzplan. Er MUSS beinhalten:
- **Kapitalbedarf:** Geben Sie die gesamte Finanzierungsanfrage an (z.B. 500.000 €).
- **Kostenaufschlüsselung:** Detaillieren Sie die Budgetzuweisung (Personal, Hosting, Marketing, Recht, Tools).
- **Förderstrategie:** Erwähnen Sie konkrete Förderanträge und Zeitpläne (z.B. "Ein Antrag für das EXIST-Gründerstipendium ist in Vorbereitung und wird bis Q3 2025 eingereicht.").
- **3-Jahres-Umsatzprognose:** Erstellen Sie eine zusammenfassende Tabelle mit der Umsatzprognose für die nächsten 3 Jahre.
- **Burn-Rate & Breakeven-Analyse:** Analysieren Sie kurz die monatliche Burn-Rate und projizieren Sie, wann das Unternehmen die Gewinnschwelle erreichen wird.`,
                roadmap: `Erstellen Sie eine Produkt-Roadmap für die nächsten 4-6 Quartale.
- **Time-to-Market:** Nennen Sie ein konkretes Zieldatum für den Start der öffentlichen Beta (z.B. "Öffentlicher Beta-Start für den 15. Oktober 2024 geplant.").
- **Technische Risiken:** Sprechen Sie explizit die Abhängigkeit von der Gemini-API als potenzielles Startrisiko an und nennen Sie den Plan B (z.B. "Die Notfallplanung umfasst das Prototyping mit lokalen/Open-Source-Modellen, um das Risiko von API-Anbietern zu mindern.").`,
                risks_and_mitigation: `Identifizieren Sie die wichtigsten Risiken und schlagen Sie Minderungsstrategien vor. Dieser Abschnitt MUSS als Tabelle oder Liste mit diesen Spalten für jedes Risiko strukturiert sein:
- **Risiko:** (z.B. 'Abhängigkeit von externen LLM-Anbietern').
- **Priorität:** (Hoch, Mittel oder Niedrig).
- **Minderungsstrategie:** (z.B. 'Aufbau einer Abstraktionsschicht zur Unterstützung mehrerer LLM-Backends').
- **Notfallplan:** Erstellen Sie einen spezifischen Unterabschnitt für das Risiko mit der höchsten Priorität (LLM-Abhängigkeit), der ein konkretes Szenario detailliert: "Was passiert, wenn die Gemini-API für 48 Stunden ausfällt? Schritte: 1. Sofortige Umschaltung auf das Fallback-Open-Source-Modell über die Abstraktionsschicht. 2. Veröffentlichung eines Status-Updates für die Nutzer. 3. Zuweisung von 2 Entwicklertagen zur Stabilisierung der Ausgabequalität des Fallback-Modells."`
            }
        };
        return prompts[lang];
    };

    const textPartsForPrompt: string[] = [];
    const imagePartsForPrompt: { inlineData: { mimeType: string; data: string } }[] = [];

    Object.entries(fileContents).forEach(([name, content]) => {
        const imageMatch = content.match(/^\[IMAGE:(.+?);base64,(.+)\]$/);
        if (imageMatch) {
            imagePartsForPrompt.push({ inlineData: { mimeType: imageMatch[1], data: imageMatch[2] } });
            textPartsForPrompt.push(`### Document: ${name}\n\n[Content of image '${name}' is provided as a separate image part for your analysis.]`);
        } else {
            textPartsForPrompt.push(`### Document: ${name}\n\n${content}`);
        }
    });
    const combinedText = textPartsForPrompt.join('\n\n---\n\n');

    const fullPlan: Partial<BusinessPlan> = {};
    const agentPrompts = getAgentPrompts(language);

    try {
        // 1. Initial Analysis Agent
        yield { progress: 5, logs: [{ agent: 'Analysis Agent', message: 'agentTaskAnalysis' }] };
        const analysisPrompt = `
You are an Analysis Agent. Your task is to analyze the following collection of documents and images to create a concise summary of all information relevant to a business plan. Extract key text and data from images. Identify key points and also list any critical information that seems to be missing. Your entire output must be in ${langName}.

Documents:
${combinedText}

Analysis Summary and Identified Gaps:
`;
        const analysisResponse = await ai.models.generateContent({ 
            model: "gemini-2.5-flash", 
            contents: { parts: [{ text: analysisPrompt }, ...imagePartsForPrompt] },
            config: {
                maxOutputTokens: 16384,
                thinkingConfig: { thinkingBudget: 8192 }
            }
        });
        const analysisSummary = analysisResponse.text;
        yield { progress: 10, logs: [{ agent: 'Analysis Agent', message: 'agentTaskAnalysisComplete', data: analysisSummary }] };

        // 2. Section Agents
        const agents: { key: keyof BusinessPlan; role: string; task: string }[] = [
            { key: 'executive_summary', role: 'Executive Summary Agent', task: agentPrompts.executive_summary },
            { key: 'company_description', role: 'Company Description Agent', task: agentPrompts.company_description },
            { key: 'products_services', role: 'Products & Services Agent', task: agentPrompts.products_services },
            { key: 'market_analysis', role: 'Market Analysis Agent', task: agentPrompts.market_analysis },
            { key: 'marketing_sales_strategy', role: 'Marketing & Sales Agent', task: agentPrompts.marketing_sales_strategy },
            { key: 'management_team', role: 'Management Team Agent', task: agentPrompts.management_team },
            { key: 'financial_plan', role: 'Financial Plan Agent', task: agentPrompts.financial_plan },
            { key: 'roadmap', role: 'Roadmap Agent', task: agentPrompts.roadmap },
            { key: 'risks_and_mitigation', role: 'Risks & Mitigation Agent', task: agentPrompts.risks_and_mitigation },
        ];
        
        for (let i = 0; i < agents.length; i++) {
            const agent = agents[i];
            const progress = 10 + Math.round(((i + 1) / agents.length) * 85);
            yield { progress, logs: [{ agent: agent.role, message: 'agentTaskGeneric' }] };

            const agentPrompt = `
You are a ${agent.role}. Your task is to create a specific section of a business plan based on the provided context. All your output MUST be in ${langName}. If data is missing, make intelligent estimates and clearly identify them.

**CRITICAL: JSON FORMATTING RULES**
Your response MUST be a single, valid JSON object and nothing else. Do NOT add any conversational text or markdown fences around the JSON.
1.  **Escape Correctly:** All double quotes (") inside a string value must be escaped with a backslash (\\").
2.  **Handle Newlines:** All literal newline characters inside a string value MUST be replaced with the two-character sequence \`\\n\`. Do NOT include unescaped, literal newlines in the JSON output.

---
**CONTEXT & TASK**
Context from document analysis:
${analysisSummary}

Your specific task:
${agent.task}
---

Please respond ONLY with a valid JSON object in the following format.
{
  "title": "The title of the section in ${langName}",
  "content": "The full content of the section in ${langName}, using Markdown for formatting (e.g., #, *, lists). Include any estimated data directly in the content.",
  "estimated_data": ["A list of descriptions for each piece of data you estimated, e.g., 'Projected Year 1 revenue'", "Number of initial marketing leads"]
}`;
            const agentResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: agentPrompt, config: { 
                temperature: 0.6,
                maxOutputTokens: 16384,
                thinkingConfig: { thinkingBudget: 8192 }
            } });
            const sectionData = getJsonFromAiText(agentResponse.text) as BusinessPlanSection;

            fullPlan[agent.key] = sectionData;

            yield {
                progress,
                logs: [{ agent: agent.role, message: 'agentTaskComplete', data: sectionData }],
                result: { ...fullPlan } as BusinessPlan
            };
        }

        yield { status: 'completed', progress: 100, result: fullPlan as BusinessPlan, logs: [{ agent: 'System', message: 'businessPlanComplete' }] };

    } catch (error: any) {
        console.error("Business plan generation failed:", error);
        yield { status: 'failed', error: error.message || 'An unknown error occurred during generation.', logs: [{ agent: 'System', message: 'businessPlanFailed', data: error.message }] };
    }
}


// --- PITCH DECK GENERATOR ---

export async function* runPitchDeckGeneration(
    fileContents: FileContents,
    language: Language
): AsyncGenerator<Partial<PitchDeckJob>> {
    const langName = language === 'de' ? 'German' : 'English';
    const textPartsForPrompt: string[] = [];
    const imagePartsForPrompt: { inlineData: { mimeType: string; data: string } }[] = [];

    Object.entries(fileContents).forEach(([name, content]) => {
        const imageMatch = content.match(/^\[IMAGE:(.+?);base64,(.+)\]$/);
        if (imageMatch) {
            imagePartsForPrompt.push({
                inlineData: {
                    mimeType: imageMatch[1],
                    data: imageMatch[2]
                }
            });
            textPartsForPrompt.push(`### Document: ${name}\n\n[Content of image '${name}' is provided as a separate image part for your analysis.]`);
        } else {
            textPartsForPrompt.push(`### Document: ${name}\n\n${content}`);
        }
    });

    const combinedText = textPartsForPrompt.join('\n\n---\n\n');

    try {
        // 1. Analysis Agent
        yield { progress: 10, logs: [{ agent: 'Analysis Agent', message: 'agentTaskAnalysis' }] };
        const analysisPrompt = `
You are an Analysis Agent. Your task is to analyze the following collection of documents and images to create a concise summary of all information relevant to a pitch deck. Focus on identifying the core problem, the proposed solution, market details, team information, and any existing traction or financial data. Extract relevant text from images. Your entire output must be in ${langName}.

Documents:
${combinedText}

Pitch Deck Information Summary:
`;
        const analysisResponse = await ai.models.generateContent({ 
            model: "gemini-2.5-flash", 
            contents: { parts: [{text: analysisPrompt}, ...imagePartsForPrompt] },
            config: {
                maxOutputTokens: 8192,
                thinkingConfig: { thinkingBudget: 256 }
            }
        });
        const analysisSummary = analysisResponse.text;
        yield { progress: 30, logs: [{ agent: 'Analysis Agent', message: 'agentTaskAnalysisComplete', data: analysisSummary }] };

        // 2. Pitch Deck Generator Agent
        yield { progress: 50, logs: [{ agent: 'Pitch Deck Agent', message: 'agentTaskPitchDeck' }] };
        const pitchDeckPrompt = `
You are an expert pitch deck creator. Your task is to synthesize the provided summary into a professional and compelling pitch deck.
The pitch deck must be in ${langName} and should include the following sections where applicable:
1.  **Problem:** Clearly define the problem your solution addresses.
2.  **Solution:** Describe your product/service as the solution.
3.  **Market Opportunity:** Quantify the market size and target audience.
4.  **Business Model:** Explain how you generate revenue.
5.  **Traction/Milestones:** Showcase achievements and progress.
6.  **Team:** Introduce key team members.
7.  **Competition:** Briefly mention competitors and your differentiation.
8.  **Financial Ask:** State funding needs and how funds will be used.
9.  **Call to Action:** What do you want the audience to do next?

Format the output as a structured Markdown document. Use clear headings, bullet points, and bold text for emphasis.

--- Provided Information Summary ---
${analysisSummary}
--- End Provided Information ---

Generate the pitch deck in Markdown format now.
`;
        const pitchDeckResponse = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: pitchDeckPrompt, config: { 
            temperature: 0.6,
            maxOutputTokens: 8192,
            thinkingConfig: { thinkingBudget: 256 }
        } });
        const markdown = pitchDeckResponse.text.trim();
        yield { progress: 80, logs: [{ agent: 'Pitch Deck Agent', message: 'agentTaskComplete' }] };
        
        // 3. Convert to HTML
        const html = convertMarkdownToHtml(markdown, 'Pitch Deck');

        yield {
            status: 'completed',
            progress: 100,
            result: { markdown, html },
            logs: [{ agent: 'System', message: 'pitchDeckComplete' }]
        };

    } catch (error: any) {
        console.error("Pitch deck generation failed:", error);
        yield { status: 'failed', error: error.message || 'An unknown error occurred during generation.', logs: [{ agent: 'System', message: 'pitchDeckFailed', data: error.message }] };
    }
}

// --- STARTUP PLANNER ---
export async function* runStartupPlanGeneration(
    fileContents: FileContents,
    language: Language
): AsyncGenerator<Partial<StartupPlanJob>> {
    const langName = language === 'de' ? 'German' : 'English';
    const textPartsForPrompt: string[] = [];
    const imagePartsForPrompt: { inlineData: { mimeType: string; data: string } }[] = [];

    Object.entries(fileContents).forEach(([name, content]) => {
        const imageMatch = content.match(/^\[IMAGE:(.+?);base64,(.+)\]$/);
        if (imageMatch) {
            imagePartsForPrompt.push({
                inlineData: {
                    mimeType: imageMatch[1],
                    data: imageMatch[2]
                }
            });
            const message = language === 'de' 
                ? `[Inhalt des Bildes '${name}' wird separat zur Analyse bereitgestellt.]`
                : `[Content of image '${name}' is provided separately for analysis.]`;
            textPartsForPrompt.push(`### Datei: ${name}\n\n${message}`);
        } else {
             textPartsForPrompt.push(`### Datei: ${name}\n\n${content.substring(0, 5000)}...`);
        }
    });

    const combinedText = textPartsForPrompt.join('\n\n---\n\n');

    const promptText = {
        de: `Erstelle einen hochprofessionellen Startup-Gründungsplan basierend auf den folgenden Informationen. Analysiere Text und Bilder, um ein vollständiges Bild zu erhalten.
Der Plan soll folgende Aspekte integrieren:
1.  **Lean Startup & Business Model Canvas:** Hypothesen, MVP, iterative Entwicklung.
2.  **IHK/KfW-Muster:** Formale Anforderungen für Förderanträge und Banken.
3.  **Sequoia-Deck:** Fokus auf Investorenrelevanz (Problem, Lösung, Markt, Team, Finanzen).

Strukturiere den Plan klar mit Überschriften und Abschnitten. Gib den Plan im Markdown-Format zurück.

---
**Hochgeladene Daten:**
${combinedText}
---

Bitte erstelle nun den detaillierten Startup-Gründungsplan.`,
        en: `Create a highly professional startup business plan based on the following information. Analyze text and images to get a complete picture.
The plan should integrate the following aspects:
1.  **Lean Startup & Business Model Canvas:** Hypotheses, MVP, iterative development.
2.  **Formal Requirements (e.g., SBA/local chambers of commerce):** Structure suitable for loan applications and formal review.
3.  **Sequoia-style Deck:** Focus on investor-relevant topics (Problem, Solution, Market, Team, Financials).

Structure the plan clearly with headings and sections. Return the plan in Markdown format.

---
**Uploaded Data:**
${combinedText}
---

Now, please create the detailed startup business plan.`
    };

    try {
        yield { status: 'generating', progress: 10 };
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ text: promptText[language] }, ...imagePartsForPrompt] },
            config: {
                temperature: 0.5,
                maxOutputTokens: 8192,
                thinkingConfig: { thinkingBudget: 256 }
            }
        });
        yield { status: 'generating', progress: 80 };
        const plan = response.text.trim();
        yield { status: 'completed', progress: 100, result: plan };
    } catch (e: any) {
        console.error("Startup plan generation failed:", e);
        yield { status: 'failed', error: e.message || 'An unknown error occurred during generation.' };
    }
}


import React, { useState, useCallback, useEffect } from 'react';
import { FileNode, FileContents, Language, ThemeSettings, DiagramType, DiagrammingLanguage, Manual, AppMode, AgentJob, BusinessPlanJob, PitchDeckJob, ScaffoldingJob } from './types';
import Header from './components/Header';
import FileExplorer from './components/FileExplorer';
import DiagramEditor from './components/MermaidEditor';
import CodeEditor from './components/CodeEditor';
import DiagramViewer from './components/DiagramViewer';
import SettingsModal from './components/SettingsModal';
import IdeaArchitect from './components/IdeaArchitect';
import AgentSystem from './components/AgentSystem';
import BusinessPlanGenerator from './components/BusinessPlanGenerator';
import PitchDeckGenerator from './components/PitchDeckGenerator';
import StartupPlanner from './components/StartupPlanner';
import Icon from './components/Icon';
import { 
    analyzeProject, 
    correctDiagramCode, 
    generateProjectDocumentation, 
    generateWhitepaper, 
    generateProjectManual, 
    generateIdeaManual, 
    runScaffoldingGeneration,
    generateDiagramFromIdea,
    generateSuperpromptFromIdea,
    generateDiagramFromSuperprompt,
    generateDocumentationFromSuperprompt,
    generateWhitepaperFromSuperprompt,
    generateMockupFromSuperprompt
} from './services/geminiService';
import { I18nProvider, useTranslation } from './hooks/useTranslation';

declare const JSZip: any;
const MAX_CORRECTION_ATTEMPTS = 3;

const defaultTheme: ThemeSettings = {
    background: '#1e293b', // slate-800
    primaryColor: '#0ea5e9', // sky-500
    secondaryColor: '#334155', // slate-700
    primaryTextColor: '#f1f5f9', // slate-100
    lineColor: '#64748b', // slate-500
    fontSize: 14,
};

const ManualViewer: React.FC<{manual: Manual, onDownload: (content: string | Blob, fileName: string, mimeType: string) => void}> = ({ manual, onDownload }) => {
    const { t } = useTranslation();
    
    const generateMarkdown = (): string => {
        let md = `# ${manual.title}\n\n`;
        md += `_${manual.introduction}_\n\n`;
        manual.sections.forEach(section => {
            md += `## ${section.title}\n\n`;
            md += `${section.content}\n\n`;
        });
        return md;
    };

    const generateHtml = (): string => {
        let html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<title>${manual.title}</title>\n`;
        html += `<script src="https://cdn.tailwindcss.com?plugins=typography"></script>\n`
        html += `<body class="bg-slate-900 text-slate-200 p-8">\n<article class="prose prose-invert prose-slate max-w-4xl mx-auto prose-h1:text-cyan-400 prose-h2:text-teal-400 prose-a:text-cyan-400 hover:prose-a:text-cyan-300">\n`;
        html += `<h1>${manual.title}</h1>\n`;
        html += `<p class="lead">${manual.introduction}</p>\n`;
        manual.sections.forEach(section => {
            html += `<h2>${section.title}</h2>\n<div>${section.content.replace(/\n/g, '<br />')}</div>\n`;
        });
        html += '</article>\n</body>\n</html>';
        return html;
    };
    
    return (
        <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-100">{manual.title}</h2>
                 <div className="flex items-center space-x-2">
                    <button onClick={() => onDownload(generateHtml(), 'manual.html', 'text/html')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors duration-300">
                        <Icon type="html" className="w-5 h-5" />
                        <span>{t('downloadHTML')}</span>
                    </button>
                    <button onClick={() => onDownload(generateMarkdown(), 'manual.md', 'text/markdown')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors duration-300">
                        <Icon type="md" className="w-5 h-5" />
                        <span>{t('downloadMD')}</span>
                    </button>
                </div>
            </header>
            <main className="p-6 overflow-y-auto prose prose-invert prose-slate max-w-none prose-h1:text-cyan-400 prose-h2:text-teal-400 prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
                <p className="lead !my-2 !text-lg !text-slate-400">{manual.introduction}</p>
                {manual.sections.map((section, index) => (
                    <div key={index} className="mt-6">
                        <h2>{section.title}</h2>
                        <div className="text-slate-300" dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />') }} />
                    </div>
                ))}
            </main>
        </div>
    );
}

const createFileTreeFromContents = (projectName: string, contents: FileContents): FileNode => {
    const rootName = projectName.replace('.zip', '').replace(/[\s_]+/g, '-').toLowerCase() || 'project';
    const root: FileNode = { name: rootName, path: '', type: 'directory', children: [] };
    
    const sortedPaths = Object.keys(contents).sort();

    sortedPaths.forEach((path) => {
        // Ignore .keep files when building the tree for display
        if (path.endsWith('/.keep')) return;

        const pathParts = path.split('/').filter(p => p);
        let currentNode = root;

        pathParts.forEach((part, index) => {
            if (!currentNode.children) {
                currentNode.children = [];
            }
            let childNode = currentNode.children.find(child => child.name === part);

            if (!childNode) {
                const currentPath = pathParts.slice(0, index + 1).join('/');
                const isDir = index < pathParts.length - 1 || sortedPaths.some(p => p.startsWith(currentPath + '/') && p !== currentPath);
                const type = isDir ? 'directory' : 'file';

                childNode = { 
                    name: part, 
                    path: currentPath, 
                    type, 
                    children: type === 'directory' ? [] : undefined
                };
                currentNode.children.push(childNode);
            }
            
            if (childNode.type === 'directory') {
               currentNode = childNode;
            }
        });
    });
    return root;
};


const MainApp: React.FC = () => {
  // Common state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultTheme);
  const [diagramType, setDiagramType] = useState<DiagramType>('classDiagram');
  const [diagrammingLanguage, setDiagrammingLanguage] = useState<DiagrammingLanguage>('mermaid');
  const [themeRevision, setThemeRevision] = useState(0);
  const { t, language } = useTranslation();
  const [appMode, setAppMode] = useState<AppMode>('analyze');

  // State for 'analyze' mode
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [fileContents, setFileContents] = useState<FileContents | null>(null);
  const [activeFileContents, setActiveFileContents] = useState<FileContents | null>(null);
  const [renderedDiagramCode, setRenderedDiagramCode] = useState<string>('');
  const [editableDiagramCode, setEditableDiagramCode] = useState<string>('');
  const [diagramError, setDiagramError] = useState<string | null>(null);
  const [analysisExplanation, setAnalysisExplanation] = useState<string>('');
  const [correctionAttempts, setCorrectionAttempts] = useState<number>(0);
  const [isGeneratingDocs, setIsGeneratingDocs] = useState<boolean>(false);
  const [isGeneratingWhitepaper, setIsGeneratingWhitepaper] = useState<boolean>(false);
  const [isGeneratingManual, setIsGeneratingManual] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [generatedManual, setGeneratedManual] = useState<Manual | null>(null);
  const [analyzingPath, setAnalyzingPath] = useState<string | null>(null);
  const [analysisScope, setAnalysisScope] = useState<string | null>(null);
  const [isGeneratingIdeaDiagram, setIsGeneratingIdeaDiagram] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  // State for 'generate' mode
  const [ideaPrompt, setIdeaPrompt] = useState<string>('');
  const [generatedDiagram, setGeneratedDiagram] = useState<string>('');
  const [editableGeneratedDiagram, setEditableGeneratedDiagram] = useState<string>('');
  const [generatedDocumentation, setGeneratedDocumentation] = useState<string>('');
  const [generatedWhitepaperContent, setGeneratedWhitepaperContent] = useState<string>('');
  const [generatedSuperprompt, setGeneratedSuperprompt] = useState<string>('');
  const [generatedMockup, setGeneratedMockup] = useState<string>('');
  const [scaffoldingJob, setScaffoldingJob] = useState<ScaffoldingJob>({ status: 'idle', progress: 0, currentTask: '', error: null, fileContents: null });
  
  // Loading states for 'generate' mode
  const [isLoadingSuperprompt, setIsLoadingSuperprompt] = useState(false);
  const [isLoadingGeneratedDiagram, setIsLoadingGeneratedDiagram] = useState(false);
  const [isLoadingGeneratedDocumentation, setIsLoadingGeneratedDocumentation] = useState(false);
  const [isLoadingGeneratedWhitepaper, setIsLoadingGeneratedWhitepaper] = useState(false);
  const [isLoadingMockup, setIsLoadingMockup] = useState(false);
  const [isLoadingIdeaManual, setIsLoadingIdeaManual] = useState(false);


  useEffect(() => {
    // @ts-ignore
    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'base',
      themeVariables: {
        background: themeSettings.background,
        primaryColor: themeSettings.primaryColor,
        secondaryColor: themeSettings.secondaryColor,
        primaryTextColor: themeSettings.primaryTextColor,
        lineColor: themeSettings.lineColor,
        fontSize: `${themeSettings.fontSize}px`,
        nodeBorder: themeSettings.primaryColor,
        mainBkg: themeSettings.background,
        textColor: themeSettings.primaryTextColor,
      }
    });
    setThemeRevision(rev => rev + 1);
  }, [themeSettings]);


  const processZipFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setFileTree(null);
    setFileContents(null);
    setActiveFileContents(null);
    setRenderedDiagramCode('');
    setEditableDiagramCode('');
    setDiagramError(null);
    setAnalysisExplanation('');
    setCorrectionAttempts(0);
    setAnalysisScope(null);
    setSelectedFilePath(null);
    
    try {
      const zip = await JSZip.loadAsync(file);
      const contents: FileContents = {};
      const filePromises: Promise<void>[] = [];

      zip.forEach((relativePath: string, zipEntry: any) => {
        if (!zipEntry.dir) {
          const isBinary = !zipEntry.name.endsWith('.txt') && !zipEntry.name.endsWith('.md') && !zipEntry.name.endsWith('.json') && !zipEntry.name.endsWith('.html') && !zipEntry.name.endsWith('.css') && !zipEntry.name.endsWith('.js') && !zipEntry.name.endsWith('.ts') && !zipEntry.name.endsWith('.tsx') && !zipEntry.name.endsWith('.jsx');
          
          filePromises.push(
            zipEntry.async(isBinary ? "base64" : "string").then((content: string) => {
               contents[relativePath] = isBinary ? `[BINARY_FILE:${zipEntry.name}]` : content;
            })
          );
        }
      });

      await Promise.all(filePromises);
      const root = createFileTreeFromContents(file.name, contents);
      setFileTree(root);
      setFileContents(contents);
      setActiveFileContents(contents);

    } catch (e) {
      console.error("Error processing ZIP file:", e);
      alert(t('zipError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleZipUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processZipFile(file);
    }
    event.target.value = '';
  };

  const handleRenderError = useCallback((errorMessage: string | null) => {
    setDiagramError(errorMessage);
  }, []);

  const downloadFile = (content: string | Blob, fileName: string, mimeType: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleAnalyze = useCallback(async (scopePath: string = '') => {
    if (!fileContents) {
        alert(t('noFilesToAnalyze'));
        return;
    }

    const scopedFileContents = Object.entries(fileContents)
        .filter(([path]) => path.startsWith(scopePath))
        .reduce((acc, [path, content]) => {
            acc[path] = content;
            return acc;
        }, {} as FileContents);

    if (Object.keys(scopedFileContents).length === 0) {
        alert(t('directoryEmpty'));
        return;
    }
    
    setActiveFileContents(scopedFileContents);
    setIsLoading(true);
    setAnalyzingPath(scopePath);
    setDiagramError(null);
    setCorrectionAttempts(0);
    setAnalysisScope(scopePath);
    setSelectedFilePath(null); // Close code editor when running analysis

    const existingDiagram = editableDiagramCode.trim() ? editableDiagramCode : undefined;

    try {
        const result = await analyzeProject(scopedFileContents, diagramType, language, diagrammingLanguage, scopePath, existingDiagram);
        setAnalysisExplanation(result.explanation);
        setRenderedDiagramCode(result.diagram);
        setEditableDiagramCode(result.diagram);
    } catch (e: any) {
        console.error("Failed to analyze project:", e);
        setDiagramError(`${t('aiAnalysisFailed')}: ${e.message}`);
    } finally {
        setIsLoading(false);
        setAnalyzingPath(null);
    }
}, [fileContents, diagramType, language, diagrammingLanguage, t, editableDiagramCode]);


  const handleCorrectError = useCallback(async () => {
      if (!renderedDiagramCode || !diagramError || correctionAttempts >= MAX_CORRECTION_ATTEMPTS) return;

      setIsLoading(true);
      const attemptNumber = correctionAttempts + 1;
      setCorrectionAttempts(attemptNumber);
      
      try {
        const correctedCode = await correctDiagramCode(renderedDiagramCode, diagramError, diagrammingLanguage);
        setRenderedDiagramCode(correctedCode);
        setEditableDiagramCode(correctedCode);
        setAnalysisExplanation(t('aiCorrectionAttempt', { attempt: attemptNumber }));
        setDiagramError(null);
      } catch (e: any) {
        console.error(e);
        alert(`${t('aiCorrectionFailedAttempt', { attempt: attemptNumber })}: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
  }, [renderedDiagramCode, diagramError, correctionAttempts, t, diagrammingLanguage]);
  
  const handleManualRender = () => {
    setDiagramError(null);
    setCorrectionAttempts(0);
    setAnalysisExplanation(t('manualRenderExplanation'));
    setRenderedDiagramCode(editableDiagramCode);
    setAnalysisScope(''); // Reset scope for manual render
  };

  const handleGenerateDocs = async () => {
    if (!activeFileContents) return;
    setIsGeneratingDocs(true);
    try {
        const htmlContent = await generateProjectDocumentation(activeFileContents, language);
        downloadFile(htmlContent, 'api-documentation.html', 'text/html;charset=utf-8');
    } catch (e: any) {
        console.error("Failed to generate documentation:", e);
        alert(`${t('aiAnalysisFailed')}: ${e.message}`);
    } finally {
        setIsGeneratingDocs(false);
    }
  };

  const handleGenerateWhitepaper = async () => {
      if (!activeFileContents || !renderedDiagramCode) return;
      setIsGeneratingWhitepaper(true);
      try {
          const htmlContent = await generateWhitepaper(activeFileContents, renderedDiagramCode, analysisExplanation, language, diagrammingLanguage);
          downloadFile(htmlContent, 'project-whitepaper.html', 'text/html;charset=utf-8');
      } catch (e: any) {
          console.error("Failed to generate whitepaper:", e);
          alert(`${t('aiAnalysisFailed')}: ${e.message}`);
      } finally {
          setIsGeneratingWhitepaper(false);
      }
  };

  const handleGenerateProjectManual = async () => {
    if (!activeFileContents) return;
    setIsGeneratingManual(true);
    setGeneratedManual(null);
    try {
        const manual = await generateProjectManual(activeFileContents, language);
        setGeneratedManual(manual);
        setIsManualModalOpen(true);
    } catch (e: any) {
        console.error("Failed to generate project manual:", e);
        alert(`${t('manualGenerationFailed')}: ${e.message}`);
    } finally {
        setIsGeneratingManual(false);
    }
  };

  const handleGenerateProjectMarkdown = () => {
    if (!activeFileContents) return;

    const generateProjectMarkdownContent = (files: FileContents): string => {
      let markdownContent = `# Project Code Dump\n\nThis document contains a dump of all the files from the uploaded project.\n\n---\n\n`;
      const getLanguageIdentifier = (fileName: string): string => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'js': case 'jsx': return 'javascript';
          case 'ts': case 'tsx': return 'typescript';
          case 'py': return 'python';
          case 'java': return 'java';
          case 'cs': return 'csharp';
          case 'go': return 'go';
          case 'rb': return 'ruby';
          case 'php': return 'php';
          case 'html': return 'html';
          case 'css': return 'css';
          case 'scss': return 'scss';
          case 'less': return 'less';
          case 'json': return 'json';
          case 'xml': return 'xml';
          case 'sql': return 'sql';
          case 'sh': return 'shell';
          case 'md': return 'markdown';
          default: return '';
        }
      };

      Object.entries(files).forEach(([path, content]) => {
        const lang = getLanguageIdentifier(path);
        markdownContent += `## \`${path}\`\n\n`;
        markdownContent += `\`\`\`${lang}\n`;
        markdownContent += `${content}\n`;
        markdownContent += `\`\`\`\n\n---\n\n`;
      });
      return markdownContent;
    };

    const markdown = generateProjectMarkdownContent(activeFileContents);
    downloadFile(markdown, 'project-contents.md', 'text/markdown;charset=utf-8');
  };
  
  const handleGenerateIdeaManual = async () => {
    if (!generatedSuperprompt) return;
    setIsLoadingIdeaManual(true);
    setGeneratedManual(null);
     try {
        const manual = await generateIdeaManual(generatedSuperprompt, language);
        setGeneratedManual(manual);
    } catch (e: any) {
        console.error("Failed to generate idea manual:", e);
        alert(`${t('manualGenerationFailed')}: ${e.message}`);
    } finally {
        setIsLoadingIdeaManual(false);
    }
  }

  const handleGenerateSuperprompt = async () => {
    if (!ideaPrompt) {
      alert(t('noIdeaToAnalyze'));
      return;
    }
    setIsLoadingSuperprompt(true);
    // Reset all generated content
    setGeneratedDiagram('');
    setEditableGeneratedDiagram('');
    setGeneratedDocumentation('');
    setGeneratedWhitepaperContent('');
    setGeneratedSuperprompt('');
    setGeneratedMockup('');
    setGeneratedManual(null);
    setScaffoldingJob({ status: 'idle', progress: 0, currentTask: '', error: null, fileContents: null });

    try {
      const superprompt = await generateSuperpromptFromIdea(ideaPrompt, language);
      setGeneratedSuperprompt(superprompt);
    } catch (e: any) {
      console.error("Failed to generate Superprompt from idea:", e);
      alert(`${t('ideaGenerationFailed')}: ${e.message}`);
    } finally {
      setIsLoadingSuperprompt(false);
    }
  };
  
  const handleGenerateGeneratedDiagram = async () => {
      if (!generatedSuperprompt) return;
      setIsLoadingGeneratedDiagram(true);
      try {
          const diagram = await generateDiagramFromSuperprompt(generatedSuperprompt, diagramType, language, diagrammingLanguage);
          setGeneratedDiagram(diagram);
          setEditableGeneratedDiagram(diagram);
      } catch (e: any) {
          console.error("Failed to generate diagram from superprompt:", e);
          alert(`${t('ideaGenerationFailed')}: ${e.message}`);
      } finally {
          setIsLoadingGeneratedDiagram(false);
      }
  };

  const handleGenerateGeneratedDocumentation = async () => {
    if (!generatedSuperprompt || !generatedDiagram) return;
    setIsLoadingGeneratedDocumentation(true);
    try {
        const docHtml = await generateDocumentationFromSuperprompt(generatedSuperprompt, generatedDiagram, diagrammingLanguage, language);
        setGeneratedDocumentation(docHtml);
    } catch (e: any) {
        console.error("Failed to generate documentation from superprompt:", e);
        alert(`${t('ideaGenerationFailed')}: ${e.message}`);
    } finally {
        setIsLoadingGeneratedDocumentation(false);
    }
  };
  
  const handleGenerateGeneratedWhitepaper = async () => {
    if (!generatedSuperprompt || !generatedDiagram) return;
    setIsLoadingGeneratedWhitepaper(true);
    try {
        const wpHtml = await generateWhitepaperFromSuperprompt(generatedSuperprompt, generatedDiagram, diagrammingLanguage, language);
        setGeneratedWhitepaperContent(wpHtml);
    } catch (e: any) {
        console.error("Failed to generate whitepaper from superprompt:", e);
        alert(`${t('ideaGenerationFailed')}: ${e.message}`);
    } finally {
        setIsLoadingGeneratedWhitepaper(false);
    }
  };

  const handleGenerateMockup = async () => {
    if (!generatedSuperprompt) return;
    setIsLoadingMockup(true);
    try {
        const mockupHtml = await generateMockupFromSuperprompt(generatedSuperprompt, language);
        setGeneratedMockup(mockupHtml);
    } catch (e: any) {
        console.error("Failed to generate mockup:", e);
        alert(`${t('mockupGenerationFailed')}: ${e.message}`);
    } finally {
        setIsLoadingMockup(false);
    }
  };
  
  const handleGenerateScaffolding = async () => {
    if (!generatedSuperprompt) return;

    setScaffoldingJob({
        status: 'running',
        progress: 0,
        currentTask: t('initializing'),
        error: null,
        fileContents: null
    });

    try {
        for await (const update of runScaffoldingGeneration(generatedSuperprompt, language)) {
            setScaffoldingJob(prevJob => ({ ...prevJob!, ...update }));
        }
    } catch (e: any) {
        console.error("Failed to generate scaffolding:", e);
        setScaffoldingJob(prevJob => ({
            ...prevJob!,
            status: 'failed',
            error: `${t('scaffoldingGenerationFailed')}: ${e.message}`,
            currentTask: 'Failed'
        }));
    }
  };

  const handleGenerateRender = () => {
    setGeneratedDiagram(editableGeneratedDiagram);
  };
  
  const handleAppModeChange = (mode: AppMode) => {
    const diagramToTransfer = appMode === 'generate' && mode === 'analyze' ? generatedDiagram : null;

    if (mode !== 'analyze' && mode !== 'agentSystem') {
        setFileTree(null);
        setFileContents(null);
        setActiveFileContents(null);
    }
    
    // Reset analyze mode state
    setRenderedDiagramCode('');
    setEditableDiagramCode('');
    setDiagramError(null);
    setAnalysisExplanation('');
    setCorrectionAttempts(0);
    setAnalysisScope(null);
    setAnalyzingPath(null);
    setIsGeneratingDocs(false);
    setIsGeneratingWhitepaper(false);
    setIsGeneratingManual(false);
    setIsGeneratingIdeaDiagram(false);
    setSelectedFilePath(null);
    
    // Reset generate mode state
    setIdeaPrompt('');
    setGeneratedDiagram('');
    setEditableGeneratedDiagram('');
    setGeneratedDocumentation('');
    setGeneratedWhitepaperContent('');
    setGeneratedSuperprompt('');
    setGeneratedMockup('');
    setGeneratedManual(null);
    setScaffoldingJob({ status: 'idle', progress: 0, currentTask: '', error: null, fileContents: null });
    
    // Reset generate mode loading states
    setIsLoadingSuperprompt(false);
    setIsLoadingGeneratedDiagram(false);
    setIsLoadingGeneratedDocumentation(false);
    setIsLoadingGeneratedWhitepaper(false);
    setIsLoadingMockup(false);
    setIsLoadingIdeaManual(false);


    if (diagramToTransfer) {
        setRenderedDiagramCode(diagramToTransfer);
        setEditableDiagramCode(diagramToTransfer);
        setAnalysisExplanation(t('diagramImportedFromIdea'));
        setAnalysisScope('');
    }
    
    setAppMode(mode);
  }

  const handleProjectUpdate = useCallback((contents: FileContents, projectName: string, isNewProject: boolean) => {
    if (isNewProject) {
        handleAppModeChange('analyze');
        setTimeout(() => {
            const tree = createFileTreeFromContents(projectName, contents);
            setFileTree(tree);
            setFileContents(contents);
            setActiveFileContents(contents);
        }, 100);
    } else {
        const tree = createFileTreeFromContents(projectName, contents);
        setFileTree(tree);
        setFileContents(contents);
        setActiveFileContents(contents);
    }
  }, []);

  // --- File Management Handlers ---
  const updateProjectState = (newFileContents: FileContents) => {
    setFileContents(newFileContents);
    // When a file is modified, the active content for analysis should also be updated.
    // This keeps the context fresh if the user decides to re-analyze.
    setActiveFileContents(newFileContents);
    if (fileTree) {
      const newFileTree = createFileTreeFromContents(fileTree.name, newFileContents);
      setFileTree(newFileTree);
    }
  };

  const handleFileClick = (path: string) => {
    setSelectedFilePath(path);
  };

  const handleCloseCodeEditor = () => {
    setSelectedFilePath(null);
  };

  const handleFileContentChange = (path: string, newContent: string) => {
    if (fileContents === null) return;
    const newFileContents = { ...fileContents, [path]: newContent };
    updateProjectState(newFileContents);
  };

  const handleCreateItem = (path: string, type: 'file' | 'directory') => {
    const name = prompt(t('enterNameFor', { type }));
    if (!name || !fileContents) return;
    if (name.includes('/') || name.includes('..')) {
      alert(t('invalidName'));
      return;
    }
    const newPath = path ? `${path}/${name}` : name;
    if (Object.keys(fileContents).some(p => p === newPath || p.startsWith(newPath + '/'))) {
      alert(t('itemExists'));
      return;
    }
    const newFileContents = { ...fileContents };
    if (type === 'file') {
      newFileContents[newPath] = '';
    } else {
      newFileContents[`${newPath}/.keep`] = '';
    }
    updateProjectState(newFileContents);
  };

  const handleRenameItem = (oldPath: string, type: 'file' | 'directory') => {
    const oldName = oldPath.split('/').pop() || '';
    const newName = prompt(t('enterNewNameFor', { name: oldName }), oldName);
    if (!newName || newName === oldName || !fileContents) return;
    if (newName.includes('/') || newName.includes('..')) {
      alert(t('invalidName'));
      return;
    }
    const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
    const newPath = parentPath ? `${parentPath}/${newName}` : newName;
    if (Object.keys(fileContents).some(p => p === newPath || p.startsWith(newPath + '/'))) {
      alert(t('itemExists'));
      return;
    }
    const newFileContents = { ...fileContents };
    if (type === 'file') {
      newFileContents[newPath] = newFileContents[oldPath];
      delete newFileContents[oldPath];
    } else {
      const prefix = oldPath + '/';
      Object.keys(newFileContents)
        .filter(p => p.startsWith(prefix))
        .forEach(p => {
          const newSubPath = p.replace(prefix, newPath + '/');
          newFileContents[newSubPath] = newFileContents[p];
          delete newFileContents[p];
        });
    }
    updateProjectState(newFileContents);
    if (analysisScope === oldPath) setAnalysisScope(newPath);
  };

  const handleDeleteItem = (path: string, type: 'file' | 'directory') => {
    const name = path.split('/').pop() || '';
    if (!confirm(t('confirmDelete', { name }))) return;
    if (!fileContents) return;
    const newFileContents = { ...fileContents };
    if (type === 'file') {
      delete newFileContents[path];
    } else {
      const prefix = path + '/';
      Object.keys(newFileContents)
        .filter(p => p.startsWith(prefix))
        .forEach(p => delete newFileContents[p]);
    }
    updateProjectState(newFileContents);
    if (analysisScope === path) setAnalysisScope('');
  };
    
  const handleDownloadProject = async () => {
    if (!fileContents || !fileTree) return;
    const zip = new JSZip();
    Object.entries(fileContents).forEach(([path, content]) => {
      if (!path.endsWith('/.keep')) {
        zip.file(path, content);
      }
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, `${fileTree.name}.zip`, 'application/zip');
  };

  const handleGenerateDiagramFromIdea = async (ideaPrompt: string) => {
      setIsGeneratingIdeaDiagram(true);
      setDiagramError(null);
      setAnalysisExplanation('');
      try {
          const diagramCode = await generateDiagramFromIdea(ideaPrompt, diagramType, language, diagrammingLanguage);
          setEditableDiagramCode(diagramCode);
          setRenderedDiagramCode(diagramCode);
          setAnalysisExplanation(t('diagramGeneratedFromIdea'));
          setAnalysisScope('');
      } catch (e: any) {
          console.error("Failed to generate diagram from idea:", e);
          setDiagramError(`${t('ideaGenerationFailed')}: ${e.message}`);
      } finally {
          setIsGeneratingIdeaDiagram(false);
      }
  };

  const handleClearDiagram = () => {
      setEditableDiagramCode('');
      setRenderedDiagramCode('');
      setAnalysisExplanation('');
      setDiagramError(null);
      setAnalysisScope(null);
      setSelectedFilePath(null);
  }

  const handleDiagramRegeneration = async (newType: DiagramType) => {
    if (!activeFileContents || analysisScope === null) {
        setDiagramType(newType);
        return;
    }

    setIsLoading(true);
    setDiagramError(null);
    setCorrectionAttempts(0);
    setDiagramType(newType);
    setSelectedFilePath(null);

    try {
        const result = await analyzeProject(activeFileContents, newType, language, diagrammingLanguage, analysisScope);
        setAnalysisExplanation(result.explanation);
        setRenderedDiagramCode(result.diagram);
        setEditableDiagramCode(result.diagram);
    } catch (e: any) {
        console.error("Failed to regenerate diagram:", e);
        setDiagramError(`${t('aiAnalysisFailed')}: ${e.message}`);
    } finally {
        setIsLoading(false);
    }
  };


  const renderContent = () => {
    switch (appMode) {
        case 'generate':
            return (
                <IdeaArchitect 
                    ideaPrompt={ideaPrompt}
                    onIdeaPromptChange={setIdeaPrompt}
                    onGenerateSuperprompt={handleGenerateSuperprompt}
                    isLoadingSuperprompt={isLoadingSuperprompt}
                    generatedSuperprompt={generatedSuperprompt}
                    
                    generatedDiagram={generatedDiagram}
                    editableGeneratedDiagram={editableGeneratedDiagram}
                    onEditableGeneratedDiagramChange={setEditableGeneratedDiagram}
                    onRenderGeneratedDiagram={handleGenerateRender}
                    onGenerateDiagram={handleGenerateGeneratedDiagram}
                    isLoadingDiagram={isLoadingGeneratedDiagram}

                    generatedDocumentation={generatedDocumentation}
                    onGenerateDocumentation={handleGenerateGeneratedDocumentation}
                    isLoadingDocumentation={isLoadingGeneratedDocumentation}
                    
                    generatedWhitepaper={generatedWhitepaperContent}
                    onGenerateWhitepaper={handleGenerateGeneratedWhitepaper}
                    isLoadingWhitepaper={isLoadingGeneratedWhitepaper}
                    
                    themeRevision={themeRevision}
                    downloadFile={downloadFile}
                    diagrammingLanguage={diagrammingLanguage}
                    
                    generatedMockup={generatedMockup}
                    isLoadingMockup={isLoadingMockup}
                    onGenerateMockup={handleGenerateMockup}
                    
                    generatedManual={generatedManual}
                    isLoadingManual={isLoadingIdeaManual}
                    onGenerateManual={handleGenerateIdeaManual}

                    scaffoldingJob={scaffoldingJob}
                    onGenerateScaffolding={handleGenerateScaffolding}
                />
            );
        case 'agentSystem':
            return (
                <AgentSystem 
                    onProjectUpdate={handleProjectUpdate} 
                    isProjectLoaded={!!fileTree}
                    fileContents={fileContents}
                    projectName={fileTree?.name ?? ''}
                    setAppMode={setAppMode}
                />
            );
        case 'businessPlan':
            return <BusinessPlanGenerator downloadFile={downloadFile} />;

        case 'pitchDeck':
            return <PitchDeckGenerator downloadFile={downloadFile} />;

        case 'startupPlanner':
            return <StartupPlanner downloadFile={downloadFile} />;

        case 'analyze':
        default:
            return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
                    <div className="lg:col-span-3 h-full min-h-0">
                      <FileExplorer 
                        fileTree={fileTree} 
                        onFileClick={handleFileClick} 
                        onAnalyzeDirectory={handleAnalyze}
                        analyzingPath={analyzingPath}
                        onCreateItem={handleCreateItem}
                        onRenameItem={handleRenameItem}
                        onDeleteItem={handleDeleteItem}
                       />
                    </div>
                    <div className="lg:col-span-4 h-full min-h-0">
                      {selectedFilePath && fileContents ? (
                        <CodeEditor
                          filePath={selectedFilePath}
                          content={fileContents[selectedFilePath] ?? ''}
                          onContentChange={(newContent) => handleFileContentChange(selectedFilePath, newContent)}
                          onClose={handleCloseCodeEditor}
                        />
                      ) : (
                        <DiagramEditor
                          code={editableDiagramCode}
                          onCodeChange={setEditableDiagramCode}
                          onRender={handleManualRender}
                          isLoading={isLoading || isGeneratingIdeaDiagram}
                          onGenerateFromIdea={handleGenerateDiagramFromIdea}
                          isGeneratingIdea={isGeneratingIdeaDiagram}
                          onClear={handleClearDiagram}
                        />
                      )}
                    </div>
                    <div className="lg:col-span-5 h-full min-h-0">
                      <DiagramViewer
                        key={`${themeRevision}-${diagrammingLanguage}`}
                        diagramCode={renderedDiagramCode}
                        diagrammingLanguage={diagrammingLanguage}
                        isLoading={isLoading || isGeneratingIdeaDiagram}
                        error={diagramError}
                        onFixError={handleCorrectError}
                        analysisExplanation={analysisExplanation}
                        analysisScope={analysisScope}
                        onRenderError={handleRenderError}
                        isCorrectionAllowed={correctionAttempts < MAX_CORRECTION_ATTEMPTS}
                        onGenerateDocs={handleGenerateDocs}
                        onGenerateWhitepaper={handleGenerateWhitepaper}
                        onGenerateManual={handleGenerateProjectManual}
                        isGeneratingDocs={isGeneratingDocs}
                        isGeneratingWhitepaper={isGeneratingWhitepaper}
                        isGeneratingManual={isGeneratingManual}
                        onGenerateProjectMarkdown={handleGenerateProjectMarkdown}
                        isProjectLoaded={!!fileTree}
                        onRegenerateDiagram={handleDiagramRegeneration}
                        currentDiagramType={diagramType}
                      />
                    </div>
                </div>
            );
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      <Header 
        onZipUpload={handleZipUpload} 
        onAnalyze={() => handleAnalyze()}
        onSettingsToggle={() => setIsSettingsOpen(true)}
        isProjectLoaded={!!fileTree}
        isLoading={isLoading && appMode === 'analyze'}
        appMode={appMode}
        onAppModeChange={handleAppModeChange}
        onDownloadProject={handleDownloadProject}
      />
      <main className="flex-grow min-h-0">
        {renderContent()}
      </main>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        themeSettings={themeSettings}
        onThemeChange={setThemeSettings}
        diagramType={diagramType}
        onDiagramTypeChange={setDiagramType}
        diagrammingLanguage={diagrammingLanguage}
        onDiagrammingLanguageChange={setDiagrammingLanguage}
      />
      {isManualModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsManualModalOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            {isGeneratingManual && (
                 <div className="flex flex-col items-center justify-center text-slate-400 bg-slate-800 p-12 rounded-lg">
                    <Icon type="spinner" className="w-12 h-12 text-sky-400" />
                    <p className="mt-4 text-lg">{t('generatingManual')}</p>
                </div>
            )}
            {generatedManual && !isGeneratingManual && (
                <ManualViewer manual={generatedManual} onDownload={downloadFile} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => (
    <I18nProvider>
        <MainApp />
    </I18nProvider>
);

export default App;

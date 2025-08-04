

import React, { useState, useMemo, useEffect } from 'react';
import Icon, { IconProps } from './Icon';
import { useTranslation } from '../hooks/useTranslation';
import DiagramEditor from './MermaidEditor';
import DiagramViewer from './DiagramViewer';
import { Language, DiagrammingLanguage, Manual, FileContents, FileNode, ScaffoldingJob } from '../types';
import FileExplorer from './FileExplorer';

declare const JSZip: any;

interface IdeaArchitectProps {
    ideaPrompt: string;
    onIdeaPromptChange: (prompt: string) => void;
    onGenerateSuperprompt: () => void;
    isLoadingSuperprompt: boolean;
    generatedSuperprompt: string;

    generatedDiagram: string;
    editableGeneratedDiagram: string;
    onEditableGeneratedDiagramChange: (code: string) => void;
    onRenderGeneratedDiagram: () => void;
    onGenerateDiagram: () => void;
    isLoadingDiagram: boolean;
    
    generatedDocumentation: string;
    onGenerateDocumentation: () => void;
    isLoadingDocumentation: boolean;
    
    generatedWhitepaper: string;
    onGenerateWhitepaper: () => void;
    isLoadingWhitepaper: boolean;

    themeRevision: number;
    downloadFile: (content: string | Blob, fileName: string, mimeType: string) => void;
    diagrammingLanguage: DiagrammingLanguage;
    
    generatedMockup: string;
    isLoadingMockup: boolean;
    onGenerateMockup: () => void;
    
    generatedManual: Manual | null;
    isLoadingManual: boolean;
    onGenerateManual: () => void;

    scaffoldingJob: ScaffoldingJob;
    onGenerateScaffolding: () => void;
}


type ActiveTab = 'superprompt' | 'diagram' | 'docs' | 'whitepaper' | 'scaffolding' | 'mockup' | 'manual';

const getFileIconType = (fileName: string) => {
    if (!fileName) return 'file';
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ts': case 'tsx': return 'typescript';
      case 'js': case 'jsx': return 'javascript';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'css': case 'scss': case 'less': return 'css';
      case 'html': return 'html';
      case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': return 'image';
      default: return 'file';
    }
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
        <div className="h-full flex flex-col bg-slate-900 rounded-lg">
             <div className="p-2 border-b border-slate-700 flex justify-end flex-shrink-0">
                 <div className="flex items-center space-x-2">
                    <button onClick={() => onDownload(generateHtml(), 'manual.html', 'text/html')} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-200 rounded-lg transition-colors duration-300">
                        <Icon type="html" className="w-5 h-5" />
                        <span>{t('downloadHTML')}</span>
                    </button>
                    <button onClick={() => onDownload(generateMarkdown(), 'manual.md', 'text/markdown')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors duration-300">
                        <Icon type="md" className="w-5 h-5" />
                        <span>{t('downloadMD')}</span>
                    </button>
                </div>
            </div>
            <div className="p-6 overflow-y-auto prose prose-invert prose-slate max-w-none prose-h1:text-cyan-400 prose-h2:text-teal-400 prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
                <p className="lead !my-2 !text-lg !text-slate-400">{manual.introduction}</p>
                {manual.sections.map((section, index) => (
                    <div key={index} className="mt-6">
                        <h2>{section.title}</h2>
                        <div className="text-slate-300" dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />') }} />
                    </div>
                ))}
            </div>
        </div>
    );
};


const IdeaArchitect: React.FC<IdeaArchitectProps> = (props) => {
    const { 
        ideaPrompt, onIdeaPromptChange, onGenerateSuperprompt, isLoadingSuperprompt, generatedSuperprompt,
        generatedDiagram, editableGeneratedDiagram, onEditableGeneratedDiagramChange, onRenderGeneratedDiagram, onGenerateDiagram, isLoadingDiagram,
        generatedDocumentation, onGenerateDocumentation, isLoadingDocumentation,
        generatedWhitepaper, onGenerateWhitepaper, isLoadingWhitepaper,
        themeRevision, downloadFile, diagrammingLanguage,
        generatedMockup, isLoadingMockup, onGenerateMockup,
        generatedManual, isLoadingManual, onGenerateManual,
        scaffoldingJob, onGenerateScaffolding
    } = props;
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<ActiveTab>('superprompt');

    const renderContent = () => {
        if (!generatedSuperprompt && !isLoadingSuperprompt) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center p-4">
                    <Icon type="analyze" className="w-20 h-20 mb-4 text-sky-400/50" />
                    <h2 className="text-2xl font-bold text-slate-300">{t('ideaArchitectWelcome')}</h2>
                    <p className="mt-2 max-w-xl">{t('planDescription')}</p>
                </div>
            );
        }

        if (isLoadingSuperprompt) {
             return (
                <div className="absolute inset-0 bg-slate-800/50 flex flex-col items-center justify-center z-10">
                    <Icon type="spinner" className="w-12 h-12 text-sky-400" />
                    <p className="mt-4 text-lg">{t('generatingPlan')}</p>
                </div>
            );
        }
        
        return (
            <div className="w-full h-full flex flex-col">
                <div className="flex-shrink-0 border-b border-slate-700">
                    <nav className="flex space-x-1 p-2 overflow-x-auto">
                        <TabButton id="superprompt" activeTab={activeTab} setActiveTab={setActiveTab} label={t('superprompt')} />
                        <TabButton id="diagram" activeTab={activeTab} setActiveTab={setActiveTab} label={t('diagram')} />
                        <TabButton id="docs" activeTab={activeTab} setActiveTab={setActiveTab} label={t('technicalDocumentation')} />
                        <TabButton id="whitepaper" activeTab={activeTab} setActiveTab={setActiveTab} label={t('exportWhitepaper')} />
                        <TabButton id="scaffolding" activeTab={activeTab} setActiveTab={setActiveTab} label={t('scaffolding')} />
                        <TabButton id="mockup" activeTab={activeTab} setActiveTab={setActiveTab} label={t('mockup')} />
                        <TabButton id="manual" activeTab={activeTab} setActiveTab={setActiveTab} label={t('userManual')} />
                    </nav>
                </div>
                <div className="flex-grow min-h-0 p-4">
                    {activeTab === 'superprompt' && generatedSuperprompt && (
                        <PromptViewer
                            markdownContent={generatedSuperprompt}
                            downloadFile={downloadFile}
                        />
                    )}
                    {activeTab === 'diagram' && (
                        <ArtifactGenerator 
                            isGenerated={!!generatedDiagram}
                            isLoading={isLoadingDiagram}
                            onGenerate={onGenerateDiagram}
                            generateButtonText={t('generateDiagram')}
                            generatingButtonText={t('generatingDiagram')}
                            description={t('diagramTabDescription')}
                            icon="render"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                                <DiagramEditor 
                                    code={editableGeneratedDiagram}
                                    onCodeChange={onEditableGeneratedDiagramChange}
                                    onRender={onRenderGeneratedDiagram}
                                    isLoading={isLoadingDiagram}
                                />
                                <DiagramViewer 
                                    key={`generate-${themeRevision}-${diagrammingLanguage}`}
                                    diagramCode={generatedDiagram}
                                    diagrammingLanguage={diagrammingLanguage}
                                    isLoading={isLoadingDiagram}
                                    error={null}
                                    onFixError={() => {}}
                                    onRenderError={() => {}}
                                    analysisExplanation=""
                                    analysisScope={t('architectFromIdea')}
                                    isCorrectionAllowed={false}
                                    onGenerateDocs={() => {}}
                                    onGenerateWhitepaper={() => {}}
                                    onGenerateManual={() => {}}
                                    isGeneratingDocs={false}
                                    isGeneratingWhitepaper={false}
                                    isGeneratingManual={false}
                                    onGenerateProjectMarkdown={() => {}}
                                    isProjectLoaded={false}
                                />
                            </div>
                        </ArtifactGenerator>
                    )}
                     {activeTab === 'docs' && (
                        <ArtifactGenerator 
                            isGenerated={!!generatedDocumentation}
                            isLoading={isLoadingDocumentation}
                            onGenerate={onGenerateDocumentation}
                            isGenerationDisabled={!generatedDiagram}
                            generateButtonText={t('generateDocs')}
                            generatingButtonText={t('generatingDocs')}
                            description={t('docsTabDescription')}
                            icon="documentation"
                        >
                             <HtmlViewer
                                htmlContent={generatedDocumentation}
                                onDownload={() => downloadFile(generatedDocumentation, 'technical-documentation.html', 'text/html;charset=utf-8')}
                            />
                        </ArtifactGenerator>
                    )}
                    {activeTab === 'whitepaper' && (
                        <ArtifactGenerator
                            isGenerated={!!generatedWhitepaper}
                            isLoading={isLoadingWhitepaper}
                            onGenerate={onGenerateWhitepaper}
                            isGenerationDisabled={!generatedDiagram}
                            generateButtonText={t('generateWhitepaper')}
                            generatingButtonText={t('generatingWhitepaper')}
                            description={t('whitepaperTabDescription')}
                            icon="whitepaper"
                        >
                            <HtmlViewer
                                htmlContent={generatedWhitepaper}
                                onDownload={() => downloadFile(generatedWhitepaper, 'project-whitepaper.html', 'text/html;charset=utf-8')}
                            />
                        </ArtifactGenerator>
                    )}
                    {activeTab === 'scaffolding' && (
                         <ScaffoldingTabContent
                            job={scaffoldingJob}
                            generatedScaffolding={scaffoldingJob.fileContents}
                            onGenerate={onGenerateScaffolding}
                            ideaPrompt={ideaPrompt}
                            downloadFile={downloadFile}
                         />
                    )}
                    {activeTab === 'mockup' && (
                         <ArtifactGenerator
                            isGenerated={!!generatedMockup}
                            isLoading={isLoadingMockup}
                            onGenerate={onGenerateMockup}
                            generateButtonText={t('generateMockup')}
                            generatingButtonText={t('generatingMockup')}
                            description={t('generateUIMockupDescription')}
                            icon="mockup"
                        >
                            <HtmlViewer htmlContent={generatedMockup} onDownload={() => downloadFile(generatedMockup, 'ui-mockup.html', 'text/html;charset=utf-8')} />
                        </ArtifactGenerator>
                    )}
                    {activeTab === 'manual' && (
                        <ArtifactGenerator
                            isGenerated={!!generatedManual}
                            isLoading={isLoadingManual}
                            onGenerate={onGenerateManual}
                            generateButtonText={t('generateUserManual')}
                            generatingButtonText={t('generatingManual')}
                            description={t('userManualDescription')}
                            icon="manual"
                        >
                             {generatedManual && <ManualViewer manual={generatedManual} onDownload={downloadFile} />}
                        </ArtifactGenerator>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            <div className="lg:col-span-4 h-full flex flex-col bg-slate-800/50 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-slate-100 mb-3">{t('architectFromIdea')}</h2>
                <textarea
                    value={ideaPrompt}
                    onChange={(e) => onIdeaPromptChange(e.target.value)}
                    className="w-full flex-grow p-4 bg-slate-900/70 border border-slate-700 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none font-mono text-sm text-slate-300 placeholder:text-slate-500"
                    placeholder={t('describeYourIdea')}
                />
                <button
                    onClick={onGenerateSuperprompt}
                    disabled={isLoadingSuperprompt || !ideaPrompt}
                    className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-sky-600 hover:bg-sky-500 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoadingSuperprompt ? (
                        <>
                            <Icon type="spinner" className="w-5 h-5"/>
                            <span>{t('generatingPlan')}</span>
                        </>
                    ) : (
                        <>
                            <Icon type="analyze" className="w-5 h-5"/>
                            <span>{t('generatePlan')}</span>
                        </>
                    )}
                </button>
            </div>
            <div className="lg:col-span-8 h-full bg-slate-800/50 rounded-lg relative">
                {renderContent()}
            </div>
        </div>
    );
};

interface ArtifactGeneratorProps {
    isGenerated: boolean;
    isLoading: boolean;
    isGenerationDisabled?: boolean;
    onGenerate: () => void;
    generateButtonText: string;
    generatingButtonText: string;
    description: string;
    icon: IconProps['type'];
    children?: React.ReactNode;
}

const ArtifactGenerator: React.FC<ArtifactGeneratorProps> = ({ isGenerated, isLoading, isGenerationDisabled, onGenerate, generateButtonText, generatingButtonText, description, icon, children }) => {
    if (isLoading) {
         return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Icon type="spinner" className="w-12 h-12 text-sky-400" />
                <p className="mt-4 text-lg">{generatingButtonText}</p>
            </div>
        );
    }

    if (!isGenerated) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Icon type={icon} className="w-20 h-20 mb-4 text-slate-500" />
                <h3 className="text-xl font-semibold text-slate-300">{generateButtonText}</h3>
                <p className="text-slate-400 mt-2 max-w-md">{description}</p>
                <button
                    onClick={onGenerate}
                    disabled={isGenerationDisabled}
                    className="mt-6 flex items-center justify-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Icon type="analyze" className="w-5 h-5"/>
                    <span>{generateButtonText}</span>
                </button>
            </div>
        );
    }
    
    return <>{children}</>;
}


interface TabButtonProps {
    id: ActiveTab;
    activeTab: ActiveTab;
    setActiveTab: (id: ActiveTab) => void;
    label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ id, activeTab, setActiveTab, label }) => {
    const isActive = activeTab === id;
    return (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex-shrink-0 ${
                isActive 
                ? 'bg-sky-600 text-white' 
                : 'text-slate-300 hover:bg-slate-700'
            }`}
        >
            {label}
        </button>
    );
};

interface HtmlViewerProps {
    htmlContent: string;
    onDownload: () => void;
}
const HtmlViewer: React.FC<HtmlViewerProps> = ({ htmlContent, onDownload }) => {
    const { t } = useTranslation();
    return (
        <div className="h-full flex flex-col bg-slate-900 rounded-lg">
             <div className="p-2 border-b border-slate-700 flex justify-end flex-shrink-0">
                <button 
                    onClick={onDownload} 
                    className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md font-semibold text-sm transition-colors"
                >
                    <Icon type="html" className="w-4 h-4"/>
                    <span>{t('downloadHTML')}</span>
                </button>
            </div>
            <div className="flex-grow w-full h-full min-h-0">
                <iframe
                    srcDoc={htmlContent}
                    className="w-full h-full border-0 bg-white"
                    sandbox="allow-scripts allow-same-origin"
                    title="Generated Content"
                />
            </div>
        </div>
    )
}

interface PromptViewerProps {
    markdownContent: string;
    downloadFile: (content: string, fileName: string, mimeType: string) => void;
}

const PromptViewer: React.FC<PromptViewerProps> = ({ markdownContent, downloadFile }) => {
    const { t, language } = useTranslation();

    const handleDownloadMd = () => {
        downloadFile(markdownContent, 'superprompt.md', 'text/markdown;charset=utf-8');
    };

    const handleDownloadHtml = () => {
        const html = `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Superprompt</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 1rem 2rem; background-color: #111827; color: #d1d5db; margin: 0;}
        main { max-width: 800px; margin: 2rem auto; }
        pre { white-space: pre-wrap; word-wrap: break-word; background: #1f2937; padding: 1.5em; border-radius: 8px; border: 1px solid #374151; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 14px; }
        h1 { color: #f9fafb; border-bottom: 1px solid #374151; padding-bottom: 0.5em;}
    </style>
</head>
<body>
    <main>
        <h1>Superprompt</h1>
        <pre>${markdownContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </main>
</body>
</html>`;
        downloadFile(html, 'superprompt.html', 'text/html;charset=utf-8');
    };

    return (
        <div className="h-full flex flex-col bg-slate-900 rounded-lg">
            <div className="p-2 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                <p className="text-sm text-slate-400 px-2 italic max-w-lg">{t('superpromptDescription')}</p>
                 <div className="flex items-center space-x-2">
                    <button 
                        onClick={handleDownloadMd} 
                        className="flex items-center space-x-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md font-semibold text-sm transition-colors"
                    >
                        <Icon type="md" className="w-4 h-4"/>
                        <span>{t('downloadMD')}</span>
                    </button>
                    <button 
                        onClick={handleDownloadHtml} 
                        className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md font-semibold text-sm transition-colors"
                    >
                        <Icon type="html" className="w-4 h-4"/>
                        <span>{t('downloadHTML')}</span>
                    </button>
                </div>
            </div>
            <div className="flex-grow w-full h-full min-h-0 p-4 overflow-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm text-slate-200">
                    {markdownContent}
                </pre>
            </div>
        </div>
    );
};

const ScaffoldingTabContent: React.FC<{
    job: ScaffoldingJob;
    generatedScaffolding: FileContents | null;
    onGenerate: () => void;
    ideaPrompt: string;
    downloadFile: (content: string | Blob, fileName: string, mimeType: string) => void;
}> = ({ job, generatedScaffolding, onGenerate, ideaPrompt, downloadFile }) => {
    const { t } = useTranslation();

    if (job.status === 'running') {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Icon type="spinner" className="w-12 h-12 text-sky-400" />
                <p className="mt-4 text-lg">{job.currentTask || t('generatingScaffolding')}</p>
                <div className="w-3/4 max-w-md bg-slate-700 rounded-full h-2.5 mt-4">
                    <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${job.progress}%` }}></div>
                </div>
            </div>
        );
    }
    
    if (job.status === 'failed') {
        return (
             <div className="h-full flex flex-col items-center justify-center text-red-400 p-4 text-center">
               <Icon type="fix" className="w-16 h-16 mb-4" />
               <h3 className="text-xl font-bold">{t('generationFailed')}</h3>
               <p className="text-sm font-mono mt-2 bg-slate-900/50 p-2 rounded max-w-full overflow-auto">{job.error}</p>
            </div>
        );
    }
    
    if (job.status === 'completed' && generatedScaffolding) {
        return (
            <ScaffoldingViewer
                generatedScaffolding={generatedScaffolding}
                ideaPrompt={ideaPrompt}
                downloadFile={downloadFile}
            />
        );
    }

    return (
        <ArtifactGenerator
            isGenerated={false}
            isLoading={false}
            onGenerate={onGenerate}
            generateButtonText={t('generateScaffolding')}
            generatingButtonText={t('generatingScaffolding')}
            description={t('scaffoldingDescription')}
            icon="scaffolding"
        />
    );
};


const createFileTreeFromContents = (projectName: string, contents: FileContents): FileNode => {
    const rootName = projectName.replace(/[\s_]+/g, '-').toLowerCase() || 'project';
    const root: FileNode = { name: rootName, path: '', type: 'directory', children: [] };
    
    const sortedPaths = Object.keys(contents).sort();

    sortedPaths.forEach((path) => {
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


interface ScaffoldingViewerProps {
    generatedScaffolding: FileContents | null;
    ideaPrompt: string;
    downloadFile: (content: string | Blob, fileName: string, mimeType: string) => void;
}

const ScaffoldingViewer: React.FC<ScaffoldingViewerProps> = ({ generatedScaffolding, ideaPrompt, downloadFile }) => {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [scaffoldingContents, setScaffoldingContents] = useState(generatedScaffolding);
    
    const fileTree = useMemo(() => {
        if (!scaffoldingContents) return null;
        const projectName = ideaPrompt.split(' ').slice(0, 5).join(' ');
        return createFileTreeFromContents(projectName, scaffoldingContents);
    }, [scaffoldingContents, ideaPrompt]);
    
     useEffect(() => {
        if (fileTree && !selectedFile) {
            const findFirstFile = (node: FileNode): string | null => {
                if (node.type === 'file') return node.path;
                if (node.children) {
                    for (const child of [...node.children].sort((a,b) => a.name.localeCompare(b.name)).sort((a,b) => a.type === 'directory' && b.type === 'file' ? -1 : 1)) {
                        const firstFile = findFirstFile(child);
                        if (firstFile) return firstFile;
                    }
                }
                return null;
            }
            const firstFile = findFirstFile(fileTree);
            if(firstFile && scaffoldingContents && scaffoldingContents[firstFile]) {
                setSelectedFile(firstFile);
            }
        }
        if (!fileTree) {
            setSelectedFile(null);
        }
    }, [fileTree, scaffoldingContents]);

    const handleFileSelect = (path: string) => {
        if(scaffoldingContents && scaffoldingContents[path] !== undefined) {
            setSelectedFile(path);
        }
    };
    
    const updateProjectState = (newFileContents: FileContents) => {
        setScaffoldingContents(newFileContents);
    };

    const handleCreateItem = (path: string, type: 'file' | 'directory') => {
        const name = prompt(t('enterNameFor', { type }));
        if (!name || !scaffoldingContents) return;
        if (name.includes('/') || name.includes('..')) {
          alert(t('invalidName'));
          return;
        }
        const newPath = path ? `${path}/${name}` : name;
        if (Object.keys(scaffoldingContents).some(p => p === newPath || p.startsWith(newPath + '/'))) {
          alert(t('itemExists'));
          return;
        }
        const newFileContents = { ...scaffoldingContents };
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
        if (!newName || newName === oldName || !scaffoldingContents) return;
        if (newName.includes('/') || newName.includes('..')) {
          alert(t('invalidName'));
          return;
        }
        const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
        const newPath = parentPath ? `${parentPath}/${newName}` : newName;
        if (Object.keys(scaffoldingContents).some(p => p === newPath || p.startsWith(newPath + '/'))) {
          alert(t('itemExists'));
          return;
        }
        const newFileContents = { ...scaffoldingContents };
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
        if(selectedFile === oldPath) setSelectedFile(newPath);
    };

    const handleDeleteItem = (path: string, type: 'file' | 'directory') => {
        const name = path.split('/').pop() || '';
        if (!confirm(t('confirmDelete', { name }))) return;
        if (!scaffoldingContents) return;
        const newFileContents = { ...scaffoldingContents };
        if (type === 'file') {
          delete newFileContents[path];
        } else {
          const prefix = path + '/';
          Object.keys(newFileContents)
            .filter(p => p.startsWith(prefix))
            .forEach(p => delete newFileContents[p]);
        }
        updateProjectState(newFileContents);
        if(selectedFile === path || selectedFile?.startsWith(path + '/')) {
            setSelectedFile(null);
        }
    };


    const handleDownloadZip = async () => {
        if (!scaffoldingContents || !fileTree) return;

        const zip = new JSZip();
        Object.entries(scaffoldingContents).forEach(([path, content]) => {
            if (!path.endsWith('/.keep')) {
                zip.file(path, content);
            }
        });
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadFile(zipBlob, `${fileTree.name}.zip`, 'application/zip');
    };

    if (!scaffoldingContents || !fileTree) {
        return <div>...</div>;
    }
    
    const selectedFileContent = scaffoldingContents[selectedFile ?? ''] ?? null;

    return (
        <div className="h-full flex flex-col bg-slate-900 rounded-lg">
             <div className="p-2 border-b border-slate-700 flex justify-end flex-shrink-0">
                <button 
                    onClick={handleDownloadZip} 
                    className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md font-semibold text-sm transition-colors"
                >
                    <Icon type="zip" className="w-4 h-4"/>
                    <span>{t('downloadScaffoldingZip')}</span>
                </button>
            </div>
            <div className="flex-grow w-full h-full min-h-0 grid grid-cols-12 gap-px bg-slate-700">
               <div className="col-span-4 bg-slate-800/60 overflow-y-auto">
                    <FileExplorer 
                        fileTree={fileTree} 
                        onFileClick={handleFileSelect} 
                        onAnalyzeDirectory={() => {}} 
                        analyzingPath={null}
                        onCreateItem={handleCreateItem}
                        onRenameItem={handleRenameItem}
                        onDeleteItem={handleDeleteItem}
                    />
               </div>
               <div className="col-span-8 bg-slate-900 flex flex-col">
                   {selectedFile ? (
                       <>
                           <div className="p-2 border-b border-slate-700 flex items-center space-x-2 flex-shrink-0 bg-slate-800/80">
                               <Icon type={getFileIconType(selectedFile)} className="w-5 h-5 flex-shrink-0 text-sky-400" />
                               <span className="text-sm font-mono text-slate-400">{selectedFile}</span>
                           </div>
                           <div className="flex-grow overflow-auto relative">
                               <pre className="p-4 text-xs font-mono text-slate-300 w-full h-full absolute inset-0">
                                   <code>
                                       {selectedFileContent ?? `// ${t('emptyFile')}`}
                                   </code>
                               </pre>
                           </div>
                       </>
                   ) : (
                       <div className="flex items-center justify-center h-full text-slate-500">
                           <p>{t('selectFileToView')}</p>
                       </div>
                   )}
               </div>
            </div>
        </div>
    );
}


export default IdeaArchitect;
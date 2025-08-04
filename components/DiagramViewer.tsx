
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Icon from './Icon';
import { useTranslation } from '../hooks/useTranslation';
import { DiagrammingLanguage, DiagramType } from '../types';

interface DiagramViewerProps {
  diagramCode: string;
  diagrammingLanguage: DiagrammingLanguage;
  isLoading: boolean;
  error: string | null;
  onFixError: () => void;
  analysisExplanation: string;
  analysisScope: string | null;
  onRenderError: (errorMessage: string | null) => void;
  isCorrectionAllowed: boolean;
  onGenerateDocs: () => void;
  onGenerateWhitepaper: () => void;
  onGenerateManual: () => void;
  isGeneratingDocs: boolean;
  isGeneratingWhitepaper: boolean;
  isGeneratingManual: boolean;
  onGenerateProjectMarkdown: () => void;
  isProjectLoaded: boolean;
  onRegenerateDiagram?: (newType: DiagramType) => void;
  currentDiagramType?: DiagramType;
}

declare const plantumlEncoder: any;

const DiagramViewer: React.FC<DiagramViewerProps> = ({ 
    diagramCode,
    diagrammingLanguage,
    isLoading, 
    error, 
    onFixError, 
    analysisExplanation, 
    analysisScope,
    onRenderError, 
    isCorrectionAllowed,
    onGenerateDocs,
    onGenerateWhitepaper,
    onGenerateManual,
    isGeneratingDocs,
    isGeneratingWhitepaper,
    isGeneratingManual,
    onGenerateProjectMarkdown,
    isProjectLoaded,
    onRegenerateDiagram,
    currentDiagramType,
}) => {
  const diagramContainerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isRenderLoading, setIsRenderLoading] = useState(false);
  const { t } = useTranslation();

  const renderMermaid = useCallback(async () => {
    if (!diagramContainerRef.current) return;
    
    setIsRenderLoading(true);
    diagramContainerRef.current.innerHTML = ''; 
    setSvgContent('');
    onRenderError(null);
    
    const renderId = 'mermaid-graph-' + Date.now();

    try {
      // @ts-ignore
      const { svg } = await window.mermaid.render(renderId, diagramCode);
      if (diagramContainerRef.current) {
        diagramContainerRef.current.innerHTML = svg;
        setSvgContent(svg);
      }
    } catch (e: any) {
      console.error("Mermaid rendering error:", e);
      onRenderError(e.message || 'Unknown Mermaid error');
    } finally {
        setIsRenderLoading(false);
    }
  }, [diagramCode, onRenderError]);
  
  const renderPlantUml = useCallback(async () => {
    if (!diagramContainerRef.current) return;

    setIsRenderLoading(true);
    diagramContainerRef.current.innerHTML = '';
    setSvgContent('');
    onRenderError(null);
    
    try {
        const encoded = plantumlEncoder.encode(diagramCode);
        const url = `https://www.plantuml.com/plantuml/svg/${encoded}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            // Try to extract a cleaner error message from the returned SVG.
            // PlantUML syntax errors return an SVG with a <text> element containing the error.
            const syntaxErrorMatch = errorText.match(/<text fill="#FF0000"[^>]*>\s*(Syntax Error\?.*?)<\/text>/s);
            let friendlyError;
            if (syntaxErrorMatch?.[1]) {
                friendlyError = syntaxErrorMatch[1].trim();
            } else {
                const genericErrorMatch = errorText.match(/<text fill="#FF0000"[^>]*>([^<]+)<\/text>/);
                if (genericErrorMatch?.[1]) {
                    friendlyError = `Syntax Error: ${genericErrorMatch[1].trim()}`;
                } else {
                    friendlyError = `PlantUML server responded with status ${response.status}. This often indicates a syntax error in the diagram code.`;
                }
            }
            throw new Error(friendlyError);
        }
        const svg = await response.text();

        if (diagramContainerRef.current) {
            diagramContainerRef.current.innerHTML = `<div class="w-full h-full bg-white">${svg}</div>`;
            setSvgContent(svg);
        }
    } catch (e: any) {
        console.error("PlantUML rendering error:", e);
        onRenderError(e.message || 'Failed to fetch PlantUML diagram.');
    } finally {
        setIsRenderLoading(false);
    }
  }, [diagramCode, onRenderError]);

  useEffect(() => {
    if (!diagramCode) {
      if (diagramContainerRef.current) diagramContainerRef.current.innerHTML = '';
      setSvgContent('');
      onRenderError(null);
      return;
    }

    if (diagrammingLanguage === 'mermaid') {
        renderMermaid();
    } else if (diagrammingLanguage === 'plantuml') {
        renderPlantUml();
    }
  }, [diagramCode, diagrammingLanguage, renderMermaid, renderPlantUml, onRenderError]);

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadPng = async () => {
    if (diagrammingLanguage === 'plantuml') {
      if (!diagramCode) return;
      try {
        const encoded = plantumlEncoder.encode(diagramCode);
        const url = `https://www.plantuml.com/plantuml/png/${encoded}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`PlantUML server responded with status ${response.status}`);
        }
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'diagram.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Failed to download PlantUML PNG:", error);
        alert("Failed to download PlantUML PNG.");
      }
    } else { // Mermaid
      const targetElement = diagramContainerRef.current?.firstChild as HTMLElement | null;
      if (targetElement) {
        // @ts-ignore
        window.html2canvas(targetElement, { backgroundColor: 'transparent' }).then(canvas => {
          const dataUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = 'diagram.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        });
      }
    }
  };

  const handleDownloadSvg = () => {
    if (svgContent) {
        downloadFile(svgContent, 'diagram.svg', 'image/svg+xml');
    }
  };

  const handleDownloadSource = () => {
    const extension = diagrammingLanguage === 'mermaid' ? 'md' : 'txt';
    const mimeType = 'text/plain;charset=utf-8';
    const content = diagrammingLanguage === 'mermaid' 
        ? `\`\`\`mermaid\n${diagramCode}\n\`\`\``
        : diagramCode;
    downloadFile(content, `diagram.${extension}`, mimeType);
  };
  
  const diagramTypes: {label: string, value: DiagramType}[] = [
    { label: t('classDiagram'), value: 'classDiagram' },
    { label: t('flowchart'), value: 'flowchart TD' },
    { label: t('sequenceDiagram'), value: 'sequenceDiagram' },
    { label: t('stateDiagram'), value: 'stateDiagram-v2' },
  ];

  const isDiagramExportDisabled = !svgContent || isLoading || !!error;
  const isGeneratorBusy = isGeneratingDocs || isGeneratingWhitepaper || isGeneratingManual;

  return (
    <div className="bg-slate-800/50 rounded-lg h-full flex flex-col relative">
      <div className="p-2 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
        <h2 className="text-lg font-semibold text-slate-100 p-2">{t('diagramViewer')}</h2>
        <div className="flex items-center space-x-2">
            {isProjectLoaded && onRegenerateDiagram && currentDiagramType && (
                 <div className="relative">
                    <select
                        title={t('changeDiagramType')}
                        value={currentDiagramType}
                        onChange={(e) => onRegenerateDiagram(e.target.value as DiagramType)}
                        disabled={isLoading}
                        className="bg-slate-700 hover:bg-slate-600 rounded-md font-semibold text-sm pl-3 pr-8 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                    >
                        {diagramTypes.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            )}
            <button title={t('exportPNG')} onClick={handleDownloadPng} disabled={isDiagramExportDisabled} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Icon type="png" className="w-5 h-5"/></button>
            <button title={t('exportSVG')} onClick={handleDownloadSvg} disabled={isDiagramExportDisabled} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Icon type="svg" className="w-5 h-5"/></button>
            <button title={t('downloadSourceCode')} onClick={handleDownloadSource} disabled={!diagramCode || isLoading} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Icon type="file" className="w-5 h-5"/></button>
            <button title={t('exportDocs')} onClick={onGenerateDocs} disabled={isDiagramExportDisabled || isGeneratorBusy} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isGeneratingDocs ? <Icon type="spinner" className="w-5 h-5"/> : <Icon type="documentation" className="w-5 h-5"/>}
            </button>
            <button title={t('exportWhitepaper')} onClick={onGenerateWhitepaper} disabled={isDiagramExportDisabled || isGeneratorBusy} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                 {isGeneratingWhitepaper ? <Icon type="spinner" className="w-5 h-5"/> : <Icon type="whitepaper" className="w-5 h-5"/>}
            </button>
             <button title={t('exportManual')} onClick={onGenerateManual} disabled={!isProjectLoaded || isLoading || isGeneratorBusy} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                 {isGeneratingManual ? <Icon type="spinner" className="w-5 h-5"/> : <Icon type="manual" className="w-5 h-5"/>}
            </button>
            <button title={t('exportProjectMarkdown')} onClick={onGenerateProjectMarkdown} disabled={!isProjectLoaded || isLoading} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <Icon type="md" className="w-5 h-5"/>
            </button>
        </div>
      </div>
      
      {analysisScope !== null && (
        <div className="flex-shrink-0 px-4 py-1.5 bg-slate-900/50 text-xs text-slate-400 border-b border-slate-700">
            <strong>{t('analysisScope')}:</strong> <span className="font-mono bg-slate-700/50 px-1 py-0.5 rounded">{analysisScope || t('projectRoot')}</span>
        </div>
      )}

      <div className="flex-grow p-4 overflow-auto relative min-h-0">
        {(isLoading || isRenderLoading) && (
          <div className="absolute inset-0 bg-slate-800/50 flex flex-col items-center justify-center z-10">
            <Icon type="spinner" className="w-12 h-12 text-sky-400" />
            <p className="mt-4 text-lg">{isLoading ? t('analyzingProject') : t('renderingDiagram')}</p>
          </div>
        )}
        {error && !isLoading && (
            <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-10 p-4 text-center">
                <h3 className="text-xl font-bold text-red-400 mb-2">{t('diagramError')}</h3>
                <div className="text-sm text-slate-400 mb-4 bg-slate-800 p-2 rounded w-full max-w-md max-h-48 overflow-auto font-mono text-left">{error}</div>
                {isCorrectionAllowed ? (
                     <button onClick={onFixError} disabled={isLoading} className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Icon type="fix" className="w-5 h-5" />
                        <span>{t('fixWithAI')}</span>
                    </button>
                ) : (
                    <div className="mt-4 p-3 bg-amber-900/50 border border-amber-600/50 rounded-md">
                        <p className="font-semibold text-amber-300">{t('aiCorrectionFailed')}</p>
                        <p className="text-amber-400 text-sm mt-1">
                           {t('aiCorrectionFailedMessage')}
                        </p>
                    </div>
                )}
            </div>
        )}
         {!diagramCode && !isLoading && !error && (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 mb-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 1.5m-5-1.5l1 1.5m-8.25-11.25h16.5" /></svg>
                 <p className="font-semibold text-lg">{t('diagramAppearHere')}</p>
                 <p className="text-sm">{t('uploadAndAnalyze')}</p>
            </div>
         )}
        <div ref={diagramContainerRef} className="w-full h-full flex items-center justify-center text-slate-200 [&>svg]:max-w-full [&>svg]:max-h-full [&>div]:max-w-full [&>div]:max-h-full [&>div]:w-full [&>div]:h-full [&>div>svg]:w-full [&>div>svg]:h-full"></div>
      </div>
       {analysisExplanation && !error && (
        <div className="p-4 border-t border-slate-700 bg-slate-900/30 text-sm text-slate-300 max-h-32 overflow-y-auto flex-shrink-0">
            <h3 className="font-semibold text-slate-100 mb-1">{t('aiAnalysis')}</h3>
            <p>{analysisExplanation}</p>
        </div>
       )}
    </div>
  );
};

export default DiagramViewer;
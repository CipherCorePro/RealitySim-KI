
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { FileContents, StartupPlanJob } from '../types';
import Icon, { IconProps } from './Icon';
import { runStartupPlanGeneration } from '../services/geminiService';
import { markdownToHtml } from '../utils/markdown';

declare const mammoth: any;
declare const XLSX: any;
declare const pdfjsLib: any;
declare const html2pdf: any;

interface StartupPlannerProps {
    downloadFile: (content: string | Blob, fileName: string, mimeType: string) => void;
}

const StartupPlanner: React.FC<StartupPlannerProps> = ({ downloadFile }) => {
    const { t, language } = useTranslation();
    const [job, setJob] = useState<StartupPlanJob>({ status: 'idle', progress: 0, error: null, result: null });
    const [parsedFileContents, setParsedFileContents] = useState<FileContents | null>(null);
    const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
    const planPreviewRef = useRef<HTMLDivElement>(null);

    const handleFileParse = async (files: FileList) => {
        setJob({ status: 'parsing', progress: 0, error: null, result: null });
        const contents: FileContents = {};
        const filesArray = Array.from(files);
        setSelectedFileNames(filesArray.map(f => f.name));

        for (let i = 0; i < filesArray.length; i++) {
            const file = filesArray[i];
            try {
                const text = await parseFile(file);
                contents[file.name] = text;
                setJob(prev => ({ ...prev, progress: Math.round(((i + 1) / filesArray.length) * 100) }));
            } catch (e: any) {
                console.error(`Error parsing ${file.name}:`, e);
                setJob(prev => ({ ...prev, status: 'failed', error: t('fileParseError', {fileName: file.name})}));
                return;
            }
        }
        
        setParsedFileContents(contents);
        setJob(prev => ({...prev, status: 'idle', progress: 100}));
    };
    
    const parseFile = async (file: File): Promise<string> => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        
        if (['jpg', 'jpeg', 'png'].includes(extension || '')) {
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
                reader.onloadend = () => {
                    if (reader.error) return reject(reader.error);
                    const base64String = (reader.result as string).split(',')[1];
                    resolve(`[IMAGE:${file.type};base64,${base64String}]`);
                };
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });
        }

        const arrayBuffer = await file.arrayBuffer();
        switch (extension) {
            case 'docx': return (await mammoth.extractRawText({ arrayBuffer })).value;
            case 'xlsx':
                const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
                return workbook.SheetNames.map(name => XLSX.utils.sheet_to_csv(workbook.Sheets[name])).join('\n');
            case 'pdf':
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map((item: any) => item.str).join(' ') + '\n';
                }
                return text;
            case 'md':
            case 'html':
            case 'txt':
            case 'json':
                return new TextDecoder().decode(arrayBuffer);
            default:
                throw new Error(t('unsupportedFileType', {fileName: file.name}));
        }
    }

    const handleGenerate = async () => {
        if (!parsedFileContents) {
            alert(t('noFilesForPlan'));
            return;
        }
        setJob({ status: 'generating', progress: 0, error: null, result: null });
        
        try {
            for await (const update of runStartupPlanGeneration(parsedFileContents, language)) {
                setJob(prev => ({...prev, ...update}));
            }
        } catch (e: any) {
            console.error(e);
            setJob(prev => ({...prev, status: 'failed', error: e.message}));
        }
    };
    
    const handleReset = () => {
        setJob({ status: 'idle', progress: 0, error: null, result: null });
        setParsedFileContents(null);
        setSelectedFileNames([]);
    };

    const isIdle = job.status === 'idle';
    const isProcessing = job.status === 'parsing' || job.status === 'generating';

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-slate-800/50 rounded-xl shadow-2xl p-8 flex flex-col gap-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-white text-center mb-2">{t('startupPlannerTitle')}</h1>
                    <p className="text-center text-slate-400 mb-6 max-w-2xl mx-auto">{t('uploadStartupDocsDescription')}</p>
                    <FileUploader onFileParse={handleFileParse} isProcessing={isProcessing} selectedFileNames={selectedFileNames} />
                </div>

                {isProcessing && <JobProgressView job={job} />}

                {job.status === 'completed' && job.result && <PlanPreview planContent={job.result} downloadFile={downloadFile} onReset={handleReset} previewRef={planPreviewRef}/>}
                
                {job.status === 'failed' && job.error && (
                     <div className="text-red-400 p-4 bg-red-900/30 rounded-lg text-center flex flex-col items-center gap-4">
                        <div>
                            <p className="font-bold">{t('startupPlanFailed')}</p>
                            <p>{job.error}</p>
                        </div>
                        <button onClick={handleReset} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold">{t('reset')}</button>
                    </div>
                )}

                {isIdle && parsedFileContents && (
                    <button 
                        onClick={handleGenerate} 
                        className="w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-300 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                       <Icon type="analyze" className="w-5 h-5" />
                       {t('generateStartupPlan')}
                    </button>
                )}
            </div>
        </div>
    );
};

const FileUploader: React.FC<{onFileParse: (files: FileList) => void; isProcessing: boolean; selectedFileNames: string[]}> = ({ onFileParse, isProcessing, selectedFileNames }) => {
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        onFileParse(files);
    }
    
    const getFileIcon = (fileName: string): IconProps['type'] => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        if (['pdf'].includes(ext)) return 'pdf';
        if (['doc', 'docx'].includes(ext)) return 'docx';
        if (['xls', 'xlsx'].includes(ext)) return 'xlsx';
        if (['jpg', 'jpeg', 'png', 'svg', 'gif'].includes(ext)) return 'image';
        return 'file';
    }

    return (
        <div>
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 text-center ${dragOver ? 'border-sky-400 bg-sky-900/30' : 'border-slate-600 hover:border-slate-500'}`}
            >
                <input type="file" multiple ref={fileInputRef} onChange={e => handleFiles(e.target.files)} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.md,.html,.txt,.json,.png,.jpg,.jpeg" disabled={isProcessing} />
                <Icon type="upload" className="w-10 h-10 mx-auto text-slate-500 mb-2" />
                <p className="font-semibold text-slate-300">Click to upload or drag and drop files</p>
            </div>
             {selectedFileNames.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-sm font-semibold text-slate-400 mb-2">Selected Files:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {selectedFileNames.map(fileName => (
                            <div key={fileName} className="bg-slate-700/50 p-2 rounded-md flex items-center gap-2 text-sm">
                                <Icon type={getFileIcon(fileName)} className="w-5 h-5 text-sky-400 flex-shrink-0" />
                                <span className="truncate text-slate-300">{fileName}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const JobProgressView: React.FC<{job: StartupPlanJob}> = ({ job }) => {
    const { t } = useTranslation();
    const statusMessage = job.status === 'parsing' ? t('parsingFiles') : t('generatingStartupPlan');

    return (
        <div className="bg-slate-900/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">{t('status')}</h3>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-2">
                <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${job.progress}%` }}></div>
            </div>
            <p className="text-slate-400 text-sm">{statusMessage}</p>
        </div>
    );
}

const PlanPreview: React.FC<{ planContent: string; downloadFile: (...args: any[]) => void; onReset: () => void; previewRef: React.RefObject<HTMLDivElement> }> = ({ planContent, downloadFile, onReset, previewRef }) => {
    const { t } = useTranslation();

    const handleDownloadPdf = () => {
        const element = previewRef.current;
        if (element) {
            const opt = {
                margin:       0.5,
                filename:     'startup-plan.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        }
    };

    return (
        <div className="bg-slate-900/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-200">{t('startupPlanPreview')}</h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => downloadFile(markdownToHtml(planContent, t('startupPlanPreview')), 'startup-plan.html', 'text/html')} className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-md flex items-center gap-2"><Icon type="html" className="w-4 h-4"/> {t('downloadHTML')}</button>
                    <button onClick={() => downloadFile(planContent, 'startup-plan.md', 'text/markdown')} className="px-3 py-1.5 text-sm bg-slate-600 hover:bg-slate-500 rounded-md flex items-center gap-2"><Icon type="md" className="w-4 h-4"/> {t('downloadMD')}</button>
                    <button onClick={handleDownloadPdf} className="px-3 py-1.5 text-sm bg-slate-600 hover:bg-slate-500 rounded-md flex items-center gap-2"><Icon type="pdf" className="w-4 h-4"/> {t('downloadPDF')}</button>
                </div>
            </div>
            <div ref={previewRef} className="bg-white p-8 rounded-md max-h-[60vh] overflow-y-auto">
                <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(planContent, t('startupPlanPreview')).match(/<div class="[^"]*prose[^"]*">([\s\S]*)<\/div>/i)?.[1] || '' }}
                ></div>
            </div>
        </div>
    );
};

export default StartupPlanner;

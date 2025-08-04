import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { AgentJob, FileContents, AppMode } from '../types';
import Icon from './Icon';
import { runAgenticGeneration, runDebuggingAgent } from '../services/geminiService';

interface AgentSystemProps {
    onProjectUpdate: (fileContents: FileContents, projectName: string, isNewProject: boolean) => void;
    isProjectLoaded: boolean;
    fileContents: FileContents | null;
    projectName: string;
    setAppMode: (mode: AppMode) => void;
}

const AgentSystem: React.FC<AgentSystemProps> = ({ onProjectUpdate, isProjectLoaded, fileContents, projectName, setAppMode }) => {
    const { t, language } = useTranslation();
    const [prompt, setPrompt] = useState<string>('');
    const [job, setJob] = useState<AgentJob | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        const newJob: AgentJob = {
            id: new Date().toISOString(),
            status: 'running',
            progress: 0,
            currentTask: t('initializing'),
            logs: [{ agent: 'System', message: 'jobStarted', timestamp: new Date().toISOString() }],
            fileContents: null,
            error: null,
            type: 'generate'
        };
        setJob(newJob);

        try {
            let finalProjectName = 'generated-project';
            for await (const update of runAgenticGeneration(prompt, language)) {
                if (update.logs && update.logs[0]?.agent === 'Planner Agent') {
                    // This part assumes the Planner Agent's first log message contains the project name
                    // and that the message itself is a translation key with a 'projectName' replacement.
                    // If the geminiService sends a full sentence, this regex might need adjustment
                    // or the geminiService should be updated to send structured log messages.
                    const match = update.logs[0].message.match(/"([^"]+)"/); // Extracting name from a potential "Project plan created for "ProjectName""
                    if (match) finalProjectName = match[1];
                }

                setJob(prevJob => {
                    if (!prevJob) return null;
                    const updatedLogs = update.logs ? [...prevJob.logs, ...update.logs] : prevJob.logs;
                    const newJobState = { ...prevJob, ...update, logs: updatedLogs };

                    if (newJobState.status === 'completed' && newJobState.fileContents) {
                        onProjectUpdate(newJobState.fileContents, finalProjectName, true);
                    }
                    return newJobState;
                });
            }
        } catch (error: any) {
            setJob(prevJob => prevJob ? { ...prevJob, status: 'failed', error: error.message } : null);
        }
    };

    const handleDebug = async () => {
        if (!prompt.trim() || !fileContents) return;
        
        const newJob: AgentJob = {
            id: new Date().toISOString(),
            status: 'running',
            progress: 0,
            currentTask: t('initializing'),
            logs: [{ agent: 'System', message: 'debugJobStarted', timestamp: new Date().toISOString() }],
            fileContents: fileContents,
            error: null,
            type: 'debug'
        };
        setJob(newJob);

        try {
            for await (const update of runDebuggingAgent(prompt, fileContents, language)) {
                 setJob(prevJob => {
                    if (!prevJob) return null;
                    const updatedLogs = update.logs ? [...prevJob.logs, ...update.logs] : prevJob.logs;
                    const newJobState = { ...prevJob, ...update, logs: updatedLogs };

                    if (newJobState.fileContents && newJobState.status === 'running') {
                       onProjectUpdate(newJobState.fileContents, projectName, false);
                    }
                     if (newJobState.status === 'completed' && newJobState.fileContents) {
                        onProjectUpdate(newJobState.fileContents, projectName, false);
                    }
                    return newJobState;
                });
            }
        } catch (error: any) {
            setJob(prevJob => prevJob ? { ...prevJob, status: 'failed', error: error.message } : null);
        }
    }

    const handleClearJob = () => {
        setJob(null);
        setPrompt('');
    };
    
    if (job) {
         return <JobStatusView job={job} onClearJob={handleClearJob} setAppMode={setAppMode} />;
    }

    const title = isProjectLoaded ? t('debuggingAgent') : t('agentSystemTitle');
    const description = isProjectLoaded ? t('debuggingAgentDescription') : t('agentSystemDescriptionShort');
    const placeholder = isProjectLoaded ? t('describeBugPlaceholder') : t('agentSystemPromptPlaceholder');
    const buttonText = isProjectLoaded ? t('startDebugging') : t('generateProject');
    const handleSubmit = isProjectLoaded ? handleDebug : handleGenerate;


    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="w-full max-w-3xl bg-slate-800/50 rounded-xl shadow-2xl p-8">
                 <h1 className="text-4xl font-extrabold text-white text-center mb-4">{title}</h1>
                 <p className="text-center text-slate-400 mb-8 max-w-xl mx-auto">{description}</p>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="w-full">
                     <textarea
                        className="w-full p-3 mb-4 bg-slate-900/70 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        rows={8}
                        placeholder={placeholder}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-md text-white font-semibold transition-colors bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 disabled:cursor-not-allowed"
                        disabled={!prompt.trim()}
                    >
                        {buttonText}
                    </button>
                </form>
            </div>
        </div>
    );
};

interface JobStatusViewProps {
    job: AgentJob;
    onClearJob: () => void;
    setAppMode: (mode: AppMode) => void;
}

const JobStatusView: React.FC<JobStatusViewProps> = ({ job, onClearJob, setAppMode }) => {
    const { t } = useTranslation();
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [job?.logs]);

    const statusColor = job.status === 'completed' ? 'text-green-400' : job.status === 'failed' ? 'text-red-400' : 'text-yellow-400';
    const isDebugJob = job.type === 'debug';
    
    const handleFinishAndReset = () => {
        const wasDebugSuccess = job.status === 'completed' && job.type === 'debug';
        onClearJob();
        if (wasDebugSuccess) {
            setAppMode('analyze');
        }
    };

    return (
        <div className="h-full flex flex-col gap-4 p-4 bg-slate-900 rounded-lg">
            <header className="flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-100">{t('jobStatusTitle')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm">
                    <p><strong>{t('status')}:</strong> <span className={statusColor}>{job.status}</span></p>
                    <p><strong>{t('progress')}:</strong> {job.progress}%</p>
                    <p><strong>{t('currentTask')}:</strong> {job.currentTask}</p>
                </div>
                 {job.status === 'running' && (
                    <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
                        <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${job.progress}%` }}></div>
                    </div>
                )}
            </header>

            <main className="flex-grow flex flex-col bg-slate-800/50 rounded-lg p-2 min-h-0">
                 {job.status === 'completed' ? (
                     <div className="flex flex-col items-center justify-center h-full text-center text-green-400 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-2xl font-bold">{isDebugJob ? t('fixApplied') : t('generationComplete')}</h3>
                        {isDebugJob ? 
                            <button onClick={handleFinishAndReset} className="mt-4 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-white font-semibold">{t('openInEditor')}</button>
                            : <p className="text-slate-400 mt-2">{t('openingInEditor')}</p>
                        }
                    </div>
                 ) : job.status === 'failed' ? (
                     <div className="flex items-center justify-center h-full text-red-400 p-4 text-center flex-col">
                           <Icon type="fix" className="w-16 h-16 mb-4" />
                           <h3 className="text-xl font-bold">{t('generationFailed')}</h3>
                           <p className="text-sm font-mono mt-2 bg-slate-900/50 p-2 rounded max-w-full overflow-auto">{job.error}</p>
                     </div>
                 ) : (
                    <>
                        <h3 className="font-semibold text-slate-200 mb-2 px-2 flex-shrink-0">{t('logs')}</h3>
                        <div className="overflow-y-auto flex-grow pr-2">
                            {job.logs.map((log, index) => (
                                <div key={index} className="text-xs font-mono mb-1">
                                <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()} </span>
                                <span className="text-slate-300 ml-1">{t(log.message, log.replacements)}</span>
                                </div>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </>
                 )}
            </main>
            
            {(job.status === 'failed' || (job.status === 'completed' && isDebugJob)) && (
                 <footer className="flex-shrink-0">
                     <button
                        onClick={handleFinishAndReset}
                        className="w-full py-2 px-4 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-md transition-colors"
                    >
                       {job.status === 'completed' ? t('openInEditor') : t('startNewProject')}
                    </button>
                 </footer>
            )}
        </div>
    );
};


export default AgentSystem;

import React, { useState, useEffect, useMemo } from 'react';
import type { WorldState, FullHistoricalReport } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { X, ClipboardList, History, Download, BarChart2, TrendingUp, BrainCircuit } from './IconComponents';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

type Tab = 'current' | 'history' | 'development';

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-700/80 backdrop-blur-sm p-3 border border-slate-600 rounded-md text-sm shadow-lg">
                <p className="label text-slate-200 font-bold">{`Step: ${label}`}</p>
                {payload.map((item: any) => (
                    <p key={item.name} style={{ color: item.color }}>{`${item.name}: ${item.value.toFixed(2)}`}</p>
                ))}
            </div>
        );
    }
    return null;
};


const DevelopmentChart: React.FC<{ reports: FullHistoricalReport[] }> = ({ reports }) => {
    const t = useTranslations();

    const chartData = useMemo(() => {
        return reports
            .sort((a, b) => a.analysisData.timestamp - b.analysisData.timestamp)
            .map(report => ({
                step: report.analysisData.timestamp,
                [t('analysis_dev_totalAgents')]: report.analysisData.agentStats.total,
                [t('analysis_dev_avgWealth')]: report.analysisData.economicStats.avgWealth,
                [t('analysis_dev_friendships')]: report.analysisData.socialStats.friendshipNetwork.reduce((sum, a) => sum + a.friendCount, 0) / (report.analysisData.socialStats.friendshipNetwork.length || 1),
            }));
    }, [reports, t]);

    if (chartData.length < 2) {
        return <div className="flex items-center justify-center h-full text-slate-400">{t('analysis_dev_notEnoughData')}</div>
    }

    return (
        <div className="w-full h-96 pr-4">
            <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="step" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey={t('analysis_dev_totalAgents')} stroke="#38bdf8" strokeWidth={2} />
                    <Line type="monotone" dataKey={t('analysis_dev_avgWealth')} stroke="#34d399" strokeWidth={2} />
                    <Line type="monotone" dataKey={t('analysis_dev_friendships')} stroke="#f472b6" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

interface AnalysisReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportHtml: string | null;
    historicalReports: FullHistoricalReport[];
    onViewReport: (id: number) => void;
    onDownloadReport: (id: number | 'current') => void;
    worldState: WorldState;
    isAnalyzing: boolean;
}

export const AnalysisReportModal: React.FC<AnalysisReportModalProps> = ({ isOpen, onClose, reportHtml, historicalReports, onViewReport, onDownloadReport, worldState, isAnalyzing }) => {
    const [activeTab, setActiveTab] = useState<Tab>('current');
    const t = useTranslations();

    useEffect(() => {
        if (isOpen) {
            setActiveTab('current');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const tabs: { id: Tab, label: string, icon: React.ReactNode }[] = [
        { id: 'current', label: t('analysis_tab_current'), icon: <ClipboardList className="w-4 h-4 mr-2"/> },
        { id: 'history', label: t('analysis_tab_history'), icon: <History className="w-4 h-4 mr-2"/> },
        { id: 'development', label: t('analysis_tab_development'), icon: <TrendingUp className="w-4 h-4 mr-2"/> },
    ];
    
    const sortedHistory = [...historicalReports].sort((a,b) => b.timestamp - a.timestamp);

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-850 p-4 rounded-lg border border-slate-700 w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-teal-400"/>
                        {t('analysis_title')}
                    </h2>
                    <button onClick={() => onDownloadReport('current')} disabled={!reportHtml || isAnalyzing} className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-3 rounded-md transition-colors flex items-center gap-2 text-sm disabled:bg-slate-600">
                        <Download className="w-4 h-4"/> {t('analysis_download')}
                    </button>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-200 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-shrink-0 border-b border-slate-700">
                    <div className="flex -mb-px">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-center px-4 py-3 border-b-2 text-sm font-medium transition-colors
                                    ${activeTab === tab.id
                                        ? 'border-teal-500 text-teal-400'
                                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                                    }`}
                            >
                                {tab.icon}{tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto mt-4">
                    {activeTab === 'current' && (
                        isAnalyzing ? (
                             <div className="flex flex-col items-center justify-center h-full">
                                <BrainCircuit className="w-16 h-16 text-teal-400 animate-pulse" />
                                <p className="text-lg text-slate-300 mt-4 animate-pulse">{t('analysis_generating')}</p> 
                            </div>
                        ) : reportHtml ? (
                            <iframe srcDoc={reportHtml} className="w-full h-full border-0 bg-slate-200 rounded"/>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">{t('analysis_no_report')}</div>
                        )
                    )}
                    {activeTab === 'history' && (
                        <div className="space-y-2">
                             {sortedHistory.length > 0 ? sortedHistory.map(report => (
                                <div key={report.id} className="bg-slate-800 p-3 rounded-md flex justify-between items-center">
                                    <span className="font-mono text-slate-300">
                                        {t('analysis_report_from')} {new Date(report.timestamp).toLocaleString()} (Step: {report.analysisData.timestamp})
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => onViewReport(report.id)} className="text-xs py-1 px-3 bg-sky-600 hover:bg-sky-500 rounded">{t('analysis_view')}</button>
                                        <button onClick={() => onDownloadReport(report.id)} className="text-xs py-1 px-3 bg-emerald-600 hover:bg-emerald-500 rounded">{t('analysis_download')}</button>
                                    </div>
                                </div>
                            )) : <div className="text-center text-slate-400 p-8">{t('analysis_no_history')}</div>}
                        </div>
                    )}
                    {activeTab === 'development' && (
                       <DevelopmentChart reports={historicalReports} />
                    )}
                </div>
            </div>
        </div>
    );
};
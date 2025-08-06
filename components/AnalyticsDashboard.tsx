
import React, { useState, useMemo } from 'react';
import type { WorldState, Agent, Transaction, Culture } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { BarChart2, X, Users, CircleDollarSign, Map as MapIcon, BookOpenCheck, Download } from './IconComponents';
import { TranslationKey } from '../translations';

type Tab = 'social' | 'economic' | 'cultural' | 'tech';

const cultureColors: { [key: string]: string } = {
    'culture-utopian': 'rgba(56, 189, 248, 0.5)', // sky-400
    'culture-primitivist': 'rgba(52, 211, 153, 0.5)', // emerald-400
    'default': 'rgba(148, 163, 184, 0.5)', // slate-400
};

// --- Social Network Graph ---
const SocialNetworkGraph: React.FC<{ agents: Agent[], cultures: Culture[] }> = ({ agents, cultures }) => {
    const t = useTranslations();

    const handleDownloadInteractiveMap = () => {
        const liveAgents = agents.filter(a => a.isAlive);

        const nodes = liveAgents.map(agent => ({
          id: agent.id,
          label: agent.name,
          group: agent.cultureId || 'unaffiliated',
          title: `Age: ${agent.age.toFixed(1)}, Role: ${t(`role_${(agent.role || 'none').toLowerCase()}` as TranslationKey)}`
        }));
        
        const edges: any[] = [];
        const processedPairs = new Set<string>();
        liveAgents.forEach(agentA => {
            if (!agentA.relationships) return;
            Object.entries(agentA.relationships).forEach(([agentBId, relationship]) => {
                const pairKey = [agentA.id, agentBId].sort().join('-');
                const agentB = liveAgents.find(a => a.id === agentBId);
                if (!agentB || processedPairs.has(pairKey) || relationship.score <= 25) return;
                
                processedPairs.add(pairKey);

                let edgeColor = { color: 'rgba(107, 114, 128, 0.7)' };
                if (relationship.type === 'spouse' || relationship.type === 'partner') edgeColor = { color: 'rgba(236, 72, 153, 0.8)' };
                else if (relationship.type === 'friend') edgeColor = { color: 'rgba(16, 185, 129, 0.7)' };
                else if (relationship.type === 'rival') edgeColor = { color: 'rgba(239, 68, 68, 0.7)' };

                edges.push({
                    from: agentA.id,
                    to: agentBId,
                    value: relationship.score / 20,
                    title: `${t(`relationship_${relationship.type}` as TranslationKey)} (${relationship.score.toFixed(0)})`,
                    color: edgeColor
                });
            });
        });
        
        const visCultureColors: { [key: string]: { background: string, border: string } } = {
            'culture-utopian': { background: '#38bdf8', border: '#0284c7' },
            'culture-primitivist': { background: '#34d399', border: '#059669' },
        };
        const groupOptions = cultures.reduce((acc, culture) => {
            acc[culture.id] = visCultureColors[culture.id] || { background: '#94a3b8', border: '#64748b' };
            return acc;
        }, {} as any);
        groupOptions['unaffiliated'] = { color: { background: '#94a3b8', border: '#64748b' }};

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Social Network</title>
    <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
    <style>
        html, body { margin: 0; padding: 0; overflow: hidden; width: 100%; height: 100%; background-color: #111827; }
        #network { width: 100%; height: 100%; }
    </style>
</head>
<body>
    <div id="network"></div>
    <script type="text/javascript">
        const nodes = new vis.DataSet(${JSON.stringify(nodes, null, 2)});
        const edges = new vis.DataSet(${JSON.stringify(edges, null, 2)});
        const container = document.getElementById('network');
        const data = { nodes, edges };
        const options = {
            nodes: {
                shape: 'dot',
                size: 16,
                font: { size: 14, color: '#e2e8f0' },
                borderWidth: 2
            },
            edges: {
                width: 2,
                smooth: { type: 'continuous' }
            },
            groups: ${JSON.stringify(groupOptions, null, 2)},
            physics: {
                solver: 'forceAtlas2Based',
                forceAtlas2Based: {
                    gravitationalConstant: -50,
                    centralGravity: 0.01,
                    springLength: 200,
                    springConstant: 0.08,
                    avoidOverlap: 0.5
                },
                stabilization: { iterations: 150 }
            },
            interaction: {
                tooltipDelay: 300,
                hideEdgesOnDrag: true,
                zoomView: true,
                dragView: true
            }
        };
        const network = new vis.Network(container, data, options);
    </script>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'interactive_social_network.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900/50 rounded-lg">
            <BarChart2 className="w-16 h-16 text-slate-600 mb-4" />
            <p className="text-slate-300 mb-6 max-w-md">
                {t('analytics_social_download_desc')}
            </p>
            <button
                onClick={handleDownloadInteractiveMap}
                disabled={agents.filter(a => a.isAlive).length === 0}
                className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                <Download className="w-5 h-5"/>
                {t('analytics_social_download_btn')}
            </button>
        </div>
    );
};


// --- Economic Flow (Sankey-like) ---
const EconomicFlowDiagram: React.FC<{ transactions: Transaction[], agents: Agent[], currentTime: number }> = ({ transactions, agents, currentTime }) => {
    const t = useTranslations();
    const [timeWindow, setTimeWindow] = useState(100);

    const filteredTransactions = transactions.filter(tx => tx.step >= currentTime - timeWindow);

    const flows = useMemo(() => {
        const flowMap: { [key: string]: number } = {};
        filteredTransactions.forEach(tx => {
            if (tx.item === 'currency') {
                const key = `${tx.from} -> ${tx.to}`;
                flowMap[key] = (flowMap[key] || 0) + tx.quantity;
            }
        });
        return Object.entries(flowMap).map(([key, value]) => {
            const [from, to] = key.split(' -> ');
            return { from, to, value };
        });
    }, [filteredTransactions]);

    if (flows.length === 0) {
         return (
            <div className="flex flex-col items-center p-8">
                 <p className="text-slate-400 text-center mb-4">{t('analytics_eco_no_transactions')}</p>
                 <label className="text-sm text-slate-300">{t('analytics_time_window')}: {timeWindow}</label>
                 <input type="range" min="10" max={currentTime > 10 ? currentTime : 10} step="10" value={timeWindow} onChange={e => setTimeWindow(parseInt(e.target.value))} className="w-64 mt-2" />
            </div>
        );
    }
    
    const agentNameMap = agents.reduce((acc, agent) => ({...acc, [agent.id]: agent.name}), {} as {[id: string]: string});

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-center items-center gap-4">
                 <label className="text-sm text-slate-300">{t('analytics_time_window')}: {timeWindow}</label>
                 <input type="range" min="10" max={currentTime > 10 ? currentTime : 10} step="10" value={timeWindow} onChange={e => setTimeWindow(parseInt(e.target.value))} className="w-64" />
            </div>
            <div className="space-y-2">
                {flows.sort((a,b) => b.value - a.value).slice(0, 20).map((flow, i) => ( // Show top 20 flows
                    <div key={i} className="flex items-center justify-between bg-slate-800/50 p-2 rounded-md">
                        <span className="font-mono text-cyan-400 truncate w-1/3 text-left">{agentNameMap[flow.from] || flow.from}</span>
                        <div className="flex-grow mx-4 h-1 bg-slate-700 rounded-full flex items-center">
                            <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (flow.value / 500) * 100)}%` }}></div>
                            <span className="text-xs text-emerald-300 ml-2">{flow.value}$</span>
                        </div>
                        <span className="font-mono text-purple-400 truncate w-1/3 text-right">{agentNameMap[flow.to] || flow.to}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Cultural Spread Map ---
const CulturalSpreadMap: React.FC<{ agents: Agent[], cultures: Culture[], environment: WorldState['environment'] }> = ({ agents, cultures, environment }) => {
    const gridDivisions = 10;
    const cellWidth = 100 / gridDivisions;
    const cellHeight = 100 / gridDivisions;

    const culturalDensity = useMemo(() => {
        const grid: { [cultureId: string]: number }[][] = Array.from({ length: gridDivisions }, () => 
            Array.from({ length: gridDivisions }, () => ({}))
        );

        agents.forEach(agent => {
            if (agent.isAlive && agent.cultureId) {
                const gridX = Math.floor((agent.x / environment.width) * gridDivisions);
                const gridY = Math.floor((agent.y / environment.height) * gridDivisions);
                if (grid[gridY] && grid[gridY][gridX]) {
                    grid[gridY][gridX][agent.cultureId] = (grid[gridY][gridX][agent.cultureId] || 0) + 1;
                }
            }
        });
        return grid;
    }, [agents, environment.width, environment.height]);

    return (
        <div className="relative w-full aspect-square bg-slate-900/50 border border-slate-700 rounded-md">
            {culturalDensity.map((row, y) => 
                row.map((cell, x) => {
                    const dominantCulture = Object.keys(cell).length > 0 
                        ? Object.entries(cell).sort((a, b) => b[1] - a[1])[0][0] 
                        : null;
                    
                    if (!dominantCulture) return null;

                    return (
                        <div
                            key={`${x}-${y}`}
                            className="absolute rounded-sm"
                            style={{
                                left: `${x * cellWidth}%`,
                                top: `${y * cellHeight}%`,
                                width: `${cellWidth}%`,
                                height: `${cellHeight}%`,
                                backgroundColor: cultureColors[dominantCulture] || cultureColors.default,
                                opacity: 0.6,
                            }}
                        ></div>
                    );
                })
            )}
        </div>
    );
};

// --- Technology Chart ---
const TechnologyChart: React.FC<{ cultures: Culture[], techTree: WorldState['techTree'] }> = ({ cultures, techTree }) => {
     const t = useTranslations();
    return (
        <div className="p-4 space-y-4">
            <h3 className="text-md font-semibold text-slate-100">{t('analytics_tech_progress')}</h3>
            <div className="space-y-6">
                {cultures.map(culture => (
                    <div key={culture.id}>
                        <h4 className="text-sm font-bold text-sky-300">{culture.name}</h4>
                        <p className="text-xs text-slate-400 mb-2">{t('admin_researchPoints')}: {culture.researchPoints.toFixed(0)}</p>
                        <div className="space-y-3">
                            {techTree.map(tech => {
                                const isKnown = culture.knownTechnologies.includes(tech.id);
                                const progress = isKnown ? 100 : Math.min(100, (culture.researchPoints / tech.researchCost) * 100);
                                const hasRequired = tech.requiredTech ? tech.requiredTech.every(req => culture.knownTechnologies.includes(req)) : true;
                                
                                return (
                                    <div key={tech.id} className={!hasRequired ? 'opacity-50' : ''}>
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="text-slate-300">{t(`tech_${tech.id}` as any) || tech.name}</span>
                                            <span className="text-slate-400">{tech.researchCost} RP</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${isKnown ? 'bg-green-500' : 'bg-purple-500 transition-all duration-300'}`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                         {!hasRequired && <p className="text-red-400 text-xs mt-1">Requires: {tech.requiredTech?.map(tId => t(`tech_${tId}` as any) || tId).join(', ')}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface AnalyticsDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    worldState: WorldState;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isOpen, onClose, worldState }) => {
    const [activeTab, setActiveTab] = useState<Tab>('social');
    const t = useTranslations();

    if (!isOpen) {
        return null;
    }

    const tabs: { id: Tab, label: string, icon: React.ReactNode }[] = [
        { id: 'social', label: t('analytics_tab_social'), icon: <Users className="w-4 h-4 mr-2"/> },
        { id: 'economic', label: t('analytics_tab_economic'), icon: <CircleDollarSign className="w-4 h-4 mr-2"/> },
        { id: 'cultural', label: t('analytics_tab_cultural'), icon: <MapIcon className="w-4 h-4 mr-2"/> },
        { id: 'tech', label: t('analytics_tab_tech'), icon: <BookOpenCheck className="w-4 h-4 mr-2"/> },
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-850 p-4 rounded-lg border border-slate-700 w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <BarChart2 className="w-6 h-6 text-purple-400"/>
                        {t('analytics_title')}
                    </h2>
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
                                        ? 'border-sky-500 text-sky-400'
                                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                                    }`}
                            >
                                {tab.icon}{tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto mt-4">
                    {activeTab === 'social' && <SocialNetworkGraph agents={worldState.agents} cultures={worldState.cultures} />}
                    {activeTab === 'economic' && <EconomicFlowDiagram transactions={worldState.transactions || []} agents={worldState.agents} currentTime={worldState.environment.time} />}
                    {activeTab === 'cultural' && <CulturalSpreadMap agents={worldState.agents} cultures={worldState.cultures} environment={worldState.environment} />}
                    {activeTab === 'tech' && <TechnologyChart cultures={worldState.cultures} techTree={worldState.techTree} />}
                </div>
            </div>
        </div>
    );
};

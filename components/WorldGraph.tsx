
import React from 'react';
import type { Agent, Entity, EnvironmentState, Culture } from '../types';
import { Share2, Home, User, Skull, Award, HeartPulse, FlaskConical, Apple, Droplet, Log, PlusSquare } from './IconComponents';
import { useTranslations } from '../hooks/useTranslations';

interface WorldGraphProps {
    agents: Agent[];
    entities: Entity[];
    environment: EnvironmentState;
    cultures: Culture[];
}

const getEntityIcon = (entity: Entity) => {
    if (entity.isResource) {
        switch (entity.resourceType) {
            case 'food':
                return Apple;
            case 'water':
                return Droplet;
            case 'wood':
                return Log;
            case 'medicine':
                return PlusSquare;
            default:
                return Home;
        }
    }
    switch (entity.name.toLowerCase()) {
        case 'haus':
        case 'house':
        case 'shelter':
            return Home;
        default:
            return Home;
    }
}

const getRoleIcon = (role: string | null) => {
    switch (role) {
        case 'Leader':
            return Award;
        case 'Healer':
            return HeartPulse;
        case 'Scientist':
            return FlaskConical;
        default:
            return null;
    }
}


const cultureColors: { [key: string]: string } = {
    'culture-utopian': '#38bdf8', // sky-400
    'culture-primitivist': '#34d399', // emerald-400
};

export const WorldGraph: React.FC<WorldGraphProps> = ({ agents, entities, environment, cultures }) => {
    const t = useTranslations();

    const { width, height } = environment;
    const viewboxWidth = 500;
    const viewboxHeight = 500;
    const cellWidth = viewboxWidth / width;
    const cellHeight = viewboxHeight / height;

    const relationshipLines: { x1: number, y1: number, x2: number, y2: number, opacity: number, key: string, type: string }[] = [];
    const processedPairs = new Set<string>();

    agents.forEach(agentA => {
        if (!agentA.relationships || !agentA.isAlive) return;
        Object.keys(agentA.relationships).forEach(agentBId => {
            const pairKey = [agentA.id, agentBId].sort().join('-');
            if (processedPairs.has(pairKey)) return;

            const agentB = agents.find(a => a.id === agentBId);
            if (!agentB || !agentB.isAlive) return;
            
            const relationship = agentA.relationships[agentBId];
            if (relationship && relationship.score > 20) { 
                relationshipLines.push({
                    x1: agentA.x * cellWidth + cellWidth / 2,
                    y1: agentA.y * cellHeight + cellHeight / 2,
                    x2: agentB.x * cellWidth + cellWidth / 2,
                    y2: agentB.y * cellHeight + cellHeight / 2,
                    opacity: Math.max(0.1, (relationship.score) / 100),
                    key: pairKey,
                    type: relationship.type
                });
            }
            processedPairs.add(pairKey);
        });
    });

    return (
        <div className="bg-slate-850 p-4 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-sky-400"/>
                    {t('worldGraph_title')}
                </h2>
                <div className="flex items-center gap-4 text-xs">
                    {(cultures || []).map(culture => (
                        <div key={culture.id} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cultureColors[culture.id] || '#94a3b8' }}></div>
                            <span>{culture.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-slate-900/50 rounded-md aspect-square overflow-hidden">
                <svg width="100%" height="100%" viewBox={`0 0 ${viewboxWidth} ${viewboxHeight}`}>
                    {/* Grid Lines */}
                    {Array.from({ length: width + 1 }).map((_, i) => (
                        <line key={`v-${i}`} x1={i * cellWidth} y1="0" x2={i * cellWidth} y2={viewboxHeight} stroke="#334155" strokeWidth="0.5" />
                    ))}
                    {Array.from({ length: height + 1 }).map((_, i) => (
                        <line key={`h-${i}`} x1="0" y1={i * cellHeight} x2={viewboxWidth} y2={i * cellHeight} stroke="#334155" strokeWidth="0.5" />
                    ))}

                    {/* Relationship lines */}
                    {relationshipLines.map(line => {
                        let strokeColor = "rgba(107, 114, 128, 0.7)";
                        let strokeDash = "2 3";
                        let strokeW = "1";
                        switch (line.type) {
                            case 'partner':
                            case 'spouse':
                                strokeColor = "rgba(236, 72, 153, 0.8)"; // pink
                                strokeDash = "none";
                                strokeW = "1.5";
                                break;
                            case 'friend':
                                strokeColor = "rgba(16, 185, 129, 0.7)"; // green
                                strokeDash = "none";
                                break;
                            case 'rival':
                                strokeColor = "rgba(239, 68, 68, 0.7)"; // red
                                strokeDash = "4 4";
                                break;
                        }

                        return (
                            <line
                                key={line.key}
                                x1={line.x1} y1={line.y1}
                                x2={line.x2} y2={line.y2}
                                stroke={strokeColor}
                                strokeWidth={strokeW}
                                strokeDasharray={strokeDash}
                                opacity={line.opacity}
                            />
                        )
                    })}


                    {/* Entities */}
                    {entities.map(entity => {
                        const Icon = getEntityIcon(entity);
                        const iconSize = Math.min(cellWidth, cellHeight) * 0.6;
                        const x = entity.x * cellWidth + (cellWidth - iconSize) / 2;
                        const y = entity.y * cellHeight + (cellHeight - iconSize) / 2;
                        return (
                            <g key={entity.id} transform={`translate(${x}, ${y})`}>
                               <title>{entity.name}{entity.isResource ? ` (${entity.quantity})` : ''}</title>
                               <Icon width={iconSize} height={iconSize} className="text-emerald-400" />
                            </g>
                        )
                    })}
                    
                    {/* Agents */}
                    {agents.map(agent => {
                        const agentIconSize = Math.min(cellWidth, cellHeight) * 0.7;
                        const cx = agent.x * cellWidth + cellWidth / 2;
                        const cy = agent.y * cellHeight + cellHeight / 2;
                        const x = cx - agentIconSize / 2;
                        const y = cy - agentIconSize / 2;
                        const AgentIcon = agent.isAlive ? User : Skull;
                        const cultureColor = agent.cultureId ? cultureColors[agent.cultureId] : 'transparent';
                        const RoleIcon = agent.isAlive ? getRoleIcon(agent.role) : null;
                        const roleIconSize = agentIconSize * 0.5;

                        return (
                            <g key={agent.id} transform={`translate(${x}, ${y})`}>
                                <title>{agent.name} ({agent.health.toFixed(0)} HP, {agent.age.toFixed(1)} yrs)</title>
                                {agent.isAlive && agent.cultureId && (
                                     <circle cx={agentIconSize/2} cy={agentIconSize/2} r={agentIconSize/2 + 3} fill={cultureColor} opacity="0.3" />
                                )}
                                <AgentIcon width={agentIconSize} height={agentIconSize} className={agent.adminAgent ? 'text-red-400' : 'text-sky-400'} opacity={agent.isAlive ? 1 : 0.6} />
                                {RoleIcon && (
                                    <g transform={`translate(${agentIconSize - roleIconSize/2}, ${-roleIconSize/2})`}>
                                        <circle cx={roleIconSize/2} cy={roleIconSize/2} r={roleIconSize/2 + 1} fill="#1e293b" />
                                        <RoleIcon width={roleIconSize} height={roleIconSize} className="text-yellow-400" />
                                    </g>
                                )}
                                <text
                                    x={agentIconSize/2}
                                    y={agentIconSize + 5}
                                    fill={agent.isAlive ? "#cbd5e1" : "#64748b"}
                                    fontSize="8"
                                    textAnchor="middle"
                                >
                                    {agent.name.substring(0,3)}
                                </text>
                            </g>
                        );
                    })}

                </svg>
            </div>
        </div>
    );
};
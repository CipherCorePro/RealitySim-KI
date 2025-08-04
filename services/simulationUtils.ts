import type { Agent, Entity, EnvironmentState } from '../types';

export function findNearestEntity(agent: Agent, entities: Map<string, Entity>, filter: (e: Entity) => boolean): Entity | null {
    let nearest: Entity | null = null;
    let minDistance = Infinity;

    for (const entity of entities.values()) {
        if (filter(entity)) {
            const distance = Math.sqrt(Math.pow(agent.x - entity.x, 2) + Math.pow(agent.y - entity.y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                nearest = entity;
            }
        }
    }
    return nearest;
}

export function findNearestAgent(agent: Agent, agents: Map<string, Agent>, filter: (a: Agent) => boolean): Agent | null {
    let nearest: Agent | null = null;
    let minDistance = Infinity;

    for (const otherAgent of agents.values()) {
        if (agent.id !== otherAgent.id && filter(otherAgent)) {
            const distance = Math.sqrt(Math.pow(agent.x - otherAgent.x, 2) + Math.pow(agent.y - otherAgent.y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                nearest = otherAgent;
            }
        }
    }
    return nearest;
}

export function moveTowards(agent: Agent, target: { x: number, y: number }, environment: EnvironmentState) {
    const dx = target.x - agent.x;
    const dy = target.y - agent.y;
    const speed = agent.genome.includes("G-AGILE") ? 2 : 1;

    let moveX = 0;
    let moveY = 0;

    if (Math.abs(dx) > Math.abs(dy)) {
        moveX = Math.sign(dx) * speed;
    } else {
        moveY = Math.sign(dy) * speed;
    }

    agent.x += moveX;
    agent.y += moveY;

    agent.x = Math.max(0, Math.min(environment.width - 1, agent.x));
    agent.y = Math.max(0, Math.min(environment.height - 1, agent.y));
}

export function wander(agent: Agent, environment: EnvironmentState) {
    const direction = Math.floor(Math.random() * 4);
    switch (direction) {
        case 0: agent.y = Math.max(0, agent.y - 1); break; // North
        case 1: agent.y = Math.min(environment.height - 1, agent.y + 1); break; // South
        case 2: agent.x = Math.min(environment.width - 1, agent.x + 1); break; // East
        case 3: agent.x = Math.max(0, agent.x - 1); break; // West
    }
    return { log: { key: 'log_action_wander_thoughtfully', params: { agentName: agent.name } } };
}

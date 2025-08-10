import type { Action, Agent, Entity, WorldState, ActionContext, Law, Technology, MediaBroadcast } from '../types';
import { findNearestEntity, findNearestAgent, moveTowards, wander } from './simulationUtils';
import { 
    EAT_HUNGER_REDUCTION, DRINK_THIRST_REDUCTION, GATHER_AMOUNT, FATIGUE_RECOVERY_RATE, 
    STRESS_RECOVERY_REST, WORK_FOR_MONEY_AMOUNT, FACTORY_WAGE,
    RESOURCE_PURCHASE_COST, RECIPES, RESEARCH_PER_ACTION, MIN_REPRODUCTION_AGE,
    MAX_REPRODUCTION_AGE, MAX_OFFSPRING, ADOLESCENCE_MAX_AGE
} from '../constants';
import { generateAgentConversation, generateNewTechnology, generateNewLaw, generateNewReligion } from '../services/geminiService';
import { jensenShannonDivergence } from './statisticsUtils';

const moveAction = (direction: 'North' | 'South' | 'East' | 'West'): Action => ({
    name: `Move ${direction}`,
    description: `Move one step ${direction.toLowerCase()}.`,
    execute: async (agent, allAgents, allEntities, worldState) => {
        const speed = agent.genome.includes("G-AGILE") ? 2 : 1;
        switch (direction) {
            case 'North': agent.y = Math.max(0, agent.y - speed); break;
            case 'South': agent.y = Math.min(worldState.environment.height - 1, agent.y + speed); break;
            case 'East': agent.x = Math.min(worldState.environment.width - 1, agent.x + speed); break;
            case 'West': agent.x = Math.max(0, agent.x - speed); break;
        }
        return { log: { key: 'log_action_move', params: { agentName: agent.name, direction: direction.toLowerCase(), x: agent.x, y: agent.y } }, status: 'neutral', reward: -0.1 };
    }
});

export const availableActions: Action[] = [
    // --- Survival Actions ---
    {
        name: 'Eat Food',
        description: 'Eat food from inventory to reduce hunger.',
        onSuccess: { belief: 'planning_ahead_good', delta: 0.02 },
        execute: async (agent) => {
            if ((agent.inventory['food'] || 0) > 0) {
                const hungerBefore = agent.hunger;
                agent.inventory['food']--;
                agent.hunger = Math.max(0, agent.hunger - EAT_HUNGER_REDUCTION);
                const reward = (hungerBefore - agent.hunger) / 10;
                return { log: { key: 'log_action_eat', params: { agentName: agent.name } }, status: 'success', reward };
            }
            return { log: { key: 'log_action_eat_no_food', params: { agentName: agent.name } }, status: 'failure', reward: -10 };
        }
    },
    {
        name: 'Drink Water',
        description: 'Find a water source and drink to reduce thirst.',
        execute: async (agent, allAgents, allEntities, worldState) => {
            const waterSource = findNearestEntity(agent, allEntities, e => e.isResource === true && e.resourceType === 'water' && e.quantity !== 0);
            if (waterSource && Math.sqrt(Math.pow(agent.x - waterSource.x, 2) + Math.pow(agent.y - waterSource.y, 2)) < 2) {
                const thirstBefore = agent.thirst;
                agent.thirst = Math.max(0, agent.thirst - DRINK_THIRST_REDUCTION);
                const reward = (thirstBefore - agent.thirst) / 10;
                return { log: { key: 'log_action_drink', params: { agentName: agent.name, sourceName: waterSource.name } }, status: 'success', reward };
            } else if (waterSource) {
                moveTowards(agent, waterSource, worldState.environment);
                return { log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: waterSource.name } }, status: 'neutral', reward: 0.5 };
            }
            return { log: { key: 'log_action_drink_no_source', params: { agentName: agent.name } }, status: 'failure', reward: -5 };
        }
    },
    {
        name: 'Gather Food',
        description: 'Gather food from a nearby source.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const foodSource = findNearestEntity(agent, allEntities, e => e.isResource === true && e.resourceType === 'food' && (e.quantity ?? 0) > 0);
            if (foodSource && Math.sqrt(Math.pow(agent.x - foodSource.x, 2) + Math.pow(agent.y - foodSource.y, 2)) < 2) {
                if (foodSource.ownerId && foodSource.ownerId !== agent.id) {
                    return { log: { key: 'log_action_gather_fail_private', params: { agentName: agent.name, resourceName: foodSource.name } }, status: 'failure', reward: -5 };
                }
                const amount = GATHER_AMOUNT;
                foodSource.quantity = Math.max(0, (foodSource.quantity || 0) - amount);
                agent.inventory['food'] = (agent.inventory['food'] || 0) + amount;
                agent.skills.farming = (agent.skills.farming || 0) + 0.5;
                context.logTransaction({ from: foodSource.id, to: agent.id, item: 'food', quantity: amount });
                return { log: { key: 'log_action_gather_food', params: { agentName: agent.name, amount, sourceName: foodSource.name } }, status: 'success', reward: 5 };
            } else if (foodSource) {
                 moveTowards(agent, foodSource, worldState.environment);
                 return { log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: foodSource.name } }, status: 'neutral', reward: 0.5 };
            }
            return { log: { key: 'log_action_gather_food_no_source', params: { agentName: agent.name } }, status: 'failure', reward: -2 };
        }
    },
     {
        name: 'Gather Wood',
        description: 'Gather wood from a nearby forest.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const woodSource = findNearestEntity(agent, allEntities, e => e.isResource === true && e.resourceType === 'wood' && (e.quantity ?? 0) > 0);
            if (woodSource && Math.sqrt(Math.pow(agent.x - woodSource.x, 2) + Math.pow(agent.y - woodSource.y, 2)) < 2) {
                if (woodSource.ownerId && woodSource.ownerId !== agent.id) {
                    return { log: { key: 'log_action_gather_fail_private', params: { agentName: agent.name, resourceName: woodSource.name }}, status: 'failure', reward: -5 };
                }
                const amount = GATHER_AMOUNT;
                woodSource.quantity = Math.max(0, (woodSource.quantity || 0) - amount);
                agent.inventory['wood'] = (agent.inventory['wood'] || 0) + amount;
                agent.skills.woodcutting = (agent.skills.woodcutting || 0) + 0.5;
                context.logTransaction({ from: woodSource.id, to: agent.id, item: 'wood', quantity: amount });
                return { log: { key: 'log_action_gather_wood', params: { agentName: agent.name, amount, sourceName: woodSource.name } }, status: 'success', reward: 5 };
            } else if (woodSource) {
                 moveTowards(agent, woodSource, worldState.environment);
                 return { log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: woodSource.name } }, status: 'neutral', reward: 0.5 };
            }
            return { log: { key: 'log_action_gather_wood_no_source', params: { agentName: agent.name } }, status: 'failure', reward: -2 };
        }
    },
    {
        name: 'Build Shelter',
        description: 'Build a small shelter using 10 wood.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const woodCost = 10;
            if ((agent.inventory['wood'] || 0) >= woodCost) {
                agent.inventory['wood'] -= woodCost;
                agent.skills.construction = (agent.skills.construction || 0) + 2;
                if (agent.cultureId) {
                    context.addResearchPoints(agent.cultureId, 5);
                }
                const newShelter: Partial<Entity> = {
                    name: `${agent.name}'s Shelter`,
                    description: 'A simple, self-made shelter.',
                    x: agent.x,
                    y: agent.y,
                    ownerId: agent.id,
                };
                return { 
                    log: { key: 'log_action_build_shelter', params: { agentName: agent.name } },
                    sideEffects: { createEntity: newShelter },
                    status: 'success',
                    reward: 20
                };
            }
            return { log: { key: 'log_action_build_shelter_no_wood', params: { agentName: agent.name, woodCost } }, status: 'failure', reward: -2 };
        }
    },
    {
        name: 'Rest',
        description: 'Rest to recover fatigue and health.',
        execute: async (agent) => {
            let healthGain = 10;
            if (agent.genome.includes("G-FASTHEAL")) healthGain = 15;
            const healthBefore = agent.health;
            agent.health = Math.min(100, agent.health + healthGain);
            const fatigueBefore = agent.fatigue;
            agent.fatigue = Math.max(0, agent.fatigue - FATIGUE_RECOVERY_RATE);
            agent.stress = Math.max(0, agent.stress - STRESS_RECOVERY_REST);
            
            const reward = ((agent.health - healthBefore) + (fatigueBefore - agent.fatigue)) / 10;
            
            if (agent.sickness && Math.random() < 0.2) {
                const curedSickness = agent.sickness;
                agent.sickness = null;
                return { log: { key: 'log_action_rest_and_cured', params: { agentName: agent.name, sickness: curedSickness } }, status: 'success', reward: reward + 30 };
            }

            return { log: { key: 'log_action_rest', params: { agentName: agent.name, newHealth: agent.health.toFixed(0) } }, status: 'success', reward };
        }
    },

    // --- Economic Actions ---
    {
        name: 'Work for money',
        description: 'Perform a day of generic labor to earn a small amount of currency.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            agent.currency += WORK_FOR_MONEY_AMOUNT;
            agent.fatigue = Math.min(100, agent.fatigue + 20);
            context.logTransaction({ from: 'WORLD', to: agent.id, item: 'currency', quantity: WORK_FOR_MONEY_AMOUNT });
            return { log: { key: 'log_action_work_for_money', params: { agentName: agent.name, amount: WORK_FOR_MONEY_AMOUNT }}, status: 'success', reward: WORK_FOR_MONEY_AMOUNT / 2 };
        }
    },
    {
        name: 'Found Company',
        description: "Buy an unowned resource-producing entity to become an entrepreneur.",
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const property = findNearestEntity(agent, allEntities, e => e.isResource && !e.ownerId);
            if (property && agent.currency >= RESOURCE_PURCHASE_COST) {
                agent.currency -= RESOURCE_PURCHASE_COST;
                property.ownerId = agent.id;
                agent.role = 'Entrepreneur';
                agent.socialStatus = Math.min(100, agent.socialStatus + 15);
                context.logTransaction({ from: agent.id, to: 'WORLD', item: 'currency', quantity: RESOURCE_PURCHASE_COST });
                return { log: { key: 'log_action_found_company_success', params: { agentName: agent.name, resourceName: property.name, cost: RESOURCE_PURCHASE_COST }}, status: 'success', reward: 50 };
            }
            if (!property) {
                return { log: { key: 'log_action_found_company_fail_none', params: { agentName: agent.name }}, status: 'failure', reward: -5 };
            }
            return { log: { key: 'log_action_found_company_fail_funds', params: { agentName: agent.name, cost: RESOURCE_PURCHASE_COST }}, status: 'failure', reward: -5 };
        }
    },
    {
        name: 'Work for Company',
        description: "Work at a privately owned company to earn a wage from the owner.",
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const company = findNearestEntity(agent, allEntities, e => !!e.isResource && !!e.ownerId && e.ownerId !== agent.id);
            if (!company) {
                return { log: { key: 'log_action_work_for_company_fail_none', params: { agentName: agent.name }}, status: 'failure', reward: -2 };
            }

            if ((company.quantity || 0) <= 0) {
                return { log: { key: 'log_action_work_for_company_fail_no_resources', params: { agentName: agent.name, resourceName: company.name }}, status: 'failure', reward: -2 };
            }
            
            const owner = allAgents.get(company.ownerId!);
            if (!owner) {
                return { log: { key: 'log_action_work_for_company_fail_no_owner', params: { agentName: agent.name }}, status: 'failure', reward: -2 };
            }
            
            if (owner.currency < FACTORY_WAGE) {
                return { log: { key: 'log_action_work_for_company_fail_owner_broke', params: { agentName: agent.name, ownerName: owner.name }}, status: 'failure', reward: -2 };
            }

            owner.currency -= FACTORY_WAGE;
            agent.currency += FACTORY_WAGE;
            agent.fatigue = Math.min(100, agent.fatigue + 15);
            owner.inventory[company.resourceType!] = (owner.inventory[company.resourceType!] || 0) + GATHER_AMOUNT;
            company.quantity = Math.max(0, company.quantity! - GATHER_AMOUNT);

            context.logTransaction({ from: owner.id, to: agent.id, item: 'currency', quantity: FACTORY_WAGE });
            context.logTransaction({ from: company.id, to: owner.id, item: company.resourceType!, quantity: GATHER_AMOUNT });

            return { log: { key: 'log_action_work_for_company_success', params: { agentName: agent.name, resourceName: company.name, ownerName: owner.name, wage: FACTORY_WAGE }}, status: 'success', reward: FACTORY_WAGE / 2 };
        }
    },
    {
        name: 'Mine Iron',
        description: 'Mine iron from a nearby ore vein.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const ironSource = findNearestEntity(agent, allEntities, e => e.isResource === true && e.resourceType === 'iron' && (e.quantity ?? 0) > 0);
            if (ironSource && Math.sqrt(Math.pow(agent.x - ironSource.x, 2) + Math.pow(agent.y - ironSource.y, 2)) < 2) {
                if (ironSource.ownerId && ironSource.ownerId !== agent.id) {
                    return { log: { key: 'log_action_gather_fail_private', params: { agentName: agent.name, resourceName: ironSource.name } }, status: 'failure', reward: -5 };
                }
                const amount = GATHER_AMOUNT;
                ironSource.quantity = Math.max(0, (ironSource.quantity || 0) - amount);
                agent.inventory['iron'] = (agent.inventory['iron'] || 0) + amount;
                agent.skills.mining = (agent.skills.mining || 0) + 0.5;
                context.logTransaction({ from: ironSource.id, to: agent.id, item: 'iron', quantity: amount });
                return { log: { key: 'log_action_mine_iron', params: { agentName: agent.name, amount, sourceName: ironSource.name } }, status: 'success', reward: 5 };
            } else if (ironSource) {
                 moveTowards(agent, ironSource, worldState.environment);
                 return { log: { key: 'log_action_move_towards_resource', params: { agentName: agent.name, resourceName: ironSource.name } }, status: 'neutral', reward: 0.5 };
            }
            return { log: { key: 'log_action_mine_iron_no_source', params: { agentName: agent.name } }, status: 'failure', reward: -2 };
        }
    },

    // --- Crafting Actions ---
    ...RECIPES.map((recipe): Action => ({
        name: recipe.name,
        description: `Crafts ${recipe.output.item} from ingredients.`,
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const agentCulture = worldState.cultures.find(c => c.id === agent.cultureId);
            if (recipe.requiredTech && (!agentCulture || !agentCulture.knownTechnologies.includes(recipe.requiredTech))) {
                return { log: { key: 'log_action_craft_fail_tech', params: { agentName: agent.name, tech: worldState.techTree.find(t=>t.id === recipe.requiredTech)?.name || recipe.requiredTech }}, status: 'failure', reward: -1 };
            }
            if (recipe.requiredSkill && (agent.skills[recipe.requiredSkill.skill] || 0) < recipe.requiredSkill.level) {
                return { log: { key: 'log_action_craft_fail_skill', params: { agentName: agent.name, skill: recipe.requiredSkill.skill, level: recipe.requiredSkill.level }}, status: 'failure', reward: -1 };
            }
            const hasIngredients = Object.entries(recipe.ingredients).every(([item, quantity]) => (agent.inventory[item] || 0) >= quantity!);
            if (hasIngredients) {
                Object.entries(recipe.ingredients).forEach(([item, quantity]) => {
                    agent.inventory[item] -= quantity!;
                });
                agent.inventory[recipe.output.item] = (agent.inventory[recipe.output.item] || 0) + recipe.output.quantity;
                agent.skills.crafting = (agent.skills.crafting || 0) + 1.0;
                if (agent.cultureId) {
                    context.addResearchPoints(agent.cultureId, 2);
                }
                return { log: { key: 'log_action_craft_success', params: { agentName: agent.name, itemName: recipe.output.item }}, status: 'success', reward: 15 };
            }
            return { log: { key: 'log_action_craft_fail_ingredients', params: { agentName: agent.name, itemName: recipe.output.item }}, status: 'failure', reward: -3 };
        }
    })),

    // --- Market Actions ---
    {
        name: 'List Item on Market',
        description: 'List an item from inventory on the public market.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const marketplace = findNearestEntity(agent, allEntities, e => e.isMarketplace === true);
            if (!marketplace || Math.sqrt(Math.pow(agent.x - marketplace.x, 2) + Math.pow(agent.y - marketplace.y, 2)) > 5) {
                return { log: { key: 'log_action_market_too_far', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
    
            const itemToSell = Object.keys(agent.inventory).find(item => agent.inventory[item] > 0);
            if (itemToSell) {
                agent.inventory[itemToSell]--;
                context.addListingToMarket(marketplace.id, { fromAgentId: agent.id, item: itemToSell as any, quantity: 1 });
                return { log: { key: 'log_action_market_list_item', params: { agentName: agent.name, item: itemToSell, price: context.marketPrices[itemToSell] || 0 }}, status: 'success', reward: 5 };
            }
            return { log: { key: 'log_action_market_no_items', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
        }
    },
    {
        name: 'Buy from Market',
        description: 'Buy an item listed on the market.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const marketplace = findNearestEntity(agent, allEntities, e => e.isMarketplace === true);
            if (!marketplace || Math.sqrt(Math.pow(agent.x - marketplace.x, 2) + Math.pow(agent.y - marketplace.y, 2)) > 5) {
                return { log: { key: 'log_action_market_too_far', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
            const market = worldState.markets.find(m => m.id === marketplace.id);
            if (!market || market.listings.length === 0) {
                return { log: { key: 'log_action_market_is_empty', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
    
            const affordableListing = market.listings.find(l => agent.currency >= (context.marketPrices[l.item] || 9999) * l.quantity);
            if (affordableListing) {
                const seller = allAgents.get(affordableListing.fromAgentId);
                context.executeTrade(agent, affordableListing);
                return { log: { key: 'log_action_market_buy_item', params: { agentName: agent.name, item: affordableListing.item, sellerName: seller?.name || 'Unknown', price: context.marketPrices[affordableListing.item] || 0 }}, status: 'success', reward: 5 };
            }
            return { log: { key: 'log_action_market_cannot_afford', params: { agentName: agent.name }}, status: 'failure', reward: -2 };
        }
    },

    // --- Political Actions ---
    {
        name: 'Vote',
        description: 'Vote for a candidate in the current election.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const election = worldState.environment.election;
            if (!election || !election.isActive) {
                return { log: { key: 'log_action_vote_no_election', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
            if (election.candidates.length === 0) {
                return { log: { key: 'log_action_vote_no_candidates', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
            const candidates = election.candidates.map(id => allAgents.get(id)!).filter(Boolean);
            
            if (candidates.length > 0) {
                const candidatesWithJsd = candidates.map(candidate => ({
                    candidate,
                    jsd: jensenShannonDivergence(agent.beliefNetwork, candidate.beliefNetwork)
                }));
                
                candidatesWithJsd.sort((a, b) => a.jsd - b.jsd); // Sort by lowest JSD (most similar)
    
                const bestCandidate = candidatesWithJsd[0].candidate;
    
                if (bestCandidate) {
                    context.castVote(bestCandidate.id);
                    return { log: { key: 'log_action_vote_cast', params: { agentName: agent.name, candidateName: bestCandidate.name }}, status: 'success', reward: 2 };
                }
            }
            
            return { log: { key: 'log_action_vote_undecided', params: { agentName: agent.name }}, status: 'neutral', reward: 0 };
        }
    },
    {
        name: 'Run for Election',
        description: 'Declare candidacy in the current election.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const election = worldState.environment.election;
            if (!election || !election.isActive) {
                return { log: { key: 'log_action_run_for_election_no_election', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
            if (election.candidates.includes(agent.id)) {
                return { log: { key: 'log_action_run_for_election_already_running', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
            if (agent.socialStatus < 50) {
                return { log: { key: 'log_action_run_for_election_low_status', params: { agentName: agent.name }}, status: 'failure', reward: -2 };
            }
            context.declareCandidacy(agent.id);
            agent.socialStatus += 5;
            return { log: { key: 'log_action_run_for_election_success', params: { agentName: agent.name }}, status: 'success', reward: 10 };
        }
    },
    {
        name: 'Propose New Law',
        description: 'As leader, propose a new law for the community to vote on.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            if (worldState.government.leaderId !== agent.id) {
                return { log: { key: 'log_action_propose_law_not_leader', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
            const agentCulture = worldState.cultures.find(c => c.id === agent.cultureId);
            if (!agentCulture || !agentCulture.knownTechnologies.includes('governance')) {
                return { log: { key: 'log_action_craft_fail_tech', params: { agentName: agent.name, tech: 'Governance' }}, status: 'failure', reward: -1 };
            }
    
            // Call AI to generate a law proposal
            let newLaw: Law | null = null;
            try {
                newLaw = await generateNewLaw(agent, worldState, context.language);
            } catch (error) {
                console.error("AI law generation failed:", error);
                return { log: { key: 'log_action_propose_law_fail_ai', params: { agentName: agent.name } }, status: 'failure', reward: -5 };
            }
            
            if (!newLaw) {
                return { log: { key: 'log_action_propose_law_fail_ai', params: { agentName: agent.name } }, status: 'failure', reward: -5 };
            }
    
            // Simulate consultation with the culture/clan
            const cultureMembers = Array.from(allAgents.values()).filter(a => a.cultureId === agent.cultureId && a.id !== agent.id);
            
            // The leader (proposer) always votes 'yes', and their vote counts as 2.
            let approvals = 2;
            let totalVotesCast = 2;

            for (const member of cultureMembers) {
                totalVotesCast++; // Each member has 1 vote
                const relationshipScore = member.relationships[agent.id]?.score || 0;
                const agreeableness = member.personality.agreeableness;
                const approvalChance = (relationshipScore / 150) + (agreeableness / 2);
                if (Math.random() < approvalChance) {
                    approvals++;
                }
            }
            
            // Majority approval needed.
            const wasApproved = (approvals / totalVotesCast) > 0.5;
    
            if (wasApproved) {
                context.enactLaw(newLaw);
                return { 
                    log: { key: 'log_action_propose_law_approved', params: { lawName: newLaw.name, cultureName: agentCulture.name } }, 
                    status: 'success', 
                    reward: 25 
                };
            } else {
                return { 
                    log: { key: 'log_action_propose_law_rejected', params: { lawName: newLaw.name, cultureName: agentCulture.name } }, 
                    status: 'failure', 
                    reward: -10 
                };
            }
        }
    },

    // --- Tech & Social Actions ---
    {
        name: 'Found Religion',
        description: 'Attempt to establish a new religion for your culture.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            if (!agent.cultureId) {
                return { log: { key: 'log_action_found_religion_fail_no_culture' as any, params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }
            if (agent.socialStatus < 50) {
                return { log: { key: 'log_action_found_religion_fail_status' as any, params: { agentName: agent.name } }, status: 'failure', reward: -2 };
            }
            
            const culture = worldState.cultures.find(c => c.id === agent.cultureId);
            if (!culture) {
                 return { log: { key: 'log_action_found_religion_fail_no_culture' as any, params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }
    
            const religiousMembers = culture.memberIds.map(id => allAgents.get(id)).filter(a => a && a.isAlive && a.religionId).length;
            if ((religiousMembers / culture.memberIds.length) > 0.5) {
                return { log: { key: 'log_action_found_religion_fail_has_religion' as any, params: { agentName: agent.name, cultureName: culture.name } }, status: 'failure', reward: -1 };
            }
            
            let religionProposal: { name: string; dogma: any } | null = null;
            try {
                religionProposal = await generateNewReligion(agent, worldState, context.language);
            } catch (error) {
                console.error("AI religion generation failed:", error);
                return { log: { key: 'log_action_found_religion_fail_ai' as any, params: { agentName: agent.name } }, status: 'failure', reward: -5 };
            }
            
            if (!religionProposal) {
                return { log: { key: 'log_action_found_religion_fail_ai' as any, params: { agentName: agent.name } }, status: 'failure', reward: -5 };
            }
    
            // Simulate vote
            const cultureMembers = culture.memberIds.map(id => allAgents.get(id)).filter((a): a is Agent => !!a && a.isAlive && a.id !== agent.id);
            let approvals = 0;
            
            for (const member of cultureMembers) {
                const spiritualNeed = member.psyche.spiritualNeed || 0.1;
                const openness = member.personality.openness;
                const fanaticism = member.psyche.fanaticism || 0;
                const relationshipScore = member.relationships[agent.id]?.score || 0;
                const approvalChance = (spiritualNeed * 0.4) + (openness * 0.3) + (relationshipScore / 200) + (fanaticism * 0.1); // max ~1.3
                if (Math.random() < approvalChance) {
                    approvals++;
                }
            }
            
            const wasApproved = cultureMembers.length === 0 || (approvals / cultureMembers.length) >= 0.5;
            
            if (wasApproved) {
                return {
                    log: { key: 'log_action_found_religion_success' as any, params: { religionName: religionProposal.name, cultureName: culture.name } },
                    status: 'success',
                    reward: 50,
                    sideEffects: {
                        createReligion: {
                            name: religionProposal.name,
                            dogma: religionProposal.dogma,
                            cultureIdToAdopt: culture.id,
                        }
                    }
                };
            } else {
                return {
                    log: { key: 'log_action_found_religion_fail_vote' as any, params: { religionName: religionProposal.name, cultureName: culture.name } },
                    status: 'failure',
                    reward: -10
                };
            }
        }
    },
    {
        name: 'Research',
        description: 'Contribute to cultural research.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            if (agent.role !== 'Scientist') return { log: { key: 'log_action_fail_role', params: { agentName: agent.name, requiredRole: 'Scientist' } }, status: 'failure', reward: -1 };
            if (!agent.cultureId) return { log: { key: 'log_action_research_no_culture', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            
            let researchPoints = RESEARCH_PER_ACTION;
            if (agent.genome.includes("G-INTELLIGENT")) researchPoints *= 1.5;
            if ((agent.psyche.inspiration || 0) > 0.7) researchPoints *= 2;
    
            context.addResearchPoints(agent.cultureId, researchPoints);
            agent.psyche.inspiration = Math.max(0, (agent.psyche.inspiration || 0) - 0.2);
            return { log: { key: 'log_action_research', params: { agentName: agent.name, points: researchPoints.toFixed(0) }}, status: 'success', reward: researchPoints / 5 };
        }
    },
    {
        name: 'Invent Technology',
        description: 'Attempt to invent a new technology based on current knowledge.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            if (agent.role !== 'Scientist' || (agent.psyche.inspiration || 0) < 0.6) {
                return { log: { key: 'log_action_invent_fail_role' as any, params: { agentName: agent.name } }, status: 'failure', reward: -2 };
            }
            const culture = worldState.cultures.find(c => c.id === agent.cultureId);
            if (!culture || culture.knownTechnologies.length === 0) {
                return { log: { key: 'log_action_invent_fail_no_basis' as any, params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }
            try {
                const newTech = await generateNewTechnology(agent, worldState, context.language);
                if (newTech) {
                    agent.psyche.inspiration = 0; // The spark of genius is spent
                    // The simulation engine will handle adding the tech to the tree
                    return {
                        log: { key: 'log_action_invent_success' as any, params: { agentName: agent.name, techName: newTech.name } },
                        status: 'success',
                        reward: 100,
                        sideEffects: {
                            inventTechnology: newTech
                        }
                    };
                }
                 return { log: { key: 'log_action_invent_fail_ai' as any, params: { agentName: agent.name } }, status: 'failure', reward: -5 };
            } catch (error) {
                console.error("AI technology invention failed:", error);
                return { log: { key: 'log_action_invent_fail_ai' as any, params: { agentName: agent.name } }, status: 'failure', reward: -5 };
            }
        }
    },
    {
        name: 'Share Knowledge',
        description: 'Collaborate with another scientist to boost research.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            if (agent.role !== 'Scientist' || !agent.cultureId) return { log: { key: 'log_action_fail_role', params: { agentName: agent.name, requiredRole: 'Scientist' } }, status: 'failure', reward: -1 };
            const otherScientist = findNearestAgent(agent, allAgents, a => a.isAlive && a.role === 'Scientist' && a.cultureId === agent.cultureId);
            if (otherScientist) {
                context.addResearchPoints(agent.cultureId, 15); // Bonus for collaboration
                return { log: { key: 'log_action_share_knowledge', params: { agentName1: agent.name, agentName2: otherScientist.name }}, status: 'success', reward: 5 };
            }
            return { log: { key: 'log_action_share_knowledge_no_one', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
        }
    },
    {
        name: 'Leave Culture',
        description: 'Leave your current culture to become unaffiliated.',
        execute: async (agent) => {
            if (!agent.cultureId) {
                return { log: { key: 'log_action_leave_culture_fail', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }
            return {
                log: { key: 'log_action_leave_culture_success', params: { agentName: agent.name } },
                status: 'success',
                reward: -5, // Socially disruptive
                sideEffects: {
                    updateAgentCulture: { agentId: agent.id, newCultureId: null }
                }
            };
        }
    },
    {
        name: 'Found Culture',
        description: 'Found a new culture based on your own beliefs. Requires social status > 40 and being unaffiliated.',
        execute: async (agent) => {
            if (agent.cultureId) {
                return { log: { key: 'log_action_found_culture_fail_member', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }
            if (agent.socialStatus < 40) {
                return { log: { key: 'log_action_found_culture_fail_status', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }
            const newCultureName = `${agent.name.split(' ')[0]}'s Collective`;
            return {
                log: { key: 'log_action_found_culture_success', params: { agentName: agent.name, cultureName: newCultureName } },
                status: 'success',
                reward: 30,
                sideEffects: {
                    createCulture: {
                        name: newCultureName,
                        sharedBeliefs: { ...agent.beliefNetwork },
                        founderId: agent.id
                    }
                }
            };
        }
    },
    {
        name: 'Recruit for Culture',
        description: 'Attempt to persuade a nearby agent to join your culture.',
        execute: async (agent, allAgents, allEntities, worldState) => {
            if (!agent.cultureId) {
                return { log: { key: 'log_action_recruit_culture_no_culture', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }
            const target = findNearestAgent(agent, allAgents, a => a.isAlive && a.cultureId !== agent.cultureId);
            if (!target) {
                return { log: { key: 'log_action_recruit_culture_no_target', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }
            
            const culture = worldState.cultures.find(c => c.id === agent.cultureId);
            if (!culture) {
                return { log: { key: 'log_action_recruit_culture_no_culture', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }
            
            const jsd = jensenShannonDivergence(target.beliefNetwork, culture.sharedBeliefs);
    
            const rhetoricSkill = agent.skills.rhetoric || 1;
            const relationshipScore = agent.relationships[target.id]?.score || 0;
            let successChance = (rhetoricSkill / 100) + (relationshipScore / 200) - (target.personality.conscientiousness * 0.1);
            successChance -= jsd * 0.5; // Ideological difference makes it harder
    
            if (Math.random() < successChance) {
                return {
                    log: { key: 'log_action_recruit_culture_success', params: { recruiterName: agent.name, targetName: target.name, cultureName: culture.name } },
                    status: 'success',
                    reward: 20,
                    sideEffects: {
                        updateAgentCulture: { agentId: target.id, newCultureId: agent.cultureId }
                    }
                };
            }
    
            return { log: { key: 'log_action_recruit_culture_fail', params: { recruiterName: agent.name, targetName: target.name } }, status: 'failure', reward: -5 };
        }
    },
    {
        name: 'Propose Marriage',
        description: 'Propose marriage to a suitable nearby agent.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            if (agent.age < 14) {
                return { log: { key: 'log_action_propose_fail_age' as any, params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }
            const isMarried = Object.values(agent.relationships).some(r => r.type === 'spouse');
            if (isMarried) return { log: { key: 'log_action_propose_fail_already_married', params: { agentName: agent.name } }, status: 'failure', reward: -2 };
            const target = findNearestAgent(agent, allAgents, a => 
                a.isAlive && 
                a.age >= 14 &&
                !Object.values(a.relationships).some(r => r.type === 'spouse') &&
                (agent.relationships[a.id]?.score || 0) > 70
            );

            if (target) {
                if (Math.random() < 0.7) { 
                     agent.relationships[target.id].type = 'spouse';
                     target.relationships[agent.id] = { type: 'spouse', score: 100, disposition: {} };
                     context.logStatistic('marriage', { agentName1: agent.name, agentName2: target.name });
                     return { log: { key: 'log_action_accept_proposal_success', params: { agentName: target.name, targetName: agent.name }}, status: 'success', reward: 50 };
                }
                return { log: { key: 'log_action_propose_marriage_fail', params: { agentName: agent.name, targetName: target.name }}, status: 'failure', reward: -10 };
            }
            return { log: { key: 'log_action_propose_no_one_suitable', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
        }
    },
    {
        name: 'Accept Proposal',
        description: 'Accept a marriage proposal.',
        execute: async (agent) => {
            // This action is now implicitly handled by "Propose Marriage" for simplicity.
            return { log: { key: 'log_action_accept_proposal_none', params: { agentName: agent.name }}, status: 'neutral', reward: 0 };
        }
    },
    {
        name: 'Reproduce',
        description: 'Attempt to have a child with a spouse.',
        execute: async (agent, allAgents) => {
            const partnerEntry = Object.entries(agent.relationships).find(([, rel]) => rel.type === 'spouse');
            if (!partnerEntry) return { log: { key: 'log_action_reproduce_no_partner', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            
            const partner = allAgents.get(partnerEntry[0]);
            if (!partner || !partner.isAlive) return { log: { key: 'log_action_reproduce_no_partner', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
    
            const distance = Math.sqrt(Math.pow(agent.x - partner.x, 2) + Math.pow(agent.y - partner.y, 2));
            if (distance > 3) {
                return { log: { key: 'log_action_reproduce_no_partner', params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            }
            
            if (agent.age < MIN_REPRODUCTION_AGE || agent.age > MAX_REPRODUCTION_AGE || partner.age < MIN_REPRODUCTION_AGE || partner.age > MAX_REPRODUCTION_AGE) {
                return { log: { key: 'log_action_reproduce_fail_age', params: { agentName: agent.name, partnerName: partner.name }}, status: 'failure', reward: -1 };
            }
            if (agent.offspringCount >= MAX_OFFSPRING || partner.offspringCount >= MAX_OFFSPRING) {
                 return { log: { key: 'log_action_reproduce_fail_max_offspring', params: { agentName: agent.name, partnerName: partner.name }}, status: 'failure', reward: 0 };
            }

            let successChance = 0.75; // Base 75% chance
            if (agent.genome.includes('G-FERTILE')) successChance += 0.15;
            if (partner.genome.includes('G-FERTILE')) successChance += 0.15;
            if (agent.health < 50) successChance -= 0.2;
            if (partner.health < 50) successChance -= 0.2;
    
            if (Math.random() < successChance) {
                agent.offspringCount++;
                partner.offspringCount++;
                return { 
                    log: { key: 'log_action_reproduce_success', params: { agentName: agent.name, partnerName: partner.name }},
                    sideEffects: { createAgent: { description: 'A newborn child.', parents: [agent, partner] } },
                    status: 'success',
                    reward: 100
                };
            }
            return { log: { key: 'log_action_reproduce_fail', params: { agentName: agent.name, partnerName: partner.name }}, status: 'failure', reward: -5 };
        }
    },
    {
        name: 'Artificial Insemination',
        description: 'Use advanced technology to conceive a child. Requires Bioengineering tech. Cost: 500 Currency.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const agentCulture = worldState.cultures.find(c => c.id === agent.cultureId);
            if (!agentCulture || !agentCulture.knownTechnologies.includes('bioengineering')) {
                 return { log: { key: 'log_action_craft_fail_tech', params: { agentName: agent.name, tech: 'Bioengineering' }}, status: 'failure', reward: -1 };
            }
            const cost = 500;
            if (agent.currency < cost) {
                return { log: { key: 'log_action_insemination_fail_funds' as any, params: { agentName: agent.name, cost }}, status: 'failure', reward: -5 };
            }
            agent.currency -= cost;
            context.logTransaction({ from: agent.id, to: 'WORLD', item: 'currency', quantity: cost });
            if (Math.random() > 0.3) {
                 agent.offspringCount++;
                return { 
                    log: { key: 'log_action_insemination_success', params: { agentName: agent.name }},
                    sideEffects: { createAgent: { description: 'A child of science.', parents: [agent, agent] } },
                    status: 'success',
                    reward: 80
                };
            }
            return { log: { key: 'log_action_insemination_fail', params: { agentName: agent.name }}, status: 'failure', reward: -20 };
        }
    },
    {
        name: 'Mentor young agent',
        description: 'Teach a skill to a younger agent.',
        execute: async (agent, allAgents) => {
            const student = findNearestAgent(agent, allAgents, a => a.isAlive && a.age < ADOLESCENCE_MAX_AGE);
            const bestSkill = Object.entries(agent.skills).sort((a,b) => b[1] - a[1])[0];
            if (!student || !bestSkill) return { log: { key: 'log_action_mentor_no_one' as any, params: { agentName: agent.name }}, status: 'failure', reward: -1 };
            if (bestSkill[1] < 20) return { log: { key: 'log_action_mentor_fail_skill' as any, params: { agentName: agent.name }}, status: 'failure', reward: -1 };

            student.skills[bestSkill[0]] = (student.skills[bestSkill[0]] || 0) + 1.5;
            agent.socialStatus += 1;
            return { log: { key: 'log_action_mentor_success' as any, params: { mentorName: agent.name, studentName: student.name, skill: bestSkill[0] }}, status: 'success', reward: 15 };
        }
    },
    {
        name: 'Seek Counseling',
        description: 'Seek help from a counselor to reduce stress.',
        execute: async (agent, allAgents, allEntities, worldState) => {
            const counselor = findNearestAgent(agent, allAgents, a => a.isAlive && a.role === 'Counselor');
            if (counselor) {
                 moveTowards(agent, counselor, worldState.environment);
                 return { log: { key: 'log_action_seek_counseling' as any, params: { agentName: agent.name, counselorName: counselor.name }}, status: 'neutral', reward: 0.5 };
            }
            return { log: { key: 'log_action_seek_counseling_fail' as any, params: { agentName: agent.name }}, status: 'failure', reward: -1 };
        }
    },
    {
        name: 'Provide Counseling',
        description: 'As a counselor, help an agent reduce stress.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            if (agent.role !== 'Counselor') return { log: { key: 'log_action_fail_role', params: { agentName: agent.name, requiredRole: 'Counselor' } }, status: 'failure', reward: -1 };
            const patient = findNearestAgent(agent, allAgents, a => a.isAlive && a.stress > 50);
            if (patient) {
                const stressBefore = patient.stress;
                patient.stress = Math.max(0, patient.stress - 30);
                agent.skills.healing = (agent.skills.healing || 0) + 0.5;
                const payment = 25;
                patient.currency -= payment;
                agent.currency += payment;
                context.logTransaction({ from: patient.id, to: agent.id, item: 'currency', quantity: payment });
                return { log: { key: 'log_action_provide_counseling_success' as any, params: { counselorName: agent.name, patientName: patient.name }}, status: 'success', reward: (stressBefore - patient.stress) / 2 };
            }
            return { log: { key: 'log_action_provide_counseling_fail' as any, params: { agentName: agent.name }}, status: 'failure', reward: -1 };
        }
    },
    {
        name: 'Talk',
        description: 'Talk to a nearby agent or move towards them to talk.',
        onSuccess: { belief: 'social_interaction_good', delta: 0.01 },
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const nearestAgent = findNearestAgent(agent, allAgents, a => a.isAlive && !a.adminAgent);

            if (!nearestAgent) {
                return { log: { key: 'log_action_talk_no_one_near', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }

            const distance = Math.sqrt(Math.pow(agent.x - nearestAgent.x, 2) + Math.pow(agent.y - nearestAgent.y, 2));

            if (distance < 5) { // If close enough, talk
                const conversationResult = await generateAgentConversation(agent, nearestAgent, agent.conversationHistory, worldState, context.language);
            
                if (!conversationResult || !conversationResult.dialogue) {
                     return { log: { key: 'log_action_talk_failed', params: { agentName: agent.name } }, status: 'failure', reward: -2 };
                }
    
                const { dialogue } = conversationResult;
                
                agent.conversationHistory.push({ speakerName: agent.name, message: dialogue });
                if(agent.conversationHistory.length > 10) agent.conversationHistory.shift();
    
                nearestAgent.conversationHistory.push({ speakerName: agent.name, message: dialogue });
                if(nearestAgent.conversationHistory.length > 10) nearestAgent.conversationHistory.shift();
                
                context.addSocialMemory(agent.id, { agentId: nearestAgent.id, action: 'Talk', result: 'initiated', emotionalImpact: 0.1, timestamp: worldState.environment.time });
                context.addSocialMemory(nearestAgent.id, { agentId: agent.id, action: 'Talk', result: 'reciprocated', emotionalImpact: 0.1, timestamp: worldState.environment.time });
    
                return { log: { key: 'log_action_talk', params: { speakerName: agent.name, listenerName: nearestAgent.name, dialogue } }, status: 'success', reward: 5 };
            } else { // If not close enough, move towards them
                moveTowards(agent, nearestAgent, worldState.environment);
                return { log: { key: 'log_action_move_towards_agent', params: { agentName: agent.name, targetName: nearestAgent.name } }, status: 'neutral', reward: 1 };
            }
        }
    },
    {
        name: 'Fight',
        description: 'Fight with a nearby agent.',
        beliefKey: 'aggression',
        onSuccess: { belief: 'aggression', delta: 0.05 },
        onFailure: { belief: 'aggression', delta: -0.05 },
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const target = findNearestAgent(agent, allAgents, a => a.isAlive && !a.adminAgent);
            if (!target) {
                return { log: { key: 'log_action_talk_no_one_near', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }
            
            const initiator = agent;
            context.logStatistic('fight', { agentName1: initiator.name, agentName2: target.name });
            const agentHealthBefore = initiator.health;
            const targetHealthBefore = target.health;

            const agentCombatSkill = initiator.skills.combat || 1;
            const targetCombatSkill = target.skills.combat || 1;
            const agentDamage = Math.max(1, Math.round(5 * (agentCombatSkill / (targetCombatSkill + 1)) * Math.random()));
            const targetDamage = Math.max(1, Math.round(5 * (targetCombatSkill / (agentCombatSkill + 1)) * Math.random()));

            initiator.health -= targetDamage;
            target.health -= agentDamage;

            // --- Guard Intervention Logic ---
            const law = worldState.government.laws.find(l => l.violatingAction === 'Fight');
            const interveningGuard = findNearestAgent(initiator, allAgents, a => 
                a.isAlive && a.role === 'Guard' && Math.sqrt(Math.pow(initiator.x - a.x, 2) + Math.pow(initiator.y - a.y, 2)) < 8
            );

            if (law && interveningGuard) {
                const jail = findNearestEntity(initiator, allEntities, e => e.isJail);
                const arrestChance = 0.4 + (interveningGuard.personality.conscientiousness - 0.5) * 0.4; // Base 40%, modified by guard's conscientiousness

                if (initiator.age < 14) {
                    return { log: { key: 'log_guard_warning', params: { guardName: interveningGuard.name, criminalName: initiator.name, crime: 'fighting (minor)' } }, status: 'neutral', reward: -5 };
                }

                if (jail && law.punishment.type === 'arrest' && Math.random() < arrestChance) {
                    const baseDuration = Math.max(20, law.punishment.amount);
                    const personalityModifier = (1 - initiator.personality.agreeableness) * 10;
                    const psycheModifier = (initiator.psyche.vengefulness || 0) * 10 - (initiator.psyche.forgiveness || 0) * 5;
                    const finalDuration = Math.round(baseDuration + personalityModifier + psycheModifier);

                    initiator.imprisonment = {
                        startsAt: worldState.environment.time,
                        endsAt: worldState.environment.time + finalDuration,
                        midSentenceAnalysisDone: false,
                    };

                    initiator.x = jail.x;
                    initiator.y = jail.y;
                    if (!jail.inmates) jail.inmates = [];
                    if (!jail.inmates.includes(initiator.id)) jail.inmates.push(initiator.id);

                    initiator.socialStatus = Math.max(0, initiator.socialStatus - 15);
                    initiator.emotions.shame = Math.min(1, (initiator.emotions.shame || 0) + 0.5);
                    context.logStatistic('imprisonment', { agentName: initiator.name });

                    return { log: { key: 'log_law_violation_arrest_witnessed', params: { criminalName: initiator.name, guardName: interveningGuard.name } }, status: 'failure', reward: -25 };
                } else {
                    initiator.socialStatus = Math.max(0, initiator.socialStatus - 5);
                    return { log: { key: 'log_guard_warning', params: { guardName: interveningGuard.name, criminalName: initiator.name, crime: 'fighting' } }, status: 'neutral', reward: -5 };
                }
            }
            // --- End Intervention Logic ---
            
            const reward = (targetHealthBefore - target.health) - (agentHealthBefore - initiator.health);
            return { log: { key: 'log_action_fight', params: { agentName1: initiator.name, agentName2: target.name } }, status: 'neutral', reward };
        }
    },
    {
        name: 'Steal',
        description: 'Attempt to steal from a nearby agent.',
        onSuccess: { belief: 'immorality_ok', delta: 0.05 },
        onFailure: { belief: 'immorality_ok', delta: -0.05 },
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            const victim = findNearestAgent(agent, allAgents, a => a.isAlive && !a.adminAgent && (Object.keys(a.inventory).length > 0 || a.currency > 0));
            if(!victim) return { log: { key: 'log_action_steal_no_target', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            
            // Failure case: Got caught
            if(Math.random() < 0.5) {
                context.addSocialMemory(agent.id, { agentId: victim.id, action: 'Steal', result: 'rejected', emotionalImpact: -0.5, timestamp: worldState.environment.time });
                context.addSocialMemory(victim.id, { agentId: agent.id, action: 'Steal', result: 'observed', emotionalImpact: -0.3, timestamp: worldState.environment.time });

                // NEW: Check for nearby guards and apply punishment
                const law = worldState.government.laws.find(l => l.violatingAction === 'Steal');
                const nearbyGuards = Array.from(allAgents.values()).filter(a => a.role === 'Guard' && a.isAlive && Math.sqrt(Math.pow(agent.x - a.x, 2) + Math.pow(agent.y - a.y, 2)) < 5);
                
                if (law && nearbyGuards.length > 0) {
                     const guard = nearbyGuards[0];
                     agent.socialStatus = Math.max(0, agent.socialStatus - 15);
                     agent.emotions.shame = Math.min(1, (agent.emotions.shame || 0) + 0.5);

                     if (agent.age < 14) {
                        return { log: { key: 'log_guard_warning', params: { guardName: guard.name, criminalName: agent.name, crime: 'stealing (minor)' } }, status: 'neutral', reward: -5 };
                     }

                     if (law.punishment.type === 'fine') {
                         context.logTransaction({ from: agent.id, to: 'WORLD', item: 'currency', quantity: law.punishment.amount });
                         agent.currency = Math.max(0, agent.currency - law.punishment.amount);
                         return { log: { key: 'log_law_violation', params: { agentName: agent.name, lawName: law.name, punishment: law.punishment.amount } }, status: 'failure', reward: -15 };
                     } else if (law.punishment.type === 'arrest') {
                         const jail = findNearestEntity(agent, allEntities, e => e.isJail);
                         if (jail) {
                            const baseDuration = Math.max(20, law.punishment.amount);
                            const personalityModifier = (1 - agent.personality.agreeableness) * 10;
                            const psycheModifier = (agent.psyche.vengefulness || 0) * 10 - (agent.psyche.forgiveness || 0) * 5;
                            const finalDuration = Math.round(baseDuration + personalityModifier + psycheModifier);

                            agent.imprisonment = {
                                startsAt: worldState.environment.time,
                                endsAt: worldState.environment.time + finalDuration,
                                midSentenceAnalysisDone: false,
                            };
                             
                             agent.x = jail.x;
                             agent.y = jail.y;
                             if (!jail.inmates) jail.inmates = [];
                             if (!jail.inmates.includes(agent.id)) jail.inmates.push(agent.id);
                             context.logStatistic('imprisonment', { agentName: agent.name });
                         }
                         return { log: { key: 'log_law_violation_arrest', params: { criminalName: agent.name, guardName: guard.name } }, status: 'failure', reward: -25 };
                     }
                }

                return { log: { key: 'log_action_steal_fail', params: { victim: victim.name } }, status: 'failure', reward: -5 };
            }
            
            // Success case
            const itemToSteal = Object.keys(victim.inventory).find(item => victim.inventory[item] > 0);
            if(itemToSteal) {
                victim.inventory[itemToSteal]--;
                agent.inventory[itemToSteal] = (agent.inventory[itemToSteal] || 0) + 1;
                context.logTransaction({ from: victim.id, to: agent.id, item: itemToSteal as any, quantity: 1 });
                return { log: { key: 'log_action_steal_success', params: { stealer: agent.name, victim: victim.name, item: itemToSteal } }, status: 'success', reward: 10 };
            }

            return { log: { key: 'log_action_steal_fail', params: { victim: victim.name } }, status: 'failure', reward: -5 };
        }
    },
    {
        name: 'Patrol',
        description: 'As a guard, patrol the area.',
        execute: async (agent, allAgents, allEntities, worldState) => {
            if (agent.role !== 'Guard') return { log: { key: 'log_action_fail_role', params: { agentName: agent.name, requiredRole: 'Guard' } }, status: 'failure', reward: -1 };
            wander(agent, worldState.environment);
            return { log: { key: 'log_action_patrol', params: { agentName: agent.name } }, status: 'neutral', reward: 1 };
        }
    },
    {
        name: 'Meditate',
        description: 'Meditate to find peace and inspiration.',
        execute: async (agent) => {
            agent.stress = Math.max(0, agent.stress - 15);
            if (Math.random() < 0.2) {
                agent.psyche.inspiration = Math.min(1, (agent.psyche.inspiration || 0) + 0.3);
                return { log: { key: 'log_action_meditate_inspiration' as any, params: { agentName: agent.name }}, status: 'success', reward: 15 };
            }
            return { log: { key: 'log_action_meditate' as any, params: { agentName: agent.name }}, status: 'success', reward: 5 };
        }
    },
    {
        name: 'Mourn',
        description: 'Take time to process grief.',
        execute: async (agent) => {
            agent.emotions.grief = Math.max(0, (agent.emotions.grief || 0) - 0.2);
            agent.emotions.sadness = Math.min(1, (agent.emotions.sadness || 0) + 0.1);
            return { log: { key: 'log_action_mourn' as any, params: { agentName: agent.name }}, status: 'success', reward: 10 };
        }
    },
    {
        name: 'Offer Forgiveness',
        description: 'Offer forgiveness to a rival, potentially ending the rivalry.',
        execute: async (agent, allAgents) => {
            const rivalEntry = Object.entries(agent.relationships).find(([, rel]) => rel.type === 'rival');
            if (!rivalEntry) return { log: { key: 'log_action_forgive_no_rival' as any, params: { agentName: agent.name }}, status: 'failure', reward: -1 };

            const rival = allAgents.get(rivalEntry[0]);
            if (rival) {
                agent.relationships[rival.id].type = 'acquaintance';
                rival.relationships[agent.id].type = 'acquaintance';
                return { log: { key: 'log_action_forgive_success' as any, params: { agentName: agent.name, rivalName: rival.name }}, status: 'success', reward: 20 };
            }
             return { log: { key: 'log_action_forgive_no_rival' as any, params: { agentName: agent.name }}, status: 'failure', reward: -1 };
        }
    },
    {
        name: 'Confront Partner',
        description: 'Confront your spouse/partner due to jealousy.',
        execute: async (agent, allAgents) => {
             const partnerEntry = Object.entries(agent.relationships).find(([, rel]) => rel.type === 'spouse' || rel.type === 'partner');
             if (!partnerEntry) return { log: { key: 'log_action_confront_no_partner' as any, params: { agentName: agent.name }}, status: 'failure', reward: -1 };

             const partner = allAgents.get(partnerEntry[0]);
             if (partner) {
                agent.relationships[partner.id].score = Math.max(0, agent.relationships[partner.id].score - 10);
                agent.psyche.jealousy = Math.max(0, agent.psyche.jealousy - 0.3);
                return { log: { key: 'log_action_confront_success' as any, params: { agentName: agent.name, partnerName: partner.name }}, status: 'success', reward: -5 };
             }
              return { log: { key: 'log_action_confront_no_partner' as any, params: { agentName: agent.name }}, status: 'failure', reward: -1 };
        }
    },
    {
        name: 'Consume Media',
        description: 'Read, watch, or listen to a media broadcast available in the world.',
        execute: async (agent, allAgents, allEntities, worldState, context) => {
            if (!worldState.mediaBroadcasts || worldState.mediaBroadcasts.length === 0) {
                return { log: { key: 'log_action_consume_media_none_available', params: { agentName: agent.name } }, status: 'failure', reward: -1 };
            }
    
        // Agent picks a broadcast to consume, for now, just the latest one.
        const broadcast = worldState.mediaBroadcasts[worldState.mediaBroadcasts.length - 1];

        // --- Credibility Check ---
        let credibilityScore = 1.0;

        // 1. Base Skepticism (Personality)
        // High Conscientiousness -> more critical. Low Openness -> more skeptical.
        const skepticism = (agent.personality.conscientiousness * 0.5) + ((1 - agent.personality.openness) * 0.5); // Max skepticism: 1.0
        credibilityScore *= 1 - (skepticism * (1 - broadcast.truthfulness));

        // 2. Confirmation Bias (Beliefs)
        const currentBeliefValue = agent.beliefNetwork[broadcast.targetBelief] || 0.5;
        const isAligning = (broadcast.influenceDelta > 0 && currentBeliefValue > 0.5) || (broadcast.influenceDelta < 0 && currentBeliefValue < 0.5);
        if (isAligning) {
            credibilityScore *= 1.2; // 20% boost if it confirms existing bias
        } else {
            credibilityScore *= 0.7; // 30% reduction if it challenges beliefs
        }

        // 3. Social Proof (Friends' Beliefs)
        const friends = Object.entries(agent.relationships)
            .filter(([, rel]) => rel.type === 'friend' && rel.score > 70)
            .map(([id]) => allAgents.get(id))
            .filter((a): a is Agent => !!a && a.isAlive);
        
        if (friends.length > 0) {
            const avgFriendBelief = friends.reduce((sum, friend) => sum + (friend.beliefNetwork[broadcast.targetBelief] || 0.5), 0) / friends.length;
            const friendBeliefAligns = (broadcast.influenceDelta > 0 && avgFriendBelief > 0.6) || (broadcast.influenceDelta < 0 && avgFriendBelief < 0.4);
            if (friendBeliefAligns) {
                credibilityScore *= 1.3; // 30% boost for social proof
            }
        }

        credibilityScore = Math.max(0, Math.min(1.5, credibilityScore));
        
        const finalInfluence = broadcast.influenceDelta * credibilityScore;
        const oldBeliefValue = agent.beliefNetwork[broadcast.targetBelief] || 0.5;
        agent.beliefNetwork[broadcast.targetBelief] = Math.max(0, Math.min(1, oldBeliefValue + finalInfluence));
        
        agent.psyche.boredom = Math.max(0, agent.psyche.boredom - 0.5);

        return {
            log: { key: 'log_action_consume_media_success', params: { 
                agentName: agent.name, 
                broadcastTitle: broadcast.title,
                belief: broadcast.targetBelief,
                change: finalInfluence.toFixed(2),
                new_value: agent.beliefNetwork[broadcast.targetBelief].toFixed(2)
            }},
            status: 'success',
            reward: 2
        };
        }
    },
    // --- Movement Actions ---
    moveAction('North'),
    moveAction('South'),
    moveAction('East'),
    moveAction('West'),
];
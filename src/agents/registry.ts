/**
 * G-Pilot Agent Registry
 * 
 * Centralized discovery and management of all G-Pilot agents.
 * Supports both global (.agent/agents/) and local (src/agents/) agents.
 */

import { IGPilotAgent } from './base';

type AgentConstructor = new () => IGPilotAgent;

class AgentRegistryClass {
    private agents: Map<string, IGPilotAgent> = new Map();
    private constructors: Map<string, AgentConstructor> = new Map();

    /**
     * Register an agent class for lazy instantiation
     */
    registerClass(name: string, AgentClass: AgentConstructor): void {
        this.constructors.set(name, AgentClass);
        console.log(`📦 Agent registered: ${name}`);
    }

    /**
     * Register an agent instance directly
     */
    register(agent: IGPilotAgent): void {
        this.agents.set(agent.name, agent);
        console.log(`📦 Agent instance registered: ${agent.name}`);
    }

    /**
     * Get an agent by name (instantiates if needed)
     */
    get(name: string): IGPilotAgent | undefined {
        // Check for existing instance
        if (this.agents.has(name)) {
            return this.agents.get(name);
        }

        // Check for registered class
        const AgentClass = this.constructors.get(name);
        if (AgentClass) {
            const instance = new AgentClass();
            this.agents.set(name, instance);
            return instance;
        }

        return undefined;
    }

    /**
     * Get all registered agent names
     */
    getAvailableAgents(): string[] {
        const instanceNames = Array.from(this.agents.keys());
        const classNames = Array.from(this.constructors.keys());
        return [...new Set([...instanceNames, ...classNames])];
    }

    /**
     * Check if an agent exists
     */
    has(name: string): boolean {
        return this.agents.has(name) || this.constructors.has(name);
    }

    /**
     * Find agents by capability
     */
    findByCapability(capability: string): IGPilotAgent[] {
        const matching: IGPilotAgent[] = [];

        for (const name of this.getAvailableAgents()) {
            const agent = this.get(name);
            if (agent?.capabilities.includes(capability)) {
                matching.push(agent);
            }
        }

        return matching;
    }

    /**
     * Find the best agent for a mission based on required skills
     */
    findBestAgent(requiredSkills: string[]): IGPilotAgent | undefined {
        let bestMatch: IGPilotAgent | undefined;
        let bestScore = 0;

        for (const name of this.getAvailableAgents()) {
            const agent = this.get(name);
            if (!agent) continue;

            const score = requiredSkills.filter(skill =>
                agent.requiredSkills.includes(skill)
            ).length;

            if (score > bestScore) {
                bestScore = score;
                bestMatch = agent;
            }
        }

        return bestMatch;
    }
}

// Export singleton instance
export const AgentRegistry = new AgentRegistryClass();

// Auto-register built-in agents on module load
export async function initializeAgents(): Promise<void> {
    console.log('🚀 Initializing G-Pilot Agent Fleet...');

    try {
        // Dynamically import and register agents
        const { MarketingStrategistAgent } = await import('./marketing-strategist');
        const { SEOAnalystAgent } = await import('./seo-analyst');
        const { SocialCommanderAgent } = await import('./social-commander');
        const { ContentOrchestratorAgent } = await import('./content-orchestrator');
        const { MissionOverseerAgent } = await import('./mission-overseer');

        AgentRegistry.registerClass('marketing-strategist', MarketingStrategistAgent);
        AgentRegistry.registerClass('seo-analyst', SEOAnalystAgent);
        AgentRegistry.registerClass('social-commander', SocialCommanderAgent);
        AgentRegistry.registerClass('content-orchestrator', ContentOrchestratorAgent);
        AgentRegistry.registerClass('mission-overseer', MissionOverseerAgent);

        console.log(`✅ ${AgentRegistry.getAvailableAgents().length} agents initialized`);
    } catch (error) {
        console.warn('⚠️ Some agents failed to load:', error);
    }
}

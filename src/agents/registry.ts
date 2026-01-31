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
        return Array.from(new Set([...instanceNames, ...classNames]));
    }

    /**
     * Alias for getAvailableAgents (for test compatibility)
     */
    list(): string[] {
        return this.getAvailableAgents();
    }

    /**
     * Clear all registered agents (for testing)
     */
    clear(): void {
        this.agents.clear();
        this.constructors.clear();
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
        const { GenesisArchitectAgent } = await import('./genesis-architect');
        const { BrowserAgent } = await import('./browser-agent');
        const { UIAuditorAgent } = await import('./ui-auditor');
        const { WebScraperAgent } = await import('./web-scraper');
        const { DataCollectorAgent } = await import('./data-collector');
        const { GeoMarketingAgent } = await import('./geo-marketing-agent');
        const { AgentScoutAgent } = await import('./agent-scout');
        const { IndependentVerifierAgent } = await import('./independent-verifier');

        // Phase 9.4: Specialist agents
        const { FrontendSpecialistAgent } = await import('./frontend-specialist');
        const { BackendSpecialistAgent } = await import('./backend-specialist');
        const { DatabaseSpecialistAgent } = await import('./database-specialist');
        const { TestEngineerAgent } = await import('./test-engineer');
        const { SecurityAuditorAgent } = await import('./security-auditor');
        const { PerformanceOptimizerAgent } = await import('./performance-optimizer');
        const { DeployGuardianAgent } = await import('./deploy-guardian');
        const { DocsWriterAgent } = await import('./docs-writer');
        const { CodeReviewerAgent } = await import('./code-reviewer');
        const { RefactorSpecialistAgent } = await import('./refactor-specialist');
        const { BugHunterAgent } = await import('./bug-hunter');

        AgentRegistry.registerClass('independent-verifier', IndependentVerifierAgent);
        AgentRegistry.registerClass('marketing-strategist', MarketingStrategistAgent);
        AgentRegistry.registerClass('seo-analyst', SEOAnalystAgent);
        AgentRegistry.registerClass('social-commander', SocialCommanderAgent);
        AgentRegistry.registerClass('content-orchestrator', ContentOrchestratorAgent);
        AgentRegistry.registerClass('mission-overseer', MissionOverseerAgent);
        AgentRegistry.registerClass('genesis-architect', GenesisArchitectAgent);
        AgentRegistry.registerClass('browser-agent', BrowserAgent);
        AgentRegistry.registerClass('ui-auditor', UIAuditorAgent);
        AgentRegistry.registerClass('web-scraper', WebScraperAgent);
        AgentRegistry.registerClass('data-collector', DataCollectorAgent);
        AgentRegistry.registerClass('geo-marketing-agent', GeoMarketingAgent);
        AgentRegistry.registerClass('geo-marketing', GeoMarketingAgent); // Alias
        AgentRegistry.registerClass('agent-scout', AgentScoutAgent);

        // Phase 9.4: Register specialist agents
        AgentRegistry.registerClass('frontend-specialist', FrontendSpecialistAgent);
        AgentRegistry.registerClass('backend-specialist', BackendSpecialistAgent);
        AgentRegistry.registerClass('database-specialist', DatabaseSpecialistAgent);
        AgentRegistry.registerClass('test-engineer', TestEngineerAgent);
        AgentRegistry.registerClass('security-auditor', SecurityAuditorAgent);
        AgentRegistry.registerClass('performance-optimizer', PerformanceOptimizerAgent);
        AgentRegistry.registerClass('deploy-guardian', DeployGuardianAgent);
        AgentRegistry.registerClass('docs-writer', DocsWriterAgent);
        AgentRegistry.registerClass('code-reviewer', CodeReviewerAgent);
        AgentRegistry.registerClass('refactor-specialist', RefactorSpecialistAgent);
        AgentRegistry.registerClass('bug-hunter', BugHunterAgent);

        console.log(`✅ ${AgentRegistry.getAvailableAgents().length} agents initialized`);
    } catch (error) {
        console.warn('⚠️ Some agents failed to load:', error);
    }
}

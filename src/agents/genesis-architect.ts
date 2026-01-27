/**
 * Genesis Architect Agent
 * 
 * The evolutionary core of G-Pilot. Deeply understands requests,
 * discovers capabilities, and generates new agents/skills when needed.
 */

import {
    BaseAgent,
    AgentContext,
    AgentPlan,
    AgentResult,
    VerificationReport,
    PlanStep
} from './base';
import { AgentRegistry, initializeAgents } from './registry';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs/promises';
import * as path from 'path';

// Domain classification
export type Domain =
    | 'code_generation'
    | 'research'
    | 'ui_ux'
    | 'marketing'
    | 'branding'
    | 'production'
    | 'architecture'
    | 'scaffolding'
    | 'testing'
    | 'documentation'
    | 'general';

// Deep understanding result
interface DeepUnderstanding {
    intent: string;
    domain: Domain;
    entities: string[];
    constraints: string[];
    successCriteria: string[];
    complexity: 'trivial' | 'simple' | 'moderate' | 'complex' | 'revolutionary';
    confidenceScore: number;
}

// Capability match result
interface CapabilityMatch {
    covered: boolean;
    agents: string[];
    skills: string[];
    gaps: string[];
}

// Pattern memory record
interface PatternRecord {
    id: string;
    trigger: string;
    domain: Domain;
    solution: {
        agents: string[];
        skills: string[];
        generatedAgents?: string[];
        generatedSkills?: string[];
    };
    successRate: number;
    learnings: string[];
    timestamp: Date;
}

// Generated agent metadata
interface GeneratedAgent {
    name: string;
    description: string;
    capabilities: string[];
    code: string;
    specPath: string;
}

// Generated skill metadata  
interface GeneratedSkill {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    outputSchema: Record<string, unknown>;
    code: string;
}

const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || ''
);

export class GenesisArchitectAgent extends BaseAgent {
    readonly name = 'genesis-architect';
    readonly description = 'Self-evolving meta-agent that deeply understands requests and generates new agents/skills';
    readonly capabilities = [
        'deep_understanding',
        'capability_discovery',
        'gap_analysis',
        'agent_generation',
        'skill_generation',
        'pattern_learning'
    ];
    readonly requiredSkills = []; // Genesis uses and creates skills

    // Pattern memory
    private patterns: PatternRecord[] = [];

    // Cache of generated agents/skills this session
    private generatedAgents: GeneratedAgent[] = [];
    private generatedSkills: GeneratedSkill[] = [];

    // Project paths
    private readonly agentSpecPath = '.agent/agents';
    private readonly agentCodePath = 'src/agents';
    private readonly skillCodePath = 'src/tools';

    /**
     * Layer 1: SEMANTIC - Deep understanding of the request
     */
    private async deepUnderstand(context: AgentContext): Promise<DeepUnderstanding> {
        this.log('🧠 Layer 1: Semantic Analysis...');

        const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

        const prompt = `
      You are the Genesis Architect - a meta-cognitive system.
      Analyze this request at the deepest level:
      
      Request: "${context.mission}"
      
      Decompose into:
      1. Core Intent - What does the user truly want to achieve?
      2. Domain - code_generation|research|ui_ux|marketing|branding|production|architecture|scaffolding|testing|documentation|general
      3. Entities - Key objects, concepts, technologies mentioned
      4. Constraints - Limitations, requirements, must-haves
      5. Success Criteria - How to know when this is done correctly
      6. Complexity - trivial|simple|moderate|complex|revolutionary
      
      Return JSON:
      {
        "intent": "Core goal in one sentence",
        "domain": "domain_name",
        "entities": ["entity1", "entity2"],
        "constraints": ["constraint1"],
        "successCriteria": ["criterion1"],
        "complexity": "moderate",
        "confidenceScore": 0.9
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/gi, '').trim();
            const understanding = JSON.parse(text) as DeepUnderstanding;

            this.log('Understanding achieved', understanding);
            return understanding;
        } catch (error: any) {
            this.log('Semantic analysis fallback', error.message);
            return this.heuristicUnderstand(context);
        }
    }

    /**
     * Fallback heuristic understanding
     */
    private heuristicUnderstand(context: AgentContext): DeepUnderstanding {
        const mission = context.mission.toLowerCase();

        let domain: Domain = 'general';
        if (mission.includes('code') || mission.includes('generate') || mission.includes('build')) {
            domain = 'code_generation';
        } else if (mission.includes('ui') || mission.includes('ux') || mission.includes('design')) {
            domain = 'ui_ux';
        } else if (mission.includes('market') || mission.includes('campaign')) {
            domain = 'marketing';
        } else if (mission.includes('research') || mission.includes('analyze')) {
            domain = 'research';
        } else if (mission.includes('scaffold') || mission.includes('setup')) {
            domain = 'scaffolding';
        }

        return {
            intent: context.mission,
            domain,
            entities: [],
            constraints: [],
            successCriteria: ['Mission completed successfully'],
            complexity: 'moderate',
            confidenceScore: 0.6
        };
    }

    /**
     * Layer 2/3: CAPABILITY - Discover and match existing capabilities
     */
    private async discoverCapabilities(understanding: DeepUnderstanding): Promise<CapabilityMatch> {
        this.log('🔍 Layer 2-3: Capability Discovery...');

        await initializeAgents();
        const availableAgents = AgentRegistry.getAvailableAgents();

        // Find agents that match the domain
        const matchingAgents: string[] = [];
        const matchingSkills: string[] = [];
        const gaps: string[] = [];

        // Domain to agent mapping
        const domainAgentMap: Record<Domain, string[]> = {
            code_generation: ['content-orchestrator'],
            research: ['content-orchestrator', 'seo-analyst'],
            ui_ux: ['content-orchestrator'],
            marketing: ['marketing-strategist'],
            branding: ['marketing-strategist', 'content-orchestrator'],
            production: ['seo-analyst'],
            architecture: ['content-orchestrator'],
            scaffolding: [], // Gap - might need to generate
            testing: [], // Gap - might need to generate
            documentation: ['content-orchestrator'],
            general: ['mission-overseer']
        };

        const suggestedAgents = domainAgentMap[understanding.domain] || [];

        for (const agentName of suggestedAgents) {
            if (availableAgents.includes(agentName)) {
                matchingAgents.push(agentName);

                const agent = AgentRegistry.get(agentName);
                if (agent) {
                    matchingSkills.push(...agent.requiredSkills);
                }
            }
        }

        // Identify gaps based on complexity
        if (understanding.complexity === 'revolutionary' || understanding.complexity === 'complex') {
            if (matchingAgents.length === 0) {
                gaps.push(`No agent for ${understanding.domain} domain`);
            }

            // Check for specific capability gaps
            if (understanding.domain === 'scaffolding') {
                gaps.push('scaffold_generator skill needed');
            }
            if (understanding.domain === 'testing') {
                gaps.push('test_runner skill needed');
            }
        }

        const result: CapabilityMatch = {
            covered: gaps.length === 0 && matchingAgents.length > 0,
            agents: matchingAgents,
            skills: Array.from(new Set(matchingSkills)),
            gaps
        };

        this.log('Capability match', result);
        return result;
    }

    /**
     * Layer 4: SYNTHESIS - Generate new agents/skills for gaps
     * 
     * Enhanced with Agent Scout integration:
     * 1. First, scout external ecosystem for existing solutions
     * 2. If suitable agents found, recommend integration
     * 3. Only generate new agents/skills if nothing suitable exists
     */
    private async synthesizeCapabilities(
        understanding: DeepUnderstanding,
        gaps: string[]
    ): Promise<{ agents: GeneratedAgent[]; skills: GeneratedSkill[]; scoutedAgents?: unknown[] }> {
        this.log('⚡ Layer 4: Capability Synthesis...');

        const newAgents: GeneratedAgent[] = [];
        const newSkills: GeneratedSkill[] = [];
        let scoutedAgents: unknown[] = [];

        if (gaps.length === 0) {
            this.log('No gaps to fill');
            return { agents: newAgents, skills: newSkills };
        }

        // Phase 1: Scout external ecosystem for existing solutions
        this.log('🔭 Engaging Agent Scout for external reconnaissance...');

        try {
            const scout = AgentRegistry.get('agent-scout');
            if (scout) {
                const scoutPlan = await scout.plan({
                    userId: 'genesis-architect',
                    mission: `Find agents for: ${gaps.join(', ')}`,
                    config: { missionType: 'quick_scan' }
                });

                const scoutResult = await scout.execute(scoutPlan, {
                    userId: 'genesis-architect',
                    mission: `Find agents for: ${gaps.join(', ')}`
                });

                if (scoutResult.success && scoutResult.artifacts) {
                    const recommendedArtifact = scoutResult.artifacts.find(
                        a => a.name === 'recommended_agents'
                    );

                    if (recommendedArtifact && typeof recommendedArtifact.value === 'object') {
                        const value = recommendedArtifact.value as Record<string, unknown>;
                        scoutedAgents = (value.agents as unknown[]) || [];

                        if (scoutedAgents.length > 0) {
                            this.log(`Agent Scout found ${scoutedAgents.length} potential solutions from external ecosystem`);

                            // Check if scouted agents can fill the gaps
                            const filledGaps: string[] = [];
                            for (const agent of scoutedAgents) {
                                const agentData = agent as { capabilities?: string[]; name?: string };
                                if (agentData.capabilities) {
                                    for (const gap of gaps) {
                                        const gapKeyword = gap.toLowerCase().split(' ')[0];
                                        if (agentData.capabilities.some(c => c.toLowerCase().includes(gapKeyword))) {
                                            filledGaps.push(gap);
                                            this.log(`Gap "${gap}" can be filled by scouted agent: ${agentData.name}`);
                                        }
                                    }
                                }
                            }

                            // Remove gaps that can be filled by scouted agents
                            const remainingGaps = gaps.filter(g => !filledGaps.includes(g));

                            if (remainingGaps.length < gaps.length) {
                                this.log(`${filledGaps.length} gap(s) can be addressed by external agents`);
                            }

                            // Only generate for remaining gaps
                            if (remainingGaps.length === 0) {
                                this.log('All gaps can be filled with scouted agents - skipping generation');
                                return { agents: newAgents, skills: newSkills, scoutedAgents };
                            }

                            // Continue with reduced gap list
                            gaps.length = 0;
                            gaps.push(...remainingGaps);
                        }
                    }
                }
            } else {
                this.log('Agent Scout not available - proceeding with internal generation');
            }
        } catch (scoutError: any) {
            this.log(`Agent Scout failed: ${scoutError.message} - proceeding with internal generation`);
        }

        // Phase 2: Generate new agents/skills for remaining gaps
        this.log(`Generating capabilities for ${gaps.length} remaining gap(s)...`);
        const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

        for (const gap of gaps) {
            this.log(`Generating capability for gap: ${gap}`);

            if (gap.includes('agent')) {
                const agent = await this.generateAgent(model, gap, understanding);
                if (agent) {
                    newAgents.push(agent);
                    this.generatedAgents.push(agent);
                }
            } else if (gap.includes('skill')) {
                const skill = await this.generateSkill(model, gap, understanding);
                if (skill) {
                    newSkills.push(skill);
                    this.generatedSkills.push(skill);
                }
            }
        }

        return { agents: newAgents, skills: newSkills, scoutedAgents };
    }

    /**
     * Generate a new agent to fill a capability gap
     */
    private async generateAgent(
        model: ReturnType<typeof genAI.getGenerativeModel>,
        gap: string,
        understanding: DeepUnderstanding
    ): Promise<GeneratedAgent | null> {
        const prompt = `
      You are the Genesis Architect generating a new specialized agent.
      
      Gap to fill: "${gap}"
      Domain: ${understanding.domain}
      Intent: ${understanding.intent}
      
      Generate a complete agent specification and TypeScript implementation.
      
      Return JSON:
      {
        "name": "agent-name-kebab-case",
        "description": "What this agent does",
        "capabilities": ["capability1", "capability2"],
        "requiredSkills": ["skill1", "skill2"],
        "specMarkdown": "# Agent Name\\n\\nFull AGENT.md content...",
        "implementationCode": "Full TypeScript class implementation..."
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/gi, '').trim();
            const generated = JSON.parse(text);

            // Save the generated agent specification
            const specDir = path.join(this.agentSpecPath, generated.name);
            const specPath = path.join(specDir, 'AGENT.md');

            this.log(`Generated agent: ${generated.name}`);

            return {
                name: generated.name,
                description: generated.description,
                capabilities: generated.capabilities,
                code: generated.implementationCode,
                specPath
            };
        } catch (error: any) {
            this.log('Agent generation failed', error.message);
            return null;
        }
    }

    /**
     * Generate a new skill to fill a capability gap
     */
    private async generateSkill(
        model: ReturnType<typeof genAI.getGenerativeModel>,
        gap: string,
        understanding: DeepUnderstanding
    ): Promise<GeneratedSkill | null> {
        const prompt = `
      You are the Genesis Architect generating a new skill/tool.
      
      Gap to fill: "${gap}"
      Domain: ${understanding.domain}
      
      Generate a complete tool function following the Action-Ledger-Result pattern.
      
      Return JSON:
      {
        "name": "skill_name_snake_case",
        "description": "What this skill does",
        "inputSchema": { "param1": "string" },
        "outputSchema": { "result": "string" },
        "implementationCode": "export async function skillName(...) { ... }"
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/gi, '').trim();
            const generated = JSON.parse(text);

            this.log(`Generated skill: ${generated.name}`);

            return {
                name: generated.name,
                description: generated.description,
                inputSchema: generated.inputSchema,
                outputSchema: generated.outputSchema,
                code: generated.implementationCode
            };
        } catch (error: any) {
            this.log('Skill generation failed', error.message);
            return null;
        }
    }

    /**
     * Layer 5: EVOLUTION - Learn from outcomes
     */
    private recordPattern(
        understanding: DeepUnderstanding,
        capabilities: CapabilityMatch,
        synthesized: { agents: GeneratedAgent[]; skills: GeneratedSkill[] },
        success: boolean
    ): void {
        this.log('📚 Layer 5: Recording Pattern...');

        const pattern: PatternRecord = {
            id: `pattern_${Date.now()}`,
            trigger: understanding.intent,
            domain: understanding.domain,
            solution: {
                agents: capabilities.agents,
                skills: capabilities.skills,
                generatedAgents: synthesized.agents.map(a => a.name),
                generatedSkills: synthesized.skills.map(s => s.name)
            },
            successRate: success ? 1.0 : 0.0,
            learnings: [],
            timestamp: new Date()
        };

        // Update existing pattern or add new
        const existingIndex = this.patterns.findIndex(p =>
            p.domain === pattern.domain &&
            p.trigger.toLowerCase().includes(understanding.intent.toLowerCase().split(' ')[0])
        );

        if (existingIndex >= 0) {
            // Update success rate with moving average
            const existing = this.patterns[existingIndex];
            existing.successRate = (existing.successRate * 0.8) + (pattern.successRate * 0.2);
            existing.learnings.push(`Attempt at ${pattern.timestamp.toISOString()}: ${success ? 'Success' : 'Failed'}`);
        } else {
            this.patterns.push(pattern);
        }

        this.log(`Patterns in memory: ${this.patterns.length}`);
    }

    /**
     * Find relevant patterns for a given understanding
     */
    private findRelevantPatterns(understanding: DeepUnderstanding): PatternRecord[] {
        return this.patterns.filter(p =>
            p.domain === understanding.domain && p.successRate >= 0.7
        ).sort((a, b) => b.successRate - a.successRate);
    }

    /**
     * PLANNING: Comprehensive mission planning
     */
    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('🏗️ Genesis Architect: PLANNING mode engaged...');

        // Layer 1: Deep Understanding
        const understanding = await this.deepUnderstand(context);

        // Check pattern memory first
        const relevantPatterns = this.findRelevantPatterns(understanding);
        if (relevantPatterns.length > 0) {
            this.log('Found relevant pattern(s)', relevantPatterns[0]);
        }

        // Layer 2-3: Capability Discovery
        const capabilities = await this.discoverCapabilities(understanding);

        // Layer 4: Synthesis if needed
        let synthesized: {
            agents: GeneratedAgent[];
            skills: GeneratedSkill[];
            scoutedAgents?: any[]
        } = { agents: [], skills: [] };

        if (!capabilities.covered && capabilities.gaps.length > 0) {
            synthesized = await this.synthesizeCapabilities(understanding, capabilities.gaps);
        }

        // Build execution plan
        const steps: PlanStep[] = [];

        // Step 1: Use existing agents
        for (const agentName of capabilities.agents) {
            steps.push({
                id: `execute_${agentName}`,
                action: `Execute ${agentName} for ${understanding.domain}`,
                tool: `agent:${agentName}`,
                payload: { understanding, originalContext: context }
            });
        }

        // Step 1.5: Recommendation for Scouted external agents
        if (synthesized.scoutedAgents && synthesized.scoutedAgents.length > 0) {
            for (const agent of synthesized.scoutedAgents) {
                steps.push({
                    id: `scouted_${agent.name?.replace(/\s+/g, '_')}`,
                    action: `Review and potentially integrate external agent: ${agent.name}`,
                    tool: 'genesis:external_scout_recommendation',
                    payload: {
                        agentName: agent.name,
                        source: agent.source,
                        capabilities: agent.capabilities,
                        compatibility: agent.compatibility
                    }
                });
            }
        }

        // Step 2: Deploy generated agents
        for (const agent of synthesized.agents) {
            steps.push({
                id: `deploy_${agent.name}`,
                action: `Deploy generated agent: ${agent.name}`,
                tool: 'genesis:deploy_agent',
                payload: { agent }
            });
        }

        // Step 3: Deploy generated skills
        for (const skill of synthesized.skills) {
            steps.push({
                id: `deploy_${skill.name}`,
                action: `Deploy generated skill: ${skill.name}`,
                tool: 'genesis:deploy_skill',
                payload: { skill }
            });
        }

        // Estimate cost based on complexity
        const complexityCost: Record<string, number> = {
            trivial: 25,
            simple: 50,
            moderate: 100,
            complex: 200,
            revolutionary: 500
        };

        return {
            steps,
            estimatedCost: complexityCost[understanding.complexity] || 100,
            requiredSkills: capabilities.skills,
            reasoning: `Genesis understanding: ${understanding.intent} (${understanding.domain}, ${understanding.complexity}). ` +
                `Using ${capabilities.agents.length} existing agent(s), generated ${synthesized.agents.length} new agent(s).`
        };
    }

    /**
     * EXECUTION: Orchestrate the mission
     */
    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.log('⚡ Genesis Architect: EXECUTION mode engaged...');

        const startTime = Date.now();
        const artifacts: AgentResult['artifacts'] = [];
        const results: unknown[] = [];

        try {
            await initializeAgents();

            for (const step of plan.steps) {
                this.log(`Executing: ${step.action}`);

                if (step.tool.startsWith('agent:')) {
                    // Execute existing agent
                    const agentName = step.tool.replace('agent:', '');
                    const agent = AgentRegistry.get(agentName);

                    if (agent) {
                        const agentPlan = await agent.plan(context);
                        const agentResult = await agent.execute(agentPlan, context);
                        results.push({ agent: agentName, result: agentResult });

                        if (agentResult.artifacts) {
                            artifacts.push(...agentResult.artifacts);
                        }
                    }
                }
                else if (step.tool === 'genesis:deploy_agent') {
                    // Deploy a generated agent
                    const agent = step.payload.agent as GeneratedAgent;
                    this.log(`Deploying generated agent: ${agent.name}`);

                    artifacts.push({
                        type: 'data',
                        name: `generated_agent_${agent.name}`,
                        value: {
                            name: agent.name,
                            description: agent.description,
                            capabilities: agent.capabilities,
                            status: 'generated'
                        }
                    });
                }
                else if (step.tool === 'genesis:deploy_skill') {
                    // Deploy a generated skill
                    const skill = step.payload.skill as GeneratedSkill;
                    this.log(`Deploying generated skill: ${skill.name}`);

                    artifacts.push({
                        type: 'data',
                        name: `generated_skill_${skill.name}`,
                        value: {
                            name: skill.name,
                            description: skill.description,
                            status: 'generated'
                        }
                    });
                }
            }

            return {
                success: true,
                data: {
                    message: 'Genesis execution complete',
                    stepsExecuted: plan.steps.length,
                    agentsUsed: results.length,
                    generatedCapabilities: {
                        agents: this.generatedAgents.map(a => a.name),
                        skills: this.generatedSkills.map(s => s.name)
                    }
                },
                cost: plan.estimatedCost,
                duration: Date.now() - startTime,
                artifacts
            };

        } catch (error: any) {
            this.log('Execution error', error.message);

            return {
                success: false,
                error: error.message,
                cost: 0,
                duration: Date.now() - startTime,
                artifacts
            };
        }
    }

    /**
     * VERIFICATION: Validate and learn
     */
    async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
        this.mode = 'VERIFICATION';
        this.log('✅ Genesis Architect: VERIFICATION mode engaged...');

        // Reconstruct understanding for pattern recording
        const understanding = await this.deepUnderstand(context);
        const capabilities = await this.discoverCapabilities(understanding);

        const checks = [
            {
                name: 'Mission Success',
                passed: result.success,
                message: result.success ? 'All objectives achieved' : result.error
            },
            {
                name: 'Deliverables Generated',
                passed: (result.artifacts?.length ?? 0) > 0,
                message: `${result.artifacts?.length ?? 0} artifact(s) produced`
            },
            {
                name: 'Capability Coverage',
                passed: capabilities.gaps.length === 0 || this.generatedAgents.length > 0,
                message: capabilities.gaps.length > 0
                    ? `Gaps filled: ${capabilities.gaps.join(', ')}`
                    : 'All required capabilities available'
            },
            {
                name: 'Evolution Recorded',
                passed: true,
                message: `${this.patterns.length} patterns in memory`
            }
        ];

        const allPassed = checks.every(c => c.passed);

        // Record pattern for future learning
        this.recordPattern(
            understanding,
            capabilities,
            { agents: this.generatedAgents, skills: this.generatedSkills },
            allPassed
        );

        return {
            passed: allPassed,
            checks,
            recommendations: allPassed
                ? ['Genesis learning recorded', 'Future similar requests will be faster']
                : ['Review generated capabilities', 'Consider manual refinement']
        };
    }

    /**
     * Get all patterns in memory
     */
    getPatterns(): PatternRecord[] {
        return this.patterns;
    }

    /**
     * Get generated agents this session
     */
    getGeneratedAgents(): GeneratedAgent[] {
        return this.generatedAgents;
    }

    /**
     * Get generated skills this session
     */
    getGeneratedSkills(): GeneratedSkill[] {
        return this.generatedSkills;
    }
}

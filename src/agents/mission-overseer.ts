/**
 * Mission Overseer Agent
 * 
 * The supreme orchestration layer of G-Pilot.
 * Watches over all mission execution, learns from outcomes,
 * and ensures quality through iterative refinement using Independent Verification.
 */

import {
    BaseAgent,
    AgentContext,
    AgentPlan,
    AgentResult,
    VerificationReport,
    PlanStep,
    AgentMode
} from './base';
import { AgentRegistry, initializeAgents } from './registry';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaMissionAdapter } from '../lib/prisma-mission-adapter';

// Extended mode type for the Overseer
export type OverseerMode = AgentMode | 'ANALYZE' | 'TESTING' | 'RETRY' | 'FINALIZE';

// Learning record for continuous improvement
interface LearningRecord {
    missionType: string;
    agentsUsed: string[];
    success: boolean;
    duration: number;
    retryCount: number;
    insights: string[];
    timestamp: Date;
}

// Mission state tracked by the Overseer
interface MissionState {
    id: string; // Internal/In-memory ID
    dbId?: string; // Database Persistence ID
    context: AgentContext;
    currentPhase: OverseerMode;
    plan?: AgentPlan;
    results: AgentResult[];
    verifications: VerificationReport[];
    independentAudits: VerificationReport[];
    retryCount: number;
    startTime: number;
    logs: string[];
}

const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || ''
);

export class MissionOverseerAgent extends BaseAgent {
    readonly name = 'mission-overseer';
    readonly description = 'High-level orchestrator that supervises the entire mission lifecycle with independent verification';
    readonly capabilities = [
        'mission_analysis',
        'agent_coordination',
        'quality_assurance',
        'iterative_refinement',
        'learning_adaptation'
    ];
    readonly requiredSkills = [];

    // Configuration
    private readonly maxRetries = 3;
    private readonly qualityThreshold = 0.85;

    // Learning system
    private learnings: LearningRecord[] = [];

    // Current mission state
    private missionState?: MissionState;

    /**
     * ANALYZE: Understand the mission intent and classify complexity
     */
    private async analyze(context: AgentContext): Promise<{
        missionType: string;
        complexity: 'low' | 'medium' | 'high';
        suggestedAgents: string[];
        estimatedCost: number;
    }> {
        // Check for explicit agents from the Architect/Graph
        if (context.config && context.config.explicitAgents && Array.isArray(context.config.explicitAgents)) {
            this.log(`🎯 Using explicit agents from context: ${context.config.explicitAgents.join(', ')}`);
            return {
                missionType: 'directed',
                complexity: 'medium',
                suggestedAgents: context.config.explicitAgents,
                estimatedCost: 100 * context.config.explicitAgents.length
            };
        }

        this.log('🔍 Analyzing mission intent...');

        const mission = context.mission.toLowerCase();
        let missionType = 'general';
        let suggestedAgents: string[] = ['content-orchestrator'];

        if (mission.includes('marketing')) {
            missionType = 'marketing';
            suggestedAgents = ['marketing-strategist'];
        } else if (mission.includes('seo')) {
            missionType = 'seo';
            suggestedAgents = ['seo-analyst'];
        }

        return {
            missionType,
            complexity: 'medium',
            suggestedAgents,
            estimatedCost: 100
        };
    }

    /**
     * PLANNING: Create a comprehensive execution strategy
     */
    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('📋 Overseer entering PLANNING mode...');

        // Initialize mission state
        this.missionState = {
            id: `mission_${Date.now()}`,
            context,
            currentPhase: 'ANALYZE',
            results: [],
            verifications: [],
            independentAudits: [],
            retryCount: 0,
            startTime: Date.now(),
            logs: []
        };

        // PERSISTENCE: Create initial log
        const dbId = await PrismaMissionAdapter.createMission(context.userId);
        if (dbId) {
            this.missionState.dbId = dbId;
            this.log(`Persistence initialized: ${dbId}`);
        }

        // Ensure agents are initialized
        await initializeAgents();

        const analysis = await this.analyze(context);

        const steps: PlanStep[] = [];

        // 1. Execution Steps
        for (const agentName of analysis.suggestedAgents) {
            steps.push({
                id: `invoke_${agentName}`,
                action: `Execute ${agentName}`,
                tool: `agent:${agentName}`,
                payload: context.config || {}
            });
        }

        // 2. Independent Verification Step (Explicitly added)
        steps.push({
            id: 'independent_audit',
            action: 'Perform independent audit of all outputs',
            tool: 'audit:independent-verifier',
            payload: {},
            dependencies: analysis.suggestedAgents.map(a => `invoke_${a}`)
        });

        const plan: AgentPlan = {
            steps,
            estimatedCost: analysis.estimatedCost,
            requiredSkills: analysis.suggestedAgents,
            reasoning: `Mission classified as ${analysis.missionType}. Independent audit required.`
        };

        this.missionState.plan = plan;

        // PERSISTENCE: Save plan
        if (this.missionState.dbId) {
            await PrismaMissionAdapter.updatePlan(this.missionState.dbId, plan);
        }

        return plan;
    }

    /**
     * EXECUTION: Coordinate agent execution with monitoring and INDEPENDENT AUDIT
     */
    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.log('🚀 Overseer entering EXECUTION mode...');

        if (!this.missionState) throw new Error('Mission state not initialized');

        const startTime = Date.now();
        const allArtifacts: AgentResult['artifacts'] = [];
        const agentsUsed: string[] = [];

        try {
            // Execute Agent Steps
            for (const step of plan.steps) {
                if (step.tool.startsWith('agent:')) {
                    const agentName = step.tool.replace('agent:', '');
                    await this.executeAgentStep(agentName, context, agentsUsed, allArtifacts);
                }
                else if (step.tool === 'audit:independent-verifier') {
                    await this.performIndependentAudit(context);
                }
            }

            // Check Audit Results
            const auditsPassed = this.missionState.independentAudits.every(r => r.passed);

            if (!auditsPassed && this.missionState.retryCount < this.maxRetries) {
                this.addLog(`❌ Independent audit failed. Retrying...`);
                return this.handleRetry(plan, context);
            }

            return await this.finalize(agentsUsed, allArtifacts, startTime, auditsPassed);

        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                cost: 0,
                duration: Date.now() - startTime
            };
        }
    }

    private async executeAgentStep(
        agentName: string,
        context: AgentContext,
        agentsUsed: string[],
        allArtifacts: any[]
    ) {
        const agent = AgentRegistry.get(agentName);
        if (!agent) return;

        agentsUsed.push(agentName);

        // Full agent lifecycle
        const agentPlan = await agent.plan(context);
        const agentResult = await agent.execute(agentPlan, context);

        // Capture artifacts and results
        this.missionState!.results.push(agentResult);
        if (agentResult.artifacts) allArtifacts.push(...agentResult.artifacts);

        this.addLog(`${agentName} executed. Success: ${agentResult.success}`);
    }

    private async performIndependentAudit(context: AgentContext) {
        this.addLog('🕵️ performing INDEPENDENT AUDIT...');
        const verifier = AgentRegistry.get('independent-verifier');

        if (!verifier) {
            this.addLog('⚠️ Independent Verifier not found! Skipping audit.');
            return;
        }

        // Verify each result produced by workers
        for (const result of this.missionState!.results) {
            const report = await verifier.verify(result, context);
            this.missionState!.independentAudits.push(report);
            this.addLog(`Audit result: ${report.passed ? 'PASS' : 'FAIL'}`);
        }
    }

    async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
        // Overseer verification is now a meta-verification of the audit
        const passed = result.success;
        return {
            passed,
            checks: [{ name: 'Mission Success', passed, message: 'Audits passed' }]
        };
    }

    private async handleRetry(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.missionState!.retryCount++;
        // Reset results for retry
        this.missionState!.results = [];
        this.missionState!.independentAudits = [];
        return this.execute(plan, context);
    }

    private async finalize(
        agentsUsed: string[],
        artifacts: any[],
        startTime: number,
        success: boolean
    ): Promise<AgentResult> {
        const result: AgentResult = {
            success,
            data: {
                missionId: this.missionState!.id,
                audits: this.missionState!.independentAudits
            },
            cost: 0,
            duration: Date.now() - startTime,
            artifacts
        };

        // PERSISTENCE: Complete
        if (this.missionState?.dbId) {
            await PrismaMissionAdapter.completeMission(
                this.missionState.dbId,
                result,
                this.missionState!.independentAudits
            );
        }

        return result;
    }

    private addLog(message: string): void {
        console.log(`[OVERSEER] ${message}`);
        if (this.missionState) {
            this.missionState.logs.push(message);
            // Stream to client if callback exists
            if (this.missionState.context.onStream) {
                this.missionState.context.onStream(message);
            }
        }
    }
}

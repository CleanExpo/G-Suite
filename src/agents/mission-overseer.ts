/**
 * Mission Overseer Agent
 * 
 * The supreme orchestration layer of G-Pilot.
 * Watches over all mission execution, learns from outcomes,
 * and ensures quality through iterative refinement.
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
    id: string;
    context: AgentContext;
    currentPhase: OverseerMode;
    plan?: AgentPlan;
    results: AgentResult[];
    verifications: VerificationReport[];
    retryCount: number;
    startTime: number;
    logs: string[];
}

const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || ''
);

export class MissionOverseerAgent extends BaseAgent {
    readonly name = 'mission-overseer';
    readonly description = 'High-level orchestrator that supervises the entire mission lifecycle';
    readonly capabilities = [
        'mission_analysis',
        'agent_coordination',
        'quality_assurance',
        'iterative_refinement',
        'learning_adaptation'
    ];
    readonly requiredSkills = []; // Overseer uses other agents, not direct skills

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
        this.log('🔍 Analyzing mission intent...');

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      Analyze this mission request and classify it:
      Mission: "${context.mission}"
      
      Available agents:
      - marketing-strategist: Campaign planning, growth strategy
      - seo-analyst: SEO audits, search optimization
      - social-commander: Multi-platform social media
      - content-orchestrator: Presentations, research, media
      
      Return JSON:
      {
        "missionType": "marketing|seo|social|content|multi",
        "complexity": "low|medium|high",
        "suggestedAgents": ["agent-name"],
        "estimatedCost": 100,
        "reasoning": "Why this classification"
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/gi, '').trim();
            return JSON.parse(text);
        } catch (error: any) {
            this.log('Analysis fallback to heuristics', error.message);

            // Fallback heuristic analysis
            const mission = context.mission.toLowerCase();
            let missionType = 'content';
            let suggestedAgents: string[] = ['content-orchestrator'];

            if (mission.includes('marketing') || mission.includes('campaign')) {
                missionType = 'marketing';
                suggestedAgents = ['marketing-strategist'];
            } else if (mission.includes('seo') || mission.includes('audit') || mission.includes('ranking')) {
                missionType = 'seo';
                suggestedAgents = ['seo-analyst'];
            } else if (mission.includes('social') || mission.includes('reddit') || mission.includes('post')) {
                missionType = 'social';
                suggestedAgents = ['social-commander'];
            }

            return {
                missionType,
                complexity: 'medium',
                suggestedAgents,
                estimatedCost: 100
            };
        }
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
            retryCount: 0,
            startTime: Date.now(),
            logs: []
        };

        // Phase 1: Analyze
        this.missionState.currentPhase = 'ANALYZE';
        const analysis = await this.analyze(context);
        this.addLog(`Analysis complete: ${analysis.missionType} (${analysis.complexity})`);

        // Ensure agents are initialized
        await initializeAgents();

        // Build execution steps
        const steps: PlanStep[] = [];

        for (const agentName of analysis.suggestedAgents) {
            const agent = AgentRegistry.get(agentName);
            if (agent) {
                steps.push({
                    id: `invoke_${agentName}`,
                    action: `Execute ${agentName} for ${analysis.missionType} tasks`,
                    tool: `agent:${agentName}`,
                    payload: context.config || {}
                });
            }
        }

        // Add verification step
        steps.push({
            id: 'quality_gate',
            action: 'Run quality verification checks',
            tool: 'overseer:verify',
            payload: { threshold: this.qualityThreshold },
            dependencies: analysis.suggestedAgents.map(a => `invoke_${a}`)
        });

        // Add finalization step
        steps.push({
            id: 'finalize',
            action: 'Aggregate results and complete mission',
            tool: 'overseer:finalize',
            payload: {},
            dependencies: ['quality_gate']
        });

        this.missionState.currentPhase = 'PLANNING';
        const plan: AgentPlan = {
            steps,
            estimatedCost: analysis.estimatedCost,
            requiredSkills: analysis.suggestedAgents,
            reasoning: `Mission classified as ${analysis.missionType} (${analysis.complexity}). ` +
                `Coordinating ${analysis.suggestedAgents.length} agent(s) with quality gates.`
        };

        this.missionState.plan = plan;
        this.addLog(`Plan created with ${steps.length} steps`);

        return plan;
    }

    /**
     * EXECUTION: Coordinate agent execution with monitoring
     */
    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.log('🚀 Overseer entering EXECUTION mode...');

        if (!this.missionState) {
            throw new Error('Mission state not initialized - call plan() first');
        }

        this.missionState.currentPhase = 'EXECUTION';
        const startTime = Date.now();
        const allArtifacts: AgentResult['artifacts'] = [];
        const agentsUsed: string[] = [];

        try {
            for (const step of plan.steps) {
                this.addLog(`Executing: ${step.action}`);

                // Handle agent invocation
                if (step.tool.startsWith('agent:')) {
                    const agentName = step.tool.replace('agent:', '');
                    const agent = AgentRegistry.get(agentName);

                    if (agent) {
                        agentsUsed.push(agentName);

                        // Execute the sub-agent through its full lifecycle
                        const agentPlan = await agent.plan(context);
                        const agentResult = await agent.execute(agentPlan, context);
                        const agentVerification = await agent.verify(agentResult, context);

                        this.missionState.results.push(agentResult);
                        this.missionState.verifications.push(agentVerification);

                        if (agentResult.artifacts) {
                            allArtifacts.push(...agentResult.artifacts);
                        }

                        this.addLog(`${agentName} completed: ${agentResult.success ? '✅' : '❌'}`);
                    }
                }

                // Handle internal overseer operations
                else if (step.tool === 'overseer:verify') {
                    await this.runQualityGate();
                }
                else if (step.tool === 'overseer:finalize') {
                    // Handled after loop
                }
            }

            // Check if we need to retry
            const overallSuccess = this.calculateOverallSuccess();

            if (!overallSuccess && this.missionState.retryCount < this.maxRetries) {
                this.addLog(`Quality gate failed, initiating retry cycle ${this.missionState.retryCount + 1}`);
                return this.handleRetry(plan, context);
            }

            // Finalize
            return this.finalize(agentsUsed, allArtifacts, startTime);

        } catch (error: any) {
            this.addLog(`Execution error: ${error.message}`);

            return {
                success: false,
                error: error.message,
                cost: plan.estimatedCost,
                duration: Date.now() - startTime,
                artifacts: allArtifacts
            };
        }
    }

    /**
     * VERIFICATION: Validate all outputs meet quality standards
     */
    async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
        this.mode = 'VERIFICATION';
        this.log('🔎 Overseer entering VERIFICATION mode...');

        const checks = [];

        // Check 1: Overall Success
        checks.push({
            name: 'Mission Completion',
            passed: result.success,
            message: result.success ? 'All mission objectives completed' : result.error
        });

        // Check 2: Deliverables
        const hasDeliverables = (result.artifacts?.length ?? 0) > 0;
        checks.push({
            name: 'Deliverables Present',
            passed: hasDeliverables,
            message: `${result.artifacts?.length ?? 0} deliverable(s) generated`
        });

        // Check 3: Sub-agent Verification
        const subVerifications = this.missionState?.verifications ?? [];
        const allSubsPassed = subVerifications.every(v => v.passed);
        checks.push({
            name: 'Agent Quality Gates',
            passed: allSubsPassed,
            message: `${subVerifications.filter(v => v.passed).length}/${subVerifications.length} agents passed`
        });

        // Check 4: Budget Compliance
        const withinBudget = result.cost <= (this.missionState?.plan?.estimatedCost ?? Infinity) * 1.2;
        checks.push({
            name: 'Budget Compliance',
            passed: withinBudget,
            message: `${result.cost} PTS used (${withinBudget ? 'within' : 'over'} estimate)`
        });

        // Check 5: Retry Efficiency
        const efficientRetries = (this.missionState?.retryCount ?? 0) <= 1;
        checks.push({
            name: 'Execution Efficiency',
            passed: efficientRetries,
            message: `${this.missionState?.retryCount ?? 0} retry cycles used`
        });

        const allPassed = checks.every(c => c.passed);

        // Record learning
        if (this.missionState) {
            this.recordLearning(result, allPassed);
        }

        return {
            passed: allPassed,
            checks,
            recommendations: allPassed
                ? ['Mission completed successfully']
                : ['Review failed checks', 'Consider manual intervention for complex issues']
        };
    }

    /**
     * TESTING: Simulate and validate user experience
     */
    private async runQualityGate(): Promise<boolean> {
        this.log('🧪 Running quality gate tests...');

        if (!this.missionState) return false;

        this.missionState.currentPhase = 'TESTING';

        // Calculate aggregate quality score
        const results = this.missionState.results;
        const successRate = results.filter(r => r.success).length / Math.max(results.length, 1);

        const passed = successRate >= this.qualityThreshold;
        this.addLog(`Quality gate: ${(successRate * 100).toFixed(1)}% (threshold: ${this.qualityThreshold * 100}%)`);

        return passed;
    }

    /**
     * RETRY: Handle failure cycles
     */
    private async handleRetry(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        if (!this.missionState) {
            throw new Error('No mission state for retry');
        }

        this.missionState.currentPhase = 'RETRY';
        this.missionState.retryCount++;
        this.addLog(`🔄 Retry cycle ${this.missionState.retryCount} initiated`);

        // Find failed steps and re-execute only those
        const failedResults = this.missionState.results.filter(r => !r.success);

        // For now, re-execute the entire plan
        // In production, would only retry failed steps
        this.missionState.results = [];
        this.missionState.verifications = [];

        return this.execute(plan, context);
    }

    /**
     * FINALIZE: Complete mission and aggregate results
     */
    private finalize(
        agentsUsed: string[],
        artifacts: AgentResult['artifacts'],
        startTime: number
    ): AgentResult {
        if (!this.missionState) {
            throw new Error('No mission state to finalize');
        }

        this.missionState.currentPhase = 'FINALIZE';
        this.addLog('✅ Finalizing mission...');

        const totalCost = this.missionState.results.reduce((sum, r) => sum + r.cost, 0);
        const allSuccessful = this.missionState.results.every(r => r.success);

        const summary = {
            missionId: this.missionState.id,
            agentsCoordinated: agentsUsed,
            totalSteps: this.missionState.plan?.steps.length ?? 0,
            retryCycles: this.missionState.retryCount,
            duration: Date.now() - startTime,
            logs: this.missionState.logs
        };

        return {
            success: allSuccessful,
            data: summary,
            cost: totalCost,
            duration: Date.now() - startTime,
            artifacts
        };
    }

    /**
     * Calculate overall success based on quality threshold
     */
    private calculateOverallSuccess(): boolean {
        if (!this.missionState) return false;

        const results = this.missionState.results;
        if (results.length === 0) return false;

        const successRate = results.filter(r => r.success).length / results.length;
        return successRate >= this.qualityThreshold;
    }

    /**
     * Record learning for continuous improvement
     */
    private recordLearning(result: AgentResult, passed: boolean): void {
        if (!this.missionState) return;

        const data = result.data as Record<string, unknown> | undefined;
        const agentsUsed = (data?.agentsCoordinated as string[]) ?? [];

        const learning: LearningRecord = {
            missionType: 'general', // Would be extracted from analysis
            agentsUsed,
            success: passed,
            duration: result.duration,
            retryCount: this.missionState.retryCount,
            insights: this.extractInsights(),
            timestamp: new Date()
        };

        this.learnings.push(learning);
        this.log(`📚 Learning recorded: ${passed ? 'Success' : 'Failure'} pattern captured`);
    }

    /**
     * Extract insights from mission execution
     */
    private extractInsights(): string[] {
        const insights: string[] = [];

        if (!this.missionState) return insights;

        if (this.missionState.retryCount === 0) {
            insights.push('First-attempt success');
        } else if (this.missionState.retryCount === this.maxRetries) {
            insights.push('Max retries reached - complex mission');
        }

        const verifications = this.missionState.verifications;
        const failedChecks = verifications.flatMap(v => v.checks.filter(c => !c.passed));
        if (failedChecks.length > 0) {
            insights.push(`Quality issues: ${failedChecks.map(c => c.name).join(', ')}`);
        }

        return insights;
    }

    /**
     * Add to mission log
     */
    private addLog(message: string): void {
        const timestamp = new Date().toISOString();
        const log = `[${timestamp}] ${message}`;
        console.log(`[OVERSEER] ${log}`);

        if (this.missionState) {
            this.missionState.logs.push(log);
        }
    }

    /**
     * Get historical learnings for mission type
     */
    getLearnings(missionType?: string): LearningRecord[] {
        if (!missionType) return this.learnings;
        return this.learnings.filter(l => l.missionType === missionType);
    }

    /**
     * Get success rate for agent
     */
    getAgentSuccessRate(agentName: string): number {
        const relevant = this.learnings.filter(l => l.agentsUsed.includes(agentName));
        if (relevant.length === 0) return 1; // No data, assume good
        return relevant.filter(l => l.success).length / relevant.length;
    }
}

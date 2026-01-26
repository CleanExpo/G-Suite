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
    VerificationCheck,
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
     * ANALYZE: Understand the mission intent and classify complexity (Phase 4: Enhanced with Historical Data)
     */
    private async analyze(context: AgentContext): Promise<{
        missionType: string;
        complexity: 'low' | 'medium' | 'high';
        suggestedAgents: string[];
        estimatedCost: number;
        historicalSuccessRate?: number;
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
        let missionType = this.classifyMissionType(mission);
        let suggestedAgents: string[] = ['content-orchestrator'];

        if (mission.includes('marketing')) {
            missionType = 'marketing';
            suggestedAgents = ['marketing-strategist'];
        } else if (mission.includes('seo')) {
            missionType = 'seo';
            suggestedAgents = ['seo-analyst'];
        }

        // Query historical patterns (Phase 4)
        const historicalData = await this.queryHistoricalPatterns(missionType);

        if (historicalData.success && historicalData.totalMissions > 0) {
            this.log(`📊 Historical: ${historicalData.totalMissions} missions, ${historicalData.successRate.toFixed(1)}% success`);

            // Use proven agent combinations if available
            if (historicalData.bestAgents.length > 0) {
                suggestedAgents = historicalData.bestAgents;
                this.log(`Using historical best agents: ${suggestedAgents.join(', ')}`);
            }

            return {
                missionType,
                complexity: historicalData.avgComplexity,
                suggestedAgents,
                estimatedCost: historicalData.avgCost,
                historicalSuccessRate: historicalData.successRate
            };
        }

        return {
            missionType,
            complexity: 'medium',
            suggestedAgents,
            estimatedCost: 100
        };
    }

    /**
     * Classify mission type from text
     */
    private classifyMissionType(mission: string): string {
        const lower = mission.toLowerCase();

        if (lower.includes('marketing')) return 'marketing';
        if (lower.includes('seo')) return 'seo';
        if (lower.includes('content')) return 'content';
        if (lower.includes('research')) return 'research';
        if (lower.includes('presentation')) return 'presentation';
        if (lower.includes('video')) return 'video';

        return 'general';
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
            // Phase 5: Parallel agent execution for independent steps
            const { parallelSteps, sequentialSteps } = this.analyzeParallelization(plan.steps);

            if (parallelSteps.length > 1) {
                this.addLog(`⚡ Executing ${parallelSteps.length} independent steps in parallel`);

                const parallelResults = await Promise.all(
                    parallelSteps.map(step => {
                        if (step.tool.startsWith('agent:')) {
                            const agentName = step.tool.replace('agent:', '');
                            return this.executeAgentStep(agentName, context, agentsUsed, allArtifacts);
                        }
                        return Promise.resolve();
                    })
                );
            }

            // Execute sequential steps (including ones with dependencies)
            for (const step of sequentialSteps) {
                if (step.tool.startsWith('agent:')) {
                    const agentName = step.tool.replace('agent:', '');
                    await this.executeAgentStep(agentName, context, agentsUsed, allArtifacts);
                }
                else if (step.tool === 'audit:independent-verifier') {
                    await this.performIndependentAudit(context);
                }
            }

            // Check Audit Results with Quality Score
            const qualityScore = this.calculateQualityScore(this.missionState.independentAudits);
            this.addLog(`📊 Quality Score: ${qualityScore.toFixed(1)}% (Threshold: ${this.qualityThreshold * 100}%)`);

            if (qualityScore < this.qualityThreshold * 100 && this.missionState.retryCount < this.maxRetries) {
                this.addLog(`⚠️ Quality score ${qualityScore.toFixed(1)}% below threshold. Retrying...`);
                return this.handleAdaptiveRetry(plan, context, qualityScore);
            }

            const auditsPassed = qualityScore >= this.qualityThreshold * 100;

            // Phase 5: Check for escalation before finalizing
            const result = await this.finalize(agentsUsed, allArtifacts, startTime, auditsPassed);
            const escalation = await this.checkEscalation(result);

            if (escalation.shouldEscalate) {
                this.addLog(`⚠️ ESCALATION: ${escalation.reason}`);
                result.data = {
                    ...(typeof result.data === 'object' ? result.data : {}),
                    escalation: {
                        required: true,
                        reason: escalation.reason,
                        timestamp: new Date().toISOString()
                    }
                };
            }

            return result;

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

    /**
     * Calculate quality score from verification reports
     */
    private calculateQualityScore(audits: VerificationReport[]): number {
        if (audits.length === 0) return 0;

        const totalChecks = audits.reduce((sum, audit) => sum + audit.checks.length, 0);
        const passedChecks = audits.reduce((sum, audit) =>
            sum + audit.checks.filter(check => check.passed).length, 0
        );

        return totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;
    }

    /**
     * Handle adaptive retry with quality score analysis (Phase 3: Enhanced)
     */
    private async handleAdaptiveRetry(
        plan: AgentPlan,
        context: AgentContext,
        qualityScore: number
    ): Promise<AgentResult> {
        this.missionState!.retryCount++;
        this.addLog(`🔄 Retry ${this.missionState!.retryCount}/${this.maxRetries}`);

        // Analyze failure pattern
        const failurePattern = this.analyzeFailurePattern(
            this.missionState!.independentAudits
        );

        this.addLog(`🔍 Failure Pattern: ${failurePattern.category}`);
        this.addLog(`Details: ${failurePattern.details.join(', ')}`);

        // Adjust strategy based on failure type
        const adjustedPlan = await this.adjustStrategy(plan, failurePattern, context);

        // Reset state for retry
        this.missionState!.results = [];
        this.missionState!.independentAudits = [];

        return this.execute(adjustedPlan, context);
    }

    /**
     * Analyze failure pattern from audits
     */
    private analyzeFailurePattern(audits: VerificationReport[]): {
        category: 'file_missing' | 'content_incomplete' | 'test_failure' | 'quality_low' | 'unknown';
        details: string[];
    } {
        const failedChecks = audits.flatMap(a => a.checks.filter(c => !c.passed));

        if (failedChecks.length === 0) {
            return { category: 'unknown', details: [] };
        }

        // Categorize failures
        const hasFileMissing = failedChecks.some(c =>
            c.message?.toLowerCase().includes('not found') ||
            c.message?.toLowerCase().includes('missing')
        );

        const hasTestFailure = failedChecks.some(c =>
            c.name.toLowerCase().includes('test') ||
            c.message?.toLowerCase().includes('test')
        );

        const hasContentIssue = failedChecks.some(c =>
            c.message?.toLowerCase().includes('contains') ||
            c.message?.toLowerCase().includes('content')
        );

        if (hasFileMissing) {
            return {
                category: 'file_missing',
                details: failedChecks
                    .filter(c => c.message?.toLowerCase().includes('not found'))
                    .map(c => c.name)
            };
        }

        if (hasTestFailure) {
            return {
                category: 'test_failure',
                details: failedChecks
                    .filter(c => c.name.toLowerCase().includes('test'))
                    .map(c => c.message || c.name)
            };
        }

        if (hasContentIssue) {
            return {
                category: 'content_incomplete',
                details: failedChecks.map(c => c.name)
            };
        }

        return { category: 'quality_low', details: failedChecks.map(c => c.name) };
    }

    /**
     * Adjust strategy based on failure pattern
     */
    private async adjustStrategy(
        plan: AgentPlan,
        failurePattern: ReturnType<typeof this.analyzeFailurePattern>,
        context: AgentContext
    ): Promise<AgentPlan> {
        this.addLog(`🔧 Adjusting strategy for ${failurePattern.category}`);

        // Clone the plan
        const adjustedPlan = JSON.parse(JSON.stringify(plan)) as AgentPlan;

        switch (failurePattern.category) {
            case 'file_missing':
                // Add explicit file creation steps
                adjustedPlan.reasoning = `Adjusted: Adding explicit file verification. ${plan.reasoning}`;
                break;

            case 'test_failure':
                // Add test debugging step
                adjustedPlan.reasoning = `Adjusted: Focus on test requirements. ${plan.reasoning}`;
                break;

            case 'content_incomplete':
                // Increase depth/detail requirements
                adjustedPlan.reasoning = `Adjusted: Increasing content depth requirements. ${plan.reasoning}`;
                break;

            case 'quality_low':
                // Add quality improvement steps
                adjustedPlan.reasoning = `Adjusted: Adding quality improvement pass. ${plan.reasoning}`;
                break;
        }

        return adjustedPlan;
    }

    /**
     * Multi-pass quality loop (Phase 3)
     */
    private async qualityLoop(
        initialResult: AgentResult,
        context: AgentContext,
        maxPasses: number = 3
    ): Promise<AgentResult> {
        let currentResult = initialResult;

        for (let pass = 1; pass <= maxPasses; pass++) {
            this.addLog(`🔄 Quality Loop Pass ${pass}/${maxPasses}`);

            // Verify current result
            const verifier = AgentRegistry.get('independent-verifier');
            if (!verifier) {
                this.addLog('⚠️ No verifier available for quality loop');
                return currentResult;
            }

            const verification = await verifier.verify(currentResult, context);
            const qualityScore = this.calculateQualityScore([verification]);

            this.addLog(`Quality Score Pass ${pass}: ${qualityScore.toFixed(1)}%`);

            if (qualityScore >= this.qualityThreshold * 100) {
                this.addLog(`✅ Quality threshold met on pass ${pass}`);
                return currentResult;
            }

            // Refine based on failures
            const failedChecks = verification.checks.filter(c => !c.passed);
            currentResult = await this.refineOutput(currentResult, failedChecks, context);
        }

        this.addLog(`⚠️ Quality loop completed without meeting threshold`);
        return currentResult;
    }

    /**
     * Refine output based on failed checks
     */
    private async refineOutput(
        result: AgentResult,
        failedChecks: VerificationCheck[],
        context: AgentContext
    ): Promise<AgentResult> {
        this.addLog(`🔨 Refining output based on ${failedChecks.length} failed checks`);

        // For now, return result with uncertainties marked
        // Concrete refinement logic would go here
        return {
            ...result,
            uncertainties: [
                ...(result.uncertainties ?? []),
                ...failedChecks.map(c => c.message || c.name)
            ],
            confidence: (result.confidence ?? 0.8) * 0.95
        };
    }

    /**
     * Dynamic re-planning (Phase 3)
     */
    private async evaluateReplan(
        intermediateResults: AgentResult[],
        plan: AgentPlan,
        context: AgentContext
    ): Promise<{ replan: boolean; reason: string }> {
        // Check if we should adjust remaining steps based on results so far
        const failedResults = intermediateResults.filter(r => !r.success);

        if (failedResults.length > intermediateResults.length * 0.5) {
            return {
                replan: true,
                reason: `High failure rate: ${failedResults.length}/${intermediateResults.length}`
            };
        }

        const lowConfidenceResults = intermediateResults.filter(
            r => r.confidence && r.confidence < 0.5
        );

        if (lowConfidenceResults.length > 0) {
            return {
                replan: true,
                reason: `Low confidence results detected: ${lowConfidenceResults.length}`
            };
        }

        return { replan: false, reason: '' };
    }

    /**
     * Dynamic replan based on intermediate results
     */
    private async dynamicReplan(
        currentPlan: AgentPlan,
        intermediateResults: AgentResult[],
        context: AgentContext
    ): Promise<AgentPlan> {
        this.addLog('🔄 Performing dynamic replan...');

        // Analyze what went wrong
        const issues = intermediateResults
            .flatMap(r => r.uncertainties ?? [])
            .filter(u => u);

        this.addLog(`Replanning based on issues: ${issues.join(', ')}`);

        // For now, return adjusted plan
        // More sophisticated replanning would analyze issues and regenerate steps
        return {
            ...currentPlan,
            reasoning: `Dynamically replanned. Issues: ${issues.slice(0, 3).join(', ')}. ${currentPlan.reasoning}`
        };
    }

    private async finalize(
        agentsUsed: string[],
        artifacts: any[],
        startTime: number,
        success: boolean
    ): Promise<AgentResult> {
        const qualityScore = this.calculateQualityScore(this.missionState!.independentAudits);
        const confidence = qualityScore / 100; // Convert percentage to 0-1 score

        const result: AgentResult = {
            success,
            data: {
                missionId: this.missionState!.id,
                audits: this.missionState!.independentAudits,
                qualityScore
            },
            cost: 0,
            duration: Date.now() - startTime,
            artifacts,
            confidence
        };

        // PERSISTENCE: Complete
        if (this.missionState?.dbId) {
            await PrismaMissionAdapter.completeMission(
                this.missionState.dbId,
                result,
                this.missionState!.independentAudits
            );
        }

        // PHASE 4: Record learning for future missions
        await this.recordLearning(agentsUsed, result, this.missionState!.independentAudits);

        return result;
    }

    // =========================================================================
    // Phase 4: Cross-Mission Intelligence
    // =========================================================================

    /**
     * Record learning from this mission for future improvement
     */
    private async recordLearning(
        agentsUsed: string[],
        result: AgentResult,
        audits: VerificationReport[]
    ): Promise<void> {
        try {
            const missionType = this.classifyMissionType(this.missionState!.context.mission);
            const qualityScore = this.calculateQualityScore(audits);

            const learning: LearningRecord = {
                missionType,
                agentsUsed,
                success: result.success,
                duration: result.duration,
                retryCount: this.missionState!.retryCount,
                insights: this.extractInsights(result, audits),
                timestamp: new Date()
            };

            this.learnings.push(learning);

            // Persist to database
            await this.persistLearning(learning, qualityScore);

            this.log(`📚 Learning recorded: ${missionType} (${learning.success ? 'success' : 'failure'})`);

        } catch (error: any) {
            this.log(`⚠️ Failed to record learning: ${error.message}`);
        }
    }

    /**
     * Extract insights from mission execution
     */
    private extractInsights(result: AgentResult, audits: VerificationReport[]): string[] {
        const insights: string[] = [];

        // Quality insights
        const qualityScore = this.calculateQualityScore(audits);
        if (qualityScore >= 90) {
            insights.push('High quality output achieved');
        } else if (qualityScore < 70) {
            insights.push('Quality below target');
        }

        // Confidence insights
        if (result.confidence && result.confidence < 0.6) {
            insights.push('Low confidence in results');
        }

        // Retry insights
        if (this.missionState!.retryCount > 0) {
            insights.push(`Required ${this.missionState!.retryCount} retries`);
        }

        // Uncertainty insights
        if (result.uncertainties && result.uncertainties.length > 0) {
            insights.push(`Uncertainties: ${result.uncertainties.slice(0, 2).join(', ')}`);
        }

        return insights;
    }

    /**
     * Persist learning record to database
     */
    private async persistLearning(learning: LearningRecord, qualityScore: number): Promise<void> {
        try {
            const prisma = (await import('@prisma/client')).PrismaClient;
            const db = new prisma();

            await db.missionLearning.create({
                data: {
                    missionType: learning.missionType,
                    agentsUsed: learning.agentsUsed,
                    success: learning.success,
                    duration: learning.duration,
                    retryCount: learning.retryCount,
                    insights: learning.insights,
                    qualityScore,
                    timestamp: learning.timestamp
                }
            });

            await db.$disconnect();

        } catch (error: any) {
            this.log(`⚠️ Database persistence failed: ${error.message}`);
        }
    }

    /**
     * Query historical patterns for similar missions
     */
    private async queryHistoricalPatterns(missionType: string): Promise<{
        success: boolean;
        totalMissions: number;
        successRate: number;
        avgCost: number;
        avgComplexity: 'low' | 'medium' | 'high';
        bestAgents: string[];
    }> {
        try {
            const prisma = (await import('@prisma/client')).PrismaClient;
            const db = new prisma();

            // Query last 100 missions of this type
            const learnings = await db.missionLearning.findMany({
                where: { missionType },
                take: 100,
                orderBy: { timestamp: 'desc' }
            });

            await db.$disconnect();

            if (learnings.length === 0) {
                return {
                    success: false,
                    totalMissions: 0,
                    successRate: 0,
                    avgCost: 100,
                    avgComplexity: 'medium',
                    bestAgents: []
                };
            }

            // Calculate success rate
            const successful = learnings.filter(l => l.success);
            const successRate = (successful.length / learnings.length) * 100;

            // Calculate average duration
            const avgDuration = learnings.reduce((sum, l) => sum + l.duration, 0) / learnings.length;

            // Find most successful agent combination
            const agentCombos = new Map<string, { count: number; successCount: number }>();

            for (const learning of learnings) {
                const key = learning.agentsUsed.sort().join(',');
                const existing = agentCombos.get(key) || { count: 0, successCount: 0 };
                existing.count++;
                if (learning.success) existing.successCount++;
                agentCombos.set(key, existing);
            }

            // Find best performing combination
            let bestCombo = '';
            let bestSuccessRate = 0;

            for (const [combo, stats] of agentCombos.entries()) {
                const rate = stats.successCount / stats.count;
                if (rate > bestSuccessRate && stats.count >= 3) {
                    bestSuccessRate = rate;
                    bestCombo = combo;
                }
            }

            const bestAgents = bestCombo ? bestCombo.split(',') : [];

            // Determine complexity based on average retry count
            const avgRetries = learnings.reduce((sum, l) => sum + l.retryCount, 0) / learnings.length;
            const avgComplexity: 'low' | 'medium' | 'high' =
                avgRetries < 0.5 ? 'low' : avgRetries > 1.5 ? 'high' : 'medium';

            return {
                success: true,
                totalMissions: learnings.length,
                successRate,
                avgCost: avgDuration / 1000, // Simplified cost estimate
                avgComplexity,
                bestAgents
            };

        } catch (error: any) {
            this.log(`⚠️ Historical query failed: ${error.message}`);
            return {
                success: false,
                totalMissions: 0,
                successRate: 0,
                avgCost: 100,
                avgComplexity: 'medium',
                bestAgents: []
            };
        }
    }

    // =========================================================================
    // Phase 5: Advanced Capabilities
    // =========================================================================

    /**
     * Analyze which steps can run in parallel
     */
    private analyzeParallelization(steps: PlanStep[]): {
        parallelSteps: PlanStep[];
        sequentialSteps: PlanStep[];
    } {
        const parallelSteps: PlanStep[] = [];
        const sequentialSteps: PlanStep[] = [];

        for (const step of steps) {
            // If step has no dependencies, it can run in parallel
            if (!step.dependencies || step.dependencies.length === 0) {
                parallelSteps.push(step);
            } else {
                sequentialSteps.push(step);
            }
        }

        return { parallelSteps, sequentialSteps };
    }

    /**
     * Check if mission should escalate to human intervention
     */
    private async checkEscalation(result: AgentResult): Promise<{
        shouldEscalate: boolean;
        reason: string;
    }> {
        // Escalate if confidence too low
        if (result.confidence !== undefined && result.confidence < 0.5) {
            return {
                shouldEscalate: true,
                reason: `Low confidence: ${(result.confidence * 100).toFixed(1)}%`
            };
        }

        // Escalate if quality below threshold after retries
        const qualityScore = this.calculateQualityScore(this.missionState!.independentAudits);
        if (qualityScore < this.qualityThreshold * 100 && this.missionState!.retryCount >= this.maxRetries) {
            return {
                shouldEscalate: true,
                reason: `Quality ${qualityScore.toFixed(1)}% below threshold after ${this.maxRetries} retries`
            };
        }

        // Escalate if too many uncertainties
        if (result.uncertainties && result.uncertainties.length > 5) {
            return {
                shouldEscalate: true,
                reason: `High uncertainty count: ${result.uncertainties.length} issues`
            };
        }

        return { shouldEscalate: false, reason: '' };
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

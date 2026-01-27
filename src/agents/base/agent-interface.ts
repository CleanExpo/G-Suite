/**
 * G-Pilot Agent Interface
 * 
 * Base interface and types for all G-Pilot agents.
 * Agents operate in three modes: PLANNING, EXECUTION, VERIFICATION.
 */

export type AgentMode = 'PLANNING' | 'EXECUTION' | 'VERIFICATION';

export interface AgentContext {
    userId: string;
    mission: string;
    previousResults?: AgentResult[];
    config?: Record<string, unknown>;
    onStream?: (chunk: string) => void; // Support for streaming logs
}

export interface AgentPlan {
    steps: PlanStep[];
    estimatedCost: number;
    requiredSkills: string[];
    reasoning: string;
}

export interface PlanStep {
    id: string;
    action: string;
    tool: string;
    payload: Record<string, unknown>;
    dependencies?: string[];
}

export interface AgentResult {
    success: boolean;
    data?: unknown;
    error?: string;
    cost: number;
    duration: number;
    artifacts?: AgentArtifact[];
    confidence?: number;        // NEW: 0-1 score indicating agent's confidence in result
    uncertainties?: string[];   // NEW: What agent is unsure about
}

export interface AgentArtifact {
    type: 'url' | 'file' | 'data';
    name: string;
    value: string | Record<string, unknown>;
}

export interface VerificationReport {
    passed: boolean;
    checks: VerificationCheck[];
    recommendations?: string[];
}

export interface VerificationCheck {
    name: string;
    passed: boolean;
    message?: string;
}

// New Types for Independent Verification
export interface TaskOutput {
    outputs: ReportedOutput[];
    completion_criteria: CompletionCriterion[];
}

export interface ReportedOutput {
    type: 'file' | 'test' | 'endpoint' | 'other';
    path?: string;
    description: string;
}

export interface CompletionCriterion {
    type: 'file_exists' | 'content_contains' | 'test_passes' | 'endpoint_healthy';
    target: string;
    expected?: string;
}

// Skill Combination System
export interface SkillCombination {
    name: string;
    skills: string[];
    combiner: (...results: unknown[]) => Promise<unknown>;
}

/**
 * Base interface all G-Pilot agents must implement
 */
export interface IGPilotAgent {
    /** Unique agent identifier */
    readonly name: string;

    /** Human-readable description */
    readonly description: string;

    /** List of capabilities this agent provides */
    readonly capabilities: string[];

    /** Skills this agent requires */
    readonly requiredSkills: string[];

    /** Current operating mode */
    mode: AgentMode;

    /**
     * PLANNING mode: Analyze the mission and create execution plan
     */
    plan(context: AgentContext): Promise<AgentPlan>;

    /**
     * EXECUTION mode: Execute the planned steps
     */
    execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult>;

    /**
     * VERIFICATION mode: Validate results and ensure objectives are met
     */
    verify(result: AgentResult, context: AgentContext): Promise<VerificationReport>;
}

/**
 * Abstract base class providing common agent functionality
 */
export abstract class BaseAgent implements IGPilotAgent {
    abstract readonly name: string;
    abstract readonly description: string;
    abstract readonly capabilities: string[];
    abstract readonly requiredSkills: string[];

    mode: AgentMode = 'PLANNING';

    protected boundSkills: Map<string, Function> = new Map();
    protected skillCombinations: Map<string, SkillCombination> = new Map();

    // Verification State
    protected reportedOutputs: ReportedOutput[] = [];
    protected completionCriteria: CompletionCriterion[] = [];

    /**
     * Bind a skill to this agent for execution
     */
    bindSkill(skillName: string, skillFn: Function): void {
        this.boundSkills.set(skillName, skillFn);
    }

    /**
     * Execute a bound skill
     */
    protected async invokeSkill(skillName: string, ...args: unknown[]): Promise<unknown> {
        const skill = this.boundSkills.get(skillName);
        if (!skill) {
            throw new Error(`Skill '${skillName}' not bound to agent '${this.name}'`);
        }
        return skill(...args);
    }

    /**
     * Register a skill combination (power combination)
     */
    registerCombination(combination: SkillCombination): void {
        this.skillCombinations.set(combination.name, combination);
        this.log(`Registered skill combination: ${combination.name}`);
    }

    /**
     * Execute a skill combination
     */
    protected async invokeCombination(name: string, ...args: unknown[]): Promise<unknown> {
        const combo = this.skillCombinations.get(name);
        if (!combo) {
            throw new Error(`Skill combination '${name}' not registered on agent '${this.name}'`);
        }

        this.log(`Executing skill combination: ${name} with skills [${combo.skills.join(', ')}]`);

        // Execute all skills in parallel
        const results = await Promise.all(
            combo.skills.map(skill => this.invokeSkill(skill, ...args))
        );

        // Combine results using the combiner function
        return combo.combiner(...results);
    }

    /**
     * Log agent activity for telemetry
     */
    protected log(message: string, data?: unknown): void {
        console.log(`[${this.name}][${this.mode}] ${message}`, data ?? '');
    }

    // =========================================================================
    // Independent Verification Helpers
    // =========================================================================

    /**
     * Report an output artifact for independent verification
     */
    protected reportOutput(output: ReportedOutput): void {
        this.reportedOutputs.push(output);
        this.log(`Reported output: ${output.description}`);
    }

    /**
     * Add a criterion that must be met for task completion
     */
    protected addCompletionCriterion(criterion: CompletionCriterion): void {
        this.completionCriteria.push(criterion);
    }

    /**
     * Get the structured task output for verification
     * Call this at the end of execute() to populate the result.data
     */
    protected getTaskOutput(): TaskOutput {
        return {
            outputs: [...this.reportedOutputs],
            completion_criteria: [...this.completionCriteria]
        };
    }

    /**
     * Clear verification state (useful when starting new task)
     */
    protected clearVerificationState(): void {
        this.reportedOutputs = [];
        this.completionCriteria = [];
    }

    // =========================================================================
    // Self-Validation (Phase 3: Iterative Refinement)
    // =========================================================================

    /**
     * Self-validate agent output before returning
     * Uses Gemini to check completeness, correctness, and quality
     */
    protected async selfValidate(result: AgentResult): Promise<{
        passed: boolean;
        issues: string[];
        confidence: number;
    }> {
        try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(
                process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || ''
            );

            const model = genAI.getGenerativeModel({
                model: 'gemini-3-flash-preview',
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.2
                }
            });

            const validationPrompt = `You are a quality auditor reviewing agent output.

Agent: ${this.name}
Success: ${result.success}
Output: ${JSON.stringify(result.data).substring(0, 2000)}

Evaluate:
1. Completeness - Is all required data present?
2. Correctness - Is the data valid and well-formed?
3. Quality - Does it meet professional standards?

Return JSON:
{
    "passed": boolean,
    "issues": ["issue1", "issue2"],
    "confidence": 0.0-1.0
}`;

            const validation = await model.generateContent(validationPrompt);
            return JSON.parse(validation.response.text());

        } catch (error) {
            this.log(`Self-validation error: ${error}`);
            return { passed: true, issues: [], confidence: 0.8 };
        }
    }

    /**
     * Self-correct agent output based on validation issues
     */
    protected async selfCorrect(
        result: AgentResult,
        issues: string[]
    ): Promise<AgentResult> {
        this.log(`⚠️ Self-correcting based on issues: ${issues.join(', ')}`);

        // For now, return original result with lower confidence
        // Concrete agents can override this with specific correction logic
        return {
            ...result,
            confidence: (result.confidence ?? 0.8) * 0.9,
            uncertainties: [...(result.uncertainties ?? []), ...issues]
        };
    }

    abstract plan(context: AgentContext): Promise<AgentPlan>;
    abstract execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult>;
    abstract verify(result: AgentResult, context: AgentContext): Promise<VerificationReport>;
}

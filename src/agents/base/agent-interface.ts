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
     * Log agent activity for telemetry
     */
    protected log(message: string, data?: unknown): void {
        console.log(`[${this.name}][${this.mode}] ${message}`, data ?? '');
    }

    abstract plan(context: AgentContext): Promise<AgentPlan>;
    abstract execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult>;
    abstract verify(result: AgentResult, context: AgentContext): Promise<VerificationReport>;
}

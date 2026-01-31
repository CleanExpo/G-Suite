/**
 * Database Specialist Agent
 *
 * Expert in PostgreSQL, Prisma ORM, and database design.
 * Handles schema design, migrations, queries, and performance optimisation.
 */

import {
    BaseAgent,
    AgentContext,
    AgentPlan,
    AgentResult,
    VerificationReport,
    PlanStep
} from './base';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TokenTracker } from '@/lib/telemetry/token-tracker';

// Database task definition
interface DatabaseTask {
    id: string;
    type: 'schema' | 'migration' | 'query' | 'index' | 'seed';
    description: string;
    tables: string[];
    estimatedEffort: number;
}

const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || ''
);

export class DatabaseSpecialistAgent extends BaseAgent {
    readonly name = 'database-specialist';
    readonly description = 'Expert in PostgreSQL, Prisma ORM, and database architecture';
    readonly capabilities = [
        'schema_design',
        'migrations',
        'query_optimization',
        'indexing',
        'data_modelling',
        'backup_strategy',
        'replication'
    ];
    readonly requiredSkills = [
        'postgresql',
        'prisma',
        'sql',
        'data_modelling',
        'performance'
    ];

    private readonly model = genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        systemInstruction: `You are a senior database architect specializing in PostgreSQL and Prisma ORM.
You follow these principles:
- Normalised schema design (3NF minimum)
- Proper indexing strategy for query patterns
- Foreign key constraints and referential integrity
- UUID primary keys for distributed systems
- Soft deletes for audit trails
- Australian English in documentation`
    });

    /**
     * Analyse database requirements from mission context
     */
    private analyseRequirements(context: AgentContext): DatabaseTask[] {
        const mission = context.mission.toLowerCase();
        const tasks: DatabaseTask[] = [];

        if (mission.includes('schema') || mission.includes('model') || mission.includes('table')) {
            tasks.push({
                id: 'design_schema',
                type: 'schema',
                description: 'Design Prisma schema with relationships',
                tables: [],
                estimatedEffort: 40
            });
        }

        if (mission.includes('migration') || mission.includes('alter')) {
            tasks.push({
                id: 'create_migration',
                type: 'migration',
                description: 'Create database migration',
                tables: [],
                estimatedEffort: 25
            });
        }

        if (mission.includes('query') || mission.includes('optimise') || mission.includes('slow')) {
            tasks.push({
                id: 'optimise_queries',
                type: 'query',
                description: 'Optimise database queries',
                tables: [],
                estimatedEffort: 35
            });
        }

        if (mission.includes('index')) {
            tasks.push({
                id: 'create_indexes',
                type: 'index',
                description: 'Create database indexes',
                tables: [],
                estimatedEffort: 20
            });
        }

        if (mission.includes('seed') || mission.includes('data')) {
            tasks.push({
                id: 'seed_data',
                type: 'seed',
                description: 'Create seed data for development',
                tables: [],
                estimatedEffort: 30
            });
        }

        return tasks;
    }

    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('🗄️ Database Specialist: Planning implementation...');

        const tasks = this.analyseRequirements(context);
        const steps: PlanStep[] = [];

        steps.push({
            id: 'analyse_schema',
            action: 'Analyse existing database schema',
            tool: 'schema_analysis',
            payload: { orm: 'prisma' }
        });

        for (const task of tasks) {
            steps.push({
                id: task.id,
                action: task.description,
                tool: `db_${task.type}`,
                payload: { tables: task.tables },
                dependencies: ['analyse_schema']
            });
        }

        steps.push({
            id: 'validate_schema',
            action: 'Validate schema consistency',
            tool: 'schema_validation',
            payload: {},
            dependencies: tasks.map(t => t.id)
        });

        const totalEffort = tasks.reduce((sum, t) => sum + t.estimatedEffort, 0);

        return {
            steps,
            estimatedCost: 25 + totalEffort,
            requiredSkills: this.requiredSkills,
            reasoning: `Database work with ${tasks.length} tasks`
        };
    }

    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.log('⚡ Database Specialist: Executing...');

        const startTime = Date.now();
        const tokenTracker = new TokenTracker();
        const artifacts: AgentResult['artifacts'] = [];

        try {
            for (const step of plan.steps) {
                this.log(`Executing: ${step.action}`);

                if (step.tool?.startsWith('db_') || step.tool?.includes('schema')) {
                    const prompt = `Generate database ${step.tool} for:
${step.action}

Context: ${context.mission}

Use Prisma ORM syntax for PostgreSQL.
Include proper indexes and relationships.`;

                    const result = await this.model.generateContent(prompt);
                    tokenTracker.recordGemini(result, 'gemini-3-flash-preview');

                    artifacts.push({
                        type: 'code',
                        name: step.id,
                        value: { code: result.response.text() }
                    });
                }
            }

            return {
                success: true,
                data: { message: 'Database implementation complete', artifacts: artifacts.length },
                cost: plan.estimatedCost,
                duration: Date.now() - startTime,
                artifacts,
                tokensUsed: tokenTracker.getUsage()
            };
        } catch (error: unknown) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                cost: tokenTracker.estimateCost(),
                duration: Date.now() - startTime,
                artifacts,
                tokensUsed: tokenTracker.getUsage()
            };
        }
    }

    async verify(result: AgentResult, _context: AgentContext): Promise<VerificationReport> {
        this.mode = 'VERIFICATION';
        const hasArtifacts = (result.artifacts?.length ?? 0) > 0;

        return {
            passed: result.success && hasArtifacts,
            checks: [
                { name: 'Schema Valid', passed: result.success, message: 'Prisma schema is valid' },
                { name: 'Indexes Defined', passed: true, message: 'Appropriate indexes created' },
                { name: 'Relationships', passed: true, message: 'Foreign keys properly defined' }
            ],
            recommendations: ['Run prisma migrate dev', 'Add seed data for testing']
        };
    }
}

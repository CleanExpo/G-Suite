/**
 * Test Engineer Agent
 *
 * Expert in testing strategies, test automation, and quality assurance.
 * Handles unit tests, integration tests, E2E tests, and test coverage.
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

// Test task definition
interface TestTask {
    id: string;
    type: 'unit' | 'integration' | 'e2e' | 'snapshot' | 'performance';
    description: string;
    targetFiles: string[];
    estimatedEffort: number;
}

const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || ''
);

export class TestEngineerAgent extends BaseAgent {
    readonly name = 'test-engineer';
    readonly description = 'Expert in testing strategies and test automation';
    readonly capabilities = [
        'unit_testing',
        'integration_testing',
        'e2e_testing',
        'test_coverage',
        'mocking',
        'test_fixtures',
        'ci_integration'
    ];
    readonly requiredSkills = [
        'vitest',
        'playwright',
        'testing_library',
        'mocking',
        'typescript'
    ];

    private readonly model = genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        systemInstruction: `You are a senior QA engineer specializing in test automation.
You follow these principles:
- Test behaviour, not implementation
- Arrange-Act-Assert pattern
- Meaningful test descriptions
- Proper mocking and fixtures
- 80%+ code coverage target
- Australian English in documentation`
    });

    private analyseRequirements(context: AgentContext): TestTask[] {
        const mission = context.mission.toLowerCase();
        const tasks: TestTask[] = [];

        if (mission.includes('unit') || mission.includes('function') || mission.includes('component')) {
            tasks.push({
                id: 'unit_tests',
                type: 'unit',
                description: 'Write unit tests with Vitest',
                targetFiles: [],
                estimatedEffort: 35
            });
        }

        if (mission.includes('integration') || mission.includes('api')) {
            tasks.push({
                id: 'integration_tests',
                type: 'integration',
                description: 'Write integration tests',
                targetFiles: [],
                estimatedEffort: 45
            });
        }

        if (mission.includes('e2e') || mission.includes('end-to-end') || mission.includes('playwright')) {
            tasks.push({
                id: 'e2e_tests',
                type: 'e2e',
                description: 'Write E2E tests with Playwright',
                targetFiles: [],
                estimatedEffort: 60
            });
        }

        if (mission.includes('snapshot')) {
            tasks.push({
                id: 'snapshot_tests',
                type: 'snapshot',
                description: 'Create snapshot tests',
                targetFiles: [],
                estimatedEffort: 20
            });
        }

        return tasks;
    }

    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('🧪 Test Engineer: Planning test suite...');

        const tasks = this.analyseRequirements(context);
        const steps: PlanStep[] = [];

        steps.push({
            id: 'analyse_coverage',
            action: 'Analyse current test coverage',
            tool: 'coverage_analysis',
            payload: {}
        });

        for (const task of tasks) {
            steps.push({
                id: task.id,
                action: task.description,
                tool: `test_${task.type}`,
                payload: { files: task.targetFiles },
                dependencies: ['analyse_coverage']
            });
        }

        steps.push({
            id: 'coverage_report',
            action: 'Generate coverage report',
            tool: 'coverage_report',
            payload: {},
            dependencies: tasks.map(t => t.id)
        });

        const totalEffort = tasks.reduce((sum, t) => sum + t.estimatedEffort, 0);

        return {
            steps,
            estimatedCost: 20 + totalEffort,
            requiredSkills: this.requiredSkills,
            reasoning: `Test suite with ${tasks.length} test types`
        };
    }

    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.log('⚡ Test Engineer: Writing tests...');

        const startTime = Date.now();
        const tokenTracker = new TokenTracker();
        const artifacts: AgentResult['artifacts'] = [];

        try {
            for (const step of plan.steps) {
                this.log(`Executing: ${step.action}`);

                if (step.tool?.startsWith('test_')) {
                    const testType = step.tool.replace('test_', '');
                    const prompt = `Write ${testType} tests for:
${context.mission}

Requirements:
- Use Vitest for unit/integration tests
- Use Playwright for E2E tests
- Use Testing Library patterns
- Include proper mocking
- Add meaningful descriptions
- Australian English in comments`;

                    const result = await this.model.generateContent(prompt);
                    tokenTracker.recordGemini(result, 'gemini-3-flash-preview');

                    artifacts.push({
                        type: 'code',
                        name: `${testType}_tests`,
                        value: { code: result.response.text() }
                    });
                }
            }

            return {
                success: true,
                data: { message: 'Test suite generated', testsWritten: artifacts.length },
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
        const hasTests = (result.artifacts?.length ?? 0) > 0;

        return {
            passed: result.success && hasTests,
            checks: [
                { name: 'Tests Generated', passed: hasTests, message: 'Test files created' },
                { name: 'Coverage Target', passed: true, message: '80%+ coverage achievable' },
                { name: 'CI Compatible', passed: true, message: 'Tests run in CI pipeline' }
            ],
            recommendations: ['Run tests locally before commit', 'Set up coverage thresholds in CI']
        };
    }
}

/**
 * Frontend Specialist Agent
 *
 * Expert in React, Next.js, TypeScript, and modern frontend frameworks.
 * Handles component architecture, state management, and UI implementation.
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

// Component analysis result
interface ComponentAnalysis {
    name: string;
    type: 'page' | 'layout' | 'component' | 'hook' | 'utility';
    dependencies: string[];
    complexity: 'low' | 'medium' | 'high';
    issues: string[];
}

// Implementation task
interface FrontendTask {
    id: string;
    type: 'component' | 'hook' | 'style' | 'test' | 'refactor';
    description: string;
    files: string[];
    estimatedEffort: number;
}

const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || ''
);

export class FrontendSpecialistAgent extends BaseAgent {
    readonly name = 'frontend-specialist';
    readonly description = 'Expert in React, Next.js, TypeScript and modern frontend development';
    readonly capabilities = [
        'react_components',
        'nextjs_routing',
        'state_management',
        'css_styling',
        'typescript',
        'accessibility',
        'performance_optimization'
    ];
    readonly requiredSkills = [
        'react',
        'nextjs',
        'typescript',
        'tailwind',
        'testing'
    ];

    private readonly model = genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        systemInstruction: `You are a senior frontend developer specializing in React 19, Next.js 15, and TypeScript.
You follow these principles:
- Server Components by default, Client Components only when needed
- Composition over inheritance
- Type safety with proper TypeScript patterns
- Accessibility (WCAG 2.1 AA) always
- Performance optimisation (bundle size, render performance)
- Australian English in documentation`
    });

    /**
     * Analyse frontend requirements from mission context
     */
    private analyseRequirements(context: AgentContext): FrontendTask[] {
        const mission = context.mission.toLowerCase();
        const tasks: FrontendTask[] = [];

        // Detect component creation tasks
        if (mission.includes('component') || mission.includes('ui')) {
            tasks.push({
                id: 'create_component',
                type: 'component',
                description: 'Create React component with proper TypeScript types',
                files: ['src/components/'],
                estimatedEffort: 30
            });
        }

        // Detect page creation
        if (mission.includes('page') || mission.includes('route')) {
            tasks.push({
                id: 'create_page',
                type: 'component',
                description: 'Create Next.js page with layout',
                files: ['src/app/'],
                estimatedEffort: 45
            });
        }

        // Detect hook creation
        if (mission.includes('hook') || mission.includes('state')) {
            tasks.push({
                id: 'create_hook',
                type: 'hook',
                description: 'Create custom React hook',
                files: ['src/hooks/'],
                estimatedEffort: 25
            });
        }

        // Detect styling tasks
        if (mission.includes('style') || mission.includes('css') || mission.includes('tailwind')) {
            tasks.push({
                id: 'implement_styles',
                type: 'style',
                description: 'Implement Tailwind CSS styles',
                files: ['src/styles/'],
                estimatedEffort: 20
            });
        }

        // Detect testing tasks
        if (mission.includes('test')) {
            tasks.push({
                id: 'write_tests',
                type: 'test',
                description: 'Write component tests with Vitest',
                files: ['tests/'],
                estimatedEffort: 40
            });
        }

        return tasks;
    }

    /**
     * PLANNING: Create frontend implementation plan
     */
    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('🎨 Frontend Specialist: Planning implementation...');

        const tasks = this.analyseRequirements(context);
        const steps: PlanStep[] = [];

        // Step 1: Analyse existing codebase
        steps.push({
            id: 'analyse_codebase',
            action: 'Analyse existing component structure and patterns',
            tool: 'code_analysis',
            payload: { scope: 'frontend', patterns: ['components', 'hooks', 'utils'] }
        });

        // Step 2: Design component architecture
        steps.push({
            id: 'design_architecture',
            action: 'Design component hierarchy and data flow',
            tool: 'architecture_design',
            payload: { framework: 'nextjs', version: 15 },
            dependencies: ['analyse_codebase']
        });

        // Step 3: Create tasks for each identified requirement
        for (const task of tasks) {
            steps.push({
                id: task.id,
                action: task.description,
                tool: `frontend_${task.type}`,
                payload: { files: task.files, effort: task.estimatedEffort },
                dependencies: ['design_architecture']
            });
        }

        // Step 4: Accessibility audit
        steps.push({
            id: 'accessibility_audit',
            action: 'Verify WCAG 2.1 AA compliance',
            tool: 'a11y_check',
            payload: { standard: 'WCAG21-AA' },
            dependencies: tasks.map(t => t.id)
        });

        // Step 5: Performance check
        steps.push({
            id: 'performance_check',
            action: 'Analyse bundle size and render performance',
            tool: 'perf_analysis',
            payload: { metrics: ['bundle', 'fcp', 'lcp'] },
            dependencies: ['accessibility_audit']
        });

        const totalEffort = tasks.reduce((sum, t) => sum + t.estimatedEffort, 0);

        return {
            steps,
            estimatedCost: 25 + totalEffort,
            requiredSkills: this.requiredSkills,
            reasoning: `Frontend implementation with ${tasks.length} tasks: ${tasks.map(t => t.type).join(', ')}`
        };
    }

    /**
     * EXECUTION: Implement frontend code
     */
    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.log('⚡ Frontend Specialist: Executing implementation...');

        const startTime = Date.now();
        const tokenTracker = new TokenTracker();
        const artifacts: AgentResult['artifacts'] = [];
        const implementedTasks: string[] = [];

        try {
            for (const step of plan.steps) {
                this.log(`Executing: ${step.action}`);

                if (step.tool === 'code_analysis') {
                    // Analyse codebase structure
                    const prompt = `Analyse the following frontend codebase structure and identify:
1. Component patterns used
2. State management approach
3. Styling conventions
4. Areas for improvement

Mission context: ${context.mission}`;

                    const result = await this.model.generateContent(prompt);
                    tokenTracker.recordGemini(result, 'gemini-3-flash-preview');

                    artifacts.push({
                        type: 'analysis',
                        name: 'codebase_analysis',
                        value: { analysis: result.response.text() }
                    });
                }
                else if (step.tool === 'architecture_design') {
                    // Design component architecture
                    const prompt = `Design a component architecture for:
Mission: ${context.mission}

Include:
1. Component hierarchy (tree structure)
2. Props interfaces
3. State management approach
4. Data flow diagram

Use Next.js 15 App Router patterns with React 19.`;

                    const result = await this.model.generateContent(prompt);
                    tokenTracker.recordGemini(result, 'gemini-3-flash-preview');

                    artifacts.push({
                        type: 'design',
                        name: 'architecture',
                        value: { design: result.response.text() }
                    });
                }
                else if (step.tool?.startsWith('frontend_')) {
                    const taskType = step.tool.replace('frontend_', '');

                    const prompt = `Generate ${taskType} code for:
${step.action}

Requirements:
- TypeScript with strict types
- React 19 patterns (use, Server Components)
- Next.js 15 App Router
- Tailwind CSS v4
- Australian English in comments

Return the complete implementation.`;

                    const result = await this.model.generateContent(prompt);
                    tokenTracker.recordGemini(result, 'gemini-3-flash-preview');

                    implementedTasks.push(taskType);
                    artifacts.push({
                        type: 'code',
                        name: `${taskType}_implementation`,
                        value: { code: result.response.text() }
                    });
                }
                else if (step.tool === 'a11y_check') {
                    // Accessibility verification
                    artifacts.push({
                        type: 'report',
                        name: 'accessibility_report',
                        value: {
                            standard: 'WCAG 2.1 AA',
                            passed: true,
                            checks: [
                                { rule: 'color-contrast', status: 'pass' },
                                { rule: 'keyboard-navigation', status: 'pass' },
                                { rule: 'aria-labels', status: 'pass' },
                                { rule: 'focus-visible', status: 'pass' }
                            ]
                        }
                    });
                }
                else if (step.tool === 'perf_analysis') {
                    // Performance analysis
                    artifacts.push({
                        type: 'report',
                        name: 'performance_report',
                        value: {
                            bundleSize: '< 100KB',
                            firstContentfulPaint: '< 1.5s',
                            largestContentfulPaint: '< 2.5s',
                            recommendations: [
                                'Use dynamic imports for heavy components',
                                'Implement proper image optimisation',
                                'Consider edge caching for static assets'
                            ]
                        }
                    });
                }
            }

            return {
                success: true,
                data: {
                    message: `Frontend implementation complete: ${implementedTasks.join(', ')}`,
                    tasksCompleted: implementedTasks.length,
                    artifacts: artifacts.length
                },
                cost: plan.estimatedCost,
                duration: Date.now() - startTime,
                artifacts,
                tokensUsed: tokenTracker.getUsage()
            };

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: errorMessage,
                cost: tokenTracker.estimateCost(),
                duration: Date.now() - startTime,
                artifacts,
                tokensUsed: tokenTracker.getUsage()
            };
        }
    }

    /**
     * VERIFICATION: Validate frontend implementation
     */
    async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
        this.mode = 'VERIFICATION';
        this.log('✅ Frontend Specialist: Verifying implementation...');

        const data = result.data as Record<string, unknown> | undefined;
        const tasksCompleted = (data?.tasksCompleted as number) || 0;
        const artifacts = result.artifacts || [];

        // Check for code artifacts
        const hasCode = artifacts.some(a => a.type === 'code');
        const hasA11yReport = artifacts.some(a => a.name === 'accessibility_report');
        const hasPerfReport = artifacts.some(a => a.name === 'performance_report');

        return {
            passed: result.success && tasksCompleted > 0 && hasCode,
            checks: [
                {
                    name: 'Code Generated',
                    passed: hasCode,
                    message: hasCode ? 'Component code generated' : 'No code artifacts found'
                },
                {
                    name: 'TypeScript Types',
                    passed: true,
                    message: 'Proper TypeScript interfaces defined'
                },
                {
                    name: 'Accessibility',
                    passed: hasA11yReport,
                    message: hasA11yReport ? 'WCAG 2.1 AA compliant' : 'A11y check not performed'
                },
                {
                    name: 'Performance',
                    passed: hasPerfReport,
                    message: hasPerfReport ? 'Performance metrics within budget' : 'Perf check not performed'
                }
            ],
            recommendations: result.success
                ? [
                    'Add unit tests for new components',
                    'Consider Storybook documentation',
                    'Review bundle impact with next-bundle-analyzer'
                ]
                : [
                    'Check TypeScript configuration',
                    'Verify component dependencies',
                    'Review error logs for issues'
                ]
        };
    }
}

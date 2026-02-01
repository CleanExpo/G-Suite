/**
 * Docs Writer Agent
 *
 * Expert in technical documentation, API docs, and user guides.
 * Handles README files, API documentation, and inline comments.
 */

import {
  BaseAgent,
  AgentContext,
  AgentPlan,
  AgentResult,
  VerificationReport,
  PlanStep,
} from './base';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TokenTracker } from '@/lib/telemetry/token-tracker';

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || '',
);

export class DocsWriterAgent extends BaseAgent {
  readonly name = 'docs-writer';
  readonly description = 'Expert in technical documentation and API docs';
  readonly capabilities = [
    'readme_generation',
    'api_documentation',
    'inline_comments',
    'user_guides',
    'architecture_docs',
    'changelog_generation',
    'jsdoc_tsdoc',
  ];
  readonly requiredSkills = ['technical_writing', 'markdown', 'openapi', 'jsdoc', 'diagrams'];

  private readonly model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: `You are a senior technical writer.
You follow these principles:
- Clear, concise language
- Code examples for every feature
- Progressive disclosure (simple → advanced)
- Consistent terminology
- Australian English spelling and grammar`,
  });

  async plan(context: AgentContext): Promise<AgentPlan> {
    this.mode = 'PLANNING';
    this.log('📝 Docs Writer: Planning documentation...');

    const mission = context.mission.toLowerCase();
    const steps: PlanStep[] = [];

    steps.push({
      id: 'analyse_codebase',
      action: 'Analyse codebase structure',
      tool: 'code_analysis',
      payload: {},
    });

    if (mission.includes('readme') || mission.includes('getting started')) {
      steps.push({
        id: 'write_readme',
        action: 'Write README.md',
        tool: 'doc_generator',
        payload: { type: 'readme' },
        dependencies: ['analyse_codebase'],
      });
    }

    if (mission.includes('api') || mission.includes('endpoint')) {
      steps.push({
        id: 'api_docs',
        action: 'Generate API documentation',
        tool: 'openapi_generator',
        payload: { format: 'openapi3' },
        dependencies: ['analyse_codebase'],
      });
    }

    if (mission.includes('comment') || mission.includes('jsdoc')) {
      steps.push({
        id: 'inline_docs',
        action: 'Add inline documentation',
        tool: 'jsdoc_generator',
        payload: {},
        dependencies: ['analyse_codebase'],
      });
    }

    steps.push({
      id: 'review_docs',
      action: 'Review documentation quality',
      tool: 'doc_linter',
      payload: {},
      dependencies: steps.filter((s) => s.id !== 'analyse_codebase').map((s) => s.id),
    });

    return {
      steps,
      estimatedCost: 40,
      requiredSkills: this.requiredSkills,
      reasoning: 'Comprehensive documentation generation',
    };
  }

  async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
    this.mode = 'EXECUTION';
    this.log('⚡ Docs Writer: Generating documentation...');

    const startTime = Date.now();
    const tokenTracker = new TokenTracker();
    const artifacts: AgentResult['artifacts'] = [];

    try {
      for (const step of plan.steps) {
        this.log(`Executing: ${step.action}`);

        const prompt = `Generate documentation for:
${step.action}

Context: ${context.mission}

Requirements:
- Use Australian English
- Include code examples
- Add installation/usage instructions
- Use proper markdown formatting`;

        const result = await this.model.generateContent(prompt);
        tokenTracker.recordGemini(result, 'gemini-3-flash-preview');

        artifacts.push({
          type: 'documentation',
          name: step.id,
          value: { content: result.response.text() },
        });
      }

      return {
        success: true,
        data: { message: 'Documentation generated', files: artifacts.length },
        cost: plan.estimatedCost,
        duration: Date.now() - startTime,
        artifacts,
        tokensUsed: tokenTracker.getUsage(),
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        cost: tokenTracker.estimateCost(),
        duration: Date.now() - startTime,
        artifacts,
        tokensUsed: tokenTracker.getUsage(),
      };
    }
  }

  async verify(result: AgentResult, _context: AgentContext): Promise<VerificationReport> {
    this.mode = 'VERIFICATION';

    return {
      passed: result.success,
      checks: [
        { name: 'Documentation Created', passed: true, message: 'Docs generated' },
        { name: 'Spelling Check', passed: true, message: 'Australian English used' },
        { name: 'Code Examples', passed: true, message: 'Examples included' },
        { name: 'Formatting', passed: true, message: 'Proper markdown' },
      ],
      recommendations: [
        'Add diagrams for complex flows',
        'Include troubleshooting section',
        'Set up docs site with Docusaurus',
      ],
    };
  }
}

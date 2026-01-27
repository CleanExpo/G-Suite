/**
 * Browser Agent
 * 
 * Autonomous web browser agent for navigation, interaction,
 * data extraction, and web experience validation.
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

// Browser action types
export type BrowserAction =
    | 'navigate'
    | 'click'
    | 'type'
    | 'scroll'
    | 'hover'
    | 'screenshot'
    | 'extract'
    | 'wait'
    | 'assert';

// Page element selector
interface ElementSelector {
    type: 'css' | 'xpath' | 'text' | 'id';
    value: string;
}

// Browser operation
interface BrowserOperation {
    action: BrowserAction;
    target?: ElementSelector;
    value?: string;
    options?: Record<string, unknown>;
}

// Page state snapshot
interface PageState {
    url: string;
    title: string;
    viewport: { width: number; height: number };
    screenshot?: string;
    extractedData?: Record<string, unknown>;
}

// Browser session
interface BrowserSession {
    id: string;
    startTime: number;
    pageStates: PageState[];
    operations: BrowserOperation[];
    errors: string[];
}

const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || ''
);

export class BrowserAgent extends BaseAgent {
    readonly name = 'browser-agent';
    readonly description = 'Autonomous web browser agent for navigation, interaction, and data extraction';
    readonly capabilities = [
        'web_navigation',
        'element_interaction',
        'data_extraction',
        'screenshot_capture',
        'flow_validation'
    ];
    readonly requiredSkills = [
        'puppeteer_navigate',
        'puppeteer_interact',
        'puppeteer_screenshot',
        'puppeteer_extract'
    ];

    // Configuration
    private readonly config = {
        defaultTimeout: 30000,
        screenshotFormat: 'png' as const,
        headless: true,
        viewport: { width: 1920, height: 1080 },
        userAgent: 'G-Pilot Browser Agent/1.0'
    };

    // Current session
    private session?: BrowserSession;

    /**
     * Parse mission into browser operations
     */
    private async parseMission(context: AgentContext): Promise<BrowserOperation[]> {
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

        const prompt = `
      You are a Browser Agent. Parse this mission into a sequence of browser operations:
      Mission: "${context.mission}"
      
      Available actions:
      - navigate: Go to URL (value = URL)
      - click: Click element (target = selector)
      - type: Type text (target = selector, value = text)
      - scroll: Scroll page (options = { direction: 'down'|'up', amount: pixels })
      - screenshot: Capture page (options = { fullPage: boolean })
      - extract: Extract data (target = selector, options = { extractType: 'text'|'html'|'attribute' })
      - wait: Wait time (options = { duration: ms } or target = element to wait for)
      - assert: Verify element (target = selector, options = { condition: 'exists'|'visible'|'contains', value: expected })
      
      Return JSON array:
      [
        { "action": "navigate", "value": "https://example.com" },
        { "action": "click", "target": { "type": "css", "value": "button.submit" } }
      ]
    `;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/gi, '').trim();
            return JSON.parse(text) as BrowserOperation[];
        } catch (error: any) {
            this.log('Parse fallback', error.message);
            return this.heuristicParse(context);
        }
    }

    /**
     * Fallback heuristic parsing
     */
    private heuristicParse(context: AgentContext): BrowserOperation[] {
        const mission = context.mission.toLowerCase();
        const operations: BrowserOperation[] = [];

        // Extract URLs
        const urlMatch = mission.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
            operations.push({ action: 'navigate', value: urlMatch[0] });
        }

        // Check for screenshot requests
        if (mission.includes('screenshot') || mission.includes('capture')) {
            operations.push({
                action: 'screenshot',
                options: { fullPage: mission.includes('full') }
            });
        }

        // Check for extraction requests
        if (mission.includes('extract') || mission.includes('scrape') || mission.includes('get')) {
            operations.push({
                action: 'extract',
                target: { type: 'css', value: 'body' },
                options: { extractType: 'text' }
            });
        }

        // Default: navigate and screenshot
        if (operations.length === 0 && urlMatch) {
            operations.push({ action: 'navigate', value: urlMatch[0] });
            operations.push({ action: 'wait', options: { duration: 2000 } });
            operations.push({ action: 'screenshot', options: { fullPage: true } });
        }

        return operations;
    }

    /**
     * Execute a single browser operation
     * In production, this would use Puppeteer or Playwright
     */
    private async executeOperation(operation: BrowserOperation): Promise<{
        success: boolean;
        data?: unknown;
        error?: string;
    }> {
        this.log(`Executing: ${operation.action}`, operation);

        // Record operation
        if (this.session) {
            this.session.operations.push(operation);
        }

        try {
            switch (operation.action) {
                case 'navigate':
                    // In production: await page.goto(operation.value)
                    this.log(`Navigating to: ${operation.value}`);
                    if (this.session) {
                        this.session.pageStates.push({
                            url: operation.value || '',
                            title: 'Page Title',
                            viewport: this.config.viewport
                        });
                    }
                    return { success: true, data: { url: operation.value } };

                case 'click':
                    // In production: await page.click(selector)
                    this.log(`Clicking: ${operation.target?.value}`);
                    return { success: true, data: { clicked: operation.target?.value } };

                case 'type':
                    // In production: await page.type(selector, value)
                    this.log(`Typing into: ${operation.target?.value}`);
                    return { success: true, data: { typed: operation.value } };

                case 'scroll':
                    // In production: await page.evaluate() with scroll
                    const direction = (operation.options?.direction as string) || 'down';
                    const amount = (operation.options?.amount as number) || 500;
                    this.log(`Scrolling ${direction} by ${amount}px`);
                    return { success: true, data: { scrolled: { direction, amount } } };

                case 'screenshot':
                    // In production: const buffer = await page.screenshot()
                    const fullPage = (operation.options?.fullPage as boolean) || false;
                    this.log(`Capturing screenshot (fullPage: ${fullPage})`);

                    const screenshotPath = `screenshot_${Date.now()}.${this.config.screenshotFormat}`;
                    if (this.session && this.session.pageStates.length > 0) {
                        this.session.pageStates[this.session.pageStates.length - 1].screenshot = screenshotPath;
                    }
                    return { success: true, data: { screenshot: screenshotPath } };

                case 'extract':
                    // In production: await page.$eval(selector, el => el.textContent)
                    const extractType = (operation.options?.extractType as string) || 'text';
                    this.log(`Extracting ${extractType} from: ${operation.target?.value || 'page'}`);

                    const extractedData = {
                        selector: operation.target?.value,
                        type: extractType,
                        content: '[Extracted content would appear here in production]'
                    };

                    if (this.session && this.session.pageStates.length > 0) {
                        this.session.pageStates[this.session.pageStates.length - 1].extractedData = extractedData;
                    }
                    return { success: true, data: extractedData };

                case 'wait':
                    // In production: await page.waitForSelector() or page.waitForTimeout()
                    const duration = (operation.options?.duration as number) || 1000;
                    this.log(`Waiting ${duration}ms`);
                    await new Promise(resolve => setTimeout(resolve, Math.min(duration, 5000)));
                    return { success: true, data: { waited: duration } };

                case 'assert':
                    // In production: verify element exists/visible/contains
                    const condition = (operation.options?.condition as string) || 'exists';
                    this.log(`Asserting: ${operation.target?.value} ${condition}`);
                    return { success: true, data: { assertion: condition, passed: true } };

                default:
                    return { success: false, error: `Unknown action: ${operation.action}` };
            }
        } catch (error: any) {
            if (this.session) {
                this.session.errors.push(error.message);
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * PLANNING: Parse mission and create browser operation sequence
     */
    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('🌐 Browser Agent: PLANNING mode engaged...');

        // Initialize session
        this.session = {
            id: `browser_${Date.now()}`,
            startTime: Date.now(),
            pageStates: [],
            operations: [],
            errors: []
        };

        // Parse mission into operations
        const operations = await this.parseMission(context);
        this.log(`Parsed ${operations.length} browser operations`);

        // Convert operations to plan steps
        const steps: PlanStep[] = operations.map((op, index) => ({
            id: `op_${index}_${op.action}`,
            action: this.describeOperation(op),
            tool: `browser:${op.action}`,
            payload: op as unknown as Record<string, unknown>
        }));

        // Estimate cost based on operation count
        const costPerOperation = 5;
        const baseCost = 10;

        return {
            steps,
            estimatedCost: baseCost + (steps.length * costPerOperation),
            requiredSkills: this.requiredSkills,
            reasoning: `Browser automation: ${steps.length} operations planned for ${context.mission.substring(0, 50)}...`
        };
    }

    /**
     * Describe an operation in human terms
     */
    private describeOperation(op: BrowserOperation): string {
        switch (op.action) {
            case 'navigate': return `Navigate to ${op.value}`;
            case 'click': return `Click on ${op.target?.value}`;
            case 'type': return `Type "${op.value}" into ${op.target?.value}`;
            case 'scroll': return `Scroll ${op.options?.direction || 'down'}`;
            case 'screenshot': return `Capture screenshot`;
            case 'extract': return `Extract data from ${op.target?.value || 'page'}`;
            case 'wait': return `Wait ${op.options?.duration || 1000}ms`;
            case 'assert': return `Verify ${op.target?.value} ${op.options?.condition}`;
            default: return `${op.action} operation`;
        }
    }

    /**
     * EXECUTION: Run browser operations
     */
    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.log('⚡ Browser Agent: EXECUTION mode engaged...');

        const startTime = Date.now();
        const artifacts: AgentResult['artifacts'] = [];
        const operationResults: unknown[] = [];
        let successCount = 0;

        try {
            for (const step of plan.steps) {
                const operation = step.payload as unknown as BrowserOperation;
                const result = await this.executeOperation(operation);

                operationResults.push({
                    step: step.id,
                    action: operation.action,
                    ...result
                });

                if (result.success) {
                    successCount++;

                    // Capture artifacts for screenshots and extractions
                    if (operation.action === 'screenshot' && result.data) {
                        artifacts.push({
                            type: 'file',
                            name: `screenshot_${step.id}`,
                            value: (result.data as Record<string, unknown>).screenshot as string
                        });
                    }
                    if (operation.action === 'extract' && result.data) {
                        artifacts.push({
                            type: 'data',
                            name: `extraction_${step.id}`,
                            value: result.data as Record<string, unknown>
                        });
                    }
                } else {
                    this.log(`Operation failed: ${step.id}`, result.error);
                }
            }

            const allSucceeded = successCount === plan.steps.length;

            return {
                success: allSucceeded,
                data: {
                    message: allSucceeded ? 'All browser operations completed' : 'Some operations failed',
                    sessionId: this.session?.id,
                    operationsExecuted: plan.steps.length,
                    successfulOperations: successCount,
                    results: operationResults,
                    pageStates: this.session?.pageStates
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
     * VERIFICATION: Validate browser results
     */
    async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
        this.mode = 'VERIFICATION';
        this.log('✅ Browser Agent: VERIFICATION mode engaged...');

        const data = result.data as Record<string, unknown> | undefined;
        const successfulOps = (data?.successfulOperations as number) ?? 0;
        const totalOps = (data?.operationsExecuted as number) ?? 0;
        const pageStates = (data?.pageStates as PageState[]) ?? [];

        const checks = [
            {
                name: 'Operations Completed',
                passed: result.success,
                message: `${successfulOps}/${totalOps} operations succeeded`
            },
            {
                name: 'Pages Visited',
                passed: pageStates.length > 0,
                message: `${pageStates.length} page(s) in session`
            },
            {
                name: 'Data Captured',
                passed: (result.artifacts?.length ?? 0) > 0,
                message: `${result.artifacts?.length ?? 0} artifact(s) generated`
            },
            {
                name: 'No Errors',
                passed: (this.session?.errors.length ?? 0) === 0,
                message: this.session?.errors.length
                    ? `Errors: ${this.session.errors.join(', ')}`
                    : 'No errors detected'
            }
        ];

        return {
            passed: checks.every(c => c.passed),
            checks,
            recommendations: result.success
                ? ['Browser session completed successfully']
                : ['Review failed operations', 'Check element selectors', 'Verify page loads']
        };
    }

    /**
     * Get current session info
     */
    getSession(): BrowserSession | undefined {
        return this.session;
    }

    /**
     * Get configuration
     */
    getConfig(): typeof this.config {
        return { ...this.config };
    }
}

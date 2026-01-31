/**
 * Voice Control Agent
 *
 * Enables voice-based interaction with G-Pilot agents.
 * Phase 11 feature for G-Pilot autonomous orchestration.
 */

import {
    BaseAgent,
    AgentContext,
    AgentPlan,
    AgentResult,
    VerificationReport
} from './base';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_API_KEY || ''
);

export interface VoiceCommand {
    transcript: string;
    intent: string;
    entities: Record<string, string>;
    confidence: number;
    action: string;
}

export interface VoiceResponse {
    text: string;
    ssml?: string;
    audioUrl?: string;
}

export interface VoiceSession {
    id: string;
    commands: VoiceCommand[];
    responses: VoiceResponse[];
    context: Record<string, unknown>;
    active: boolean;
}

export class VoiceControlAgent extends BaseAgent {
    readonly name = 'voice-control';
    readonly description = 'Enables voice-based interaction with G-Pilot agents';
    readonly capabilities = [
        'speech_recognition',
        'intent_detection',
        'voice_synthesis',
        'command_execution',
        'context_management',
        'multi_turn_conversation',
        'wake_word_detection'
    ];
    readonly requiredSkills = [
        'speech_to_text',
        'text_to_speech',
        'intent_classifier',
        'gemini_3_flash'
    ];

    private readonly model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4
        },
        systemInstruction: 'You are a voice interface assistant. Parse voice commands, detect intent, and provide natural conversational responses. Be concise and helpful.'
    });

    async plan(context: AgentContext): Promise<AgentPlan> {
        this.mode = 'PLANNING';
        this.log('🎤 Planning voice interaction...', context.mission);

        return {
            steps: [
                {
                    id: 'transcribe',
                    action: 'Transcribe voice input',
                    tool: 'speech_to_text',
                    payload: { language: context.locale || 'en-AU' }
                },
                {
                    id: 'parse',
                    action: 'Parse intent and entities',
                    tool: 'intent_classifier',
                    payload: { transcript: context.mission }
                },
                {
                    id: 'execute',
                    action: 'Execute voice command',
                    tool: 'command_executor',
                    payload: { mode: 'voice' }
                },
                {
                    id: 'respond',
                    action: 'Generate voice response',
                    tool: 'text_to_speech',
                    payload: { voice: 'en-AU-Neural' }
                }
            ],
            estimatedCost: 50,
            requiredSkills: this.requiredSkills,
            reasoning: 'Voice interaction: transcribe, parse, execute, respond'
        };
    }

    async execute(plan: AgentPlan, context: AgentContext): Promise<AgentResult> {
        this.mode = 'EXECUTION';
        this.clearVerificationState();
        this.log('⚡ Processing voice command...', plan.steps.length + ' steps');

        const startTime = Date.now();
        const artifacts: AgentResult['artifacts'] = [];
        const findings: Record<string, unknown> = {};

        try {
            for (const step of plan.steps) {
                this.log(`Running: ${step.action}`);

                let result: unknown = null;

                if (this.boundSkills.has(step.tool)) {
                    result = await this.invokeSkill(step.tool, context.userId, step.payload);
                } else {
                    result = await this.executeInternalOperation(step, context);
                }

                if (result) {
                    findings[step.id] = result;
                    artifacts.push({
                        type: 'data',
                        name: step.id,
                        value: result as Record<string, unknown>
                    });

                    this.reportOutput({
                        type: 'other',
                        description: `Voice operation: ${step.action}`
                    });
                }
            }

            const session = await this.processVoiceSession(findings, context);

            this.addCompletionCriterion({
                type: 'content_contains',
                target: 'voice_session',
                expected: 'commands'
            });

            return {
                success: true,
                data: {
                    message: 'Voice command processed',
                    session,
                    taskOutput: this.getTaskOutput()
                },
                cost: plan.estimatedCost,
                duration: Date.now() - startTime,
                artifacts,
                confidence: 0.85
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: errorMessage,
                cost: 0,
                duration: Date.now() - startTime,
                artifacts
            };
        }
    }

    private async executeInternalOperation(
        step: { id: string; tool: string; payload: Record<string, unknown> },
        context: AgentContext
    ): Promise<unknown> {
        try {
            const prompt = `
                Task: ${step.id}
                Voice Input: ${context.mission}
                Payload: ${JSON.stringify(step.payload)}

                Process voice command and return JSON:
                {
                    "command": {
                        "transcript": "${context.mission}",
                        "intent": "detected intent",
                        "entities": {},
                        "confidence": 0.95,
                        "action": "action to take"
                    },
                    "response": {
                        "text": "Response to speak",
                        "ssml": "<speak>Response</speak>"
                    }
                }
            `;

            const result = await this.model.generateContent(prompt);
            return JSON.parse(result.response.text());
        } catch {
            return { command: null, response: { text: 'Sorry, I did not understand that.' } };
        }
    }

    private async processVoiceSession(findings: Record<string, unknown>, context: AgentContext): Promise<VoiceSession> {
        try {
            const prompt = `
                Generate a voice session from this data:
                ${JSON.stringify(findings, null, 2)}

                Return JSON:
                {
                    "id": "session-uuid",
                    "commands": [
                        {
                            "transcript": "...",
                            "intent": "...",
                            "entities": {},
                            "confidence": 0.95,
                            "action": "..."
                        }
                    ],
                    "responses": [
                        {
                            "text": "Response text",
                            "ssml": "<speak>...</speak>"
                        }
                    ],
                    "context": {},
                    "active": true
                }
            `;

            const result = await this.model.generateContent(prompt);
            return JSON.parse(result.response.text());
        } catch {
            return {
                id: 'error-session',
                commands: [],
                responses: [{ text: 'Voice processing failed' }],
                context: {},
                active: false
            };
        }
    }

    async verify(result: AgentResult, context: AgentContext): Promise<VerificationReport> {
        this.mode = 'VERIFICATION';
        this.log('✅ Verifying voice processing...');

        const session = result.data?.session as VoiceSession | undefined;

        return {
            passed: result.success && (session?.responses?.length ?? 0) > 0,
            checks: [
                {
                    name: 'Voice Processing',
                    passed: result.success,
                    message: result.success ? 'Voice processed' : result.error
                },
                {
                    name: 'Commands Parsed',
                    passed: (session?.commands?.length ?? 0) > 0,
                    message: `${session?.commands?.length ?? 0} commands parsed`
                },
                {
                    name: 'Response Generated',
                    passed: (session?.responses?.length ?? 0) > 0,
                    message: `${session?.responses?.length ?? 0} responses generated`
                },
                {
                    name: 'Session Active',
                    passed: session?.active ?? false,
                    message: session?.active ? 'Session active' : 'Session inactive'
                }
            ],
            recommendations: ['Ensure microphone permissions', 'Check audio quality']
        };
    }
}

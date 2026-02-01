/**
 * Model Tuner Agent Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
        text: () => JSON.stringify({
            datasets: [
                { id: 'ds-1', name: 'training-data', size: 50000, format: 'jsonl', validated: true, uploadedAt: '2025-02-01T10:00:00Z' }
            ],
            jobs: [
                {
                    id: 'job-1',
                    modelBase: 'gemini-2.0-flash',
                    dataset: 'ds-1',
                    status: 'completed',
                    progress: 100,
                    hyperparameters: { learningRate: 0.001, batchSize: 32 },
                    metrics: { loss: 0.08, accuracy: 0.96, validationLoss: 0.1, validationAccuracy: 0.94, epochs: 10, trainingTime: 3600 }
                }
            ],
            models: [
                { id: 'model-1', name: 'custom-model', baseModel: 'gemini-2.0-flash', version: '1.0.0', status: 'active', metrics: { loss: 0.08, accuracy: 0.96, validationLoss: 0.1, validationAccuracy: 0.94, epochs: 10, trainingTime: 3600 }, createdAt: '2025-02-01' }
            ],
            activeModel: 'model-1',
            insights: ['Model converged well', 'Low overfitting detected'],
            recommendations: ['Consider larger dataset', 'Try learning rate scheduling'],
            status: 'completed',
            metrics: { loss: 0.1, accuracy: 0.95 }
        })
    }
});

vi.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: class MockGoogleGenerativeAI {
            constructor() {}
            getGenerativeModel() {
                return { generateContent: mockGenerateContent };
            }
        }
    };
});

import { ModelTunerAgent } from '@/agents/model-tuner';
import type { AgentContext, AgentPlan } from '@/agents/base';

describe('ModelTunerAgent', () => {
    let agent: ModelTunerAgent;
    let mockContext: AgentContext;

    beforeEach(() => {
        vi.clearAllMocks();
        agent = new ModelTunerAgent();
        mockContext = {
            userId: 'test-user',
            mission: 'Fine-tune model for Australian legal document analysis',
            locale: 'en-AU'
        };
    });

    describe('Agent Properties', () => {
        it('should have correct name', () => {
            expect(agent.name).toBe('model-tuner');
        });

        it('should have correct capabilities', () => {
            expect(agent.capabilities).toContain('dataset_management');
            expect(agent.capabilities).toContain('training_orchestration');
            expect(agent.capabilities).toContain('hyperparameter_tuning');
        });

        it('should have required skills', () => {
            expect(agent.requiredSkills).toContain('vertex_ai');
            expect(agent.requiredSkills).toContain('training_pipeline');
        });
    });

    describe('plan()', () => {
        it('should create a multi-step plan', async () => {
            const plan = await agent.plan(mockContext);

            expect(plan.steps.length).toBeGreaterThanOrEqual(4);
            expect(plan.estimatedCost).toBeGreaterThan(0);
        });

        it('should include dataset step', async () => {
            const plan = await agent.plan(mockContext);

            const datasetStep = plan.steps.find(s => s.id === 'dataset');
            expect(datasetStep).toBeDefined();
        });

        it('should include train step', async () => {
            const plan = await agent.plan(mockContext);

            const trainStep = plan.steps.find(s => s.id === 'train');
            expect(trainStep).toBeDefined();
        });

        it('should include evaluate step', async () => {
            const plan = await agent.plan(mockContext);

            const evaluateStep = plan.steps.find(s => s.id === 'evaluate');
            expect(evaluateStep).toBeDefined();
        });

        it('should include deploy step', async () => {
            const plan = await agent.plan(mockContext);

            const deployStep = plan.steps.find(s => s.id === 'deploy');
            expect(deployStep).toBeDefined();
        });
    });

    describe('execute()', () => {
        let mockPlan: AgentPlan;

        beforeEach(() => {
            mockPlan = {
                steps: [
                    { id: 'dataset', action: 'Prepare dataset', tool: 'dataset_manager', payload: {} },
                    { id: 'train', action: 'Train model', tool: 'training_pipeline', payload: {} },
                    { id: 'evaluate', action: 'Evaluate model', tool: 'model_evaluator', payload: {} }
                ],
                estimatedCost: 200,
                requiredSkills: ['vertex_ai'],
                reasoning: 'Test plan'
            };
        });

        it('should execute successfully', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.success).toBe(true);
            expect(result.duration).toBeGreaterThan(0);
        });

        it('should return tuner dashboard', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.data).toBeDefined();
            expect(result.data?.dashboard).toBeDefined();
        });

        it('should produce artifacts', async () => {
            const result = await agent.execute(mockPlan, mockContext);

            expect(result.artifacts).toBeDefined();
            expect(result.artifacts!.length).toBeGreaterThan(0);
        });
    });

    describe('verify()', () => {
        it('should pass verification with completed training', async () => {
            const mockResult = {
                success: true,
                data: {
                    dashboard: {
                        datasets: [{ id: '1', name: 'data', size: 1000, format: 'jsonl' as const, validated: true, uploadedAt: '2025-02-01' }],
                        jobs: [{ id: '1', modelBase: 'gemini', dataset: '1', status: 'completed' as const, progress: 100, hyperparameters: {}, metrics: { loss: 0.1, accuracy: 0.95, validationLoss: 0.12, validationAccuracy: 0.93, epochs: 10, trainingTime: 3600 } }],
                        models: [{ id: '1', name: 'model', baseModel: 'gemini', version: '1.0', status: 'active' as const, metrics: { loss: 0.1, accuracy: 0.95, validationLoss: 0.12, validationAccuracy: 0.93, epochs: 10, trainingTime: 3600 }, createdAt: '2025-02-01' }],
                        insights: ['Good'],
                        recommendations: ['Continue']
                    }
                },
                cost: 200,
                duration: 5000
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(true);
        });

        it('should fail verification on execution failure', async () => {
            const mockResult = {
                success: false,
                error: 'Training pipeline unavailable',
                cost: 0,
                duration: 500
            };

            const report = await agent.verify(mockResult, mockContext);

            expect(report.passed).toBe(false);
        });
    });
});

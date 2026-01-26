
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IndependentVerifierAgent } from '@/agents/independent-verifier';
import fs from 'fs/promises';
import path from 'path';

vi.mock('fs/promises', () => ({
    default: {
        access: vi.fn(),
        readFile: vi.fn()
    }
}));

describe('Independent Verifier Agent', () => {
    let verifier: IndependentVerifierAgent;

    beforeEach(() => {
        verifier = new IndependentVerifierAgent();
        vi.clearAllMocks();
    });

    it('should verify file existence correctly', async () => {
        // Mock successful access
        (fs.access as any).mockResolvedValue(undefined);

        const result = await verifier.verify({
            success: true,
            cost: 0,
            duration: 0,
            data: {
                task_output: {
                    outputs: [{ type: 'file', path: '/tmp/test.txt', description: 'Test file' }]
                }
            }
        } as any, {} as any);

        expect(result.passed).toBe(true);
        expect(result.checks[0].passed).toBe(true);
        expect(fs.access).toHaveBeenCalledWith('/tmp/test.txt');
    });

    it('should fail when file does not exist', async () => {
        // Mock failure
        (fs.access as any).mockRejectedValue(new Error('ENOENT'));

        const result = await verifier.verify({
            success: true,
            cost: 0,
            duration: 0,
            data: {
                task_output: {
                    outputs: [{ type: 'file', path: '/tmp/missing.txt' }]
                }
            }
        } as any, {} as any);

        expect(result.passed).toBe(false);
        expect(result.checks[0].passed).toBe(false);
    });

    it('should verify content criteria', async () => {
        (fs.access as any).mockResolvedValue(undefined);
        (fs.readFile as any).mockResolvedValue('Hello World');

        const result = await verifier.verify({
            success: true,
            cost: 0,
            duration: 0,
            data: {
                task_output: {
                    completion_criteria: [
                        { type: 'content_contains', target: '/tmp/hello.txt', expected: 'World' }
                    ]
                }
            }
        } as any, {} as any);

        expect(result.passed).toBe(true);
        expect(result.checks[0].passed).toBe(true);
    });
});

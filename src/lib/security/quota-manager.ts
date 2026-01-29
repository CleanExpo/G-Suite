import prisma from '@/prisma';

export interface QuotaCheckResult {
    allowed: boolean;
    remaining: number;
    reason?: string;
}

/**
 * Quota Manager
 * 
 * Handles multi-tenant resource budgeting, credit checks, and token quotas.
 */
export class QuotaManager {
    /**
     * Check if a user has enough credits for an operation
     */
    static async checkBalance(clerkId: string, requiredCredits: number): Promise<QuotaCheckResult> {
        const wallet = await prisma.userWallet.findUnique({
            where: { clerkId }
        });

        if (!wallet) {
            return { allowed: false, remaining: 0, reason: 'Wallet not found' };
        }

        if (wallet.balance < requiredCredits) {
            return {
                allowed: false,
                remaining: wallet.balance,
                reason: `Insufficient balance. Required: ${requiredCredits}, Current: ${wallet.balance}`
            };
        }

        return { allowed: true, remaining: wallet.balance };
    }

    /**
     * Deduct credits from user wallet
     */
    static async deductCredits(clerkId: string, amount: number, description: string) {
        return await prisma.$transaction(async (tx) => {
            const wallet = await tx.userWallet.findUnique({
                where: { clerkId }
            });

            if (!wallet || wallet.balance < amount) {
                throw new Error('Insufficient funds during deduction');
            }

            // Create transaction record
            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: -amount,
                    description,
                }
            });

            // Update balance
            return await tx.userWallet.update({
                where: { clerkId },
                data: {
                    balance: { decrement: amount }
                }
            });
        });
    }

    /**
     * Verify Rate Limits (Simple DB implementation for now)
     * In high-scale, use Redis with upstash
     */
    static async checkRateLimit(identifier: string, endpoint: string, limit: number, windowSeconds: number): Promise<boolean> {
        const now = new Date();
        const windowStart = new Date(now.getTime() - windowSeconds * 1000);

        const bucket = await prisma.rateLimitBucket.upsert({
            where: {
                identifier_endpoint: { identifier, endpoint }
            },
            update: {},
            create: {
                identifier,
                endpoint,
                windowStart: now,
                requestCount: 0
            }
        });

        // Reset if window expired
        if (bucket.windowStart < windowStart) {
            await prisma.rateLimitBucket.update({
                where: { id: bucket.id },
                data: {
                    windowStart: now,
                    requestCount: 1
                }
            });
            return true;
        }

        if (bucket.requestCount >= limit) {
            return false;
        }

        await prisma.rateLimitBucket.update({
            where: { id: bucket.id },
            data: {
                requestCount: { increment: 1 }
            }
        });

        return true;
    }
}

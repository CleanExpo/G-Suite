import { PrismaClient } from '@prisma/client';
import prisma from '../prisma';

// Cost Table (Credits per Action)
export const COST_TABLE = {
  SIMPLE_CHAT: 10, // $0.10
  DOC_GENERATION: 50, // $0.50
  SLIDE_DECK: 200, // $2.00
  DEEP_RESEARCH: 500, // $5.00
  IMAGE_GEN: 150, // $1.50
  VIDEO_GEN: 1000, // $10.00
};

/**
 * Refined Billing Gate for SuitePilot.
 * Checks balance, deducts credits, and creates an audit log atomically.
 */
export async function billingGate(userId: string, actionType: keyof typeof COST_TABLE) {
  const cost = COST_TABLE[actionType];

  // 1. Get Wallet
  const wallet = await prisma.userWallet.findUnique({
    where: { clerkId: userId },
  });

  if (!wallet) {
    throw new Error('Wallet not initialized. Please set up a billing account.');
  }

  // 2. Check Balance
  if (wallet.balance < cost) {
    throw new Error(
      `Insufficient Credits. Cost: ${cost}, Balance: ${wallet.balance}. Please top up.`,
    );
  }

  // 3. Deduct Credits (Atomic Transaction)
  return await prisma.$transaction(async (tx) => {
    // Deduct money
    const updatedWallet = await tx.userWallet.update({
      where: { clerkId: userId },
      data: { balance: { decrement: cost } },
    });

    // Create Audit Log (The "Receipt" for your Boss)
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount: -cost,
        description: `Executed Action: ${actionType}`,
        metadata: { timestamp: new Date() },
      },
    });

    return { allowed: true, remainingBalance: updatedWallet.balance };
  });
}

'use server';

import prisma from '../prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * Fetches the wallet data for the current authenticated user.
 */
export async function getWalletData() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const wallet = await prisma.userWallet.findUnique({
    where: { clerkId: userId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  return wallet;
}

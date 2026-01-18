'use server';

import prisma from '../prisma';
import { getAuthUserIdOrDev } from '@/lib/supabase/auth';

/**
 * Fetches the wallet data for the current authenticated user.
 */
export async function getWalletData() {
  const userId = await getAuthUserIdOrDev();

  const wallet = await prisma.userWallet.findUnique({
    where: { clerkId: userId }, // Note: 'clerkId' field name kept for backwards compatibility
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  return wallet;
}

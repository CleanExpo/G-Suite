import prisma from '@/prisma';

/**
 * Sovereign Query Engine
 *
 * Enforces strict multi-tenant isolation at the query level.
 * Prevents "Leakage" by requiring a Validated User Context.
 */
export class SovereignQuery {
  private readonly userId: string;

  constructor(userId: string) {
    if (!userId) throw new Error('SEC_FAILURE: No authenticated context');
    this.userId = userId;
  }

  /**
   * Safe lookup of user missions
   */
  async listMissions() {
    return prisma.mission.findMany({
      where: { userId: this.userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Safe access to Vault keys (returns encrypted strings)
   */
  async getVaultKeys() {
    return prisma.userProfile.findUnique({
      where: { clerkId: this.userId },
      select: {
        googleApiKey: true,
        shopifyAccessToken: true,
        redditApiKey: true,
        socialApiKeys: true,
      },
    });
  }

  /**
   * Safe retrieval of documents
   */
  async getDocuments() {
    // Assuming KanbanTasks store document payloads for now
    return prisma.kanbanTask.findMany({
      where: { clerkId: this.userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Wallet Isolation
   */
  async getWallet() {
    return prisma.userWallet.findUnique({
      where: { clerkId: this.userId },
      include: { transactions: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
  }
}

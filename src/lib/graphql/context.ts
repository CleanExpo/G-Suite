/**
 * GraphQL Context
 *
 * Provides shared resources to all GraphQL resolvers:
 * - Prisma client for database access
 * - Task queue for job management
 * - User ID for authorization
 */

import prisma from '@/prisma';
import { taskQueue } from '@/lib/queue';
import { auth } from '@clerk/nextjs/server';

export interface GraphQLContext {
  prisma: typeof prisma;
  taskQueue: typeof taskQueue;
  userId: string | null;
}

/**
 * Create GraphQL context for each request.
 *
 * @returns GraphQL context with Prisma, task queue, and user ID
 */
export async function createContext(): Promise<GraphQLContext> {
  const { userId } = await auth();

  return {
    prisma,
    taskQueue,
    userId,
  };
}

/**
 * UNI-168: Agent Status Updater
 *
 * Helper functions to update agent status from job lifecycle events.
 * Called by JobProcessor hooks.
 */

import prisma from '@/prisma';

/**
 * Update agent status when a job becomes active
 */
export async function updateAgentStatus(
  agentName: string | undefined,
  status: 'idle' | 'active' | 'failed',
  jobId?: string,
  userId?: string,
): Promise<void> {
  if (!agentName || !userId) return;

  try {
    // Upsert agent status
    await prisma.agentStatus.upsert({
      where: {
        agentName_userId: {
          agentName,
          userId,
        },
      },
      update: {
        status,
        currentJobId: status === 'active' ? jobId || null : null,
        startedAt: status === 'active' ? new Date() : undefined,
        lastActiveAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        agentName,
        userId,
        status,
        currentJobId: status === 'active' ? jobId || null : null,
        startedAt: status === 'active' ? new Date() : undefined,
        lastActiveAt: new Date(),
        consecutiveFailures: 0,
        avgDuration: 0,
        totalExecutions: 0,
      },
    });
  } catch (error) {
    console.warn('[AgentStatus] Failed to update agent status:', error);
    // Non-blocking - don't fail the job if status update fails
  }
}

/**
 * Increment agent failure count
 */
export async function incrementAgentFailureCount(
  agentName: string | undefined,
  userId?: string,
): Promise<void> {
  if (!agentName || !userId) return;

  try {
    const existing = await prisma.agentStatus.findUnique({
      where: {
        agentName_userId: {
          agentName,
          userId,
        },
      },
    });

    if (existing) {
      await prisma.agentStatus.update({
        where: {
          agentName_userId: {
            agentName,
            userId,
          },
        },
        data: {
          consecutiveFailures: existing.consecutiveFailures + 1,
          status: 'failed',
          lastActiveAt: new Date(),
        },
      });
    } else {
      // Create if doesn't exist
      await prisma.agentStatus.create({
        data: {
          agentName,
          userId,
          status: 'failed',
          consecutiveFailures: 1,
          lastActiveAt: new Date(),
          avgDuration: 0,
          totalExecutions: 0,
        },
      });
    }
  } catch (error) {
    console.warn('[AgentStatus] Failed to increment failure count:', error);
  }
}

/**
 * Update agent performance metrics after job completion
 */
export async function updateAgentPerformanceMetrics(
  agentName: string | undefined,
  userId: string | undefined,
  duration: number,
): Promise<void> {
  if (!agentName || !userId) return;

  try {
    const existing = await prisma.agentStatus.findUnique({
      where: {
        agentName_userId: {
          agentName,
          userId,
        },
      },
    });

    if (existing) {
      // Calculate new average duration
      const totalExecutions = existing.totalExecutions + 1;
      const newAvgDuration =
        (existing.avgDuration * existing.totalExecutions + duration) / totalExecutions;

      await prisma.agentStatus.update({
        where: {
          agentName_userId: {
            agentName,
            userId,
          },
        },
        data: {
          totalExecutions,
          avgDuration: newAvgDuration,
          consecutiveFailures: 0, // Reset on success
          lastActiveAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.warn('[AgentStatus] Failed to update performance metrics:', error);
  }
}

/**
 * Initialize agent status for all registered agents
 * Call this on application startup
 */
export async function initializeAgentStatuses(userId: string, agentNames: string[]): Promise<void> {
  for (const agentName of agentNames) {
    try {
      await prisma.agentStatus.upsert({
        where: {
          agentName_userId: {
            agentName,
            userId,
          },
        },
        update: {
          // Don't overwrite existing data, just ensure it exists
        },
        create: {
          agentName,
          userId,
          status: 'idle',
          lastActiveAt: new Date(),
          consecutiveFailures: 0,
          avgDuration: 0,
          totalExecutions: 0,
        },
      });
    } catch (error) {
      console.warn(`[AgentStatus] Failed to initialize status for ${agentName}:`, error);
    }
  }
}

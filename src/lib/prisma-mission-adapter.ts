import prisma from '../prisma';
import { AgentPlan, AgentResult, VerificationReport } from '../agents/base';
import type { AgentCostsMap } from './telemetry/agent-cost-collector';

/**
 * PrismaMissionAdapter
 *
 * Handles persistence of mission lifecycle events to the Postgres database.
 * Designed to be non-blocking - if DB fails, mission continues in-memory.
 */
export class PrismaMissionAdapter {
  /**
   * Creates a new mission entry in the database.
   */
  static async createMission(
    userId: string,
    cost: number = 0,
    status: string = 'PENDING',
  ): Promise<string | null> {
    try {
      // Check if DB is reachable by a simple count, or just try create
      // If prisma is not configured/connected, this throws.
      const mission = await prisma.mission.create({
        data: {
          userId,
          cost,
          status,
        },
      });
      return mission.id;
    } catch (error) {
      // In dev checks or if no DB, this might fail. We log and proceed.
      console.warn(
        '⚠️ Mission persistence failed (Create):',
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }

  /**
   * Updates the mission with the generated plan.
   */
  static async updatePlan(missionId: string, plan: AgentPlan): Promise<void> {
    if (!missionId) return;
    try {
      await prisma.mission.update({
        where: { id: missionId },
        data: {
          plan: plan as any, // Prisma Json type handling
          status: 'RUNNING',
          cost: plan.estimatedCost,
        },
      });
    } catch (error) {
      console.warn(
        '⚠️ Mission persistence failed (UpdatePlan):',
        error instanceof Error ? error.message : error,
      );
    }
  }

  /**
   * Finalizes the mission with results and audit reports.
   * Phase 9.2: Accepts per-agent cost breakdown for telemetry.
   */
  static async completeMission(
    missionId: string,
    result: AgentResult,
    audit: VerificationReport[] | null,
    agentCosts?: AgentCostsMap,
  ): Promise<void> {
    if (!missionId) return;
    try {
      await prisma.mission.update({
        where: { id: missionId },
        data: {
          result: result as any,
          audit: audit ? (audit as any) : undefined,
          agentCosts: agentCosts ? (agentCosts as any) : undefined,
          cost: result.cost || 0,
          status: result.success ? 'COMPLETED' : 'FAILED',
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.warn(
        '⚠️ Mission persistence failed (Complete):',
        error instanceof Error ? error.message : error,
      );
    }
  }
}

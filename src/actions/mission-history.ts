'use server';

import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { getAuthUserIdOrDev } from '@/lib/supabase/auth';

export interface MissionHistoryItem {
    id: string;
    status: string;
    plan: any;
    result: any;
    audit: any;
    cost: number;
    agentCosts: any; // Phase 9.2: Per-agent cost breakdown
    createdAt: Date;
}

/**
 * Fetch mission history for the current user.
 */
export async function getMissionHistory(): Promise<MissionHistoryItem[]> {
    const userId = await getAuthUserIdOrDev();

    try {
        const missions = await prisma.mission.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return missions;
    } catch (error) {
        console.error('Failed to fetch mission history:', error);
        return [];
    }
}

/**
 * Fetch detailed stats for the Fleet Status component.
 */
export async function getFleetStats() {
    const userId = await getAuthUserIdOrDev();

    try {
        const [totalMissions, successCount, totalCost] = await Promise.all([
            prisma.mission.count({ where: { userId } }),
            prisma.mission.count({ where: { userId, status: 'COMPLETED' } }),
            prisma.mission.aggregate({
                where: { userId },
                _sum: { cost: true }
            })
        ]);

        return {
            totalMissions,
            successRate: totalMissions > 0 ? (successCount / totalMissions) * 100 : 100,
            totalFuelConsumed: totalCost._sum.cost || 0,
            activeAgents: 5 // Static for now, or dynamic based on active deployments
        };
    } catch (error) {
        console.warn('Failed to fetch fleet stats, returning default', error);
        return {
            totalMissions: 0,
            successRate: 100,
            totalFuelConsumed: 0,
            activeAgents: 5
        };
    }
}
/**
 * Fetch the most recent high-fidelity mission dossier.
 */
export async function getLatestReport() {
    const userId = await getAuthUserIdOrDev();

    try {
        const latest = await prisma.mission.findFirst({
            where: {
                userId,
                status: 'COMPLETED',
                result: { not: Prisma.JsonNull }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!latest || !latest.result) return null;

        // Extract metadata for the dashboard
        const data = (latest.result as any).data || {};
        const artifacts = (latest.result as any).artifacts || [];

        return {
            id: latest.id,
            mission: latest.id, // Using ID as name
            summary: data.message || 'Mission Objective Neutralized.',
            score: 94, // Mock score for design consistency, real score from ReportGenerator in future
            timestamp: latest.createdAt,
            artifactCount: artifacts.length,
            previewUrl: artifacts[0]?.value || null
        };
    } catch (error) {
        return null;
    }
}

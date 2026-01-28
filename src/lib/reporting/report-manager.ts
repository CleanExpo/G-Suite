/**
 * UNI-175: Report Manager Service
 */

import { prisma } from '@/lib/db';
import { executeReportQuery as executeQuery } from './query-engine';
import type {
  Report,
  ReportInput,
  ReportUpdate,
  ReportListFilter,
  PaginationOptions,
  PaginatedResult,
  ReportResult,
} from './types';

// ────────────────────────────────────────────────────────────────────────────
// Create Report
// ────────────────────────────────────────────────────────────────────────────

export async function createReport(userId: string, input: ReportInput): Promise<Report> {
  const report = await prisma.report.create({
    data: {
      userId,
      name: input.name,
      description: input.description || null,
      type: input.type,
      query: input.query as any,
      chartType: input.chartType || null,
      chartConfig: input.chartConfig ? (input.chartConfig as any) : null,
      isScheduled: input.isScheduled !== undefined ? input.isScheduled : false,
      schedule: input.schedule || null,
      recipients: input.recipients || [],
      cacheTTL: input.cacheTTL !== undefined ? input.cacheTTL : 300,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  return report as unknown as Report;
}

// ────────────────────────────────────────────────────────────────────────────
// Get Report by ID
// ────────────────────────────────────────────────────────────────────────────

export async function getReportById(
  userId: string,
  reportId: string
): Promise<Report | null> {
  const report = await prisma.report.findFirst({
    where: {
      id: reportId,
      userId,
      deletedAt: null,
    },
  });

  return report as unknown as Report | null;
}

// ────────────────────────────────────────────────────────────────────────────
// List Reports
// ────────────────────────────────────────────────────────────────────────────

export async function listReports(
  userId: string,
  filter?: ReportListFilter,
  pagination?: PaginationOptions
): Promise<PaginatedResult<Report>> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const skip = (page - 1) * limit;
  const sortBy = pagination?.sortBy || 'createdAt';
  const sortOrder = pagination?.sortOrder || 'desc';

  // Build where clause
  const where: any = {
    userId,
    deletedAt: null,
  };

  if (filter?.type) {
    where.type = filter.type;
  }

  if (filter?.isScheduled !== undefined) {
    where.isScheduled = filter.isScheduled;
  }

  if (filter?.search) {
    where.OR = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { description: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  // Execute query in parallel
  const [reports, totalCount] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.report.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    items: reports as unknown as Report[],
    pagination: {
      page,
      limit,
      totalItems: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Update Report
// ────────────────────────────────────────────────────────────────────────────

export async function updateReport(
  userId: string,
  reportId: string,
  update: ReportUpdate
): Promise<Report> {
  // Verify ownership
  const existing = await prisma.report.findFirst({
    where: { id: reportId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error('Report not found or access denied');
  }

  const report = await prisma.report.update({
    where: { id: reportId },
    data: {
      name: update.name,
      description: update.description,
      query: update.query ? (update.query as any) : undefined,
      chartType: update.chartType,
      chartConfig: update.chartConfig ? (update.chartConfig as any) : undefined,
      isScheduled: update.isScheduled,
      schedule: update.schedule,
      recipients: update.recipients,
      cacheTTL: update.cacheTTL,
      updatedBy: userId,
    },
  });

  return report as unknown as Report;
}

// ────────────────────────────────────────────────────────────────────────────
// Delete Report
// ────────────────────────────────────────────────────────────────────────────

export async function deleteReport(userId: string, reportId: string): Promise<void> {
  // Verify ownership
  const existing = await prisma.report.findFirst({
    where: { id: reportId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error('Report not found or access denied');
  }

  await prisma.report.update({
    where: { id: reportId },
    data: {
      deletedAt: new Date(),
      updatedBy: userId,
    },
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Run Report (Execute Query and Cache Results)
// ────────────────────────────────────────────────────────────────────────────

export async function runReport(userId: string, reportId: string): Promise<ReportResult> {
  const report = await getReportById(userId, reportId);
  if (!report) {
    throw new Error('Report not found');
  }

  // Check if cached result is still valid
  if (report.cachedResult && report.cachedAt) {
    const cacheAge = Date.now() - new Date(report.cachedAt).getTime();
    const cacheTTLMs = report.cacheTTL * 1000;

    if (cacheAge < cacheTTLMs) {
      return {
        data: report.cachedResult as unknown[],
        generatedAt: report.cachedAt,
        fromCache: true,
      };
    }
  }

  // Execute query (this will be implemented in query-engine.ts)
  const data = await executeReportQuery(userId, report.query);

  // Cache the results
  await prisma.report.update({
    where: { id: reportId },
    data: {
      cachedResult: data as any,
      cachedAt: new Date(),
      lastRunAt: new Date(),
    },
  });

  return {
    data,
    generatedAt: new Date(),
    fromCache: false,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Get Report Result (From Cache or Fresh)
// ────────────────────────────────────────────────────────────────────────────

export async function getReportResult(
  userId: string,
  reportId: string,
  forceRefresh: boolean = false
): Promise<ReportResult> {
  const report = await getReportById(userId, reportId);
  if (!report) {
    throw new Error('Report not found');
  }

  // If forceRefresh is true, always run fresh query
  if (forceRefresh) {
    return await runReport(userId, reportId);
  }

  // Check if cached result is still valid
  if (report.cachedResult && report.cachedAt) {
    const cacheAge = Date.now() - new Date(report.cachedAt).getTime();
    const cacheTTLMs = report.cacheTTL * 1000;

    if (cacheAge < cacheTTLMs) {
      return {
        data: report.cachedResult as unknown[],
        generatedAt: report.cachedAt,
        fromCache: true,
      };
    }
  }

  // Cache expired or doesn't exist, run fresh query
  return await runReport(userId, reportId);
}

// ────────────────────────────────────────────────────────────────────────────
// Schedule Report
// ────────────────────────────────────────────────────────────────────────────

export async function scheduleReport(
  userId: string,
  reportId: string,
  schedule: string,
  recipients: string[]
): Promise<Report> {
  // Verify ownership
  const existing = await getReportById(userId, reportId);
  if (!existing) {
    throw new Error('Report not found');
  }

  // Calculate next run time based on schedule
  const nextRunAt = calculateNextRunTime(schedule);

  const report = await prisma.report.update({
    where: { id: reportId },
    data: {
      isScheduled: true,
      schedule,
      recipients,
      nextRunAt,
      updatedBy: userId,
    },
  });

  return report as unknown as Report;
}

// ────────────────────────────────────────────────────────────────────────────
// Unschedule Report
// ────────────────────────────────────────────────────────────────────────────

export async function unscheduleReport(userId: string, reportId: string): Promise<Report> {
  // Verify ownership
  const existing = await getReportById(userId, reportId);
  if (!existing) {
    throw new Error('Report not found');
  }

  const report = await prisma.report.update({
    where: { id: reportId },
    data: {
      isScheduled: false,
      schedule: null,
      nextRunAt: null,
      updatedBy: userId,
    },
  });

  return report as unknown as Report;
}

// ────────────────────────────────────────────────────────────────────────────
// Get Scheduled Reports Due for Execution
// ────────────────────────────────────────────────────────────────────────────

export async function getScheduledReportsDue(userId: string): Promise<Report[]> {
  const reports = await prisma.report.findMany({
    where: {
      userId,
      isScheduled: true,
      nextRunAt: {
        lte: new Date(),
      },
      deletedAt: null,
    },
  });

  return reports as unknown as Report[];
}

// ────────────────────────────────────────────────────────────────────────────
// Process Scheduled Report
// ────────────────────────────────────────────────────────────────────────────

export async function processScheduledReport(userId: string, reportId: string): Promise<void> {
  const report = await getReportById(userId, reportId);
  if (!report) {
    throw new Error('Report not found');
  }

  // Run the report
  const result = await runReport(userId, reportId);

  // Send to recipients (this will be implemented in a notification service)
  // TODO: Send email with report results to recipients

  // Update next run time
  if (report.schedule) {
    const nextRunAt = calculateNextRunTime(report.schedule);

    await prisma.report.update({
      where: { id: reportId },
      data: {
        lastRunAt: new Date(),
        nextRunAt,
      },
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Execute Report Query
// ────────────────────────────────────────────────────────────────────────────

async function executeReportQuery(userId: string, query: any): Promise<unknown[]> {
  return await executeQuery(userId, query);
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Calculate Next Run Time
// ────────────────────────────────────────────────────────────────────────────

function calculateNextRunTime(schedule: string): Date {
  const now = new Date();

  // Parse schedule string (cron-like format)
  // For now, support simple formats: daily, weekly, monthly, hourly
  // In production, use a proper cron parser library

  switch (schedule.toLowerCase()) {
    case 'hourly':
      return new Date(now.getTime() + 60 * 60 * 1000);

    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);

    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    case 'monthly':
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;

    default:
      // Default to daily if unrecognized
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

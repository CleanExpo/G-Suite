/**
 * UNI-175: KPI Manager Service
 */

import { prisma } from '@/lib/db';
import type {
  KPI,
  KPIInput,
  KPIUpdate,
  KPIFilter,
  PaginationOptions,
  PaginatedResult,
} from './types';

// ────────────────────────────────────────────────────────────────────────────
// Create KPI
// ────────────────────────────────────────────────────────────────────────────

export async function createKPI(userId: string, input: KPIInput): Promise<KPI> {
  const kpi = await prisma.kPI.create({
    data: {
      userId,
      name: input.name,
      description: input.description || null,
      category: input.category,
      metric: input.metric,
      formula: input.formula as any,
      targetValue: input.targetValue || null,
      targetPeriod: input.targetPeriod || null,
      unit: input.unit || null,
      format: input.format || null,
      isVisible: input.isVisible !== undefined ? input.isVisible : true,
      sortOrder: input.sortOrder !== undefined ? input.sortOrder : 0,
      createdBy: userId,
      updatedBy: userId,
    },
  });

  return kpi as unknown as KPI;
}

// ────────────────────────────────────────────────────────────────────────────
// Get KPI by ID
// ────────────────────────────────────────────────────────────────────────────

export async function getKPIById(userId: string, kpiId: string): Promise<KPI | null> {
  const kpi = await prisma.kPI.findFirst({
    where: {
      id: kpiId,
      userId,
      deletedAt: null,
    },
  });

  return kpi as unknown as KPI | null;
}

// ────────────────────────────────────────────────────────────────────────────
// List KPIs
// ────────────────────────────────────────────────────────────────────────────

export async function listKPIs(
  userId: string,
  filter?: KPIFilter,
  pagination?: PaginationOptions
): Promise<PaginatedResult<KPI>> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const skip = (page - 1) * limit;
  const sortBy = pagination?.sortBy || 'sortOrder';
  const sortOrder = pagination?.sortOrder || 'asc';

  // Build where clause
  const where: any = {
    userId,
    deletedAt: null,
  };

  if (filter?.category) {
    where.category = filter.category;
  }

  if (filter?.isVisible !== undefined) {
    where.isVisible = filter.isVisible;
  }

  if (filter?.search) {
    where.OR = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { description: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  // Execute query in parallel
  const [kpis, totalCount] = await Promise.all([
    prisma.kPI.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.kPI.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    items: kpis as unknown as KPI[],
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
// Update KPI
// ────────────────────────────────────────────────────────────────────────────

export async function updateKPI(
  userId: string,
  kpiId: string,
  update: KPIUpdate
): Promise<KPI> {
  // Verify ownership
  const existing = await prisma.kPI.findFirst({
    where: { id: kpiId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error('KPI not found or access denied');
  }

  const kpi = await prisma.kPI.update({
    where: { id: kpiId },
    data: {
      name: update.name,
      description: update.description,
      formula: update.formula ? (update.formula as any) : undefined,
      targetValue: update.targetValue !== undefined ? update.targetValue : undefined,
      targetPeriod: update.targetPeriod,
      unit: update.unit,
      format: update.format,
      isVisible: update.isVisible,
      sortOrder: update.sortOrder,
      updatedBy: userId,
    },
  });

  return kpi as unknown as KPI;
}

// ────────────────────────────────────────────────────────────────────────────
// Delete KPI
// ────────────────────────────────────────────────────────────────────────────

export async function deleteKPI(userId: string, kpiId: string): Promise<void> {
  // Verify ownership
  const existing = await prisma.kPI.findFirst({
    where: { id: kpiId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error('KPI not found or access denied');
  }

  await prisma.kPI.update({
    where: { id: kpiId },
    data: {
      deletedAt: new Date(),
      updatedBy: userId,
    },
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Calculate KPI Value
// ────────────────────────────────────────────────────────────────────────────

export async function calculateKPI(userId: string, kpiId: string): Promise<KPI> {
  const kpi = await getKPIById(userId, kpiId);
  if (!kpi) {
    throw new Error('KPI not found');
  }

  // Calculate current value based on formula
  const currentValue = await executeKPIFormula(userId, kpi.formula);

  // Calculate previous value for comparison (if comparison is enabled)
  let previousValue: number | null = null;
  let changePercent: number | null = null;

  if (kpi.formula.comparison) {
    previousValue = await executeKPIFormulaForPreviousPeriod(userId, kpi.formula);

    if (previousValue !== null && previousValue !== 0) {
      changePercent = ((currentValue - previousValue) / previousValue) * 100;
    }
  }

  // Update KPI with calculated values
  const updatedKPI = await prisma.kPI.update({
    where: { id: kpiId },
    data: {
      currentValue,
      previousValue,
      changePercent,
      lastCalculatedAt: new Date(),
    },
  });

  return updatedKPI as unknown as KPI;
}

// ────────────────────────────────────────────────────────────────────────────
// Recalculate All KPIs for User
// ────────────────────────────────────────────────────────────────────────────

export async function recalculateAllKPIs(userId: string): Promise<void> {
  const kpis = await prisma.kPI.findMany({
    where: {
      userId,
      isVisible: true,
      deletedAt: null,
    },
  });

  for (const kpi of kpis) {
    try {
      await calculateKPI(userId, kpi.id);
    } catch (error) {
      console.error(`Failed to calculate KPI ${kpi.id}:`, error);
      // Continue with next KPI
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Get Visible KPIs (For Dashboard Display)
// ────────────────────────────────────────────────────────────────────────────

export async function getVisibleKPIs(userId: string, category?: string): Promise<KPI[]> {
  const where: any = {
    userId,
    isVisible: true,
    deletedAt: null,
  };

  if (category) {
    where.category = category;
  }

  const kpis = await prisma.kPI.findMany({
    where,
    orderBy: {
      sortOrder: 'asc',
    },
  });

  return kpis as unknown as KPI[];
}

// ────────────────────────────────────────────────────────────────────────────
// Toggle KPI Visibility
// ────────────────────────────────────────────────────────────────────────────

export async function toggleKPIVisibility(
  userId: string,
  kpiId: string,
  isVisible: boolean
): Promise<KPI> {
  // Verify ownership
  const existing = await getKPIById(userId, kpiId);
  if (!existing) {
    throw new Error('KPI not found');
  }

  const kpi = await prisma.kPI.update({
    where: { id: kpiId },
    data: {
      isVisible,
      updatedBy: userId,
    },
  });

  return kpi as unknown as KPI;
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Execute KPI Formula
// ────────────────────────────────────────────────────────────────────────────

async function executeKPIFormula(userId: string, formula: any): Promise<number> {
  const { dataSource, aggregation, field, filters, timeRange } = formula;

  // Build query based on data source
  let result = 0;

  try {
    switch (dataSource) {
      case 'invoices':
        result = await calculateInvoiceKPI(userId, aggregation, field, filters, timeRange);
        break;

      case 'contacts':
        result = await calculateContactKPI(userId, aggregation, field, filters, timeRange);
        break;

      case 'deals':
        result = await calculateDealKPI(userId, aggregation, field, filters, timeRange);
        break;

      case 'products':
        result = await calculateProductKPI(userId, aggregation, field, filters, timeRange);
        break;

      default:
        console.warn(`Unsupported data source: ${dataSource}`);
        result = 0;
    }
  } catch (error) {
    console.error(`Error calculating KPI formula:`, error);
    result = 0;
  }

  return result;
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Execute KPI Formula for Previous Period
// ────────────────────────────────────────────────────────────────────────────

async function executeKPIFormulaForPreviousPeriod(
  userId: string,
  formula: any
): Promise<number> {
  // Adjust time range to previous period
  const adjustedFormula = {
    ...formula,
    timeRange: getPreviousPeriodTimeRange(formula.timeRange, formula.comparison),
  };

  return await executeKPIFormula(userId, adjustedFormula);
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Calculate Invoice KPI
// ────────────────────────────────────────────────────────────────────────────

async function calculateInvoiceKPI(
  userId: string,
  aggregation: string,
  field: string,
  filters: any,
  timeRange?: string
): Promise<number> {
  const where: any = {
    userId,
    deletedAt: null,
  };

  // Apply time range filter
  if (timeRange) {
    const dateRange = getDateRangeFromTimeRange(timeRange);
    where.invoiceDate = {
      gte: dateRange.start,
      lte: dateRange.end,
    };
  }

  // Apply additional filters
  if (filters && Array.isArray(filters)) {
    for (const filter of filters) {
      applyFilter(where, filter);
    }
  }

  // Execute aggregation
  switch (aggregation) {
    case 'sum':
      const sumResult = await prisma.invoice.aggregate({
        where,
        _sum: { [field]: true },
      });
      return (sumResult._sum[field as keyof typeof sumResult._sum] as number) || 0;

    case 'avg':
      const avgResult = await prisma.invoice.aggregate({
        where,
        _avg: { [field]: true },
      });
      return (avgResult._avg[field as keyof typeof avgResult._avg] as number) || 0;

    case 'count':
      return await prisma.invoice.count({ where });

    case 'min':
      const minResult = await prisma.invoice.aggregate({
        where,
        _min: { [field]: true },
      });
      return (minResult._min[field as keyof typeof minResult._min] as number) || 0;

    case 'max':
      const maxResult = await prisma.invoice.aggregate({
        where,
        _max: { [field]: true },
      });
      return (maxResult._max[field as keyof typeof maxResult._max] as number) || 0;

    case 'countDistinct':
      const distinctResult = await prisma.invoice.groupBy({
        by: [field as any],
        where,
      });
      return distinctResult.length;

    default:
      return 0;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Calculate Contact KPI
// ────────────────────────────────────────────────────────────────────────────

async function calculateContactKPI(
  userId: string,
  aggregation: string,
  field: string,
  filters: any,
  timeRange?: string
): Promise<number> {
  const where: any = {
    userId,
    deletedAt: null,
  };

  if (timeRange) {
    const dateRange = getDateRangeFromTimeRange(timeRange);
    where.createdAt = {
      gte: dateRange.start,
      lte: dateRange.end,
    };
  }

  if (filters && Array.isArray(filters)) {
    for (const filter of filters) {
      applyFilter(where, filter);
    }
  }

  switch (aggregation) {
    case 'count':
      return await prisma.contact.count({ where });

    default:
      return 0;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Calculate Deal KPI
// ────────────────────────────────────────────────────────────────────────────

async function calculateDealKPI(
  userId: string,
  aggregation: string,
  field: string,
  filters: any,
  timeRange?: string
): Promise<number> {
  const where: any = {
    userId,
    deletedAt: null,
  };

  if (timeRange) {
    const dateRange = getDateRangeFromTimeRange(timeRange);
    where.createdAt = {
      gte: dateRange.start,
      lte: dateRange.end,
    };
  }

  if (filters && Array.isArray(filters)) {
    for (const filter of filters) {
      applyFilter(where, filter);
    }
  }

  switch (aggregation) {
    case 'sum':
      const sumResult = await prisma.deal.aggregate({
        where,
        _sum: { [field]: true },
      });
      return (sumResult._sum[field as keyof typeof sumResult._sum] as number) || 0;

    case 'avg':
      const avgResult = await prisma.deal.aggregate({
        where,
        _avg: { [field]: true },
      });
      return (avgResult._avg[field as keyof typeof avgResult._avg] as number) || 0;

    case 'count':
      return await prisma.deal.count({ where });

    default:
      return 0;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Calculate Product KPI
// ────────────────────────────────────────────────────────────────────────────

async function calculateProductKPI(
  userId: string,
  aggregation: string,
  field: string,
  filters: any,
  timeRange?: string
): Promise<number> {
  const where: any = {
    userId,
    deletedAt: null,
  };

  if (timeRange) {
    const dateRange = getDateRangeFromTimeRange(timeRange);
    where.createdAt = {
      gte: dateRange.start,
      lte: dateRange.end,
    };
  }

  if (filters && Array.isArray(filters)) {
    for (const filter of filters) {
      applyFilter(where, filter);
    }
  }

  switch (aggregation) {
    case 'count':
      return await prisma.product.count({ where });

    case 'sum':
      const sumResult = await prisma.product.aggregate({
        where,
        _sum: { [field]: true },
      });
      return (sumResult._sum[field as keyof typeof sumResult._sum] as number) || 0;

    default:
      return 0;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Apply Filter to Where Clause
// ────────────────────────────────────────────────────────────────────────────

function applyFilter(where: any, filter: any): void {
  const { field, operator, value } = filter;

  switch (operator) {
    case 'eq':
      where[field] = value;
      break;

    case 'neq':
      where[field] = { not: value };
      break;

    case 'gt':
      where[field] = { gt: value };
      break;

    case 'gte':
      where[field] = { gte: value };
      break;

    case 'lt':
      where[field] = { lt: value };
      break;

    case 'lte':
      where[field] = { lte: value };
      break;

    case 'contains':
      where[field] = { contains: value, mode: 'insensitive' };
      break;

    case 'in':
      where[field] = { in: value };
      break;

    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        where[field] = { gte: value[0], lte: value[1] };
      }
      break;

    default:
      console.warn(`Unsupported filter operator: ${operator}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Get Date Range from Time Range String
// ────────────────────────────────────────────────────────────────────────────

function getDateRangeFromTimeRange(timeRange: string): { start: Date; end: Date } {
  const now = new Date();
  let start: Date;
  let end: Date = now;

  switch (timeRange) {
    case 'current_day':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;

    case 'current_week':
      const dayOfWeek = now.getDay();
      start = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      break;

    case 'current_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;

    case 'current_quarter':
      const currentQuarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), currentQuarter * 3, 1);
      break;

    case 'current_year':
      start = new Date(now.getFullYear(), 0, 1);
      break;

    case 'last_7_days':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;

    case 'last_30_days':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;

    case 'last_90_days':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;

    default:
      start = new Date(now.getFullYear(), 0, 1);
  }

  return { start, end };
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Get Previous Period Time Range
// ────────────────────────────────────────────────────────────────────────────

function getPreviousPeriodTimeRange(
  timeRange: string,
  comparisonType: string
): string {
  if (comparisonType === 'year_over_year') {
    // Map to same period last year
    switch (timeRange) {
      case 'current_month':
        return 'previous_year_same_month';
      case 'current_quarter':
        return 'previous_year_same_quarter';
      case 'current_year':
        return 'previous_year';
      default:
        return 'previous_year';
    }
  }

  // Default to previous_period
  switch (timeRange) {
    case 'current_day':
      return 'previous_day';
    case 'current_week':
      return 'previous_week';
    case 'current_month':
      return 'previous_month';
    case 'current_quarter':
      return 'previous_quarter';
    case 'current_year':
      return 'previous_year';
    default:
      return 'previous_period';
  }
}

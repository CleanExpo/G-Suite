/**
 * UNI-175: Statistics Aggregation Service
 * Calculates aggregate statistics for CRM, Inventory, Invoices, and Reporting
 */

import { prisma } from '@/lib/db';
import type {
  CRMStatistics,
  InventoryStatistics,
  InvoiceStatistics,
  ReportingStatistics,
} from './types';

// ────────────────────────────────────────────────────────────────────────────
// Get CRM Statistics
// ────────────────────────────────────────────────────────────────────────────

export async function getCRMStatistics(userId: string): Promise<CRMStatistics> {
  const [
    totalContacts,
    totalCompanies,
    totalDeals,
    dealsWonData,
    dealsLostData,
    allDealsData,
  ] = await Promise.all([
    // Total contacts
    prisma.contact.count({
      where: { userId, deletedAt: null },
    }),

    // Total companies
    prisma.company.count({
      where: { userId, deletedAt: null },
    }),

    // Total deals
    prisma.deal.count({
      where: { userId, deletedAt: null },
    }),

    // Deals won (count and value)
    prisma.deal.aggregate({
      where: { userId, stage: 'closed_won', deletedAt: null },
      _count: true,
      _sum: { value: true },
    }),

    // Deals lost (count and value)
    prisma.deal.aggregate({
      where: { userId, stage: 'closed_lost', deletedAt: null },
      _count: true,
      _sum: { value: true },
    }),

    // All deals (for average calculation)
    prisma.deal.aggregate({
      where: { userId, deletedAt: null },
      _sum: { value: true },
      _avg: { value: true },
    }),
  ]);

  const dealsWonCount = dealsWonData._count || 0;
  const dealsWonValue = dealsWonData._sum?.value || 0;
  const dealsLostCount = dealsLostData._count || 0;
  const dealsLostValue = dealsLostData._sum?.value || 0;
  const totalDealsValue = allDealsData._sum.value || 0;
  const averageDealSize = allDealsData._avg.value || 0;

  // Calculate conversion rate
  const totalClosedDeals = dealsWonCount + dealsLostCount;
  const conversionRate =
    totalClosedDeals > 0 ? (dealsWonCount / totalClosedDeals) * 100 : 0;

  return {
    totalContacts,
    totalCompanies,
    totalDeals,
    totalDealsValue,
    dealsWonCount,
    dealsWonValue,
    dealsLostCount,
    dealsLostValue,
    conversionRate,
    averageDealSize,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Get Inventory Statistics
// ────────────────────────────────────────────────────────────────────────────

export async function getInventoryStatistics(userId: string): Promise<InventoryStatistics> {
  const [
    totalProducts,
    totalWarehouses,
    stockData,
    lowStockCount,
    outOfStockCount,
  ] = await Promise.all([
    // Total products
    prisma.product.count({
      where: { userId, deletedAt: null },
    }),

    // Total warehouses
    prisma.warehouse.count({
      where: { userId, deletedAt: null },
    }),

    // Stock value calculation
    prisma.$queryRaw<Array<{ total_value: number | null }>>`
      SELECT
        CAST(SUM(p."price" * sl."quantity") AS FLOAT) as total_value
      FROM "Product" p
      INNER JOIN "StockLevel" sl ON sl."productId" = p.id
      WHERE p."userId" = ${userId}
        AND p."deletedAt" IS NULL
        AND sl."deletedAt" IS NULL
    `,

    // Low stock products
    prisma.product.count({
      where: {
        userId,
        deletedAt: null,
        stockLevel: {
          lte: prisma.product.fields.reorderPoint,
          gt: 0,
        },
      },
    }),

    // Out of stock products
    prisma.product.count({
      where: {
        userId,
        deletedAt: null,
        stockLevel: 0,
      },
    }),
  ]);

  const totalStockValue = stockData[0]?.total_value || 0;

  // Calculate average stock level
  const avgStockData = await prisma.product.aggregate({
    where: { userId, deletedAt: null },
    _avg: { stockLevel: true },
  });

  const averageStockLevel = avgStockData._avg.stockLevel || 0;

  return {
    totalProducts,
    totalStockValue,
    lowStockCount,
    outOfStockCount,
    totalWarehouses,
    averageStockLevel,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Get Invoice Statistics
// ────────────────────────────────────────────────────────────────────────────

export async function getInvoiceStatistics(userId: string): Promise<InvoiceStatistics> {
  const [
    totalInvoices,
    revenueData,
    paidData,
    pendingData,
    overdueData,
  ] = await Promise.all([
    // Total invoices
    prisma.invoice.count({
      where: { userId, deletedAt: null },
    }),

    // Total revenue (all invoices)
    prisma.invoice.aggregate({
      where: { userId, deletedAt: null },
      _sum: { total: true },
      _avg: { total: true },
    }),

    // Paid invoices
    prisma.invoice.aggregate({
      where: { userId, status: 'paid', deletedAt: null },
      _sum: { total: true },
    }),

    // Pending invoices (draft, sent)
    prisma.invoice.aggregate({
      where: {
        userId,
        status: { in: ['draft', 'sent'] },
        deletedAt: null,
      },
      _sum: { total: true },
    }),

    // Overdue invoices
    prisma.invoice.aggregate({
      where: { userId, status: 'overdue', deletedAt: null },
      _count: { id: true },
      _sum: { balance: true },
    }),
  ]);

  const totalRevenue = revenueData._sum.total || 0;
  const averageInvoiceValue = revenueData._avg.total || 0;
  const totalPaid = paidData._sum.total || 0;
  const totalPending = pendingData._sum.total || 0;
  const totalOverdue = overdueData._sum.balance || 0;
  const overdueCount = overdueData._count.id || 0;

  return {
    totalInvoices,
    totalRevenue,
    totalPaid,
    totalPending,
    totalOverdue,
    overdueCount,
    averageInvoiceValue,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Get Reporting Statistics
// ────────────────────────────────────────────────────────────────────────────

export async function getReportingStatistics(userId: string): Promise<ReportingStatistics> {
  const [totalDashboards, totalReports, totalKPIs, scheduledReports] = await Promise.all([
    // Total dashboards
    prisma.dashboard.count({
      where: { userId, deletedAt: null },
    }),

    // Total reports
    prisma.report.count({
      where: { userId, deletedAt: null },
    }),

    // Total KPIs
    prisma.kPI.count({
      where: { userId, deletedAt: null },
    }),

    // Scheduled reports
    prisma.report.count({
      where: { userId, isScheduled: true, deletedAt: null },
    }),
  ]);

  return {
    totalDashboards,
    totalReports,
    totalKPIs,
    scheduledReports,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Get All Statistics (Combined)
// ────────────────────────────────────────────────────────────────────────────

export async function getAllStatistics(userId: string) {
  const [crm, inventory, invoices, reporting] = await Promise.all([
    getCRMStatistics(userId),
    getInventoryStatistics(userId),
    getInvoiceStatistics(userId),
    getReportingStatistics(userId),
  ]);

  return {
    crm,
    inventory,
    invoices,
    reporting,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Get Dashboard Overview Statistics (Most Important Metrics)
// ────────────────────────────────────────────────────────────────────────────

export async function getDashboardOverview(userId: string) {
  const [
    totalContacts,
    activeDeals,
    totalRevenue,
    overdueInvoices,
    lowStockProducts,
  ] = await Promise.all([
    // Total contacts
    prisma.contact.count({
      where: { userId, deletedAt: null },
    }),

    // Active deals (in_progress stage)
    prisma.deal.count({
      where: { userId, stage: 'in_progress', deletedAt: null },
    }),

    // Total revenue (paid invoices)
    prisma.invoice.aggregate({
      where: { userId, status: 'paid', deletedAt: null },
      _sum: { total: true },
    }),

    // Overdue invoices count
    prisma.invoice.count({
      where: { userId, status: 'overdue', deletedAt: null },
    }),

    // Low stock products
    prisma.product.count({
      where: {
        userId,
        deletedAt: null,
        stockLevel: {
          lte: prisma.product.fields.reorderPoint,
        },
      },
    }),
  ]);

  return {
    totalContacts,
    activeDeals,
    totalRevenue: totalRevenue._sum.total || 0,
    overdueInvoices,
    lowStockProducts,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Get Time-based Statistics (Current Month vs Previous Month)
// ────────────────────────────────────────────────────────────────────────────

export async function getMonthlyComparison(userId: string) {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    currentMonthRevenue,
    previousMonthRevenue,
    currentMonthDeals,
    previousMonthDeals,
    currentMonthContacts,
    previousMonthContacts,
  ] = await Promise.all([
    // Current month revenue
    prisma.invoice.aggregate({
      where: {
        userId,
        status: 'paid',
        paidAt: { gte: currentMonthStart },
        deletedAt: null,
      },
      _sum: { total: true },
    }),

    // Previous month revenue
    prisma.invoice.aggregate({
      where: {
        userId,
        status: 'paid',
        paidAt: { gte: previousMonthStart, lte: previousMonthEnd },
        deletedAt: null,
      },
      _sum: { total: true },
    }),

    // Current month deals won
    prisma.deal.count({
      where: {
        userId,
        stage: 'closed_won',
        actualCloseDate: { gte: currentMonthStart },
        deletedAt: null,
      },
    }),

    // Previous month deals won
    prisma.deal.count({
      where: {
        userId,
        stage: 'closed_won',
        actualCloseDate: { gte: previousMonthStart, lte: previousMonthEnd },
        deletedAt: null,
      },
    }),

    // Current month new contacts
    prisma.contact.count({
      where: {
        userId,
        createdAt: { gte: currentMonthStart },
        deletedAt: null,
      },
    }),

    // Previous month new contacts
    prisma.contact.count({
      where: {
        userId,
        createdAt: { gte: previousMonthStart, lte: previousMonthEnd },
        deletedAt: null,
      },
    }),
  ]);

  const currentRevenue = currentMonthRevenue._sum.total || 0;
  const previousRevenue = previousMonthRevenue._sum.total || 0;
  const revenueChange =
    previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  const dealsChange =
    previousMonthDeals > 0
      ? ((currentMonthDeals - previousMonthDeals) / previousMonthDeals) * 100
      : 0;

  const contactsChange =
    previousMonthContacts > 0
      ? ((currentMonthContacts - previousMonthContacts) / previousMonthContacts) * 100
      : 0;

  return {
    currentMonth: {
      revenue: currentRevenue,
      deals: currentMonthDeals,
      contacts: currentMonthContacts,
    },
    previousMonth: {
      revenue: previousRevenue,
      deals: previousMonthDeals,
      contacts: previousMonthContacts,
    },
    changes: {
      revenue: revenueChange,
      deals: dealsChange,
      contacts: contactsChange,
    },
  };
}

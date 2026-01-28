/**
 * UNI-175: Report Query Engine
 * Executes dynamic queries with filters, aggregations, and grouping
 */

import { prisma } from '@/lib/db';
import type { ReportQuery, ReportFilter, ReportAggregation, ReportOrderBy } from './types';

// ────────────────────────────────────────────────────────────────────────────
// Execute Report Query
// ────────────────────────────────────────────────────────────────────────────

export async function executeReportQuery(
  userId: string,
  query: ReportQuery
): Promise<unknown[]> {
  const { dataSource, filters, groupBy, aggregations, orderBy, limit, offset } = query;

  // Route to appropriate data source handler
  switch (dataSource) {
    case 'invoices':
      return await queryInvoices(userId, filters, groupBy, aggregations, orderBy, limit, offset);

    case 'contacts':
      return await queryContacts(userId, filters, groupBy, aggregations, orderBy, limit, offset);

    case 'companies':
      return await queryCompanies(userId, filters, groupBy, aggregations, orderBy, limit, offset);

    case 'deals':
      return await queryDeals(userId, filters, groupBy, aggregations, orderBy, limit, offset);

    case 'products':
      return await queryProducts(userId, filters, groupBy, aggregations, orderBy, limit, offset);

    case 'inventory':
      return await queryInventory(userId, filters, groupBy, aggregations, orderBy, limit, offset);

    default:
      throw new Error(`Unsupported data source: ${dataSource}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Query Invoices
// ────────────────────────────────────────────────────────────────────────────

async function queryInvoices(
  userId: string,
  filters?: ReportFilter[],
  groupBy?: string[],
  aggregations?: ReportAggregation[],
  orderBy?: ReportOrderBy[],
  limit?: number,
  offset?: number
): Promise<unknown[]> {
  const where = buildWhereClause(userId, filters);

  // If groupBy is specified, use groupBy query
  if (groupBy && groupBy.length > 0) {
    const groupByFields = groupBy.filter((field) =>
      isValidInvoiceField(field)
    ) as any[];

    if (groupByFields.length === 0) {
      throw new Error('Invalid groupBy fields for invoices');
    }

    const result = await prisma.invoice.groupBy({
      by: groupByFields,
      where,
      _count: { id: true },
      _sum: buildSumAggregations(aggregations),
      _avg: buildAvgAggregations(aggregations),
      _min: buildMinAggregations(aggregations),
      _max: buildMaxAggregations(aggregations),
    });

    return result as unknown[];
  }

  // Otherwise, use findMany query
  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: buildOrderBy(orderBy),
    skip: offset,
    take: limit || 100,
    select: {
      id: true,
      invoiceNumber: true,
      invoiceDate: true,
      dueDate: true,
      customerName: true,
      status: true,
      subtotal: true,
      taxAmount: true,
      total: true,
      paidAmount: true,
      balance: true,
      currency: true,
      createdAt: true,
    },
  });

  return invoices;
}

// ────────────────────────────────────────────────────────────────────────────
// Query Contacts
// ────────────────────────────────────────────────────────────────────────────

async function queryContacts(
  userId: string,
  filters?: ReportFilter[],
  groupBy?: string[],
  aggregations?: ReportAggregation[],
  orderBy?: ReportOrderBy[],
  limit?: number,
  offset?: number
): Promise<unknown[]> {
  const where = buildWhereClause(userId, filters);

  if (groupBy && groupBy.length > 0) {
    const groupByFields = groupBy.filter((field) =>
      isValidContactField(field)
    ) as any[];

    if (groupByFields.length === 0) {
      throw new Error('Invalid groupBy fields for contacts');
    }

    const result = await prisma.contact.groupBy({
      by: groupByFields,
      where,
      _count: { id: true },
    });

    return result as unknown[];
  }

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: buildOrderBy(orderBy),
    skip: offset,
    take: limit || 100,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      source: true,
      createdAt: true,
    },
  });

  return contacts;
}

// ────────────────────────────────────────────────────────────────────────────
// Query Companies
// ────────────────────────────────────────────────────────────────────────────

async function queryCompanies(
  userId: string,
  filters?: ReportFilter[],
  groupBy?: string[],
  aggregations?: ReportAggregation[],
  orderBy?: ReportOrderBy[],
  limit?: number,
  offset?: number
): Promise<unknown[]> {
  const where = buildWhereClause(userId, filters);

  if (groupBy && groupBy.length > 0) {
    const groupByFields = groupBy.filter((field) =>
      isValidCompanyField(field)
    ) as any[];

    if (groupByFields.length === 0) {
      throw new Error('Invalid groupBy fields for companies');
    }

    const result = await prisma.company.groupBy({
      by: groupByFields,
      where,
      _count: { id: true },
    });

    return result as unknown[];
  }

  const companies = await prisma.company.findMany({
    where,
    orderBy: buildOrderBy(orderBy),
    skip: offset,
    take: limit || 100,
    select: {
      id: true,
      name: true,
      industry: true,
      employeeCount: true,
      annualRevenue: true,
      website: true,
      phone: true,
      createdAt: true,
    },
  });

  return companies;
}

// ────────────────────────────────────────────────────────────────────────────
// Query Deals
// ────────────────────────────────────────────────────────────────────────────

async function queryDeals(
  userId: string,
  filters?: ReportFilter[],
  groupBy?: string[],
  aggregations?: ReportAggregation[],
  orderBy?: ReportOrderBy[],
  limit?: number,
  offset?: number
): Promise<unknown[]> {
  const where = buildWhereClause(userId, filters);

  if (groupBy && groupBy.length > 0) {
    const groupByFields = groupBy.filter((field) =>
      isValidDealField(field)
    ) as any[];

    if (groupByFields.length === 0) {
      throw new Error('Invalid groupBy fields for deals');
    }

    const result = await prisma.deal.groupBy({
      by: groupByFields,
      where,
      _count: { id: true },
      _sum: buildSumAggregations(aggregations),
      _avg: buildAvgAggregations(aggregations),
    });

    return result as unknown[];
  }

  const deals = await prisma.deal.findMany({
    where,
    orderBy: buildOrderBy(orderBy),
    skip: offset,
    take: limit || 100,
    select: {
      id: true,
      name: true,
      value: true,
      stage: true,
      probability: true,
      expectedCloseDate: true,
      actualCloseDate: true,
      lostReason: true,
      ownerId: true,
      createdAt: true,
    },
  });

  return deals;
}

// ────────────────────────────────────────────────────────────────────────────
// Query Products
// ────────────────────────────────────────────────────────────────────────────

async function queryProducts(
  userId: string,
  filters?: ReportFilter[],
  groupBy?: string[],
  aggregations?: ReportAggregation[],
  orderBy?: ReportOrderBy[],
  limit?: number,
  offset?: number
): Promise<unknown[]> {
  const where = buildWhereClause(userId, filters);

  if (groupBy && groupBy.length > 0) {
    const groupByFields = groupBy.filter((field) =>
      isValidProductField(field)
    ) as any[];

    if (groupByFields.length === 0) {
      throw new Error('Invalid groupBy fields for products');
    }

    const result = await prisma.product.groupBy({
      by: groupByFields,
      where,
      _count: { id: true },
      _sum: buildSumAggregations(aggregations),
      _avg: buildAvgAggregations(aggregations),
    });

    return result as unknown[];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: buildOrderBy(orderBy),
    skip: offset,
    take: limit || 100,
    select: {
      id: true,
      sku: true,
      name: true,
      category: true,
      sellingPrice: true,
      unitCost: true,
      stockLevel: true,
      reorderPoint: true,
      status: true,
      createdAt: true,
    },
  });

  return products;
}

// ────────────────────────────────────────────────────────────────────────────
// Query Inventory
// ────────────────────────────────────────────────────────────────────────────

async function queryInventory(
  userId: string,
  filters?: ReportFilter[],
  groupBy?: string[],
  aggregations?: ReportAggregation[],
  orderBy?: ReportOrderBy[],
  limit?: number,
  offset?: number
): Promise<unknown[]> {
  const where = buildWhereClause(userId, filters);

  if (groupBy && groupBy.length > 0) {
    const groupByFields = groupBy.filter((field) =>
      isValidStockLevelField(field)
    ) as any[];

    if (groupByFields.length === 0) {
      throw new Error('Invalid groupBy fields for inventory');
    }

    const result = await prisma.stockLocation.groupBy({
      by: groupByFields,
      where,
      _count: { id: true },
      _sum: buildSumAggregations(aggregations),
      _avg: buildAvgAggregations(aggregations),
    });

    return result as unknown[];
  }

  const stockLocations = await prisma.stockLocation.findMany({
    where,
    orderBy: buildOrderBy(orderBy),
    skip: offset,
    take: limit || 100,
    select: {
      id: true,
      productId: true,
      warehouseId: true,
      quantity: true,
      reservedQuantity: true,
      zone: true,
      aisle: true,
      rack: true,
      product: {
        select: {
          name: true,
          sku: true,
          category: true,
        },
      },
      warehouse: {
        select: {
          name: true,
          code: true,
        },
      },
    },
  });

  return stockLocations;
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Build Where Clause from Filters
// ────────────────────────────────────────────────────────────────────────────

function buildWhereClause(userId: string, filters?: ReportFilter[]): any {
  const where: any = {
    userId,
    deletedAt: null,
  };

  if (!filters || filters.length === 0) {
    return where;
  }

  for (const filter of filters) {
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
        where[field] = { contains: value as string, mode: 'insensitive' };
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

  return where;
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Build Sum Aggregations
// ────────────────────────────────────────────────────────────────────────────

function buildSumAggregations(aggregations?: ReportAggregation[]): any {
  if (!aggregations) return undefined;

  const sumFields: any = {};
  for (const agg of aggregations) {
    if (agg.function === 'sum') {
      sumFields[agg.field] = true;
    }
  }

  return Object.keys(sumFields).length > 0 ? sumFields : undefined;
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Build Avg Aggregations
// ────────────────────────────────────────────────────────────────────────────

function buildAvgAggregations(aggregations?: ReportAggregation[]): any {
  if (!aggregations) return undefined;

  const avgFields: any = {};
  for (const agg of aggregations) {
    if (agg.function === 'avg') {
      avgFields[agg.field] = true;
    }
  }

  return Object.keys(avgFields).length > 0 ? avgFields : undefined;
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Build Min Aggregations
// ────────────────────────────────────────────────────────────────────────────

function buildMinAggregations(aggregations?: ReportAggregation[]): any {
  if (!aggregations) return undefined;

  const minFields: any = {};
  for (const agg of aggregations) {
    if (agg.function === 'min') {
      minFields[agg.field] = true;
    }
  }

  return Object.keys(minFields).length > 0 ? minFields : undefined;
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Build Max Aggregations
// ────────────────────────────────────────────────────────────────────────────

function buildMaxAggregations(aggregations?: ReportAggregation[]): any {
  if (!aggregations) return undefined;

  const maxFields: any = {};
  for (const agg of aggregations) {
    if (agg.function === 'max') {
      maxFields[agg.field] = true;
    }
  }

  return Object.keys(maxFields).length > 0 ? maxFields : undefined;
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: Build OrderBy Clause
// ────────────────────────────────────────────────────────────────────────────

function buildOrderBy(orderBy?: ReportOrderBy[]): any {
  if (!orderBy || orderBy.length === 0) {
    return { createdAt: 'desc' };
  }

  return orderBy.map((order) => ({
    [order.field]: order.direction,
  }));
}

// ────────────────────────────────────────────────────────────────────────────
// Field Validation Helpers
// ────────────────────────────────────────────────────────────────────────────

function isValidInvoiceField(field: string): boolean {
  const validFields = [
    'status',
    'currency',
    'invoiceDate',
    'dueDate',
    'createdAt',
    'subtotal',
    'taxAmount',
    'total',
    'paidAmount',
    'balance',
  ];
  return validFields.includes(field);
}

function isValidContactField(field: string): boolean {
  const validFields = ['status', 'source', 'createdAt'];
  return validFields.includes(field);
}

function isValidCompanyField(field: string): boolean {
  const validFields = ['industry', 'employeeCount', 'createdAt'];
  return validFields.includes(field);
}

function isValidDealField(field: string): boolean {
  const validFields = [
    'stage',
    'ownerId',
    'createdAt',
    'expectedCloseDate',
    'actualCloseDate',
    'value',
    'probability',
  ];
  return validFields.includes(field);
}

function isValidProductField(field: string): boolean {
  const validFields = ['category', 'status', 'createdAt', 'sellingPrice', 'unitCost', 'stockLevel'];
  return validFields.includes(field);
}

function isValidStockLevelField(field: string): boolean {
  const validFields = [
    'productId',
    'warehouseId',
    'quantity',
    'reservedQuantity',
    'zone',
    'aisle',
  ];
  return validFields.includes(field);
}

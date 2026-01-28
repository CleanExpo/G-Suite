/**
 * UNI-175: Reporting & Analytics - TypeScript Types
 */

// ────────────────────────────────────────────────────────────────────────────
// Dashboard Types
// ────────────────────────────────────────────────────────────────────────────

export type DashboardType = 'custom' | 'template' | 'system';

export interface DashboardWidget {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: string; // sales_chart, pipeline_status, kpi_card, etc.
  config: Record<string, unknown>;
}

export interface DashboardLayout {
  columns: number;
  widgets: DashboardWidget[];
}

export interface DashboardInput {
  name: string;
  description?: string;
  type?: DashboardType;
  layout: DashboardLayout;
  isPublic?: boolean;
  sharedWith?: string[];
  isDefault?: boolean;
  sortOrder?: number;
}

export interface DashboardUpdate {
  name?: string;
  description?: string;
  layout?: DashboardLayout;
  isPublic?: boolean;
  sharedWith?: string[];
  isDefault?: boolean;
  sortOrder?: number;
}

export interface Dashboard {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  type: DashboardType;
  layout: DashboardLayout;
  isPublic: boolean;
  sharedWith: string[];
  isDefault: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Report Types
// ────────────────────────────────────────────────────────────────────────────

export type ReportType = 'sales' | 'inventory' | 'financial' | 'crm' | 'custom';

export type ChartType = 'line' | 'bar' | 'pie' | 'table' | 'area' | 'scatter';

export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between';

export type AggregationFunction = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'countDistinct';

export interface ReportFilter {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface ReportAggregation {
  field: string;
  function: AggregationFunction;
  alias: string;
}

export interface ReportOrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ReportQuery {
  dataSource: string; // invoices, products, contacts, etc.
  filters?: ReportFilter[];
  groupBy?: string[];
  aggregations?: ReportAggregation[];
  orderBy?: ReportOrderBy[];
  limit?: number;
  offset?: number;
}

export interface ChartConfig {
  xAxis?: string;
  yAxis?: string | string[];
  legend?: boolean;
  colors?: string[];
  stacked?: boolean;
  [key: string]: unknown;
}

export interface ReportInput {
  name: string;
  description?: string;
  type: ReportType;
  query: ReportQuery;
  chartType?: ChartType;
  chartConfig?: ChartConfig;
  isScheduled?: boolean;
  schedule?: string;
  recipients?: string[];
  cacheTTL?: number;
}

export interface ReportUpdate {
  name?: string;
  description?: string;
  query?: ReportQuery;
  chartType?: ChartType;
  chartConfig?: ChartConfig;
  isScheduled?: boolean;
  schedule?: string;
  recipients?: string[];
  cacheTTL?: number;
}

export interface Report {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  type: ReportType;
  query: ReportQuery;
  chartType: ChartType | null;
  chartConfig: ChartConfig | null;
  isScheduled: boolean;
  schedule: string | null;
  recipients: string[];
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  cachedResult: unknown | null;
  cachedAt: Date | null;
  cacheTTL: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date | null;
}

export interface ReportResult {
  data: unknown[];
  generatedAt: Date;
  fromCache: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// KPI Types
// ────────────────────────────────────────────────────────────────────────────

export type KPICategory = 'sales' | 'inventory' | 'financial' | 'operations' | 'crm';

export type KPIMetric =
  | 'revenue'
  | 'conversion_rate'
  | 'inventory_turnover'
  | 'average_order_value'
  | 'customer_lifetime_value'
  | 'churn_rate'
  | 'gross_margin'
  | 'net_profit_margin'
  | 'custom';

export type KPIUnit = 'currency' | 'percentage' | 'count' | 'ratio' | 'days';

export type KPIPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface KPIFormula {
  dataSource: string;
  aggregation: AggregationFunction;
  field: string;
  filters?: ReportFilter[];
  timeRange?: string; // current_day, current_week, current_month, etc.
  comparison?: 'previous_period' | 'year_over_year';
}

export interface KPIInput {
  name: string;
  description?: string;
  category: KPICategory;
  metric: KPIMetric;
  formula: KPIFormula;
  targetValue?: number;
  targetPeriod?: KPIPeriod;
  unit?: KPIUnit;
  format?: string;
  isVisible?: boolean;
  sortOrder?: number;
}

export interface KPIUpdate {
  name?: string;
  description?: string;
  formula?: KPIFormula;
  targetValue?: number;
  targetPeriod?: KPIPeriod;
  unit?: KPIUnit;
  format?: string;
  isVisible?: boolean;
  sortOrder?: number;
}

export interface KPI {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: KPICategory;
  metric: KPIMetric;
  formula: KPIFormula;
  targetValue: number | null;
  targetPeriod: KPIPeriod | null;
  currentValue: number | null;
  previousValue: number | null;
  changePercent: number | null;
  lastCalculatedAt: Date | null;
  unit: KPIUnit | null;
  format: string | null;
  isVisible: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Filters & Pagination
// ────────────────────────────────────────────────────────────────────────────

export interface DashboardFilter {
  type?: DashboardType;
  isPublic?: boolean;
  isDefault?: boolean;
  search?: string;
}

export interface ReportFilter {
  type?: ReportType;
  isScheduled?: boolean;
  search?: string;
}

export interface KPIFilter {
  category?: KPICategory;
  isVisible?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Statistics & Aggregations
// ────────────────────────────────────────────────────────────────────────────

export interface CRMStatistics {
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  totalDealsValue: number;
  dealsWonCount: number;
  dealsWonValue: number;
  dealsLostCount: number;
  dealsLostValue: number;
  conversionRate: number;
  averageDealSize: number;
}

export interface InventoryStatistics {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalWarehouses: number;
  averageStockLevel: number;
}

export interface InvoiceStatistics {
  totalInvoices: number;
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  overdueCount: number;
  averageInvoiceValue: number;
}

export interface ReportingStatistics {
  totalDashboards: number;
  totalReports: number;
  totalKPIs: number;
  scheduledReports: number;
}

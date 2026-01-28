/**
 * UNI-175: Reporting & Analytics - Barrel Exports
 */

// Export all types
export * from './types';

// Export Dashboard Manager
export {
  createDashboard,
  getDashboardById,
  listDashboards,
  updateDashboard,
  deleteDashboard,
  getDefaultDashboard,
  setDefaultDashboard,
  cloneDashboard,
} from './dashboard-manager';

// Export Report Manager
export {
  createReport,
  getReportById,
  listReports,
  updateReport,
  deleteReport,
  runReport,
  getReportResult,
  scheduleReport,
  unscheduleReport,
  getScheduledReportsDue,
  processScheduledReport,
} from './report-manager';

// Export KPI Manager
export {
  createKPI,
  getKPIById,
  listKPIs,
  updateKPI,
  deleteKPI,
  calculateKPI,
  recalculateAllKPIs,
  getVisibleKPIs,
  toggleKPIVisibility,
} from './kpi-manager';

// Export Query Engine
export { executeReportQuery } from './query-engine';

// Export Statistics Aggregator
export {
  getCRMStatistics,
  getInventoryStatistics,
  getInvoiceStatistics,
  getReportingStatistics,
  getAllStatistics,
  getDashboardOverview,
  getMonthlyComparison,
} from './statistics-aggregator';

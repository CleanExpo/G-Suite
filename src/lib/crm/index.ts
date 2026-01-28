/**
 * UNI-171: CRM Service Layer - Barrel Exports
 *
 * Centralized exports for all CRM services
 */

// Types
export * from './types';

// Contact Manager
export {
  createContact,
  listContacts,
  getContactById,
  updateContact,
  deleteContact,
  getContactsByCompany,
  getContactsByDeal,
  updateLeadScore,
} from './contact-manager';

// Company Manager
export {
  createCompany,
  listCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getCompanyHierarchy,
  getCompaniesByIndustry,
} from './company-manager';

// Deal Manager
export {
  createDeal,
  listDeals,
  getDealById,
  updateDeal,
  moveDealToStage,
  deleteDeal,
  getPipelineView,
  getSalesForecast,
  getDealsByOwner,
  DEAL_STAGES,
} from './deal-manager';

// Interaction Manager
export {
  createInteraction,
  listInteractions,
  getInteractionById,
  updateInteraction,
  deleteInteraction,
  getContactTimeline,
  getCompanyTimeline,
  getDealTimeline,
  getUpcomingInteractions,
} from './interaction-manager';

// Task Manager
export {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getMyTasks,
  getOverdueTasks,
  getContactTasks,
  getCompanyTasks,
  getDealTasks,
} from './task-manager';

// CSV Utilities
export {
  parseContactsCSV,
  generateContactsCSV,
  validateCSV,
} from './csv-utils';

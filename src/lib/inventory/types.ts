/**
 * UNI-172: Inventory & Stock Management - Type Definitions
 */

// ─── Product Types ──────────────────────────────────────────────────────

export interface ProductInput {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  unitCost?: number; // In cents
  sellingPrice?: number; // In cents
  currency?: string;
  trackInventory?: boolean;
  reorderPoint?: number;
  reorderQuantity?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  barcode?: string;
  status?: string;
  customFields?: Record<string, any>;
}

export interface ProductFilter {
  status?: string;
  category?: string;
  search?: string;
  lowStock?: boolean;
}

// ─── Warehouse Types ────────────────────────────────────────────────────

export interface WarehouseInput {
  name: string;
  code: string;
  type?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  status?: string;
  isDefault?: boolean;
  customFields?: Record<string, any>;
}

export interface WarehouseFilter {
  status?: string;
  type?: string;
}

// ─── Stock Types ────────────────────────────────────────────────────────

export interface StockAdjustmentInput {
  productId: string;
  warehouseId: string;
  quantity: number;
  type: 'in' | 'out' | 'adjustment';
  subType?: string;
  notes?: string;
  unitCost?: number;
}

export interface StockTransferInput {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  notes?: string;
}

export interface LowStockAlert {
  productId: string;
  sku: string;
  name: string;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  deficit: number;
}

// ─── Transaction Types ──────────────────────────────────────────────────

export interface TransactionFilter {
  productId?: string;
  warehouseId?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
}

// ─── Pagination ─────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * UNI-172: CSV Utilities
 *
 * Import/Export products to/from CSV format
 */

import type { ProductInput } from './types';

/**
 * Parse CSV content into ProductInput array
 * Expected columns: SKU, Name, Description, Category, Brand, Unit Cost, Selling Price, Reorder Point, Reorder Quantity, Barcode
 */
export function parseProductsCSV(csvContent: string): ProductInput[] {
  const products: ProductInput[] = [];

  // Split into lines
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    return products;
  }

  // Skip header row
  const dataLines = lines.slice(1);

  for (const line of dataLines) {
    // Simple CSV parsing (should use proper CSV library like Papa Parse in production)
    const columns = line.split(',').map((col) => col.trim().replace(/^"|"$/g, ''));

    if (columns.length < 10) {
      continue; // Skip invalid rows
    }

    const product: ProductInput = {
      sku: columns[0],
      name: columns[1],
      description: columns[2] || undefined,
      category: columns[3] || undefined,
      brand: columns[4] || undefined,
      unitCost: parseInt(columns[5]) || 0,
      sellingPrice: parseInt(columns[6]) || 0,
      reorderPoint: parseInt(columns[7]) || 0,
      reorderQuantity: parseInt(columns[8]) || 0,
      barcode: columns[9] || undefined,
    };

    products.push(product);
  }

  return products;
}

/**
 * Generate CSV content from products array
 */
export function generateProductsCSV(products: any[]): string {
  // CSV header
  const header = [
    'SKU',
    'Name',
    'Description',
    'Category',
    'Brand',
    'Unit Cost',
    'Selling Price',
    'Stock Level',
    'Reorder Point',
    'Reorder Quantity',
    'Barcode',
    'Status',
    'Created At',
  ].join(',');

  // CSV rows
  const rows = products.map((product) => {
    return [
      escapeCsvField(product.sku),
      escapeCsvField(product.name),
      escapeCsvField(product.description || ''),
      escapeCsvField(product.category || ''),
      escapeCsvField(product.brand || ''),
      product.unitCost,
      product.sellingPrice,
      product.stockLevel,
      product.reorderPoint,
      product.reorderQuantity,
      escapeCsvField(product.barcode || ''),
      escapeCsvField(product.status),
      escapeCsvField(new Date(product.createdAt).toISOString()),
    ].join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Escape CSV field (wrap in quotes if contains comma, newline, or quotes)
 */
function escapeCsvField(field: string): string {
  if (!field) {
    return '';
  }

  const stringField = String(field);

  // If field contains comma, newline, or quotes, wrap in quotes and escape quotes
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
}

/**
 * Validate CSV file format
 */
export function validateProductsCSV(csvContent: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    errors.push('CSV file must contain at least a header row and one data row');
    return { valid: false, errors };
  }

  // Check header
  const header = lines[0].toLowerCase();
  const requiredColumns = ['sku', 'name'];

  for (const col of requiredColumns) {
    if (!header.includes(col)) {
      errors.push(`Missing required column: ${col}`);
    }
  }

  // Validate at least one data row
  const dataLines = lines.slice(1).filter((line) => line.trim());
  if (dataLines.length === 0) {
    errors.push('CSV file contains no data rows');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

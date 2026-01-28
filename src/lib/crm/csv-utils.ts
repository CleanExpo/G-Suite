/**
 * UNI-171: CSV Import/Export Utilities
 *
 * Functions for importing and exporting CRM contacts via CSV
 */

import type { Contact } from '@prisma/client';
import type { ContactInput } from './types';

/**
 * Parse contacts from CSV content
 */
export function parseContactsCSV(csvContent: string): ContactInput[] {
  const lines = csvContent.split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse header row
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  // Map common CSV column names to our ContactInput fields
  const columnMapping: Record<string, string> = {
    'first name': 'firstName',
    'firstname': 'firstName',
    'last name': 'lastName',
    'lastname': 'lastName',
    'email': 'email',
    'phone': 'phone',
    'mobile': 'mobile',
    'job title': 'title',
    'title': 'title',
    'department': 'department',
    'company': 'companyName',
    'address': 'addressLine1',
    'address line 1': 'addressLine1',
    'city': 'city',
    'state': 'state',
    'zip': 'postalCode',
    'postal code': 'postalCode',
    'country': 'country',
    'source': 'source',
    'status': 'status',
  };

  const contacts: ContactInput[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has mismatched columns, skipping`);
      continue;
    }

    const contact: any = {};

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      const value = values[j].trim();

      if (!value) continue;

      const fieldName = columnMapping[header] || header;
      contact[fieldName] = value;
    }

    // Validate required fields
    if (contact.firstName && contact.lastName) {
      contacts.push(contact as ContactInput);
    } else {
      console.warn(`Row ${i + 1} missing firstName or lastName, skipping`);
    }
  }

  return contacts;
}

/**
 * Parse a single CSV line (handles quoted values with commas)
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

/**
 * Generate CSV content from contacts
 */
export function generateContactsCSV(contacts: Contact[]): string {
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Mobile',
    'Title',
    'Department',
    'Company',
    'Address Line 1',
    'Address Line 2',
    'City',
    'State',
    'Postal Code',
    'Country',
    'Source',
    'Status',
    'Lead Score',
    'Created At',
  ];

  const csvLines: string[] = [headers.join(',')];

  for (const contact of contacts) {
    const row = [
      escapeCSVField(contact.firstName),
      escapeCSVField(contact.lastName),
      escapeCSVField(contact.email || ''),
      escapeCSVField(contact.phone || ''),
      escapeCSVField(contact.mobile || ''),
      escapeCSVField(contact.title || ''),
      escapeCSVField(contact.department || ''),
      escapeCSVField((contact as any).company?.name || ''),
      escapeCSVField(contact.addressLine1 || ''),
      escapeCSVField(contact.addressLine2 || ''),
      escapeCSVField(contact.city || ''),
      escapeCSVField(contact.state || ''),
      escapeCSVField(contact.postalCode || ''),
      escapeCSVField(contact.country || ''),
      escapeCSVField(contact.source || ''),
      escapeCSVField(contact.status),
      contact.leadScore.toString(),
      contact.createdAt.toISOString(),
    ];

    csvLines.push(row.join(','));
  }

  return csvLines.join('\n');
}

/**
 * Escape a CSV field (wrap in quotes if contains comma, quote, or newline)
 */
function escapeCSVField(value: string): string {
  if (!value) return '';

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/**
 * Validate CSV structure
 */
export function validateCSV(csvContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!csvContent || csvContent.trim().length === 0) {
    errors.push('CSV content is empty');
    return { valid: false, errors };
  }

  const lines = csvContent.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    errors.push('CSV must have at least a header row and one data row');
    return { valid: false, errors };
  }

  // Check header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  const hasFirstName = headers.some(h => h.includes('first') && h.includes('name'));
  const hasLastName = headers.some(h => h.includes('last') && h.includes('name'));

  if (!hasFirstName) {
    errors.push('CSV must include a "First Name" column');
  }

  if (!hasLastName) {
    errors.push('CSV must include a "Last Name" column');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

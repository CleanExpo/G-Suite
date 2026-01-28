/**
 * UNI-173: Invoice Status Badge Component
 */

import React from 'react';
import type { InvoiceStatus } from '@/lib/invoices/types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function InvoiceStatusBadge({ status, className = '' }: InvoiceStatusBadgeProps) {
  const getStatusStyles = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
      case 'sent':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-500';
      case 'refunded':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: InvoiceStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full ${getStatusStyles(
        status
      )} ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

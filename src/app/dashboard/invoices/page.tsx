/**
 * UNI-173: Invoices Dashboard Page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, DollarSign, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { InvoiceStatusBadge } from '@/components/invoice-status-badge';

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerEmail?: string;
  total: number;
  paidAmount: number;
  balance: number;
  status: string;
  currency: string;
}

interface InvoiceStats {
  totalInvoices: number;
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await fetch(`/api/invoices?${params}`);
      const data = await res.json();

      if (data.success) {
        setInvoices(data.data.items);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/invoices/stats');
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [fetchInvoices, fetchStats]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">
              Invoices
            </h1>
            <Link
              href="/dashboard/invoices/new"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Invoice
            </Link>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Manage your invoices and track payments
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Total Invoices
                  </p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {stats.totalInvoices}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center border border-green-100 dark:border-green-800">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Total Paid
                  </p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {formatCurrency(stats.totalPaid)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center border border-yellow-100 dark:border-yellow-800">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Pending
                  </p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {formatCurrency(stats.totalPending)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center border border-red-100 dark:border-red-800">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Overdue
                  </p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {formatCurrency(stats.totalOverdue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-50 dark:bg-[#0b0e14] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Invoices List */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading invoices...</p>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No invoices found</p>
              <Link
                href="/dashboard/invoices/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Invoice
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                      Invoice
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                      Due Date
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                      Amount
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                      Balance
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#0b0e14] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="font-mono text-sm font-bold text-blue-600 hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {invoice.customerName}
                          </p>
                          {invoice.customerEmail && (
                            <p className="text-xs text-gray-500">{invoice.customerEmail}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {formatDate(invoice.invoiceDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                        {formatCurrency(invoice.balance, invoice.currency)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <InvoiceStatusBadge status={invoice.status as any} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600 dark:text-gray-400 font-bold">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

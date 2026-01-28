/**
 * UNI-173: Invoice Detail Page
 */

'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Download, Send, Ban, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { InvoiceStatusBadge } from '@/components/invoice-status-badge';

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerEmail?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  balance: number;
  status: string;
  currency: string;
  notes?: string;
  terms?: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    referenceNumber?: string;
  }>;
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${id}`);
        const data = await res.json();

        if (data.success) {
          setInvoice(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch invoice:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Invoice not found</p>
          <Link
            href="/dashboard/invoices"
            className="text-blue-600 hover:underline"
          >
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/dashboard/invoices"
            className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
                {invoice.invoiceNumber}
              </h1>
              <InvoiceStatusBadge status={invoice.status as any} className="text-sm" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open(`/api/invoices/${id}/pdf`, '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-80 transition-opacity"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Customer Info */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">
              Bill To
            </p>
            <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">
              {invoice.customerName}
            </p>
            {invoice.customerEmail && (
              <p className="text-sm text-gray-500">{invoice.customerEmail}</p>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">
              Dates
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Invoice Date</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {formatDate(invoice.invoiceDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {formatDate(invoice.dueDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Amount Summary */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">
              Amount
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-bold text-gray-900 dark:text-white text-2xl">
                  {formatCurrency(invoice.total, invoice.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Balance Due</p>
                <p className="font-bold text-blue-600 text-xl">
                  {formatCurrency(invoice.balance, invoice.currency)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 mb-6">
          <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
            Line Items
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                    Description
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                    Qty
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                    Unit Price
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-white/10">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                      {formatCurrency(item.amount, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <td colSpan={3} className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                    Subtotal
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                    {formatCurrency(invoice.subtotal, invoice.currency)}
                  </td>
                </tr>
                {invoice.taxAmount > 0 && (
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <td colSpan={3} className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      Tax ({(invoice.taxRate * 100).toFixed(2)}%)
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                      {formatCurrency(invoice.taxAmount, invoice.currency)}
                    </td>
                  </tr>
                )}
                {invoice.discountAmount > 0 && (
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <td colSpan={3} className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      Discount
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">
                      -{formatCurrency(invoice.discountAmount, invoice.currency)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-lg font-black text-gray-900 dark:text-white">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right text-lg font-black text-gray-900 dark:text-white">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment History */}
        {invoice.payments.length > 0 && (
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
              Payment History
            </h2>
            <div className="space-y-3">
              {invoice.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10 last:border-0"
                >
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(payment.paymentDate)}
                      {payment.referenceNumber && ` • Ref: ${payment.referenceNumber}`}
                    </p>
                  </div>
                  <p className="font-bold text-green-600 text-lg">
                    {formatCurrency(payment.amount, invoice.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

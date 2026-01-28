'use client';

/**
 * UNI-175: Analytics Overview Dashboard
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  FileText,
  Target,
  Activity,
} from 'lucide-react';

interface CRMStats {
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  totalDealsValue: number;
  dealsWonValue: number;
  conversionRate: number;
}

interface InventoryStats {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface InvoiceStats {
  totalInvoices: number;
  totalRevenue: number;
  totalPaid: number;
  totalOverdue: number;
  overdueCount: number;
}

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [crmStats, setCrmStats] = useState<CRMStats | null>(null);
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(null);
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStats | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all stats in parallel
      const [crmRes, invRes, invoiceRes] = await Promise.all([
        fetch('/api/stats/crm'),
        fetch('/api/stats/inventory'),
        fetch('/api/stats/invoices'),
      ]);

      const [crmData, invData, invoiceData] = await Promise.all([
        crmRes.json(),
        invRes.json(),
        invoiceRes.json(),
      ]);

      if (crmData.success) setCrmStats(crmData.data);
      if (invData.success) setInventoryStats(invData.data);
      if (invoiceData.success) setInvoiceStats(invoiceData.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100); // Convert cents to dollars
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time insights across your entire business
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => router.push('/dashboard/reports')}
          className="p-4 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl hover:shadow-lg transition-shadow text-left"
        >
          <FileText className="w-6 h-6 text-blue-600 mb-2" />
          <div className="text-sm font-semibold text-gray-900 dark:text-white">Reports</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">View all reports</div>
        </button>

        <button
          onClick={() => router.push('/dashboard/dashboards')}
          className="p-4 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl hover:shadow-lg transition-shadow text-left"
        >
          <Activity className="w-6 h-6 text-purple-600 mb-2" />
          <div className="text-sm font-semibold text-gray-900 dark:text-white">Dashboards</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Custom views</div>
        </button>

        <button
          onClick={() => router.push('/dashboard/reports/new')}
          className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-left"
        >
          <Target className="w-6 h-6 mb-2" />
          <div className="text-sm font-semibold">Create Report</div>
          <div className="text-xs opacity-90">Build custom report</div>
        </button>

        <button
          onClick={() => router.push('/dashboard/dashboards/new')}
          className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors text-left"
        >
          <Activity className="w-6 h-6 mb-2" />
          <div className="text-sm font-semibold">New Dashboard</div>
          <div className="text-xs opacity-90">Design layout</div>
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Total Revenue
          </h3>
          <p className="text-3xl font-black text-gray-900 dark:text-white">
            {invoiceStats ? formatCurrency(invoiceStats.totalRevenue) : '$0'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {invoiceStats?.totalInvoices || 0} invoices
          </p>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Pipeline Value
          </h3>
          <p className="text-3xl font-black text-gray-900 dark:text-white">
            {crmStats ? formatCurrency(crmStats.totalDealsValue) : '$0'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {crmStats?.totalDeals || 0} deals
          </p>
        </div>

        {/* Contacts */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Total Contacts
          </h3>
          <p className="text-3xl font-black text-gray-900 dark:text-white">
            {crmStats?.totalContacts || 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {crmStats?.totalCompanies || 0} companies
          </p>
        </div>

        {/* Inventory Value */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Stock Value
          </h3>
          <p className="text-3xl font-black text-gray-900 dark:text-white">
            {inventoryStats ? formatCurrency(inventoryStats.totalStockValue) : '$0'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {inventoryStats?.totalProducts || 0} products
          </p>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CRM Stats */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
              CRM Performance
            </h2>
            <Users className="w-6 h-6 text-blue-600" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {crmStats ? formatPercent(crmStats.conversionRate) : '0%'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Won Deals Value</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {crmStats ? formatCurrency(crmStats.dealsWonValue) : '$0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Deals</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {crmStats?.totalDeals || 0}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard/crm')}
            className="mt-6 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors text-sm"
          >
            View CRM Dashboard
          </button>
        </div>

        {/* Inventory Stats */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
              Inventory Status
            </h2>
            <Package className="w-6 h-6 text-orange-600" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Products</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {inventoryStats?.totalProducts || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Low Stock Items</span>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {inventoryStats?.lowStockCount || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                {inventoryStats?.outOfStockCount || 0}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard/inventory')}
            className="mt-6 w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-colors text-sm"
          >
            View Inventory
          </button>
        </div>

        {/* Invoice Stats */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
              Financial Overview
            </h2>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Paid</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {invoiceStats ? formatCurrency(invoiceStats.totalPaid) : '$0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Overdue Amount</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                {invoiceStats ? formatCurrency(invoiceStats.totalOverdue) : '$0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Overdue Count</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                {invoiceStats?.overdueCount || 0}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard/invoices')}
            className="mt-6 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors text-sm"
          >
            View Invoices
          </button>
        </div>
      </div>
    </div>
  );
}

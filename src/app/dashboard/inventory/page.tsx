/**
 * UNI-172: Inventory Overview Dashboard
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Warehouse, AlertTriangle, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface InventoryStats {
  totalProducts: number;
  totalWarehouses: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export default function InventoryPage() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [itemsRes, warehousesRes, alertsRes] = await Promise.all([
        fetch('/api/inventory/items?limit=1'),
        fetch('/api/inventory/warehouses'),
        fetch('/api/inventory/stock/alerts'),
      ]);

      const itemsData = await itemsRes.json();
      const warehousesData = await warehousesRes.json();
      const alertsData = await alertsRes.json();

      setStats({
        totalProducts: itemsData.success ? itemsData.data.pagination.total : 0,
        totalWarehouses: warehousesData.success ? warehousesData.data.length : 0,
        lowStockCount: alertsData.success ? alertsData.data.length : 0,
        outOfStockCount: 0,
      });

      setLowStockAlerts(alertsData.success ? alertsData.data : []);
    } catch (error) {
      console.error('Failed to fetch inventory stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-4">
            Inventory Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Track stock levels, manage warehouses, and monitor inventory movements
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats?.totalProducts || 0}
            href="/dashboard/inventory/items"
          />
          <StatCard
            icon={Warehouse}
            label="Warehouses"
            value={stats?.totalWarehouses || 0}
            href="/dashboard/inventory/warehouses"
          />
          <StatCard
            icon={AlertTriangle}
            label="Low Stock Items"
            value={stats?.lowStockCount || 0}
            href="/dashboard/inventory/items?lowStock=true"
            variant="warning"
          />
          <StatCard
            icon={TrendingDown}
            label="Out of Stock"
            value={stats?.outOfStockCount || 0}
            href="/dashboard/inventory/items?status=out_of_stock"
            variant="danger"
          />
        </div>

        {/* Low Stock Alerts */}
        {lowStockAlerts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">
              Low Stock Alerts
            </h2>
            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
              <div className="space-y-3">
                {lowStockAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.productId}
                    className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {alert.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          SKU: {alert.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600">
                        {alert.currentStock} units
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Reorder at {alert.reorderPoint}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Products"
            description="Manage your product catalog"
            href="/dashboard/inventory/items"
          />
          <QuickActionCard
            title="Warehouses"
            description="Manage warehouse locations"
            href="/dashboard/inventory/warehouses"
          />
          <QuickActionCard
            title="Transactions"
            description="View stock movement history"
            href="/dashboard/inventory/transactions"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, href, variant = 'default' }: any) {
  const colorClass =
    variant === 'warning'
      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800'
      : variant === 'danger'
      ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800';

  const iconColor =
    variant === 'warning'
      ? 'text-orange-600'
      : variant === 'danger'
      ? 'text-red-600'
      : 'text-blue-600';

  return (
    <Link
      href={href}
      className="bg-white dark:bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center border`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            {label}
          </p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </Link>
  );
}

function QuickActionCard({ title, description, href }: any) {
  return (
    <Link
      href={href}
      className="bg-white dark:bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-200 dark:border-white/10 hover:shadow-md transition-shadow"
    >
      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </Link>
  );
}

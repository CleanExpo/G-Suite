/**
 * UNI-172: Warehouses List Page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Warehouse, Plus, MapPin } from 'lucide-react';
import Link from 'next/link';

interface WarehouseType {
  id: string;
  name: string;
  code: string;
  type: string;
  city: string | null;
  state: string | null;
  country: string | null;
  status: string;
  isDefault: boolean;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
      });

      const res = await fetch(`/api/inventory/warehouses?${params}`);
      const data = await res.json();

      if (data.success) {
        setWarehouses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-4">
              Warehouses
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
              Manage warehouse locations and stock
            </p>
          </div>
          <Link
            href="/dashboard/inventory/warehouses/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Warehouse
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-[#0b0e14] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-[#0b0e14] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="standard">Standard</option>
              <option value="fulfillment">Fulfillment</option>
              <option value="retail">Retail</option>
            </select>
          </div>
        </div>

        {/* Warehouses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              Loading warehouses...
            </div>
          ) : warehouses.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No warehouses found
            </div>
          ) : (
            warehouses.map((warehouse) => (
              <Link
                key={warehouse.id}
                href={`/dashboard/inventory/warehouses/${warehouse.id}`}
                className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800">
                    <Warehouse className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white">
                        {warehouse.name}
                      </h3>
                      {warehouse.isDefault && (
                        <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-mono text-gray-500">
                      {warehouse.code}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {[warehouse.city, warehouse.state, warehouse.country]
                        .filter(Boolean)
                        .join(', ') || 'No location set'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
                  <span
                    className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full ${
                      warehouse.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {warehouse.status}
                  </span>
                  <span className="text-xs font-bold text-gray-500 uppercase">
                    {warehouse.type}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

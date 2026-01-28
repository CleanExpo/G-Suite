/**
 * UNI-172: Warehouse Detail Page
 */

'use client';

import { useState, useEffect, use } from 'react';
import { Warehouse, Edit, Trash2, ArrowLeft, MapPin, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface WarehouseType {
  id: string;
  name: string;
  code: string;
  type: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  managerName: string | null;
  status: string;
  isDefault: boolean;
  createdAt: string;
}

interface StockLevel {
  product: {
    id: string;
    sku: string;
    name: string;
  };
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
}

export default function WarehouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [warehouse, setWarehouse] = useState<WarehouseType | null>(null);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehouseRes, stockRes] = await Promise.all([
          fetch(`/api/inventory/warehouses/${id}`),
          fetch(`/api/inventory/stock?warehouseId=${id}`),
        ]);

        const warehouseData = await warehouseRes.json();
        const stockData = await stockRes.json();

        if (warehouseData.success) {
          setWarehouse(warehouseData.data);
        }

        if (stockData.success) {
          setStockLevels(stockData.data);
        }
      } catch (error) {
        console.error('Failed to fetch warehouse:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;

    try {
      const res = await fetch(`/api/inventory/warehouses/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/dashboard/inventory/warehouses');
      }
    } catch (error) {
      console.error('Failed to delete warehouse:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32 flex items-center justify-center">
        <p className="text-gray-500">Warehouse not found</p>
      </div>
    );
  }

  const fullAddress = [
    warehouse.addressLine1,
    warehouse.addressLine2,
    warehouse.city,
    warehouse.state,
    warehouse.postalCode,
    warehouse.country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/dashboard/inventory/warehouses"
            className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Warehouses
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">
                  {warehouse.name}
                </h1>
                {warehouse.isDefault && (
                  <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-lg font-mono text-gray-600 dark:text-gray-400">
                {warehouse.code}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <Link
                href={`/dashboard/inventory/warehouses/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Details Card */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800">
                <Warehouse className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Details
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Type</p>
                <p className="font-bold text-gray-900 dark:text-white capitalize">
                  {warehouse.type}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Status</p>
                <span
                  className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full ${
                    warehouse.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                  }`}
                >
                  {warehouse.status}
                </span>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Created</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {new Date(warehouse.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Address Card */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center border border-purple-100 dark:border-purple-800">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Address
                </p>
              </div>
            </div>
            {fullAddress ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {fullAddress}
              </p>
            ) : (
              <p className="text-sm text-gray-500">No address set</p>
            )}
          </div>

          {/* Contact Card */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center border border-green-100 dark:border-green-800">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Contact
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {warehouse.managerName && (
                <div>
                  <p className="text-gray-500 mb-1">Manager</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {warehouse.managerName}
                  </p>
                </div>
              )}
              {warehouse.phone && (
                <div>
                  <p className="text-gray-500 mb-1">Phone</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {warehouse.phone}
                  </p>
                </div>
              )}
              {warehouse.email && (
                <div>
                  <p className="text-gray-500 mb-1">Email</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {warehouse.email}
                  </p>
                </div>
              )}
              {!warehouse.managerName && !warehouse.phone && !warehouse.email && (
                <p className="text-sm text-gray-500">No contact information</p>
              )}
            </div>
          </div>
        </div>

        {/* Stock Levels */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
          <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
            Stock Levels
          </h2>
          {stockLevels.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No stock in this warehouse</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                      SKU
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                      Product
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                      Total
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                      Available
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-400">
                      Reserved
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stockLevels.map((stock) => (
                    <tr
                      key={stock.product.id}
                      className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#0b0e14] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/inventory/items/${stock.product.id}`}
                          className="font-mono text-sm font-bold text-blue-600 hover:underline"
                        >
                          {stock.product.sku}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/inventory/items/${stock.product.id}`}
                          className="font-bold text-gray-900 dark:text-white hover:underline"
                        >
                          {stock.product.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                        {stock.quantity}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">
                        {stock.availableQuantity}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-orange-600">
                        {stock.reservedQuantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

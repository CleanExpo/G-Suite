/**
 * UNI-172: Inventory Items List Page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Search, Plus, Download, Upload, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  stockLevel: number;
  reorderPoint: number;
  unitCost: number;
  sellingPrice: number;
  status: string;
}

export default function ItemsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(lowStockFilter && { lowStock: 'true' }),
      });

      const res = await fetch(`/api/inventory/items?${params}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.data.items);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter, categoryFilter, lowStockFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(lowStockFilter && { lowStock: 'true' }),
      });

      const res = await fetch(`/api/inventory/items/export?${params}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-4">
              Products
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
              Manage your product catalog and inventory
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/inventory/items/import"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              <Upload className="w-4 h-4" />
              Import
            </Link>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <Link
              href="/dashboard/inventory/items/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Product
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by SKU, name, or barcode..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#0b0e14] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-gray-50 dark:bg-[#0b0e14] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="discontinued">Discontinued</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-gray-50 dark:bg-[#0b0e14] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="food">Food</option>
              <option value="other">Other</option>
            </select>
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-[#0b0e14] border border-gray-200 dark:border-white/10 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockFilter}
                onChange={(e) => {
                  setLowStockFilter(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Low Stock Only
              </span>
            </label>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
                    SKU
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
                    Product
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
                    Category
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
                    Stock Level
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
                    Unit Cost
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
                    Selling Price
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#0b0e14] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/inventory/items/${product.id}`}
                          className="font-mono text-sm font-bold text-blue-600 hover:underline"
                        >
                          {product.sku}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/inventory/items/${product.id}`}
                          className="block"
                        >
                          <p className="font-bold text-gray-900 dark:text-white">
                            {product.name}
                          </p>
                          {product.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                              {product.description}
                            </p>
                          )}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {product.category || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {product.stockLevel <= product.reorderPoint && (
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                          )}
                          <span
                            className={`font-bold ${
                              product.stockLevel <= product.reorderPoint
                                ? 'text-orange-600'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {product.stockLevel}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-gray-600 dark:text-gray-400">
                        ${(product.unitCost / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-bold text-gray-900 dark:text-white">
                        ${(product.sellingPrice / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full ${
                            product.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                              : product.status === 'discontinued'
                              ? 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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

/**
 * UNI-172: Inventory Item Detail Page
 */

'use client';

import { useState, useEffect, use } from 'react';
import { Package, Warehouse, TrendingUp, TrendingDown, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  brand: string | null;
  stockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  sellingPrice: number;
  weight: number | null;
  barcode: string | null;
  status: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  type: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  notes: string | null;
  createdAt: string;
  warehouse: { name: string };
}

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, transactionsRes] = await Promise.all([
          fetch(`/api/inventory/items/${id}`),
          fetch(`/api/inventory/transactions/history?productId=${id}&limit=10`),
        ]);

        const productData = await productRes.json();
        const transactionsData = await transactionsRes.json();

        if (productData.success) {
          setProduct(productData.data);
        }

        if (transactionsData.success) {
          setTransactions(transactionsData.data);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/inventory/items/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/dashboard/inventory/items');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32 flex items-center justify-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/dashboard/inventory/items"
            className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-mono font-bold text-gray-500 dark:text-gray-400 mb-2">
                {product.sku}
              </p>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {product.description}
                </p>
              )}
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
                href={`/dashboard/inventory/items/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Stock Level Card */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Stock Level
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">
                  {product.stockLevel}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Reorder Point:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {product.reorderPoint}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reorder Quantity:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {product.reorderQuantity}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center border border-green-100 dark:border-green-800">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Pricing
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Unit Cost:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  ${(product.unitCost / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Selling Price:</span>
                <span className="font-mono font-bold text-green-600">
                  ${(product.sellingPrice / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Margin:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {(((product.sellingPrice - product.unitCost) / product.sellingPrice) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center border border-purple-100 dark:border-purple-800">
                <Warehouse className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Details
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {product.category || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Brand:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {product.brand || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Weight:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {product.weight ? `${product.weight} kg` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Barcode:</span>
                <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                  {product.barcode || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
          <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
            Recent Transactions
          </h2>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === 'in'
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      {tx.type === 'in' ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white capitalize">
                        {tx.type} - {tx.warehouse.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                      {tx.notes && (
                        <p className="text-xs text-gray-400 mt-1">{tx.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        tx.type === 'in' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {tx.type === 'in' ? '+' : '-'}
                      {Math.abs(tx.quantity)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {tx.stockBefore} → {tx.stockAfter}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

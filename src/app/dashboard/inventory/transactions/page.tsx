/**
 * UNI-172: Inventory Transactions Page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, ArrowLeftRight, Settings } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: string;
  subType: string | null;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  notes: string | null;
  createdAt: string;
  product: {
    sku: string;
    name: string;
  };
  warehouse: {
    name: string;
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(typeFilter && { type: typeFilter }),
      });

      const res = await fetch(`/api/inventory/transactions?${params}`);
      const data = await res.json();

      if (data.success) {
        setTransactions(data.data.items);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'out':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'transfer':
        return <ArrowLeftRight className="w-5 h-5 text-blue-600" />;
      case 'adjustment':
        return <Settings className="w-5 h-5 text-purple-600" />;
      default:
        return <Settings className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'in':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'out':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'transfer':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'adjustment':
        return 'bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-4">
            Transactions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            View all inventory movement history
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 mb-6">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-50 dark:bg-[#0b0e14] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>

        {/* Transactions List */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No transactions found</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-white/10 last:border-0"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(tx.type)}`}>
                      {getTypeIcon(tx.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/dashboard/inventory/items/${tx.product.sku}`}
                          className="font-bold text-gray-900 dark:text-white hover:underline"
                        >
                          {tx.product.name}
                        </Link>
                        <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 rounded-full">
                          {tx.type}
                          {tx.subType && ` - ${tx.subType}`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        SKU: {tx.product.sku} · {tx.warehouse.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                      {tx.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
                          {tx.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xl font-black ${
                        tx.type === 'in'
                          ? 'text-green-600'
                          : tx.type === 'out'
                          ? 'text-red-600'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {tx.type === 'in' && '+'}
                      {tx.type === 'out' && '-'}
                      {Math.abs(tx.quantity)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {tx.stockBefore} → {tx.stockAfter}
                    </p>
                  </div>
                </div>
              ))}
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

/**
 * UNI-171: Companies List Page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Building2 } from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  status: string;
  _count?: {
    contacts: number;
    deals: number;
  };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/crm/companies?${params}`);
      const data = await res.json();

      if (data.success) {
        setCompanies(data.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
              Companies
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {companies.length > 0 && `${companies.length} companies`}
            </p>
          </div>
          <Link
            href="/dashboard/crm/companies/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="font-bold text-sm">New Company</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="prospect">Prospect</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading companies...</div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No companies found.</p>
            <Link
              href="/dashboard/crm/companies/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="font-bold text-sm">Add Your First Company</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/dashboard/crm/companies/${company.id}`}
                className="bg-white dark:bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-200 dark:border-white/10 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-lg text-gray-900 dark:text-white mb-1">
                      {company.name}
                    </h3>
                    {company.industry && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {company.industry}
                      </p>
                    )}
                  </div>
                </div>

                {company.website && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-4 truncate">
                    {company.website}
                  </p>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-white/10">
                  <div className="text-sm">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {company._count?.contacts || 0}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">contacts</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {company._count?.deals || 0}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">deals</span>
                  </div>
                  <span className={`ml-auto px-2 py-1 rounded-lg text-xs font-bold ${
                    company.status === 'active' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                    company.status === 'prospect' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                    'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                  }`}>
                    {company.status.toUpperCase()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

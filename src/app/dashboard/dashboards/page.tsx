'use client';

/**
 * UNI-175: Dashboards List Page
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Plus, Search, Star } from 'lucide-react';

interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  type: string;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: string;
}

export default function DashboardsPage() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboards = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/dashboards?${params}`);
      const result = await response.json();

      if (result.success) {
        setDashboards(result.data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboards:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchDashboards();
  }, [fetchDashboards]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
              Dashboards
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create custom dashboards with KPI widgets
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/dashboards/new')}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Dashboard
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search dashboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Dashboards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : dashboards.length === 0 ? (
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-12 text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No dashboards found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first dashboard to visualize your KPIs
          </p>
          <button
            onClick={() => router.push('/dashboard/dashboards/new')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
          >
            Create Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/dashboards/${dashboard.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                {dashboard.isDefault && (
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {dashboard.name}
              </h3>

              {dashboard.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {dashboard.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {dashboard.type}
                  </span>
                  {dashboard.isPublic && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Public</span>
                    </>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/dashboards/${dashboard.id}`);
                  }}
                  className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
                >
                  View →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

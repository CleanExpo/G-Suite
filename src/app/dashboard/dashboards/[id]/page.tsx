'use client';

/**
 * UNI-175: Dashboard Viewer Page
 */

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, ArrowLeft, Activity, TrendingUp, Users, DollarSign } from 'lucide-react';

interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  type: string;
  layout: {
    columns: number;
    widgets: any[];
  };
  isDefault: boolean;
  isPublic: boolean;
  createdAt: string;
}

export default function DashboardViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboards/${resolvedParams.id}`);
      const result = await response.json();

      if (result.success) {
        setDashboard(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this dashboard?')) return;

    try {
      await fetch(`/api/dashboards/${resolvedParams.id}`, { method: 'DELETE' });
      router.push('/dashboard/dashboards');
    } catch (error) {
      console.error('Failed to delete dashboard:', error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Dashboard not found</p>
          <button
            onClick={() => router.push('/dashboard/dashboards')}
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            ← Back to Dashboards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/dashboards')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboards
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
              {dashboard.name}
            </h1>
            {dashboard.description && (
              <p className="text-gray-600 dark:text-gray-400">{dashboard.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Type</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
            {dashboard.type}
          </div>
        </div>

        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Visibility</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {dashboard.isPublic ? 'Public' : 'Private'}
          </div>
        </div>

        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Widgets</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {dashboard.layout.widgets.length}
          </div>
        </div>

        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {new Date(dashboard.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {dashboard.layout.widgets.length === 0 ? (
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-12 text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No widgets added yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start adding KPI widgets to visualize your data
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Widget builder coming soon. For now, use the Analytics overview page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample KPI Widgets (placeholder for actual widgets) */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Sample KPI Widget
            </h3>
            <p className="text-3xl font-black text-gray-900 dark:text-white">$12,345</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Widget configuration coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

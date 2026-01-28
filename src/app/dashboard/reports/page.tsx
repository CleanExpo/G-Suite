'use client';

/**
 * UNI-175: Reports List Page
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Download,
  Play,
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string | null;
  type: string;
  chartType: string | null;
  isScheduled: boolean;
  lastRunAt: string | null;
  createdAt: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [scheduledFilter, setScheduledFilter] = useState<string>('');

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (typeFilter) params.append('type', typeFilter);
      if (scheduledFilter) params.append('isScheduled', scheduledFilter);

      const response = await fetch(`/api/reports?${params}`);
      const result = await response.json();

      if (result.success) {
        setReports(result.data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, typeFilter, scheduledFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sales':
        return <TrendingUp className="w-5 h-5" />;
      case 'inventory':
        return <BarChart3 className="w-5 h-5" />;
      case 'financial':
        return <PieChart className="w-5 h-5" />;
      case 'crm':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sales':
        return 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'inventory':
        return 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
      case 'financial':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'crm':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleRunReport = async (reportId: string) => {
    try {
      await fetch(`/api/reports/${reportId}/run`, { method: 'POST' });
      router.push(`/dashboard/reports/${reportId}`);
    } catch (error) {
      console.error('Failed to run report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
              Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage custom business reports
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/reports/new')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="sales">Sales</option>
            <option value="inventory">Inventory</option>
            <option value="financial">Financial</option>
            <option value="crm">CRM</option>
            <option value="custom">Custom</option>
          </select>

          {/* Scheduled Filter */}
          <select
            value={scheduledFilter}
            onChange={(e) => setScheduledFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Reports</option>
            <option value="true">Scheduled Only</option>
            <option value="false">Manual Only</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No reports found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first report to start analyzing your data
          </p>
          <button
            onClick={() => router.push('/dashboard/reports/new')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            Create Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(
                      report.type
                    )}`}
                  >
                    {getTypeIcon(report.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {report.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {report.type}
                      </span>
                      {report.chartType && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {report.chartType} chart
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {report.isScheduled && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    <Calendar className="w-3 h-3" />
                    Scheduled
                  </span>
                )}
              </div>

              {/* Description */}
              {report.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {report.description}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {report.lastRunAt ? (
                    <span>Last run {new Date(report.lastRunAt).toLocaleDateString()}</span>
                  ) : (
                    <span>Never run</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunReport(report.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    Run
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/reports/${report.id}`)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

/**
 * UNI-175: Report Viewer Page
 */

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Play, Edit, Trash2, ArrowLeft } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string | null;
  type: string;
  chartType: string | null;
  query: any;
  lastRunAt: string | null;
  cachedResult: any;
}

export default function ReportViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/${resolvedParams.id}`);
      const result = await response.json();

      if (result.success) {
        setReport(result.data);
        if (result.data.cachedResult) {
          setReportData(result.data.cachedResult.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  const handleRunReport = useCallback(async () => {
    try {
      setRunning(true);
      const response = await fetch(`/api/reports/${resolvedParams.id}/run`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success && result.data.data) {
        setReportData(result.data.data);
      }
      fetchReport(); // Refresh to get updated lastRunAt
    } catch (error) {
      console.error('Failed to run report:', error);
    } finally {
      setRunning(false);
    }
  }, [resolvedParams.id, fetchReport]);

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/reports/${resolvedParams.id}/export`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report?.name || 'report'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      await fetch(`/api/reports/${resolvedParams.id}`, { method: 'DELETE' });
      router.push('/dashboard/reports');
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Report not found</p>
          <button
            onClick={() => router.push('/dashboard/reports')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Reports
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
          onClick={() => router.push('/dashboard/reports')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
              {report.name}
            </h1>
            {report.description && (
              <p className="text-gray-600 dark:text-gray-400">{report.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunReport}
              disabled={running}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {running ? 'Running...' : 'Run Report'}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
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

      {/* Report Info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Type</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
            {report.type}
          </div>
        </div>

        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Chart Type</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
            {report.chartType || 'Table'}
          </div>
        </div>

        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Data Source</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
            {report.query?.dataSource || 'N/A'}
          </div>
        </div>

        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Run</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {report.lastRunAt
              ? new Date(report.lastRunAt).toLocaleDateString()
              : 'Never'}
          </div>
        </div>
      </div>

      {/* Report Data */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
        <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
          Report Results
        </h2>

        {reportData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No data available. Run the report to see results.
            </p>
            <button
              onClick={handleRunReport}
              disabled={running}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {running ? 'Running...' : 'Run Report Now'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10">
                <tr>
                  {Object.keys(reportData[0] || {}).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {reportData.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-[#0a0a0a] transition-colors"
                  >
                    {Object.values(row).map((value: any, i) => (
                      <td
                        key={i}
                        className="px-6 py-4 text-sm text-gray-900 dark:text-white"
                      >
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

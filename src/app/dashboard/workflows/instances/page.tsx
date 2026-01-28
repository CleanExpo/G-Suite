'use client';

/**
 * UNI-174: Workflow Instances List Page
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Clock, Play, Search, XCircle } from 'lucide-react';

interface WorkflowInstance {
  id: string;
  templateId: string;
  template?: {
    name: string;
  };
  referenceType: string;
  referenceId: string;
  status: string;
  currentStepId: string | null;
  isOverdue: boolean;
  slaDeadline: string | null;
  createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
}

export default function WorkflowInstancesPage() {
  const router = useRouter();
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchInstances = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/workflows/instances?${params}`);
      const result = await response.json();

      if (result.success) {
        setInstances(result.data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch instances:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue && status === 'in_progress') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="w-3 h-3" />
          Overdue
        </span>
      );
    }

    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            <Play className="w-3 h-3" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
          Workflow Instances
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track and manage your workflow executions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Instances List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : instances.length === 0 ? (
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-12 text-center">
          <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No workflow instances found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Workflow instances will appear here when triggered
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Reference
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Template
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Started
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    SLA Deadline
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {instances.map((instance) => (
                  <tr
                    key={instance.id}
                    className="hover:bg-gray-50 dark:hover:bg-[#0a0a0a] transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/workflows/instances/${instance.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {instance.referenceType}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {instance.referenceId.slice(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {instance.template?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(instance.status, instance.isOverdue)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(instance.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {instance.slaDeadline ? (
                        <div
                          className={`text-sm ${
                            instance.isOverdue
                              ? 'text-red-600 dark:text-red-400 font-semibold'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {new Date(instance.slaDeadline).toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No deadline</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/workflows/instances/${instance.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

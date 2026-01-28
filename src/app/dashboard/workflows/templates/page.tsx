'use client';

/**
 * UNI-174: Workflow Templates List Page
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Plus, Search, Zap, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string | null;
  type: string;
  triggerEvent: string;
  isActive: boolean;
  createdAt: string;
}

export default function WorkflowTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('isActive', statusFilter);

      const response = await fetch(`/api/workflows/templates?${params}`);
      const result = await response.json();

      if (result.success) {
        setTemplates(result.data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, typeFilter, statusFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleToggleStatus = async (templateId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/workflows/templates/${templateId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to toggle template status:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'notification':
        return <Zap className="w-5 h-5" />;
      case 'automation':
        return <Play className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'approval':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'notification':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'automation':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
              Workflow Templates
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Automate your business processes with intelligent workflows
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/workflows/templates/new')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Template
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
              placeholder="Search templates..."
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
            <option value="approval">Approval</option>
            <option value="notification">Notification</option>
            <option value="automation">Automation</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-12 text-center">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No workflow templates found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first workflow template to automate your processes
          </p>
          <button
            onClick={() => router.push('/dashboard/workflows/templates/new')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/workflows/templates/${template.id}`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(
                      template.type
                    )}`}
                  >
                    {getTypeIcon(template.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {template.type}
                    </p>
                  </div>
                </div>

                {/* Status Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(template.id, template.isActive);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    template.isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}
                >
                  {template.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Description */}
              {template.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {template.description}
                </p>
              )}

              {/* Trigger Event */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Zap className="w-4 h-4" />
                <span>Trigger: {template.triggerEvent}</span>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/workflows/templates/${template.id}`);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

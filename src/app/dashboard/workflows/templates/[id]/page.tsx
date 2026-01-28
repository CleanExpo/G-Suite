'use client';

/**
 * UNI-174: Workflow Template Detail Page
 */

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Copy,
  Play,
  Settings,
  Trash2,
  Zap,
} from 'lucide-react';

interface WorkflowStep {
  stepId: string;
  type: string;
  name: string;
  assigneeRole?: string;
  assigneeId?: string;
  delayMinutes?: number;
  nextStepId?: string;
  onApprove?: string;
  onReject?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string | null;
  type: string;
  triggerEvent: string;
  steps: WorkflowStep[];
  slaHours: number | null;
  escalationRules: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WorkflowTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloneName, setCloneName] = useState('');
  const [showCloneDialog, setShowCloneDialog] = useState(false);

  const fetchTemplate = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workflows/templates/${resolvedParams.id}`);
      const result = await response.json();

      if (result.success) {
        setTemplate(result.data);
        setCloneName(`${result.data.name} (Copy)`);
      }
    } catch (error) {
      console.error('Failed to fetch template:', error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const handleToggleStatus = async () => {
    if (!template) return;

    try {
      const response = await fetch(`/api/workflows/templates/${template.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !template.isActive }),
      });

      if (response.ok) {
        fetchTemplate();
      }
    } catch (error) {
      console.error('Failed to toggle template status:', error);
    }
  };

  const handleClone = async () => {
    if (!template || !cloneName.trim()) return;

    try {
      const response = await fetch(`/api/workflows/templates/${template.id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: cloneName }),
      });

      const result = await response.json();

      if (result.success) {
        setShowCloneDialog(false);
        router.push(`/dashboard/workflows/templates/${result.data.id}`);
      }
    } catch (error) {
      console.error('Failed to clone template:', error);
    }
  };

  const handleDelete = async () => {
    if (!template) return;
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/workflows/templates/${template.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/workflows/templates');
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'notification':
        return <Zap className="w-5 h-5" />;
      case 'automation':
        return <Play className="w-5 h-5" />;
      case 'delay':
        return <Clock className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'approval':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'notification':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'automation':
        return 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'delay':
        return 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Template not found</p>
          <button
            onClick={() => router.push('/dashboard/workflows/templates')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Templates
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
          onClick={() => router.push('/dashboard/workflows/templates')}
          className="text-blue-600 hover:text-blue-700 font-semibold mb-4"
        >
          ← Back to Templates
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
              {template.name}
            </h1>
            {template.description && (
              <p className="text-gray-600 dark:text-gray-400">{template.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCloneDialog(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Clone
            </button>
            <button
              onClick={handleToggleStatus}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                template.isActive
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
              }`}
            >
              {template.isActive ? 'Active' : 'Inactive'}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workflow Steps */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
              Workflow Steps
            </h2>

            <div className="space-y-4">
              {template.steps.map((step, index) => (
                <div
                  key={step.stepId}
                  className="p-4 border border-gray-200 dark:border-white/10 rounded-xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                            {step.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${getStepTypeColor(
                                step.type
                              )}`}
                            >
                              {getStepTypeIcon(step.type)}
                              {step.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Step Details */}
                      <div className="mt-3 space-y-2 text-sm">
                        {step.assigneeRole && (
                          <div className="text-gray-600 dark:text-gray-400">
                            <strong>Assigned to:</strong> {step.assigneeRole}
                          </div>
                        )}
                        {step.delayMinutes && (
                          <div className="text-gray-600 dark:text-gray-400">
                            <strong>Delay:</strong> {step.delayMinutes} minutes
                          </div>
                        )}
                        {step.type === 'approval' && (
                          <div className="text-gray-600 dark:text-gray-400">
                            <strong>On Approve:</strong> {step.onApprove || 'Next step'}
                            <br />
                            <strong>On Reject:</strong> {step.onReject || 'End workflow'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Template Info */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <h3 className="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-4">
              Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                  {template.type}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Trigger Event</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {template.triggerEvent}
                </p>
              </div>
              {template.slaHours && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">SLA</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {template.slaHours} hours
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p
                  className={`text-sm font-semibold ${
                    template.isActive
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {template.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {new Date(template.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {new Date(template.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clone Dialog */}
      {showCloneDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#161b22] rounded-[2.5rem] p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-4">
              Clone Template
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Enter a name for the cloned template
            </p>
            <input
              type="text"
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white mb-6"
              placeholder="Template name"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCloneDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClone}
                disabled={!cloneName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Clone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

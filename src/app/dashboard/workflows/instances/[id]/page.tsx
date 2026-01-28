'use client';

/**
 * UNI-174: Workflow Instance Detail Page with Approval Actions
 */

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  MessageSquare,
  Play,
  XCircle,
} from 'lucide-react';

interface WorkflowStep {
  stepId: string;
  type: string;
  name: string;
  status?: string;
  approvedBy?: string;
  rejectedBy?: string;
  approvedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
}

interface WorkflowInstance {
  id: string;
  templateId: string;
  template?: {
    name: string;
    description: string | null;
    type: string;
    steps: WorkflowStep[];
  };
  referenceType: string;
  referenceId: string;
  status: string;
  currentStepId: string | null;
  stepsStatus: Record<string, any>;
  isOverdue: boolean;
  slaDeadline: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
}

export default function WorkflowInstanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvalComment, setApprovalComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInstance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workflows/instances/${resolvedParams.id}`);
      const result = await response.json();

      if (result.success) {
        setInstance(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch instance:', error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchInstance();
  }, [fetchInstance]);

  const handleApproval = async (stepId: string, approved: boolean) => {
    if (!instance) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/workflows/instances/${instance.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId,
          approved,
          comment: approvalComment,
        }),
      });

      if (response.ok) {
        setApprovalComment('');
        fetchInstance();
      }
    } catch (error) {
      console.error('Failed to process approval:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStepStatus = (step: WorkflowStep): WorkflowStep => {
    if (!instance?.stepsStatus) return step;
    const status = instance.stepsStatus[step.stepId];
    return { ...step, ...status };
  };

  const getStepStatusBadge = (step: WorkflowStep) => {
    const stepWithStatus = getStepStatus(step);

    if (stepWithStatus.status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 className="w-3 h-3" />
          Approved
        </span>
      );
    }

    if (stepWithStatus.status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    }

    if (stepWithStatus.status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    }

    if (stepWithStatus.status === 'in_progress') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
          <Play className="w-3 h-3" />
          In Progress
        </span>
      );
    }

    if (stepWithStatus.status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <XCircle className="w-3 h-3" />
          Failed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const isCurrentStep = (stepId: string) => {
    return instance?.currentStepId === stepId;
  };

  const needsApproval = (step: WorkflowStep) => {
    if (step.type !== 'approval') return false;
    const stepWithStatus = getStepStatus(step);
    return (
      isCurrentStep(step.stepId) &&
      stepWithStatus.status === 'in_progress' &&
      instance?.status === 'in_progress'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Instance Not Found
          </h2>
          <button
            onClick={() => router.push('/dashboard/workflows/instances')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Instances
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
          onClick={() => router.push('/dashboard/workflows/instances')}
          className="text-blue-600 hover:text-blue-700 font-semibold mb-4"
        >
          ← Back to Instances
        </button>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
          {instance.template?.name || 'Workflow Instance'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {instance.referenceType}: {instance.referenceId}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instance Info */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-4">
              Instance Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {instance.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Started</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(instance.createdAt).toLocaleString()}
                </p>
              </div>
              {instance.slaDeadline && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">SLA Deadline</p>
                  <p
                    className={`text-lg font-semibold ${
                      instance.isOverdue
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {new Date(instance.slaDeadline).toLocaleString()}
                  </p>
                </div>
              )}
              {instance.completedAt && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(instance.completedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {instance.isOverdue && instance.status === 'in_progress' && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900 dark:text-red-400">
                    SLA Deadline Exceeded
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400/80">
                    This workflow instance has exceeded its SLA deadline and requires immediate
                    attention.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Workflow Steps */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
              Workflow Steps
            </h2>

            <div className="space-y-4">
              {instance.template?.steps.map((step, index) => {
                const stepWithStatus = getStepStatus(step);
                const isCurrent = isCurrentStep(step.stepId);
                const requiresApproval = needsApproval(step);

                return (
                  <div key={step.stepId}>
                    <div
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                          : 'border-gray-200 dark:border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isCurrent
                                ? 'bg-blue-600 text-white'
                                : stepWithStatus.status === 'completed' ||
                                  stepWithStatus.status === 'approved'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              {step.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {step.type}
                            </p>
                          </div>
                        </div>
                        {getStepStatusBadge(step)}
                      </div>

                      {/* Approval Info */}
                      {stepWithStatus.approvedBy && stepWithStatus.approvedAt && (
                        <div className="mt-3 text-sm text-green-700 dark:text-green-400">
                          Approved by {stepWithStatus.approvedBy} on{' '}
                          {new Date(stepWithStatus.approvedAt).toLocaleString()}
                        </div>
                      )}

                      {stepWithStatus.rejectedBy && stepWithStatus.rejectedAt && (
                        <div className="mt-3 text-sm text-red-700 dark:text-red-400">
                          Rejected by {stepWithStatus.rejectedBy} on{' '}
                          {new Date(stepWithStatus.rejectedAt).toLocaleString()}
                        </div>
                      )}

                      {stepWithStatus.failureReason && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg text-sm text-red-700 dark:text-red-400">
                          <strong>Error:</strong> {stepWithStatus.failureReason}
                        </div>
                      )}

                      {/* Approval Actions */}
                      {requiresApproval && (
                        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-900/20">
                          <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-400 mb-3">
                            This step requires your approval
                          </p>

                          <textarea
                            placeholder="Add a comment (optional)..."
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white mb-3"
                            rows={2}
                          />

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApproval(step.stepId, true)}
                              disabled={submitting}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproval(step.stepId, false)}
                              disabled={submitting}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Arrow between steps */}
                    {index < (instance.template?.steps.length || 0) - 1 && (
                      <div className="flex justify-center py-2">
                        <ChevronRight className="w-6 h-6 text-gray-400 rotate-90" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Template Info */}
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
            <h3 className="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-4">
              Template
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {instance.template?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                  {instance.template?.type}
                </p>
              </div>
              {instance.template?.description && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {instance.template.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          {instance.metadata && Object.keys(instance.metadata).length > 0 && (
            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
              <h3 className="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-4">
                Metadata
              </h3>
              <div className="space-y-2">
                {Object.entries(instance.metadata).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{key}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * UNI-174: Create New Workflow Template Page
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';

interface WorkflowStep {
  stepId: string;
  type: string;
  name: string;
  assigneeRole?: string;
  delayMinutes?: number;
}

export default function NewWorkflowTemplatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('approval');
  const [triggerEvent, setTriggerEvent] = useState('');
  const [slaHours, setSlaHours] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      stepId: '1',
      type: 'approval',
      name: 'Initial Approval',
    },
  ]);

  const addStep = () => {
    const newStep: WorkflowStep = {
      stepId: String(steps.length + 1),
      type: 'approval',
      name: `Step ${steps.length + 1}`,
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof WorkflowStep, value: any) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setSteps(updatedSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !triggerEvent || steps.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/workflows/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          type,
          triggerEvent,
          steps,
          slaHours: slaHours ? parseInt(slaHours) : null,
          isActive: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/dashboard/workflows/templates/${result.data.id}`);
      } else {
        setError(result.error?.message || 'Failed to create template');
      }
    } catch (err) {
      setError('An error occurred while creating the template');
    } finally {
      setSubmitting(false);
    }
  };

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
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
          Create Workflow Template
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Design an automated workflow for your business processes
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
              <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
                Basic Information
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Invoice Approval Workflow"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe the purpose of this workflow..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Type *
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="approval">Approval</option>
                      <option value="notification">Notification</option>
                      <option value="automation">Automation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      SLA (Hours)
                    </label>
                    <input
                      type="number"
                      value={slaHours}
                      onChange={(e) => setSlaHours(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="24"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Trigger Event *
                  </label>
                  <input
                    type="text"
                    value={triggerEvent}
                    onChange={(e) => setTriggerEvent(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., invoice.created, deal.won"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    The event that triggers this workflow
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow Steps */}
            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                  Workflow Steps
                </h2>
                <button
                  type="button"
                  onClick={addStep}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </button>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.stepId}
                    className="p-4 border border-gray-200 dark:border-white/10 rounded-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <input
                            type="text"
                            value={step.name}
                            onChange={(e) => updateStep(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white text-sm"
                            placeholder="Step name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={step.type}
                            onChange={(e) => updateStep(index, 'type', e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white text-sm"
                          >
                            <option value="approval">Approval</option>
                            <option value="notification">Notification</option>
                            <option value="automation">Automation</option>
                            <option value="delay">Delay</option>
                            <option value="condition">Condition</option>
                          </select>
                          <input
                            type="text"
                            value={step.assigneeRole || ''}
                            onChange={(e) => updateStep(index, 'assigneeRole', e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white text-sm"
                            placeholder="Assignee role"
                          />
                        </div>
                      </div>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Actions */}
          <div>
            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 sticky top-8">
              <h3 className="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Template'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/workflows/templates')}
                  className="w-full px-6 py-3 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Tip:</strong> Start with a simple workflow and add more steps as needed.
                  You can always edit the template later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

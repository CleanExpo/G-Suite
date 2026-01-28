'use client';

/**
 * UNI-175: Create New Dashboard Page
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Save } from 'lucide-react';

export default function NewDashboardPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('custom');
  const [isPublic, setIsPublic] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name) {
      setError('Dashboard name is required');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          type,
          layout: {
            columns: 12,
            widgets: [],
          },
          isPublic,
          isDefault,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/dashboard/dashboards/${result.data.id}`);
      } else {
        setError(result.error?.message || 'Failed to create dashboard');
      }
    } catch (err) {
      setError('An error occurred while creating the dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/dashboards')}
            className="text-purple-600 hover:text-purple-700 font-semibold mb-4"
          >
            ← Back to Dashboards
          </button>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
            Create Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Design a custom dashboard with KPI widgets
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Dashboard Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Executive Dashboard"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Describe what this dashboard shows..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="custom">Custom</option>
                  <option value="template">Template</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Make this dashboard public (visible to all users)
                  </span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Set as default dashboard
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10 flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Creating...' : 'Create Dashboard'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/dashboards')}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

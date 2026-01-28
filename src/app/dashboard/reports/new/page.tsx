'use client';

/**
 * UNI-175: Create New Report Page (Report Builder)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Plus, Trash2, Save } from 'lucide-react';

interface ReportFilter {
  field: string;
  operator: string;
  value: string;
}

interface ReportAggregation {
  field: string;
  function: string;
  alias: string;
}

export default function NewReportPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('custom');
  const [dataSource, setDataSource] = useState('');
  const [chartType, setChartType] = useState('table');
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [aggregations, setAggregations] = useState<ReportAggregation[]>([]);

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: 'eq', value: '' }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: keyof ReportFilter, value: string) => {
    const updated = [...filters];
    updated[index] = { ...updated[index], [field]: value };
    setFilters(updated);
  };

  const addAggregation = () => {
    setAggregations([...aggregations, { field: '', function: 'sum', alias: '' }]);
  };

  const removeAggregation = (index: number) => {
    setAggregations(aggregations.filter((_, i) => i !== index));
  };

  const updateAggregation = (
    index: number,
    field: keyof ReportAggregation,
    value: string
  ) => {
    const updated = [...aggregations];
    updated[index] = { ...updated[index], [field]: value };
    setAggregations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !dataSource) {
      setError('Name and data source are required');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          type,
          query: {
            dataSource,
            filters: filters.filter((f) => f.field && f.value),
            groupBy: groupBy.filter((g) => g),
            aggregations: aggregations.filter((a) => a.field && a.alias),
          },
          chartType: chartType !== 'table' ? chartType : null,
          chartConfig: chartType !== 'table' ? {} : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/dashboard/reports/${result.data.id}`);
      } else {
        setError(result.error?.message || 'Failed to create report');
      }
    } catch (err) {
      setError('An error occurred while creating the report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/reports')}
          className="text-blue-600 hover:text-blue-700 font-semibold mb-4"
        >
          ← Back to Reports
        </button>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
          Create Report
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Build a custom report with filters and visualizations
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
                    Report Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Monthly Sales Report"
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
                    placeholder="Describe what this report shows..."
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
                      <option value="sales">Sales</option>
                      <option value="inventory">Inventory</option>
                      <option value="financial">Financial</option>
                      <option value="crm">CRM</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Chart Type
                    </label>
                    <select
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="table">Table</option>
                      <option value="line">Line Chart</option>
                      <option value="bar">Bar Chart</option>
                      <option value="pie">Pie Chart</option>
                      <option value="area">Area Chart</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Query Builder */}
            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6">
              <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
                Data Query
              </h2>

              <div className="space-y-6">
                {/* Data Source */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Data Source *
                  </label>
                  <select
                    value={dataSource}
                    onChange={(e) => setDataSource(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select data source...</option>
                    <option value="invoices">Invoices</option>
                    <option value="products">Products</option>
                    <option value="contacts">Contacts</option>
                    <option value="deals">Deals</option>
                    <option value="inventory_transactions">Inventory Transactions</option>
                    <option value="payments">Payments</option>
                  </select>
                </div>

                {/* Filters */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Filters
                    </label>
                    <button
                      type="button"
                      onClick={addFilter}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Filter
                    </button>
                  </div>

                  <div className="space-y-3">
                    {filters.map((filter, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={filter.field}
                          onChange={(e) => updateFilter(index, 'field', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white text-sm"
                          placeholder="Field name"
                        />
                        <select
                          value={filter.operator}
                          onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white text-sm"
                        >
                          <option value="eq">Equals</option>
                          <option value="neq">Not Equals</option>
                          <option value="gt">Greater Than</option>
                          <option value="lt">Less Than</option>
                          <option value="contains">Contains</option>
                        </select>
                        <input
                          type="text"
                          value={filter.value}
                          onChange={(e) => updateFilter(index, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white text-sm"
                          placeholder="Value"
                        />
                        <button
                          type="button"
                          onClick={() => removeFilter(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {filters.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No filters added. Click "Add Filter" to create one.
                      </p>
                    )}
                  </div>
                </div>

                {/* Aggregations */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Aggregations
                    </label>
                    <button
                      type="button"
                      onClick={addAggregation}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Aggregation
                    </button>
                  </div>

                  <div className="space-y-3">
                    {aggregations.map((agg, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <select
                          value={agg.function}
                          onChange={(e) => updateAggregation(index, 'function', e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white text-sm"
                        >
                          <option value="sum">Sum</option>
                          <option value="avg">Average</option>
                          <option value="count">Count</option>
                          <option value="min">Minimum</option>
                          <option value="max">Maximum</option>
                        </select>
                        <input
                          type="text"
                          value={agg.field}
                          onChange={(e) => updateAggregation(index, 'field', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white text-sm"
                          placeholder="Field name"
                        />
                        <input
                          type="text"
                          value={agg.alias}
                          onChange={(e) => updateAggregation(index, 'alias', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white text-sm"
                          placeholder="Display name"
                        />
                        <button
                          type="button"
                          onClick={() => removeAggregation(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {aggregations.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No aggregations added. Click "Add Aggregation" to create one.
                      </p>
                    )}
                  </div>
                </div>
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
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Creating...' : 'Create Report'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/reports')}
                  className="w-full px-6 py-3 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Tip:</strong> Start with a simple query and add filters/aggregations as
                  needed. You can always edit the report later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

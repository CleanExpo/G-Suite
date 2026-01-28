/**
 * UNI-171: Deals Pipeline Page (Kanban View)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Deal {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  company?: {
    id: string;
    name: string;
  };
  contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
}

interface PipelineData {
  pipeline: Record<string, Deal[]>;
  summary: {
    totalDeals: number;
    totalValue: number;
    avgDealSize: number;
  };
}

const STAGES = [
  { key: 'lead', label: 'Lead', color: 'gray' },
  { key: 'qualified', label: 'Qualified', color: 'blue' },
  { key: 'proposal', label: 'Proposal', color: 'yellow' },
  { key: 'negotiation', label: 'Negotiation', color: 'orange' },
];

export default function DealsPage() {
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPipeline = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crm/deals/pipeline');
      const data = await res.json();

      if (data.success) {
        setPipelineData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch pipeline:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
              Deals Pipeline
            </h1>
            {pipelineData && (
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {pipelineData.summary.totalDeals} deals • {formatCurrency(pipelineData.summary.totalValue)} total value
              </p>
            )}
          </div>
          <Link
            href="/dashboard/crm/deals/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="font-bold text-sm">New Deal</span>
          </Link>
        </div>

        {/* Summary Stats */}
        {pipelineData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Total Pipeline
                </span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {formatCurrency(pipelineData.summary.totalValue)}
              </p>
            </div>
            <div className="bg-white dark:bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Avg Deal Size
                </span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {formatCurrency(pipelineData.summary.avgDealSize)}
              </p>
            </div>
            <div className="bg-white dark:bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Total Deals
                </span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {pipelineData.summary.totalDeals}
              </p>
            </div>
          </div>
        )}

        {/* Pipeline Kanban */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading pipeline...</div>
        ) : !pipelineData ? (
          <div className="text-center py-12 text-gray-400">Failed to load pipeline</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STAGES.map((stage) => {
              const deals = pipelineData.pipeline[stage.key] || [];
              const stageValue = deals.reduce((sum, deal) => sum + deal.value, 0);

              return (
                <div key={stage.key} className="flex flex-col">
                  {/* Stage Header */}
                  <div className="bg-white dark:bg-[#161b22] p-4 rounded-t-[2.5rem] border border-b-0 border-gray-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-black uppercase text-sm text-gray-900 dark:text-white">
                        {stage.label}
                      </h3>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {deals.length}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      {formatCurrency(stageValue)}
                    </p>
                  </div>

                  {/* Stage Cards */}
                  <div className="bg-gray-50 dark:bg-[#0d1117] p-4 rounded-b-[2.5rem] border border-t-0 border-gray-200 dark:border-white/10 flex-1 space-y-3 min-h-[400px]">
                    {deals.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm mt-8">No deals</p>
                    ) : (
                      deals.map((deal) => (
                        <Link
                          key={deal.id}
                          href={`/dashboard/crm/deals/${deal.id}`}
                          className="block bg-white dark:bg-[#161b22] p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:shadow-md transition-shadow"
                        >
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                            {deal.name}
                          </h4>
                          <p className="text-lg font-black text-blue-600 dark:text-blue-400 mb-2">
                            {formatCurrency(deal.value)}
                          </p>
                          {deal.company && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {deal.company.name}
                            </p>
                          )}
                          {deal.contacts.length > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {deal.contacts[0].firstName} {deal.contacts[0].lastName}
                              {deal.contacts.length > 1 && ` +${deal.contacts.length - 1}`}
                            </p>
                          )}
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">Probability</span>
                              <span className="font-bold text-gray-900 dark:text-white">
                                {deal.probability}%
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

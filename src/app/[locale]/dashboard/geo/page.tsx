'use client';

import { useState } from 'react';

export default function GEODashboard() {
  const [business, setBusiness] = useState({
    name: 'G-Pilot Solutions',
    address: '123 AI Lane, San Francisco, CA 94103',
    phone: '+1 (555) 012-3456',
  });

  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const runAudit = async () => {
    setLoading(true);
    // Simulate API call to local-seo-analyzer
    setTimeout(() => {
      setAuditResult({
        score: 85,
        consistent: false,
        citations: [
          { source: 'Yelp', status: 'match', url: '#' },
          { source: 'YellowPages', status: 'mismatch', foundPhone: '+1 (555) 999-9999', url: '#' },
          { source: 'Facebook', status: 'match', url: '#' },
          { source: 'Bing Places', status: 'missing', url: '#' },
        ],
        recommendations: [
          'Update phone number on YellowPages',
          'Claim Bing Places listing',
          'Add LocalBusiness schema to homepage',
        ],
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">GEO Framework</h1>
        <p className="text-slate-400">Generative & Geographic Search Optimization</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Business Config */}
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-xl font-semibold text-blue-400">Business Identity</h2>
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase">Name</label>
            <input
              type="text"
              value={business.name}
              onChange={(e) => setBusiness({ ...business, name: e.target.value })}
              className="w-full bg-black/40 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase">Address</label>
            <textarea
              value={business.address}
              onChange={(e) => setBusiness({ ...business, address: e.target.value })}
              className="w-full bg-black/40 border border-slate-700 rounded px-3 py-2 text-sm text-white h-20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase">Phone</label>
            <input
              type="text"
              value={business.phone}
              onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
              className="w-full bg-black/40 border border-slate-700 rounded px-3 py-2 text-sm text-white"
            />
          </div>
          <button
            onClick={runAudit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 transition-all"
          >
            {loading ? 'Analyzing...' : 'Run GEO Audit'}
          </button>
        </div>

        {/* Audit Results */}
        <div className="lg:col-span-2 bg-slate-900/50 rounded-xl p-6 border border-slate-800 flex flex-col min-h-[500px]">
          <h2 className="text-xl font-semibold text-emerald-400 mb-6">NAP Consistency Audit</h2>

          {auditResult ? (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-white">{auditResult.score}</div>
                <div>
                  <div className="text-sm text-slate-400 uppercase tracking-widest font-mono">
                    Trust Score
                  </div>
                  <div
                    className={`text-xs ${auditResult.consistent ? 'text-emerald-500' : 'text-amber-500'}`}
                  >
                    {auditResult.consistent ? '✓ Fully Consistent' : '⚠ Action Required'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {auditResult.citations.map((c: any, i: number) => (
                  <div
                    key={i}
                    className="bg-black/30 p-4 rounded-lg border border-slate-800 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{c.source}</div>
                      <div className="text-xs text-slate-500">
                        {c.foundPhone || 'No mismatches'}
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                        c.status === 'match'
                          ? 'bg-emerald-900/50 text-emerald-400'
                          : c.status === 'mismatch'
                            ? 'bg-amber-900/50 text-amber-400'
                            : 'bg-red-900/50 text-red-400'
                      }`}
                    >
                      {c.status}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase">
                  Priority Recommendations
                </h3>
                <ul className="list-disc list-inside text-sm text-blue-200 space-y-1">
                  {auditResult.recommendations.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
              <div className="text-6xl mb-4">📍</div>
              <p>Ready to audit your local search presence</p>
            </div>
          )}
        </div>
      </div>

      {/* Ranking Heatmap Placeholder */}
      <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800 text-center">
        <h2 className="text-xl font-semibold text-purple-400 mb-4">Geographic Ranking Predictor</h2>
        <div className="aspect-[21/9] bg-black/40 rounded-xl flex items-center justify-center relative overflow-hidden group">
          {/* Simulated Heatmap Grid */}
          <div className="absolute inset-0 opacity-20 grid grid-cols-10 grid-rows-5 gap-1 p-4">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className={`rounded ${i % 7 === 0 ? 'bg-red-500' : i % 3 === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`}
              />
            ))}
          </div>
          <div className="relative z-10">
            <span className="text-slate-500 font-mono">
              Heatmap visualization requires Google Maps API credentials
            </span>
            <div className="mt-4 flex justify-center gap-8 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded bg-emerald-500" /> Top 3 Probable
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded bg-blue-500" /> Top 10 Probable
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded bg-red-500" /> Low Visibility
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

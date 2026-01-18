'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Shield, Sparkles, ChevronRight } from 'lucide-react';

export function MissionSimulator() {
  const [objective, setObjective] = useState('');
  const [status, setStatus] = useState('Idle');

  const simulate = () => {
    if (!objective) return;
    setStatus('Reasoning...');
    setTimeout(() => setStatus('Vectorizing...'), 1000);
    setTimeout(() => setStatus('Core Ignition Ready'), 2000);
  };

  return (
    <div className="p-12 rounded-[4rem] bg-gray-900 border border-white/10 relative overflow-hidden group shadow-2xl">
      <div className="relative z-10 space-y-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                Mission Simulator
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Orchestrator v4.2 Preview
              </p>
            </div>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-blue-900/50 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
            {status}
          </div>
        </div>

        <div className="space-y-6">
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Define your mission objective... (e.g., 'Expand market share in Finance')"
            className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-600/50 transition-all text-lg font-medium"
          />

          <button
            onClick={simulate}
            className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20"
          >
            Initialize Simulation <Zap className="w-4 h-4 fill-current" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
          {[
            { label: 'Logic Depth', val: '94.2%', icon: Sparkles },
            { label: 'Risk Score', val: 'Lo-Zero', icon: Shield },
            { label: 'ETA', val: '< 3m', icon: ChevronRight },
          ].map((s, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="flex justify-center">
                <s.icon className="w-3 h-3 text-gray-500" />
              </div>
              <div className="text-[8px] font-black uppercase tracking-widest text-gray-500">
                {s.label}
              </div>
              <div className="text-sm font-bold text-white tracking-tighter">{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Spatial Grid Backdrop */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  Zap,
  Search,
  Video,
  BookOpen,
  Layout,
  Users,
  BarChart3,
  Plus,
  Filter,
  ArrowUpRight,
  Star,
  MessageSquare,
  MoreHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PREBUILT_TEMPLATES } from '@/lib/templates/registry';
import { AgentTemplate } from '@/lib/templates/types';

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Agents', icon: Layout },
    { id: 'marketing', label: 'Marketing', icon: Zap },
    { id: 'social_media', label: 'Social', icon: Users },
    { id: 'creative', label: 'Creative', icon: Video },
    { id: 'research', label: 'Intelligence', icon: BookOpen },
    { id: 'analytics', label: 'Data', icon: BarChart3 },
  ];

  const filteredTemplates = PREBUILT_TEMPLATES.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white p-6 lg:p-12">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-blue-500/20">
                Collective Intelligence
              </span>
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter mb-4">
              AGENT{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                MARKETPLACE
              </span>
            </h1>
            <p className="text-gray-500 text-lg max-w-xl">
              Deploy pre-configured agentic workflows designed for market domination. Each template
              follows the v8.1-Refined standard.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents..."
                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm w-full lg:w-[320px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 group">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-12 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                                flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border
                                ${
                                  selectedCategory === cat.id
                                    ? 'bg-white text-black border-white'
                                    : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/10 hover:text-white'
                                }
                            `}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, idx) => (
              <TemplateCard key={template.id} template={template} index={idx} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, index }: { template: AgentTemplate; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white/[0.03] border border-white/5 rounded-[32px] p-6 backdrop-blur-3xl overflow-hidden hover:bg-white/[0.05] hover:border-white/20 transition-all"
    >
      {/* 3D Medallion Icon Stub */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-emerald-600/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-full h-full bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center p-4 backdrop-blur-xl group-hover:scale-110 transition-transform">
          {/* Dynamic Icon Component would go here based on template.icon */}
          {template.icon === 'Zap' && <Zap className="w-8 h-8 text-blue-400" />}
          {template.icon === 'Search' && <Search className="w-8 h-8 text-cyan-400" />}
          {template.icon === 'Video' && <Video className="w-8 h-8 text-emerald-400" />}
          {template.icon === 'BookOpen' && <BookOpen className="w-8 h-8 text-indigo-400" />}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
              {template.category.replace('_', ' ')}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-yellow-500">
              <Star className="w-3 h-3 fill-yellow-500" />
              <span className="font-bold">4.9</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
            {template.name}
          </h3>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed h-10">
          {template.description}
        </p>

        <div className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-gray-600" />
            <span className="text-[10px] text-gray-600 font-bold">128 Uses</span>
          </div>
          <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:bg-white text-black transition-all">
            Deploy <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <button className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all p-2 bg-white/5 rounded-lg hover:bg-white/10">
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </button>
    </motion.div>
  );
}

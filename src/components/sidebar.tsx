'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mic2,
  MapPin,
  FileText,
  Search,
  Settings,
  Shield,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'Command Center', href: '/dashboard', color: 'text-blue-500' },
  {
    icon: Zap,
    label: 'Campaign Architect',
    href: '/dashboard/campaigns',
    color: 'text-yellow-500',
    badge: 'Hot',
  },
  {
    icon: Mic2,
    label: 'Multimodal Live',
    href: '/dashboard/live',
    color: 'text-purple-500',
    badge: 'Beta',
  },
  { icon: MapPin, label: 'GEO Marketing', href: '/dashboard/geo', color: 'text-emerald-500' },
  {
    icon: FileText,
    label: 'Document Intel',
    href: '/dashboard/documents',
    color: 'text-amber-500',
  },
  {
    icon: Search,
    label: 'Deep Research',
    href: '/dashboard/research',
    color: 'text-indigo-500',
    badge: 'New',
  },
  {
    icon: LayoutDashboard,
    label: 'Ad-Hoc Marketplace',
    href: '/dashboard/marketplace',
    color: 'text-emerald-400',
    badge: 'Pro',
  },
  { icon: Search, label: 'SEO Analysis', href: '/dashboard/seo', color: 'text-cyan-500' },
  { icon: Activity, label: 'Fleet Status', href: '/dashboard/monitoring', color: 'text-rose-500' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-screen bg-[#0b0e14] border-r border-white/5 z-[60] flex flex-col transition-all duration-300 group"
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-between">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl italic tracking-tighter text-white">G-PILOT</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`
                                relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all group/item
                                ${isActive ? 'bg-blue-600/10 text-white border border-blue-600/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                            `}
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 ${isActive ? item.color : 'group-hover/item:text-gray-300'}`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between gap-2 overflow-hidden">
                    <span className="font-bold text-sm truncate">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-600/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-blue-600 rounded-full"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/5 space-y-4">
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all">
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span className="font-bold text-sm">Vault Settings</span>}
        </button>
        <div
          className={`p-4 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5 ${isCollapsed ? 'hidden' : 'block'}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Mission Status
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-500 mb-1">
            <span>All Systems Go</span>
            <span>99%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[99%]" />
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

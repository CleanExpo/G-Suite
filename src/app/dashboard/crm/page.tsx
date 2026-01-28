/**
 * UNI-171: CRM Overview Dashboard
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Building2, TrendingUp, CheckSquare } from 'lucide-react';
import Link from 'next/link';

interface CRMStats {
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  dealValue: number;
  pendingTasks: number;
}

export default function CRMPage() {
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [contactsRes, companiesRes, dealsRes, tasksRes] = await Promise.all([
        fetch('/api/crm/contacts?limit=1'),
        fetch('/api/crm/companies?limit=1'),
        fetch('/api/crm/deals?limit=1'),
        fetch('/api/crm/tasks/my-tasks?status=todo'),
      ]);

      const [contacts, companies, deals, tasks] = await Promise.all([
        contactsRes.json(),
        companiesRes.json(),
        dealsRes.json(),
        tasksRes.json(),
      ]);

      setStats({
        totalContacts: contacts.data?.pagination?.total || 0,
        totalCompanies: companies.data?.pagination?.total || 0,
        totalDeals: deals.data?.pagination?.total || 0,
        dealValue: deals.data?.items?.reduce((sum: number, d: any) => sum + d.value, 0) || 0,
        pendingTasks: tasks.data?.length || 0,
      });
    } catch (error) {
      console.error('Failed to fetch CRM stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1600px] mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-4">
          Customer Relationship Management
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
          Manage contacts, companies, deals, and activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={Users}
          label="Total Contacts"
          value={stats?.totalContacts || 0}
          href="/dashboard/crm/contacts"
        />
        <StatCard
          icon={Building2}
          label="Companies"
          value={stats?.totalCompanies || 0}
          href="/dashboard/crm/companies"
        />
        <StatCard
          icon={TrendingUp}
          label="Open Deals"
          value={`$${((stats?.dealValue || 0) / 100).toLocaleString()}`}
          href="/dashboard/crm/deals"
        />
        <StatCard
          icon={CheckSquare}
          label="Pending Tasks"
          value={stats?.pendingTasks || 0}
          href="/dashboard/crm/tasks"
        />
      </div>

      {/* Quick Actions */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          title="Contacts"
          description="Manage your contact database"
          href="/dashboard/crm/contacts"
        />
        <QuickActionCard
          title="Deals Pipeline"
          description="Track opportunities and forecasts"
          href="/dashboard/crm/deals"
        />
        <QuickActionCard
          title="Companies"
          description="Organize company relationships"
          href="/dashboard/crm/companies"
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, href }: any) {
  return (
    <Link
      href={href}
      className="bg-white dark:bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
            {label}
          </p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </Link>
  );
}

function QuickActionCard({ title, description, href }: any) {
  return (
    <Link
      href={href}
      className="bg-white dark:bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow"
    >
      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  );
}

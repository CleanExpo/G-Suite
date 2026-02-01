'use client';

/**
 * Email Marketing Dashboard
 *
 * Campaign management, template library, and email composition.
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { EmailCampaign, EmailTemplate, CampaignStats } from '@/lib/email/types';

export default function EmailDashboardPage() {
  const t = useTranslations('Dashboard');

  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'compose'>('campaigns');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [campaignsRes, templatesRes] = await Promise.all([
        fetch('/api/email/campaigns'),
        fetch('/api/email/templates'),
      ]);

      const campaignsData = await campaignsRes.json();
      const templatesData = await templatesRes.json();

      if (campaignsData.success) setCampaigns(campaignsData.data);
      if (templatesData.success) setTemplates(templatesData.data);
    } catch (error) {
      console.error('Failed to load email data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();
  const formatPercent = (num: number, total: number) =>
    total > 0 ? `${((num / total) * 100).toFixed(1)}%` : '0%';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Email Marketing</h1>
            <p className="text-slate-400">Campaign management and email automation</p>
          </div>
          <button
            onClick={() => setActiveTab('compose')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            + New Campaign
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['campaigns', 'templates', 'compose'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
                {campaigns.length === 0 && (
                  <div className="text-center text-slate-400 py-16">
                    No campaigns yet. Create your first campaign!
                  </div>
                )}
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
                {templates.length === 0 && (
                  <div className="text-center text-slate-400 py-16 col-span-full">
                    No templates yet. Create your first template!
                  </div>
                )}
              </div>
            )}

            {/* Compose Tab */}
            {activeTab === 'compose' && <ComposeForm templates={templates} onSuccess={loadData} />}
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function CampaignCard({ campaign }: { campaign: EmailCampaign }) {
  const statusColors: Record<string, string> = {
    draft: 'bg-slate-500',
    scheduled: 'bg-yellow-500',
    sending: 'bg-blue-500',
    sent: 'bg-green-500',
    paused: 'bg-orange-500',
    failed: 'bg-red-500',
  };

  const { stats } = campaign;
  const openRate = stats.delivered > 0 ? ((stats.opened / stats.delivered) * 100).toFixed(1) : '0';
  const clickRate = stats.opened > 0 ? ((stats.clicked / stats.opened) * 100).toFixed(1) : '0';

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{campaign.name}</h3>
          <p className="text-slate-400 text-sm mt-1">{campaign.subject}</p>
        </div>
        <span
          className={`${statusColors[campaign.status]} px-3 py-1 rounded-full text-xs font-medium text-white capitalize`}
        >
          {campaign.status}
        </span>
      </div>

      {campaign.status === 'sent' && (
        <div className="grid grid-cols-4 gap-4 mt-4">
          <StatBox label="Sent" value={stats.sent.toLocaleString()} />
          <StatBox label="Delivered" value={stats.delivered.toLocaleString()} />
          <StatBox label="Open Rate" value={`${openRate}%`} highlight />
          <StatBox label="Click Rate" value={`${clickRate}%`} highlight />
        </div>
      )}

      {campaign.status === 'scheduled' && campaign.scheduledAt && (
        <div className="mt-4 text-slate-400">
          Scheduled for: {new Date(campaign.scheduledAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${highlight ? 'text-blue-400' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
}

function TemplateCard({ template }: { template: EmailTemplate }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">{template.name}</h3>
        {template.category && (
          <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
            {template.category}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{template.subject}</p>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>{template.variables.length} variables</span>
      </div>
    </div>
  );
}

function ComposeForm({
  templates,
  onSuccess,
}: {
  templates: EmailTemplate[];
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [recipients, setRecipients] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const recipientList = recipients
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((email) => ({ email }));

      await fetch('/api/email/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subject,
          templateId: templateId || undefined,
          recipients: recipientList,
        }),
      });

      setName('');
      setSubject('');
      setTemplateId('');
      setRecipients('');
      onSuccess();
    } catch (error) {
      console.error('Failed to create campaign:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6"
    >
      <h2 className="text-xl font-bold text-white mb-6">Create Campaign</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Campaign Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="January Newsletter"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Subject Line</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Your weekly update from G-Pilot"
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Template</label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2"
          >
            <option value="">No template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Recipients (one email per line)
          </label>
          <textarea
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="user1@example.com&#10;user2@example.com"
            rows={5}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={sending || !name || !subject}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {sending ? 'Creating...' : 'Create Campaign'}
        </button>
      </div>
    </form>
  );
}

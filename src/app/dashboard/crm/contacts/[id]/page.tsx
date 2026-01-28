/**
 * UNI-171: Contact Detail Page
 */

'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Mail, Phone, Building2, MapPin, Calendar, Edit } from 'lucide-react';
import Link from 'next/link';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  title?: string;
  department?: string;
  status: string;
  leadScore: number;
  company?: {
    id: string;
    name: string;
  };
  deal?: {
    id: string;
    name: string;
  };
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
  interactions?: Array<{
    id: string;
    type: string;
    subject: string;
    createdAt: string;
  }>;
  crmTasks?: Array<{
    id: string;
    title: string;
    status: string;
    dueDate?: string;
  }>;
  createdAt: string;
}

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContact() {
      try {
        const res = await fetch(`/api/crm/contacts/${id}`);
        const data = await res.json();

        if (data.success) {
          setContact(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch contact:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchContact();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center py-12 text-gray-400">Loading contact...</div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center py-12 text-gray-400">Contact not found</div>
        </div>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/crm/contacts"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Contacts</span>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
                {contact.firstName} {contact.lastName}
              </h1>
              {contact.title && (
                <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
                  {contact.title}
                  {contact.company && ` at ${contact.company.name}`}
                </p>
              )}
            </div>
            <Link
              href={`/dashboard/crm/contacts/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              <span className="font-bold text-sm">Edit</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details */}
            <div className="bg-white dark:bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-200 dark:border-white/10">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                {contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-gray-900 dark:text-white"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <Link
                      href={`/dashboard/crm/companies/${contact.company.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {contact.company.name}
                    </Link>
                  </div>
                )}
                {(contact.addressLine1 || contact.city) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div className="text-gray-900 dark:text-white">
                      {contact.addressLine1}
                      {contact.city && `, ${contact.city}`}
                      {contact.state && `, ${contact.state}`}
                      {contact.country && `, ${contact.country}`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Interactions */}
            <div className="bg-white dark:bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-200 dark:border-white/10">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">
                Recent Activity
              </h2>
              {contact.interactions && contact.interactions.length > 0 ? (
                <div className="space-y-3">
                  {contact.interactions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-white/10 last:border-0"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {interaction.subject}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {interaction.type} • {formatDate(interaction.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No recent activity</p>
              )}
            </div>
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Status & Score */}
            <div className="bg-white dark:bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-200 dark:border-white/10">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">
                Status
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Status</p>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    contact.status === 'customer' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                    contact.status === 'prospect' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' :
                    contact.status === 'lead' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                    'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                  }`}>
                    {contact.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Lead Score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${contact.leadScore}%` }}
                      />
                    </div>
                    <span className="text-lg font-black text-gray-900 dark:text-white">
                      {contact.leadScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="bg-white dark:bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-200 dark:border-white/10">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">
                Open Tasks
              </h2>
              {contact.crmTasks && contact.crmTasks.length > 0 ? (
                <div className="space-y-2">
                  {contact.crmTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <p className="text-sm text-gray-900 dark:text-white flex-1">
                        {task.title}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No open tasks</p>
              )}
            </div>

            {/* Meta Info */}
            <div className="bg-white dark:bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-200 dark:border-white/10">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">
                Information
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Created</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatDate(contact.createdAt)}
                  </p>
                </div>
                {contact.department && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Department</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {contact.department}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

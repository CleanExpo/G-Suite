/**
 * UNI-171: Contacts List Page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Download, Upload, Filter } from 'lucide-react';
import Link from 'next/link';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  status: string;
  leadScore: number;
  company?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/crm/contacts?${params}`);
      const data = await res.json();

      if (data.success) {
        setContacts(data.data.items);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, page]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleExport = () => {
    window.location.href = '/api/crm/contacts/export';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
              Contacts
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {contacts.length > 0 && `${contacts.length} contacts`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="font-bold text-sm">Export</span>
            </button>
            <Link
              href="/dashboard/crm/contacts/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="font-bold text-sm">New Contact</span>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          >
            <option value="all">All Status</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="customer">Customer</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Contacts Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No contacts found.</p>
            <Link
              href="/dashboard/crm/contacts/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="font-bold text-sm">Add Your First Contact</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Lead Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                  {contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/dashboard/crm/contacts/${contact.id}`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            {contact.firstName} {contact.lastName}
                          </div>
                          {contact.title && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {contact.title}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {contact.company ? (
                          <div className="text-sm text-gray-900 dark:text-white">
                            {contact.company.name}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">—</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {contact.email && (
                            <div className="text-gray-900 dark:text-white">{contact.email}</div>
                          )}
                          {contact.phone && (
                            <div className="text-gray-500 dark:text-gray-400">{contact.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          contact.status === 'customer' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                          contact.status === 'prospect' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' :
                          contact.status === 'lead' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                          'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                        }`}>
                          {contact.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${contact.leadScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {contact.leadScore}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

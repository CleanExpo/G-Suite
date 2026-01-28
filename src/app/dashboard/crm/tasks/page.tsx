/**
 * UNI-171: CRM Tasks Page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);

      const res = await fetch(`/api/crm/tasks?${params}`);
      const data = await res.json();

      if (data.success) {
        setTasks(data.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0e14] p-6 md:p-12 lg:pt-32">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
              Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {tasks.length > 0 && `${tasks.length} tasks`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No tasks found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white dark:bg-[#161b22] p-6 rounded-[2.5rem] border border-gray-200 dark:border-white/10 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStatusIcon(task.status)}</div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        {task.dueDate && isOverdue(task.dueDate) && task.status !== 'completed' && (
                          <span className="px-2 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm">
                      {task.contact && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Contact:</span>
                          <Link
                            href={`/dashboard/crm/contacts/${task.contact.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {task.contact.firstName} {task.contact.lastName}
                          </Link>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Due: {formatDate(task.dueDate)}</span>
                        </div>
                      )}
                      <div className="ml-auto">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                          task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' :
                          'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                        }`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

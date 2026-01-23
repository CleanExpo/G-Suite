'use client';

/**
 * StatusCommandCentre - Main dashboard container
 * Elite Production Status Visualization System
 * Industrial luxury aesthetic with real-time agent monitoring
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { DEFAULTS, isActiveStatus, isErrorStatus, isSuccessStatus } from '../constants';
import { AgentActivityCard } from './AgentActivityCard';
import { MetricTile } from './MetricTile';
import { NotificationStream } from './NotificationStream';
import type { StatusCommandCentreProps, AgentRun, Notification, ConnectionStatus } from '../types';

const StatusCommandCentre = React.forwardRef<HTMLDivElement, StatusCommandCentreProps>(
  (
    {
      // TODO: taskId and agentName will be used for filtering when integrated with useAgentRuns hook
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      taskId,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      agentName,
      variant = 'full',
      maxAgents = DEFAULTS.maxAgents,
      showNotifications = true,
      className,
    },
    ref
  ) => {
    // State - setRuns/setConnectionStatus will be used with real Supabase integration
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [runs, setRuns] = React.useState<AgentRun[]>([]);
    const [loading, setLoading] = React.useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>('connected');
    const [expandedRunId, setExpandedRunId] = React.useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedRunId, setSelectedRunId] = React.useState<string | null>(null);

    // Derived state
    const activeRuns = React.useMemo(() => runs.filter((r) => isActiveStatus(r.status)), [runs]);

    const completedRuns = React.useMemo(
      () => runs.filter((r) => isSuccessStatus(r.status)),
      [runs]
    );

    const failedRuns = React.useMemo(() => runs.filter((r) => isErrorStatus(r.status)), [runs]);

    // Convert runs to notifications
    const notifications: Notification[] = React.useMemo(() => {
      return runs.slice(-DEFAULTS.maxNotifications).map((run) => ({
        id: run.id,
        timestamp: run.updated_at,
        type: isErrorStatus(run.status)
          ? 'error'
          : isSuccessStatus(run.status)
            ? 'complete'
            : run.status === 'escalated_to_human'
              ? 'escalation'
              : run.status.includes('verification')
                ? 'verification'
                : 'progress',
        agentName: run.agent_name,
        message: run.current_step || `Status: ${run.status}`,
        runId: run.id,
      }));
    }, [runs]);

    // Handlers
    const handleRunSelect = (runId: string) => {
      setSelectedRunId(runId);
    };

    const handleRunExpandToggle = (runId: string) => {
      setExpandedRunId((prev) => (prev === runId ? null : runId));
    };

    const handleNotificationClick = (runId: string) => {
      setSelectedRunId(runId);
      setExpandedRunId(runId);
    };

    // Mock data loading (replace with actual hook integration)
    React.useEffect(() => {
      // Simulate loading
      const timer = setTimeout(() => {
        setLoading(false);
        // In production, this would use useAgentRuns hook
      }, 500);
      return () => clearTimeout(timer);
    }, []);

    // Render loading skeleton
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            'bg-card overflow-hidden rounded-2xl border',
            variant === 'full' && 'min-h-[600px]',
            className
          )}
        >
          <LoadingSkeleton variant={variant} />
        </div>
      );
    }

    // Minimal variant
    if (variant === 'minimal') {
      return (
        <div ref={ref} className={cn('flex items-center gap-3', className)}>
          <ConnectionIndicator status={connectionStatus} />
          <span className="text-muted-foreground text-sm">
            {activeRuns.length} active · {completedRuns.length} completed
          </span>
        </div>
      );
    }

    // Compact variant
    if (variant === 'compact') {
      return (
        <div ref={ref} className={cn('bg-card rounded-xl border p-4', className)}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Agent Activity</h3>
            <ConnectionIndicator status={connectionStatus} />
          </div>

          {runs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {runs.slice(0, 3).map((run, index) => (
                <AgentActivityCard key={run.id} run={run} animationDelay={index * 50} />
              ))}
              {runs.length > 3 && (
                <p className="text-muted-foreground pt-2 text-center text-xs">
                  +{runs.length - 3} more agents
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    // Full variant
    return (
      <div
        ref={ref}
        className={cn(
          'bg-card overflow-hidden rounded-2xl border',
          'command-centre-surface noise-overlay',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Command Centre</h2>
            <ConnectionIndicator status={connectionStatus} />
          </div>

          {/* Refresh button */}
          <button
            onClick={() => setLoading(true)}
            className={cn(
              'hover:bg-muted rounded-lg p-2 transition-colors',
              'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-4 gap-4 border-b p-6">
          <MetricTile label="Total" value={runs.length} icon="Activity" variant="default" />
          <MetricTile label="Active" value={activeRuns.length} icon="Activity" variant="info" />
          <MetricTile
            label="Completed"
            value={completedRuns.length}
            icon="CheckCircle2"
            variant="success"
          />
          <MetricTile label="Failed" value={failedRuns.length} icon="XCircle" variant="error" />
        </div>

        {/* Main content area */}
        <div className="flex min-h-[400px]">
          {/* Agent cards grid */}
          <div className={cn('flex-1 overflow-y-auto p-6', showNotifications ? 'border-r' : '')}>
            {runs.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {runs.slice(0, maxAgents).map((run, index) => (
                  <AgentActivityCard
                    key={run.id}
                    run={run}
                    expanded={expandedRunId === run.id}
                    onSelect={handleRunSelect}
                    onToggleExpand={handleRunExpandToggle}
                    animationDelay={index * 50}
                  />
                ))}
              </div>
            )}

            {runs.length > maxAgents && (
              <p className="text-muted-foreground mt-4 text-center text-sm">
                Showing {maxAgents} of {runs.length} agents
              </p>
            )}
          </div>

          {/* Notification stream sidebar */}
          {showNotifications && (
            <div className="bg-muted/20 w-80 flex-shrink-0">
              <NotificationStream
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
                className="h-full"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

StatusCommandCentre.displayName = 'StatusCommandCentre';

// Connection status indicator
function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  return (
    <div className="flex items-center gap-1.5">
      {status === 'connected' ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span className="bg-success relative inline-flex h-2 w-2 rounded-full" />
          </span>
          <span className="text-success text-xs">Live</span>
        </>
      ) : status === 'reconnecting' ? (
        <>
          <RefreshCw size={12} className="text-warning animate-spin" />
          <span className="text-warning text-xs">Reconnecting</span>
        </>
      ) : (
        <>
          <WifiOff size={12} className="text-error" />
          <span className="text-error text-xs">Offline</span>
        </>
      )}
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
      <div className="bg-muted/50 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        <Wifi size={24} className="opacity-50" />
      </div>
      <h3 className="mb-1 font-medium">No Active Agents</h3>
      <p className="max-w-xs text-center text-sm">
        When agents start working, their activity will appear here in real-time.
      </p>
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton({ variant }: { variant: StatusCommandCentreProps['variant'] }) {
  if (variant === 'compact') {
    return (
      <div className="space-y-3 p-4">
        <div className="bg-muted h-4 w-24 animate-pulse rounded" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted h-24 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="bg-muted h-6 w-40 animate-pulse rounded" />
        <div className="bg-muted h-4 w-16 animate-pulse rounded" />
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-muted h-20 animate-pulse rounded-xl" />
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-muted h-44 animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export { StatusCommandCentre };

'use client';

/**
 * NotificationStream - Real-time event feed
 * Elite Command Centre component
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Play, TrendingUp, CheckCircle2, XCircle, UserCheck, Eye, Bell } from 'lucide-react';
import { getRelativeTimeAU } from '../utils/format-duration';
import { NOTIFICATION_CONFIG } from '../constants';
import type { NotificationStreamProps, Notification } from '../types';

// Icon mapping for notification types
const NOTIFICATION_ICONS: Record<Notification['type'], React.ElementType> = {
  start: Play,
  progress: TrendingUp,
  complete: CheckCircle2,
  error: XCircle,
  escalation: UserCheck,
  verification: Eye,
};

const NotificationStream = React.forwardRef<HTMLDivElement, NotificationStreamProps>(
  (
    {
      notifications,
      maxItems = 20,
      filter = 'all',
      autoScroll = true,
      onNotificationClick,
      className,
    },
    ref
  ) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Filter notifications
    const filteredNotifications = React.useMemo(() => {
      let filtered = notifications;

      if (filter === 'errors') {
        filtered = notifications.filter((n) => n.type === 'error');
      } else if (filter === 'warnings') {
        filtered = notifications.filter(
          (n) => n.type === 'escalation' || n.type === 'verification'
        );
      } else if (filter === 'info') {
        filtered = notifications.filter(
          (n) => n.type === 'start' || n.type === 'progress' || n.type === 'complete'
        );
      }

      return filtered.slice(-maxItems);
    }, [notifications, filter, maxItems]);

    // Auto-scroll to bottom on new notifications
    React.useEffect(() => {
      if (autoScroll && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, [filteredNotifications.length, autoScroll]);

    if (filteredNotifications.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'text-muted-foreground flex flex-col items-center justify-center py-8',
            className
          )}
        >
          <Bell size={24} className="mb-2 opacity-50" />
          <p className="text-sm">No notifications</p>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('flex h-full flex-col', className)}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-3 py-2">
          <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Activity Feed
          </h3>
          <span className="text-muted-foreground text-xs tabular-nums">
            {filteredNotifications.length} events
          </span>
        </div>

        {/* Scrollable notifications list */}
        <div
          ref={scrollContainerRef}
          className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent flex-1 overflow-y-auto"
        >
          <div className="divide-border/50 divide-y">
            {filteredNotifications.map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => onNotificationClick?.(notification.runId)}
                animationDelay={index * 30}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

NotificationStream.displayName = 'NotificationStream';

// Individual notification item
interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  animationDelay: number;
}

function NotificationItem({ notification, onClick, animationDelay }: NotificationItemProps) {
  const config = NOTIFICATION_CONFIG[notification.type];
  const Icon = NOTIFICATION_ICONS[notification.type];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-3 py-2.5 text-left',
        'hover:bg-muted/50 transition-colors',
        'animate-notification-enter',
        'focus:bg-muted/50 focus:outline-none'
      )}
      style={{
        animationDelay: `${animationDelay}ms`,
        borderLeftWidth: 2,
        borderLeftColor: config.colour,
      }}
    >
      <div className="flex items-start gap-2.5">
        {/* Icon */}
        <div
          className="mt-0.5 flex-shrink-0 rounded-md p-1"
          style={{ backgroundColor: `${config.colour}15` }}
        >
          <Icon size={12} style={{ color: config.colour }} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Agent name and type */}
          <div className="mb-0.5 flex items-center gap-1.5">
            <span className="truncate text-xs font-medium">{notification.agentName}</span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px]"
              style={{
                backgroundColor: `${config.colour}15`,
                color: config.colour,
              }}
            >
              {config.label}
            </span>
          </div>

          {/* Message */}
          <p className="text-muted-foreground line-clamp-2 text-xs">{notification.message}</p>

          {/* Timestamp */}
          <span className="text-muted-foreground/70 text-[10px]">
            {getRelativeTimeAU(notification.timestamp)}
          </span>
        </div>
      </div>
    </button>
  );
}

export { NotificationStream };

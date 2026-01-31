'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useOrientation } from '@/hooks/use-orientation';
import { ChevronRight } from 'lucide-react';

interface MobileCardProps {
  children: React.ReactNode;
  /** Card title */
  title?: string;
  /** Card subtitle/description */
  subtitle?: string;
  /** Icon component */
  icon?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Whether card is interactive */
  interactive?: boolean;
  /** Accent color */
  accent?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

const accentColors = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800',
    icon: 'bg-blue-600',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-100 dark:border-emerald-800',
    icon: 'bg-emerald-600',
    text: 'text-emerald-600',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-100 dark:border-amber-800',
    icon: 'bg-amber-600',
    text: 'text-amber-600',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-100 dark:border-red-800',
    icon: 'bg-red-600',
    text: 'text-red-600',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-100 dark:border-purple-800',
    icon: 'bg-purple-600',
    text: 'text-purple-600',
  },
};

const sizeClasses = {
  sm: {
    padding: 'p-3 md:p-4',
    icon: 'w-8 h-8 md:w-10 md:h-10',
    iconInner: 'w-4 h-4 md:w-5 md:h-5',
    title: 'text-sm md:text-base',
    subtitle: 'text-xs',
  },
  md: {
    padding: 'p-4 md:p-6',
    icon: 'w-10 h-10 md:w-12 md:h-12',
    iconInner: 'w-5 h-5 md:w-6 md:h-6',
    title: 'text-base md:text-lg',
    subtitle: 'text-xs md:text-sm',
  },
  lg: {
    padding: 'p-5 md:p-8',
    icon: 'w-12 h-12 md:w-14 md:h-14',
    iconInner: 'w-6 h-6 md:w-7 md:h-7',
    title: 'text-lg md:text-xl',
    subtitle: 'text-sm',
  },
};

/**
 * Mobile-optimized Card Component
 *
 * Responsive card with touch-friendly sizing and interactions.
 */
export function MobileCard({
  children,
  title,
  subtitle,
  icon,
  onClick,
  interactive = false,
  accent = 'blue',
  size = 'md',
  className,
}: MobileCardProps) {
  const { isMobile } = useOrientation();
  const colors = accentColors[accent];
  const sizes = sizeClasses[size];

  const isClickable = interactive || !!onClick;

  const content = (
    <>
      {(icon || title) && (
        <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
          {icon && (
            <div
              className={cn(
                sizes.icon,
                colors.icon,
                'rounded-xl md:rounded-2xl flex items-center justify-center text-white shrink-0'
              )}
            >
              <span className={sizes.iconInner}>{icon}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3
                className={cn(
                  sizes.title,
                  'font-bold text-gray-900 dark:text-white truncate'
                )}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className={cn(
                  sizes.subtitle,
                  'text-gray-500 dark:text-gray-400 mt-0.5'
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          {isClickable && (
            <ChevronRight
              className={cn(
                'w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0',
                isMobile && 'w-6 h-6'
              )}
            />
          )}
        </div>
      )}
      {children}
    </>
  );

  const cardClasses = cn(
    'bg-white dark:bg-[#161b22]',
    'rounded-2xl md:rounded-3xl',
    'border border-gray-100 dark:border-white/5',
    'shadow-sm',
    sizes.padding,
    isClickable && [
      'cursor-pointer',
      'transition-all duration-200',
      'hover:shadow-md hover:border-gray-200 dark:hover:border-white/10',
      'active:scale-[0.98]',
    ],
    // Touch-friendly tap target
    isMobile && isClickable && 'min-h-[64px]',
    className
  );

  if (isClickable) {
    return (
      <motion.button
        onClick={onClick}
        className={cn(cardClasses, 'w-full text-left')}
        whileTap={{ scale: 0.98 }}
      >
        {content}
      </motion.button>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}

/**
 * Stat Card Component
 *
 * Compact card for displaying metrics and statistics.
 */
export function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  className,
}: {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}) {
  const changeColors = {
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    neutral: 'text-gray-500',
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-[#161b22]',
        'rounded-xl md:rounded-2xl',
        'border border-gray-100 dark:border-white/5',
        'p-3 md:p-4',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
          {label}
        </span>
        {icon && (
          <span className="text-gray-400 dark:text-gray-500">{icon}</span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        {change && (
          <span className={cn('text-xs font-medium', changeColors[changeType])}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

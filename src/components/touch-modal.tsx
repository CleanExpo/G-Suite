'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOrientation } from '@/hooks/use-orientation';

interface TouchModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether modal can be dismissed by swiping down */
  swipeToDismiss?: boolean;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'full';
  /** Whether modal should be fullscreen on mobile */
  fullscreenOnMobile?: boolean;
  /** Additional className for content */
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  full: 'max-w-full mx-4',
};

/**
 * Touch-Optimized Modal Component
 *
 * Mobile-first modal with swipe-to-dismiss, safe area support,
 * and touch-friendly controls.
 */
export function TouchModal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  swipeToDismiss = true,
  size = 'md',
  fullscreenOnMobile = false,
  className,
}: TouchModalProps) {
  const { isMobile, isPortrait } = useOrientation();
  const controls = useAnimation();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
    return undefined;
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle swipe to dismiss
  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      setIsDragging(false);
      const threshold = 100;
      const velocity = 500;

      if (info.offset.y > threshold || info.velocity.y > velocity) {
        controls.start({ y: '100%', opacity: 0 }).then(onClose);
      } else {
        controls.start({ y: 0, opacity: 1 });
      }
    },
    [controls, onClose],
  );

  const shouldBeFullscreen = fullscreenOnMobile && isMobile && isPortrait;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            ref={constraintsRef}
            initial={{ y: '100%', opacity: 0 }}
            animate={controls}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ y: 0, opacity: 1 }}
            drag={swipeToDismiss && isMobile ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className={cn(
              'relative w-full',
              shouldBeFullscreen
                ? 'h-full'
                : [
                    sizeClasses[size],
                    'max-h-[90vh] sm:max-h-[85vh]',
                    'rounded-t-3xl sm:rounded-3xl',
                  ],
              'bg-white dark:bg-[#161b22]',
              'shadow-2xl',
              'overflow-hidden',
              'flex flex-col',
              // Safe area padding
              'safe-bottom',
            )}
          >
            {/* Drag Handle (mobile only) */}
            {swipeToDismiss && isMobile && (
              <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              </div>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <div
                className={cn(
                  'flex items-center justify-between',
                  'px-4 sm:px-6',
                  swipeToDismiss && isMobile ? 'pb-3' : 'py-4 sm:py-5',
                  'border-b border-gray-100 dark:border-white/5',
                )}
              >
                {title && (
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={cn(
                      'p-2 rounded-xl',
                      'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200',
                      'hover:bg-gray-100 dark:hover:bg-white/5',
                      'transition-colors',
                      // Touch-friendly size
                      'min-w-[44px] min-h-[44px] flex items-center justify-center',
                    )}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div
              className={cn(
                'flex-1 overflow-y-auto overscroll-contain',
                'px-4 sm:px-6 py-4 sm:py-6',
                // Prevent content from being draggable
                isDragging && 'pointer-events-none',
                className,
              )}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * Action Sheet Component
 *
 * Mobile-style bottom sheet for quick actions.
 */
export function ActionSheet({
  isOpen,
  onClose,
  title,
  actions,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    destructive?: boolean;
  }>;
}) {
  return (
    <TouchModal isOpen={isOpen} onClose={onClose} title={title} size="sm" showCloseButton={false}>
      <div className="space-y-1">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className={cn(
              'w-full flex items-center gap-3',
              'px-4 py-3 rounded-xl',
              'text-left font-medium',
              'transition-colors',
              'min-h-[52px]', // Touch-friendly height
              action.destructive
                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5',
            )}
          >
            {action.icon && (
              <span
                className={cn('w-5 h-5', action.destructive ? 'text-red-500' : 'text-gray-400')}
              >
                {action.icon}
              </span>
            )}
            {action.label}
          </button>
        ))}
      </div>

      {/* Cancel button */}
      <button
        onClick={onClose}
        className={cn(
          'w-full mt-4 px-4 py-3 rounded-xl',
          'bg-gray-100 dark:bg-white/5',
          'text-gray-600 dark:text-gray-300 font-medium',
          'transition-colors hover:bg-gray-200 dark:hover:bg-white/10',
          'min-h-[52px]',
        )}
      >
        Cancel
      </button>
    </TouchModal>
  );
}

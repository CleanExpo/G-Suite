'use client';

import { useOrientation } from '@/hooks/use-orientation';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  /** Columns for mobile portrait */
  mobilePortrait?: 1 | 2;
  /** Columns for mobile landscape */
  mobileLandscape?: 2 | 3;
  /** Columns for tablet */
  tablet?: 2 | 3 | 4;
  /** Columns for desktop */
  desktop?: 3 | 4 | 5 | 6;
  /** Gap between items */
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional className */
  className?: string;
}

const gapClasses = {
  sm: 'gap-2 md:gap-3',
  md: 'gap-3 md:gap-4 lg:gap-6',
  lg: 'gap-4 md:gap-6 lg:gap-8',
  xl: 'gap-6 md:gap-8 lg:gap-12',
};

/**
 * Responsive Grid Component
 *
 * Automatically adjusts columns based on screen size and orientation.
 * Optimized for mobile-first design with PWA support.
 */
export function ResponsiveGrid({
  children,
  mobilePortrait = 1,
  mobileLandscape = 2,
  tablet = 2,
  desktop = 3,
  gap = 'md',
  className,
}: ResponsiveGridProps) {
  const { isPortrait, isMobile, isTablet } = useOrientation();

  // Determine column count based on device and orientation
  let cols: number = desktop;
  if (isMobile) {
    cols = isPortrait ? mobilePortrait : mobileLandscape;
  } else if (isTablet) {
    cols = tablet;
  }

  return (
    <div
      className={cn(
        'grid w-full',
        gapClasses[gap],
        // Responsive grid columns
        'grid-cols-1',
        'sm:grid-cols-2',
        'md:grid-cols-2',
        'lg:grid-cols-3',
        'xl:grid-cols-4',
        // Orientation overrides via CSS custom property
        className,
      )}
      style={
        {
          '--grid-cols': cols,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

interface GridItemProps {
  children: React.ReactNode;
  /** Span multiple columns */
  span?: 1 | 2 | 3 | 'full';
  /** Priority for mobile (lower = shown first) */
  mobilePriority?: number;
  /** Hide on mobile */
  hideOnMobile?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Grid Item Component
 *
 * Individual item within ResponsiveGrid with span control.
 */
export function GridItem({
  children,
  span = 1,
  mobilePriority,
  hideOnMobile = false,
  className,
}: GridItemProps) {
  const { isMobile } = useOrientation();

  if (hideOnMobile && isMobile) {
    return null;
  }

  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-1 sm:col-span-2',
    3: 'col-span-1 sm:col-span-2 lg:col-span-3',
    full: 'col-span-full',
  };

  return (
    <div
      className={cn(spanClasses[span], className)}
      style={{
        order: mobilePriority !== undefined && isMobile ? mobilePriority : undefined,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Dashboard Card Grid
 *
 * Pre-configured grid for dashboard cards with optimal mobile layout.
 */
export function DashboardGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ResponsiveGrid
      mobilePortrait={1}
      mobileLandscape={2}
      tablet={2}
      desktop={3}
      gap="lg"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

/**
 * Stats Grid
 *
 * Compact grid for stat cards and metrics.
 */
export function StatsGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ResponsiveGrid
      mobilePortrait={2}
      mobileLandscape={3}
      tablet={4}
      desktop={4}
      gap="md"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

/**
 * Gallery Grid
 *
 * Dense grid for image galleries or thumbnails.
 */
export function GalleryGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ResponsiveGrid
      mobilePortrait={2}
      mobileLandscape={3}
      tablet={4}
      desktop={6}
      gap="sm"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';

export type Orientation = 'portrait' | 'landscape';

export interface OrientationState {
  /** Current device orientation */
  orientation: Orientation;
  /** Whether device is in portrait mode */
  isPortrait: boolean;
  /** Whether device is in landscape mode */
  isLandscape: boolean;
  /** Screen width in pixels */
  width: number;
  /** Screen height in pixels */
  height: number;
  /** Device pixel ratio */
  pixelRatio: number;
  /** Whether this is likely a mobile device */
  isMobile: boolean;
  /** Whether this is likely a tablet */
  isTablet: boolean;
}

/**
 * Hook for detecting and responding to device orientation changes
 *
 * Provides real-time orientation state for responsive layouts
 * that need to adapt beyond CSS media queries.
 */
export function useOrientation(): OrientationState {
  const [state, setState] = useState<OrientationState>(() => getOrientationState());

  const updateOrientation = useCallback(() => {
    setState(getOrientationState());
  }, []);

  useEffect(() => {
    // Listen for orientation changes
    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);

    // Also listen for screen orientation API if available
    if (screen.orientation) {
      screen.orientation.addEventListener('change', updateOrientation);
    }

    // Initial update
    updateOrientation();

    return () => {
      window.removeEventListener('orientationchange', updateOrientation);
      window.removeEventListener('resize', updateOrientation);
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', updateOrientation);
      }
    };
  }, [updateOrientation]);

  return state;
}

/**
 * Get current orientation state from window/screen
 */
function getOrientationState(): OrientationState {
  if (typeof window === 'undefined') {
    return {
      orientation: 'portrait',
      isPortrait: true,
      isLandscape: false,
      width: 0,
      height: 0,
      pixelRatio: 1,
      isMobile: false,
      isTablet: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = window.devicePixelRatio || 1;

  // Determine orientation
  let orientation: Orientation = 'portrait';

  if (screen.orientation) {
    // Use Screen Orientation API if available
    orientation = screen.orientation.type.includes('landscape') ? 'landscape' : 'portrait';
  } else if (typeof window.orientation === 'number') {
    // Fallback to deprecated window.orientation
    orientation = Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';
  } else {
    // Fallback to dimension comparison
    orientation = width > height ? 'landscape' : 'portrait';
  }

  // Detect device type based on screen size
  const screenWidth = Math.min(width, height); // Smallest dimension
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    width,
    height,
    pixelRatio,
    isMobile,
    isTablet,
  };
}

/**
 * Hook to lock orientation (if supported by device)
 */
export function useOrientationLock() {
  const lock = useCallback(async (orientation: OrientationLockType) => {
    if (screen.orientation?.lock) {
      try {
        await screen.orientation.lock(orientation);
        return true;
      } catch (error) {
        console.warn('Orientation lock not supported:', error);
        return false;
      }
    }
    return false;
  }, []);

  const unlock = useCallback(() => {
    if (screen.orientation?.unlock) {
      screen.orientation.unlock();
    }
  }, []);

  return { lock, unlock };
}

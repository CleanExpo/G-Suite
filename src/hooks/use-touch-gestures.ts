'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface TouchGestureHandlers {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPinch?: (scale: number) => void;
}

export interface TouchGestureOptions {
  /** Minimum distance for swipe detection (px) */
  swipeThreshold?: number;
  /** Maximum time for swipe detection (ms) */
  swipeTimeout?: number;
  /** Time threshold for long press (ms) */
  longPressDelay?: number;
  /** Time threshold for double tap (ms) */
  doubleTapDelay?: number;
  /** Whether to prevent default touch behavior */
  preventDefault?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  initialDistance: number;
}

/**
 * Hook for detecting touch gestures
 *
 * Provides handlers for swipes, taps, long press, and pinch gestures.
 * Optimized for mobile PWA interactions.
 */
export function useTouchGestures<T extends HTMLElement = HTMLElement>(
  handlers: TouchGestureHandlers,
  options: TouchGestureOptions = {}
) {
  const {
    swipeThreshold = 50,
    swipeTimeout = 300,
    longPressDelay = 500,
    doubleTapDelay = 300,
    preventDefault = false,
  } = options;

  const ref = useRef<T>(null);
  const touchState = useRef<TouchState | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTapTime = useRef<number>(0);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const getDistance = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      const touch = e.touches[0];
      touchState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        initialDistance: e.touches.length >= 2 ? getDistance(e.touches) : 0,
      };

      // Start long press timer
      if (handlers.onLongPress) {
        clearLongPressTimer();
        longPressTimer.current = setTimeout(() => {
          handlers.onLongPress?.();
          touchState.current = null; // Cancel other gestures
        }, longPressDelay);
      }
    },
    [handlers, longPressDelay, preventDefault, getDistance, clearLongPressTimer]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchState.current) return;

      // Cancel long press on significant movement
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchState.current.startX);
      const dy = Math.abs(touch.clientY - touchState.current.startY);

      if (dx > 10 || dy > 10) {
        clearLongPressTimer();
      }

      // Handle pinch gesture
      if (e.touches.length >= 2 && handlers.onPinch && touchState.current.initialDistance > 0) {
        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / touchState.current.initialDistance;
        handlers.onPinch(scale);
      }
    },
    [handlers, getDistance, clearLongPressTimer]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      clearLongPressTimer();

      if (!touchState.current) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchState.current.startX;
      const dy = touch.clientY - touchState.current.startY;
      const dt = Date.now() - touchState.current.startTime;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Check for swipe
      if (dt < swipeTimeout && (absDx > swipeThreshold || absDy > swipeThreshold)) {
        if (absDx > absDy) {
          // Horizontal swipe
          if (dx > 0) {
            handlers.onSwipeRight?.();
          } else {
            handlers.onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (dy > 0) {
            handlers.onSwipeDown?.();
          } else {
            handlers.onSwipeUp?.();
          }
        }
      } else if (absDx < 10 && absDy < 10) {
        // Tap detected
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTime.current;

        if (timeSinceLastTap < doubleTapDelay && handlers.onDoubleTap) {
          handlers.onDoubleTap();
          lastTapTime.current = 0;
        } else {
          lastTapTime.current = now;
          // Delay single tap to check for double tap
          setTimeout(() => {
            if (Date.now() - lastTapTime.current >= doubleTapDelay) {
              handlers.onTap?.();
            }
          }, doubleTapDelay);
        }
      }

      touchState.current = null;
    },
    [handlers, swipeThreshold, swipeTimeout, doubleTapDelay, clearLongPressTimer]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', clearLongPressTimer, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', clearLongPressTimer);
      clearLongPressTimer();
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, clearLongPressTimer, preventDefault]);

  return ref;
}

/**
 * Hook for swipe navigation between pages/sections
 */
export function useSwipeNavigation(
  onNext: () => void,
  onPrevious: () => void,
  options?: { horizontal?: boolean }
) {
  const horizontal = options?.horizontal ?? true;

  return useTouchGestures({
    ...(horizontal
      ? { onSwipeLeft: onNext, onSwipeRight: onPrevious }
      : { onSwipeUp: onNext, onSwipeDown: onPrevious }),
  });
}

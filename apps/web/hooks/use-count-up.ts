'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseCountUpOptions {
  /** Target value to count to */
  end: number;
  /** Starting value (default: 0) */
  start?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Decimal places to show */
  decimals?: number;
  /** Easing function */
  easing?: 'linear' | 'easeOut' | 'easeInOut';
  /** Prefix (e.g., "$") */
  prefix?: string;
  /** Suffix (e.g., "%", "+") */
  suffix?: string;
  /** Only start when triggered */
  startOnView?: boolean;
  /** Callback when count completes */
  onComplete?: () => void;
}

export interface UseCountUpReturn {
  /** Current formatted value */
  value: string;
  /** Current numeric value */
  numericValue: number;
  /** Whether animation is in progress */
  isAnimating: boolean;
  /** Ref to attach to element for intersection observer */
  ref: React.RefObject<HTMLElement | null>;
  /** Manually trigger the animation */
  start: () => void;
  /** Reset to initial value */
  reset: () => void;
}

const easingFunctions = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};

export function useCountUp({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  easing = 'easeOut',
  prefix = '',
  suffix = '',
  startOnView = true,
  onComplete,
}: UseCountUpOptions): UseCountUpReturn {
  const [numericValue, setNumericValue] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const easingFn = easingFunctions[easing];

  const animate = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);

      const currentValue = start + (end - start) * easedProgress;
      setNumericValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setNumericValue(end);
        onComplete?.();
      }
    },
    [start, end, duration, easingFn, onComplete]
  );

  const startAnimation = useCallback(() => {
    if (hasStarted) return;

    setHasStarted(true);
    setIsAnimating(true);
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);
  }, [hasStarted, animate]);

  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setNumericValue(start);
    setIsAnimating(false);
    setHasStarted(false);
    startTimeRef.current = null;
  }, [start]);

  // Intersection Observer for startOnView
  useEffect(() => {
    if (!startOnView || hasStarted) return;

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [startOnView, hasStarted, startAnimation]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Format the value
  const formattedValue = `${prefix}${numericValue.toFixed(decimals)}${suffix}`;

  return {
    value: formattedValue,
    numericValue,
    isAnimating,
    ref: elementRef,
    start: startAnimation,
    reset,
  };
}

export default useCountUp;

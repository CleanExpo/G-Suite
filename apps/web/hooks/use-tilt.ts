'use client';

import { useState, useRef, useCallback, useEffect, type RefObject, type MouseEvent } from 'react';

export interface UseTiltOptions {
  /** Maximum tilt angle in degrees */
  maxTilt?: number;
  /** Transition speed in milliseconds */
  speed?: number;
  /** Enable/disable the effect */
  enabled?: boolean;
  /** Scale on hover */
  scale?: number;
  /** Perspective value for 3D effect */
  perspective?: number;
  /** Easing function for transitions */
  easing?: string;
  /** Reset on mouse leave */
  resetOnLeave?: boolean;
}

export interface TiltValues {
  rotateX: number;
  rotateY: number;
  scale: number;
}

export interface UseTiltReturn {
  /** Ref to attach to the tiltable element */
  ref: RefObject<HTMLDivElement | null>;
  /** Current tilt values */
  tilt: TiltValues;
  /** CSS transform style object */
  style: React.CSSProperties;
  /** Mouse enter handler */
  onMouseEnter: () => void;
  /** Mouse move handler */
  onMouseMove: (e: MouseEvent<HTMLDivElement>) => void;
  /** Mouse leave handler */
  onMouseLeave: () => void;
}

export function useTilt({
  maxTilt = 10,
  speed = 400,
  enabled = true,
  scale = 1.02,
  perspective = 1000,
  easing = 'cubic-bezier(0.19, 1, 0.22, 1)',
  resetOnLeave = true,
}: UseTiltOptions = {}): UseTiltReturn {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [tilt, setTilt] = useState<TiltValues>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  });

  const calculateTilt = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!enabled || !elementRef.current) return;

      const element = elementRef.current;
      const rect = element.getBoundingClientRect();

      // Calculate mouse position relative to element center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      // Calculate tilt angles
      const rotateY = (mouseX / (rect.width / 2)) * maxTilt;
      const rotateX = -(mouseY / (rect.height / 2)) * maxTilt;

      setTilt({
        rotateX,
        rotateY,
        scale: isHovering ? scale : 1,
      });
    },
    [enabled, maxTilt, scale, isHovering]
  );

  const handleMouseEnter = useCallback(() => {
    if (!enabled) return;
    setIsHovering(true);
    setTilt((prev) => ({ ...prev, scale }));
  }, [enabled, scale]);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!enabled) return;
      calculateTilt(e);
    },
    [enabled, calculateTilt]
  );

  const handleMouseLeave = useCallback(() => {
    if (!enabled) return;
    setIsHovering(false);

    if (resetOnLeave) {
      setTilt({
        rotateX: 0,
        rotateY: 0,
        scale: 1,
      });
    }
  }, [enabled, resetOnLeave]);

  // Reset tilt when disabled
  useEffect(() => {
    if (!enabled) {
      setTilt({
        rotateX: 0,
        rotateY: 0,
        scale: 1,
      });
    }
  }, [enabled]);

  const style: React.CSSProperties = {
    transform: `perspective(${perspective}px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
    transition: isHovering ? `transform ${speed}ms ${easing}` : `transform ${speed}ms ${easing}`,
    transformStyle: 'preserve-3d',
    willChange: 'transform',
  };

  return {
    ref: elementRef,
    tilt,
    style,
    onMouseEnter: handleMouseEnter,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };
}

export default useTilt;

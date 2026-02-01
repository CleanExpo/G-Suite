'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { EASINGS, DURATIONS } from '@/lib/design-tokens';

export interface TextRevealProps {
  /** Text to animate */
  text: string;
  /** Animation mode */
  mode?: 'words' | 'characters' | 'lines';
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Stagger delay between elements (seconds) */
  stagger?: number;
  /** Include blur effect during reveal */
  blur?: boolean;
  /** Trigger animation only when in view */
  triggerOnView?: boolean;
  /** Additional class names for the container */
  className?: string;
  /** Additional class names for each animated element */
  elementClassName?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
}

export function TextReveal({
  text,
  mode = 'words',
  delay = 0,
  stagger = 0.05,
  blur = true,
  triggerOnView = true,
  className = '',
  elementClassName = '',
  onComplete,
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  const elements = useMemo(() => {
    switch (mode) {
      case 'characters':
        return text.split('');
      case 'lines':
        return text.split('\n');
      case 'words':
      default:
        return text.split(' ');
    }
  }, [text, mode]);

  const shouldAnimate = triggerOnView ? isInView : true;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const elementVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: blur ? 'blur(10px)' : 'blur(0px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: DURATIONS.slow,
        ease: EASINGS.outExpo,
      },
    },
  };

  return (
    <motion.div
      ref={containerRef}
      className={`inline-flex flex-wrap ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={shouldAnimate ? 'visible' : 'hidden'}
      onAnimationComplete={() => {
        if (shouldAnimate && onComplete) {
          onComplete();
        }
      }}
    >
      {elements.map((element, index) => (
        <motion.span
          key={`${element}-${index}`}
          className={`inline-block ${elementClassName}`}
          variants={elementVariants}
        >
          {element}
          {mode === 'words' && index < elements.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
          {mode === 'lines' && index < elements.length - 1 && <br />}
        </motion.span>
      ))}
    </motion.div>
  );
}

export default TextReveal;

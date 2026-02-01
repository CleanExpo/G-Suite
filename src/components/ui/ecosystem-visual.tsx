'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect, memo } from 'react';

const TOOLS = [
  { id: 'gemini', name: 'Gemini Pro', img: '/assets/google/gemini_logo_v2.png', color: '#4285F4' },
  { id: 'veo', name: 'VEO', img: '/assets/google/veo_logo_v2.png', color: '#34A853' },
  { id: 'imagen', name: 'Imagen', img: '/assets/google/imagen_logo_v2.png', color: '#FBBC05' },
  { id: 'lyria', name: 'Lyria', img: '/assets/google/lyria_logo_v2.png', color: '#EA4335' },
  { id: 'vertex', name: 'Vertex AI', img: '/assets/google/vertex_logo_v2.png', color: '#4285F4' },
  { id: 'mariner', name: 'Mariner', img: '/assets/google/mariner_logo_v2.png', color: '#34A853' },
  {
    id: 'firebase',
    name: 'Firebase',
    img: '/assets/google/firebase_logo_v2.png',
    color: '#FFCA28',
  },
  {
    id: 'notebooklm',
    name: 'NotebookLM',
    img: '/assets/google/notebooklm_logo_v2.png',
    color: '#4285F4',
  },
];

// Memoized tool node to prevent unnecessary re-renders
const ToolNode = memo(
  ({ tool, x, y, index }: { tool: (typeof TOOLS)[0]; x: number; y: number; index: number }) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: x,
          y: y,
        }}
        transition={{
          duration: 0.8,
          delay: 0.3 + index * 0.08,
        }}
        className="absolute w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-white/5 dark:bg-[#1d232a]/40 backdrop-blur-md border-2 border-white/20 dark:border-white/10 flex flex-col items-center justify-center shadow-lg group overflow-hidden hover:shadow-blue-500/20 hover:scale-110 transition-transform duration-300"
      >
        {/* Center Masked Image - optimized with priority false and lazy loading */}
        <div className="relative w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border border-white/5 bg-[#0b0e14]">
          <Image
            src={tool.img}
            alt={tool.name}
            fill
            sizes="(max-width: 768px) 48px, (max-width: 1024px) 64px, 80px"
            className="object-cover scale-110 group-hover:scale-125 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Label on hover */}
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-blue-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {tool.name}
        </span>

        {/* Simple glow effect - no animation */}
        <div
          className="absolute inset-x-0 bottom-0 h-1 opacity-40 blur-sm"
          style={{ backgroundColor: tool.color }}
        />
      </motion.div>
    );
  },
);

export function EcosystemVisual() {
  // Use state for responsive radius to avoid SSR mismatch
  const [radius, setRadius] = useState(280);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateRadius = () => {
      if (window.innerWidth < 768) {
        setRadius(120);
      } else if (window.innerWidth < 1024) {
        setRadius(200);
      } else {
        setRadius(280);
      }
    };

    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  // Simple loading state for SSR
  if (!isMounted) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-60 h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full bg-white/5 dark:bg-[#161b22]/60 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central Hub - G-Pilot Shield - Simplified animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-20 w-60 h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full bg-white/5 dark:bg-[#161b22]/60 backdrop-blur-xl border-4 border-blue-600/30 flex items-center justify-center shadow-[0_0_80px_rgba(66,133,244,0.3)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden p-4 bg-[#0b0e14]/40">
          <Image
            src="/assets/brand/g-pilot-shield-3d-v2.png"
            alt="G-Pilot Shield"
            fill
            sizes="(max-width: 768px) 160px, (max-width: 1024px) 192px, 224px"
            className="object-cover scale-105"
            priority // Only this central image gets priority
          />
        </div>
      </motion.div>

      {/* Orbiting Tools - Removed complex animations */}
      <div className="absolute inset-0 z-10">
        {TOOLS.map((tool, i) => {
          const angle = (i / TOOLS.length) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={tool.id}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              {/* Static beam instead of animated */}
              <div
                className="absolute origin-left h-0.5 rounded-full opacity-20"
                style={{
                  width: `${radius}px`,
                  background: `linear-gradient(90deg, transparent, ${tool.color})`,
                  transform: `rotate(${angle}rad)`,
                }}
              />

              <ToolNode tool={tool} x={x} y={y} index={i} />
            </div>
          );
        })}
      </div>

      {/* Simplified background glow - static, not animated */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}

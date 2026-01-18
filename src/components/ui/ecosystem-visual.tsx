'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const TOOLS = [
    { id: 'gemini', name: 'Gemini Pro', img: '/assets/google/gemini_logo_v2.png', color: '#4285F4' },
    { id: 'veo', name: 'VEO', img: '/assets/google/veo_logo_v2.png', color: '#34A853' },
    { id: 'imagen', name: 'Imagen', img: '/assets/google/imagen_logo_v2.png', color: '#FBBC05' },
    { id: 'lyria', name: 'Lyria', img: '/assets/google/lyria_logo_v2.png', color: '#EA4335' },
    { id: 'vertex', name: 'Vertex AI', img: '/assets/google/vertex_logo_v2.png', color: '#4285F4' },
    { id: 'mariner', name: 'Mariner', img: '/assets/google/mariner_logo_v2.png', color: '#34A853' },
    { id: 'firebase', name: 'Firebase', img: '/assets/google/firebase_logo_v2.png', color: '#FFCA28' },
    { id: 'notebooklm', name: 'NotebookLM', img: '/assets/google/notebooklm_logo_v2.png', color: '#4285F4' },
];

export function EcosystemVisual() {
    return (
        <div className="relative w-full h-full flex items-center justify-center perspective-[2000px]">
            {/* Central Hub - G-Pilot Shield 3D */}
            <motion.div
                initial={{ scale: 0, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="relative z-20 w-64 h-64 rounded-full bg-white dark:bg-[#161b22] border-4 border-blue-600/30 flex items-center justify-center shadow-[0_0_120px_rgba(66,133,244,0.4)]"
            >
                <div className="relative w-48 h-48">
                    <Image
                        src="/assets/brand/g-pilot-shield-3d-v2.png"
                        alt="G-Pilot Shield"
                        fill
                        className="object-contain animate-pulse-glow"
                    />
                </div>
            </motion.div>

            {/* Orbiting Tools & High-Fidelity Beams */}
            <div className="absolute inset-0 z-10">
                {TOOLS.map((tool, i) => {
                    const angle = (i / TOOLS.length) * Math.PI * 2;
                    const radius = 350;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                        <div key={tool.id} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            {/* Converging 3D Beams */}
                            <motion.div
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: [0, 0.7, 0], scaleX: 1 }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeInOut"
                                }}
                                className="absolute origin-left h-[4px] rounded-full"
                                style={{
                                    width: `${radius}px`,
                                    background: `linear-gradient(90deg, transparent, ${tool.color}, transparent)`,
                                    rotate: `${angle}rad`,
                                    top: '0',
                                    left: '0',
                                    boxShadow: `0 0 20px ${tool.color}88`
                                }}
                            />

                            {/* Tool Node - 3D Illustration */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    x: x,
                                    y: y,
                                    rotateY: [0, 15, 0],
                                    rotateX: [0, -15, 0]
                                }}
                                transition={{
                                    duration: 1.2,
                                    delay: 0.5 + (i * 0.1),
                                    rotateY: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                                    rotateX: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                                }}
                                className="absolute w-28 h-28 bg-white dark:bg-[#1d232a] rounded-[2rem] border-2 border-gray-100 dark:border-white/10 flex flex-col items-center justify-center shadow-2xl group perspective-[1000px] overflow-hidden"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <div className="relative w-16 h-16 mb-2">
                                    <Image
                                        src={tool.img}
                                        alt={tool.name}
                                        fill
                                        className="object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
                                    />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-blue-600 transition-colors">
                                    {tool.name}
                                </span>

                                {/* 3D Depth Shadow */}
                                <div
                                    className="absolute inset-x-0 bottom-0 h-1 opacity-50 transition-all group-hover:h-3"
                                    style={{ backgroundColor: tool.color }}
                                />
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* Background Spatial Atmosphere */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full" />
            </div>
        </div>
    );
}

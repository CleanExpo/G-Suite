'use client';

import { useMultimodalLive } from '@/hooks/use-multimodal-live';
import { useState } from 'react';
import { LiveConfig } from '@/lib/google/multimodal-live-api';

/**
 * Multimodal Live Dashboard
 *
 * Demonstration of Gemini 2.0 Multimodal Live API.
 * Real-time voice and text interaction.
 */
export default function LivePage() {
  // In a production app, the API key should be fetched securely via a server action
  // For this prototype, we're using the provided key or an environment variable.
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';

  const config: LiveConfig = {
    model: 'models/gemini-2.0-flash-exp', // Use Experimental for Live API
    generation_config: {
      response_modalities: ['audio', 'text'],
      speech_config: {
        voice_config: {
          prebuilt_voice_config: {
            voice_name: 'Puck',
          },
        },
      },
    },
    system_instruction: {
      parts: [
        {
          text: 'You are G-Pilot, a helpful AI project manager. You can hear and see the user in real-time. Be concise, professional, and proactive.',
        },
      ],
    },
  };

  const {
    connected,
    transcript,
    isRecording,
    connect,
    disconnect,
    startStreaming,
    stopStreaming,
    sendText,
  } = useMultimodalLive({ apiKey, config });

  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendText(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Multimodal Live
          </h1>
          <p className="text-slate-400 text-sm">Gemini 2.0 • Real-time Voice & Vision</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}
            />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-300">
              {connected ? 'Live Session Active' : 'Offline'}
            </span>
          </div>

          {!connected ? (
            <button
              onClick={connect}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg shadow-blue-900/40"
            >
              Start Session
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-full font-bold transition-all"
            >
              End Session
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Visual Feed Placeholder */}
        <div className="lg:col-span-2 bg-slate-900/50 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono">
            REAL-TIME FEED
          </div>

          <div className="text-center group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
              <span className="text-4xl">👁️</span>
            </div>
            <p className="text-slate-500 text-sm">Camera stream integration pending WebRTC setup</p>
          </div>

          {/* Pulsing indicator for audio */}
          {isRecording && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-500 rounded-full"
                  style={{
                    height: '20px',
                    animation: `pulse ${0.5 + i * 0.1}s infinite alternate`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Interaction & Transcript */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/80">
            <h2 className="font-bold text-sm tracking-widest uppercase text-slate-400">
              Activity Log
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm">
            {transcript.length === 0 ? (
              <div className="text-slate-600 italic">
                No activity yet. Start the session to begin...
              </div>
            ) : (
              transcript.map((line, idx) => (
                <div
                  key={idx}
                  className={`${line.startsWith('AI:') ? 'text-emerald-400' : 'text-blue-400'}`}
                >
                  <span className="opacity-50 mr-2">
                    [{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
                  </span>
                  {line}
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-800 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={!connected}
                className="flex-1 bg-black/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!connected || !input.trim()}
                className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 disabled:opacity-50"
              >
                ↗️
              </button>
            </div>

            <button
              onMouseDown={startStreaming}
              onMouseUp={stopStreaming}
              disabled={!connected}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                isRecording
                  ? 'bg-red-600 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              } disabled:opacity-50`}
            >
              {isRecording ? 'Listening...' : 'Hold to Speak'}
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes pulse {
          from {
            height: 10px;
            opacity: 0.5;
          }
          to {
            height: 40px;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

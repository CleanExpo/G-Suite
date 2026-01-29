"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { MultimodalLiveClient, LiveIncomingMessage, LiveConfig } from '../lib/google/multimodal-live-api';
import { AudioStreamer } from '../lib/audio/audio-streamer';

export interface UseMultimodalLiveOptions {
    apiKey: string;
    config: LiveConfig;
}

export function useMultimodalLive({ apiKey, config }: UseMultimodalLiveOptions) {
    const [connected, setConnected] = useState(false);
    const [transcript, setTranscript] = useState<string[]>([]);
    const [isRecording, setIsRecording] = useState(false);

    const clientRef = useRef<MultimodalLiveClient | null>(null);
    const audioStreamerRef = useRef<AudioStreamer | null>(null);

    // Initialize Audio Streamer
    useEffect(() => {
        audioStreamerRef.current = new AudioStreamer();
        return () => {
            audioStreamerRef.current?.stopRecording();
        };
    }, []);

    const connect = useCallback(() => {
        if (clientRef.current) return;

        const client = new MultimodalLiveClient(apiKey, config);

        client.onOpen = () => {
            setConnected(true);
            console.log('[Live] Connected');
        };

        client.onClose = () => {
            setConnected(false);
            setIsRecording(false);
            console.log('[Live] Disconnected');
            clientRef.current = null;
        };

        client.onMessage = (msg: LiveIncomingMessage) => {
            if ('server_content' in msg) {
                const modelTurn = msg.server_content.model_turn;
                if (modelTurn) {
                    modelTurn.parts.forEach(part => {
                        if (part.text) {
                            setTranscript(prev => [...prev, `AI: ${part.text}`]);
                        }
                        if (part.inline_data && part.inline_data.mime_type.startsWith('audio/')) {
                            audioStreamerRef.current?.addAudioChunk(part.inline_data.data);
                        }
                    });
                }
            } else if ('tool_call' in msg) {
                console.log('[Live] Tool call received:', msg.tool_call);
                // Handle tool calls here (UNI-201 scope includes function calling)
            } else if ('error' in msg) {
                console.error('[Live] API Error:', msg.error.message);
            }
        };

        client.connect();
        clientRef.current = client;
    }, [apiKey, config]);

    const disconnect = useCallback(() => {
        clientRef.current?.disconnect();
    }, []);

    const startStreaming = useCallback(async () => {
        if (!connected) return;

        try {
            await audioStreamerRef.current?.startRecording((base64) => {
                clientRef.current?.sendAudioChunk(base64);
            });
            setIsRecording(true);
        } catch (err) {
            console.error('[Live] Failed to start microphone:', err);
        }
    }, [connected]);

    const stopStreaming = useCallback(() => {
        audioStreamerRef.current?.stopRecording();
        setIsRecording(false);
    }, []);

    const sendText = useCallback((text: string) => {
        clientRef.current?.sendText(text);
        setTranscript(prev => [...prev, `You: ${text}`]);
    }, []);

    return {
        connected,
        transcript,
        isRecording,
        connect,
        disconnect,
        startStreaming,
        stopStreaming,
        sendText
    };
}

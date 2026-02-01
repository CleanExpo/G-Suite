/**
 * Gemini 2.0 Multimodal Live API Client
 *
 * Implements the Bidi (Bidirectional) protocol over WebSockets.
 * Allows real-time audio/video streaming and tool calling.
 *
 * @see https://ai.google.dev/gemini-api/docs/multimodal-live
 */

export interface LiveConfig {
  model: string;
  generation_config?: {
    candidate_count?: number;
    max_output_tokens?: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    response_modalities?: ('text' | 'audio' | 'image')[];
    speech_config?: {
      voice_config?: {
        prebuilt_voice_config?: {
          voice_name: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
        };
      };
    };
  };
  system_instruction?: {
    parts: { text: string }[];
  };
  tools?: any[];
}

export type LiveIncomingMessage =
  | { setup_complete: {} }
  | {
      server_content: {
        model_turn: {
          parts: { text?: string; inline_data?: { mime_type: string; data: string } }[];
        };
        turn_complete?: boolean;
        interruption?: boolean;
      };
    }
  | { tool_call: { function_calls: { name: string; args: any; id: string }[] } }
  | { tool_call_cancellation: { ids: string[] } }
  | { error: { message: string } };

export type LiveOutgoingMessage =
  | { setup: LiveConfig }
  | {
      client_content: {
        turns: {
          role: 'user';
          parts: { text?: string; inline_data?: { mime_type: string; data: string } }[];
        }[];
        turn_complete: boolean;
      };
    }
  | { real_time_input: { media_chunks: { mime_type: string; data: string }[] } }
  | { tool_response: { function_responses: { name: string; response: any; id: string }[] } };

export class MultimodalLiveClient {
  private ws: WebSocket | null = null;
  private config: LiveConfig;
  private apiKey: string;

  public onMessage?: (msg: LiveIncomingMessage) => void;
  public onError?: (err: any) => void;
  public onOpen?: () => void;
  public onClose?: () => void;

  constructor(apiKey: string, config: LiveConfig) {
    this.apiKey = apiKey;
    this.config = config;
  }

  public connect() {
    // Construct the URL for the Multimodal Live API
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('[LiveClient] WebSocket connected');
      this.sendSetup();
      this.onOpen?.();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage?.(data);
      } catch (err) {
        console.error('[LiveClient] Failed to parse message:', err);
      }
    };

    this.ws.onerror = (err) => {
      console.error('[LiveClient] WebSocket error:', err);
      this.onError?.(err);
    };

    this.ws.onclose = () => {
      console.log('[LiveClient] WebSocket closed');
      this.onClose?.();
    };
  }

  public disconnect() {
    this.ws?.close();
    this.ws = null;
  }

  public send(msg: LiveOutgoingMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      console.warn('[LiveClient] Cannot send message, WebSocket not open');
    }
  }

  private sendSetup() {
    this.send({ setup: this.config });
  }

  public sendAudioChunk(base64Data: string) {
    this.send({
      real_time_input: {
        media_chunks: [
          {
            mime_type: 'audio/pcm;rate=16000',
            data: base64Data,
          },
        ],
      },
    });
  }

  public sendVideoChunk(base64Data: string, mimeType: string = 'image/jpeg') {
    this.send({
      real_time_input: {
        media_chunks: [
          {
            mime_type: mimeType,
            data: base64Data,
          },
        ],
      },
    });
  }

  public sendText(text: string) {
    this.send({
      client_content: {
        turns: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        turn_complete: true,
      },
    });
  }
}

/**
 * Audio Streamer Utility
 *
 * Handles Recording (Input) and Playback (Output) of raw PCM audio.
 * Optimized for Gemini Multimodal Live API (16kHz / 16-bit PCM).
 */

export class AudioStreamer {
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  // Playback queue
  private audioQueue: Float32Array[] = [];
  private isPlaying = false;
  private startTime = 0;

  constructor(private sampleRate = 16000) {}

  /**
   * Start recording audio from microphone
   */
  async startRecording(onAudioData: (base64: string) => void) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: this.sampleRate,
    });

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.source = this.audioContext.createMediaStreamSource(this.stream);

    // Use ScriptProcessor for simplicity (though deprecated, it's easier for raw PCM)
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = this.floatTo16BitPCM(inputData);
      const base64 = this.arrayBufferToBase64(pcmData.buffer as ArrayBuffer);
      onAudioData(base64);
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  /**
   * Stop recording
   */
  stopRecording() {
    this.processor?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.audioContext?.close();
  }

  /**
   * Play received PCM audio chunks
   */
  addAudioChunk(base64Data: string) {
    const buffer = this.base64ToArrayBuffer(base64Data);
    const floatData = this.pcm16ToFloat32(new Int16Array(buffer));

    this.audioQueue.push(floatData);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  private async playNext() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const data = this.audioQueue.shift()!;

    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new AudioContext({ sampleRate: this.sampleRate });
    }

    const audioBuffer = this.audioContext.createBuffer(1, data.length, this.sampleRate);
    audioBuffer.getChannelData(0).set(data);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    source.onended = () => this.playNext();

    // Handle timing for seamless playback
    const currentTime = this.audioContext.currentTime;
    if (this.startTime < currentTime) {
      this.startTime = currentTime;
    }

    source.start(this.startTime);
    this.startTime += audioBuffer.duration;
  }

  // --- Helpers ---

  private floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
  }

  private pcm16ToFloat32(input: Int16Array): Float32Array {
    const output = new Float32Array(input.length);
    for (let i = 0; i < input.length; i++) {
      output[i] = input[i] / 32768;
    }
    return output;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

/**
 * Google Veo 3.1 Video Generation Client
 *
 * Implements async video generation using Vertex AI Veo API.
 * Supports:
 * - Text-to-video generation
 * - Image-to-video generation
 * - Long-running operation polling
 * - GCS storage integration
 * - Error handling with retry logic
 */

import { GoogleAuth } from 'google-auth-library';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface VeoGenerationOptions {
  prompt: string;
  durationSeconds?: 4 | 6 | 8;
  resolution?: '720p' | '1080p' | '4k';
  aspectRatio?: '16:9' | '9:16' | '1:1';
  referenceImage?: {
    base64: string;
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  };
  referenceImages?: Array<{
    base64: string;
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
    referenceType: 'asset' | 'style';
  }>;
  negativePrompt?: string;
  sampleCount?: number; // 1-4
  seed?: number;
  personGeneration?: 'allow_adult' | 'dont_allow' | 'allow_all';
  generateAudio?: boolean;
  storageUri?: string; // GCS bucket: gs://bucket-name/path/
}

export interface VeoGenerationResult {
  success: boolean;
  operationName?: string;
  videoUrls?: string[];
  error?: string;
  metadata?: {
    model: string;
    duration: number;
    resolution: string;
    aspectRatio: string;
    generatedAt: string;
  };
}

export interface VeoOperationStatus {
  done: boolean;
  name: string;
  metadata?: {
    createTime: string;
    updateTime: string;
  };
  response?: {
    predictions: Array<{
      bytesBase64Encoded?: string;
      gcsUri?: string;
    }>;
  };
  error?: {
    code: number;
    message: string;
    details?: unknown[];
  };
}

// ============================================================================
// Veo Client Class
// ============================================================================

export class VeoClient {
  private projectId: string;
  private location: string;
  private auth: GoogleAuth;
  private baseUrl: string;

  constructor(config?: {
    projectId?: string;
    location?: string;
    credentials?: {
      client_email: string;
      private_key: string;
    };
  }) {
    // Use environment variables with fallbacks
    this.projectId = config?.projectId || process.env.GOOGLE_CLOUD_PROJECT || '';
    this.location = config?.location || process.env.VERTEX_AI_LOCATION || 'us-central1';

    if (!this.projectId) {
      throw new Error(
        'Google Cloud Project ID not configured. Set GOOGLE_CLOUD_PROJECT environment variable.',
      );
    }

    // Initialize Google Auth
    if (config?.credentials) {
      this.auth = new GoogleAuth({
        credentials: config.credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
    } else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      this.auth = new GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
    } else {
      // Fallback to default credentials (ADC - Application Default Credentials)
      this.auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
    }

    this.baseUrl = `https://${this.location}-aiplatform.googleapis.com/v1`;
  }

  /**
   * Generate video using Veo 3.1 model
   * Returns operation name for polling
   */
  async generateVideo(
    options: VeoGenerationOptions,
    modelId: string = 'veo-3.1-generate-001',
  ): Promise<VeoGenerationResult> {
    try {
      // Build request payload
      const requestBody = this.buildRequestBody(options);

      // Get access token
      const client = await this.auth.getClient();
      const accessToken = await client.getAccessToken();

      if (!accessToken.token) {
        throw new Error('Failed to obtain access token');
      }

      // Make API request
      const endpoint = `${this.baseUrl}/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${modelId}:predictLongRunning`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Veo API error (${response.status}): ${errorData.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();

      return {
        success: true,
        operationName: data.name,
        metadata: {
          model: modelId,
          duration: options.durationSeconds || 8,
          resolution: options.resolution || '720p',
          aspectRatio: options.aspectRatio || '16:9',
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      console.error('[VeoClient] Generation error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error during video generation',
      };
    }
  }

  /**
   * Poll operation status until completion
   * Returns final video URLs
   */
  async pollOperationStatus(
    operationName: string,
    options: {
      maxAttempts?: number;
      pollIntervalMs?: number;
      onProgress?: (attempt: number, maxAttempts: number) => void;
    } = {},
  ): Promise<VeoGenerationResult> {
    const maxAttempts = options.maxAttempts || 60; // 60 attempts = ~10 minutes with 10s interval
    const pollIntervalMs = options.pollIntervalMs || 10000; // 10 seconds

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Notify progress
        if (options.onProgress) {
          options.onProgress(attempt, maxAttempts);
        }

        // Get operation status
        const status = await this.getOperationStatus(operationName);

        // Operation complete
        if (status.done) {
          // Check for errors
          if (status.error) {
            return {
              success: false,
              error: `Operation failed: ${status.error.message} (Code: ${status.error.code})`,
            };
          }

          // Extract video URLs
          const videoUrls = this.extractVideoUrls(status);

          if (videoUrls.length === 0) {
            return {
              success: false,
              error: 'No video URLs found in completed operation',
            };
          }

          return {
            success: true,
            operationName,
            videoUrls,
            metadata: {
              model: 'veo-3.1',
              duration: 0,
              resolution: '',
              aspectRatio: '',
              generatedAt: status.metadata?.updateTime || new Date().toISOString(),
            },
          };
        }

        // Wait before next poll
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
        }
      } catch (error: any) {
        console.error(`[VeoClient] Poll attempt ${attempt} error:`, error);

        // Continue polling on transient errors
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
          continue;
        }

        return {
          success: false,
          error: `Polling failed: ${error.message}`,
        };
      }
    }

    // Timeout
    return {
      success: false,
      error: `Operation timeout after ${maxAttempts} attempts (${(maxAttempts * pollIntervalMs) / 1000}s)`,
    };
  }

  /**
   * Get operation status by name
   */
  async getOperationStatus(operationName: string): Promise<VeoOperationStatus> {
    const client = await this.auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error('Failed to obtain access token');
    }

    const endpoint = `${this.baseUrl}/${operationName}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to get operation status (${response.status}): ${errorData.error?.message || response.statusText}`,
      );
    }

    return await response.json();
  }

  /**
   * Generate and wait for completion (convenience method)
   */
  async generateVideoAndWait(
    options: VeoGenerationOptions,
    pollOptions?: {
      maxAttempts?: number;
      pollIntervalMs?: number;
      onProgress?: (attempt: number, maxAttempts: number) => void;
    },
  ): Promise<VeoGenerationResult> {
    // Step 1: Start generation
    const startResult = await this.generateVideo(options);

    if (!startResult.success || !startResult.operationName) {
      return startResult;
    }

    // Step 2: Poll until complete
    const finalResult = await this.pollOperationStatus(startResult.operationName, pollOptions);

    // Merge metadata
    if (finalResult.success && startResult.metadata) {
      finalResult.metadata = {
        ...startResult.metadata,
        ...finalResult.metadata,
      };
    }

    return finalResult;
  }

  // ========================================================================
  // Private Helper Methods
  // ========================================================================

  private buildRequestBody(options: VeoGenerationOptions): unknown {
    const instances: unknown[] = [];
    const instance: any = {
      prompt: options.prompt,
    };

    // Add reference image (image-to-video)
    if (options.referenceImage) {
      instance.image = {
        bytesBase64Encoded: options.referenceImage.base64,
        mimeType: options.referenceImage.mimeType,
      };
    }

    // Add multiple reference images (asset/style)
    if (options.referenceImages && options.referenceImages.length > 0) {
      instance.referenceImages = options.referenceImages.map((ref) => ({
        image: {
          bytesBase64Encoded: ref.base64,
          mimeType: ref.mimeType,
        },
        referenceType: ref.referenceType,
      }));
    }

    instances.push(instance);

    // Build parameters
    const parameters: any = {
      durationSeconds: options.durationSeconds || 8,
      generateAudio: options.generateAudio !== undefined ? options.generateAudio : true,
      sampleCount: options.sampleCount || 1,
    };

    // Optional parameters
    if (options.resolution) {
      parameters.resolution = options.resolution;
    }

    if (options.aspectRatio) {
      parameters.aspectRatio = options.aspectRatio;
    }

    if (options.negativePrompt) {
      parameters.negativePrompt = options.negativePrompt;
    }

    if (options.seed !== undefined) {
      parameters.seed = options.seed;
    }

    if (options.personGeneration) {
      parameters.personGeneration = options.personGeneration;
    }

    if (options.storageUri) {
      parameters.storageUri = options.storageUri;
    }

    return {
      instances,
      parameters,
    };
  }

  private extractVideoUrls(status: VeoOperationStatus): string[] {
    if (!status.response?.predictions) {
      return [];
    }

    const urls: string[] = [];

    for (const prediction of status.response.predictions) {
      // GCS URI takes precedence
      if (prediction.gcsUri) {
        urls.push(prediction.gcsUri);
      } else if (prediction.bytesBase64Encoded) {
        // Create data URL from base64
        urls.push(`data:video/mp4;base64,${prediction.bytesBase64Encoded}`);
      }
    }

    return urls;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let veoClientInstance: VeoClient | null = null;

export function getVeoClient(): VeoClient {
  if (!veoClientInstance) {
    veoClientInstance = new VeoClient();
  }
  return veoClientInstance;
}

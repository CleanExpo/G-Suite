/**
 * SendGrid Email Provider
 *
 * Enterprise-grade email provider with extensive features.
 * https://sendgrid.com
 */

import type { EmailMessage, SendEmailResult, EmailAddress } from '../types';

export class SendGridProvider {
  private apiKey: string;
  private baseUrl = 'https://api.sendgrid.com/v3';
  private defaultFrom?: EmailAddress;

  constructor(apiKey?: string, defaultFrom?: EmailAddress) {
    this.apiKey = apiKey || process.env.SENDGRID_API_KEY || '';
    this.defaultFrom = defaultFrom;
  }

  /**
   * Check if provider is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Send a single email
   */
  async send(message: EmailMessage): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: 'sendgrid',
        error: { code: 'NOT_CONFIGURED', message: 'SendGrid API key not configured' },
      };
    }

    try {
      const toAddresses = Array.isArray(message.to) ? message.to : [message.to];
      const from = message.from || this.defaultFrom!;

      const payload: any = {
        personalizations: [
          {
            to: toAddresses.map((a) => ({ email: a.email, name: a.name })),
          },
        ],
        from: { email: from.email, name: from.name },
        subject: message.subject,
      };

      if (message.replyTo) {
        payload.reply_to = { email: message.replyTo.email, name: message.replyTo.name };
      }

      if (message.html || message.text) {
        payload.content = [];
        if (message.text) {
          payload.content.push({ type: 'text/plain', value: message.text });
        }
        if (message.html) {
          payload.content.push({ type: 'text/html', value: message.html });
        }
      }

      if (message.templateId) {
        payload.template_id = message.templateId;
        if (message.templateData) {
          payload.personalizations[0].dynamic_template_data = message.templateData;
        }
      }

      if (message.attachments && message.attachments.length > 0) {
        payload.attachments = message.attachments.map((a) => ({
          content: typeof a.content === 'string' ? a.content : a.content.toString('base64'),
          filename: a.filename,
          type: a.contentType,
          disposition: a.disposition || 'attachment',
          content_id: a.contentId,
        }));
      }

      if (message.headers) {
        payload.headers = message.headers;
      }

      if (message.tags && message.tags.length > 0) {
        payload.categories = message.tags;
      }

      const response = await fetch(`${this.baseUrl}/mail/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          provider: 'sendgrid',
          error: {
            code: response.status.toString(),
            message: errorData.errors?.[0]?.message || 'Failed to send email',
          },
        };
      }

      // SendGrid returns 202 with x-message-id header
      const messageId = response.headers.get('x-message-id') || undefined;

      return {
        success: true,
        messageId,
        provider: 'sendgrid',
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'sendgrid',
        error: { code: 'NETWORK_ERROR', message: error.message },
      };
    }
  }

  /**
   * Send batch emails (one at a time for SendGrid)
   */
  async sendBatch(messages: EmailMessage[]): Promise<SendEmailResult[]> {
    return Promise.all(messages.map((m) => this.send(m)));
  }
}

// Singleton
let providerInstance: SendGridProvider | null = null;

export function getSendGridProvider(): SendGridProvider {
  if (!providerInstance) {
    providerInstance = new SendGridProvider();
  }
  return providerInstance;
}

/**
 * Email Client
 * 
 * Provider-agnostic email client that routes to configured ESP.
 */

import type {
    EmailMessage,
    SendEmailResult,
    BulkSendResult,
    EmailProvider,
    EmailAddress
} from './types';
import { getResendProvider } from './providers/resend';
import { getSendGridProvider } from './providers/sendgrid';

export class EmailClient {
    private provider: EmailProvider;
    private defaultFrom: EmailAddress;

    constructor() {
        // Determine which provider to use based on available API keys
        if (process.env.RESEND_API_KEY) {
            this.provider = 'resend';
        } else if (process.env.SENDGRID_API_KEY) {
            this.provider = 'sendgrid';
        } else {
            this.provider = 'resend'; // Default, will fail gracefully
        }

        this.defaultFrom = {
            email: process.env.EMAIL_FROM_ADDRESS || 'noreply@gpilot.ai',
            name: process.env.EMAIL_FROM_NAME || 'G-Pilot',
        };
    }

    /**
     * Check if email is configured
     */
    isConfigured(): boolean {
        switch (this.provider) {
            case 'resend':
                return getResendProvider().isConfigured();
            case 'sendgrid':
                return getSendGridProvider().isConfigured();
            default:
                return false;
        }
    }

    /**
     * Get current provider
     */
    getProvider(): EmailProvider {
        return this.provider;
    }

    /**
     * Send a single email
     */
    async send(message: EmailMessage): Promise<SendEmailResult> {
        // Apply defaults
        const fullMessage: EmailMessage = {
            ...message,
            from: message.from || this.defaultFrom,
        };

        switch (this.provider) {
            case 'resend':
                return getResendProvider().send(fullMessage);
            case 'sendgrid':
                return getSendGridProvider().send(fullMessage);
            default:
                return {
                    success: false,
                    provider: this.provider,
                    error: { code: 'UNSUPPORTED_PROVIDER', message: `Provider ${this.provider} not supported` },
                };
        }
    }

    /**
     * Send bulk emails
     */
    async sendBulk(messages: EmailMessage[]): Promise<BulkSendResult> {
        // Apply defaults to all messages
        const fullMessages = messages.map(m => ({
            ...m,
            from: m.from || this.defaultFrom,
        }));

        let results: SendEmailResult[];

        switch (this.provider) {
            case 'resend':
                results = await getResendProvider().sendBatch(fullMessages);
                break;
            case 'sendgrid':
                results = await getSendGridProvider().sendBatch(fullMessages);
                break;
            default:
                results = fullMessages.map(() => ({
                    success: false,
                    provider: this.provider,
                    error: { code: 'UNSUPPORTED_PROVIDER', message: `Provider ${this.provider} not supported` },
                }));
        }

        return {
            total: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results,
        };
    }

    /**
     * Send a templated email
     */
    async sendTemplate(
        to: EmailAddress | EmailAddress[],
        templateId: string,
        data: Record<string, unknown>
    ): Promise<SendEmailResult> {
        return this.send({
            to,
            from: this.defaultFrom,
            subject: '', // Will be set by template
            templateId,
            templateData: data,
        });
    }
}

// Singleton
let clientInstance: EmailClient | null = null;

export function getEmailClient(): EmailClient {
    if (!clientInstance) {
        clientInstance = new EmailClient();
    }
    return clientInstance;
}

/**
 * Resend Email Provider
 * 
 * Modern email provider with excellent developer experience.
 * https://resend.com
 */

import type {
    EmailMessage,
    SendEmailResult,
    EmailAddress
} from '../types';

export class ResendProvider {
    private apiKey: string;
    private baseUrl = 'https://api.resend.com';
    private defaultFrom?: EmailAddress;

    constructor(apiKey?: string, defaultFrom?: EmailAddress) {
        this.apiKey = apiKey || process.env.RESEND_API_KEY || '';
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
                provider: 'resend',
                error: { code: 'NOT_CONFIGURED', message: 'Resend API key not configured' },
            };
        }

        try {
            const toAddresses = Array.isArray(message.to) ? message.to : [message.to];

            const response = await fetch(`${this.baseUrl}/emails`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: this.formatAddress(message.from || this.defaultFrom!),
                    to: toAddresses.map(a => this.formatAddress(a)),
                    reply_to: message.replyTo ? this.formatAddress(message.replyTo) : undefined,
                    subject: message.subject,
                    html: message.html,
                    text: message.text,
                    headers: message.headers,
                    tags: message.tags?.map(t => ({ name: t, value: 'true' })),
                    attachments: message.attachments?.map(a => ({
                        filename: a.filename,
                        content: typeof a.content === 'string' ? a.content : a.content.toString('base64'),
                        content_type: a.contentType,
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    provider: 'resend',
                    error: {
                        code: data.statusCode?.toString() || 'API_ERROR',
                        message: data.message || 'Failed to send email'
                    },
                };
            }

            return {
                success: true,
                messageId: data.id,
                provider: 'resend',
            };
        } catch (error: any) {
            return {
                success: false,
                provider: 'resend',
                error: { code: 'NETWORK_ERROR', message: error.message },
            };
        }
    }

    /**
     * Send batch emails
     */
    async sendBatch(messages: EmailMessage[]): Promise<SendEmailResult[]> {
        if (!this.isConfigured()) {
            return messages.map(() => ({
                success: false,
                provider: 'resend' as const,
                error: { code: 'NOT_CONFIGURED', message: 'Resend API key not configured' },
            }));
        }

        try {
            const response = await fetch(`${this.baseUrl}/emails/batch`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    messages.map(message => {
                        const toAddresses = Array.isArray(message.to) ? message.to : [message.to];
                        return {
                            from: this.formatAddress(message.from || this.defaultFrom!),
                            to: toAddresses.map(a => this.formatAddress(a)),
                            subject: message.subject,
                            html: message.html,
                            text: message.text,
                        };
                    })
                ),
            });

            const data = await response.json();

            if (!response.ok) {
                return messages.map(() => ({
                    success: false,
                    provider: 'resend' as const,
                    error: { code: 'BATCH_ERROR', message: data.message || 'Batch send failed' },
                }));
            }

            return data.data.map((result: any) => ({
                success: true,
                messageId: result.id,
                provider: 'resend' as const,
            }));
        } catch (error: any) {
            return messages.map(() => ({
                success: false,
                provider: 'resend' as const,
                error: { code: 'NETWORK_ERROR', message: error.message },
            }));
        }
    }

    private formatAddress(address: EmailAddress): string {
        if (address.name) {
            return `${address.name} <${address.email}>`;
        }
        return address.email;
    }
}

// Singleton
let providerInstance: ResendProvider | null = null;

export function getResendProvider(): ResendProvider {
    if (!providerInstance) {
        providerInstance = new ResendProvider();
    }
    return providerInstance;
}

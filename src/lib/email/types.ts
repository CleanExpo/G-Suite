/**
 * Email Marketing Types
 *
 * Type definitions for email campaigns, templates, and ESP providers.
 */

// =============================================================================
// EMAIL MESSAGE
// =============================================================================

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailMessage {
  to: EmailAddress | EmailAddress[];
  from?: EmailAddress;
  replyTo?: EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  tags?: string[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
  disposition?: 'attachment' | 'inline';
  contentId?: string;
}

// =============================================================================
// ESP PROVIDER
// =============================================================================

export type EmailProvider = 'resend' | 'sendgrid' | 'ses' | 'postmark';

export interface EmailProviderConfig {
  provider: EmailProvider;
  apiKey: string;
  defaultFrom?: EmailAddress;
  webhookSecret?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider: EmailProvider;
  error?: {
    code: string;
    message: string;
  };
}

export interface BulkSendResult {
  total: number;
  successful: number;
  failed: number;
  results: SendEmailResult[];
}

// =============================================================================
// TEMPLATES
// =============================================================================

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: TemplateVariable[];
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'url';
  required: boolean;
  defaultValue?: unknown;
  description?: string;
}

// =============================================================================
// CAMPAIGNS
// =============================================================================

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed';

export interface EmailCampaign {
  id: string;
  name: string;
  status: CampaignStatus;
  templateId?: string;
  subject: string;
  from: EmailAddress;
  recipients: EmailRecipient[];
  scheduledAt?: Date;
  sentAt?: Date;
  stats: CampaignStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  data?: Record<string, unknown>;
}

export interface CampaignStats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  complained: number;
}

// =============================================================================
// DELIVERY STATUS
// =============================================================================

export type DeliveryStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'failed'
  | 'unsubscribed'
  | 'complained';

export interface DeliveryEvent {
  messageId: string;
  status: DeliveryStatus;
  timestamp: Date;
  recipient: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// API RESPONSES
// =============================================================================

export interface EmailAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

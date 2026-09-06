import { Resend } from 'resend';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import logger from './logger';
import { env, appBaseUrl } from '../config/environment';
import { SiteSetting } from '../models';
import { internalNotificationRecipientWelcome } from './emailTemplates';

/**
 * Resend-backed outbound email.
 *
 * Replaces the earlier transport-free stub. The original contract is
 * preserved: `sendMail` never throws. Delivery stays best-effort so form
 * submissions, signups, and resets succeed even when Resend is unavailable.
 *
 * Requires RESEND_API_KEY (set in the server .env). MAIL_FROM controls the
 * visible sender and defaults to the Resend-verified subdomain
 * "Success Code Academy <noreply@updates.successcodeacademy.in>".
 *
 * Retries transient network/5xx failures once after a short delay. 4xx
 * responses (invalid address, rejected content) are permanent and are not
 * retried.
 */

export type MailMessage = {
  to: string;
  subject: string;
  /** Plain-text fallback body. Sent alongside `html` when provided. */
  text: string;
  /** Optional branded HTML body produced by the templates module. */
  html?: string | undefined;
  /** Upper "Reply-To" override, e.g. the submitter on a contact receipt. */
  replyTo?: string | undefined;
};

const NOTIFICATION_RECIPIENTS_KEY = 'notification_recipients';
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalize the setting format into unique, case-insensitive email addresses. */
export function normalizeNotificationRecipients(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter((email, index, values) => EMAIL_SHAPE.test(email) && values.indexOf(email) === index);
}

/**
 * Read the current staff notification destinations. A missing setting means
 * this install has never configured destinations, so retain the bootstrap
 * administrator as a backwards-compatible safety net. An existing setting is
 * authoritative, including an empty/invalid value (which intentionally sends
 * nothing rather than silently reverting to the bootstrap address).
 */
export async function getNotificationRecipients(): Promise<string[]> {
  try {
    const setting = await SiteSetting.findOne({ where: { key: NOTIFICATION_RECIPIENTS_KEY } });
    const raw = setting === null ? env.SUPER_ADMIN_EMAIL : setting.value;
    return normalizeNotificationRecipients(raw);
  } catch (error) {
    // Notification delivery is best-effort. If settings cannot be read, keep
    // existing installs safe by using the bootstrap address.
    logger.warn('[Mail] Could not read notification recipients; using bootstrap admin email.', { error });
    return EMAIL_SHAPE.test(env.SUPER_ADMIN_EMAIL.trim().toLowerCase())
      ? [env.SUPER_ADMIN_EMAIL.trim().toLowerCase()]
      : [];
  }
}

export type MailResult = {
  /** True only when Resend accepted the message. */
  delivered: boolean;
  /** Present when delivery was attempted and failed. */
  error?: string | undefined;
  /** Resend message id, useful for tracing in the dashboard. */
  messageId?: string | undefined;
};

const DEFAULT_FROM = 'Success Code Academy <noreply@updates.successcodeacademy.in>';

let cachedClient: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  if (!cachedClient) {
    cachedClient = new Resend(apiKey);
  }
  return cachedClient;
}

/**
 * Whether the Resend transport is configured. Read from process.env rather
 * than the validated env schema so callers never need schema churn to check.
 */
export function isMailerConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function mailFrom(): string {
  return process.env.MAIL_FROM?.trim() || DEFAULT_FROM;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryable(status: number | null): boolean {
  // Network-level failures surface as status === null; 5xx are transient.
  return status === null || status >= 500;
}

/**
 * Logo PNG, read once and cached, attached to every HTML email as a Resend
 * inline attachment under the "sca-logo" content id. The templates reference
 * it as cid:sca-logo so the header renders without a remote fetch. A missing
 * or unreadable file is logged once; emails still go out with the alt text
 * in place of the image.
 */
let cachedLogo: Buffer | null | undefined;

function logoAttachment(): { content: Buffer; cid: string; filename: string } | null {
  if (cachedLogo === undefined) {
    try {
      // Compiled: dist/utils -> client/public. ts-node dev: src/utils -> client/public.
      const logoPath = path.resolve(
        __dirname,
        '../../..',
        'client',
        'public',
        'images',
        'ui',
        'logo2.png',
      );
      cachedLogo = readFileSync(logoPath);
    } catch {
      logger.warn(
        '[Mail] Logo file could not be read; emails will render without it.',
      );
      cachedLogo = null;
    }
  }
  if (!cachedLogo) return null;
  return { content: cachedLogo, cid: 'sca-logo', filename: 'sca-logo.png' };
}

async function deliverOnce(
  client: Resend,
  message: MailMessage,
): Promise<{ ok: boolean; status: number | null; error?: string | undefined; messageId?: string | undefined }> {
  try {
    const payload: Parameters<typeof client.emails.send>[0] = {
      from: mailFrom(),
      to: message.to,
      subject: message.subject,
      text: message.text,
    };
    if (message.html !== undefined) {
      payload.html = message.html;
      // Inline attachments are only valid alongside an HTML body.
      const logo = logoAttachment();
      if (logo) {
      payload.attachments = [
          {
            content: logo.content,
            filename: logo.filename,
            // Setting contentId alone makes Resend send it inline; the
            // templates reference it as cid:sca-logo.
            contentId: logo.cid,
          },
        ];
      }
    }
    if (message.replyTo !== undefined) payload.replyTo = message.replyTo;

    const { data, error } = await client.emails.send(payload);

    if (error) {
      // Resend SDK returns application errors here with a name/message but no
      // HTTP status; treat validation/invalid-address errors as permanent.
      const permanent = /validation|invalid|not found|unauthorized/i.test(
        error.message || error.name || '',
      );
      return { ok: false, status: permanent ? 400 : 500, error: error.message };
    }

    return { ok: true, status: 200, messageId: data?.id };
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, status: null, error: reason };
  }
}

async function deliver(message: MailMessage): Promise<MailResult> {
  const client = getClient();
  if (!client) {
    return { delivered: false, error: 'RESEND_API_KEY is not configured.' };
  }

  let attempt = await deliverOnce(client, message);

  if (!attempt.ok && isRetryable(attempt.status)) {
    logger.warn('[Mail] Transient failure, retrying once', {
      to: message.to,
      subject: message.subject,
      error: attempt.error,
    });
    await sleep(1500);
    attempt = await deliverOnce(client, message);
  }

  return attempt.ok
    ? { delivered: true, messageId: attempt.messageId ?? undefined }
    : { delivered: false, error: attempt.error ?? undefined };
}

/**
 * Best-effort send. Resolves with `delivered: false` instead of throwing so
 * callers can offer a manual fallback.
 */
export async function sendMail(message: MailMessage): Promise<MailResult> {
  if (!isMailerConfigured()) {
    logger.info('[Mail] Skipped: no email transport is configured.', {
      to: message.to,
      subject: message.subject,
    });
    return {
      delivered: false,
      error: 'No email transport is configured on this server.',
    };
  }

  try {
    return await deliver(message);
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[Mail] Delivery failed.', {
      to: message.to,
      subject: message.subject,
      error: reason,
    });
    return { delivered: false, error: reason };
  }
}

/** Send an internal notification to each configured destination independently. */
export async function sendMailToRecipients(
  message: Omit<MailMessage, 'to'>,
): Promise<MailResult[]> {
  const recipients = await getNotificationRecipients();
  return Promise.all(recipients.map((to) => sendMail({ ...message, to })));
}

/** Send the one-time operational notice to a newly configured recipient. */
export async function sendNotificationRecipientWelcome(to: string): Promise<MailResult> {
  const content = internalNotificationRecipientWelcome();
  return sendMail({
    to,
    subject: 'You were added to Success Code Academy internal alerts',
    text: content.text,
    html: content.html,
  });
}

/** Public website origin for links rendered inside email bodies. */
export const websiteUrl = appBaseUrl() || 'https://www.successcodeacademy.in';

/** Where academy announcements originate, used in the footer copy. */
export const brand = {
  name: 'Success Code Academy',
  website: websiteUrl,
  phone: '+91 86004 70850',
};

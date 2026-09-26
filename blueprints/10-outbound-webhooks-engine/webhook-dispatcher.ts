/**
 * Universal Outbound Webhook Dispatcher
 * Signs payloads with HMAC-SHA256, protects against SSRF attacks, and dispatches HTTP requests.
 */

import crypto from 'crypto';

export interface WebhookDispatchJob {
  deliveryId: string;
  endpointUrl: string;
  secretKey: string;
  eventType: string;
  payload: Record<string, any>;
}

export interface DispatchResult {
  success: boolean;
  httpStatus?: number;
  durationMs: number;
  error?: string;
}

export class WebhookDispatcher {
  // Signs payload according to the standard X-Hub-Signature-256 specification
  static signPayload(payloadJson: string, secretKey: string, timestamp: number): string {
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(`${timestamp}.${payloadJson}`)
      .digest('hex');
    return `t=${timestamp},v1=${signature}`;
  }

  // SSRF Protection: Blocks private RFC 1918 and loopback IPs
  static isUrlSafe(targetUrl: string): boolean {
    try {
      const parsed = new URL(targetUrl);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
      const host = parsed.hostname.toLowerCase();
      if (host === 'localhost' || host === '127.0.0.1' || host === '169.254.169.254') return false;
      if (host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.16.')) return false;
      return true;
    } catch {
      return false;
    }
  }

  static async dispatch(job: WebhookDispatchJob, timeoutMs: number = 5000): Promise<DispatchResult> {
    if (!this.isUrlSafe(job.endpointUrl)) {
      return {
        success: false,
        durationMs: 0,
        error: 'Security Error: Webhook destination resolves to an unauthorized private or local IP.',
      };
    }

    const payloadJson = JSON.stringify(job.payload);
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureHeader = this.signPayload(payloadJson, job.secretKey, timestamp);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const startTime = Date.now();

    try {
      const response = await fetch(job.endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SaaS-Master-Webhook-Engine/1.0',
          'X-Webhook-ID': job.deliveryId,
          'X-Webhook-Event': job.eventType,
          'X-Webhook-Timestamp': timestamp.toString(),
          'X-Webhook-Signature': signatureHeader,
        },
        body: payloadJson,
        signal: controller.signal,
      });

      const durationMs = Date.now() - startTime;
      return {
        success: response.ok,
        httpStatus: response.status,
        durationMs,
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      return {
        success: false,
        durationMs,
        error: err.name === 'AbortError' ? 'Webhook delivery timed out' : err.message,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

/**
 * Structured Correlation Logger & OpenTelemetry Context Tracing
 * Injects request correlation IDs across web, mobile, and backend microservices.
 */

import crypto from 'crypto';

export interface StructuredLogPayload {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  correlationId: string;
  organizationId?: string;
  userId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export class StructuredLogger {
  static getCorrelationId(incomingHeader?: string): string {
    return incomingHeader || crypto.randomUUID();
  }

  static log(payload: StructuredLogPayload) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...payload,
    };

    const jsonStr = JSON.stringify(logEntry);

    if (payload.level === 'error') {
      console.error(jsonStr);
    } else if (payload.level === 'warn') {
      console.warn(jsonStr);
    } else {
      console.log(jsonStr);
    }
  }
}

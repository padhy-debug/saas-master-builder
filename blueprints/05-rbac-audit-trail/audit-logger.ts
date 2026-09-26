/**
 * Tamper-Resistant Audit Logger Service
 * Computes cryptographic hash chain for every audit record to ensure integrity.
 */

import crypto from 'crypto';
import { Pool } from 'pg';

export interface AuditEntry {
  organizationId: string;
  actorId?: string;
  actorEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditLogger {
  private db: Pool;

  constructor(pool: Pool) {
    this.db = pool;
  }

  async log(entry: AuditEntry): Promise<string> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // 1. Fetch latest record hash for this organization (chain root)
      const lastRes = await client.query(
        `SELECT record_hash FROM audit_logs WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1;`,
        [entry.organizationId]
      );
      const prevHash = lastRes.rows.length > 0 ? lastRes.rows[0].record_hash : '0'.repeat(64);

      // 2. Compute current record SHA-256 hash
      const timestamp = new Date().toISOString();
      const hashPayload = `${prevHash}|${entry.organizationId}|${entry.actorId || ''}|${entry.action}|${entry.resourceType}|${entry.resourceId || ''}|${timestamp}`;
      const recordHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

      // 3. Insert append-only record
      const insertRes = await client.query(
        `
        INSERT INTO audit_logs (
          organization_id, actor_id, actor_email, action, resource_type,
          resource_id, metadata, ip_address, user_agent, prev_hash, record_hash, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id;
        `,
        [
          entry.organizationId,
          entry.actorId,
          entry.actorEmail,
          entry.action,
          entry.resourceType,
          entry.resourceId,
          JSON.stringify(entry.metadata || {}),
          entry.ipAddress,
          entry.userAgent,
          prevHash,
          recordHash,
          timestamp,
        ]
      );

      await client.query('COMMIT');
      return insertRes.rows[0].id;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[Audit Log Failure]:', err);
      throw err;
    } finally {
      client.release();
    }
  }
}

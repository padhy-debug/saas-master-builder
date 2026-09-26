/**
 * Secure Developer API Key Generation & Verification Service
 * Format: smb_live_<8_char_prefix>_<32_char_random_secret>
 * Storage: Only SHA-256 hash is persisted in the database.
 */

import crypto from 'crypto';
import { Pool } from 'pg';

export interface GeneratedKeyResult {
  id: string;
  name: string;
  rawApiKey: string; // ONLY returned once upon generation; never viewable again!
  prefix: string;
  scopes: string[];
}

export interface VerifiedKeyPayload {
  organizationId: string;
  keyId: string;
  scopes: string[];
  rateLimitPerMinute: number;
}

export class APIKeyService {
  private db: Pool;

  constructor(pool: Pool) {
    this.db = pool;
  }

  static hashSecret(rawKey: string): string {
    return crypto.createHash('sha256').update(rawKey).digest('hex');
  }

  async generateKey(orgId: string, name: string, scopes: string[] = ['read']): Promise<GeneratedKeyResult> {
    const randomHex = crypto.randomBytes(24).toString('hex');
    const prefix = `smb_live_${randomHex.substring(0, 8)}`;
    const secret = randomHex.substring(8);
    const rawApiKey = `${prefix}_${secret}`;
    const hashedSecret = APIKeyService.hashSecret(rawApiKey);

    const res = await this.db.query(
      `
      INSERT INTO api_keys (organization_id, name, key_prefix, hashed_secret, scopes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
      `,
      [orgId, name, prefix, hashedSecret, scopes]
    );

    return {
      id: res.rows[0].id,
      name,
      rawApiKey,
      prefix,
      scopes,
    };
  }

  async verifyKey(rawApiKey: string, requiredScope?: string): Promise<VerifiedKeyPayload | null> {
    if (!rawApiKey || !rawApiKey.startsWith('smb_live_')) return null;

    const parts = rawApiKey.split('_');
    if (parts.length < 4) return null;

    const prefix = `${parts[0]}_${parts[1]}_${parts[2]}`;
    const incomingHash = APIKeyService.hashSecret(rawApiKey);

    const res = await this.db.query(
      `
      SELECT id, organization_id, hashed_secret, scopes, rate_limit_per_minute, expires_at, is_revoked
      FROM api_keys
      WHERE key_prefix = $1 AND is_revoked = FALSE;
      `,
      [prefix]
    );

    if (res.rows.length === 0) return null;
    const record = res.rows[0];

    // Expiration Check
    if (record.expires_at && new Date() > new Date(record.expires_at)) {
      return null;
    }

    // Timing-safe comparison to prevent timing attacks
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(incomingHash),
      Buffer.from(record.hashed_secret)
    );

    if (!isMatch) return null;

    // Scope check
    if (requiredScope && !record.scopes.includes(requiredScope) && !record.scopes.includes('admin')) {
      throw new Error(`API Key lacks required scope: '${requiredScope}'.`);
    }

    // Update last_used_at asynchronously (fire and forget)
    this.db.query('UPDATE api_keys SET last_used_at = NOW() WHERE id = $1;', [record.id]).catch(() => {});

    return {
      organizationId: record.organization_id,
      keyId: record.id,
      scopes: record.scopes,
      rateLimitPerMinute: record.rate_limit_per_minute,
    };
  }
}

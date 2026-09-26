/**
 * Enterprise Superadmin Impersonation Token Guard
 * Issues and validates short-lived, tamper-resistant impersonation session tokens.
 */

import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose';
import { Pool } from 'pg';

export interface ImpersonationRequest {
  adminUserId: string;
  adminEmail: string;
  targetTenantId: string;
  targetUserId: string;
  ticketId: string; // e.g. "TICKET-1049"
  reason: string;
  ttlMinutes?: number; // max 60
}

export class EnterpriseImpersonationGuard {
  private privateKeyPem: string;
  private publicKeyPem: string;
  private db: Pool;

  constructor(privateKeyPem: string, publicKeyPem: string, dbPool: Pool) {
    this.privateKeyPem = privateKeyPem;
    this.publicKeyPem = publicKeyPem;
    this.db = dbPool;
  }

  async createImpersonationToken(req: ImpersonationRequest): Promise<string> {
    if (!req.ticketId || !req.reason) {
      throw new Error('Enterprise Policy: Impersonation requires a valid support ticket ID and justification reason.');
    }

    const ttl = Math.min(req.ttlMinutes || 30, 60); // Hard cap at 60 mins
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ttl * 60;

    // 1. Audit Log Entry BEFORE issuing token
    await this.db.query(
      `
      INSERT INTO audit_logs (
        organization_id, actor_id, actor_email, action, resource_type, resource_id, metadata, record_hash
      ) VALUES ($1, $2, $3, 'superadmin.impersonation_started', 'tenant', $1, $4, 'IMPERSONATION_START');
      `,
      [
        req.targetTenantId,
        req.adminUserId,
        req.adminEmail,
        JSON.stringify({ ticketId: req.ticketId, reason: req.reason, targetUserId: req.targetUserId, ttlMinutes: ttl }),
      ]
    );

    // 2. Sign Ephemeral Token with Asymmetric Ed25519 Key
    const privateKey = await importPKCS8(this.privateKeyPem, 'EdDSA');
    return await new SignJWT({
      sub: req.targetUserId,
      impersonated_by: req.adminUserId,
      impersonator_email: req.adminEmail,
      organization_id: req.targetTenantId,
      is_impersonation: true,
      ticket_id: req.ticketId,
      reason: req.reason,
    })
      .setProtectedHeader({ alg: 'EdDSA' })
      .setIssuedAt(now)
      .setExpirationTime(exp)
      .setIssuer('saas-master-enterprise-auth')
      .sign(privateKey);
  }

  async verifyImpersonationToken(token: string): Promise<any> {
    const publicKey = await importSPKI(this.publicKeyPem, 'EdDSA');
    const { payload } = await jwtVerify(token, publicKey, {
      issuer: 'saas-master-enterprise-auth',
    });
    return payload;
  }
}

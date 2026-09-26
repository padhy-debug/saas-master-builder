import { Pool } from 'pg';
import crypto from 'crypto';

/**
 * SaaS Master Builder - Blueprint 20: GDPR/CCPA Tenant Offboarding Engine
 * Handles lawful tenant decommissioning, S3 prefix cleanup, Stripe cancellation,
 * PostgreSQL cascade scrubbing, session revocation, and Certificate of Destruction generation.
 */

export interface ErasureCertificate {
  certificateId: string;
  organizationId: string;
  requestedByUserId: string;
  timestamp: string;
  recordsSummary: Record<string, any>;
  cryptographicSignature: string;
}

export class TenantOffboardingService {
  constructor(
    private pool: Pool,
    private s3Client?: { deleteObjectsByPrefix: (prefix: string) => Promise<number> },
    private stripeClient?: { cancelCustomerSubscriptions: (customerId: string) => Promise<void> },
    private redisClient?: { deleteKeysByPattern: (pattern: string) => Promise<number> },
    private complianceSigningSecret: string = process.env.COMPLIANCE_SIGNING_KEY || 'default-compliance-key-change-in-prod'
  ) {}

  /**
   * Execute full tenant offboarding and erasure workflow
   */
  async executeTenantErasure(params: {
    organizationId: string;
    requestedByUserId: string;
    stripeCustomerId?: string;
  }): Promise<ErasureCertificate> {
    const { organizationId, requestedByUserId, stripeCustomerId } = params;
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Log erasure request start
      const requestRes = await client.query(
        `INSERT INTO tenant_erasure_requests (organization_id, requested_by_user_id, status)
         VALUES ($1, $2, 'PROCESSING')
         RETURNING id`,
        [organizationId, requestedByUserId]
      );
      const erasureRequestId = requestRes.rows[0].id;

      // 2. Cancel Stripe subscription if applicable
      if (stripeCustomerId && this.stripeClient) {
        try {
          await this.stripeClient.cancelCustomerSubscriptions(stripeCustomerId);
        } catch (err: any) {
          // Log and continue or bubble if critical
          process.stderr.write(`Stripe cancellation notice: ${err.message}\n`);
        }
      }

      // 3. Purge storage bucket assets
      let purgedS3ObjectsCount = 0;
      if (this.s3Client) {
        purgedS3ObjectsCount = await this.s3Client.deleteObjectsByPrefix(`tenants/${organizationId}/`);
      }

      // 4. Invalidate Redis sessions and API keys
      let invalidatedSessionCount = 0;
      if (this.redisClient) {
        invalidatedSessionCount = await this.redisClient.deleteKeysByPattern(`sess:tenant:${organizationId}:*`);
        await this.redisClient.deleteKeysByPattern(`ratelimit:${organizationId}:*`);
      }

      // 5. Execute DB cascade purge & PII anonymization
      const dbPurgeRes = await client.query(
        `SELECT purge_tenant_data_cascade($1) as summary`,
        [organizationId]
      );
      const dbSummary = dbPurgeRes.rows[0]?.summary || {};

      // 6. Generate Certificate of Destruction
      const timestamp = new Date().toISOString();
      const certificateId = `CERT-ERASURE-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

      const certificatePayload = {
        certificateId,
        organizationId,
        requestedByUserId,
        timestamp,
        recordsSummary: {
          ...dbSummary,
          s3ObjectsDeleted: purgedS3ObjectsCount,
          redisSessionsRevoked: invalidatedSessionCount,
        },
      };

      const signature = crypto
        .createHmac('sha256', this.complianceSigningSecret)
        .update(JSON.stringify(certificatePayload))
        .digest('hex');

      // 7. Update erasure request status with certificate
      await client.query(
        `UPDATE tenant_erasure_requests
         SET status = 'COMPLETED',
             certificate_id = $1,
             records_scrubbed_count = $2,
             completed_at = NOW()
         WHERE id = $3`,
        [certificateId, (dbSummary.scrubbed_pii_users || 0) + (dbSummary.deleted_file_records || 0), erasureRequestId]
      );

      await client.query('COMMIT');

      return {
        ...certificatePayload,
        cryptographicSignature: signature,
      };
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw new Error(`Tenant erasure failed for organization ${organizationId}: ${error.message}`);
    } finally {
      client.release();
    }
  }
}

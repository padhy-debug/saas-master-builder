/**
 * SCIM 2.0 (System for Cross-domain Identity Management) User Sync Endpoint
 * Automates employee onboarding and instant deprovisioning from Okta/Azure AD.
 */

import { Pool } from 'pg';

export interface SCIMUserPayload {
  schemas: string[];
  userName: string;
  name?: {
    formatted?: string;
    familyName?: string;
    givenName?: string;
  };
  emails?: Array<{ value: string; primary?: boolean }>;
  active?: boolean;
}

export class SCIMProvisioningService {
  private db: Pool;

  constructor(pool: Pool) {
    this.db = pool;
  }

  async handleUserCreate(tenantId: string, scimUser: SCIMUserPayload) {
    const email = scimUser.userName || (scimUser.emails && scimUser.emails[0]?.value);
    if (!email) throw new Error('SCIM Error: userName or email is required.');

    const fullName = scimUser.name?.formatted || `${scimUser.name?.givenName || ''} ${scimUser.name?.familyName || ''}`.trim();
    const active = scimUser.active !== false;

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Upsert global user
      const userRes = await client.query(
        `
        INSERT INTO users (email, full_name)
        VALUES ($1, $2)
        ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
        RETURNING id;
        `,
        [email.toLowerCase(), fullName]
      );
      const userId = userRes.rows[0].id;

      // Upsert membership
      if (active) {
        await client.query(
          `
          INSERT INTO memberships (organization_id, user_id, role)
          VALUES ($1, $2, 'member')
          ON CONFLICT (organization_id, user_id) DO NOTHING;
          `,
          [tenantId, userId]
        );
      }

      await client.query('COMMIT');
      return { id: userId, userName: email, active };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async handleUserDeprovision(tenantId: string, userId: string) {
    // Instant offboarding: Remove membership immediately
    await this.db.query(
      `DELETE FROM memberships WHERE organization_id = $1 AND user_id = $2;`,
      [tenantId, userId]
    );
    return { success: true, message: 'User access revoked.' };
  }
}

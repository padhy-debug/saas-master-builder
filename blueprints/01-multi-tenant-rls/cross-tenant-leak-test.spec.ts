/**
 * Vitest / Jest Automated Cross-Tenant Data Isolation Test Suite
 * Simulates adversarial tenant queries to prove ZERO data leakage across customer boundaries.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';

const testDbPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/saas_test_db',
});

describe('Cross-Tenant Data Isolation Gate (RLS)', () => {
  const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
  const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';
  let projectTenantBId: string;

  beforeAll(async () => {
    // Seed Tenant A and Tenant B
    await testDbPool.query(`
      INSERT INTO organizations (id, name, slug) VALUES 
      ('${TENANT_A_ID}', 'Tenant Alpha', 'tenant-alpha'),
      ('${TENANT_B_ID}', 'Tenant Beta', 'tenant-beta')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Create a confidential project belonging strictly to Tenant B
    const res = await testDbPool.query(`
      INSERT INTO projects (organization_id, name, description) 
      VALUES ('${TENANT_B_ID}', 'Top Secret Beta Roadmap', 'Classified information')
      RETURNING id;
    `);
    projectTenantBId = res.rows[0].id;
  });

  afterAll(async () => {
    await testDbPool.query(`DELETE FROM organizations WHERE id IN ('${TENANT_A_ID}', '${TENANT_B_ID}');`);
    await testDbPool.end();
  });

  it('CRITICAL: Tenant A MUST NOT see or query Tenant B projects', async () => {
    const client = await testDbPool.connect();
    try {
      await client.query('BEGIN');
      // Set session to Tenant A
      await client.query(`SET LOCAL app.current_tenant_id = '${TENANT_A_ID}';`);

      // Attempt to query all projects
      const result = await client.query('SELECT * FROM projects;');
      const leakedBetaProject = result.rows.find((r) => r.id === projectTenantBId);

      expect(leakedBetaProject).toBeUndefined();
      await client.query('COMMIT');
    } finally {
      client.release();
    }
  });

  it('CRITICAL: Tenant A direct SELECT by Tenant B ID returns ZERO rows', async () => {
    const client = await testDbPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.current_tenant_id = '${TENANT_A_ID}';`);

      const result = await client.query(`SELECT * FROM projects WHERE id = '${projectTenantBId}';`);
      expect(result.rows.length).toBe(0);

      await client.query('COMMIT');
    } finally {
      client.release();
    }
  });

  it('CRITICAL: Tenant A cannot UPDATE Tenant B project even if ID is known', async () => {
    const client = await testDbPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.current_tenant_id = '${TENANT_A_ID}';`);

      const updateResult = await client.query(
        `UPDATE projects SET name = 'Hacked' WHERE id = '${projectTenantBId}';`
      );
      expect(updateResult.rowCount).toBe(0);

      await client.query('COMMIT');
    } finally {
      client.release();
    }
  });

  it('CRITICAL: Tenant A cannot DELETE Tenant B project', async () => {
    const client = await testDbPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.current_tenant_id = '${TENANT_A_ID}';`);

      const deleteResult = await client.query(
        `DELETE FROM projects WHERE id = '${projectTenantBId}';`
      );
      expect(deleteResult.rowCount).toBe(0);

      await client.query('COMMIT');
    } finally {
      client.release();
    }
  });
});

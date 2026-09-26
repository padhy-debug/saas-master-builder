/**
 * Prisma Extension for Automated PostgreSQL Row-Level Security (RLS)
 * Guarantees that every query executed within a tenant context automatically sets
 * `app.current_tenant_id` at the PostgreSQL session level.
 */

import { PrismaClient } from '@prisma/client';

export function createTenantPrismaClient(tenantId: string, basePrisma: PrismaClient) {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('[SaaS Master Security] Cannot initialize tenant DB client without a valid tenantId.');
  }

  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          // Execute inside an isolated transaction with the session variable set
          return basePrisma.$transaction(async (tx) => {
            // SET LOCAL scopes the setting to this transaction only
            await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId.replace(/'/g, "''")}';`);
            return query(args);
          });
        },
      },
    },
  });
}

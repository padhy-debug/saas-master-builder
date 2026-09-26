import { pgTable, uuid, varchar, text, timestamp, bigint, index, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Organizations (Tenants)
 */
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  planTier: varchar('plan_tier', { length: 50 }).default('free').notNull(),
  subscriptionStatus: varchar('subscription_status', { length: 50 }).default('trialing').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Users (Global Identities)
 */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Organization Memberships (RBAC)
 */
export const memberships = pgTable('memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).default('member').notNull(), // 'owner' | 'admin' | 'member' | 'billing'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  orgUserIdx: index('idx_memberships_org_user').on(table.organizationId, table.userId),
  unqOrgUser: unique('unq_memberships_org_user').on(table.organizationId, table.userId),
}));

/**
 * Tenant-Scoped Entity: Projects
 * Always requires organizationId
 */
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('idx_projects_org_id').on(table.organizationId),
}));

/**
 * Tenant-Scoped Entity: Invoices
 */
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }).unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('idx_invoices_org_id').on(table.organizationId),
}));

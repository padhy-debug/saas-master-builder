-- ========================================================================
-- PRODUCTION MULTI-TENANT POSTGRESQL SCHEMA WITH ROW-LEVEL SECURITY (RLS)
-- SaaS Master Builder Verified Blueprint
-- ========================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Organizations / Tenants Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan_tier VARCHAR(50) DEFAULT 'free' NOT NULL, -- 'free', 'pro', 'enterprise'
    subscription_status VARCHAR(50) DEFAULT 'trialing' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Users Table (Global Identity)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Memberships (Users <-> Organizations with RBAC)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' NOT NULL, -- 'owner', 'admin', 'member', 'billing'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_org_user ON memberships(organization_id, user_id);

-- 5. Tenant-Owned Business Entity Example: Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(organization_id);

-- 6. Tenant-Owned Financial Entity Example: Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'paid', 'open', 'void', 'uncollectible'
    stripe_invoice_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(organization_id);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures NO tenant can ever read or mutate another tenant's records!
-- ========================================================================

-- Helper function to safely read the session tenant ID
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Enable RLS on Tenant-Scoped Tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners (prevents accidental bypass)
ALTER TABLE projects FORCE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;

-- Policy: Projects
CREATE POLICY tenant_isolation_projects ON projects
    FOR ALL
    USING (organization_id = current_tenant_id())
    WITH CHECK (organization_id = current_tenant_id());

-- Policy: Invoices
CREATE POLICY tenant_isolation_invoices ON invoices
    FOR ALL
    USING (organization_id = current_tenant_id())
    WITH CHECK (organization_id = current_tenant_id());

-- Policy: Memberships (Allow user to see members of their own active organization)
CREATE POLICY tenant_isolation_memberships ON memberships
    FOR ALL
    USING (organization_id = current_tenant_id());

-- ========================================================================
-- USAGE IN APPLICATION QUERY / TRANSACTION:
-- 
-- BEGIN;
-- SET LOCAL app.current_tenant_id = 'e74d32e9-4e3f-4e92-93ec-e5c9b7348e3a';
-- SELECT * FROM projects; -- Only returns projects for this tenant!
-- COMMIT;
-- ========================================================================

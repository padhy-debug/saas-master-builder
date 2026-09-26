-- ========================================================================
-- DEVELOPER API KEY MANAGEMENT SCHEMA
-- SaaS Master Builder Verified Blueprint
-- Never stores raw API keys. Stores SHA-256 hash with searchable prefix.
-- ========================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL, -- e.g. 'smb_live_9f82' (First 12-16 chars for fast lookup)
    hashed_secret VARCHAR(64) NOT NULL, -- SHA-256 hash of the full secret token
    scopes TEXT[] DEFAULT '{"read"}' NOT NULL, -- 'read', 'write', 'admin', 'billing'
    rate_limit_per_minute INT DEFAULT 60 NOT NULL,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_revoked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_keys_lookup ON api_keys(key_prefix, is_revoked);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);

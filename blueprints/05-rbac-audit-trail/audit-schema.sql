-- ========================================================================
-- IMMUTABLE APPEND-ONLY AUDIT LOG SCHEMA WITH CRYPTOGRAPHIC HASH CHAIN
-- SaaS Master Builder Verified Blueprint
-- SOC 2 Type II, ISO 27001, and HIPAA compliance ready
-- ========================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id),
    actor_email VARCHAR(255),
    action VARCHAR(100) NOT NULL, -- e.g. 'user.invite', 'billing.card_update', 'project.delete'
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    prev_hash VARCHAR(64), -- SHA-256 hash of the immediately preceding record
    record_hash VARCHAR(64) NOT NULL, -- SHA-256(prev_hash + actor_id + action + timestamp)
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_org_action ON audit_logs(organization_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);

-- PREVENT UPDATE OR DELETE ON AUDIT LOGS (APPEND-ONLY ENFORCEMENT)
CREATE OR REPLACE FUNCTION prevent_audit_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable. UPDATE or DELETE operations are strictly prohibited for compliance.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_immutable_audit_logs ON audit_logs;
CREATE TRIGGER trigger_immutable_audit_logs
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_tampering();

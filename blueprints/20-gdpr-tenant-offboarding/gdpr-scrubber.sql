-- ============================================================================
-- SaaS Master Builder - Blueprint 20: GDPR/CCPA Tenant Offboarding & Data Scrubbing
-- Gapless fiscal preservation with complete PII anonymization and tenant data purging.
-- ============================================================================

-- Track tenant offboarding / erasure requests
CREATE TABLE IF NOT EXISTS tenant_erasure_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    requested_by_user_id UUID NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    certificate_id VARCHAR(64) UNIQUE,
    records_scrubbed_count INT DEFAULT 0,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_tenant_erasure_org ON tenant_erasure_requests(organization_id);

-- Function: Anonymize user PII while preserving referential integrity
CREATE OR REPLACE FUNCTION anonymize_tenant_pii(p_tenant_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_scrubbed_count INT := 0;
    v_users_affected INT := 0;
BEGIN
    -- 1. Anonymize user records
    WITH scrubbed AS (
        UPDATE users
        SET 
            email = 'anonymized-' || id || '@erased.local',
            name = 'Erased Customer',
            phone_number = NULL,
            avatar_url = NULL,
            metadata = '{}'::jsonb,
            updated_at = NOW()
        WHERE organization_id = p_tenant_id
        RETURNING id
    )
    SELECT COUNT(*) INTO v_users_affected FROM scrubbed;

    v_scrubbed_count := v_scrubbed_count + v_users_affected;

    -- 2. Scrub tenant profile
    UPDATE organizations
    SET 
        name = 'Erased Organization (' || p_tenant_id || ')',
        billing_email = 'billing@erased.local',
        metadata = jsonb_build_object('erased_at', NOW()),
        updated_at = NOW()
    WHERE id = p_tenant_id;

    RETURN v_scrubbed_count;
END;
$$;

-- Function: Cascade purge non-fiscal tenant data
-- Invoices and fiscal records are retained (anonymized) to comply with statutory fiscal laws (Law 8).
CREATE OR REPLACE FUNCTION purge_tenant_data_cascade(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_purged_notifications INT := 0;
    v_purged_uploads INT := 0;
    v_purged_exports INT := 0;
    v_scrubbed_pii INT := 0;
    v_summary JSONB;
BEGIN
    -- 1. Anonymize PII first
    v_scrubbed_pii := anonymize_tenant_pii(p_tenant_id);

    -- 2. Delete ephemeral notifications
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        WITH deleted AS (
            DELETE FROM notifications WHERE organization_id = p_tenant_id RETURNING id
        )
        SELECT COUNT(*) INTO v_purged_notifications FROM deleted;
    END IF;

    -- 3. Delete export jobs
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'export_jobs') THEN
        WITH deleted AS (
            DELETE FROM export_jobs WHERE organization_id = p_tenant_id RETURNING id
        )
        SELECT COUNT(*) INTO v_purged_exports FROM deleted;
    END IF;

    -- 4. Delete file metadata
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'storage_files') THEN
        WITH deleted AS (
            DELETE FROM storage_files WHERE organization_id = p_tenant_id RETURNING id
        )
        SELECT COUNT(*) INTO v_purged_uploads FROM deleted;
    END IF;

    -- 5. Mark organization inactive
    UPDATE organizations
    SET is_active = FALSE,
        status = 'DELETED'
    WHERE id = p_tenant_id;

    v_summary := jsonb_build_object(
        'scrubbed_pii_users', v_scrubbed_pii,
        'deleted_notifications', v_purged_notifications,
        'deleted_exports', v_purged_exports,
        'deleted_file_records', v_purged_uploads,
        'timestamp', NOW()
    );

    RETURN v_summary;
END;
$$;

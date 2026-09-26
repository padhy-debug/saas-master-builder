-- ========================================================================
-- OUTBOUND WEBHOOKS & EVENT DISPATCHING SCHEMA
-- SaaS Master Builder Verified Blueprint
-- Supports customer webhook subscriptions, HMAC secrets, and delivery logs
-- ========================================================================

CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    secret_key VARCHAR(64) NOT NULL, -- Hex-encoded HMAC secret (whsec_...)
    subscribed_events TEXT[] NOT NULL, -- e.g. ['order.created', 'user.invited', 'invoice.paid']
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    consecutive_failures INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_org ON webhook_endpoints(organization_id, is_active);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    http_status INT,
    response_body TEXT,
    error_message TEXT,
    duration_ms INT,
    attempt INT DEFAULT 1 NOT NULL,
    status VARCHAR(50) DEFAULT 'success' NOT NULL, -- 'success', 'failed'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint ON webhook_deliveries(endpoint_id, created_at DESC);

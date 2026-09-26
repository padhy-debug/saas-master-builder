-- ========================================================================
-- STRIPE WEBHOOK IDEMPOTENCY & SUBSCRIPTION SCHEMA
-- SaaS Master Builder Verified Blueprint
-- Prevents double-charging, duplicate provisioning, and webhook replay attacks
-- ========================================================================

CREATE TABLE IF NOT EXISTS processed_webhook_events (
    event_id VARCHAR(255) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    provider VARCHAR(50) DEFAULT 'stripe' NOT NULL,
    status VARCHAR(50) DEFAULT 'processing' NOT NULL, -- 'processing', 'completed', 'failed'
    attempts INT DEFAULT 1 NOT NULL,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_processed_events_type ON processed_webhook_events(event_type);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_price_id VARCHAR(255),
    plan_tier VARCHAR(50) DEFAULT 'free' NOT NULL,
    status VARCHAR(50) DEFAULT 'trialing' NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE NOT NULL,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);

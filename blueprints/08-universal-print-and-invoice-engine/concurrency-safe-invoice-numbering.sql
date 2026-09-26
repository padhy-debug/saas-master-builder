-- ========================================================================
-- CONCURRENCY-SAFE ZERO-GAP FISCAL INVOICE SEQUENCE GENERATOR
-- SaaS Master Builder Verified Blueprint
-- Prevents race conditions during simultaneous checkouts and avoids tax audit penalties
-- ========================================================================

CREATE TABLE IF NOT EXISTS fiscal_sequences (
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    financial_year VARCHAR(10) NOT NULL, -- e.g. '2026-2027'
    document_type VARCHAR(20) NOT NULL,  -- e.g. 'INV', 'LAB_REPORT', 'RECEIPT', 'ORDER'
    current_val BIGINT DEFAULT 0 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (organization_id, financial_year, document_type)
);

CREATE INDEX IF NOT EXISTS idx_fiscal_seq_lookup 
ON fiscal_sequences(organization_id, financial_year, document_type);

-- Function: Atomic Sequence Fetch & Increment
-- Locks the row exclusively (FOR UPDATE) so concurrent transactions queue up cleanly
CREATE OR REPLACE FUNCTION get_next_fiscal_number(
    p_organization_id UUID,
    p_financial_year VARCHAR,
    p_document_type VARCHAR
) RETURNS TEXT AS $$
DECLARE
    v_next_val BIGINT;
    v_formatted_id TEXT;
BEGIN
    -- Upsert and atomically increment sequence counter
    INSERT INTO fiscal_sequences (organization_id, financial_year, document_type, current_val, updated_at)
    VALUES (p_organization_id, p_financial_year, p_document_type, 1, NOW())
    ON CONFLICT (organization_id, financial_year, document_type)
    DO UPDATE SET 
        current_val = fiscal_sequences.current_val + 1,
        updated_at = NOW()
    RETURNING current_val INTO v_next_val;

    -- Return standardized fiscal string: DOC_TYPE/FIN_YEAR/000001
    v_formatted_id := p_document_type || '/' || p_financial_year || '/' || LPAD(v_next_val::TEXT, 6, '0');
    RETURN v_formatted_id;
END;
$$ LANGUAGE plpgsql STRICT;

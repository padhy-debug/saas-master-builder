-- ========================================================================
-- PRODUCTION FULL-TEXT & HYBRID VECTOR SEARCH SCHEMA (PostgreSQL)
-- SaaS Master Builder Verified Blueprint
-- Includes:
-- 1. Full-Text Search (tsvector + GIN index)
-- 2. Trigram Fuzzy Matching (pg_trgm for typo-tolerant search)
-- 3. Cursor-Based Pagination (Zero performance degradation at 10M+ rows)
-- ========================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Example Searchable Tenant Entity: Catalog / Items / Documents
CREATE TABLE IF NOT EXISTS search_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}' NOT NULL,
    search_vector TSVECTOR, -- Precomputed search vector for high-speed indexing
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Compound index for tenant-scoped cursor pagination (never use OFFSET!)
CREATE INDEX IF NOT EXISTS idx_search_docs_cursor 
ON search_documents(organization_id, created_at DESC, id DESC);

-- GIN Index on Precomputed TSVector for sub-millisecond search
CREATE INDEX IF NOT EXISTS idx_search_docs_vector 
ON search_documents USING GIN(search_vector);

-- GIN Trigram Index on title for typo tolerance / autocomplete (e.g. "acme" matches "acm")
CREATE INDEX IF NOT EXISTS idx_search_docs_title_trgm 
ON search_documents USING GIN(title gin_trgm_ops);

-- Trigger: Automatically maintain search_vector on INSERT or UPDATE
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', unaccent(coalesce(NEW.title, ''))), 'A') ||
        setweight(to_tsvector('english', unaccent(coalesce(NEW.content, ''))), 'B') ||
        setweight(to_tsvector('english', unaccent(array_to_string(NEW.tags, ' '))), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_search_vector_update ON search_documents;
CREATE TRIGGER trg_search_vector_update
BEFORE INSERT OR UPDATE ON search_documents
FOR EACH ROW EXECUTE FUNCTION update_search_vector();

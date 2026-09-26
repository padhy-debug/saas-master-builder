# 26: High-Performance Search and pgvector Architecture

> Reference standard for building sub-50ms hybrid full-text and semantic vector search in PostgreSQL without external cluster maintenance.

---

## 1. Architectural Overview

Every modern SaaS application requires fast, multi-tenant search. Relying on an external Elasticsearch or OpenSearch cluster introduces heavy operational overhead, synchronization lag, and cross-system isolation risks.

PostgreSQL provides a unified, production-grade hybrid search stack:
- **`pg_trgm`**: Fuzzy search, typo-tolerant prefix/suffix matching via trigram GIN indexes.
- **`tsvector` / `tsquery`**: Stemmed full-text search with BM25-like lexical ranking.
- **`pgvector` (HNSW)**: Approximate Nearest Neighbor (ANN) cosine/inner-product semantic vector search.
- **Reciprocal Rank Fusion (RRF)**: Merges lexical and semantic scores into a unified ranking formula.

---

## 2. Multi-Tenant Indexing Strategy

To prevent cross-tenant index contention and ensure Row-Level Security compliance:

```sql
-- Compound GIN index for tenant-scoped text search
CREATE INDEX idx_products_tenant_search 
ON products 
USING GIN (organization_id, search_vector);

-- HNSW Vector Index for semantic similarity
CREATE INDEX idx_knowledge_embeddings_hnsw 
ON knowledge_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

---

## 3. Reciprocal Rank Fusion (RRF) Formula

When combining lexical and vector search results:
$$\text{RRF Score} = \frac{1}{60 + \text{Rank}_{\text{lexical}}} + \frac{1}{60 + \text{Rank}_{\text{vector}}}$$

This prevents vector search from overpowering exact keyword matches (e.g. SKU numbers or email addresses) while keeping semantic relevance high.

---

## 4. Production Checklist

- [ ] All search queries enforce `organization_id = current_tenant_id()`.
- [ ] Trigram indexes use `gin_trgm_ops` for `LIKE '%term%'` acceleration.
- [ ] Embedding column dimensions (e.g. 1536 for OpenAI `text-embedding-3-small`) are strictly typed in PostgreSQL.
- [ ] Search queries set a strict `timeout` (`SET LOCAL statement_timeout = '250ms'`) to prevent denial-of-service via expensive regexes.

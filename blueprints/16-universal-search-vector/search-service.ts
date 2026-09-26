/**
 * High-Performance Search Service with Cursor Pagination
 * Uses PostgreSQL tsvector and pg_trgm for typo-tolerant, multi-tenant searches.
 */

import { Pool } from 'pg';

export interface SearchQueryOptions {
  organizationId: string;
  query: string;
  limit?: number; // max 100
  cursor?: {
    createdAt: string;
    id: string;
  };
}

export interface SearchResultItem {
  id: string;
  title: string;
  snippet: string;
  rank: number;
  createdAt: string;
}

export interface PaginatedSearchResponse {
  items: SearchResultItem[];
  nextCursor?: {
    createdAt: string;
    id: string;
  };
  hasMore: boolean;
}

export class UniversalSearchService {
  private db: Pool;

  constructor(pool: Pool) {
    this.db = pool;
  }

  // Sanitizes user query for plain-text search (prevents operator injection syntax errors)
  static sanitizeSearchQuery(rawQuery: string): string {
    return rawQuery
      .trim()
      .replace(/[!&|():*<>]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0)
      .join(' & ');
  }

  async search(opts: SearchQueryOptions): Promise<PaginatedSearchResponse> {
    const limit = Math.min(opts.limit || 20, 100);
    const sanitizedFts = UniversalSearchService.sanitizeSearchQuery(opts.query);

    let sql = `
      SELECT 
        id, 
        title, 
        ts_headline('english', content, plainto_tsquery('english', $2), 'MaxWords=25, MinWords=10') as snippet,
        ts_rank(search_vector, plainto_tsquery('english', $2)) + similarity(title, $3) as rank,
        created_at
      FROM search_documents
      WHERE organization_id = $1
    `;

    const params: any[] = [opts.organizationId, sanitizedFts || opts.query, opts.query];

    // Filter by search terms
    if (sanitizedFts) {
      sql += ` AND (search_vector @@ plainto_tsquery('english', $2) OR title % $3)`;
    }

    // Cursor Pagination (Keyset Pagination) - O(1) performance regardless of offset!
    if (opts.cursor) {
      params.push(opts.cursor.createdAt, opts.cursor.id);
      sql += ` AND (created_at, id) < ($${params.length - 1}::timestamptz, $${params.length}::uuid)`;
    }

    sql += ` ORDER BY created_at DESC, id DESC LIMIT ${limit + 1};`;

    const result = await this.db.query(sql, params);
    const hasMore = result.rows.length > limit;
    const items = result.rows.slice(0, limit);

    let nextCursor: { createdAt: string; id: string } | undefined;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      nextCursor = {
        createdAt: lastItem.created_at.toISOString ? lastItem.created_at.toISOString() : String(lastItem.created_at),
        id: lastItem.id,
      };
    }

    return {
      items: items.map(r => ({
        id: r.id,
        title: r.title,
        snippet: r.snippet || '',
        rank: parseFloat(r.rank || '0'),
        createdAt: r.created_at,
      })),
      nextCursor,
      hasMore,
    };
  }
}

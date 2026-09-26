/**
 * Production Health & Readiness Probes (/healthz & /readyz)
 * Standard Kubernetes, Docker, and Cloud Load Balancer health check endpoints.
 */

import { Pool } from 'pg';
import { Redis } from 'ioredis';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptimeSeconds: number;
  timestamp: string;
  checks: {
    database: { status: 'up' | 'down'; latencyMs: number; poolTotal?: number; poolIdle?: number };
    redis: { status: 'up' | 'down'; latencyMs: number };
    memory: { rssMb: number; heapUsedMb: number; heapTotalMb: number; warning?: boolean };
  };
}

export class HealthProbeService {
  private db: Pool;
  private redis: Redis;

  constructor(dbPool: Pool, redisClient: Redis) {
    this.db = dbPool;
    this.redis = redisClient;
  }

  // Liveness Probe (/healthz): Returns 200 as long as the process is alive
  getLiveness(): { status: 'ok'; uptime: number } {
    return {
      status: 'ok',
      uptime: process.uptime(),
    };
  }

  // Readiness Probe (/readyz): Checks if downstream DB and Redis dependencies can accept traffic
  async getReadiness(): Promise<HealthCheckResult> {
    const mem = process.memoryUsage();
    const rssMb = Math.round(mem.rss / 1024 / 1024);
    const heapUsedMb = Math.round(mem.heapUsed / 1024 / 1024);
    const heapTotalMb = Math.round(mem.heapTotal / 1024 / 1024);

    let isHealthy = true;

    // 1. Database Check
    let dbStatus: 'up' | 'down' = 'up';
    let dbLatencyMs = 0;
    try {
      const dbStart = Date.now();
      await this.db.query('SELECT 1;');
      dbLatencyMs = Date.now() - dbStart;
    } catch {
      dbStatus = 'down';
      isHealthy = false;
    }

    // 2. Redis Check
    let redisStatus: 'up' | 'down' = 'up';
    let redisLatencyMs = 0;
    try {
      const redisStart = Date.now();
      await this.redis.ping();
      redisLatencyMs = Date.now() - redisStart;
    } catch {
      redisStatus = 'down';
      isHealthy = false;
    }

    // 3. Memory Warning (Flag if Heap usage exceeds 85% of total)
    const memWarning = heapUsedMb / (heapTotalMb || 1) > 0.85;

    return {
      status: isHealthy ? (memWarning ? 'degraded' : 'healthy') : 'unhealthy',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          poolTotal: this.db.totalCount,
          poolIdle: this.db.idleCount,
        },
        redis: {
          status: redisStatus,
          latencyMs: redisLatencyMs,
        },
        memory: {
          rssMb,
          heapUsedMb,
          heapTotalMb,
          warning: memWarning,
        },
      },
    };
  }
}

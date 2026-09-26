/**
 * Distributed Sliding Window Rate Limiter (TypeScript + Redis)
 * Protects APIs from abuse and enforces fair-use quotas per tenant and per IP.
 */

import { Redis } from 'ioredis';
import fs from 'fs';
import path from 'path';

export interface RateLimitConfig {
  windowMs: number; // e.g. 60,000 (1 minute)
  maxRequests: number; // e.g. 100 requests
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  headers: Record<string, string>;
}

export class SlidingWindowRateLimiter {
  private redis: Redis;
  private luaScript: string;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
    const luaPath = path.join(__dirname, 'sliding-window.lua');
    if (fs.existsSync(luaPath)) {
      this.luaScript = fs.readFileSync(luaPath, 'utf-8');
    } else {
      // Fallback inline script
      this.luaScript = `
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local limit = tonumber(ARGV[3])
        local clearBefore = now - window
        redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
        local count = redis.call('ZCARD', key)
        if count < limit then
            redis.call('ZADD', key, now, now .. ':' .. math.random(10000, 99999))
            redis.call('PEXPIRE', key, window + 1000)
            return {1, limit - count - 1}
        else
            return {0, 0}
        end
      `;
    }
  }

  async checkLimit(identifier: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();

    const [allowedNum, remainingNum] = (await this.redis.eval(
      this.luaScript,
      1,
      key,
      now.toString(),
      config.windowMs.toString(),
      config.maxRequests.toString()
    )) as [number, number];

    const allowed = allowedNum === 1;
    const remaining = Math.max(0, remainingNum);
    const resetMs = now + config.windowMs;

    return {
      allowed,
      remaining,
      resetMs,
      headers: {
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(resetMs / 1000).toString(),
      },
    };
  }
}

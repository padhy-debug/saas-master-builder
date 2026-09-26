-- ========================================================================
-- REDIS ATOMIC SLIDING WINDOW RATE LIMITER LUA SCRIPT
-- SaaS Master Builder Verified Blueprint
-- Prevents API abuse, DDoS, and ensures per-tenant noisy neighbor isolation
-- ========================================================================

-- KEYS[1]: Rate limit key (e.g., 'ratelimit:tenant_123:api')
-- ARGV[1]: Current timestamp in milliseconds
-- ARGV[2]: Window size in milliseconds (e.g., 60000 for 1 minute)
-- ARGV[3]: Max requests allowed in window (e.g., 100)

local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local clearBefore = now - window

-- 1. Remove expired timestamps outside the current sliding window
redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)

-- 2. Count current requests in this active window
local currentCount = redis.call('ZCARD', key)

-- 3. Check if limit exceeded
if currentCount < limit then
    -- Add unique request entry (using timestamp:counter or random nonce)
    redis.call('ZADD', key, now, now .. ':' .. math.random(10000, 99999))
    -- Set TTL to slightly longer than window to auto-cleanup
    redis.call('PEXPIRE', key, window + 1000)
    return {1, limit - currentCount - 1} -- Allowed, remaining quota
else
    return {0, 0} -- Denied (Rate limit exceeded)
end

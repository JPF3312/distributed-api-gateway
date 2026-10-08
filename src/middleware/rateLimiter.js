const redis = require('../config/redis');

const WINDOW_SIZE_IN_SECONDS = 10;
const MAX_REQUESTS = 5;

const rateLimiter = async (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown_client';
  const key = `rate_limit:${ip}`;
  const currentTime = Math.floor(Date.now() / 1000);
  const windowStart = currentTime - WINDOW_SIZE_IN_SECONDS;

  try {
    await redis.zremrangebyscore(key, 0, windowStart);
    const requestCount = await redis.zcard(key);

    if (requestCount >= MAX_REQUESTS) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Maximum ${MAX_REQUESTS} requests per ${WINDOW_SIZE_IN_SECONDS} seconds.`,
      });
    }

    await redis.zadd(key, currentTime, `${currentTime}:${Math.random()}`);
    await redis.expire(key, WINDOW_SIZE_IN_SECONDS);

    next();
  } catch (err) {
    console.error('Rate limiter error:', err);
    next();
  }
};

module.exports = rateLimiter;

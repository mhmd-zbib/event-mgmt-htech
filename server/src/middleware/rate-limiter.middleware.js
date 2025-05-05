const logger = require('../utils/logger');
const { TooManyRequestsError } = require('../errors/HttpErrors');

// In-memory store for rate limiting
const ipRequestMap = new Map();

/**
 * Rate limiter middleware
 * Limits the number of requests from a single IP within a time window
 * @param {Object} options - Configuration options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000)
 * @param {number} options.maxRequests - Maximum requests per window (default: 100)
 * @param {boolean} options.standardHeaders - Whether to send standard rate limit headers (default: true)
 * @returns {Function} Express middleware
 */
const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 60 * 1000;
  const maxRequests = options.maxRequests || 100;
  const standardHeaders = options.standardHeaders !== false;
  
  // Clean up expired entries
  setInterval(() => {
    const now = Date.now();
    ipRequestMap.forEach((data, key) => {
      if (now - data.timestamp > windowMs) {
        ipRequestMap.delete(key);
      }
    });
  }, windowMs);
  
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    // First request in the window
    if (!ipRequestMap.has(ip) || now - ipRequestMap.get(ip).timestamp > windowMs) {
      ipRequestMap.set(ip, {
        count: 1,
        timestamp: now
      });
      
      if (standardHeaders) {
        setRateLimitHeaders(res, maxRequests, maxRequests - 1, now + windowMs);
      }
      
      return next();
    }
    
    // Increment request count
    const data = ipRequestMap.get(ip);
    data.count += 1;
    
    // Set headers
    if (standardHeaders) {
      const remaining = Math.max(0, maxRequests - data.count);
      setRateLimitHeaders(res, maxRequests, remaining, data.timestamp + windowMs);
    }
    
    // Check if limit exceeded
    if (data.count > maxRequests) {
      logger.warn('Rate limit exceeded', {
        ip,
        requestCount: data.count,
        maxRequests,
        path: req.path,
        method: req.method,
        requestId: req.id
      });
      
      return next(new TooManyRequestsError('Too many requests, please try again later'));
    }
    
    next();
  };
};

/**
 * Helper function to set rate limit headers
 */
function setRateLimitHeaders(res, limit, remaining, reset) {
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', new Date(reset).toISOString());
}

module.exports = rateLimiter;
const logger = require('../utils/logger');
const { TooManyRequestsError } = require('../errors/HttpErrors');

const ipRequestMap = new Map();

const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 60 * 1000;
  const maxRequests = options.maxRequests || 100;
  const standardHeaders = options.standardHeaders !== false;
  
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
    
    const data = ipRequestMap.get(ip);
    data.count += 1;
    
    if (standardHeaders) {
      const remaining = Math.max(0, maxRequests - data.count);
      setRateLimitHeaders(res, maxRequests, remaining, data.timestamp + windowMs);
    }
    
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

function setRateLimitHeaders(res, limit, remaining, reset) {
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', new Date(reset).toISOString());
}

module.exports = rateLimiter;
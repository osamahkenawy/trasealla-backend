/**
 * Idempotency middleware
 * Prevents duplicate bookings on retry/timeout
 */

const idempotencyCache = new Map();

exports.idempotencyMiddleware = (req, res, next) => {
  // Only for POST requests
  if (req.method !== 'POST') {
    return next();
  }

  // Get or generate idempotency key
  const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
  
  if (!idempotencyKey) {
    // No key provided, allow request
    return next();
  }

  // Check if we've seen this request before
  const cached = idempotencyCache.get(idempotencyKey);
  
  if (cached) {
    const age = Date.now() - cached.timestamp;
    
    // If less than 5 minutes old, return cached response
    if (age < 300000) { // 5 minutes
      console.log(`✅ Returning cached response for idempotency key: ${idempotencyKey}`);
      return res.status(cached.statusCode).json(cached.body);
    } else {
      // Expired, remove from cache
      idempotencyCache.delete(idempotencyKey);
    }
  }

  // Store original res.json
  const originalJson = res.json.bind(res);

  // Override res.json to cache the response
  res.json = function(body) {
    // Cache successful responses
    if (body.success) {
      idempotencyCache.set(idempotencyKey, {
        statusCode: res.statusCode,
        body,
        timestamp: Date.now()
      });

      // Clean up old cache entries (older than 10 minutes)
      for (const [key, value] of idempotencyCache.entries()) {
        if (Date.now() - value.timestamp > 600000) {
          idempotencyCache.delete(key);
        }
      }
    }

    return originalJson(body);
  };

  next();
};

/**
 * Generate idempotency key from request
 */
exports.generateIdempotencyKey = (req) => {
  const { flightOffer, travelers } = req.body;
  const userId = req.user?.id;
  
  // Create unique key from offer ID + user ID
  const offerId = flightOffer?.id || flightOffer?.raw?.id;
  return `${userId}-${offerId}-${Date.now()}`;
};


import { env } from '../config/env.js';
import { getVisitorKey } from '../utils/visitor.util.js';

const visitorMessageCounts = new Map();
const LIMIT_REACHED_MESSAGE = 'Has alcanzado el límite de 10 preguntas para este asistente.';

export const rateLimitMiddleware = (req, res, next) => {
  const limit = env.maxMessagesPerVisitor;
  const visitorKey = getVisitorKey(req);
  const currentCount = visitorMessageCounts.get(visitorKey) || 0;

  if (currentCount >= limit) {
    return res.status(429).json({
      error: LIMIT_REACHED_MESSAGE,
      remaining: 0,
      limit,
    });
  }

  req.rateLimit = {
    limit,
    remaining: Math.max(limit - currentCount, 0),
    visitorKey,
  };

  req.consumeRateLimit = () => {
    const latestCount = visitorMessageCounts.get(visitorKey) || 0;
    const nextCount = latestCount + 1;
    visitorMessageCounts.set(visitorKey, nextCount);
    req.rateLimit.remaining = Math.max(limit - nextCount, 0);
  };

  return next();
};

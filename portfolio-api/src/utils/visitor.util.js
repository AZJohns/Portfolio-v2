import crypto from 'crypto';

export const getVisitorKey = (req) => {
  const visitorId = typeof req.body?.visitorId === 'string' ? req.body.visitorId.trim() : '';
  const forwardedFor = req.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  const ip = forwardedIp?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || 'unknown-ip';
  const userAgent = req.get('user-agent') || 'unknown-user-agent';
  const rawVisitorKey = [visitorId || 'anonymous-visitor', ip, userAgent].join(':');

  return crypto.createHash('sha256').update(rawVisitorKey).digest('hex');
};

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  resetTime?: number;
} {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true };
}

export function getRateLimitHeaders(identifier: string): Headers {
  const record = rateLimitMap.get(identifier);
  const headers = new Headers();

  if (record) {
    const remaining = Math.max(0, MAX_REQUESTS - record.count);
    const resetTime = Math.ceil(record.resetTime / 1000);

    headers.set("X-RateLimit-Limit", MAX_REQUESTS.toString());
    headers.set("X-RateLimit-Remaining", remaining.toString());
    headers.set("X-RateLimit-Reset", resetTime.toString());
  }

  return headers;
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, WINDOW_MS);

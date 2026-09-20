import type { NextFunction, Request, Response } from 'express';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Stops one visitor hammering the server.
 *
 * She can hold down the compliment button, a browser bug can retry in a loop,
 * or a bot can find the URL. Any of those can flood a free hosting plan. This
 * caps how many requests one address can make in a window of time.
 *
 * It counts in memory, which means it resets when the server restarts and
 * does not work across several servers. For one person's birthday app that is
 * completely fine; for anything bigger you would use Redis.
 */
export function rateLimit({ max, windowMs }: { max: number; windowMs: number }) {
  return (request: Request, response: Response, next: NextFunction) => {
    const key = request.ip ?? 'unknown';
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    bucket.count += 1;

    if (bucket.count > max) {
      response
        .status(429)
        .json({ error: 'Slow down a moment.', retryInSeconds: Math.ceil((bucket.resetAt - now) / 1000) });
      return;
    }

    next();
  };
}

/** Throw away expired buckets every few minutes so memory does not creep up. */
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref();

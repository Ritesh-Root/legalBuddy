/** Bounded, per-instance limits reduce anonymous inference abuse without retaining IPs. */
import { createHash } from 'node:crypto';
import { AppError } from './errors.js';

const WINDOW_MS = 60_000;
const MAX_PER_CLIENT = 6;
const MAX_PER_INSTANCE = 60;

/** A short-lived limiter; multi-instance deployments require a shared quota for a global cap. */
export function createRateLimiter(): (identity: string, now?: number) => void {
  const buckets = new Map<string, { count: number; expires: number }>();
  let total = { count: 0, expires: 0 };
  return (identity, now = Date.now()) => {
    for (const [key, bucket] of buckets) if (bucket.expires <= now) buckets.delete(key);
    if (total.expires <= now) total = { count: 0, expires: now + WINDOW_MS };
    const key = createHash('sha256').update(identity).digest('hex');
    const bucket = buckets.get(key) ?? { count: 0, expires: now + WINDOW_MS };
    if (bucket.count >= MAX_PER_CLIENT || total.count >= MAX_PER_INSTANCE) {
      throw new AppError(
        429,
        'RATE_LIMITED',
        'Too many requests. Wait one minute before trying again.',
      );
    }
    bucket.count += 1;
    total.count += 1;
    buckets.set(key, bucket);
  };
}

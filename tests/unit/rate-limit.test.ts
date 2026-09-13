/** Quotas cover burst rejection, expiry, and the shared warm-instance budget. */
import { describe, expect, it } from 'vitest';
import { createRateLimiter } from '../../server/rate-limit';

describe('bounded inference quota', () => {
  it('permits six requests per client then resets after one minute', () => {
    const limit = createRateLimiter();
    for (let index = 0; index < 6; index += 1) limit('client', 1_000);
    expect(() => limit('client', 1_001)).toThrow('Too many requests');
    expect(() => limit('client', 61_000)).not.toThrow();
  });
  it('caps all client identities together to sixty requests per warm instance', () => {
    const limit = createRateLimiter();
    for (let index = 0; index < 60; index += 1) limit(`client-${index}`, 0);
    expect(() => limit('another-client', 1)).toThrow('Too many requests');
    expect(() => limit('another-client', 60_000)).not.toThrow();
  });
  it('uses the current time when none is supplied', () => {
    expect(() => createRateLimiter()('client')).not.toThrow();
  });
});

/** Reuse only successful results inside one short-lived, memory-only workspace. */
import type { Analysis } from '../../domain/types';
import { requestAssistance } from './client';

const MAX_ENTRIES = 8;
const RESULT_LIFETIME_MS = 5 * 60_000;

/** Reset invalidates both stored results and the right of pending calls to populate them. */
export interface SessionClient {
  request: typeof requestAssistance;
  clear: () => void;
}

/** The default transport validates provider responses before they enter this private cache. */
export function createSessionClient(send = requestAssistance): SessionClient {
  const results = new Map<string, { result: Analysis; expires: number }>();
  let generation = 0;
  return {
    clear() {
      generation += 1;
      results.clear();
    },
    async request(input, signal) {
      signal.throwIfAborted();
      const now = Date.now();
      for (const [key, entry] of results) if (entry.expires <= now) results.delete(key);
      const key = JSON.stringify(input);
      const cached = results.get(key);
      if (cached) return cached.result;
      const startedIn = generation;
      const result = await send(input, signal);
      signal.throwIfAborted();
      if (startedIn === generation) {
        const oldest = results.keys().next().value;
        if (results.size >= MAX_ENTRIES && oldest !== undefined) results.delete(oldest);
        results.set(key, { result, expires: Date.now() + RESULT_LIFETIME_MS });
      }
      return result;
    },
  };
}

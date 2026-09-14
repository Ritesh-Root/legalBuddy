/** Bound simultaneous provider waits within a warm instance without retaining documents. */
import { AppError } from './errors.js';

const MAX_CONCURRENT_REQUESTS = 3;

/** Release capacity for successful, failed, and cancelled generations alike. */
export function createInferenceGate(): <T>(work: () => Promise<T>) => Promise<T> {
  let active = 0;
  return async (work) => {
    if (active >= MAX_CONCURRENT_REQUESTS) {
      throw new AppError(
        429,
        'CAPACITY_LIMITED',
        'The assistant is busy. Please try again shortly.',
      );
    }
    active += 1;
    try {
      return await work();
    } finally {
      active -= 1;
    }
  };
}

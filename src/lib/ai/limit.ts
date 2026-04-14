/**
 * Tiny in-process concurrency limiter. No dependencies.
 *
 *   const limit = createLimiter(3);
 *   await limit(() => callApi());
 */
export function createLimiter(max: number) {
  const cap = Math.max(1, Math.floor(max));
  let active = 0;
  const queue: Array<() => void> = [];

  const release = () => {
    active -= 1;
    const next = queue.shift();
    if (next) next();
  };

  return async function run<T>(fn: () => Promise<T>): Promise<T> {
    if (active >= cap) {
      await new Promise<void>((resolve) => queue.push(resolve));
    }
    active += 1;
    try {
      return await fn();
    } finally {
      release();
    }
  };
}

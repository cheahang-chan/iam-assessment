import { AsyncLocalStorage } from 'async_hooks';

const CORRELATION_KEY = 'correlationId';

type Store = {
  [CORRELATION_KEY]: string;
};

const asyncLocalStorage = new AsyncLocalStorage<Store>();

export function runWithCorrelationId<T>(correlationId: string, fn: () => T): T {
  return asyncLocalStorage.run({ correlationId }, fn);
}

export function getCorrelationId(): string | undefined {
  const store = asyncLocalStorage.getStore();
  return store ? store[CORRELATION_KEY] : undefined;
}

export { asyncLocalStorage };

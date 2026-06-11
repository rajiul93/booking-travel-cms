import { unstable_cache } from 'next/cache'
import { getServerEnv } from './env'

type CacheFn<T> = () => Promise<T>

export function withCache<T>(
  keyParts: string[],
  fn: CacheFn<T>,
  revalidate?: number,
): CacheFn<T> {
  const ttl = revalidate ?? getServerEnv().CACHE_TTL_SECONDS

  return unstable_cache(fn, keyParts, {
    revalidate: ttl,
    tags: keyParts,
  })
}

export function buildCacheKey(...parts: (string | number)[]): string[] {
  return parts.map(String)
}

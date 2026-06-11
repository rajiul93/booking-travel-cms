import { createHmac } from 'crypto'
import type { BokunHttpMethod } from './types'

export function formatBokunDate(date: Date = new Date()): string {
  return date.toISOString().replace('T', ' ').slice(0, 19)
}

export function createBokunSignature(
  date: string,
  accessKey: string,
  method: BokunHttpMethod,
  path: string,
  secretKey: string,
): string {
  const signatureBase = `${date}${accessKey}${method}${path}`
  const hmac = createHmac('sha1', secretKey)
  hmac.update(signatureBase)
  return hmac.digest('base64')
}

export function buildBokunPath(
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): string {
  if (!query) return path

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(key, String(value))
    }
  }

  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
}

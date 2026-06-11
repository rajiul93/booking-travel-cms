import { getServerEnv } from '@/lib/env'
import { buildCacheKey, withCache } from '@/lib/cache'
import { buildBokunPath, createBokunSignature, formatBokunDate } from './sign'
import type {
  BokunAvailability,
  BokunCheckoutSubmitRequest,
  BokunCheckoutSubmitResponse,
  BokunConfirmResponse,
  BokunHttpMethod,
} from './types'

class BokunClient {
  private getConfig() {
    const env = getServerEnv()
    return {
      accessKey: env.BOKUN_ACCESS_KEY,
      secretKey: env.BOKUN_SECRET_KEY,
      baseUrl: env.BOKUN_BASE_URL,
      currency: env.BOKUN_CURRENCY,
      lang: env.BOKUN_LANG,
    }
  }

  private async request<T>(
    method: BokunHttpMethod,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const config = this.getConfig()
    const date = formatBokunDate()
    const signature = createBokunSignature(
      date,
      config.accessKey,
      method,
      path,
      config.secretKey,
    )

    const response = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Bokun-Date': date,
        'X-Bokun-AccessKey': config.accessKey,
        'X-Bokun-Signature': signature,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Bókun API error ${response.status}: ${errorText}`)
    }

    if (response.status === 204) {
      return {} as T
    }

    return response.json() as Promise<T>
  }

  async getAvailabilities(
    activityId: number,
    start: string,
    end: string,
  ): Promise<BokunAvailability[]> {
    const config = this.getConfig()
    const path = buildBokunPath(`/activity.json/${activityId}/availabilities`, {
      start,
      end,
      currency: config.currency,
      lang: config.lang,
      includeSoldOut: false,
    })

    const cachedFetch = withCache(
      buildCacheKey('bokun', 'availability', activityId, start, end),
      () => this.request<BokunAvailability[]>('GET', path),
    )

    return cachedFetch()
  }

  async submitCheckout(
    payload: BokunCheckoutSubmitRequest,
  ): Promise<BokunCheckoutSubmitResponse> {
    const config = this.getConfig()
    const path = buildBokunPath('/checkout.json/submit', {
      currency: config.currency,
      lang: config.lang,
    })
    return this.request<BokunCheckoutSubmitResponse>('POST', path, payload)
  }

  async confirmReserved(confirmationCode: string): Promise<BokunConfirmResponse> {
    const config = this.getConfig()
    const path = buildBokunPath(
      `/checkout.json/confirm-reserved/${confirmationCode}`,
      {
        currency: config.currency,
        lang: config.lang,
      },
    )
    return this.request<BokunConfirmResponse>('POST', path)
  }

  async cancelBooking(
    confirmationCode: string,
    note = 'Payment failed or session expired',
  ): Promise<void> {
    const path = `/booking.json/cancel-booking/${confirmationCode}`
    await this.request<void>('POST', path, { note, notify: false })
  }

  async getBooking(confirmationCode: string) {
    const config = this.getConfig()
    const path = buildBokunPath(`/booking.json/booking/${confirmationCode}`, {
      currency: config.currency,
      lang: config.lang,
    })
    return this.request<Record<string, unknown>>('GET', path)
  }
}

let bokunClient: BokunClient | null = null

export function getBokunClient(): BokunClient {
  if (!bokunClient) {
    bokunClient = new BokunClient()
  }
  return bokunClient
}

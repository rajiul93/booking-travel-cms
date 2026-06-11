import { NextRequest } from 'next/server'
import { getBokunClient } from '@/lib/bokun/client'
import { calculatePricing } from '@/lib/booking/service'
import { pricingQuerySchema } from '@/lib/validation/booking'
import { handleApiError, jsonError, jsonSuccess } from '@/lib/api/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())
    const query = pricingQuerySchema.parse(params)
    const bokun = getBokunClient()

    const availabilities = await bokun.getAvailabilities(
      query.activityId,
      query.date,
      query.date,
    )

    const availability = availabilities.find((a) => a.id === query.availabilityId)

    if (!availability) {
      return jsonError('Availability slot not found', 404)
    }

    const pricing = calculatePricing(
      availability,
      query.rateId,
      query.adults,
      query.children,
    )

    return jsonSuccess({
      ...pricing,
      availabilityId: availability.id,
      startTime: availability.startTime,
      startTimeId: availability.startTimeId,
      availabilityCount: availability.availabilityCount,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

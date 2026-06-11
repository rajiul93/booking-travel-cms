import { NextRequest } from 'next/server'
import { getBokunClient } from '@/lib/bokun/client'
import { availabilityQuerySchema } from '@/lib/validation/booking'
import { handleApiError, jsonSuccess } from '@/lib/api/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())
    const query = availabilityQuerySchema.parse(params)
    const bokun = getBokunClient()

    const availabilities = await bokun.getAvailabilities(
      query.activityId,
      query.start,
      query.end,
    )

    const available = availabilities.filter(
      (a) => !a.unavailable && !a.soldOut && a.availabilityCount > 0,
    )

    return jsonSuccess({
      availabilities: available,
      count: available.length,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

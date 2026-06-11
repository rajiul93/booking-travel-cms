import { NextRequest } from 'next/server'
import { createCheckoutSession } from '@/lib/booking/service'
import { checkoutSchema } from '@/lib/validation/booking'
import { handleApiError, jsonSuccess } from '@/lib/api/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId } = checkoutSchema.parse(body)
    const session = await createCheckoutSession(bookingId)

    return jsonSuccess({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

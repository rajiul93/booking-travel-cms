import { NextRequest } from 'next/server'
import { reserveBooking } from '@/lib/booking/service'
import { reserveBookingSchema } from '@/lib/validation/booking'
import { handleApiError, jsonSuccess } from '@/lib/api/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const input = reserveBookingSchema.parse(body)
    const booking = await reserveBooking(input)

    return jsonSuccess(
      {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        bokunConfirmationCode: booking.bokunConfirmationCode,
        status: booking.status,
      },
      201,
    )
  } catch (error) {
    return handleApiError(error)
  }
}

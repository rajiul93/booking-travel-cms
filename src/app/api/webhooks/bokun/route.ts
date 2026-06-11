import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidateTag } from 'next/cache'
import type { BokunWebhookPayload } from '@/lib/bokun/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function verifyBokunWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false

  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  const sigBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (sigBuffer.length !== expectedBuffer.length) return false
  return timingSafeEqual(sigBuffer, expectedBuffer)
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.BOKUN_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-bokun-signature')

  if (!verifyBokunWebhookSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: BokunWebhookPayload

  try {
    payload = JSON.parse(rawBody) as BokunWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  try {
    const cms = await getPayload({ config })

    switch (payload.eventType) {
      case 'ACTIVITY_CLOSEOUT':
      case 'AVAILABILITY_UPDATED': {
        if (payload.activityId) {
          revalidateTag(`bokun-availability-${payload.activityId}`)
        }
        break
      }

      case 'BOOKING_CANCELLED': {
        const confirmationCode = payload.confirmationCode

        if (confirmationCode) {
          const bookings = await cms.find({
            collection: 'bookings',
            where: {
              bokunConfirmationCode: { equals: confirmationCode },
            },
            limit: 1,
          })

          const booking = bookings.docs[0]
          if (booking && booking.status === 'confirmed') {
            await cms.update({
              collection: 'bookings',
              id: booking.id,
              data: { status: 'cancelled', notes: 'Cancelled via Bókun webhook' },
            })
          }
        }
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook handler failed'
    console.error('Bókun webhook error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

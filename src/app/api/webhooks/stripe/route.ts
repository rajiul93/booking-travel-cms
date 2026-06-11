import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { constructStripeEvent } from '@/lib/stripe/client'
import {
  confirmBookingPayment,
  processStripeRefund,
  releaseBookingReservation,
} from '@/lib/booking/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const rawBody = await request.text()

  let event: Stripe.Event

  try {
    event = constructStripeEvent(rawBody, signature)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.bookingId

        if (!bookingId) {
          throw new Error('Missing bookingId in session metadata')
        }

        await confirmBookingPayment(
          bookingId,
          session.id,
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id,
        )
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.bookingId

        if (bookingId) {
          await releaseBookingReservation(
            bookingId,
            'Stripe checkout session expired',
          )
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata?.bookingId

        if (bookingId) {
          await releaseBookingReservation(
            bookingId,
            'Stripe payment failed',
          )
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const bookingId = charge.metadata?.bookingId
        const refund = charge.refunds?.data[0]

        if (bookingId && refund) {
          await processStripeRefund(bookingId, refund.id)
        }
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook handler failed'
    console.error('Stripe webhook error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

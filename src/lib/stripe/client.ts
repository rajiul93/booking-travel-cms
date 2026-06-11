import Stripe from 'stripe'
import { getServerEnv } from '@/lib/env'

let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(getServerEnv().STRIPE_SECRET_KEY, {
      typescript: true,
    })
  }
  return stripeClient
}

export function constructStripeEvent(
  payload: string | Buffer,
  signature: string,
): Stripe.Event {
  const stripe = getStripeClient()
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    getServerEnv().STRIPE_WEBHOOK_SECRET,
  )
}

import { getPayloadCached } from '@/lib/cms/payload'
import { getTourBySlugCached } from '@/lib/cms/queries'
import { getBokunClient } from '@/lib/bokun/client'
import { getStripeClient } from '@/lib/stripe/client'
import { sendBookingConfirmationEmail } from '@/lib/email/send'
import { getSiteUrl } from '@/lib/env'
import type { ReserveBookingInput } from '@/lib/validation/booking'
import type { BokunAvailability } from '@/lib/bokun/types'
import { randomBytes } from 'crypto'

function generateBookingReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = randomBytes(3).toString('hex').toUpperCase()
  return `DT-${timestamp}-${random}`
}

export async function getTourById(tourId: number | string) {
  const payload = await getPayloadCached()
  return payload.findByID({
    collection: 'tours',
    id: tourId,
    depth: 1,
  })
}

export async function getTourBySlug(slug: string) {
  return getTourBySlugCached(slug)
}

export function calculatePricing(
  availability: BokunAvailability,
  rateId: number,
  adults: number,
  children: number,
) {
  const ratePricing = availability.pricesByRate.find(
    (p) => p.activityRateId === rateId,
  )

  if (!ratePricing) {
    throw new Error('Rate pricing not found for selected availability')
  }

  const adultCategory = ratePricing.pricePerCategoryUnit.find(
    (c) => c.ticketCategory === 'ADULT',
  )
  const childCategory = ratePricing.pricePerCategoryUnit.find(
    (c) => c.ticketCategory === 'CHILD' || c.ticketCategory === 'TEENAGER',
  )

  if (!adultCategory) {
    throw new Error('Adult pricing category not found')
  }

  const adultPrice = adultCategory.price.amount
  const childPrice = childCategory?.price.amount ?? 0
  const totalAmount = adultPrice * adults + childPrice * children

  return {
    adultPrice,
    childPrice,
    totalAmount,
    currency: adultCategory.price.currency,
    adultPricingCategoryId: adultCategory.id,
    childPricingCategoryId: childCategory?.id,
  }
}

export async function reserveBooking(input: ReserveBookingInput) {
  const payload = await getPayloadCached()
  const bokun = getBokunClient()
  const tour = await getTourById(input.tourId)

  if (!tour || tour.status !== 'published') {
    throw new Error('Tour not found or not available for booking')
  }

  const passengers: Array<{ pricingCategoryId: number; quantity: number }> = [
    { pricingCategoryId: input.adultPricingCategoryId, quantity: input.adults },
  ]

  if (input.children > 0 && input.childPricingCategoryId) {
    passengers.push({
      pricingCategoryId: input.childPricingCategoryId,
      quantity: input.children,
    })
  }

  const bokunResponse = await bokun.submitCheckout({
    activityBookings: [
      {
        activityId: tour.bokunActivityId,
        date: input.tourDate,
        startTimeId: input.startTimeId,
        rateId: input.rateId,
        passengers,
      },
    ],
    customer: {
      firstName: input.customer.firstName,
      lastName: input.customer.lastName,
      email: input.customer.email,
      phoneNumber: input.customer.phone,
    },
  })

  const bookingReference = generateBookingReference()

  const booking = await payload.create({
    collection: 'bookings',
    data: {
      bookingReference,
      tour: input.tourId,
      status: 'reserved',
      customer: input.customer,
      customerEmail: input.customer.email,
      tourDate: input.tourDate,
      tourTime: input.tourTime,
      startTimeId: input.startTimeId,
      rateId: input.rateId,
      availabilityId: input.availabilityId,
      adults: input.adults,
      children: input.children,
      pricing: {
        adultPrice: input.adultPrice,
        childPrice: input.childPrice,
        totalAmount: input.totalAmount,
        currency: input.currency,
      },
      bokunConfirmationCode: bokunResponse.booking.confirmationCode,
    },
  })

  return booking
}

export async function createCheckoutSession(bookingId: number | string) {
  const payload = await getPayloadCached()
  const stripe = getStripeClient()
  const siteUrl = getSiteUrl()

  const booking = await payload.findByID({
    collection: 'bookings',
    id: bookingId,
    depth: 1,
  })

  if (!booking || booking.status !== 'reserved') {
    throw new Error('Booking not found or not in reservable state')
  }

  const tour =
    typeof booking.tour === 'object' && booking.tour !== null
      ? booking.tour
      : await getTourById(String(booking.tour))

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: booking.customerEmail,
    line_items: [
      {
        price_data: {
          currency: booking.pricing.currency.toLowerCase(),
          product_data: {
            name: tour.title,
            description: `${booking.tourDate} at ${booking.tourTime} — ${booking.adults} adult(s), ${booking.children} child(ren)`,
          },
          unit_amount: Math.round(booking.pricing.totalAmount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: String(booking.id),
      bookingReference: booking.bookingReference,
      bokunConfirmationCode: booking.bokunConfirmationCode ?? '',
    },
    success_url: `${siteUrl}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/tours/${tour.slug}?cancelled=true`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  })

  await payload.update({
    collection: 'bookings',
    id: booking.id,
    data: {
      stripeSessionId: session.id,
      status: 'pending',
    },
  })

  return session
}

export async function confirmBookingPayment(
  bookingId: number | string,
  stripeSessionId: string,
  paymentIntentId?: string,
) {
  const payload = await getPayloadCached()
  const bokun = getBokunClient()

  const booking = await payload.findByID({
    collection: 'bookings',
    id: bookingId,
    depth: 1,
  })

  if (!booking) {
    throw new Error('Booking not found')
  }

  if (booking.status === 'confirmed') {
    return booking
  }

  if (!booking.bokunConfirmationCode) {
    throw new Error('Missing Bókun confirmation code')
  }

  await bokun.confirmReserved(booking.bokunConfirmationCode)

  const tour =
    typeof booking.tour === 'object' && booking.tour !== null
      ? booking.tour
      : await getTourById(String(booking.tour))

  const updatedBooking = await payload.update({
    collection: 'bookings',
    id: booking.id,
    data: {
      status: 'confirmed',
      stripeSessionId,
      stripePaymentIntentId: paymentIntentId,
    },
  })

  await sendBookingConfirmationEmail({
    to: booking.customerEmail,
    customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
    tourTitle: tour.title,
    tourDate: booking.tourDate,
    tourTime: booking.tourTime,
    adults: booking.adults,
    children: booking.children,
    totalAmount: booking.pricing.totalAmount,
    currency: booking.pricing.currency,
    confirmationCode: booking.bokunConfirmationCode,
    bookingReference: booking.bookingReference,
  })

  return updatedBooking
}

export async function releaseBookingReservation(bookingId: number | string, reason: string) {
  const payload = await getPayloadCached()
  const bokun = getBokunClient()

  const booking = await payload.findByID({
    collection: 'bookings',
    id: bookingId,
  })

  if (!booking) return

  if (
    booking.status === 'confirmed' ||
    booking.status === 'cancelled' ||
    booking.status === 'refunded'
  ) {
    return
  }

  if (booking.bokunConfirmationCode) {
    try {
      await bokun.cancelBooking(booking.bokunConfirmationCode, reason)
    } catch (error) {
      console.error('Failed to cancel Bókun reservation:', error)
    }
  }

  await payload.update({
    collection: 'bookings',
    id: booking.id,
    data: {
      status: 'failed',
      notes: reason,
    },
  })
}

export async function processStripeRefund(bookingId: number | string, refundId: string) {
  const payload = await getPayloadCached()
  const bokun = getBokunClient()

  const booking = await payload.findByID({
    collection: 'bookings',
    id: bookingId,
  })

  if (!booking) return

  if (booking.bokunConfirmationCode) {
    try {
      await bokun.cancelBooking(
        booking.bokunConfirmationCode,
        'Refund processed via Stripe',
      )
    } catch (error) {
      console.error('Failed to cancel Bókun booking on refund:', error)
    }
  }

  await payload.update({
    collection: 'bookings',
    id: booking.id,
    data: {
      status: 'refunded',
      refundId,
    },
  })
}

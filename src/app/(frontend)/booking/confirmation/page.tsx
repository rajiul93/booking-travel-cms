import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { getStripeClient } from '@/lib/stripe/client'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'Booking Confirmed',
  description: 'Your Dream Tourism booking has been confirmed.',
  path: '/booking/confirmation',
  noIndex: true,
})

interface ConfirmationPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function BookingConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const { session_id: sessionId } = await searchParams

  let bookingReference: string | null = null
  let tourTitle: string | null = null

  if (sessionId) {
    try {
      const stripe = getStripeClient()
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      bookingReference = session.metadata?.bookingReference ?? null

      const bookingId = session.metadata?.bookingId
      if (bookingId) {
        const payload = await getPayload({ config })
        const booking = await payload.findByID({
          collection: 'bookings',
          id: bookingId,
          depth: 1,
        })
        if (booking.tour && typeof booking.tour === 'object') {
          tourTitle = booking.tour.title
        }
      }
    } catch {
      // Session lookup failed — still show generic confirmation
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      <h1 className="mt-6 text-3xl font-bold text-slate-900">Booking Confirmed!</h1>
      <p className="mt-4 text-slate-600">
        Thank you for booking with Dream Tourism.
        {tourTitle && <> Your <strong>{tourTitle}</strong> experience is confirmed.</>}
      </p>
      {bookingReference && (
        <p className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-sm font-mono text-slate-700">
          Reference: {bookingReference}
        </p>
      )}
      <p className="mt-4 text-sm text-slate-500">
        A confirmation email has been sent to your inbox with all the details.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/tours"
          className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700"
        >
          Browse More Tours
        </Link>
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

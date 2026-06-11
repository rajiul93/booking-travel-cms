import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'Terms & Conditions',
  description: 'Dream Tourism terms and conditions for tour bookings.',
  path: '/terms',
})

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-slate-900">Terms & Conditions</h1>
      <div className="prose prose-slate mt-8 max-w-none text-slate-600">
        <p>Last updated: {new Date().toLocaleDateString('en-IE')}</p>
        <p className="mt-4">
          By using dreamtourism.it and booking tours through our platform, you agree to
          these Terms & Conditions.
        </p>
        <h2 className="mt-8 text-xl font-bold text-slate-900">Bookings & Payments</h2>
        <p className="mt-2">
          All bookings are subject to availability. Payment is processed securely via Stripe.
          A reservation is held for 30 minutes during checkout. Failed payments result in
          automatic reservation release.
        </p>
        <h2 className="mt-8 text-xl font-bold text-slate-900">Cancellations & Refunds</h2>
        <p className="mt-2">
          Cancellation policies vary by tour. Refunds are processed through Stripe and
          synchronized with our Bókun booking system. Contact us for cancellation requests.
        </p>
        <h2 className="mt-8 text-xl font-bold text-slate-900">Liability</h2>
        <p className="mt-2">
          Dream Tourism acts as a booking agent. Tour operations are conducted by licensed
          local operators. We are not liable for circumstances beyond our control.
        </p>
      </div>
    </div>
  )
}

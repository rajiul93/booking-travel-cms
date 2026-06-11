import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/metadata'
import { getPageBySlug } from '@/lib/cms/queries'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'Dream Tourism privacy policy and data protection information.',
  path: '/privacy',
})

export default async function PrivacyPage() {
  const page = await getPageBySlug('privacy')

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-slate-900">
        {page?.title ?? 'Privacy Policy'}
      </h1>
      <div className="prose prose-slate mt-8 max-w-none text-slate-600">
        <p>Last updated: {new Date().toLocaleDateString('en-IE')}</p>
        <p className="mt-4">
          Dream Tourism (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates dreamtourism.it.
          This Privacy Policy explains how we collect, use, and protect your personal data
          when you use our website and booking services.
        </p>
        <h2 className="mt-8 text-xl font-bold text-slate-900">Information We Collect</h2>
        <p className="mt-2">
          We collect information you provide when booking a tour, including your name, email
          address, phone number, and payment details (processed securely by Stripe).
        </p>
        <h2 className="mt-8 text-xl font-bold text-slate-900">How We Use Your Data</h2>
        <p className="mt-2">
          Your data is used to process bookings, send confirmations, sync with our tour
          operators via Bókun, and improve our services. We do not sell your personal data.
        </p>
        <h2 className="mt-8 text-xl font-bold text-slate-900">Contact</h2>
        <p className="mt-2">
          For privacy inquiries, contact us at{' '}
          <a href="mailto:privacy@dreamtourism.it" className="text-sky-600 hover:underline">
            privacy@dreamtourism.it
          </a>
        </p>
      </div>
    </div>
  )
}

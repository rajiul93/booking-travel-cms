import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/metadata'
import { getPageBySlug } from '@/lib/cms/queries'

export const revalidate = 3600

export const metadata: Metadata = buildMetadata({
  title: 'About Us',
  description: 'Learn about Dream Tourism and our mission to deliver unforgettable travel experiences across Italy.',
  path: '/about',
})

export default async function AboutPage() {
  const page = await getPageBySlug('about')

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-slate-900">
        {page?.title ?? 'About Dream Tourism'}
      </h1>
      <div className="prose prose-slate mt-8 max-w-none">
        {page ? (
          <p className="text-lg text-slate-600">
            Content managed via Payload CMS. Edit the &quot;about&quot; page in the admin panel.
          </p>
        ) : (
          <>
            <p className="text-lg leading-relaxed text-slate-600">
              Dream Tourism is a premium travel booking platform dedicated to curating
              authentic and unforgettable experiences across Italy. From cultural city tours
              to adventure day trips, we connect travelers with the best local operators.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Our platform integrates live availability through Bókun, secure payments via
              Stripe, and instant email confirmations — so you can book with complete confidence.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

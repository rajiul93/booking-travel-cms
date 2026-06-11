import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPageBySlug, getMediaUrl } from '@/lib/cms/queries'
import { RichTextContent } from '@/components/cms/RichTextContent'
import { buildMetadata } from '@/lib/seo/metadata'

export const revalidate = 60

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'tours',
  'blog',
  'contact',
  'booking',
  'about',
  'privacy',
  'terms',
])

interface CmsPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { slug } = await params

  if (RESERVED_SLUGS.has(slug)) {
    return buildMetadata({ title: 'Page Not Found', noIndex: true })
  }

  const page = await getPageBySlug(slug)

  if (!page) {
    return buildMetadata({ title: 'Page Not Found', noIndex: true })
  }

  return buildMetadata({
    title: page.seo?.metaTitle ?? page.title,
    description: page.seo?.metaDescription ?? undefined,
    path: `/${slug}`,
    ogImage: getMediaUrl(page.seo?.ogImage),
  })
}

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params

  if (RESERVED_SLUGS.has(slug)) {
    notFound()
  }

  const page = await getPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-slate-900">{page.title}</h1>
      {page.content && (
        <RichTextContent
          content={page.content}
          className="prose prose-slate mt-8 max-w-none"
        />
      )}
    </div>
  )
}

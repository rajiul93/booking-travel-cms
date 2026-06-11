import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getMediaUrl } from '@/lib/cms/queries'
import { buildMetadata } from '@/lib/seo/metadata'

export const revalidate = 60

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

async function getBlogPost(slug: string) {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'blog-posts',
      where: {
        and: [
          { slug: { equals: slug } },
          { status: { equals: 'published' } },
        ],
      },
      depth: 1,
      limit: 1,
    })
    return result.docs[0] ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return buildMetadata({ title: 'Post Not Found', noIndex: true })
  }

  return buildMetadata({
    title: post.seo?.metaTitle ?? post.title,
    description: post.seo?.metaDescription ?? post.excerpt,
    path: `/blog/${slug}`,
    ogImage: getMediaUrl(post.seo?.ogImage) ?? getMediaUrl(post.coverImage),
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const coverUrl = getMediaUrl(post.coverImage)

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {coverUrl && (
        <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl">
          <Image src={coverUrl} alt={post.title} fill className="object-cover" priority />
        </div>
      )}
      <h1 className="text-4xl font-bold text-slate-900">{post.title}</h1>
      {post.publishedAt && (
        <time className="mt-2 block text-sm text-slate-500">
          {new Date(post.publishedAt).toLocaleDateString('en-IE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      )}
      <p className="mt-6 text-lg leading-relaxed text-slate-600">{post.excerpt}</p>
    </article>
  )
}

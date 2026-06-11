import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  getBlogPostBySlug,
  getMediaUrl,
  getPublishedBlogSlugs,
} from '@/lib/cms/queries'
import { buildMetadata } from '@/lib/seo/metadata'

export const revalidate = 300

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getPublishedBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

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
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const coverUrl = getMediaUrl(post.coverImage)

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {coverUrl && (
        <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl">
          <Image
            src={coverUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}
      <h1 className="text-4xl font-bold text-slate-900">{post.title}</h1>
      {post.publishedAt && (
        <time className="mt-2 block text-sm text-slate-500" dateTime={post.publishedAt}>
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

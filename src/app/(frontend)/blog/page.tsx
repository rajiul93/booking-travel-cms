import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPublishedBlogPosts, getMediaUrl } from '@/lib/cms/queries'
import { buildMetadata } from '@/lib/seo/metadata'

export const revalidate = 300

export const metadata: Metadata = buildMetadata({
  title: 'Blog',
  description: 'Travel tips, guides, and stories from Dream Tourism.',
  path: '/blog',
})

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts(20)

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-slate-900">Travel Blog</h1>
      <p className="mt-3 text-lg text-slate-600">Tips, guides, and inspiration for your Italian adventure.</p>

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.docs.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="relative aspect-video bg-slate-100">
              {getMediaUrl(post.coverImage) && (
                <Image
                  src={getMediaUrl(post.coverImage)!}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition group-hover:scale-105"
                />
              )}
            </div>
            <div className="p-5">
              <h2 className="font-semibold text-slate-900 group-hover:text-sky-600">{post.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>

      {posts.docs.length === 0 && (
        <p className="py-20 text-center text-slate-500">Blog posts will appear here once published.</p>
      )}
    </div>
  )
}

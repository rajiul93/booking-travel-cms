import { revalidatePath, revalidateTag } from 'next/cache'

export const CMS_CACHE_TAGS = {
  siteSettings: 'cms-site-settings',
  homepage: 'cms-homepage',
  tours: 'cms-tours',
  featuredTours: 'cms-featured-tours',
  tourCategories: 'cms-tour-categories',
  countries: 'cms-countries',
  blog: 'cms-blog',
  pages: 'cms-pages',
  sitemap: 'cms-sitemap',
} as const

export function revalidatePublicSite(options?: { tourSlug?: string; blogSlug?: string; pageSlug?: string }) {
  revalidatePath('/')
  revalidatePath('/tours')
  revalidatePath('/blog')
  revalidatePath('/sitemap.xml')

  revalidateTag(CMS_CACHE_TAGS.homepage)
  revalidateTag(CMS_CACHE_TAGS.siteSettings)
  revalidateTag(CMS_CACHE_TAGS.tours)
  revalidateTag(CMS_CACHE_TAGS.featuredTours)
  revalidateTag(CMS_CACHE_TAGS.tourCategories)
  revalidateTag(CMS_CACHE_TAGS.countries)
  revalidateTag(CMS_CACHE_TAGS.blog)
  revalidateTag(CMS_CACHE_TAGS.pages)
  revalidateTag(CMS_CACHE_TAGS.sitemap)

  if (options?.tourSlug) {
    revalidatePath(`/tours/${options.tourSlug}`)
  }

  if (options?.blogSlug) {
    revalidatePath(`/blog/${options.blogSlug}`)
  }

  if (options?.pageSlug) {
    revalidatePath(`/${options.pageSlug}`)
  }
}

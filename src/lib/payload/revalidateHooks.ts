import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'
import { revalidatePublicSite } from '@/lib/cms/revalidate'

export const revalidateAfterTourChange: CollectionAfterChangeHook = ({ doc }) => {
  revalidatePublicSite({ tourSlug: typeof doc.slug === 'string' ? doc.slug : undefined })
}

export const revalidateAfterBlogChange: CollectionAfterChangeHook = ({ doc }) => {
  revalidatePublicSite({ blogSlug: typeof doc.slug === 'string' ? doc.slug : undefined })
}

export const revalidateAfterPageChange: CollectionAfterChangeHook = ({ doc }) => {
  revalidatePublicSite({ pageSlug: typeof doc.slug === 'string' ? doc.slug : undefined })
}

export const revalidateAfterContentChange: CollectionAfterChangeHook = () => {
  revalidatePublicSite()
}

export const revalidateAfterSiteSettingsChange: GlobalAfterChangeHook = () => {
  revalidatePublicSite()
}

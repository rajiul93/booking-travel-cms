import type { CollectionConfig } from 'payload'
import { staffCanManageTours } from '@/access/roles'
import { isDocumentPublished, sanitizeOptionalDate } from '@/lib/payload/helpers'
import { applySlugToData, slugFieldAdmin, validateSlugValue } from '@/lib/payload/slug'
import { revalidateAfterBlogChange } from '@/lib/payload/revalidateHooks'
import { hasRichTextContent } from '@/lib/validation/richText'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt'],
  },
  access: {
    create: staffCanManageTours,
    read: () => true,
    update: staffCanManageTours,
    delete: staffCanManageTours,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data

        applySlugToData(data as Record<string, unknown>)

        if ('publishedAt' in data) {
          data.publishedAt = sanitizeOptionalDate(data.publishedAt)
        }

        return data
      },
    ],
    afterChange: [revalidateAfterBlogChange],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validateSlugValue,
      admin: slugFieldAdmin,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Optional. Leave empty to save without a publish date.',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Recommended before publishing.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      validate: (value, { data, siblingData }) => {
        if (!isDocumentPublished(data, siblingData)) return true

        if (!hasRichTextContent(value)) {
          return 'Content is required when publishing a blog post.'
        }

        return true
      },
      admin: {
        description: 'Optional while saving as draft. Required when status is Published.',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}

import type { CollectionConfig } from 'payload'
import { staffCanManageTours } from '@/access/roles'
import { applySlugToData, slugFieldAdmin, validateSlugValue } from '@/lib/payload/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
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
      ({ data }) => applySlugToData(data as Record<string, unknown> | undefined),
    ],
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
      name: 'content',
      type: 'richText',
      required: true,
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

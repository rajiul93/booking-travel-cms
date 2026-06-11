import type { CollectionConfig } from 'payload'
import { staffCanManageTours } from '@/access/roles'
import { isDocumentPublished } from '@/lib/payload/helpers'
import { applySlugToData, slugFieldAdmin, validateSlugValue } from '@/lib/payload/slug'
import { hasRichTextContent } from '@/lib/validation/richText'

export const Tours: CollectionConfig = {
  slug: 'tours',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'bokunActivityId', 'featured', 'status', 'updatedAt'],
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
      admin: {
        position: 'sidebar',
        ...slugFieldAdmin,
      },
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
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'bokunActivityId',
      type: 'number',
      required: true,
      admin: {
        description: 'Bókun activity ID for live availability and booking sync',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      validate: (value, { data, siblingData }) => {
        if (!isDocumentPublished(data, siblingData)) return true

        if (!hasRichTextContent(value)) {
          return 'Description is required when publishing a tour.'
        }

        return true
      },
      admin: {
        description:
          'Optional while saving as draft. Required when status is Published.',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Required before publishing — used on tour cards and detail hero.',
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 0,
      max: 5,
      defaultValue: 4.5,
      admin: {
        step: 0.1,
      },
    },
    {
      name: 'reviewCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'duration',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "3 hours", "Full day"',
      },
    },
    {
      name: 'location',
      type: 'text',
      required: true,
    },
    {
      name: 'categories',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Adventure', value: 'adventure' },
        { label: 'Cultural', value: 'cultural' },
        { label: 'Food & Wine', value: 'food-wine' },
        { label: 'Nature', value: 'nature' },
        { label: 'City Tours', value: 'city-tours' },
        { label: 'Day Trips', value: 'day-trips' },
      ],
    },
    {
      name: 'highlights',
      type: 'array',
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'included',
      type: 'array',
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'excluded',
      type: 'array',
      fields: [
        {
          name: 'item',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'itinerary',
      type: 'array',
      fields: [
        {
          name: 'time',
          type: 'text',
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'reviews',
      type: 'array',
      fields: [
        {
          name: 'author',
          type: 'text',
          required: true,
        },
        {
          name: 'rating',
          type: 'number',
          min: 1,
          max: 5,
          required: true,
        },
        {
          name: 'comment',
          type: 'textarea',
          required: true,
        },
        {
          name: 'date',
          type: 'date',
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}

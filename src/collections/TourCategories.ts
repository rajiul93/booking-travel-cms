import type { CollectionConfig } from 'payload'
import { staffCanManageTours } from '@/access/roles'
import { applySlugToData, slugFieldAdmin, validateSlugValue } from '@/lib/payload/slug'
import { revalidateAfterContentChange } from '@/lib/payload/revalidateHooks'

export const TourCategories: CollectionConfig = {
  slug: 'tour-categories',
  labels: {
    singular: 'Tour Category',
    plural: 'Tour Categories',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    description: 'Manage tour categories used in tour create/edit and the /tours page filter.',
  },
  access: {
    create: staffCanManageTours,
    read: () => true,
    update: staffCanManageTours,
    delete: staffCanManageTours,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => applySlugToData(data as Record<string, unknown> | undefined),
    ],
    afterChange: [revalidateAfterContentChange],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Category Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validateSlugValue,
      admin: {
        ...slugFieldAdmin,
      },
    },
  ],
}

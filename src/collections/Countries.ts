import type { CollectionConfig } from 'payload'
import { staffCanManageTours } from '@/access/roles'

export const Countries: CollectionConfig = {
  slug: 'countries',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'updatedAt'],
    description: 'Single place to manage countries for tours and the homepage location picker.',
  },
  access: {
    create: staffCanManageTours,
    read: () => true,
    update: staffCanManageTours,
    delete: staffCanManageTours,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.code && typeof data.code === 'string') {
          data.code = data.code.trim().toUpperCase()
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Country Name',
      admin: {
        description: 'e.g. Italy, Saudi Arabia',
      },
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Country Code',
      admin: {
        description: 'ISO 2-letter code used for flags and search, e.g. IT, SA',
      },
      validate: (value: unknown) => {
        if (!value || typeof value !== 'string' || !/^[A-Za-z]{2}$/.test(value.trim())) {
          return 'Enter a 2-letter country code (e.g. IT)'
        }
        return true
      },
    },
  ],
}

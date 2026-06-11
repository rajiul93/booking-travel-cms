import type { CollectionConfig } from 'payload'
import { isAdmin, adminOrSelf, isAdminFieldLevel } from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'createdAt'],
  },
  auth: true,
  access: {
    create: isAdmin,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Staff', value: 'staff' },
      ],
      access: {
        update: isAdminFieldLevel,
      },
    },
  ],
}

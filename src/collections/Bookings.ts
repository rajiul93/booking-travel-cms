import type { CollectionConfig } from 'payload'
import { staffCanViewBookings } from '@/access/roles'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: {
    useAsTitle: 'bookingReference',
    defaultColumns: [
      'bookingReference',
      'customerEmail',
      'tour',
      'tourDate',
      'status',
      'totalAmount',
      'createdAt',
    ],
  },
  access: {
    create: () => true,
    read: staffCanViewBookings,
    update: staffCanViewBookings,
    delete: staffCanViewBookings,
  },
  fields: [
    {
      name: 'bookingReference',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'tour',
      type: 'relationship',
      relationTo: 'tours',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending Payment', value: 'pending' },
        { label: 'Reserved', value: 'reserved' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'customer',
      type: 'group',
      fields: [
        { name: 'firstName', type: 'text', required: true },
        { name: 'lastName', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
      ],
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
      admin: {
        description: 'Denormalized for admin list views',
      },
    },
    {
      name: 'tourDate',
      type: 'date',
      required: true,
    },
    {
      name: 'tourTime',
      type: 'text',
      required: true,
    },
    {
      name: 'startTimeId',
      type: 'number',
    },
    {
      name: 'rateId',
      type: 'number',
      required: true,
    },
    {
      name: 'availabilityId',
      type: 'text',
      required: true,
    },
    {
      name: 'adults',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'children',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        { name: 'adultPrice', type: 'number', required: true },
        { name: 'childPrice', type: 'number', required: true },
        { name: 'totalAmount', type: 'number', required: true },
        { name: 'currency', type: 'text', required: true, defaultValue: 'EUR' },
      ],
    },
    {
      name: 'bokunConfirmationCode',
      type: 'text',
      index: true,
    },
    {
      name: 'stripeSessionId',
      type: 'text',
      index: true,
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
    },
    {
      name: 'refundId',
      type: 'text',
      admin: {
        description: 'Stripe refund ID if applicable',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
  timestamps: true,
}

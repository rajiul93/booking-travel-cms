import type { GlobalConfig } from 'payload'
import { staffCanManageTours } from '@/access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
    update: staffCanManageTours,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            {
              name: 'heroSlides',
              type: 'array',
              label: 'Hero Image Slider',
              minRows: 1,
              admin: {
                description:
                  'Add one or more images for the homepage hero slider. Drag rows to reorder.',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: 'Slide Image',
                },
                {
                  name: 'alt',
                  type: 'text',
                  label: 'Alt Text',
                  admin: {
                    description: 'Short description for accessibility and SEO.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroSliderAutoplay',
                  type: 'checkbox',
                  label: 'Autoplay Slider',
                  defaultValue: true,
                },
                {
                  name: 'heroSliderInterval',
                  type: 'number',
                  label: 'Slide Interval (seconds)',
                  defaultValue: 5,
                  min: 3,
                  max: 15,
                  admin: {
                    condition: (_, siblingData) => siblingData?.heroSliderAutoplay === true,
                  },
                },
              ],
            },
            {
              name: 'heroEyebrow',
              type: 'text',
              label: 'Eyebrow Text',
            },
            {
              name: 'heroTitle',
              type: 'text',
              label: 'Hero Title',
            },
            {
              name: 'heroSubtitle',
              type: 'textarea',
              label: 'Hero Subtitle',
            },
          ],
        },
        {
          label: 'Testimonials',
          fields: [
            {
              name: 'testimonials',
              type: 'array',
              label: 'Testimonials',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'location', type: 'text', required: true },
                { name: 'text', type: 'textarea', required: true },
                {
                  name: 'rating',
                  type: 'number',
                  min: 1,
                  max: 5,
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'CTA',
          fields: [
            {
              name: 'ctaTitle',
              type: 'text',
              label: 'CTA Title',
            },
            {
              name: 'ctaSubtitle',
              type: 'textarea',
              label: 'CTA Subtitle',
            },
          ],
        },
      ],
    },
  ],
}

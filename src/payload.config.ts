import 'dotenv/config'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Countries } from './collections/Countries'
import { TourCategories } from './collections/TourCategories'
import { Tours } from './collections/Tours'
import { Bookings } from './collections/Bookings'
import { BlogPosts } from './collections/BlogPosts'
import { Pages } from './collections/Pages'
import { SiteSettings } from './globals/SiteSettings'
import { r2StoragePlugin } from './lib/storage/r2'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Dream Tourism Admin',
    },
  },
  collections: [Users, Media, Countries, TourCategories, Tours, Bookings, BlogPosts, Pages],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  localization: {
    locales: ['en', 'it'],
    defaultLocale: 'en',
    fallback: true,
  },
  plugins: [r2StoragePlugin()],
})

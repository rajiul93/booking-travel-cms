/**
 * Drops database tables that are no longer used by the project config.
 * Run: npm run db:cleanup
 */
import 'dotenv/config'
import pg from 'pg'

/** Tables still required by Payload CMS for this project */
export const REQUIRED_TABLES = [
  // Collections
  'users',
  'users_sessions',
  'media',
  'countries',
  'tour_categories',
  'tours',
  'tours_rels',
  'tours_excluded',
  'tours_gallery',
  'tours_highlights',
  'tours_included',
  'tours_itinerary',
  'tours_reviews',
  'bookings',
  'blog_posts',
  'pages',
  // Draft/version tables
  '_tours_v',
  '_tours_v_version_categories',
  '_tours_v_version_excluded',
  '_tours_v_version_gallery',
  '_tours_v_version_highlights',
  '_tours_v_version_included',
  '_tours_v_version_itinerary',
  '_tours_v_version_reviews',
  '_blog_posts_v',
  '_pages_v',
  // Payload internals
  'payload_kv',
  'payload_locked_documents',
  'payload_locked_documents_rels',
  'payload_migrations',
  'payload_preferences',
  'payload_preferences_rels',
  'site_settings',
  'site_settings_hero_slides',
  'site_settings_testimonials',
]

/** Orphaned tables removed from project config */
const ORPHAN_TABLES = [
  'homepage_destinations',
  'homepage',
  'tours_categories',
  '_tours_v_version_categories',
]

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URI })

async function tableExists(table) {
  const result = await pool.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [table],
  )
  return result.rowCount > 0
}

async function main() {
  console.log('Cleaning up orphaned database tables...\n')

  for (const table of ORPHAN_TABLES) {
    if (await tableExists(table)) {
      await pool.query(`DROP TABLE IF EXISTS "${table}" CASCADE`)
      console.log(`Dropped table: ${table}`)
    } else {
      console.log(`Already removed: ${table}`)
    }
  }

  const prefs = await pool.query(
    `DELETE FROM payload_preferences WHERE key ILIKE '%homepage%' RETURNING id`,
  )
  if (prefs.rowCount > 0) {
    console.log(`Removed ${prefs.rowCount} homepage preference row(s)`)
  }

  const allTables = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `)

  const extras = allTables.rows
    .map((row) => row.table_name)
    .filter((name) => !REQUIRED_TABLES.includes(name))

  console.log('\nRemaining tables:', allTables.rowCount)

  if (extras.length > 0) {
    console.log('\nUnexpected extra tables (review manually):')
    extras.forEach((name) => console.log(`  - ${name}`))
  } else {
    console.log('No extra tables remain — database matches the project.')
  }

  await pool.end()
}

main().catch(async (error) => {
  console.error('Cleanup failed:', error)
  await pool.end()
  process.exit(1)
})

/**
 * Creates hero slider tables/columns and migrates legacy hero_image_id into slides.
 * Run: npm run db:migrate-hero-slider
 */
import 'dotenv/config'
import pg from 'pg'
import { randomUUID } from 'crypto'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URI })

async function tableExists(table) {
  const result = await pool.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [table],
  )
  return result.rowCount > 0
}

async function columnExists(table, column) {
  const result = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column],
  )
  return result.rowCount > 0
}

async function main() {
  console.log('Starting hero slider migration...')

  if (!(await columnExists('site_settings', 'hero_slider_autoplay'))) {
    await pool.query(
      `ALTER TABLE site_settings ADD COLUMN hero_slider_autoplay boolean DEFAULT true`,
    )
    console.log('Added site_settings.hero_slider_autoplay')
  }

  if (!(await columnExists('site_settings', 'hero_slider_interval'))) {
    await pool.query(
      `ALTER TABLE site_settings ADD COLUMN hero_slider_interval numeric DEFAULT 5`,
    )
    console.log('Added site_settings.hero_slider_interval')
  }

  if (!(await tableExists('site_settings_hero_slides'))) {
    await pool.query(`
      CREATE TABLE site_settings_hero_slides (
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES site_settings(id) ON DELETE CASCADE,
        id varchar PRIMARY KEY,
        image_id integer REFERENCES media(id) ON DELETE SET NULL,
        alt varchar
      )
    `)
    await pool.query(
      `CREATE INDEX site_settings_hero_slides_order_idx ON site_settings_hero_slides (_order)`,
    )
    await pool.query(
      `CREATE INDEX site_settings_hero_slides_parent_id_idx ON site_settings_hero_slides (_parent_id)`,
    )
    await pool.query(
      `CREATE INDEX site_settings_hero_slides_image_idx ON site_settings_hero_slides (image_id)`,
    )
    console.log('Created site_settings_hero_slides table')
  }

  const settings = await pool.query(`SELECT id, hero_image_id FROM site_settings LIMIT 1`)
  const slideCount = await pool.query(`SELECT COUNT(*)::int AS count FROM site_settings_hero_slides`)

  if (settings.rows[0]?.hero_image_id && slideCount.rows[0].count === 0) {
    const parentId = settings.rows[0].id
    const imageId = settings.rows[0].hero_image_id
    await pool.query(
      `INSERT INTO site_settings_hero_slides (_order, _parent_id, id, image_id, alt)
       VALUES (1, $1, $2, $3, $4)`,
      [parentId, randomUUID(), imageId, 'Hero image'],
    )
    console.log('Migrated legacy hero_image_id into first slider slide')
  }

  if (!(await pool.query(`SELECT id FROM site_settings LIMIT 1`)).rows[0]) {
    await pool.query(`INSERT INTO site_settings DEFAULT VALUES`)
    console.log('Created default site_settings row')
  }

  if (await columnExists('site_settings', 'hero_image_id')) {
    await pool.query(`ALTER TABLE site_settings DROP COLUMN hero_image_id`)
    console.log('Dropped legacy site_settings.hero_image_id')
  }

  console.log('Migration complete.')
  await pool.end()
}

main().catch(async (error) => {
  console.error('Migration failed:', error)
  await pool.end()
  process.exit(1)
})

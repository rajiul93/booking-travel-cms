/**
 * One-time migration: static categories enum → tour_categories collection + relationships.
 * Run: npm run db:migrate-tour-categories
 */
import 'dotenv/config'
import pg from 'pg'

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
  console.log('Starting tour categories migration...')

  if (!(await tableExists('tour_categories'))) {
    await pool.query(`
      CREATE TABLE tour_categories (
        id serial PRIMARY KEY,
        name varchar NOT NULL,
        slug varchar NOT NULL,
        updated_at timestamptz(3) DEFAULT now() NOT NULL,
        created_at timestamptz(3) DEFAULT now() NOT NULL
      )
    `)
    await pool.query(`CREATE UNIQUE INDEX tour_categories_slug_idx ON tour_categories (slug)`)
    await pool.query(`CREATE INDEX tour_categories_updated_at_idx ON tour_categories (updated_at)`)
    await pool.query(`CREATE INDEX tour_categories_created_at_idx ON tour_categories (created_at)`)
    console.log('Created tour_categories table')
  }

  if (!(await tableExists('tours_rels'))) {
    await pool.query(`
      CREATE TABLE tours_rels (
        id serial PRIMARY KEY,
        "order" integer,
        parent_id integer NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
        path varchar NOT NULL,
        tour_categories_id integer REFERENCES tour_categories(id) ON DELETE CASCADE
      )
    `)
    await pool.query(`CREATE INDEX tours_rels_order_idx ON tours_rels ("order")`)
    await pool.query(`CREATE INDEX tours_rels_parent_idx ON tours_rels (parent_id)`)
    await pool.query(`CREATE INDEX tours_rels_path_idx ON tours_rels (path)`)
    await pool.query(
      `CREATE INDEX tours_rels_tour_categories_id_idx ON tours_rels (tour_categories_id)`,
    )
    console.log('Created tours_rels table')
  }

  if (!(await tableExists('_tours_v_rels'))) {
    await pool.query(`
      CREATE TABLE _tours_v_rels (
        id serial PRIMARY KEY,
        "order" integer,
        parent_id integer NOT NULL REFERENCES _tours_v(id) ON DELETE CASCADE,
        path varchar NOT NULL,
        tour_categories_id integer REFERENCES tour_categories(id) ON DELETE CASCADE
      )
    `)
    await pool.query(`CREATE INDEX _tours_v_rels_order_idx ON _tours_v_rels ("order")`)
    await pool.query(`CREATE INDEX _tours_v_rels_parent_idx ON _tours_v_rels (parent_id)`)
    await pool.query(`CREATE INDEX _tours_v_rels_path_idx ON _tours_v_rels (path)`)
    await pool.query(
      `CREATE INDEX _tours_v_rels_tour_categories_id_idx ON _tours_v_rels (tour_categories_id)`,
    )
    console.log('Created _tours_v_rels table')
  }

  if (!(await tableExists('site_settings'))) {
    await pool.query(`
      CREATE TABLE site_settings (
        id serial PRIMARY KEY,
        hero_image_id integer REFERENCES media(id) ON DELETE SET NULL,
        hero_eyebrow varchar,
        hero_title varchar,
        hero_subtitle varchar,
        cta_title varchar,
        cta_subtitle varchar,
        updated_at timestamptz(3),
        created_at timestamptz(3)
      )
    `)
    await pool.query(`CREATE INDEX site_settings_hero_image_idx ON site_settings (hero_image_id)`)
    console.log('Created site_settings table')
  }

  if (!(await tableExists('site_settings_testimonials'))) {
    await pool.query(`
      CREATE TABLE site_settings_testimonials (
        _order integer NOT NULL,
        _parent_id integer NOT NULL REFERENCES site_settings(id) ON DELETE CASCADE,
        id varchar PRIMARY KEY,
        name varchar NOT NULL,
        location varchar NOT NULL,
        text varchar NOT NULL,
        rating numeric NOT NULL
      )
    `)
    await pool.query(
      `CREATE INDEX site_settings_testimonials_order_idx ON site_settings_testimonials (_order)`,
    )
    await pool.query(
      `CREATE INDEX site_settings_testimonials_parent_id_idx ON site_settings_testimonials (_parent_id)`,
    )
    console.log('Created site_settings_testimonials table')
  }

  if (!(await columnExists('payload_locked_documents_rels', 'tour_categories_id'))) {
    await pool.query(`
      ALTER TABLE payload_locked_documents_rels
      ADD COLUMN tour_categories_id integer REFERENCES tour_categories(id) ON DELETE CASCADE
    `)
    await pool.query(
      `CREATE INDEX payload_locked_documents_rels_tour_categories_id_idx ON payload_locked_documents_rels (tour_categories_id)`,
    )
    console.log('Added tour_categories_id to payload_locked_documents_rels')
  }

  if (await tableExists('tours_categories')) {
    await pool.query(`DROP TABLE tours_categories CASCADE`)
    console.log('Dropped tours_categories')
  }

  if (await tableExists('_tours_v_version_categories')) {
    await pool.query(`DROP TABLE _tours_v_version_categories CASCADE`)
    console.log('Dropped _tours_v_version_categories')
  }

  await pool.query(`DROP TYPE IF EXISTS enum_tours_categories CASCADE`)
  await pool.query(`DROP TYPE IF EXISTS enum__tours_v_version_categories CASCADE`)

  console.log('Migration complete.')
  await pool.end()
}

main().catch(async (error) => {
  console.error('Migration failed:', error)
  await pool.end()
  process.exit(1)
})

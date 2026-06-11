/**
 * One-time migration: static country_code enums → countries collection + relationships.
 * Run: node scripts/migrate-countries.mjs
 */
import 'dotenv/config'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URI })

async function columnExists(table, column) {
  const result = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column],
  )
  return result.rowCount > 0
}

async function tableExists(table) {
  const result = await pool.query(
    `SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = $1`,
    [table],
  )
  return result.rowCount > 0
}

async function ensureCountry(name, code) {
  const upperCode = code.toUpperCase()
  const existing = await pool.query(`SELECT id FROM countries WHERE code = $1`, [upperCode])
  if (existing.rows[0]) return existing.rows[0].id

  const inserted = await pool.query(
    `INSERT INTO countries (name, code, created_at, updated_at)
     VALUES ($1, $2, NOW(), NOW()) RETURNING id`,
    [name, upperCode],
  )
  return inserted.rows[0].id
}

async function main() {
  console.log('Starting countries migration...')

  if (!(await tableExists('countries'))) {
    await pool.query(`
      CREATE TABLE countries (
        id serial PRIMARY KEY,
        name varchar NOT NULL,
        code varchar NOT NULL,
        updated_at timestamptz(3) DEFAULT now() NOT NULL,
        created_at timestamptz(3) DEFAULT now() NOT NULL
      )
    `)
    await pool.query(`CREATE UNIQUE INDEX countries_code_idx ON countries (code)`)
    console.log('Created countries table')
  }

  if (await columnExists('homepage_destinations', 'name')) {
    const homepageRows = await pool.query(
      `SELECT name, country_code::text AS code FROM homepage_destinations WHERE name IS NOT NULL`,
    )
    for (const row of homepageRows.rows) {
      const code = row.code?.toUpperCase()
      if (!code) continue
      await ensureCountry(row.name, code)
    }
    console.log(`Seeded countries from homepage (${homepageRows.rowCount} rows)`)
  }

  if (await columnExists('tours', 'country_code')) {
    const tourCodes = await pool.query(
      `SELECT DISTINCT country_code::text AS code FROM tours WHERE country_code IS NOT NULL`,
    )
    for (const row of tourCodes.rows) {
      const code = row.code?.toUpperCase()
      if (!code) continue
      await ensureCountry(code, code)
    }
    console.log(`Seeded countries from tours (${tourCodes.rowCount} codes)`)
  }

  if (!(await columnExists('tours', 'country_id'))) {
    await pool.query(`ALTER TABLE tours ADD COLUMN country_id integer`)
    console.log('Added tours.country_id')
  }

  if (await columnExists('tours', 'country_code')) {
    await pool.query(`
      UPDATE tours t
      SET country_id = c.id
      FROM countries c
      WHERE UPPER(t.country_code::text) = c.code
    `)
    await pool.query(`ALTER TABLE tours DROP COLUMN country_code`)
    console.log('Migrated tours.country_code → country_id')
  }

  if (await tableExists('_tours_v') && !(await columnExists('_tours_v', 'version_country_id'))) {
    await pool.query(`ALTER TABLE _tours_v ADD COLUMN version_country_id integer`)
  }

  if (await tableExists('_tours_v') && (await columnExists('_tours_v', 'version_country_code'))) {
    await pool.query(`
      UPDATE _tours_v t
      SET version_country_id = c.id
      FROM countries c
      WHERE UPPER(t.version_country_code::text) = c.code
    `)
    await pool.query(`ALTER TABLE _tours_v DROP COLUMN version_country_code`)
    console.log('Migrated _tours_v version_country_code → version_country_id')
  }

  if (!(await columnExists('homepage_destinations', 'country_id'))) {
    await pool.query(`ALTER TABLE homepage_destinations ADD COLUMN country_id integer`)
    console.log('Added homepage_destinations.country_id')
  }

  if (await columnExists('homepage_destinations', 'country_code')) {
    await pool.query(`
      UPDATE homepage_destinations h
      SET country_id = c.id
      FROM countries c
      WHERE UPPER(h.country_code::text) = c.code
         OR (h.name IS NOT NULL AND h.name = c.name)
    `)
    await pool.query(`ALTER TABLE homepage_destinations DROP COLUMN country_code`)
    console.log('Dropped homepage_destinations.country_code')
  }

  if (await columnExists('homepage_destinations', 'name')) {
    await pool.query(`ALTER TABLE homepage_destinations DROP COLUMN name`)
    console.log('Dropped homepage_destinations.name')
  }

  await pool.query(`DROP TYPE IF EXISTS enum_tours_country_code CASCADE`)
  await pool.query(`DROP TYPE IF EXISTS enum__tours_v_version_country_code CASCADE`)
  await pool.query(`DROP TYPE IF EXISTS enum_homepage_destinations_country_code CASCADE`)

  console.log('Migration complete.')
  await pool.end()
}

main().catch(async (error) => {
  console.error('Migration failed:', error)
  await pool.end()
  process.exit(1)
})

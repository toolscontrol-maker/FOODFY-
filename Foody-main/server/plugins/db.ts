/* ─────────────────────────────────────────────────────────
   Nitro Plugin — Initializes SQLite database on server start.
   Runs migrations (DDL) and seeds data if empty.
   ───────────────────────────────────────────────────────── */
import { runMigrations } from '../db/migrate'
import { seedDatabase } from '../db/seed'

export default defineNitroPlugin(async () => {
  console.log('[DB] Running migrations...')
  await runMigrations()

  console.log('[DB] Checking seed...')
  await seedDatabase()
  console.log('[DB] Database ready.')
})

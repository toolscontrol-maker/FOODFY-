/* ─────────────────────────────────────────────────────────
   Database Connection — SQLite via @libsql/client + Drizzle
   Singleton instance shared across all Nitro handlers.
   ───────────────────────────────────────────────────────── */
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { resolve } from 'path'
import * as schema from './schema'

const DB_PATH = resolve(process.cwd(), 'server/db/foody.db')

const client = createClient({ url: `file:${DB_PATH}` })

export const db = drizzle(client, { schema })
export const rawClient = client

export { schema }

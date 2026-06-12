import { db, schema } from '~/server/db/index'
import { eq, desc, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  let q = db.select().from(schema.analyticsEvents).orderBy(desc(schema.analyticsEvents.timestamp))

  const conditions = []
  if (query.type && typeof query.type === 'string') {
    conditions.push(eq(schema.analyticsEvents.type, query.type))
  }
  if (query.sessionId && typeof query.sessionId === 'string') {
    conditions.push(eq(schema.analyticsEvents.sessionId, query.sessionId))
  }

  let built = conditions.length > 0 ? q.where(and(...conditions)) : q

  let limit = 100
  if (query.limit && typeof query.limit === 'string') {
    const parsed = parseInt(query.limit, 10)
    if (!isNaN(parsed) && parsed > 0) limit = parsed
  }

  return await built.limit(limit).all()
})

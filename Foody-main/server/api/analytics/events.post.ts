import { db, schema } from '~/server/db/index'
import type { AnalyticsEvent } from '~/types/commerce'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<AnalyticsEvent>>(event)

  if (!body.type) {
    throw createError({ statusCode: 400, statusMessage: 'Event type is required' })
  }

  const row = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: body.type,
    timestamp: body.timestamp || new Date().toISOString(),
    sessionId: body.sessionId || 'anonymous',
    payload: body.payload || {},
  }

  await db.insert(schema.analyticsEvents).values(row).run()
  return row
})

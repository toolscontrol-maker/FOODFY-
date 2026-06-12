/* ─────────────────────────────────────────────────────────
   POST /api/themes
   Installs a new theme from the library into the database.
   Generates fresh IDs for all entities (theme, templates,
   sections, blocks) to avoid collisions with existing themes.
   ───────────────────────────────────────────────────────── */
import { db, schema } from '~/server/db/index'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'uncrypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.id || !body?.name || !Array.isArray(body?.templates)) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required theme fields: id, name, templates' })
  }

  /* Guard: prevent duplicate install by library id prefix */
  const existing = await db.select({ id: schema.themes.id })
    .from(schema.themes)
    .where(eq(schema.themes.id, body.id))
    .get()

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: `Theme "${body.id}" is already installed` })
  }

  const now = new Date().toISOString()
  const themeId = body.id

  /* Insert theme row */
  await db.insert(schema.themes).values({
    id: themeId,
    name: body.name,
    role: 'unpublished',
    version: '1.0.0',
    schemaVersion: 1,
    previewImage: body.previewImage ?? '',
    lastSaved: now,
    lastPublished: now,
    globalSettings: body.globalSettings ?? {},
  }).run()

  /* Insert templates → sections → blocks */
  for (const tmplDef of body.templates) {
    const tmplId = `tmpl-${themeId}-${tmplDef.name}-${randomUUID().slice(0, 8)}`

    await db.insert(schema.themeTemplates).values({
      id: tmplId,
      themeId,
      name: tmplDef.name,
      label: tmplDef.label,
    }).run()

    for (let secIdx = 0; secIdx < tmplDef.sections.length; secIdx++) {
      const secDef = tmplDef.sections[secIdx]
      const secId = `sec-${tmplId}-${secIdx}-${randomUUID().slice(0, 8)}`

      await db.insert(schema.themeSections).values({
        id: secId,
        templateId: tmplId,
        type: secDef.type,
        displayName: secDef.displayName,
        order: secIdx,
        hidden: secDef.hidden ?? false,
        settings: secDef.settings ?? [],
        maxBlocks: secDef.maxBlocks ?? null,
      }).run()

      const blocks = secDef.blocks ?? []
      for (let blkIdx = 0; blkIdx < blocks.length; blkIdx++) {
        const blkDef = blocks[blkIdx]
        const blkId = `blk-${secId}-${blkIdx}-${randomUUID().slice(0, 8)}`

        await db.insert(schema.themeBlocks).values({
          id: blkId,
          sectionId: secId,
          type: blkDef.type,
          displayName: blkDef.displayName,
          order: blkIdx,
          hidden: blkDef.hidden ?? false,
          settings: blkDef.settings ?? [],
          appId: null,
        }).run()
      }
    }
  }

  /* Return the full newly-created theme by re-fetching it */
  const theme = await db.select().from(schema.themes).where(eq(schema.themes.id, themeId)).get()
  const templates = await db.select().from(schema.themeTemplates).where(eq(schema.themeTemplates.themeId, themeId)).all()

  return {
    id: theme!.id,
    name: theme!.name,
    role: theme!.role,
    version: theme!.version,
    schemaVersion: theme!.schemaVersion,
    previewImage: theme!.previewImage,
    lastSaved: theme!.lastSaved,
    lastPublished: theme!.lastPublished,
    globalSettings: theme!.globalSettings,
    templates: await Promise.all(templates.map(async tmpl => {
      const sections = await db.select().from(schema.themeSections)
        .where(eq(schema.themeSections.templateId, tmpl.id)).all()
      return {
        id: tmpl.id, name: tmpl.name, label: tmpl.label,
        sections: await Promise.all(sections.map(async sec => {
          const blocks = await db.select().from(schema.themeBlocks)
            .where(eq(schema.themeBlocks.sectionId, sec.id)).all()
          return {
            id: sec.id, type: sec.type, displayName: sec.displayName,
            order: sec.order, hidden: sec.hidden, settings: sec.settings,
            maxBlocks: sec.maxBlocks,
            blocks: blocks.map(blk => ({
              id: blk.id, type: blk.type, displayName: blk.displayName,
              order: blk.order, hidden: blk.hidden, settings: blk.settings, appId: blk.appId,
            })),
          }
        })),
      }
    })),
  }
})

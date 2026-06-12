import { db, schema } from '~/server/db/index'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const existing = await db.select({ id: schema.themes.id }).from(schema.themes).where(eq(schema.themes.id, id)).get()
  const body = await readBody<any>(event)
  const now = new Date().toISOString()

  if (!existing) {
    // Create new theme (used by duplicate flow)
    await db.insert(schema.themes).values({
      id,
      name: body.name ?? 'Nuevo tema',
      role: body.role ?? 'unpublished',
      version: body.version ?? '1.0.0',
      schemaVersion: body.schemaVersion ?? 1,
      previewImage: body.previewImage ?? '',
      lastSaved: now,
      lastPublished: body.lastPublished ?? '',
      globalSettings: body.globalSettings ?? {},
    }).run()
  } else {
    // Update existing theme row
    await db.update(schema.themes).set({
      ...(body.name != null && { name: body.name }),
      ...(body.role != null && { role: body.role }),
      ...(body.version != null && { version: body.version }),
      ...(body.previewImage != null && { previewImage: body.previewImage }),
      ...(body.globalSettings != null && { globalSettings: body.globalSettings }),
      ...(body.lastPublished != null && { lastPublished: body.lastPublished }),
      lastSaved: now,
    }).where(eq(schema.themes.id, id)).run()
  }

  // If templates are provided, replace them entirely
  if (body.templates && Array.isArray(body.templates)) {
    // Delete existing templates (cascades to sections and blocks)
    await db.delete(schema.themeTemplates).where(eq(schema.themeTemplates.themeId, id)).run()

    for (const tmpl of body.templates) {
      await db.insert(schema.themeTemplates).values({
        id: tmpl.id,
        themeId: id,
        name: tmpl.name,
        label: tmpl.label,
      }).run()

      if (tmpl.sections && Array.isArray(tmpl.sections)) {
        for (const sec of tmpl.sections) {
          await db.insert(schema.themeSections).values({
            id: sec.id,
            templateId: tmpl.id,
            type: sec.type,
            displayName: sec.displayName,
            order: sec.order,
            hidden: sec.hidden ? 1 : 0,
            settings: sec.settings ?? [],
            maxBlocks: sec.maxBlocks ?? null,
          }).run()

          if (sec.blocks && Array.isArray(sec.blocks)) {
            for (const blk of sec.blocks) {
              await db.insert(schema.themeBlocks).values({
                id: blk.id,
                sectionId: sec.id,
                type: blk.type,
                displayName: blk.displayName,
                order: blk.order,
                hidden: blk.hidden ? 1 : 0,
                settings: blk.settings ?? [],
                appId: blk.appId ?? null,
              }).run()
            }
          }
        }
      }
    }
  }

  return { success: true, id, lastSaved: now }
})

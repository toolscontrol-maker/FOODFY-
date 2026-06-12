import { db, schema } from '~/server/db/index'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const theme = await db.select().from(schema.themes).where(eq(schema.themes.id, id)).get()

  if (!theme) {
    throw createError({ statusCode: 404, statusMessage: 'Theme not found' })
  }

  const templates = await db.select().from(schema.themeTemplates)
    .where(eq(schema.themeTemplates.themeId, theme.id)).all()

  return {
    ...theme,
    templates: await Promise.all(templates.map(async tmpl => {
      const sections = await db.select().from(schema.themeSections)
        .where(eq(schema.themeSections.templateId, tmpl.id))
        .orderBy(asc(schema.themeSections.order)).all()

      return {
        id: tmpl.id,
        name: tmpl.name,
        label: tmpl.label,
        sections: await Promise.all(sections.map(async sec => {
          const blocks = await db.select().from(schema.themeBlocks)
            .where(eq(schema.themeBlocks.sectionId, sec.id))
            .orderBy(asc(schema.themeBlocks.order)).all()

          return {
            id: sec.id, type: sec.type, displayName: sec.displayName,
            order: sec.order, hidden: sec.hidden, settings: sec.settings,
            maxBlocks: sec.maxBlocks,
            blocks: blocks.map(blk => ({
              id: blk.id, type: blk.type, displayName: blk.displayName,
              order: blk.order, hidden: blk.hidden, settings: blk.settings,
              appId: blk.appId,
            })),
          }
        })),
      }
    })),
  }
})

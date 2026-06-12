import { db, schema } from '~/server/db/index'
import { asc, eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const rows = await db.select().from(schema.recipes).orderBy(asc(schema.recipes.name)).all()

  return Promise.all(rows.map(async (r) => {
    const ingredients = await db.select().from(schema.recipeIngredients)
      .where(eq(schema.recipeIngredients.recipeId, r.id)).all()

    const enriched = await Promise.all(ingredients.map(async (ing) => {
      const item = await db.select().from(schema.warehouseItems)
        .where(eq(schema.warehouseItems.id, ing.warehouseItemId)).get()
      return { ...ing, warehouseItemName: item?.name ?? 'Desconocido' }
    }))

    const product = r.productId
      ? await db.select({ name: schema.products.name }).from(schema.products).where(eq(schema.products.id, r.productId)).get()
      : null

    return {
      ...r,
      productName: product?.name ?? '',
      ingredients: enriched,
    }
  }))
})

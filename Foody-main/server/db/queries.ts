/* ─────────────────────────────────────────────────────────
   DB Query Helpers — Assembles nested objects from
   relational tables to match the frontend types.
   ───────────────────────────────────────────────────────── */
import { db, schema } from './index'
import { eq, desc, asc, sql, and, inArray } from 'drizzle-orm'
import type { Product, ProductVariant, Collection, InventoryLevel, Category } from '~/types/commerce'

/* ── Build full Product with nested relations ── */
export async function getFullProduct(productId: string): Promise<Product | null> {
  const row = await db.select().from(schema.products).where(eq(schema.products.id, productId)).get()
  if (!row) return null
  return assembleProduct(row)
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await db.select().from(schema.products).orderBy(asc(schema.products.name)).all()
  return Promise.all(rows.map(assembleProduct))
}

async function assembleProduct(row: typeof schema.products.$inferSelect): Promise<Product> {
  const variants = await db.select().from(schema.productVariants)
    .where(eq(schema.productVariants.productId, row.id))
    .orderBy(asc(schema.productVariants.position))
    .all()

  const fullVariants: ProductVariant[] = await Promise.all(variants.map(async v => {
    const opts = await db.select().from(schema.variantOptions)
      .where(eq(schema.variantOptions.variantId, v.id))
      .all()
    return {
      id: v.id,
      productId: v.productId,
      name: v.name,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      sku: v.sku,
      barcode: v.barcode,
      inventoryQuantity: v.inventoryQuantity,
      availableForSale: v.availableForSale,
      image: v.image,
      options: opts.map(o => ({ name: o.name, value: o.value })),
      weight: v.weight,
      weightUnit: v.weightUnit as 'g' | 'kg' | 'oz' | 'lb',
      position: v.position,
    }
  }))

  const imagesRaw = await db.select().from(schema.productImages)
    .where(eq(schema.productImages.productId, row.id))
    .orderBy(asc(schema.productImages.position))
    .all()
  const images = imagesRaw.map(i => ({ id: i.id, url: i.url, alt: i.alt, position: i.position }))

  const tagsRaw = await db.select().from(schema.productTags)
    .where(eq(schema.productTags.productId, row.id))
    .all()
  const tags = tagsRaw.map(t => t.tag)

  const modGroups = await db.select().from(schema.modifierGroups)
    .where(eq(schema.modifierGroups.productId, row.id))
    .all()

  const modifiers = await Promise.all(modGroups.map(async g => {
    const opts = await db.select().from(schema.modifierOptions)
      .where(eq(schema.modifierOptions.groupId, g.id))
      .all()
    return {
      id: g.id,
      name: g.name,
      type: g.type as 'single' | 'multiple',
      required: g.required,
      maxSelect: g.maxSelect,
      options: opts.map(o => ({ id: o.id, label: o.label, price: o.price })),
    }
  }))

  return {
    id: row.id,
    handle: row.handle,
    name: row.name,
    description: row.description,
    categoryId: row.categoryId || '',
    categoryName: row.categoryName,
    vendor: row.vendor,
    type: row.type,
    tags,
    status: row.status as 'active' | 'draft' | 'archived',
    publishedAt: row.publishedAt,
    images,
    variants: fullVariants,
    modifiers,
    templateSuffix: row.templateSuffix,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

/* ── Categories ── */
export async function getAllCategories(): Promise<Category[]> {
  return db.select().from(schema.categories).orderBy(asc(schema.categories.position)).all()
}

/* ── Collections ── */
export async function getAllCollections(): Promise<Collection[]> {
  const rows = await db.select().from(schema.collections).orderBy(asc(schema.collections.title)).all()
  return Promise.all(rows.map(assembleCollection))
}

export async function getFullCollection(collectionId: string): Promise<Collection | null> {
  const row = await db.select().from(schema.collections).where(eq(schema.collections.id, collectionId)).get()
  if (!row) return null
  return assembleCollection(row)
}

async function assembleCollection(row: typeof schema.collections.$inferSelect): Promise<Collection> {
  const prods = await db.select().from(schema.collectionProducts)
    .where(eq(schema.collectionProducts.collectionId, row.id))
    .orderBy(asc(schema.collectionProducts.position))
    .all()

  return {
    id: row.id,
    handle: row.handle,
    title: row.title,
    description: row.description,
    image: row.image,
    type: row.type as 'manual' | 'automated',
    status: row.status as 'active' | 'draft',
    productIds: prods.map(p => p.productId),
    sortOrder: row.sortOrder as Collection['sortOrder'],
    themeTemplate: row.themeTemplate ?? '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

/* ── Inventory ── */
export async function getAllInventoryLevels(): Promise<InventoryLevel[]> {
  const rows = await db
    .select({
      variantId: schema.inventoryLevels.variantId,
      available: schema.inventoryLevels.available,
      incoming: schema.inventoryLevels.incoming,
      reserved: schema.inventoryLevels.reserved,
      tracked: schema.inventoryLevels.tracked,
      lowStockThreshold: schema.inventoryLevels.lowStockThreshold,
      sku: schema.productVariants.sku,
      variantName: schema.productVariants.name,
      variantImage: schema.productVariants.image,
      productId: schema.products.id,
      productName: schema.products.name,
      productImage: schema.productImages.url,
    })
    .from(schema.inventoryLevels)
    .innerJoin(schema.productVariants, eq(schema.inventoryLevels.variantId, schema.productVariants.id))
    .innerJoin(schema.products, eq(schema.productVariants.productId, schema.products.id))
    .leftJoin(schema.productImages, and(
      eq(schema.productImages.productId, schema.products.id),
      eq(schema.productImages.position, 0),
    ))
    .all()

  return rows.map(r => ({
    variantId: r.variantId,
    productId: r.productId,
    sku: r.sku,
    productName: r.productName,
    variantName: r.variantName,
    available: r.available,
    incoming: r.incoming,
    reserved: r.reserved,
    tracked: r.tracked,
    lowStockThreshold: r.lowStockThreshold,
    image: r.variantImage || r.productImage || '',
  }))
}

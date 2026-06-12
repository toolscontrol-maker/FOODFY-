/* ─────────────────────────────────────────────────────────
   Drizzle ORM Schema — SQLite (portable to PostgreSQL)
   Single source of truth for all business data.
   ───────────────────────────────────────────────────────── */
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

/* ══════════════════════════════════════════════════════════
   CATALOG
   ══════════════════════════════════════════════════════════ */

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  position: integer('position').notNull().default(0),
})

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  handle: text('handle').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  categoryName: text('category_name').notNull().default(''),
  vendor: text('vendor').notNull().default(''),
  type: text('type').notNull().default(''),
  status: text('status', { enum: ['active', 'draft', 'archived'] }).notNull().default('draft'),
  publishedAt: text('published_at'),
  templateSuffix: text('template_suffix').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const productVariants = sqliteTable('product_variants', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  price: real('price').notNull().default(0),
  compareAtPrice: real('compare_at_price'),
  sku: text('sku').notNull().default(''),
  barcode: text('barcode').notNull().default(''),
  inventoryQuantity: integer('inventory_quantity').notNull().default(0),
  availableForSale: integer('available_for_sale', { mode: 'boolean' }).notNull().default(true),
  image: text('image').notNull().default(''),
  weight: real('weight').notNull().default(0),
  weightUnit: text('weight_unit').notNull().default('g'),
  position: integer('position').notNull().default(0),
})

export const variantOptions = sqliteTable('variant_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  variantId: text('variant_id').notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  value: text('value').notNull(),
})

export const productImages = sqliteTable('product_images', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  alt: text('alt').notNull().default(''),
  position: integer('position').notNull().default(0),
})

export const productTags = sqliteTable('product_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(),
})

export const modifierGroups = sqliteTable('modifier_groups', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type', { enum: ['single', 'multiple'] }).notNull().default('single'),
  required: integer('required', { mode: 'boolean' }).notNull().default(false),
  maxSelect: integer('max_select').notNull().default(1),
})

export const modifierOptions = sqliteTable('modifier_options', {
  id: text('id').primaryKey(),
  groupId: text('group_id').notNull().references(() => modifierGroups.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  price: real('price').notNull().default(0),
})

/* ══════════════════════════════════════════════════════════
   COLLECTIONS
   ══════════════════════════════════════════════════════════ */

export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  handle: text('handle').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  image: text('image').notNull().default(''),
  type: text('type', { enum: ['manual', 'automated'] }).notNull().default('manual'),
  status: text('status', { enum: ['active', 'draft'] }).notNull().default('active'),
  sortOrder: text('sort_order').notNull().default('manual'),
  themeTemplate: text('theme_template').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const collectionProducts = sqliteTable('collection_products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  collectionId: text('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0),
})

/* ══════════════════════════════════════════════════════════
   INVENTORY
   ══════════════════════════════════════════════════════════ */

export const inventoryLevels = sqliteTable('inventory_levels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  variantId: text('variant_id').notNull().unique().references(() => productVariants.id, { onDelete: 'cascade' }),
  available: integer('available').notNull().default(0),
  incoming: integer('incoming').notNull().default(0),
  reserved: integer('reserved').notNull().default(0),
  tracked: integer('tracked', { mode: 'boolean' }).notNull().default(true),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(10),
})

/* ══════════════════════════════════════════════════════════
   THEMES & EDITOR
   ══════════════════════════════════════════════════════════ */

export const themes = sqliteTable('themes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role', { enum: ['main', 'unpublished'] }).notNull().default('unpublished'),
  version: text('version').notNull().default('1.0.0'),
  schemaVersion: integer('schema_version').notNull().default(1),
  previewImage: text('preview_image').notNull().default(''),
  lastSaved: text('last_saved').notNull(),
  lastPublished: text('last_published').notNull().default(''),
  globalSettings: text('global_settings', { mode: 'json' }).notNull(), // JSON blob
})

export const themeTemplates = sqliteTable('theme_templates', {
  id: text('id').primaryKey(),
  themeId: text('theme_id').notNull().references(() => themes.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  label: text('label').notNull(),
})

export const themeSections = sqliteTable('theme_sections', {
  id: text('id').primaryKey(),
  templateId: text('template_id').notNull().references(() => themeTemplates.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  displayName: text('display_name').notNull(),
  order: integer('order').notNull().default(0),
  hidden: integer('hidden', { mode: 'boolean' }).notNull().default(false),
  settings: text('settings', { mode: 'json' }).notNull().default('[]'), // JSON array of ThemeSetting
  maxBlocks: integer('max_blocks'),
})

export const themeBlocks = sqliteTable('theme_blocks', {
  id: text('id').primaryKey(),
  sectionId: text('section_id').notNull().references(() => themeSections.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  displayName: text('display_name').notNull(),
  order: integer('order').notNull().default(0),
  hidden: integer('hidden', { mode: 'boolean' }).notNull().default(false),
  settings: text('settings', { mode: 'json' }).notNull().default('[]'), // JSON array of ThemeSetting
  appId: text('app_id'),
})

/* ══════════════════════════════════════════════════════════
   ORDERS
   ══════════════════════════════════════════════════════════ */

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  customer: text('customer').notNull(),
  itemsText: text('items_text').notNull().default(''),
  total: real('total').notNull().default(0),
  paymentStatus: text('payment_status', { enum: ['paid', 'pending', 'refunded'] }).notNull().default('pending'),
  fulfillmentStatus: text('fulfillment_status', { enum: ['received', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'] }).notNull().default('received'),
  deliveryMethod: text('delivery_method', { enum: ['delivery', 'pickup', 'dine_in'] }).notNull().default('delivery'),
  createdAt: text('created_at').notNull(),
})

/* ══════════════════════════════════════════════════════════
   ANALYTICS
   ══════════════════════════════════════════════════════════ */

export const analyticsEvents = sqliteTable('analytics_events', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  sessionId: text('session_id').notNull(),
  payload: text('payload', { mode: 'json' }).notNull().default('{}'),
  timestamp: text('timestamp').notNull(),
})

/* ══════════════════════════════════════════════════════════
   STUDIO — WAREHOUSE, RECIPES, PURCHASE ORDERS
   ══════════════════════════════════════════════════════════ */

export const warehouseItems = sqliteTable('warehouse_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull().default('otros'),
  unit: text('unit').notNull().default('kg'),
  currentStock: real('current_stock').notNull().default(0),
  committedStock: real('committed_stock').notNull().default(0),
  minimumStock: real('minimum_stock').notNull().default(0),
  costPerUnit: real('cost_per_unit').notNull().default(0),
  supplier: text('supplier').notNull().default(''),
  expiryDate: text('expiry_date'),
  location: text('location').notNull().default(''),
  branchId: text('branch_id').notNull().default(''),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const warehouseBatches = sqliteTable('warehouse_batches', {
  id: text('id').primaryKey(),
  warehouseItemId: text('warehouse_item_id').notNull().references(() => warehouseItems.id, { onDelete: 'cascade' }),
  quantity: real('quantity').notNull().default(0),
  expiryDate: text('expiry_date'),
  receivedAt: text('received_at'),
  costPerUnit: real('cost_per_unit').notNull().default(0),
  supplier: text('supplier').notNull().default(''),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
  image: text('image').notNull().default(''),
  yield: integer('yield').notNull().default(1),
  prepTime: integer('prep_time').notNull().default(0),
  cookTime: integer('cook_time').notNull().default(0),
  status: text('status', { enum: ['active', 'draft'] }).notNull().default('active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: text('id').primaryKey(),
  recipeId: text('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  warehouseItemId: text('warehouse_item_id').notNull().references(() => warehouseItems.id, { onDelete: 'cascade' }),
  quantity: real('quantity').notNull().default(0),
  unit: text('unit').notNull().default('kg'),
})

export const purchaseOrders = sqliteTable('purchase_orders', {
  id: text('id').primaryKey(),
  supplier: text('supplier').notNull(),
  status: text('status', { enum: ['draft', 'ordered', 'partial', 'received', 'cancelled'] }).notNull().default('draft'),
  totalCost: real('total_cost').notNull().default(0),
  orderDate: text('order_date').notNull(),
  expectedDelivery: text('expected_delivery'),
  receivedDate: text('received_date'),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const purchaseOrderItems = sqliteTable('purchase_order_items', {
  id: text('id').primaryKey(),
  purchaseOrderId: text('purchase_order_id').notNull().references(() => purchaseOrders.id, { onDelete: 'cascade' }),
  warehouseItemId: text('warehouse_item_id').notNull().references(() => warehouseItems.id, { onDelete: 'cascade' }),
  quantity: real('quantity').notNull().default(0),
  unit: text('unit').notNull().default('kg'),
  unitCost: real('unit_cost').notNull().default(0),
  receivedQuantity: real('received_quantity').notNull().default(0),
})

/* ══════════════════════════════════════════════════════════
   SETTINGS (key-value store for global app config)
   ══════════════════════════════════════════════════════════ */

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).notNull(),
  updatedAt: text('updated_at').notNull(),
})

/* ══════════════════════════════════════════════════════════
   RELATIONS (for Drizzle relational queries)
   ══════════════════════════════════════════════════════════ */

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
  images: many(productImages),
  tags: many(productTags),
  modifierGroups: many(modifierGroups),
}))

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  options: many(variantOptions),
  inventoryLevel: one(inventoryLevels, { fields: [productVariants.id], references: [inventoryLevels.variantId] }),
}))

export const variantOptionsRelations = relations(variantOptions, ({ one }) => ({
  variant: one(productVariants, { fields: [variantOptions.variantId], references: [productVariants.id] }),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}))

export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, { fields: [productTags.productId], references: [products.id] }),
}))

export const modifierGroupsRelations = relations(modifierGroups, ({ one, many }) => ({
  product: one(products, { fields: [modifierGroups.productId], references: [products.id] }),
  options: many(modifierOptions),
}))

export const modifierOptionsRelations = relations(modifierOptions, ({ one }) => ({
  group: one(modifierGroups, { fields: [modifierOptions.groupId], references: [modifierGroups.id] }),
}))

export const collectionsRelations = relations(collections, ({ many }) => ({
  collectionProducts: many(collectionProducts),
}))

export const collectionProductsRelations = relations(collectionProducts, ({ one }) => ({
  collection: one(collections, { fields: [collectionProducts.collectionId], references: [collections.id] }),
  product: one(products, { fields: [collectionProducts.productId], references: [products.id] }),
}))

export const inventoryLevelsRelations = relations(inventoryLevels, ({ one }) => ({
  variant: one(productVariants, { fields: [inventoryLevels.variantId], references: [productVariants.id] }),
}))

export const themesRelations = relations(themes, ({ many }) => ({
  templates: many(themeTemplates),
}))

export const themeTemplatesRelations = relations(themeTemplates, ({ one, many }) => ({
  theme: one(themes, { fields: [themeTemplates.themeId], references: [themes.id] }),
  sections: many(themeSections),
}))

export const themeSectionsRelations = relations(themeSections, ({ one, many }) => ({
  template: one(themeTemplates, { fields: [themeSections.templateId], references: [themeTemplates.id] }),
  blocks: many(themeBlocks),
}))

export const themeBlocksRelations = relations(themeBlocks, ({ one }) => ({
  section: one(themeSections, { fields: [themeBlocks.sectionId], references: [themeSections.id] }),
}))

/* ── Studio Relations ── */
export const recipesRelations = relations(recipes, ({ one, many }) => ({
  product: one(products, { fields: [recipes.productId], references: [products.id] }),
  ingredients: many(recipeIngredients),
}))

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, { fields: [recipeIngredients.recipeId], references: [recipes.id] }),
  warehouseItem: one(warehouseItems, { fields: [recipeIngredients.warehouseItemId], references: [warehouseItems.id] }),
}))

export const purchaseOrdersRelations = relations(purchaseOrders, ({ many }) => ({
  items: many(purchaseOrderItems),
}))

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, { fields: [purchaseOrderItems.purchaseOrderId], references: [purchaseOrders.id] }),
  warehouseItem: one(warehouseItems, { fields: [purchaseOrderItems.warehouseItemId], references: [warehouseItems.id] }),
}))

/* ─────────────────────────────────────────────────────────
   Database Migration — Creates all tables if they don't exist.
   Called from the Nitro server plugin on startup.
   Uses raw SQL for DDL (Drizzle push is dev-only CLI).
   ───────────────────────────────────────────────────────── */
import { rawClient } from './index'

export async function runMigrations() {
  await rawClient.execute('PRAGMA journal_mode = WAL')
  await rawClient.execute('PRAGMA foreign_keys = ON')

  await rawClient.executeMultiple(`
    /* ── Categories ── */
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0
    );

    /* ── Products ── */
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      handle TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      category_name TEXT NOT NULL DEFAULT '',
      vendor TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('active','draft','archived')),
      published_at TEXT,
      template_suffix TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    /* ── Product Variants ── */
    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      compare_at_price REAL,
      sku TEXT NOT NULL DEFAULT '',
      barcode TEXT NOT NULL DEFAULT '',
      inventory_quantity INTEGER NOT NULL DEFAULT 0,
      available_for_sale INTEGER NOT NULL DEFAULT 1,
      image TEXT NOT NULL DEFAULT '',
      weight REAL NOT NULL DEFAULT 0,
      weight_unit TEXT NOT NULL DEFAULT 'g',
      position INTEGER NOT NULL DEFAULT 0
    );

    /* ── Variant Options ── */
    CREATE TABLE IF NOT EXISTS variant_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      variant_id TEXT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      value TEXT NOT NULL
    );

    /* ── Product Images ── */
    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      alt TEXT NOT NULL DEFAULT '',
      position INTEGER NOT NULL DEFAULT 0
    );

    /* ── Product Tags ── */
    CREATE TABLE IF NOT EXISTS product_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      tag TEXT NOT NULL
    );

    /* ── Modifier Groups ── */
    CREATE TABLE IF NOT EXISTS modifier_groups (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'single' CHECK(type IN ('single','multiple')),
      required INTEGER NOT NULL DEFAULT 0,
      max_select INTEGER NOT NULL DEFAULT 1
    );

    /* ── Modifier Options ── */
    CREATE TABLE IF NOT EXISTS modifier_options (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0
    );

    /* ── Collections ── */
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      handle TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT 'manual' CHECK(type IN ('manual','automated')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','draft')),
      sort_order TEXT NOT NULL DEFAULT 'manual',
      theme_template TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    /* ── Collection ↔ Product join ── */
    CREATE TABLE IF NOT EXISTS collection_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      position INTEGER NOT NULL DEFAULT 0
    );

    /* ── Inventory Levels ── */
    CREATE TABLE IF NOT EXISTS inventory_levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      variant_id TEXT NOT NULL UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
      available INTEGER NOT NULL DEFAULT 0,
      incoming INTEGER NOT NULL DEFAULT 0,
      reserved INTEGER NOT NULL DEFAULT 0,
      tracked INTEGER NOT NULL DEFAULT 1,
      low_stock_threshold INTEGER NOT NULL DEFAULT 10
    );

    /* ── Themes ── */
    CREATE TABLE IF NOT EXISTS themes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'unpublished' CHECK(role IN ('main','unpublished')),
      version TEXT NOT NULL DEFAULT '1.0.0',
      schema_version INTEGER NOT NULL DEFAULT 1,
      preview_image TEXT NOT NULL DEFAULT '',
      last_saved TEXT NOT NULL,
      last_published TEXT NOT NULL DEFAULT '',
      global_settings TEXT NOT NULL DEFAULT '{}'
    );

    /* ── Theme Templates ── */
    CREATE TABLE IF NOT EXISTS theme_templates (
      id TEXT PRIMARY KEY,
      theme_id TEXT NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      label TEXT NOT NULL
    );

    /* ── Theme Sections ── */
    CREATE TABLE IF NOT EXISTS theme_sections (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL REFERENCES theme_templates(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      display_name TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      hidden INTEGER NOT NULL DEFAULT 0,
      settings TEXT NOT NULL DEFAULT '[]',
      max_blocks INTEGER
    );

    /* ── Theme Blocks ── */
    CREATE TABLE IF NOT EXISTS theme_blocks (
      id TEXT PRIMARY KEY,
      section_id TEXT NOT NULL REFERENCES theme_sections(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      display_name TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      hidden INTEGER NOT NULL DEFAULT 0,
      settings TEXT NOT NULL DEFAULT '[]',
      app_id TEXT
    );

    /* ── Orders ── */
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      customer TEXT NOT NULL,
      items_text TEXT NOT NULL DEFAULT '',
      total REAL NOT NULL DEFAULT 0,
      payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('paid','pending','refunded')),
      fulfillment_status TEXT NOT NULL DEFAULT 'received' CHECK(fulfillment_status IN ('received','preparing','ready','delivering','delivered','cancelled')),
      delivery_method TEXT NOT NULL DEFAULT 'delivery' CHECK(delivery_method IN ('delivery','pickup','dine_in')),
      created_at TEXT NOT NULL
    );

    /* ── Analytics Events ── */
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      session_id TEXT NOT NULL,
      payload TEXT NOT NULL DEFAULT '{}',
      timestamp TEXT NOT NULL
    );

    /* ── Settings (key-value) ── */
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    /* ── Warehouse Items ── */
    CREATE TABLE IF NOT EXISTS warehouse_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'otros',
      unit TEXT NOT NULL DEFAULT 'kg',
      current_stock REAL NOT NULL DEFAULT 0,
      committed_stock REAL NOT NULL DEFAULT 0,
      minimum_stock REAL NOT NULL DEFAULT 0,
      cost_per_unit REAL NOT NULL DEFAULT 0,
      supplier TEXT NOT NULL DEFAULT '',
      expiry_date TEXT,
      location TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    /* ── Recipes ── */
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
      image TEXT NOT NULL DEFAULT '',
      yield INTEGER NOT NULL DEFAULT 1,
      prep_time INTEGER NOT NULL DEFAULT 0,
      cook_time INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','draft')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    /* ── Recipe Ingredients ── */
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      warehouse_item_id TEXT NOT NULL REFERENCES warehouse_items(id) ON DELETE CASCADE,
      quantity REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'kg'
    );

    /* ── Purchase Orders ── */
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      supplier TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','ordered','partial','received','cancelled')),
      total_cost REAL NOT NULL DEFAULT 0,
      order_date TEXT NOT NULL,
      expected_delivery TEXT,
      received_date TEXT,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    /* ── Purchase Order Items ── */
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id TEXT PRIMARY KEY,
      purchase_order_id TEXT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
      warehouse_item_id TEXT NOT NULL REFERENCES warehouse_items(id) ON DELETE CASCADE,
      quantity REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'kg',
      unit_cost REAL NOT NULL DEFAULT 0,
      received_quantity REAL NOT NULL DEFAULT 0
    );

    /* ── Warehouse Batches (Lotes) ── */
    CREATE TABLE IF NOT EXISTS warehouse_batches (
      id TEXT PRIMARY KEY,
      warehouse_item_id TEXT NOT NULL REFERENCES warehouse_items(id) ON DELETE CASCADE,
      quantity REAL NOT NULL DEFAULT 0,
      expiry_date TEXT,
      received_at TEXT,
      cost_per_unit REAL NOT NULL DEFAULT 0,
      supplier TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    /* ── Indexes ── */
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);
    CREATE INDEX IF NOT EXISTS idx_tags_product ON product_tags(product_id);
    CREATE INDEX IF NOT EXISTS idx_modgroups_product ON modifier_groups(product_id);
    CREATE INDEX IF NOT EXISTS idx_modopts_group ON modifier_options(group_id);
    CREATE INDEX IF NOT EXISTS idx_colprods_collection ON collection_products(collection_id);
    CREATE INDEX IF NOT EXISTS idx_colprods_product ON collection_products(product_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_variant ON inventory_levels(variant_id);
    CREATE INDEX IF NOT EXISTS idx_sections_template ON theme_sections(template_id);
    CREATE INDEX IF NOT EXISTS idx_blocks_section ON theme_blocks(section_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(type);
    CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status);
    CREATE INDEX IF NOT EXISTS idx_warehouse_category ON warehouse_items(category);
    CREATE INDEX IF NOT EXISTS idx_recipes_product ON recipes(product_id);
    CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
    CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_item ON recipe_ingredients(warehouse_item_id);
    CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
    CREATE INDEX IF NOT EXISTS idx_po_items_order ON purchase_order_items(purchase_order_id);
    CREATE INDEX IF NOT EXISTS idx_po_items_item ON purchase_order_items(warehouse_item_id);
    CREATE INDEX IF NOT EXISTS idx_batches_item ON warehouse_batches(warehouse_item_id);
  `)

  /* ── Additive column migrations (safe to re-run) ── */
  try {
    await rawClient.execute("ALTER TABLE warehouse_items ADD COLUMN branch_id TEXT NOT NULL DEFAULT ''")
    console.log('[DB] Added branch_id column to warehouse_items')
  } catch {
    // Column already exists — no-op
  }

  /* Assign existing items (branch_id = '') to the main branch by default */
  await rawClient.execute("UPDATE warehouse_items SET branch_id = 'loc-001' WHERE branch_id = ''")

  /* ── Migrate existing warehouse items to have an initial batch ── */
  const itemsWithoutBatches = await rawClient.execute(`
    SELECT wi.id, wi.current_stock, wi.expiry_date, wi.cost_per_unit, wi.supplier, wi.created_at
    FROM warehouse_items wi
    LEFT JOIN warehouse_batches wb ON wb.warehouse_item_id = wi.id
    WHERE wb.id IS NULL
  `)
  const now2 = new Date().toISOString()
  for (const row of itemsWithoutBatches.rows) {
    const batchId = crypto.randomUUID()
    await rawClient.execute({
      sql: `INSERT INTO warehouse_batches (id, warehouse_item_id, quantity, expiry_date, received_at, cost_per_unit, supplier, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, ?)`,
      args: [
        batchId,
        row.id as string,
        row.current_stock as number ?? 0,
        row.expiry_date as string | null,
        row.created_at as string ?? now2,
        row.cost_per_unit as number ?? 0,
        row.supplier as string ?? '',
        now2,
        now2,
      ],
    })
  }
  if (itemsWithoutBatches.rows.length > 0) {
    console.log(`[DB] Created ${itemsWithoutBatches.rows.length} initial batches for existing warehouse items`)
  }

  console.log('[DB] Migrations complete.')
}

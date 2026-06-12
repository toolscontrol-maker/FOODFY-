<script setup lang="ts">
import { computed, ref } from 'vue'
import { useOnlineStoreStore, type ThemeSection } from '~/stores/useOnlineStoreStore'
import { useThemePreviewData, THEME_ICON_MAP } from '~/composables/useThemePreviewData'
import { useCartStore } from '~/composables/useCartStore'
import { useShopIdentity } from '~/composables/useShopIdentity'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
}>()

const store = useOnlineStoreStore()
const {
  getSetting, resolvedProductDetail, resolvedProductModifiers, resolvedProductRecipe,
  formatPrice, getProductPrice, getProductCompareAtPrice, getProductCoverImage,
} = useThemePreviewData()
const cart = useCartStore()
const { shopName } = useShopIdentity()

const gs = (key: string) => getSetting(props.sec, key)
const blkSetting = (blk: any, key: string) => blk?.settings?.find((s: any) => s.key === key)?.value

const product = computed(() => resolvedProductDetail(props.sec))
const bgColor = computed(() => gs('bg_color') || 'var(--theme-bg, #ffffff)')

const selectedVariantIdx = ref(0)
const openAccordions = ref<Set<string>>(new Set())
/* Per modifier group: selected option ids */
const modifierSelections = ref<Record<string, string[]>>({})

const toggleAccordion = (id: string) => {
  if (openAccordions.value.has(id)) openAccordions.value.delete(id)
  else openAccordions.value.add(id)
}

const price = computed(() => product.value ? formatPrice(getProductPrice(product.value)) : '')
const compareAtPrice = computed(() => {
  const priceBlock = props.sec.blocks.find(b => b.type === 'product_price')
  const showCompare = priceBlock ? blkSetting(priceBlock, 'show_compare') !== false : true
  if (!showCompare) return ''
  const cp = product.value ? getProductCompareAtPrice(product.value) : null
  return cp ? formatPrice(cp) : ''
})
const coverImage = computed(() => product.value ? getProductCoverImage(product.value) : '')

/* ── Block refs ── */
const shippingBlock = computed(() => props.sec.blocks.find(b => b.type === 'product_shipping'))
const badgesBlock = computed(() => props.sec.blocks.find(b => b.type === 'product_badges'))
const accordionBlocks = computed(() => props.sec.blocks.filter(b => b.type === 'product_accordion'))
const inventoryBlock = computed(() => props.sec.blocks.find(b => b.type === 'product_inventory'))
const paymentBlock = computed(() => props.sec.blocks.find(b => b.type === 'product_payment_methods'))
const modifiersBlock = computed(() => props.sec.blocks.find(b => b.type === 'product_modifiers'))
const recipeBlock = computed(() => props.sec.blocks.find(b => b.type === 'product_recipe'))

const variants = computed(() => product.value?.variants?.slice(0, 4) ?? [])

const badges = computed(() => {
  const raw = blkSetting(badgesBlock.value, 'badges') || ''
  return raw.split(',').map((b: string) => b.trim()).filter(Boolean)
})

const shippingText = computed(() => blkSetting(shippingBlock.value, 'text') || 'Entrega en 30-45 min')
const shippingIcon = computed(() => {
  const k = blkSetting(shippingBlock.value, 'icon') || 'truck'
  return THEME_ICON_MAP[k] || 'i-lucide-truck'
})

/* ── Inventory ── */
const showInventory = computed(() => inventoryBlock.value && blkSetting(inventoryBlock.value, 'show_stock') !== false)
const stockQty = computed(() => product.value?.variants?.[0]?.inventoryQuantity ?? 0)
const lowThreshold = computed(() => Number(blkSetting(inventoryBlock.value, 'low_stock_threshold') ?? 5))
const stockStatus = computed(() => {
  if (stockQty.value <= 0) return { label: 'Sin stock', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' }
  if (stockQty.value <= lowThreshold.value) return { label: `Quedan ${stockQty.value} unidades`, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' }
  return { label: `${stockQty.value} en stock`, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' }
})

/* ── Payment methods ── */
const showPayment = computed(() => paymentBlock.value && blkSetting(paymentBlock.value, 'show_icons') !== false)
const paymentLabel = computed(() => blkSetting(paymentBlock.value, 'label') || 'Pago seguro garantizado')
const paymentIcons = ['i-lucide-credit-card', 'i-lucide-shield-check', 'i-lucide-lock']

/* ── Modifier groups ── */
const showModifiers = computed(() => modifiersBlock.value && blkSetting(modifiersBlock.value, 'show_modifiers') !== false)
const modifierGroups = computed(() => showModifiers.value ? resolvedProductModifiers(props.sec) : [])

const toggleModifierOption = (groupId: string, optId: string, type: string) => {
  if (!modifierSelections.value[groupId]) modifierSelections.value[groupId] = []
  const arr = modifierSelections.value[groupId]
  if (type === 'single') {
    modifierSelections.value[groupId] = [String(optId)]
  } else {
    const idx = arr.indexOf(String(optId))
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(String(optId))
  }
}
const isOptionSelected = (groupId: string, optId: string) =>
  (modifierSelections.value[groupId] ?? []).includes(String(optId))

/* ── Recipe ── */
const showRecipe = computed(() => recipeBlock.value && blkSetting(recipeBlock.value, 'show_recipe') !== false)
const recipe = computed(() => showRecipe.value ? resolvedProductRecipe(props.sec) : null)

/* ── Add to cart ── */
const addToCart = () => {
  if (!product.value) return
  cart.addItem({
    variantId: product.value.variants?.[selectedVariantIdx.value]?.id,
    productName: product.value.name,
    variantName: product.value.variants?.[selectedVariantIdx.value]?.name || 'Default',
    vendor: product.value.vendor || shopName.value,
    price: getProductPrice(product.value),
    compareAtPrice: getProductCompareAtPrice(product.value),
    image: coverImage.value,
  })
}

const selectBlock = (blockId: string) => {
  if (!store.editorInspectorEnabled) return
  store.editorSelectedSectionId = props.sec.id
  store.editorSelectedBlockId = blockId
}
</script>

<template>
  <div :style="{ backgroundColor: bgColor }">
    <!-- No product state -->
    <div
      v-if="!product"
      class="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl mx-6 my-6"
    >
      <UIcon name="i-lucide-package" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p class="text-sm font-medium text-gray-500 mb-1">Sin producto seleccionado</p>
      <p class="text-xs text-gray-400">Selecciona un producto en los ajustes de esta sección</p>
    </div>

    <!-- Product layout -->
    <div v-else :class="isMobile ? 'flex flex-col' : 'grid grid-cols-2 gap-0'" class="min-h-[480px]">
      <!-- Gallery -->
      <div
        class="relative overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900"
        :class="isMobile ? 'aspect-square' : 'min-h-[480px]'"
      >
        <img
          v-if="coverImage"
          :src="coverImage"
          class="w-full h-full object-cover"
          :alt="product.name"
        />
        <ThemePlaceholderImage v-else class="w-full h-full" />
      </div>

      <!-- Info panel -->
      <div
        :class="isMobile ? 'px-5 py-6' : 'px-8 py-10'"
        class="flex flex-col justify-start space-y-4 overflow-y-auto"
      >
        <!-- Vendor + Title -->
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            {{ product.vendor || shopName }}
          </p>
          <h1 :class="isMobile ? 'text-2xl' : 'text-3xl'" class="font-bold text-gray-900 dark:text-white leading-tight">
            {{ product.name }}
          </h1>
        </div>

        <!-- Price -->
        <div class="flex items-baseline gap-3">
          <span class="text-2xl font-bold" :style="{ color: primaryColor }">{{ price }}</span>
          <span v-if="compareAtPrice" class="text-base text-gray-400 line-through">{{ compareAtPrice }}</span>
          <span v-if="compareAtPrice" class="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
            Oferta
          </span>
        </div>

        <!-- Inventory / stock badge -->
        <div
          v-if="showInventory"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold w-fit"
          :class="[stockStatus.color, store.editorInspectorEnabled && store.editorSelectedBlockId === inventoryBlock?.id ? 'ring-2 ring-primary-400' : '']"
          @click.stop="inventoryBlock && selectBlock(inventoryBlock.id)"
        >
          <UIcon name="i-lucide-package-check" class="w-3.5 h-3.5" />
          {{ stockStatus.label }}
        </div>

        <!-- Variants -->
        <div v-if="variants.length > 0">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Variante</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(v, idx) in variants"
              :key="v.id"
              class="px-3 py-1.5 text-sm border-2 transition-all"
              :style="selectedVariantIdx === idx
                ? { backgroundColor: primaryColor, borderColor: primaryColor, borderRadius: 'var(--theme-pill-radius, 4px)' }
                : { borderRadius: 'var(--theme-pill-radius, 4px)' }"
                :class="selectedVariantIdx === idx
                ? 'text-white border-transparent'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400'"
                @click.stop="selectedVariantIdx = idx"
            >
              {{ v.name }}
            </button>
          </div>
        </div>

        <!-- Modifier groups (personalization options) -->
        <div
          v-if="modifierGroups.length > 0"
          class="space-y-4"
          :class="store.editorInspectorEnabled && store.editorSelectedBlockId === modifiersBlock?.id ? 'ring-2 ring-primary-400 rounded-xl p-2' : ''"
          @click.stop="modifiersBlock && selectBlock(modifiersBlock.id)"
        >
          <div v-for="group in modifierGroups" :key="group.id" class="space-y-2">
            <div class="flex items-center gap-2">
              <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{{ group.name }}</p>
              <span v-if="group.required" class="text-[10px] text-red-500 font-semibold">Obligatorio</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in group.options"
                :key="opt.id"
                class="px-3 py-1.5 text-sm border-2 transition-all flex items-center gap-1"
                :style="isOptionSelected(String(group.id), String(opt.id))
                  ? { backgroundColor: primaryColor, borderColor: primaryColor, borderRadius: 'var(--theme-pill-radius, 4px)' }
                  : { borderRadius: 'var(--theme-pill-radius, 4px)' }"
                :class="isOptionSelected(String(group.id), String(opt.id))
                  ? 'text-white border-transparent'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'"
                @click.stop="toggleModifierOption(String(group.id), String(opt.id), group.type)"
              >
                {{ opt.label }}
                <span v-if="opt.price > 0" class="text-[11px] opacity-80">+{{ formatPrice(opt.price) }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Description -->
        <p v-if="product.description" class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
          {{ product.description }}
        </p>

        <!-- CTA buttons -->
        <div class="flex flex-col gap-2">
          <button
            class="w-full py-3.5 font-bold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            :style="{ backgroundColor: primaryColor, borderRadius: 'var(--theme-btn-radius, 12px)' }"
            @click.stop="addToCart"
          >
            Añadir al carrito
          </button>
          <button
            class="w-full py-3 font-bold text-sm border-2 transition-all hover:opacity-80"
            :style="{ borderColor: primaryColor, color: primaryColor, borderRadius: 'var(--theme-btn-radius, 12px)' }"
          >
            Comprar ahora
          </button>
        </div>

        <!-- Payment methods -->
        <div
          v-if="showPayment"
          class="flex items-center gap-3 py-2.5 px-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl"
          :class="store.editorInspectorEnabled && store.editorSelectedBlockId === paymentBlock?.id ? 'ring-2 ring-primary-400' : ''"
          @click.stop="paymentBlock && selectBlock(paymentBlock.id)"
        >
          <div class="flex gap-1.5">
            <UIcon v-for="icon in paymentIcons" :key="icon" :name="icon" class="w-5 h-5 text-gray-400" />
            <!-- Card logos text-based placeholders -->
            <span class="text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">VISA</span>
            <span class="text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">MC</span>
          </div>
          <span class="text-[11px] text-gray-500">{{ paymentLabel }}</span>
        </div>

        <!-- Shipping info -->
        <div
          v-if="shippingBlock"
          class="flex items-center gap-2.5 py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
          :class="store.editorInspectorEnabled && store.editorSelectedBlockId === shippingBlock.id ? 'ring-2 ring-primary-400' : ''"
          @click.stop="selectBlock(shippingBlock.id)"
        >
          <UIcon :name="shippingIcon" class="w-4 h-4 text-green-500 flex-shrink-0" />
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ shippingText }}</span>
        </div>

        <!-- Badges -->
        <div v-if="badges.length > 0" class="flex flex-wrap gap-2">
          <span
            v-for="b in badges"
            :key="b"
            class="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full font-medium"
          >
            <UIcon name="i-lucide-check-circle" class="w-3 h-3" />
            {{ b }}
          </span>
        </div>

        <!-- Recipe card -->
        <div
          v-if="recipe"
          class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
          :class="store.editorInspectorEnabled && store.editorSelectedBlockId === recipeBlock?.id ? 'ring-2 ring-primary-400' : ''"
          @click.stop="recipeBlock && selectBlock(recipeBlock.id)"
        >
          <div class="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
            <UIcon name="i-lucide-chef-hat" class="w-4 h-4 text-gray-400" />
            <span class="text-sm font-semibold text-gray-900 dark:text-white">Receta: {{ recipe.name }}</span>
            <span class="ml-auto text-[11px] text-gray-400">{{ recipe.yield }} porción{{ recipe.yield !== 1 ? 'es' : '' }}</span>
          </div>
          <div class="px-4 py-3 space-y-1.5">
            <div
              v-for="ing in recipe.ingredients?.slice(0, 5)"
              :key="ing.id"
              class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400"
            >
              <span>{{ ing.warehouseItemName || ing.warehouseItemId }}</span>
              <span class="font-medium text-gray-700 dark:text-gray-300">{{ ing.quantity }} {{ ing.unit }}</span>
            </div>
            <p v-if="recipe.ingredients?.length > 5" class="text-[11px] text-gray-400 pt-1">
              +{{ recipe.ingredients.length - 5 }} ingredientes más
            </p>
          </div>
        </div>

        <!-- Accordions -->
        <div v-if="accordionBlocks.length > 0" class="space-y-2 pt-1">
          <div
            v-for="blk in accordionBlocks"
            :key="blk.id"
            class="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
            :class="store.editorInspectorEnabled && store.editorSelectedBlockId === blk.id ? 'ring-2 ring-primary-400 border-primary-300' : ''"
            @click.stop="selectBlock(blk.id)"
          >
            <button
              class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              @click.stop="toggleAccordion(blk.id)"
            >
              <span class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ blk.settings.find(s => s.key === 'title')?.value || 'Información' }}
              </span>
              <UIcon
                name="i-lucide-chevron-down"
                class="w-4 h-4 text-gray-400 transition-transform duration-200"
                :class="openAccordions.has(blk.id) ? 'rotate-180' : ''"
              />
            </button>
            <div
              v-if="openAccordions.has(blk.id)"
              class="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
            >
              {{ blk.settings.find(s => s.key === 'content')?.value }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

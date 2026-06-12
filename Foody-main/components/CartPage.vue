<script setup lang="ts">
import { useCartStore, formatCartCurrency as formatCurrency, RECOMMENDED_PRODUCTS } from '~/composables/useCartStore'
import { resolveScheme, type ColorScheme, type ThemeGlobalSettings } from '~/composables/useThemeSettings'

const props = defineProps<{
  settings: ThemeGlobalSettings
}>()

const cart = useCartStore()

const scheme = computed<ColorScheme>(() => {
  const id = props.settings.cart.drawerColorScheme
  return resolveScheme(props.settings.colors.schemes, id)
})

const btnRadius = computed(() => `${props.settings.components.buttons.radius}px`)
const inputRadius = computed(() => `${props.settings.components.inputs.radius}px`)
const containerRadius = computed(() => `${props.settings.components.containers.radius}px`)

const pageStyle = computed(() => ({
  '--cart-bg': scheme.value.background,
  '--cart-text': scheme.value.text,
  '--cart-primary': scheme.value.primary,
  '--cart-buttons': scheme.value.buttons,
  '--cart-borders': scheme.value.borders,
  '--cart-btn-radius': btnRadius.value,
  '--cart-input-radius': inputRadius.value,
  '--cart-container-radius': containerRadius.value,
}))
</script>

<template>
  <div
    class="min-h-[500px] px-8 py-10"
    :style="{ ...pageStyle, backgroundColor: 'var(--cart-bg)', color: 'var(--cart-text)' }"
  >
    <h1 class="text-2xl font-bold mb-8">Tu carrito</h1>

    <!-- Empty state -->
    <div v-if="cart.effectiveIsEmpty.value" class="flex flex-col items-center py-16 text-center">
      <div class="w-24 h-24 rounded-full flex items-center justify-center mb-5" :style="{ backgroundColor: 'var(--cart-borders)' }">
        <UIcon name="i-lucide-shopping-bag" class="w-12 h-12 opacity-30" />
      </div>
      <p class="text-[17px] font-semibold mb-2">Tu carrito está vacío</p>
      <p class="text-[14px] opacity-60 mb-6 max-w-sm">Parece que aún no has añadido nada. Explora nuestro catálogo y encuentra algo especial.</p>
      <button
        class="px-8 py-3 text-[14px] font-semibold transition-all hover:opacity-90"
        :style="{ backgroundColor: 'var(--cart-buttons)', color: 'var(--cart-bg)', borderRadius: 'var(--cart-btn-radius)' }"
      >
        Explorar productos
      </button>

      <!-- Recommendations -->
      <div v-if="settings.cart.drawerCollection" class="mt-12 w-full max-w-xl">
        <p class="text-[12px] font-semibold uppercase tracking-wider opacity-40 mb-4">Productos recomendados</p>
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="rec in RECOMMENDED_PRODUCTS"
            :key="rec.name"
            class="border overflow-hidden cursor-pointer hover:shadow-md transition-all"
            :style="{ borderColor: 'var(--cart-borders)', borderRadius: 'var(--cart-container-radius)' }"
          >
            <div class="aspect-square flex items-center justify-center" :style="{ backgroundColor: 'var(--cart-borders)' }">
              <UIcon name="i-lucide-utensils" class="w-6 h-6 opacity-25" />
            </div>
            <div class="p-2.5">
              <p class="text-[12px] font-medium truncate">{{ rec.name }}</p>
              <p class="text-[11px] font-semibold mt-0.5" :style="{ color: 'var(--cart-primary)' }">{{ formatCurrency(rec.price) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart with items -->
    <div v-else>
      <!-- Table header -->
      <div class="grid grid-cols-[1fr_120px_140px_100px_40px] gap-4 pb-3 border-b text-[11px] font-semibold uppercase tracking-wider opacity-40" :style="{ borderColor: 'var(--cart-borders)' }">
        <span>Producto</span>
        <span class="text-center">Precio</span>
        <span class="text-center">Cantidad</span>
        <span class="text-right">Total</span>
        <span />
      </div>

      <!-- Line items -->
      <div
        v-for="item in cart.effectiveItems.value"
        :key="item.id"
        class="grid grid-cols-[1fr_120px_140px_100px_40px] gap-4 items-center py-5 border-b"
        :style="{ borderColor: 'var(--cart-borders)' }"
      >
        <!-- Product -->
        <div class="flex items-center gap-4 min-w-0">
          <div
            class="w-16 h-16 flex-shrink-0 flex items-center justify-center overflow-hidden"
            :style="{ backgroundColor: 'var(--cart-borders)', borderRadius: 'var(--cart-container-radius)' }"
          >
            <UIcon name="i-lucide-utensils" class="w-6 h-6 opacity-30" />
          </div>
          <div class="min-w-0">
            <p class="text-[13px] font-semibold truncate">{{ item.productName }}</p>
            <p class="text-[11px] opacity-50">{{ item.variantName }}</p>
            <p v-if="settings.cart.showVendor" class="text-[10px] opacity-35 mt-0.5">{{ item.vendor }}</p>
          </div>
        </div>

        <!-- Price -->
        <div class="text-center">
          <p class="text-[13px] font-medium">{{ formatCurrency(item.price) }}</p>
          <p v-if="item.compareAtPrice" class="text-[11px] line-through opacity-40">{{ formatCurrency(item.compareAtPrice) }}</p>
        </div>

        <!-- Quantity -->
        <div class="flex justify-center">
          <div
            class="flex items-center border overflow-hidden"
            :style="{ borderColor: 'var(--cart-borders)', borderRadius: 'var(--cart-input-radius)' }"
          >
            <button
              class="w-9 h-9 flex items-center justify-center hover:opacity-70 transition-opacity text-[14px]"
              :disabled="item.quantity <= 1"
              :class="item.quantity <= 1 ? 'opacity-30 cursor-not-allowed' : ''"
              @click="cart.updateQuantity(item.id, item.quantity - 1)"
            >−</button>
            <span class="w-10 h-9 flex items-center justify-center text-[13px] font-semibold border-x" :style="{ borderColor: 'var(--cart-borders)' }">{{ item.quantity }}</span>
            <button
              class="w-9 h-9 flex items-center justify-center hover:opacity-70 transition-opacity text-[14px]"
              @click="cart.updateQuantity(item.id, item.quantity + 1)"
            >+</button>
          </div>
        </div>

        <!-- Line total -->
        <p class="text-[14px] font-bold text-right">{{ formatCurrency(item.price * item.quantity) }}</p>

        <!-- Remove -->
        <button
          class="w-8 h-8 flex items-center justify-center rounded opacity-30 hover:opacity-100 hover:text-red-500 transition-all mx-auto"
          @click="cart.removeItem(item.id)"
        >
          <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
        </button>
      </div>

      <!-- Note + Subtotal -->
      <div class="flex gap-8 mt-8">
        <!-- Note -->
        <div v-if="settings.cart.enableNote" class="flex-1">
          <label class="text-[11px] font-semibold uppercase tracking-wider opacity-50 block mb-2">Nota del pedido</label>
          <textarea
            v-model="cart.note.value"
            rows="3"
            class="w-full text-[13px] px-4 py-3 border resize-none focus:outline-none focus:ring-2 transition-all"
            :style="{
              borderColor: 'var(--cart-borders)',
              borderRadius: 'var(--cart-input-radius)',
              backgroundColor: 'var(--cart-bg)',
              color: 'var(--cart-text)',
            }"
            style="--tw-ring-color: var(--cart-primary)"
            placeholder="Instrucciones especiales para tu pedido..."
          />
        </div>

        <!-- Subtotal -->
        <div class="w-72 flex-shrink-0">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[14px] opacity-60">Subtotal</span>
            <span class="text-[22px] font-bold">{{ formatCurrency(cart.effectiveSubtotal.value) }}</span>
          </div>
          <p class="text-[11px] opacity-40 mb-4">Impuestos y envío calculados en el checkout</p>
          <button
            class="w-full py-4 text-[15px] font-bold transition-all hover:opacity-90 active:scale-[0.98]"
            :style="{ backgroundColor: 'var(--cart-buttons)', color: 'var(--cart-bg)', borderRadius: 'var(--cart-btn-radius)' }"
          >
            Finalizar pedido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

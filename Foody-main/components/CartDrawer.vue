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

const drawerStyle = computed(() => ({
  '--cart-bg': scheme.value.background,
  '--cart-text': scheme.value.text,
  '--cart-primary': scheme.value.primary,
  '--cart-buttons': scheme.value.buttons,
  '--cart-borders': scheme.value.borders,
  '--cart-btn-radius': btnRadius.value,
  '--cart-input-radius': inputRadius.value,
  '--cart-container-radius': containerRadius.value,
}))

const handleOverlayClick = () => {
  cart.closeDrawer()
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && cart.isDrawerOpen.value) {
    cart.closeDrawer()
  }
}

onMounted(() => window.addEventListener('keydown', handleEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', handleEscape))
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="cart-overlay">
      <div
        v-if="cart.isDrawerOpen.value"
        class="fixed inset-0 bg-black/40 z-[90] backdrop-blur-[2px]"
        @click="handleOverlayClick"
      />
    </Transition>

    <!-- Drawer -->
    <Transition name="cart-drawer">
      <div
        v-if="cart.isDrawerOpen.value"
        class="fixed top-0 right-0 bottom-0 w-[400px] max-w-[90vw] z-[91] flex flex-col shadow-2xl"
        :style="{ ...drawerStyle, backgroundColor: 'var(--cart-bg)', color: 'var(--cart-text)' }"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b" :style="{ borderColor: 'var(--cart-borders)' }">
          <div class="flex items-center gap-2.5">
            <UIcon name="i-lucide-shopping-bag" class="w-5 h-5" :style="{ color: 'var(--cart-primary)' }" />
            <h2 class="text-[16px] font-bold">Tu carrito</h2>
            <span
              v-if="cart.effectiveCount.value > 0"
              class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              :style="{ backgroundColor: 'var(--cart-primary)', color: 'var(--cart-bg)' }"
            >{{ cart.effectiveCount.value }}</span>
          </div>
          <button
            class="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
            :style="{ backgroundColor: 'var(--cart-borders)' }"
            @click="cart.closeDrawer()"
          >
            <UIcon name="i-lucide-x" class="w-4 h-4" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
          <!-- Empty state -->
          <div v-if="cart.effectiveIsEmpty.value" class="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div class="w-20 h-20 rounded-full flex items-center justify-center mb-4" :style="{ backgroundColor: 'var(--cart-borders)' }">
              <UIcon name="i-lucide-shopping-bag" class="w-10 h-10 opacity-40" />
            </div>
            <p class="text-[15px] font-semibold mb-1">Tu carrito está vacío</p>
            <p class="text-[13px] opacity-60 mb-6">Explora nuestros productos y encuentra algo que te encante</p>
            <button
              class="px-6 py-2.5 text-[13px] font-semibold transition-all hover:opacity-90"
              :style="{ backgroundColor: 'var(--cart-buttons)', color: 'var(--cart-bg)', borderRadius: 'var(--cart-btn-radius)' }"
              @click="cart.closeDrawer()"
            >
              Seguir comprando
            </button>

            <!-- Recommendations -->
            <div v-if="settings.cart.drawerCollection" class="mt-8 w-full">
              <p class="text-[12px] font-semibold uppercase tracking-wider opacity-50 mb-3">Te puede interesar</p>
              <div class="grid grid-cols-2 gap-3">
                <div
                  v-for="rec in RECOMMENDED_PRODUCTS"
                  :key="rec.name"
                  class="border overflow-hidden cursor-pointer hover:shadow-md transition-all"
                  :style="{ borderColor: 'var(--cart-borders)', borderRadius: 'var(--cart-container-radius)' }"
                >
                  <div class="aspect-square flex items-center justify-center" :style="{ backgroundColor: 'var(--cart-borders)' }">
                    <UIcon name="i-lucide-utensils" class="w-6 h-6 opacity-30" />
                  </div>
                  <div class="p-2.5">
                    <p class="text-[12px] font-medium truncate">{{ rec.name }}</p>
                    <p class="text-[11px] font-semibold mt-0.5" :style="{ color: 'var(--cart-primary)' }">{{ formatCurrency(rec.price) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Line items -->
          <div v-else class="px-5 py-3 space-y-0">
            <div
              v-for="(item, idx) in cart.effectiveItems.value"
              :key="item.id"
              class="flex gap-3 py-4"
              :class="idx > 0 ? 'border-t' : ''"
              :style="idx > 0 ? { borderColor: 'var(--cart-borders)' } : {}"
            >
              <!-- Image -->
              <div
                class="w-[72px] h-[72px] flex-shrink-0 flex items-center justify-center overflow-hidden"
                :style="{ backgroundColor: 'var(--cart-borders)', borderRadius: 'var(--cart-container-radius)' }"
              >
                <UIcon name="i-lucide-utensils" class="w-6 h-6 opacity-30" />
              </div>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-[13px] font-semibold truncate">{{ item.productName }}</p>
                    <p class="text-[11px] opacity-50">{{ item.variantName }}</p>
                    <p v-if="settings.cart.showVendor" class="text-[10px] opacity-40 mt-0.5">{{ item.vendor }}</p>
                  </div>
                  <button
                    class="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                    @click="cart.removeItem(item.id)"
                  >
                    <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
                  </button>
                </div>

                <div class="flex items-center justify-between mt-2.5">
                  <!-- Quantity controls -->
                  <div
                    class="flex items-center border overflow-hidden"
                    :style="{ borderColor: 'var(--cart-borders)', borderRadius: 'var(--cart-input-radius)' }"
                  >
                    <button
                      class="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity text-[14px] font-medium"
                      :disabled="item.quantity <= 1"
                      :class="item.quantity <= 1 ? 'opacity-30 cursor-not-allowed' : ''"
                      @click="cart.updateQuantity(item.id, item.quantity - 1)"
                    >−</button>
                    <span class="w-8 h-8 flex items-center justify-center text-[12px] font-semibold border-x" :style="{ borderColor: 'var(--cart-borders)' }">{{ item.quantity }}</span>
                    <button
                      class="w-8 h-8 flex items-center justify-center hover:opacity-70 transition-opacity text-[14px] font-medium"
                      @click="cart.updateQuantity(item.id, item.quantity + 1)"
                    >+</button>
                  </div>

                  <!-- Price -->
                  <div class="text-right">
                    <p class="text-[13px] font-bold">{{ formatCurrency(item.price * item.quantity) }}</p>
                    <p v-if="item.compareAtPrice" class="text-[11px] line-through opacity-40">{{ formatCurrency(item.compareAtPrice * item.quantity) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Note -->
        <div v-if="settings.cart.enableNote && !cart.effectiveIsEmpty.value" class="px-5 pb-3">
          <div class="border-t pt-3" :style="{ borderColor: 'var(--cart-borders)' }">
            <label class="text-[11px] font-semibold uppercase tracking-wider opacity-50 block mb-1.5">Nota del pedido</label>
            <textarea
              v-model="cart.note.value"
              rows="2"
              class="w-full text-[12px] px-3 py-2 border resize-none focus:outline-none focus:ring-2 transition-all"
              :style="{
                borderColor: 'var(--cart-borders)',
                borderRadius: 'var(--cart-input-radius)',
                backgroundColor: 'var(--cart-bg)',
                color: 'var(--cart-text)',
              }"
              style="--tw-ring-color: var(--cart-primary)"
              placeholder="Añade instrucciones especiales..."
            />
          </div>
        </div>

        <!-- Footer -->
        <div v-if="!cart.effectiveIsEmpty.value" class="px-5 py-4 border-t" :style="{ borderColor: 'var(--cart-borders)' }">
          <div class="flex items-center justify-between mb-4">
            <span class="text-[13px] font-medium opacity-70">Subtotal</span>
            <span class="text-[18px] font-bold">{{ formatCurrency(cart.effectiveSubtotal.value) }}</span>
          </div>
          <p class="text-[11px] opacity-50 mb-3">Impuestos y envío calculados en el checkout</p>
          <button
            class="w-full py-3.5 text-[14px] font-bold transition-all hover:opacity-90 active:scale-[0.98]"
            :style="{ backgroundColor: 'var(--cart-buttons)', color: 'var(--cart-bg)', borderRadius: 'var(--cart-btn-radius)' }"
          >
            Finalizar pedido
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Overlay transitions */
.cart-overlay-enter-active,
.cart-overlay-leave-active {
  transition: opacity 0.25s ease;
}
.cart-overlay-enter-from,
.cart-overlay-leave-to {
  opacity: 0;
}

/* Drawer transitions */
.cart-drawer-enter-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.cart-drawer-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.cart-drawer-enter-from,
.cart-drawer-leave-to {
  transform: translateX(100%);
}
</style>

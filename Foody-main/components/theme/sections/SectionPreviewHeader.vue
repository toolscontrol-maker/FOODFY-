<script setup lang="ts">
import { computed } from 'vue'
import { useOnlineStoreStore, type ThemeSection } from '~/stores/useOnlineStoreStore'
import { useShopIdentity } from '~/composables/useShopIdentity'
import { useCartStore } from '~/composables/useCartStore'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
  logoWidth?: number
}>()

const store = useOnlineStoreStore()
const { shopName, shopInitial, resolveHeaderLogo } = useShopIdentity()
const cart = useCartStore()

const gs = (key: string) => props.sec.settings.find(s => s.key === key)?.value ?? null

const bgColor = computed(() => gs('bg_color') || 'var(--theme-bg, #ffffff)')
const textColor = computed(() => gs('text_color') || '#111827')
const logoUrl = computed(() => resolveHeaderLogo(props.sec.settings))

const navLinks = computed(() => props.sec.blocks.filter(b => !b.hidden))
const cartCount = computed(() => cart.itemCount)

const selectBlock = (blockId: string) => {
  if (!store.editorInspectorEnabled) return
  store.editorSelectedSectionId = props.sec.id
  store.editorSelectedBlockId = blockId
}
</script>

<template>
  <div
    class="border-b"
    :style="{ backgroundColor: bgColor, borderColor: bgColor === '#ffffff' ? '#f3f4f6' : 'transparent' }"
  >
    <div
      class="flex items-center justify-between"
      :class="isMobile ? 'px-4 py-3' : 'px-8 py-0'"
      :style="isMobile ? {} : { height: '64px' }"
    >
      <!-- Logo + Name -->
      <div class="flex items-center gap-3 min-w-0">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          class="object-contain flex-shrink-0"
          :style="{ width: (logoWidth ?? 50) + 'px', maxHeight: '48px' }"
          :alt="shopName"
        />
        <div
          v-else
          class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          :style="{ backgroundColor: primaryColor }"
        >
          <span class="text-white font-bold text-sm">{{ shopInitial }}</span>
        </div>
        <span
          class="font-bold text-[15px] truncate"
          :style="{ color: textColor }"
        >{{ shopName }}</span>
      </div>

      <!-- Nav links (desktop) -->
      <nav v-if="!isMobile" class="flex items-center gap-6">
        <span
          v-for="blk in navLinks"
          :key="blk.id"
          class="text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-60 relative"
          :class="store.editorInspectorEnabled && store.editorSelectedBlockId === blk.id
            ? 'ring-2 ring-primary-400 rounded px-1 -mx-1'
            : ''"
          :style="{ color: textColor }"
          @click.stop="selectBlock(blk.id)"
        >
          {{ blk.settings.find(s => s.key === 'text')?.value || 'Enlace' }}
        </span>
      </nav>

      <!-- Right actions -->
      <div class="flex items-center gap-2">
        <!-- Cart icon -->
        <button
          class="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          :style="{ color: textColor }"
        >
          <UIcon name="i-lucide-shopping-bag" class="w-5 h-5" />
          <span
            v-if="cartCount > 0"
            class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
            :style="{ backgroundColor: primaryColor }"
          >{{ cartCount }}</span>
        </button>

        <!-- Mobile hamburger -->
        <button
          v-if="isMobile"
          class="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors"
          :style="{ color: textColor }"
        >
          <UIcon name="i-lucide-menu" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

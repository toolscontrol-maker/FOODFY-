<script setup lang="ts">
import { computed } from 'vue'
import type { ThemeSection } from '~/stores/useOnlineStoreStore'
import { useThemePreviewData } from '~/composables/useThemePreviewData'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
}>()

const { resolveCollection } = useThemePreviewData()

const gs = (key: string, fallback: any = null) =>
  props.sec.settings.find(s => s.key === key)?.value ?? fallback

const title         = computed(() => gs('title', ''))
const eyebrow       = computed(() => gs('eyebrow', ''))
const layout        = computed(() => gs('layout', 'tiles'))
const tileRatio     = computed(() => gs('tile_ratio', 'square') as 'square' | 'portrait')
const showName      = computed(() => gs('show_name', true))
const nameStyle     = computed(() => gs('name_style', 'overlay') as 'overlay' | 'below')
const nameTransform = computed(() => gs('name_transform', 'uppercase') as 'uppercase' | 'normal')
const bgColor       = computed(() => gs('bg_color', 'var(--theme-bg, #fafaf8)'))
const columns       = computed(() => Number(gs('columns', 4)))
const gap           = computed(() => gs('gap', 'small'))

const gapPx = computed(() => gap.value === 'medium' ? '24px' : '8px')

const colsClass = computed(() => {
  if (props.isMobile || layout.value === 'horizontal-scroll') return ''
  switch (columns.value) {
    case 2: return 'grid-cols-2'
    case 3: return 'grid-cols-3'
    case 4: return 'grid-cols-2 md:grid-cols-4'
    default: return 'grid-cols-2 md:grid-cols-4'
  }
})

interface TileBlock {
  id: string
  label: string
  image: string
  badgeText: string
  ctaUrl: string
}

const tiles = computed<TileBlock[]>(() =>
  props.sec.blocks
    .filter(b => !b.hidden && b.type === 'collection_tile')
    .map(b => {
      const sv = (k: string) => b.settings.find(s => s.key === k)?.value ?? ''
      const col = sv('collectionId') ? resolveCollection(sv('collectionId')) : null
      return {
        id: b.id,
        label: sv('label') || col?.name || 'Colección',
        image: sv('image') || '',
        badgeText: sv('badge_text') || '',
        ctaUrl: sv('cta_url') || '#',
      }
    })
)
</script>

<template>
  <div :style="{ backgroundColor: bgColor }">
    <!-- Section header -->
    <div v-if="title || eyebrow" class="px-6 md:px-10 pt-16 pb-8">
      <p
        v-if="eyebrow"
        class="text-[11px] font-semibold uppercase tracking-[0.25em] mb-2 opacity-60"
      >
        {{ eyebrow }}
      </p>
      <p
        class="text-2xl md:text-3xl font-semibold tracking-widest uppercase"
      >
        {{ title }}
      </p>
    </div>

    <!-- Tiles: grid layout -->
    <div
      v-if="layout === 'tiles'"
      class="grid"
      :class="colsClass"
      :style="{ gap: gapPx }"
    >
      <template v-if="tiles.length">
        <ThemeCollectionTile
          v-for="tile in tiles"
          :key="tile.id"
          :label="tile.label"
          :image="tile.image"
          :badge-text="tile.badgeText"
          :url="tile.ctaUrl"
          :ratio="tileRatio"
          :name-style="showName ? nameStyle : 'overlay'"
          :name-transform="nameTransform"
        />
      </template>
      <template v-else>
        <div
          v-for="i in 4"
          :key="i"
          class="relative overflow-hidden"
          :class="tileRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'"
        >
          <ThemePlaceholderImage class="w-full h-full" variant="collection" />
          <div class="absolute bottom-3 left-3">
            <div class="h-3 w-16 bg-white/50 rounded animate-pulse" />
          </div>
        </div>
      </template>
    </div>

    <!-- Tiles: horizontal scroll layout -->
    <div
      v-else
      class="flex gap-3 overflow-x-auto pb-4 px-6 md:px-10 scroll-smooth"
      style="scrollbar-width: none;"
    >
      <template v-if="tiles.length">
        <div
          v-for="tile in tiles"
          :key="tile.id"
          class="flex-shrink-0"
          :style="{ width: isMobile ? '60vw' : '280px' }"
        >
          <ThemeCollectionTile
            :label="tile.label"
            :image="tile.image"
            :badge-text="tile.badgeText"
            :ratio="tileRatio"
            :name-style="showName ? nameStyle : 'overlay'"
            :name-transform="nameTransform"
          />
        </div>
      </template>
      <template v-else>
        <div
          v-for="i in 4"
          :key="i"
          class="flex-shrink-0 relative overflow-hidden"
          :style="{ width: isMobile ? '60vw' : '280px' }"
          :class="tileRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'"
        >
          <ThemePlaceholderImage class="w-full h-full" variant="collection" />
        </div>
      </template>
    </div>
  </div>
</template>

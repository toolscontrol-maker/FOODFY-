<script setup lang="ts">
import { computed } from 'vue'
import type { ThemeSection } from '~/stores/useOnlineStoreStore'
import { THEME_ICON_MAP } from '~/composables/useThemePreviewData'
import type { FeatureItem } from '~/components/theme/shared/ThemeFeatureRow.vue'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
}>()

const gs = (key: string, fallback: any = null) =>
  props.sec.settings.find(s => s.key === key)?.value ?? fallback

const heading        = computed(() => gs('heading', 'Nuestra filosofía'))
const eyebrow        = computed(() => gs('eyebrow', ''))
const body           = computed(() => gs('body', ''))
const layout         = computed(() => gs('layout', 'centered') as 'centered' | 'left-aligned' | 'split')
const bgColor        = computed(() => gs('bg_color', '#f5efe3'))
const textColor      = computed(() => gs('text_color', '#1a1209'))
const bgImage        = computed(() => gs('bg_image', ''))
const overlayOpacity = computed(() => Number(gs('overlay_opacity', 0)))
const showFeatures   = computed(() => gs('show_features', true))
const ctaText        = computed(() => gs('cta_text', ''))
const ctaUrl         = computed(() => gs('cta_url', '#'))
const maxWidth       = computed(() => gs('max_width', 'medium') as 'narrow' | 'medium' | 'wide')
const paddingTop     = computed(() => gs('padding_top', 'lg'))
const paddingBottom  = computed(() => gs('padding_bottom', 'lg'))

const ptMap: Record<string, string> = { none: '0', sm: '32px', md: '48px', lg: '80px', xl: '128px' }
const pbMap: Record<string, string> = { none: '0', sm: '32px', md: '48px', lg: '80px', xl: '128px' }

const featureBlocks = computed<FeatureItem[]>(() => {
  if (!showFeatures.value) return []
  return props.sec.blocks
    .filter(b => !b.hidden && b.type === 'manifesto_feature')
    .map(b => {
      const sv = (k: string) => b.settings.find(s => s.key === k)?.value ?? ''
      return { id: b.id, icon: sv('icon') || 'star', title: sv('title'), description: sv('description') }
    })
})

const maxWidthPx = computed(() => {
  switch (maxWidth.value) {
    case 'narrow': return '720px'
    case 'wide':   return '1200px'
    default:       return '860px'
  }
})

const alignClass = computed(() =>
  layout.value === 'left-aligned' ? 'text-left items-start' : 'text-center items-center'
)
</script>

<template>
  <div
    class="relative w-full"
    :style="{
      backgroundColor: bgColor,
      paddingTop: ptMap[paddingTop] || '80px',
      paddingBottom: pbMap[paddingBottom] || '80px',
      ...(bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
    }"
  >
    <!-- Overlay -->
    <div
      v-if="bgImage && overlayOpacity > 0"
      class="absolute inset-0 pointer-events-none"
      :style="{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }"
    />

    <div class="relative mx-auto px-6 md:px-10" :style="{ maxWidth: maxWidthPx }">
      <div class="flex flex-col gap-6" :class="alignClass">
        <!-- Eyebrow -->
        <p
          v-if="eyebrow"
          class="text-[11px] font-semibold uppercase tracking-[0.25em]"
          :style="{ color: textColor, opacity: 0.6 }"
        >
          {{ eyebrow }}
        </p>

        <!-- Heading -->
        <h2
          v-if="heading"
          class="leading-tight"
          :style="{
            color: textColor,
            textTransform: 'uppercase',
            letterSpacing: isMobile ? '0.08em' : '0.04em',
            fontWeight: '600',
            maxWidth: '800px',
            fontSize: isMobile ? '28px' : 'clamp(32px, 4vw, 48px)',
          }"
        >
          {{ heading }}
        </h2>

        <!-- Body -->
        <p
          v-if="body"
          class="text-base leading-relaxed font-light"
          :style="{ color: textColor, opacity: 0.8, maxWidth: '600px', marginTop: '24px', ...(layout === 'centered' ? { marginLeft: 'auto', marginRight: 'auto' } : {}) }"
        >
          {{ body }}
        </p>

        <!-- CTA -->
        <a
          v-if="ctaText"
          :href="ctaUrl"
          class="inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-widest hover:opacity-70 transition-opacity"
          :style="{ color: primaryColor || textColor }"
          @click.prevent
        >
          {{ ctaText }}
          <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
        </a>
      </div>

      <!-- Features row -->
      <div v-if="featureBlocks.length" class="mt-14">
        <ThemeFeatureRow
          :features="featureBlocks"
          :columns="isMobile ? '2' : '4'"
          :icon-color="primaryColor || '#c9a96e'"
          :text-color="textColor"
          :is-mobile="isMobile"
          gap="48px"
        />
      </div>

      <!-- Empty feature placeholders -->
      <div v-else-if="showFeatures && !featureBlocks.length" class="mt-14 grid grid-cols-2 md:grid-cols-4" style="gap: 48px">
        <div v-for="i in 4" :key="i" class="flex flex-col gap-2">
          <div class="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div class="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div class="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
</template>


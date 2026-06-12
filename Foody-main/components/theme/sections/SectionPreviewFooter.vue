<script setup lang="ts">
import { computed } from 'vue'
import { useOnlineStoreStore, type ThemeSection } from '~/stores/useOnlineStoreStore'
import { useShopIdentity } from '~/composables/useShopIdentity'
import { useThemePreviewData } from '~/composables/useThemePreviewData'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
}>()

const store = useOnlineStoreStore()
const { shopName, shopInitial, shopEmail, shopPhone, shopAddress, shopSocials, copyrightText, resolveHeaderLogo } = useShopIdentity()
const { getSetting } = useThemePreviewData()
const gs = (key: string) => getSetting(props.sec, key)

const bgColor = computed(() => gs('bg_color') || '#111827')
const textColor = computed(() => gs('text_color') || '#d1d5db')
const showSocial = computed(() => gs('show_social') !== false)
const columns = computed(() => Number(gs('columns_count') ?? 4))
const copyright = computed(() => gs('copyright') || copyrightText.value)

const visibleBlocks = computed(() => props.sec.blocks.filter(b => !b.hidden))

const gridCols = computed(() => {
  if (props.isMobile) return 'grid-cols-2'
  if (columns.value === 2) return 'grid-cols-2'
  if (columns.value === 3) return 'grid-cols-3'
  return 'grid-cols-4'
})

const logoUrl = computed(() => resolveHeaderLogo(props.sec.settings))

const socialIcons: Record<string, string> = {
  Instagram: 'i-lucide-instagram',
  Facebook: 'i-lucide-facebook',
  'X (Twitter)': 'i-lucide-twitter',
  TikTok: 'i-lucide-music',
  YouTube: 'i-lucide-youtube',
  LinkedIn: 'i-lucide-linkedin',
  Pinterest: 'i-lucide-pinterest',
}

const activeSocials = computed(() =>
  (shopSocials.value || []).filter(s => s.url)
)

const blockContent = (blk: any) => {
  const content = blk.settings.find((s: any) => s.key === 'content')?.value
  if (content) return content
  const heading = blk.settings.find((s: any) => s.key === 'heading')?.value || ''
  if (heading.toLowerCase().includes('contacto')) {
    return [shopEmail.value, shopPhone.value, shopAddress.value].filter(Boolean).join('\n') || null
  }
  return null
}

const selectBlock = (blockId: string) => {
  if (!store.editorInspectorEnabled) return
  store.editorSelectedSectionId = props.sec.id
  store.editorSelectedBlockId = blockId
}
</script>

<template>
  <div :style="{ backgroundColor: bgColor }">
    <div :class="isMobile ? 'px-5 py-10' : 'px-10 py-14'">
      <!-- Top row: logo + description (first column) + grid columns -->
      <div class="grid gap-8 mb-10" :class="gridCols">
        <!-- Logo column (auto first) -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <img v-if="logoUrl" :src="logoUrl" class="h-7 object-contain max-w-[100px]" :alt="shopName" />
            <div v-else class="w-8 h-8 rounded-xl flex items-center justify-center" :style="{ backgroundColor: primaryColor }">
              <span class="text-white font-bold text-sm">{{ shopInitial }}</span>
            </div>
            <span class="font-bold text-sm" :style="{ color: textColor }">{{ shopName }}</span>
          </div>
          <p v-if="shopAddress" class="text-xs leading-relaxed opacity-60" :style="{ color: textColor }">
            {{ shopAddress }}
          </p>

          <!-- Social icons -->
          <div v-if="showSocial && activeSocials.length > 0" class="flex gap-2 flex-wrap">
            <a
              v-for="s in activeSocials"
              :key="s.platform"
              class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:opacity-80"
              style="background: rgba(255,255,255,0.1)"
              :title="s.platform"
            >
              <UIcon :name="socialIcons[s.platform] || 'i-lucide-link'" class="w-4 h-4" :style="{ color: textColor }" />
            </a>
          </div>
          <!-- Social placeholders if none configured -->
          <div v-else-if="showSocial" class="flex gap-2">
            <div
              v-for="p in ['i-lucide-instagram','i-lucide-facebook','i-lucide-twitter']"
              :key="p"
              class="w-8 h-8 rounded-xl flex items-center justify-center opacity-30"
              style="background: rgba(255,255,255,0.1)"
            >
              <UIcon :name="p" class="w-4 h-4" :style="{ color: textColor }" />
            </div>
          </div>
        </div>

        <!-- Content columns from blocks -->
        <div
          v-for="blk in visibleBlocks"
          :key="blk.id"
          class="space-y-3 cursor-pointer"
          :class="store.editorInspectorEnabled && store.editorSelectedBlockId === blk.id
            ? 'ring-1 ring-primary-400 rounded-lg p-2 -m-2'
            : ''"
          @click.stop="selectBlock(blk.id)"
        >
          <p class="text-sm font-semibold" :style="{ color: textColor }">
            {{ blk.settings.find((s: any) => s.key === 'heading')?.value || '' }}
          </p>
          <div class="space-y-2">
            <template v-if="blockContent(blk)">
              <p
                v-for="(line, i) in blockContent(blk).split('\n').filter(Boolean)"
                :key="i"
                class="text-xs leading-relaxed opacity-60"
                :style="{ color: textColor }"
              >{{ line }}</p>
            </template>
            <p v-else class="text-xs opacity-30 italic" :style="{ color: textColor }">
              Sin contenido configurado
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div
        class="flex items-center justify-between pt-6 border-t"
        :class="isMobile ? 'flex-col gap-3 text-center' : 'flex-row'"
        style="border-color: rgba(255,255,255,0.08)"
      >
        <p class="text-xs opacity-50" :style="{ color: textColor }">{{ copyright }}</p>
        <div class="flex items-center gap-4">
          <span
            v-for="link in ['Privacidad', 'Términos', 'Cookies']"
            :key="link"
            class="text-xs opacity-40 hover:opacity-70 cursor-pointer transition-opacity"
            :style="{ color: textColor }"
          >{{ link }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

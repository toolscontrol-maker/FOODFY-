<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { ThemeSection } from '~/stores/useOnlineStoreStore'
import { useThemePreviewData } from '~/composables/useThemePreviewData'

const props = defineProps<{
  sec: ThemeSection
  primaryColor: string
  isMobile: boolean
}>()

const { getSetting } = useThemePreviewData()
const gs = (key: string) => getSetting(props.sec, key)

const bgColor = computed(() => gs('bg_color') || '#1e293b')
const textColor = computed(() => gs('text_color') || '#ffffff')
const accentColor = computed(() => gs('accent_color') || '#e63946')
const heading = computed(() => gs('heading') || 'La oferta termina en')
const endDateStr = computed(() => gs('end_date') || '')
const expiredText = computed(() => gs('expired_text') || '¡Oferta finalizada!')

const units = [
  { key: 'days', label: 'Días' },
  { key: 'hours', label: 'Horas' },
  { key: 'min', label: 'Min' },
  { key: 'seg', label: 'Seg' },
]

const remaining = ref({ days: 0, hours: 0, min: 0, seg: 0 })
const expired = ref(false)

const update = () => {
  const end = endDateStr.value ? new Date(endDateStr.value).getTime() : Date.now() + 86400000 * 3
  const diff = Math.max(0, end - Date.now())
  if (diff === 0) { expired.value = true; return }
  remaining.value = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    min: Math.floor((diff % 3600000) / 60000),
    seg: Math.floor((diff % 60000) / 1000),
  }
}

let timer: ReturnType<typeof setInterval>
onMounted(() => { update(); timer = setInterval(update, 1000) })
onUnmounted(() => clearInterval(timer))

const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <div
    :class="isMobile ? 'px-5 py-10' : 'px-10 py-14'"
    class="text-center"
    :style="{ backgroundColor: bgColor }"
  >
    <p
      v-if="heading"
      class="text-sm font-medium mb-8 opacity-70"
      :style="{ color: textColor }"
    >
      {{ heading }}
    </p>

    <div v-if="expired" class="text-lg font-bold" :style="{ color: accentColor }">{{ expiredText }}</div>

    <div v-else class="flex justify-center gap-3" :class="isMobile ? 'gap-2' : 'gap-5'">
      <div v-for="u in units" :key="u.key" class="text-center">
        <div
          class="font-mono font-bold flex items-center justify-center rounded-2xl shadow-lg"
          :class="isMobile ? 'w-16 h-16 text-2xl' : 'w-20 h-20 text-3xl'"
          :style="{ backgroundColor: accentColor, color: '#fff' }"
        >
          {{ pad(remaining[u.key as keyof typeof remaining]) }}
        </div>
        <p class="text-[11px] mt-2 opacity-50 uppercase tracking-wider" :style="{ color: textColor }">
          {{ u.label }}
        </p>
      </div>
      <div class="self-start mt-3 text-2xl font-bold opacity-30" :style="{ color: textColor }">:</div>
    </div>
  </div>
</template>

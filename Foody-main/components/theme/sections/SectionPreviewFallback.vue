<script setup lang="ts">
import type { ThemeSection } from '~/stores/useOnlineStoreStore'
defineProps<{ sec: ThemeSection; isMobile: boolean; primaryColor: string }>()
</script>

<template>
  <div class="px-8 py-10 flex items-center justify-center gap-3 border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
    <UIcon name="i-lucide-layout" class="w-5 h-5 text-gray-300" />
    <p class="text-[12px] text-gray-400">Sección: <span class="font-mono">{{ sec.type }}</span></p>
  </div>
</template>

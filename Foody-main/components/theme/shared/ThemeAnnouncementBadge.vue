<script setup lang="ts">
defineProps<{
  text: string
  color?: string
  textColor?: string
  animate?: boolean
}>()
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-sm"
    :style="{
      backgroundColor: color || '#22c55e',
      color: textColor || '#ffffff',
    }"
  >
    <span
      v-if="animate"
      class="w-1.5 h-1.5 rounded-full flex-shrink-0"
      :style="{ backgroundColor: textColor || '#ffffff', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }"
    />
    {{ text }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  primaryColor?: string
  disabled?: boolean
  size?: 'sm' | 'md'
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    class="font-semibold uppercase tracking-widest transition-all duration-150"
    :class="[
      size === 'sm'
        ? 'px-3 py-1.5 text-[11px]'
        : 'px-4 py-2 text-[12px]',
      disabled ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80 active:scale-[0.97]'
    ]"
    :style="{
      backgroundColor: primaryColor || '#0f0f0f',
      color: '#ffffff',
      borderRadius: '2px',
    }"
    :disabled="disabled"
    @click.stop="!disabled && emit('click')"
  >
    {{ label || 'Añadir' }}
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  primaryColor?: string
  fullWidth?: boolean
}>()

const btnStyle = computed(() => {
  const base: Record<string, string> = {
    borderRadius: 'var(--theme-btn-radius, 8px)',
    boxShadow: 'var(--theme-btn-shadow, none)',
  }
  if (props.variant === 'outline') {
    return {
      ...base,
      borderWidth: 'var(--theme-btn-border, 2px)',
      borderStyle: 'solid',
      borderColor: props.primaryColor || 'var(--theme-primary, #e63946)',
      color: props.primaryColor || 'var(--theme-primary, #e63946)',
    }
  }
  if (props.variant === 'primary' || !props.variant) {
    return {
      ...base,
      backgroundColor: props.primaryColor || 'var(--theme-buttons, #e63946)',
    }
  }
  return base
})
</script>

<template>
  <button
    class="inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.97] cursor-pointer select-none"
    :class="[
      fullWidth ? 'w-full' : 'self-start',
      size === 'sm' ? 'px-4 py-2 text-xs' : size === 'lg' ? 'px-8 py-4 text-base' : 'px-6 py-3 text-sm',
      variant === 'outline' ? 'bg-transparent hover:bg-black/5' :
      variant === 'secondary' ? 'bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100' :
      variant === 'ghost' ? 'bg-transparent hover:bg-black/5 underline underline-offset-2' :
      'text-white hover:opacity-90'
    ]"
    :style="btnStyle"
  >
    <slot />
  </button>
</template>

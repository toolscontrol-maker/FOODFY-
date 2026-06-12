<script setup lang="ts">
const props = defineProps<{
  sizes: string[]
  selected: string | null
  soldOut?: string[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', size: string): void
}>()

const isSoldOut = (size: string) => props.soldOut?.includes(size) ?? false
</script>

<template>
  <div class="flex flex-wrap gap-1.5">
    <button
      v-for="size in sizes"
      :key="size"
      class="min-w-[40px] px-3 py-2 text-[13px] font-medium border transition-all duration-150 rounded-sm"
      :class="[
        isSoldOut(size)
          ? 'opacity-35 line-through cursor-not-allowed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600'
          : selected === size
            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
            : 'border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-800 dark:hover:border-gray-300',
        disabled && !isSoldOut(size) ? 'cursor-not-allowed opacity-60' : ''
      ]"
      :disabled="isSoldOut(size) || disabled"
      @click.stop="!isSoldOut(size) && !disabled && emit('select', size)"
    >
      {{ size }}
    </button>
  </div>
</template>

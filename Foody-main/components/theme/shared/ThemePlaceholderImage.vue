<script setup lang="ts">
defineProps<{
  variant?: 'food' | 'collection' | 'hero'
}>()
</script>

<template>
  <div class="w-full h-full flex items-center justify-center"
    :class="variant === 'hero'
      ? 'bg-gradient-to-br from-gray-800 to-gray-900'
      : variant === 'collection'
        ? 'bg-gradient-to-br from-orange-50 to-amber-100 dark:from-gray-800 dark:to-gray-700'
        : 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-700'"
  >
    <UIcon
      :name="variant === 'collection' ? 'i-lucide-layers' : variant === 'hero' ? 'i-lucide-image' : 'i-lucide-utensils'"
      class="opacity-30"
      :class="variant === 'hero' ? 'w-16 h-16 text-white' : 'w-8 h-8 text-amber-400 dark:text-gray-400'"
    />
  </div>
</template>

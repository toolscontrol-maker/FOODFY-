<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  src?: string
  alternateSrc?: string
  alt?: string
  ratio?: 'square' | 'portrait' | 'landscape' | '3:4' | '4:5' | '1:1'
  hoverMode?: 'zoom' | 'swap' | 'none'
}>()

const hovered = ref(false)

const ratioClass = computed(() => {
  switch (props.ratio) {
    case 'portrait':
    case '3:4':   return 'aspect-[3/4]'
    case '4:5':   return 'aspect-[4/5]'
    case 'landscape': return 'aspect-[4/3]'
    case 'square':
    case '1:1':
    default:      return 'aspect-square'
  }
})

const displaySrc = computed(() => {
  if (props.hoverMode === 'swap' && hovered.value && props.alternateSrc)
    return props.alternateSrc
  return props.src
})
</script>

<template>
  <div
    class="relative overflow-hidden bg-gray-50 dark:bg-gray-900"
    :class="ratioClass"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <img
      v-if="displaySrc"
      :src="displaySrc"
      :alt="alt || ''"
      class="w-full h-full object-cover transition-all duration-400"
      :class="hoverMode === 'zoom' && hovered ? 'scale-[1.03]' : 'scale-100'"
      style="transition: transform 400ms ease-out, opacity 200ms ease;"
    />
    <ThemePlaceholderImage v-else class="w-full h-full" />

    <!-- Swap crossfade overlay -->
    <Transition name="swap-fade">
      <img
        v-if="hoverMode === 'swap' && hovered && alternateSrc"
        :src="alternateSrc"
        :alt="alt || ''"
        class="absolute inset-0 w-full h-full object-cover"
        style="transition: opacity 200ms ease;"
      />
    </Transition>
  </div>
</template>

<style scoped>
.swap-fade-enter-active,
.swap-fade-leave-active {
  transition: opacity 200ms ease;
}
.swap-fade-enter-from,
.swap-fade-leave-to {
  opacity: 0;
}
</style>

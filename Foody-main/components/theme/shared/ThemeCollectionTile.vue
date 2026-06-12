<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  label: string
  image?: string
  badgeText?: string
  url?: string
  ratio?: 'square' | 'portrait'
  nameStyle?: 'overlay' | 'below'
  nameTransform?: 'uppercase' | 'normal'
  inspectorEnabled?: boolean
  isSelected?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const hovered = ref(false)

const ratioClass = props.ratio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'

const textTransform = props.nameTransform === 'uppercase' ? 'uppercase' : 'none'
</script>

<template>
  <div
    class="group relative overflow-hidden cursor-pointer"
    :class="[
      ratioClass,
      isSelected && inspectorEnabled ? 'ring-2 ring-primary-500' : '',
      inspectorEnabled ? 'hover:ring-2 hover:ring-primary-200 hover:ring-inset' : '',
    ]"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click="emit('click')"
  >
    <!-- Image -->
    <div class="absolute inset-0">
      <img
        v-if="image"
        :src="image"
        :alt="label"
        class="w-full h-full object-cover transition-transform duration-500"
        :class="hovered ? 'scale-[1.04]' : 'scale-100'"
      />
      <ThemePlaceholderImage v-else class="w-full h-full" variant="collection" />
    </div>

    <!-- Gradient overlay (for text legibility) -->
    <div
      v-if="nameStyle === 'overlay'"
      class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
    />

    <!-- Badge -->
    <div v-if="badgeText" class="absolute top-3 left-3 z-10">
      <ThemeAnnouncementBadge :text="badgeText" />
    </div>

    <!-- Overlay name -->
    <div v-if="nameStyle === 'overlay'" class="absolute bottom-0 inset-x-0 p-4 z-10">
      <p
        class="text-white text-[13px] font-semibold leading-tight tracking-widest"
        :style="{ textTransform }"
      >
        {{ label }}
      </p>
    </div>
  </div>

  <!-- Below name -->
  <p
    v-if="nameStyle === 'below'"
    class="mt-2 text-[13px] font-medium leading-tight"
    :style="{ textTransform }"
  >
    {{ label }}
  </p>
</template>

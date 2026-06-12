<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  eyebrow?: string
  centered?: boolean
  dark?: boolean
  large?: boolean
}>()
</script>

<template>
  <div v-if="title || subtitle || eyebrow" :class="['mb-8', centered ? 'text-center' : '']">
    <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-widest mb-2" :class="dark ? 'text-white/50' : 'text-gray-400'">
      {{ eyebrow }}
    </p>
    <h2
      class="font-bold leading-tight"
      :class="[
        large ? 'text-3xl' : 'text-2xl',
        dark ? 'text-white' : 'text-gray-900 dark:text-white'
      ]"
    >
      {{ title }}
    </h2>
    <p
      v-if="subtitle"
      class="mt-2 text-sm leading-relaxed"
      :class="[dark ? 'text-white/60' : 'text-gray-500', centered ? 'mx-auto max-w-xl' : 'max-w-2xl']"
    >
      {{ subtitle }}
    </p>
  </div>
</template>

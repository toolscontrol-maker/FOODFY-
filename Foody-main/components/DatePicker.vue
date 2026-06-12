<script setup lang="ts">
import { DatePicker as VDatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  modelValue?: Date | { start: Date; end: Date } | null;
}>()

const emit = defineEmits<{
  (e: 'update:model-value', payload: any): void;
  (e: 'close'): void;
}>()

const isDark = computed(() => {
  if (import.meta.client) {
    return document.documentElement.classList.contains('dark')
  }
  return false
})

const date = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
    emit('close')
  }
})

const attrs = computed(() => ({
  transparent: true,
  borderless: true,
  color: 'primary',
  'is-dark': { selector: 'html', darkClass: 'dark' },
  'first-day-of-week': 2,
}))
</script>

<template>
  <ClientOnly>
    <VDatePicker 
      v-if="date && typeof date === 'object' && 'start' in date"
      v-model.range="date"
      :columns="2"
      v-bind="{ ...attrs, ...$attrs }"
    />
    <VDatePicker 
      v-else-if="date === null || date instanceof Date"
      v-model="date"
      v-bind="{ ...attrs, ...$attrs }"
    />
    <VDatePicker 
      v-else
      v-model.range="date"
      :columns="2"
      v-bind="{ ...attrs, ...$attrs }"
    />
  </ClientOnly>
</template>

<style>
:root {
  --vc-gray-50: rgb(var(--color-gray-50));
  --vc-gray-100: rgb(var(--color-gray-100));
  --vc-gray-200: rgb(var(--color-gray-200));
  --vc-gray-300: rgb(var(--color-gray-300));
  --vc-gray-400: rgb(var(--color-gray-400));
  --vc-gray-500: rgb(var(--color-gray-500));
  --vc-gray-600: rgb(var(--color-gray-600));
  --vc-gray-700: rgb(var(--color-gray-700));
  --vc-gray-800: rgb(var(--color-gray-800));
  --vc-gray-900: rgb(var(--color-gray-900));
}

.vc-primary {
  --vc-accent-50: rgb(var(--color-primary-50));
  --vc-accent-100: rgb(var(--color-primary-100));
  --vc-accent-200: rgb(var(--color-primary-200));
  --vc-accent-300: rgb(var(--color-primary-300));
  --vc-accent-400: rgb(var(--color-primary-400));
  --vc-accent-500: rgb(var(--color-primary-500));
  --vc-accent-600: rgb(var(--color-primary-600));
  --vc-accent-700: rgb(var(--color-primary-700));
  --vc-accent-800: rgb(var(--color-primary-800));
  --vc-accent-900: rgb(var(--color-primary-900));
}

.vc-container {
  --vc-bg: transparent;
  font-family: inherit;
  border: none;
}
.dark .vc-container {
  --vc-bg: transparent;
  border: none;
}
</style>

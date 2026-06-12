<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  quantity: number
  threshold?: number
}>()

const low = computed(() => (props.threshold ?? 5))
const show = computed(() => props.quantity > 0 && props.quantity <= low.value)
const label = computed(() => `¡Solo ${props.quantity} ${props.quantity === 1 ? 'unidad' : 'unidades'} en stock!`)
</script>

<template>
  <p v-if="show" class="text-[13px] font-medium" style="color: #e63946;">
    {{ label }}
  </p>
</template>

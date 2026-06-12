<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const items = [{
  key: 'ai-training',
  label: 'Entrenamiento del Asistente',
  icon: 'i-lucide-brain-circuit',
  description: 'Proporciona información sobre tu negocio para que la IA atienda mejor a tus clientes.'
}, {
  key: 'auto-replies',
  label: 'Reglas de Respuesta',
  icon: 'i-lucide-message-square-dashed',
  description: 'Configura flujos básicos y respuestas frecuentes automatizadas.'
}, {
  key: 'ai-voice',
  label: 'Tono y Personalidad',
  icon: 'i-lucide-mic',
  description: 'Ajusta cómo de formal o cercano quieres que suene el bot.'
}]

const businessContext = ref('')
const selectedTone = ref('amigable')
const isAiEnabled = ref(true)
const autoPilot = ref(false)

const tones = [
  { value: 'formal', label: 'Elegante y Formal' },
  { value: 'amigable', label: 'Cercano y Amigable' },
  { value: 'divertido', label: 'Divertido e Informal' }
]

const loading = ref(false)
const toast = useToast()

const saveChanges = async () => {
  loading.value = true
  // Simulando guardado en base de datos
  await new Promise(resolve => setTimeout(resolve, 800))
  loading.value = false
  toast.add({ title: 'Configuración guardada', description: 'El comportamiento de la IA ha sido actualizado correctamente.', color: 'green' })
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Inteligencia Artificial</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Configura el comportamiento del agente de ventas inteligente y las respuestas automatizadas.</p>
      </div>
      <div class="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <span class="text-sm font-medium">Estado del Bot:</span>
        <UToggle v-model="isAiEnabled" active-icon="i-lucide-check" inactive-icon="i-lucide-x" />
        <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="isAiEnabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
          {{ isAiEnabled ? 'ACTIVO' : 'PAUSADO' }}
        </span>
      </div>
    </div>

    <UTabs :items="items" class="w-full">
      <template #item="{ item }">
        <UCard v-if="item.key === 'ai-training'" class="mt-4">
          <template #header>
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIcon :name="item.icon" class="text-primary-500" />
              Contexto del Negocio
            </h3>
            <p class="text-sm text-gray-500 mt-1">{{ item.description }}</p>
          </template>

          <div class="space-y-4">
            <UFormGroup label="Información para la IA (Prompt de Sistema)" description="Escribe aquí cosas que la IA debe saber: horarios especiales, ingredientes secretos, política de devoluciones o la historia del lugar. La IA usará esto para responder a los clientes.">
              <UTextarea 
                v-model="businessContext" 
                placeholder="Ejemplo: Somos una pizzería napolitana. Nuestras pizzas tardan unos 15 minutos en hacerse. No tenemos masa sin gluten. Los martes cerramos..." 
                :rows="8" 
                autoresize
                :disabled="!isAiEnabled"
              />
            </UFormGroup>
            
            <UFormGroup label="Modo Piloto Automático">
              <div class="flex items-start gap-3 mt-2">
                <UToggle v-model="autoPilot" :disabled="!isAiEnabled" size="lg" />
                <div>
                  <label class="text-sm font-medium text-gray-900 dark:text-white">Permitir a la IA cerrar ventas sola</label>
                  <p class="text-xs text-gray-500">Si está desactivado, la IA recogerá el pedido pero lo pondrá "Pendiente de confirmación humana". Si está activado, creará directamente el pedido y lo mandará a preparar.</p>
                </div>
              </div>
            </UFormGroup>
          </div>
        </UCard>

        <UCard v-else-if="item.key === 'ai-voice'" class="mt-4">
           <template #header>
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIcon :name="item.icon" class="text-primary-500" />
              Tono de conversación
            </h3>
            <p class="text-sm text-gray-500 mt-1">{{ item.description }}</p>
          </template>
          
          <div class="space-y-6">
            <URadioGroup 
              v-model="selectedTone" 
              :options="tones" 
              name="tone-selector"
              :disabled="!isAiEnabled"
            >
              <template #label="{ option }">
                <span class="font-medium">{{ option.label }}</span>
              </template>
            </URadioGroup>

            <div class="p-4 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <p class="text-sm text-gray-500 mb-2 font-semibold">Ejemplo de respuesta según el tono actual:</p>
              <div class="flex gap-3">
                <UAvatar icon="i-lucide-bot" class="bg-primary-500 text-white shrink-0" />
                <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-2xl rounded-tl-none tabular-nums text-sm">
                  <span v-if="selectedTone === 'formal'">Buenas noches. Muchas gracias por contactar con nuestro establecimiento. Estaremos encantados de preparar su pedido. ¿Me podría indicar su dirección, por favor?</span>
                  <span v-else-if="selectedTone === 'amigable'">¡Hola! Qué alegría saludarte. Claro que sí, voy preparando la cocina para tu pedido 🍕. ¿Me das tu dirección para enviártelo?</span>
                  <span v-else-if="selectedTone === 'divertido'">¡Epa! Has llegado al lugar del sabor 🔥. Tus tripas rugen y yo tengo la solución. ¡Pasa pa cá esa dirección que te mando tu festín volando! 🚀</span>
                </div>
              </div>
            </div>
          </div>
        </UCard>
        
        <UCard v-else class="mt-4">
          <div class="flex flex-col items-center justify-center py-10 text-center">
            <UIcon name="i-lucide-construction" class="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 class="text-lg font-medium">Constructor de Flujos (Próximamente)</h3>
            <p class="text-sm text-gray-500 max-w-sm mt-2">Aquí podrás configurar escenarios exactos de "Si el cliente dice X, responde Y" fuera de la IA conversacional estándar.</p>
          </div>
        </UCard>
      </template>
    </UTabs>

    <div class="flex justify-end pt-4">
      <UButton type="submit" color="black" icon="i-lucide-save" :loading="loading" @click="saveChanges" size="lg">
        Guardar Configuración
      </UButton>
    </div>
  </div>
</template>

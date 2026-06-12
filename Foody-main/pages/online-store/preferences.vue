<script setup lang="ts">
import { useOnlineStoreStore } from '~/stores/useOnlineStoreStore'
import { useFormGuard } from '~/composables/useFormGuard'

const store = useOnlineStoreStore()
const toast = useToast()

const { form, isDirty, save, discard, showLeaveModal, confirmLeave, cancelLeave } = useFormGuard(
  () => ({ ...store.preferences }),
  (data) => {
    Object.assign(store.preferences, data)
  }
)

const handleSave = () => {
  save()
  toast.add({ title: 'Preferencias guardadas', description: 'Los ajustes se han actualizado correctamente.', color: 'green' })
}

const handleDiscard = () => {
  discard()
  toast.add({ title: 'Cambios descartados', color: 'gray' })
}
</script>

<template>
  <div class="max-w-3xl space-y-6 pb-24">
    <!-- Header -->
    <div>
      <p class="text-xs font-medium text-gray-500 mb-0.5">Tienda online</p>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Preferencias</h2>
      <p class="text-sm text-gray-500 mt-1">SEO, imagen social, contraseña y códigos de seguimiento.</p>
    </div>

    <!-- SEO & Social Image -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Imagen para compartir en redes sociales y SEO</h3>
      </template>
      <div class="space-y-4">
        <UFormGroup label="Título de la página principal" help="Se muestra en los resultados de búsqueda y pestañas del navegador." :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UInput v-model="form.homeTitle" placeholder="Mi tienda online" />
        </UFormGroup>
        <UFormGroup label="Meta descripción" help="Descripción que aparece en los resultados de búsqueda. Máx. 320 caracteres." :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UTextarea v-model="form.metaDescription" :rows="3" placeholder="Describe tu tienda en pocas palabras..." />
          <p class="text-[11px] text-gray-400 mt-1 text-right">{{ form.metaDescription.length }} / 320</p>
        </UFormGroup>
        <UFormGroup label="Imagen para redes sociales" help="Se usa al compartir tu URL en redes sociales. Recomendado: 1200×630px." :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <div v-if="form.socialImage" class="relative group w-full max-w-xs aspect-[1200/630] rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900">
            <img :src="form.socialImage" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <UButton icon="i-lucide-trash" color="red" variant="solid" size="xs" @click="form.socialImage = ''" />
            </div>
          </div>
          <button
            v-else
            class="w-full max-w-xs aspect-[1200/630] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            @click="toast.add({ title: 'Selector de imagen', description: 'Funcionalidad disponible próximamente.', color: 'blue' })"
          >
            <UIcon name="i-lucide-image-plus" class="w-6 h-6 text-gray-400" />
            <span class="text-[12px] font-medium text-gray-500">Subir imagen</span>
          </button>
        </UFormGroup>
      </div>
    </UCard>

    <!-- Password Protection -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Protección con contraseña</h3>
          <UToggle v-model="form.passwordEnabled" color="primary" />
        </div>
      </template>
      <div v-if="form.passwordEnabled" class="space-y-4">
        <div class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/40 flex items-start gap-2">
          <UIcon name="i-lucide-shield-alert" class="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p class="text-[12px] text-amber-800 dark:text-amber-300">Tu tienda estará protegida. Solo los visitantes con la contraseña podrán acceder.</p>
        </div>
        <UFormGroup label="Contraseña" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UInput v-model="form.password" type="password" placeholder="Introduce una contraseña" />
        </UFormGroup>
        <UFormGroup label="Mensaje para visitantes" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UTextarea v-model="form.passwordMessage" :rows="2" placeholder="Próximamente..." />
        </UFormGroup>
      </div>
      <div v-else class="text-[13px] text-gray-500">
        Tu tienda es accesible públicamente. Activa la protección para restringir el acceso.
      </div>
    </UCard>

    <!-- International Redirect -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Redirección internacional</h3>
          <UToggle v-model="form.internationalRedirect" color="primary" />
        </div>
      </template>
      <p class="text-[13px] text-gray-500">
        {{ form.internationalRedirect
          ? 'Los visitantes internacionales serán redirigidos automáticamente a su dominio o idioma correspondiente.'
          : 'Desactivado. Los visitantes no serán redirigidos automáticamente según su ubicación.'
        }}
      </p>
    </UCard>

    <!-- hCaptcha -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">hCaptcha</h3>
          <UToggle v-model="form.hcaptchaEnabled" color="primary" />
        </div>
      </template>
      <div v-if="form.hcaptchaEnabled" class="space-y-4">
        <p class="text-[12px] text-gray-500">Protege formularios de tu tienda contra bots usando hCaptcha.</p>
        <UFormGroup label="Site Key" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UInput v-model="form.hcaptchaSiteKey" placeholder="10000000-ffff-ffff-ffff-000000000001" class="font-mono text-sm" />
        </UFormGroup>
        <UFormGroup label="Secret Key" :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UInput v-model="form.hcaptchaSecretKey" type="password" placeholder="0x0000000000000000000000000000000000000000" class="font-mono text-sm" />
        </UFormGroup>
      </div>
      <div v-else class="text-[13px] text-gray-500">
        hCaptcha está desactivado. Actívalo para proteger tus formularios.
      </div>
    </UCard>

    <!-- Tracking Codes -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Códigos de seguimiento</h3>
      </template>
      <div class="space-y-4">
        <div class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/40 flex items-start gap-2">
          <UIcon name="i-lucide-shield-alert" class="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p class="text-[12px] text-amber-800 dark:text-amber-300"><strong>Seguridad:</strong> Solo añade scripts de fuentes de confianza. Los scripts maliciosos pueden comprometer tu tienda.</p>
        </div>
        <UFormGroup label="Scripts en <head>" help="Código que se inyecta antes del cierre de la etiqueta </head>." :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UTextarea v-model="form.trackingHeadScripts" :rows="4" placeholder="<!-- Google Analytics, Meta Pixel, etc. -->" class="font-mono text-xs" />
        </UFormGroup>
        <UFormGroup label="Scripts en <body>" help="Código que se inyecta antes del cierre de la etiqueta </body>." :ui="{ label: { text: 'text-[13px] font-medium text-gray-700 dark:text-gray-300' } }">
          <UTextarea v-model="form.trackingBodyScripts" :rows="4" placeholder="<!-- Scripts adicionales -->" class="font-mono text-xs" />
        </UFormGroup>
      </div>
    </UCard>

    <!-- Sticky Save Bar -->
    <Transition name="slide-up">
      <div v-if="isDirty" class="fixed bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex justify-end gap-3 z-30">
        <UButton color="white" variant="solid" class="font-semibold px-5 border border-gray-300 dark:border-gray-700" @click="handleDiscard">Descartar</UButton>
        <UButton color="black" class="font-semibold px-6" @click="handleSave">Guardar</UButton>
      </div>
    </Transition>

    <!-- Unsaved changes leave modal -->
    <UModal v-model="showLeaveModal" :ui="{ width: 'sm:max-w-md' }">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Cambios sin guardar</h3>
            <UButton color="gray" variant="ghost" icon="i-lucide-x" size="xs" @click="cancelLeave" />
          </div>
        </template>
        <div class="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/40">
          <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p class="text-[13px] text-amber-800 dark:text-amber-300">Tienes cambios sin guardar. Si sales ahora, se descartarán todos los cambios realizados.</p>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="white" size="sm" class="font-medium" @click="cancelLeave">Seguir editando</UButton>
            <UButton color="red" size="sm" class="font-semibold" @click="confirmLeave">Descartar y salir</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

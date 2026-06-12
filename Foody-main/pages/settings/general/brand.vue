<script setup lang="ts">
import { useSettingsStore } from '~/stores/useSettingsStore'
import { useFormGuard } from '~/composables/useFormGuard'

const store = useSettingsStore()
const router = useRouter()
const toast = useToast()

const { form, isDirty, save, discard, showLeaveModal, confirmLeave, cancelLeave } = useFormGuard(
  () => ({
    brandLogoDefault: store.brandLogoDefault,
    brandLogoSquare: store.brandLogoSquare,
    brandColorPrimary: store.brandColorPrimary,
    brandColorSecondary: store.brandColorSecondary,
    brandCoverImage: store.brandCoverImage,
    brandSlogan: store.brandSlogan,
    brandShortDescription: store.brandShortDescription,
    brandSocialLinks: JSON.parse(JSON.stringify(store.brandSocialLinks)),
  }),
  (data) => {
    store.brandLogoDefault = data.brandLogoDefault
    store.brandLogoSquare = data.brandLogoSquare
    store.brandColorPrimary = data.brandColorPrimary
    store.brandColorSecondary = data.brandColorSecondary
    store.brandCoverImage = data.brandCoverImage
    store.brandSlogan = data.brandSlogan
    store.brandShortDescription = data.brandShortDescription
    store.brandSocialLinks = JSON.parse(JSON.stringify(data.brandSocialLinks))
  }
)

const isMediaModalOpen = ref(false)
const mediaTarget = ref<'logo_default' | 'logo_square' | 'cover'>('logo_default')

const openMediaModal = (target: typeof mediaTarget.value) => {
  mediaTarget.value = target
  isMediaModalOpen.value = true
}

const handleMediaConfirm = (urls: string[]) => {
  if (!urls.length) return
  const url = urls[0]
  if (mediaTarget.value === 'logo_default') form.value.brandLogoDefault = url
  else if (mediaTarget.value === 'logo_square') form.value.brandLogoSquare = url
  else if (mediaTarget.value === 'cover') form.value.brandCoverImage = url
}

const addSocialLink = () => {
  form.value.brandSocialLinks.push({ platform: '', url: '' })
}

const removeSocialLink = (index: number) => {
  form.value.brandSocialLinks.splice(index, 1)
}

const platformOptions = ['Instagram', 'Facebook', 'X (Twitter)', 'TikTok', 'YouTube', 'LinkedIn', 'Pinterest', 'Snapchat']

const handleSave = () => {
  save()
  toast.add({ title: 'Marca actualizada', description: 'Los ajustes de marca se han guardado correctamente.', color: 'green' })
}

const handleDiscard = () => {
  discard()
  toast.add({ title: 'Cambios descartados', color: 'gray' })
}
</script>

<template>
  <div class="max-w-3xl space-y-6 pb-24">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <UButton icon="i-lucide-arrow-left" color="gray" variant="ghost" size="sm" @click="router.push('/settings/general')" />
      <div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Marca</h2>
        <p class="text-sm text-gray-500">Logos, colores, eslogan y presencia de marca.</p>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-4 flex gap-3">
      <UIcon name="i-lucide-info" class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
      <div class="text-[13px] text-blue-800 dark:text-blue-300">
        <p class="font-semibold mb-1">¿Qué debería agregar?</p>
        <div class="flex flex-wrap gap-x-6 gap-y-1">
          <div>
            <span class="font-medium">Esencial:</span> Logo predeterminado, Logo cuadrado, Colores
          </div>
          <div>
            <span class="font-medium">Adicional:</span> Imagen de portada, Eslogan, Descripción, Redes sociales
          </div>
        </div>
      </div>
    </div>

    <!-- Logos -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Logos</h3>
      </template>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Default Logo -->
        <div>
          <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">Predeterminado</p>
          <p class="text-[12px] text-gray-500 mb-3">Se usa para las aplicaciones más comunes del logo.</p>
          <div
            v-if="form.brandLogoDefault"
            class="relative group w-full aspect-video rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900"
          >
            <img :src="form.brandLogoDefault" class="w-full h-full object-contain p-4" />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
              <UButton icon="i-lucide-image-plus" color="white" variant="solid" size="xs" @click="openMediaModal('logo_default')" />
              <UButton icon="i-lucide-trash" color="red" variant="solid" size="xs" @click="form.brandLogoDefault = ''" />
            </div>
          </div>
          <button
            v-else
            @click="openMediaModal('logo_default')"
            class="w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <UIcon name="i-lucide-image-plus" class="w-6 h-6 text-gray-400" />
            <span class="text-[12px] font-medium text-gray-500">Subir logo</span>
          </button>
        </div>

        <!-- Square Logo -->
        <div>
          <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">Cuadrado</p>
          <p class="text-[12px] text-gray-500 mb-3">Lo usan algunos canales de redes sociales. Puede recortarse en forma de círculo.</p>
          <div
            v-if="form.brandLogoSquare"
            class="relative group w-32 aspect-square rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900"
          >
            <img :src="form.brandLogoSquare" class="w-full h-full object-contain p-3" />
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
              <UButton icon="i-lucide-image-plus" color="white" variant="solid" size="xs" @click="openMediaModal('logo_square')" />
              <UButton icon="i-lucide-trash" color="red" variant="solid" size="xs" @click="form.brandLogoSquare = ''" />
            </div>
          </div>
          <button
            v-else
            @click="openMediaModal('logo_square')"
            class="w-32 aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <UIcon name="i-lucide-image-plus" class="w-5 h-5 text-gray-400" />
            <span class="text-[11px] font-medium text-gray-500">Subir</span>
          </button>
        </div>
      </div>
    </UCard>

    <!-- Colores -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Colores</h3>
      </template>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">Principal</p>
          <p class="text-[12px] text-gray-500 mb-3">Los colores de marca que aparecen en tu tienda, redes sociales y más sitios.</p>
          <div class="flex items-center gap-3">
            <label class="relative cursor-pointer">
              <input type="color" v-model="form.brandColorPrimary" class="sr-only" />
              <div class="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm" :style="{ backgroundColor: form.brandColorPrimary }"></div>
            </label>
            <UInput v-model="form.brandColorPrimary" class="w-28 font-mono text-sm" />
          </div>
        </div>
        <div>
          <p class="text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1">Secundario</p>
          <p class="text-[12px] text-gray-500 mb-3">Colores complementarios que se usan para destacar y añadir detalles.</p>
          <div class="flex items-center gap-3">
            <label class="relative cursor-pointer">
              <input type="color" v-model="form.brandColorSecondary" class="sr-only" />
              <div class="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm" :style="{ backgroundColor: form.brandColorSecondary }"></div>
            </label>
            <UInput v-model="form.brandColorSecondary" class="w-28 font-mono text-sm" />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Imagen de portada -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Imagen de portada</h3>
      </template>
      <p class="text-[12px] text-gray-500 mb-3">Imagen clave que muestra tu marca en páginas de perfil y apps.</p>
      <div
        v-if="form.brandCoverImage"
        class="relative group w-full aspect-[3/1] rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900"
      >
        <img :src="form.brandCoverImage" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
          <UButton icon="i-lucide-image-plus" color="white" variant="solid" size="xs" @click="openMediaModal('cover')" />
          <UButton icon="i-lucide-trash" color="red" variant="solid" size="xs" @click="form.brandCoverImage = ''" />
        </div>
      </div>
      <button
        v-else
        @click="openMediaModal('cover')"
        class="w-full aspect-[3/1] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <UIcon name="i-lucide-image-plus" class="w-6 h-6 text-gray-400" />
        <span class="text-[12px] font-medium text-gray-500">Subir imagen de portada</span>
      </button>
    </UCard>

    <!-- Eslogan -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Eslogan</h3>
      </template>
      <p class="text-[12px] text-gray-500 mb-3">Declaración de marca o eslogan que suele usarse junto con tu logo.</p>
      <UInput v-model="form.brandSlogan" placeholder="Tu eslogan aquí..." />
    </UCard>

    <!-- Descripción corta -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Descripción corta</h3>
      </template>
      <p class="text-[12px] text-gray-500 mb-3">Descripción de tu negocio que suele usarse en biografías y publicaciones.</p>
      <UTextarea v-model="form.brandShortDescription" :rows="3" placeholder="Describe tu negocio en pocas palabras..." />
    </UCard>

    <!-- Enlaces a redes sociales -->
    <UCard :ui="{ body: { padding: 'p-5' }, rounded: 'rounded-xl', shadow: 'shadow-sm', ring: 'ring-1 ring-gray-200 dark:ring-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-[14px] font-semibold text-gray-900 dark:text-white">Enlaces a redes sociales</h3>
          <UButton icon="i-lucide-plus" color="gray" variant="ghost" size="xs" @click="addSocialLink">Añadir</UButton>
        </div>
      </template>
      <div class="space-y-3">
        <div v-for="(link, idx) in form.brandSocialLinks" :key="idx" class="flex items-center gap-2">
          <USelectMenu v-model="link.platform" :options="platformOptions" class="w-40" placeholder="Red social" size="sm" />
          <UInput v-model="link.url" placeholder="https://..." class="flex-1" size="sm" />
          <UButton icon="i-lucide-x" color="gray" variant="ghost" size="xs" @click="removeSocialLink(idx)" />
        </div>
        <div v-if="form.brandSocialLinks.length === 0" class="text-[13px] text-gray-500 text-center py-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
          No hay enlaces configurados. Pulsa "Añadir" para agregar uno.
        </div>
      </div>
    </UCard>

    <!-- Footer message -->
    <div class="text-[12px] text-gray-400 text-center">
      Más información sobre cómo gestionar la <a href="#" class="text-blue-600 dark:text-blue-400 hover:underline">configuración de tu marca</a>.
    </div>

    <!-- Sticky Save Bar (only when dirty) -->
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

    <AppMediaModal v-model="isMediaModalOpen" @confirm="handleMediaConfirm" />
  </div>
</template>

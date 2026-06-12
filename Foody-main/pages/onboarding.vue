<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/useAuthStore'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

if (!authStore.isLoggedIn) await navigateTo('/login')

/* ── Steps ── */
const step = ref(1)
const TOTAL_STEPS = 3

/* ── Step 1 — Restaurant type ── */
const restaurantTypes = [
  { id: 'restaurante', label: 'Restaurante de mesa', desc: 'Servicio a mesa y cocina elaborada', icon: 'i-lucide-utensils' },
  { id: 'bar', label: 'Bar o cafetería', desc: 'Desayunos, tapas y bebidas', icon: 'i-lucide-coffee' },
  { id: 'catering', label: 'Catering o eventos', desc: 'Servicios especiales y celebraciones', icon: 'i-lucide-party-popper' },
  { id: 'takeaway', label: 'Comida para llevar', desc: 'Take away, delivery y food truck', icon: 'i-lucide-bike' },
]
const selectedType = ref<string>('')
const typeOtherText = ref('')
const typeError = ref(false)

const validateStep1 = () => {
  if (!selectedType.value) { typeError.value = true; return false }
  if (selectedType.value === 'otro' && !typeOtherText.value.trim()) { typeError.value = true; return false }
  typeError.value = false
  return true
}

/* ── Step 2 — Volume ── */
const volumes = [
  { id: 'xs', label: 'Menos de 50 comensales/día', desc: 'Negocio pequeño o familiar', icon: 'i-lucide-user' },
  { id: 'sm', label: '50 – 150 comensales/día', desc: 'Volumen medio', icon: 'i-lucide-users' },
  { id: 'md', label: '150 – 300 comensales/día', desc: 'Alto rendimiento', icon: 'i-lucide-trending-up' },
  { id: 'lg', label: 'Más de 300 comensales/día', desc: 'Gran operación o cadena', icon: 'i-lucide-building-2' },
]
const selectedVolume = ref<string>('')
const volumeOtherText = ref('')
const volumeError = ref(false)

const validateStep2 = () => {
  if (!selectedVolume.value) { volumeError.value = true; return false }
  if (selectedVolume.value === 'otro' && !volumeOtherText.value.trim()) { volumeError.value = true; return false }
  volumeError.value = false
  return true
}

/* ── Step 3 — Address & contact ── */
const address = ref('')
const city = ref('')
const phone1 = ref('')
const phone2 = ref('')
const step3Errors = ref<Record<string, string>>({})

const validateStep3 = () => {
  const errs: Record<string, string> = {}
  if (!address.value.trim()) errs.address = 'La dirección es obligatoria.'
  if (!city.value.trim()) errs.city = 'Ciudad y código postal son obligatorios.'
  if (!phone1.value.trim()) errs.phone1 = 'El teléfono principal es obligatorio.'
  step3Errors.value = errs
  return Object.keys(errs).length === 0
}

/* ── Navigation ── */
const nextStep = () => {
  if (step.value === 1 && !validateStep1()) return
  if (step.value === 2 && !validateStep2()) return
  step.value++
}

const prevStep = () => {
  if (step.value > 1) step.value--
}

const submitting = ref(false)
const handleFinish = async () => {
  if (!validateStep3()) return
  submitting.value = true
  await new Promise(r => setTimeout(r, 800))
  authStore.completeOnboarding()
  submitting.value = false
  toast.add({ title: '¡Listo!', description: 'Tu perfil ha sido configurado correctamente.', color: 'green' })
  await router.push('/stores')
}

const progressWidth = computed(() => `${(step.value / TOTAL_STEPS) * 100}%`)
</script>

<template>
  <div class="w-full flex flex-col items-center gap-6 py-10 px-4">

    <!-- Logo -->
    <div class="w-12 h-12 rounded-2xl bg-[#14b891] flex items-center justify-center shadow-lg">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <path d="M8 6C8 6 8 14 12 16C14 17 16 17 16 17C16 17 18 17 20 16C24 14 24 6 24 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 17V27" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M8 6V11" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M24 6V11" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M16 6V11" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </div>

    <!-- Card -->
    <div class="w-full max-w-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden">

      <!-- Progress bar -->
      <div class="h-1.5 bg-gray-100">
        <div
          class="h-full bg-[#14b891] transition-all duration-500 ease-out"
          :style="{ width: progressWidth }"
        />
      </div>

      <!-- Step label -->
      <div class="px-7 pt-6 pb-2 flex items-center justify-between">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Paso {{ step }} de {{ TOTAL_STEPS }}
        </p>
        <div class="flex gap-1.5">
          <div
            v-for="s in TOTAL_STEPS" :key="s"
            class="w-2 h-2 rounded-full transition-colors"
            :class="s <= step ? 'bg-[#14b891]' : 'bg-gray-200'"
          />
        </div>
      </div>

      <!-- ─────────────────────── STEP 1 ─────────────────────── -->
      <div v-if="step === 1" class="px-7 pb-7">
        <h2 class="text-xl font-bold text-gray-900 mb-1">¿Qué tipo de restaurante tienes?</h2>
        <p class="text-sm text-gray-500 mb-5">Personaliza tu experiencia según tu negocio.</p>

        <!-- 2×2 option grid -->
        <div class="grid grid-cols-2 gap-3 mb-3">
          <button
            v-for="opt in restaurantTypes" :key="opt.id"
            class="text-left border-2 rounded-xl p-4 transition-all hover:border-[#14b891]/60"
            :class="selectedType === opt.id
              ? 'border-[#14b891] bg-[#f0fdfb]'
              : 'border-gray-200 bg-white'"
            @click="selectedType = opt.id; typeError = false"
          >
            <UIcon
              :name="opt.icon"
              class="w-6 h-6 mb-2"
              :class="selectedType === opt.id ? 'text-[#14b891]' : 'text-gray-400'"
            />
            <p class="text-sm font-semibold text-gray-800 leading-snug">{{ opt.label }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ opt.desc }}</p>
          </button>
        </div>

        <!-- Otro (full width) -->
        <button
          class="w-full text-left border-2 rounded-xl p-4 transition-all hover:border-[#14b891]/60 mb-1"
          :class="selectedType === 'otro'
            ? 'border-[#14b891] bg-[#f0fdfb]'
            : 'border-gray-200 bg-white'"
          @click="selectedType = 'otro'; typeError = false"
        >
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-plus-circle"
              class="w-5 h-5"
              :class="selectedType === 'otro' ? 'text-[#14b891]' : 'text-gray-400'"
            />
            <p class="text-sm font-semibold text-gray-800">Otro</p>
          </div>
          <p class="text-xs text-gray-400 mt-0.5 pl-7">Mi tipo de negocio no está en la lista.</p>
        </button>

        <!-- Textarea for "Otro" -->
        <transition name="fade">
          <div v-if="selectedType === 'otro'" class="mt-2">
            <textarea
              v-model="typeOtherText"
              placeholder="Cuéntanos cómo es tu negocio…"
              rows="3"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none resize-none transition-all focus:border-[#14b891] focus:ring-1 focus:ring-[#14b891]"
              :class="typeError && selectedType === 'otro' && !typeOtherText.trim() ? 'border-red-400 ring-1 ring-red-400' : ''"
              @input="typeError = false"
            />
          </div>
        </transition>

        <p v-if="typeError" class="text-red-500 text-xs mt-1.5">
          {{ selectedType === 'otro' ? 'Describe tu tipo de negocio.' : 'Selecciona una opción para continuar.' }}
        </p>

        <div class="flex justify-end mt-5">
          <button
            class="bg-gray-900 hover:bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            @click="nextStep"
          >
            Continuar
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 inline ml-1" />
          </button>
        </div>
      </div>

      <!-- ─────────────────────── STEP 2 ─────────────────────── -->
      <div v-else-if="step === 2" class="px-7 pb-7">
        <h2 class="text-xl font-bold text-gray-900 mb-1">¿Cuál es tu volumen de negocio?</h2>
        <p class="text-sm text-gray-500 mb-5">Ajustamos las funciones según tu escala.</p>

        <!-- 2×2 option grid -->
        <div class="grid grid-cols-2 gap-3 mb-3">
          <button
            v-for="opt in volumes" :key="opt.id"
            class="text-left border-2 rounded-xl p-4 transition-all hover:border-[#14b891]/60"
            :class="selectedVolume === opt.id
              ? 'border-[#14b891] bg-[#f0fdfb]'
              : 'border-gray-200 bg-white'"
            @click="selectedVolume = opt.id; volumeError = false"
          >
            <UIcon
              :name="opt.icon"
              class="w-6 h-6 mb-2"
              :class="selectedVolume === opt.id ? 'text-[#14b891]' : 'text-gray-400'"
            />
            <p class="text-sm font-semibold text-gray-800 leading-snug">{{ opt.label }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ opt.desc }}</p>
          </button>
        </div>

        <!-- Otro -->
        <button
          class="w-full text-left border-2 rounded-xl p-4 transition-all hover:border-[#14b891]/60 mb-1"
          :class="selectedVolume === 'otro'
            ? 'border-[#14b891] bg-[#f0fdfb]'
            : 'border-gray-200 bg-white'"
          @click="selectedVolume = 'otro'; volumeError = false"
        >
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-plus-circle"
              class="w-5 h-5"
              :class="selectedVolume === 'otro' ? 'text-[#14b891]' : 'text-gray-400'"
            />
            <p class="text-sm font-semibold text-gray-800">Otro</p>
          </div>
          <p class="text-xs text-gray-400 mt-0.5 pl-7">Mi situación no encaja con estas opciones.</p>
        </button>

        <transition name="fade">
          <div v-if="selectedVolume === 'otro'" class="mt-2">
            <textarea
              v-model="volumeOtherText"
              placeholder="Describe tu volumen habitual…"
              rows="3"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none resize-none transition-all focus:border-[#14b891] focus:ring-1 focus:ring-[#14b891]"
              :class="volumeError && selectedVolume === 'otro' && !volumeOtherText.trim() ? 'border-red-400 ring-1 ring-red-400' : ''"
              @input="volumeError = false"
            />
          </div>
        </transition>

        <p v-if="volumeError" class="text-red-500 text-xs mt-1.5">
          {{ selectedVolume === 'otro' ? 'Describe tu volumen de negocio.' : 'Selecciona una opción para continuar.' }}
        </p>

        <div class="flex justify-between mt-5">
          <button
            class="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-1 transition-colors"
            @click="prevStep"
          >
            <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
            Atrás
          </button>
          <button
            class="bg-gray-900 hover:bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            @click="nextStep"
          >
            Continuar
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 inline ml-1" />
          </button>
        </div>
      </div>

      <!-- ─────────────────────── STEP 3 ─────────────────────── -->
      <div v-else-if="step === 3" class="px-7 pb-7">
        <h2 class="text-xl font-bold text-gray-900 mb-1">Dirección y contacto</h2>
        <p class="text-sm text-gray-500 mb-5">Usaremos estos datos para pedidos y comunicaciones.</p>

        <div class="space-y-4">

          <!-- Dirección -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Dirección <span class="text-red-500">*</span>
            </label>
            <input
              v-model="address"
              type="text"
              placeholder="Calle y número"
              class="w-full border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-[#14b891] focus:ring-1 focus:ring-[#14b891]"
              :class="step3Errors.address ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'"
              @input="delete step3Errors.address"
            />
            <p v-if="step3Errors.address" class="text-red-500 text-xs mt-1">{{ step3Errors.address }}</p>
          </div>

          <!-- Ciudad + CP -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Ciudad y código postal <span class="text-red-500">*</span>
            </label>
            <input
              v-model="city"
              type="text"
              placeholder="Ej: Valencia, 46001"
              class="w-full border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-[#14b891] focus:ring-1 focus:ring-[#14b891]"
              :class="step3Errors.city ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'"
              @input="delete step3Errors.city"
            />
            <p v-if="step3Errors.city" class="text-red-500 text-xs mt-1">{{ step3Errors.city }}</p>
          </div>

          <!-- Teléfono principal -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Teléfono principal <span class="text-red-500">*</span>
            </label>
            <input
              v-model="phone1"
              type="tel"
              placeholder="+34 612 345 678"
              class="w-full border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-[#14b891] focus:ring-1 focus:ring-[#14b891]"
              :class="step3Errors.phone1 ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'"
              @input="delete step3Errors.phone1"
            />
            <p v-if="step3Errors.phone1" class="text-red-500 text-xs mt-1">{{ step3Errors.phone1 }}</p>
          </div>

          <!-- Teléfono secundario (opcional) -->
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Teléfono secundario
              <span class="text-gray-400 font-normal normal-case ml-1">(opcional)</span>
            </label>
            <input
              v-model="phone2"
              type="tel"
              placeholder="+34 933 123 456"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-[#14b891] focus:ring-1 focus:ring-[#14b891]"
            />
          </div>

        </div>

        <div class="flex justify-between mt-6">
          <button
            class="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-1 transition-colors"
            @click="prevStep"
          >
            <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
            Atrás
          </button>
          <button
            class="bg-[#14b891] hover:bg-[#0fa07e] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
            :disabled="submitting"
            @click="handleFinish"
          >
            <svg v-if="submitting" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
            <UIcon v-else name="i-lucide-check" class="w-4 h-4" />
            Completar configuración
          </button>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>

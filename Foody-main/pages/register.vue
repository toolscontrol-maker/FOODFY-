<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/useAuthStore'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const loading = ref<string | null>(null)
const emailError = ref(false)

const doRegister = async (provider: 'email' | 'google' | 'apple' | 'facebook') => {
  if (provider === 'email' && !email.value.trim()) {
    emailError.value = true
    return
  }
  loading.value = provider
  emailError.value = false
  await new Promise(r => setTimeout(r, 700))
  authStore.register(email.value.trim(), provider)
  loading.value = null
  await router.push('/onboarding')
}
</script>

<template>
  <div class="w-full flex flex-col items-center gap-8 py-10">

    <!-- Logo Foodify (grande, como imagen 2) -->
    <div class="flex flex-col items-center gap-3">
      <div class="w-20 h-20 rounded-3xl bg-[#14b891] flex items-center justify-center shadow-xl">
        <svg width="46" height="46" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 6C8 6 8 14 12 16C14 17 16 17 16 17C16 17 18 17 20 16C24 14 24 6 24 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 17V27" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M8 6V11" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M24 6V11" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M16 6V11" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <!-- Title (image 2 style — big, centered) -->
    <div class="text-center">
      <h1 class="text-white text-4xl font-bold mb-2">Empieza tu prueba gratis</h1>
      <p class="text-gray-400 text-base">3 días gratis, luego 3 meses por 1 €/mes</p>
    </div>

    <!-- Card (wider, like image 2) -->
    <div class="w-full max-w-[480px]">
      <div class="bg-white rounded-2xl shadow-2xl px-8 py-7 flex flex-col gap-4">

        <!-- Email input (larger, with label — like image 2) -->
        <div class="flex flex-col gap-1">
          <div
            class="flex flex-col border rounded-xl px-4 pt-2 pb-2.5 transition-all"
            :class="emailError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500'"
          >
            <label class="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Correo electrónico</label>
            <input
              v-model="email"
              type="email"
              class="text-sm outline-none bg-transparent text-gray-900 placeholder-gray-300 mt-0.5"
              @keydown.enter="doRegister('email')"
              @input="emailError = false"
            />
          </div>
          <p v-if="emailError" class="text-red-500 text-xs px-1">Rellene este campo.</p>
        </div>

        <!-- Email CTA -->
        <button
          class="w-full bg-gray-900 hover:bg-black text-white text-sm font-semibold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          :disabled="loading !== null"
          @click="doRegister('email')"
        >
          <svg v-if="loading === 'email'" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
          Continuar con correo electrónico
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-px bg-gray-200" />
          <span class="text-xs text-gray-400">o</span>
          <div class="flex-1 h-px bg-gray-200" />
        </div>

        <!-- Social buttons -->
        <div class="flex flex-col gap-3">

          <!-- Google -->
          <button
            class="w-full flex items-center justify-center gap-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-3.5 rounded-lg transition-colors disabled:opacity-60"
            :disabled="loading !== null"
            @click="doRegister('google')"
          >
            <svg v-if="loading === 'google'" class="animate-spin w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.3 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.7-.2-3.4-.9-5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.7 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5c-7.4 0-13.8 4.2-17.7 10.2z"/><path fill="#4CAF50" d="M24 45.5c5.1 0 9.8-1.9 13.3-5l-6.2-5.2C29.3 37 26.8 38 24 38c-5.3 0-9.7-3.6-11.3-8.5l-6.6 5.1C9.9 41.2 16.4 45.5 24 45.5z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.5 4.6-4.5 6l6.2 5.2c3.7-3.4 6-8.4 6-14.2 0-1.7-.2-3.4-.9-5z"/></svg>
            Continuar con Google
          </button>

          <!-- Apple -->
          <button
            class="w-full flex items-center justify-center gap-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-3.5 rounded-lg transition-colors disabled:opacity-60"
            :disabled="loading !== null"
            @click="doRegister('apple')"
          >
            <svg v-if="loading === 'apple'" class="animate-spin w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 814 1000" fill="#000"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 389.9 55.9 279.6 55.9 239.8c0-209.8 137.5-321.3 272.5-321.3 68.2 0 125.1 44.7 168.2 44.7 40.8 0 104.2-47.6 179.5-47.6 28.2 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/></svg>
            Continuar con Apple
          </button>

          <!-- Facebook -->
          <button
            class="w-full flex items-center justify-center gap-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-3.5 rounded-lg transition-colors disabled:opacity-60"
            :disabled="loading !== null"
            @click="doRegister('facebook')"
          >
            <svg v-if="loading === 'facebook'" class="animate-spin w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continuar con Facebook
          </button>

        </div>

        <!-- Footer: already have account -->
        <p class="text-center text-xs text-gray-500 mt-1">
          ¿Ya tienes cuenta de Foodify?
          <button
            class="text-gray-700 underline font-medium hover:text-black transition-colors"
            @click="$router.push('/login')"
          >
            Iniciar sesión
          </button>
        </p>

      </div>

      <!-- Page footer -->
      <div class="mt-6 flex flex-col items-center gap-3">
        <button class="flex items-center gap-1.5 text-gray-400 text-sm border border-gray-700 rounded-full px-4 py-1.5 hover:border-gray-500 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          España
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <p class="text-gray-600 text-xs text-center">
          Al continuar, aceptas los
          <a href="#" class="underline hover:text-gray-400">Términos</a>
          y la
          <a href="#" class="underline hover:text-gray-400">Política de privacidad</a>.
        </p>
      </div>

    </div>
  </div>
</template>

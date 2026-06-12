// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  extends: ['@nuxt/ui-pro'],
  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    'nuxt-charts'
  ],
  ui: {
    safelistColors: ['neutral', 'amber', 'yellow', 'orange', 'green', 'blue', 'indigo', 'red', 'primary']
  },
  supabase: {
    url: process.env.SUPABASE_URL || 'https://example.supabase.co',
    key: process.env.SUPABASE_KEY || 'public-anon-key',
    redirect: false
  }
})

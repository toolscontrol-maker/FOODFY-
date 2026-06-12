export default defineNuxtPlugin({
  name: 'supabase-init',
  enforce: 'pre',
  setup (nuxtApp) {
    // The @nuxtjs/supabase module automatically initializes the client and provides $supabase.
    // We can access it here if we need to set up interceptors or global listeners.
    const supabase = useSupabaseClient()
    
    // Additional Supabase setup can be added here (e.g. auth listeners)
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // ── General ──
  const storeName = ref('Mi tienda')
  const storeAddress = ref('Calle Ejemplo 123, Valencia, España')
  const storePhone = ref('+34 612 345 678')

  const currency = ref('EUR')
  const currencyFormat = ref('€1.234,56')
  const backupRegion = ref('Unión Europea')
  const unitSystem = ref('Métrico')
  const defaultWeightUnit = ref('kg')
  const timezone = ref('(GMT+01:00) Madrid')

  const orderPrefix = ref('#')
  const orderSuffix = ref('')
  const orderNextNumber = ref(1001)

  const requireConfirmationStep = ref(true)
  const afterPayment = ref('auto_fulfill_all')
  const autoArchiveOrders = ref(true)

  // ── Brand ──
  const brandLogoDefault = ref('')
  const brandLogoSquare = ref('')
  const brandColorPrimary = ref('#16a34a')
  const brandColorSecondary = ref('#f59e0b')
  const brandCoverImage = ref('')
  const brandSlogan = ref('')
  const brandShortDescription = ref('')
  const brandSocialLinks = ref<{ platform: string; url: string }[]>([
    { platform: 'Instagram', url: '' },
    { platform: 'Facebook', url: '' },
    { platform: 'X (Twitter)', url: '' },
    { platform: 'TikTok', url: '' },
  ])

  // ── Plan ──
  const currentPlan = ref({
    name: 'Básico',
    price: 29,
    period: 'mes',
    features: [
      'Hasta 100 productos',
      '2 usuarios',
      'Soporte por email',
      'Informes básicos',
    ],
  })
  const subscriptions = ref<{ name: string; price: number; status: string; nextBilling: string }[]>([])

  // ── Billing ──
  const nextInvoice = ref({ amount: 29, date: '2026-05-03', status: 'pending' })
  const paymentMethods = ref<{ id: number; type: string; last4: string; expiry: string; isDefault: boolean }[]>([
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/28', isDefault: true },
  ])
  const taxId = ref('')
  const billingCurrency = ref('EUR')
  const billingCountry = ref('España')

  // ── Users ──
  const users = ref([
    { id: 1, name: 'Toni Torrent', email: 'toni@foodfy.com', role: 'admin', type: 'admin', status: 'Activo', twoFactor: true },
    { id: 2, name: 'María López', email: 'maria@foodfy.com', role: 'editor', type: 'poc', status: 'Activo', twoFactor: false },
  ])
  const roles = ref([
    { id: 'admin', label: 'Administrador', description: 'Acceso completo a todos los ajustes y datos' },
    { id: 'editor', label: 'Editor', description: 'Puede gestionar productos, pedidos y contenido' },
    { id: 'viewer', label: 'Visor', description: 'Solo puede ver datos, sin permisos de edición' },
    { id: 'driver', label: 'Repartidor', description: 'Acceso a pedidos asignados y rutas' },
  ])

  function addUser(user: any) {
    users.value.push({ ...user, id: Date.now() })
  }

  function updateUser(updatedUser: any) {
    const idx = users.value.findIndex(u => u.id === updatedUser.id)
    if (idx !== -1) users.value[idx] = { ...users.value[idx], ...updatedUser }
  }

  function deleteUser(id: number) {
    users.value = users.value.filter(u => u.id !== id)
  }

  function addPaymentMethod(method: any) {
    if (method.isDefault) paymentMethods.value.forEach(m => (m.isDefault = false))
    paymentMethods.value.push({ ...method, id: Date.now() })
  }

  function removePaymentMethod(id: number) {
    paymentMethods.value = paymentMethods.value.filter(m => m.id !== id)
  }

  // ── Checkout ──
  const checkoutContactMethod = ref('email')
  const checkoutShowTracking = ref(true)
  const checkoutRequireLogin = ref(false)
  const checkoutCustomerFields = ref([
    { key: 'full_name', label: 'Nombre completo', state: 'required' },
    { key: 'company', label: 'Empresa', state: 'optional' },
    { key: 'phone', label: 'Teléfono', state: 'required' },
    { key: 'address_line2', label: 'Dirección línea 2', state: 'optional' },
  ])
  const checkoutMarketingConsent = ref(true)
  const checkoutTipsEnabled = ref(true)
  const checkoutTipOptions = ref([5, 10, 15])
  const checkoutLanguage = ref('es')
  const checkoutAddressCollection = ref(true)
  const checkoutCartLimit = ref(50)

  return {
    // General
    storeName, storeAddress, storePhone,
    currency, currencyFormat, backupRegion, unitSystem, defaultWeightUnit, timezone,
    orderPrefix, orderSuffix, orderNextNumber,
    requireConfirmationStep, afterPayment, autoArchiveOrders,
    // Brand
    brandLogoDefault, brandLogoSquare,
    brandColorPrimary, brandColorSecondary,
    brandCoverImage, brandSlogan, brandShortDescription, brandSocialLinks,
    // Plan
    currentPlan, subscriptions,
    // Billing
    nextInvoice, paymentMethods, taxId, billingCurrency, billingCountry,
    addPaymentMethod, removePaymentMethod,
    // Users
    users, roles, addUser, updateUser, deleteUser,
    // Checkout
    checkoutContactMethod, checkoutShowTracking, checkoutRequireLogin,
    checkoutCustomerFields, checkoutMarketingConsent,
    checkoutTipsEnabled, checkoutTipOptions, checkoutLanguage,
    checkoutAddressCollection, checkoutCartLimit,
  }
})

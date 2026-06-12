export default defineAppConfig({
  ui: {
    primary: 'neutral',
    gray: 'neutral',
    button: {
      default: {
        color: 'black'
      }
    },
    alert: {
      default: {
        closeButton: { icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }
      }
    },
    card: {
      body: {
        base: '',
        background: '',
        padding: 'px-4 py-4 sm:p-4'
      },
      header: {
        base: '',
        background: '',
        padding: 'px-4 py-4 sm:px-4'
      }
    }
  }
})

export default defineEventHandler((event) => {
  return [
    { id: 'PRD-1', name: 'Pizza Margarita', price: 12.50, category: 'Pizza', stock: 50 },
    { id: 'PRD-2', name: 'Hamburguesa Clasica', price: 8.50, category: 'Hamburguesas', stock: 30 },
    { id: 'PRD-3', name: 'Ensalada Cesar', price: 7.00, category: 'Ensaladas', stock: 20 },
    { id: 'PRD-4', name: 'Refresco Cola', price: 2.50, category: 'Bebidas', stock: 100 }
  ]
})

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProductsStore = defineStore('products', () => {
  const categories = ref(['Hamburguesas', 'Entrantes', 'Bebidas', 'Postres'])
  
  const products = ref([
    { 
      id: 1, 
      name: 'Hamburguesa Clásica', 
      desc: 'Carne 100% vacuno, lechuga, tomate, cebolla roja y salsa especial.', 
      price: 12.50, 
      status: 'Activo', 
      category: 'Hamburguesas', 
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop', 
      inventory: 0, 
      channels: 3,
      vendor: 'Mi tienda',
      collections: ['Página de inicio'],
      tags: [],
      type: 'Comida',
      sku: 'HAM-001',
      modifiers: [
        {
          id: 101,
          name: 'Quitar ingredientes',
          type: 'multiple',
          required: false,
          options: [
            { id: 1, label: 'Sin lechuga', price: 0 },
            { id: 2, label: 'Sin tomate', price: 0 },
            { id: 3, label: 'Sin cebolla', price: 0 }
          ]
        },
        {
          id: 102,
          name: 'Extras',
          type: 'multiple',
          required: false,
          options: [
            { id: 4, label: 'Extra queso', price: 1.0 },
            { id: 5, label: 'Extra bacon', price: 1.5 },
            { id: 6, label: 'Huevo frito', price: 1.2 }
          ]
        }
      ]
    },
    { 
      id: 2, 
      name: 'Doble Smash Bacon', 
      desc: 'Doble smash patty, cuádruple cheddar, bacon crujiente y salsa BBQ.', 
      price: 15.00, 
      status: 'Activo', 
      category: 'Hamburguesas', 
      image: 'https://i.redd.it/az5zx99z1vhb1.jpg', 
      inventory: 45, 
      channels: 3,
      vendor: 'Mi tienda',
      collections: ['Página de inicio'],
      tags: ['Popular'],
      type: 'Comida',
      sku: 'HAM-002'
    },
    { 
      id: 3, 
      name: 'Truffle Mushroom', 
      desc: 'Hamburguesa con setas, queso suizo y mahonesa de trufa.', 
      price: 14.00, 
      status: 'Borrador', 
      category: 'Sin categoría', 
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=300&auto=format&fit=crop', 
      inventory: 12, 
      channels: 0,
      vendor: 'Mi tienda',
      collections: [],
      tags: [],
      type: 'Comida',
      sku: 'HAM-003'
    },
  ])

  function addProduct(product: any) {
    products.value.unshift(product)
  }

  function updateProduct(updatedProduct: any) {
    const index = products.value.findIndex(p => p.id === updatedProduct.id || p.id == updatedProduct.id)
    if (index !== -1) {
      products.value[index] = { ...products.value[index], ...updatedProduct }
    }
  }

  function deleteProduct(id: number | string) {
    products.value = products.value.filter(p => p.id !== id && p.id != id)
  }

  function addCategory(category: string) {
    if (!categories.value.includes(category)) {
      categories.value.push(category)
    }
  }

  function updateCategory(oldName: string, newName: string) {
    const index = categories.value.indexOf(oldName)
    if (index !== -1) {
      categories.value[index] = newName
      products.value.forEach(p => {
        if (p.category === oldName) p.category = newName
      })
    }
  }

  function deleteCategory(category: string) {
    const index = categories.value.indexOf(category)
    if (index !== -1) {
      categories.value.splice(index, 1)
      products.value.forEach(p => {
        if (p.category === category) p.category = 'Sin categoría'
      })
    }
  }

  return {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory
  }
})

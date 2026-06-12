export default defineEventHandler((event) => {
  return [
    { id: '#1001', date: '12:30', customer: 'Juan Perez', itemsText: '2x Burger Smash, 1x Patatas bravas', total: 45.50, paymentStatus: 'paid', fulfillmentStatus: 'preparing', deliveryMethod: 'delivery' },
    { id: '#1002', date: '11:45', customer: 'Maria Gomez', itemsText: '1x Ensalada César', total: 12.00, paymentStatus: 'pending', fulfillmentStatus: 'received', deliveryMethod: 'pickup' },
    { id: '#1003', date: 'Ayer 21:10', customer: 'Carlos Ramirez', itemsText: '1x Pizza Margarita, 1x Tiramisú', total: 18.50, paymentStatus: 'paid', fulfillmentStatus: 'delivered', deliveryMethod: 'delivery' },
    { id: '#1004', date: 'Ayer 20:30', customer: 'Ana Torres', itemsText: '5x Menú Infantil', total: 60.00, paymentStatus: 'paid', fulfillmentStatus: 'ready', deliveryMethod: 'pickup' },
    { id: '#1005', date: '21 feb 14:45', customer: 'Luis Silva', itemsText: '1x Burrito Mixto, 1x Nachos', total: 22.10, paymentStatus: 'refunded', fulfillmentStatus: 'cancelled', deliveryMethod: 'delivery' },
    { id: '#1006', date: '19 feb 21:00', customer: 'Carmen Rosa', itemsText: '1x Poke Bowl Salmón', total: 14.00, paymentStatus: 'paid', fulfillmentStatus: 'delivered', deliveryMethod: 'delivery' },
    { id: '#1007', date: '13:05', customer: 'Mesa 4', itemsText: '2x Cerveza Artesanal, 1x Ración Jamón', total: 25.00, paymentStatus: 'pending', fulfillmentStatus: 'preparing', deliveryMethod: 'dine_in' }
  ]
})

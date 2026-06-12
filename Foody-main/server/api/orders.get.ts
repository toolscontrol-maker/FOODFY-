export default defineEventHandler((event) => {
  return [
    { id: '#1001', date: '14:30', customer: 'Juan Pérez', itemsText: '2x Burger Clásica, 1x Patatas', total: 45.50, paymentStatus: 'paid', fulfillmentStatus: 'delivered', deliveryMethod: 'delivery' },
    { id: '#1002', date: '13:15', customer: 'María Gómez', itemsText: '1x Pizza Margarita, 2x Coca-Cola', total: 22.00, paymentStatus: 'paid', fulfillmentStatus: 'preparing', deliveryMethod: 'dine_in' },
    { id: '#1003', date: '12:45', customer: 'Carlos Ramírez', itemsText: '1x Ensalada César', total: 18.50, paymentStatus: 'pending', fulfillmentStatus: 'received', deliveryMethod: 'pickup' },
    { id: '#1004', date: 'Ayer 20:00', customer: 'Ana Torres', itemsText: '3x Tacos, 1x Guacamole, 2x Agua', total: 60.00, paymentStatus: 'paid', fulfillmentStatus: 'delivered', deliveryMethod: 'delivery' },
    { id: '#1005', date: 'Ayer 18:30', customer: 'Luis Silva', itemsText: '1x Ramen Tonkotsu', total: 32.10, paymentStatus: 'pending', fulfillmentStatus: 'ready', deliveryMethod: 'pickup' },
    { id: '#1006', date: '15 feb 14:00', customer: 'Carmen Rosa', itemsText: '2x Sushi Roll, 1x Edamame', total: 12.00, paymentStatus: 'refunded', fulfillmentStatus: 'cancelled', deliveryMethod: 'delivery' },
    { id: '#1007', date: '14:00', customer: 'Mesa 5', itemsText: '1x Paella Valenciana, 2x Sangría', total: 38.90, paymentStatus: 'paid', fulfillmentStatus: 'preparing', deliveryMethod: 'dine_in' },
    { id: '#1008', date: '13:50', customer: 'Roberto Díaz', itemsText: '1x Wrap Pollo, 1x Smoothie', total: 15.20, paymentStatus: 'paid', fulfillmentStatus: 'delivering', deliveryMethod: 'delivery' }
  ]
})

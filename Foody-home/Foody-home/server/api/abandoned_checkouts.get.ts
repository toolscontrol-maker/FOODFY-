export default defineEventHandler((event) => {
  return [
    { id: '#89823', date: 'hoy a las 14:15', customer: 'Pedro Morales', total: 120.00, emailStatus: 'not_sent', recoveryStatus: 'not_recovered' },
    { id: '#89822', date: 'hoy a las 11:30', customer: 'Laura Gonzalez', total: 45.00, emailStatus: 'sent', recoveryStatus: 'recovered' },
    { id: '#89821', date: 'ayer a las 20:00', customer: 'Sofia Martinez', total: 60.50, emailStatus: 'sent', recoveryStatus: 'not_recovered' },
    { id: '#89820', date: 'ayer a las 15:25', customer: 'Diego Gutierrez', total: 85.00, emailStatus: 'not_sent', recoveryStatus: 'not_recovered' }
  ]
})

export default defineEventHandler((event) => {
  return [
    { id: '#AC1001', date: 'Hoy 10:30', customer: 'Laura Martín', emailStatus: 'not_sent', recoveryStatus: 'not_recovered', total: 32.50 },
    { id: '#AC1002', date: 'Hoy 09:15', customer: 'Pedro Sánchez', emailStatus: 'sent', recoveryStatus: 'recovered', total: 18.90 },
    { id: '#AC1003', date: 'Ayer 20:45', customer: 'Isabel Díaz', emailStatus: 'sent', recoveryStatus: 'not_recovered', total: 45.00 },
    { id: '#AC1004', date: 'Ayer 14:20', customer: 'Miguel Ángel', emailStatus: 'not_sent', recoveryStatus: 'not_recovered', total: 27.80 },
    { id: '#AC1005', date: '15 feb 11:00', customer: 'Ana García', emailStatus: 'sent', recoveryStatus: 'recovered', total: 55.20 },
  ]
})

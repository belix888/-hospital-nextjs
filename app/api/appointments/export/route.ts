import { initDatabase, getAppointmentsByDateRange } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    await initDatabase()
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return new Response('Missing startDate or endDate', { status: 400 })
    }

    console.log('Exporting appointments from', startDate, 'to', endDate)
    
    const appointments = await getAppointmentsByDateRange(startDate, endDate)
    console.log('Found appointments:', appointments.length)

    // Helper to safely format dates
    const formatDate = (dateStr: string | null | undefined) => {
      if (!dateStr) return ''
      try {
        return new Date(dateStr).toLocaleDateString('ru')
      } catch {
        return dateStr
      }
    }

    const formatTime = (timeStr: string | null | undefined) => {
      if (!timeStr) return ''
      try {
        return new Date(timeStr).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
      } catch {
        return timeStr
      }
    }

    // Create CSV content
    const headers = ['Дата', 'Время', 'Врач', 'Специализация', 'Пациент', 'Телефон', 'Кабинет', 'Статус', 'Заметки']
    const rows = appointments.map((apt: any) => [
      formatDate(apt.appointmentDate),
      formatTime(apt.appointmentTime),
      apt.doctor_name || '',
      apt.doctor_specialization || '',
      apt.patient_name || '',
      apt.patient_phone || '',
      apt.room_name || '',
      apt.status === 'scheduled' ? 'Запланировано' : apt.status === 'completed' ? 'Завершено' : apt.status === 'cancelled' ? 'Отменено' : apt.status,
      apt.notes || ''
    ])

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    ].join('\n')

    // Add BOM for Excel to properly display Russian characters
    const BOM = '\uFEFF'
    
    return new Response(BOM + csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="appointments_${startDate}_${endDate}.csv"`
      }
    })
  } catch (error: any) {
    console.error('Error exporting appointments:', error)
    return new Response('Error exporting: ' + error.message, { status: 500 })
  }
}
import { getAppointments, createAppointment, initDatabase } from '@/lib/db'

export async function GET(request: Request) {
  try {
    await initDatabase()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const doctorId = searchParams.get('doctorId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // If we have startDate and endDate, get all appointments in range
    if (startDate && endDate) {
      const { getAppointmentsByDateRange } = await import('@/lib/db')
      const appointments = await getAppointmentsByDateRange(startDate, endDate)
      return Response.json(appointments)
    }

    const appointments = await getAppointments({ date: date || undefined, doctorId: doctorId || undefined })
    return Response.json(appointments)
  } catch (error: any) {
    console.error('Error fetching appointments:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await initDatabase()
    const body = await request.json()
    const { doctorId, patientId, roomId, appointmentDate, appointmentTime, durationMinutes, notes } = body

    if (!doctorId || !patientId || !roomId || !appointmentDate || !appointmentTime) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const appointment = await createAppointment({
      doctorId,
      patientId,
      roomId,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentDate + 'T' + appointmentTime + ':00',
      durationMinutes,
      notes
    })

    return Response.json(appointment)
  } catch (error: any) {
    console.error('Error creating appointment:', error)
    return Response.json({ error: error.message || 'Failed to create appointment' }, { status: 500 })
  }
}
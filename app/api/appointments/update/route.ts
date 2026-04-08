import { initDatabase, supabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    await initDatabase()
    const body = await request.json()
    const { id, action, durationMinutes } = body

    if (!id || !action) {
      return NextResponse.json({ error: 'ID and action are required' }, { status: 400 })
    }

    // Get current appointment
    const { data: currentAppointment, error: fetchError } = await supabase
      .from('Appointment')
      .select('*, Room:roomId(name), Doctor:doctorId(name, specialization)')
      .eq('id', id)
      .single()

    if (fetchError || !currentAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    if (action === 'extend') {
      // Extend appointment duration
      const additionalMinutes = durationMinutes || 30
      const newDuration = (currentAppointment.durationMinutes || 60) + additionalMinutes

      // Check for conflicts with new end time
      const newEndTime = new Date(new Date(currentAppointment.appointmentTime).getTime() + newDuration * 60000)
      
      const { data: conflictingAppointments, error: conflictError } = await supabase
        .from('Appointment')
        .select('*, Room:roomId(name)')
        .eq('appointmentDate', currentAppointment.appointmentDate)
        .eq('status', 'scheduled')
        .neq('id', id)
        .or(`roomId.eq.${currentAppointment.roomId}`)

      if (conflictError) throw conflictError

      if (conflictingAppointments && conflictingAppointments.length > 0) {
        for (const apt of conflictingAppointments) {
          const aptStart = new Date(apt.appointmentTime)
          const aptEnd = new Date(aptStart.getTime() + (apt.durationMinutes || 60) * 60000)
          
          if (newEndTime > aptStart) {
            throw new Error(`Нельзя продлить: кабинет "${apt.Room?.name}" занят с ${aptStart.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`)
          }
        }
      }

      // Update appointment
      const { data: updated, error: updateError } = await supabase
        .from('Appointment')
        .update({ durationMinutes: newDuration })
        .eq('id', id)
        .select('*, Doctor:doctorId(name, specialization), Patient:patientId(name, phone), Room:roomId(name)')
        .single()

      if (updateError) throw updateError

      return NextResponse.json({
        ...updated,
        doctor_name: updated.Doctor?.name,
        doctor_specialization: updated.Doctor?.specialization,
        patient_name: updated.Patient?.name,
        patient_phone: updated.Patient?.phone,
        room_name: updated.Room?.name
      })
    }

    if (action === 'complete') {
      // Mark as completed
      console.log('Completing appointment:', id)
      
      const { data: updated, error: updateError } = await supabase
        .from('Appointment')
        .update({ status: 'completed' })
        .eq('id', id)
        .select('*, Doctor:doctorId(name, specialization), Patient:patientId(name, phone), Room:roomId(name)')
        .single()

      if (updateError) {
        console.error('Complete error:', updateError)
        throw updateError
      }

      return NextResponse.json({
        ...updated,
        doctor_name: updated.Doctor?.name,
        doctor_specialization: updated.Doctor?.specialization,
        patient_name: updated.Patient?.name,
        patient_phone: updated.Patient?.phone,
        room_name: updated.Room?.name
      })
    }

    if (action === 'cancel') {
      // Cancel appointment
      const { data: updated, error: updateError } = await supabase
        .from('Appointment')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select('*, Doctor:doctorId(name, specialization), Patient:patientId(name, phone), Room:roomId(name)')
        .single()

      if (updateError) throw updateError

      return NextResponse.json({
        ...updated,
        doctor_name: updated.Doctor?.name,
        doctor_specialization: updated.Doctor?.specialization,
        patient_name: updated.Patient?.name,
        patient_phone: updated.Patient?.phone,
        room_name: updated.Room?.name
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  } catch (error: any) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: error.message || 'Failed to update appointment' }, { status: 500 })
  }
}
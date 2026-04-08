import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezltbmyhpmnbfeboexlz.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_dtuVEjfn7Enw_Ta-CfLmwg_dnOLIYYb'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize database tables - tables already exist in Supabase
export async function initDatabase() {
  try {
    // Just verify connection works by querying a simple table
    await supabase.from('User').select('id').limit(1)
    console.log('Database connected successfully!')
    return true
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
}

// Doctors
export async function getDoctors() {
  const { data, error } = await supabase
    .from('Doctor')
    .select('*')
    .eq('isActive', true)
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function getAllDoctors() {
  const { data, error } = await supabase
    .from('Doctor')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function createDoctor(data: { name: string; specialization: string; phone?: string; email?: string }) {
  const { data: result, error } = await supabase
    .from('Doctor')
    .insert({
      name: data.name,
      specialization: data.specialization,
      phone: data.phone || null,
      email: data.email || null,
      isActive: true
    })
    .select()
    .single()
  
  if (error) throw error
  return result
}

export async function updateDoctor(data: { id: string; name: string; specialization: string; phone?: string; email?: string; isActive: boolean }) {
  const { data: result, error } = await supabase
    .from('Doctor')
    .update({
      name: data.name,
      specialization: data.specialization,
      phone: data.phone || null,
      email: data.email || null,
      isActive: data.isActive
    })
    .eq('id', data.id)
    .select()
    .single()
  
  if (error) throw error
  return result
}

export async function deleteDoctor(id: string) {
  const { error } = await supabase
    .from('Doctor')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Patients
export async function getPatients() {
  const { data, error } = await supabase
    .from('Patient')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function createPatient(data: { name: string; phone: string; birthDate?: string }) {
  const { data: result, error } = await supabase
    .from('Patient')
    .insert({
      name: data.name,
      phone: data.phone,
      birthDate: data.birthDate || null
    })
    .select()
    .single()
  
  if (error) throw error
  return result
}

// Rooms
export async function getRooms() {
  const { data, error } = await supabase
    .from('Room')
    .select('*')
    .eq('isDeleted', false)
    .order('name')
  
  if (error) throw error
  return data || []
}

export async function createRoom(data: { name: string; isAvailable?: boolean }) {
  const { data: result, error } = await supabase
    .from('Room')
    .insert({
      name: data.name,
      isAvailable: data.isAvailable ?? true,
      isDeleted: false
    })
    .select()
    .single()
  
  if (error) throw error
  return result
}

export async function updateRoom(data: { id: string; name: string; isAvailable: boolean }) {
  const { data: result, error } = await supabase
    .from('Room')
    .update({
      name: data.name,
      isAvailable: data.isAvailable
    })
    .eq('id', data.id)
    .select()
    .single()
  
  if (error) throw error
  return result
}

export async function deleteRoom(id: string) {
  // Soft delete
  const { error } = await supabase
    .from('Room')
    .update({ isDeleted: true, deletedAt: new Date().toISOString() })
    .eq('id', id)
  
  if (error) throw error
}

// Appointments
export async function getAppointments(filters?: { date?: string; doctorId?: string }) {
  let query = supabase
    .from('Appointment')
    .select(`
      *,
      Doctor:doctorId(name, specialization),
      Patient:patientId(name, phone),
      Room:roomId(name)
    `)
  
  if (filters?.date) {
    query = query.gte('appointmentDate', filters.date + ' 00:00:00')
               .lte('appointmentDate', filters.date + ' 23:59:59')
  }
  
  if (filters?.doctorId) {
    query = query.eq('doctorId', filters.doctorId)
  }
  
  const { data, error } = await query.order('appointmentDate').order('appointmentTime')
  
  // Flatten the data and calculate end time - use stored value or default 60
  return (data || []).map(item => {
    const startTime = new Date(item.appointmentTime)
    // Use stored duration or default to 60
    let duration = parseInt(String(item.durationMinutes), 10) || 60
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000)
    return {
      ...item,
      durationMinutes: duration,
      doctor_name: item.Doctor?.name,
      doctor_specialization: item.Doctor?.specialization,
      patient_name: item.Patient?.name,
      patient_phone: item.Patient?.phone,
      room_name: item.Room?.name,
      endTime: endTime.toISOString()
    }
  })
}
}

export async function getAppointmentsByDateRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('Appointment')
    .select(`
      *,
      Doctor:doctorId(name, specialization),
      Patient:patientId(name, phone),
      Room:roomId(name)
    `)
    .gte('appointmentDate', startDate + ' 00:00:00')
    .lte('appointmentDate', endDate + ' 23:59:59')
    .order('appointmentDate')
    .order('appointmentTime')
  
  if (error) throw error
   
  // Flatten the data and calculate end time - use stored value or default 60
  return (data || []).map(item => {
    const startTime = new Date(item.appointmentTime)
    // Use stored duration or default to 60
    let duration = parseInt(String(item.durationMinutes), 10) || 60
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000)
    return {
      ...item,
      durationMinutes: duration,
      doctor_name: item.Doctor?.name,
      doctor_specialization: item.Doctor?.specialization,
      patient_name: item.Patient?.name,
      patient_phone: item.Patient?.phone,
      room_name: item.Room?.name,
      endTime: endTime.toISOString()
    }
  })
}

export async function createAppointment(data: {
  doctorId: string
  patientId: string
  roomId: string
  appointmentDate: string
  appointmentTime: string
  durationMinutes?: number
  notes?: string
}) {
  // Check if room is already booked at this time
  const startTime = new Date(data.appointmentTime)
  const endTime = new Date(startTime.getTime() + (data.durationMinutes || 60) * 60000)
  
  const { data: existingAppointments, error: checkError } = await supabase
    .from('Appointment')
    .select('*, Room:roomId(name), Doctor:doctorId(name, specialization)')
    .eq('appointmentDate', data.appointmentDate)
    .eq('status', 'scheduled')
    .or(`roomId.eq.${data.roomId},doctorId.eq.${data.doctorId}`)

  if (checkError) throw checkError

  if (existingAppointments && existingAppointments.length > 0) {
    // Check for overlapping appointments (same room OR same doctor)
    for (const apt of existingAppointments) {
      const existingStart = new Date(apt.appointmentTime)
      const existingEnd = new Date(existingStart.getTime() + (apt.durationMinutes || 60) * 60000)
      
      // Check if times overlap
      if (startTime < existingEnd && endTime > existingStart) {
        // Determine if it's room conflict or doctor conflict
        if (apt.roomId === data.roomId) {
          throw new Error(`Кабинет "${apt.Room?.name || 'кабинет'}" уже занят в это время (${existingStart.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}). Выберите другое время или кабинет.`)
        } else if (apt.doctorId === data.doctorId) {
          throw new Error(`Врач "${apt.Doctor?.name || 'врач'}" уже занят в это время (${existingStart.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}). Выберите другое время.`)
        }
      }
    }
  }

  const { data: result, error } = await supabase
    .from('Appointment')
    .insert({
      doctorId: data.doctorId,
      patientId: data.patientId,
      roomId: data.roomId,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      durationMinutes: data.durationMinutes || 60,
      notes: data.notes || '',
      status: 'scheduled'
    })
    .select()
    .single()
  
  if (error) throw error
  return result
}

// Stats
export async function getStats() {
  try {
    const [doctors, patients, rooms, appointments] = await Promise.all([
      supabase.from('Doctor').select('*', { count: 'exact', head: true }).eq('isActive', true),
      supabase.from('Patient').select('*', { count: 'exact', head: true }),
      supabase.from('Room').select('*', { count: 'exact', head: true }).eq('isAvailable', true).eq('isDeleted', false),
      supabase.from('Appointment').select('*', { count: 'exact', head: true })
    ])
    
    const today = new Date().toISOString().split('T')[0]
    const todayAppointments = await supabase
      .from('Appointment')
      .select('*', { count: 'exact', head: true })
      .gte('appointmentDate', today + ' 00:00:00')
      .lte('appointmentDate', today + ' 23:59:59')
    
    return {
      doctorsCount: doctors.count || 0,
      patientsCount: patients.count || 0,
      roomsCount: rooms.count || 0,
      appointmentsToday: todayAppointments.count || 0,
      totalAppointments: appointments.count || 0
    }
  } catch (error) {
    return {
      doctorsCount: 0,
      patientsCount: 0,
      roomsCount: 0,
      appointmentsToday: 0,
      totalAppointments: 0
    }
  }
}

// Users
export async function createUser(data: { email: string; password: string; name?: string; role?: string; doctorId?: string }) {
  const { data: result, error } = await supabase
    .from('User')
    .insert({
      email: data.email,
      password: data.password,
      name: data.name || null,
      role: data.role || 'user',
      doctorId: data.doctorId || null
    })
    .select()
    .single()
  
  if (error) throw error
  return result
}

// Verify login and get user with doctor info
export async function verifyLogin(email: string, password: string) {
  const { data: users, error } = await supabase
    .from('User')
    .select('*, Doctor:doctorId(id, name, specialization)')
    .eq('email', email)
    .eq('password', password)
    .limit(1)

  if (error) throw error
  if (!users || users.length === 0) return null
  
  return users[0]
}

export async function updateUser(data: { id: string; email: string; name?: string; role?: string }) {
  const { data: result, error } = await supabase
    .from('User')
    .update({
      email: data.email,
      name: data.name || null,
      role: data.role || 'user'
    })
    .eq('id', data.id)
    .select()
    .single()
  
  if (error) throw error
  return result
}

export async function deleteUser(id: string) {
  const { error } = await supabase
    .from('User')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
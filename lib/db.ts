import { Pool } from 'pg'

const globalForPool = globalThis as unknown as {
  pool: Pool | undefined
}

export const pool = globalForPool.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

if (process.env.NODE_ENV !== 'production') globalForPool.pool = pool

// Initialize database tables
export async function initDatabase() {
  try {
    // Create Doctor table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Doctor" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "specialization" VARCHAR(255) NOT NULL,
        "phone" VARCHAR(50),
        "email" VARCHAR(255),
        "telegramId" BIGINT UNIQUE,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create Patient table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Patient" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "phone" VARCHAR(50) NOT NULL,
        "birthDate" DATE,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create Room table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Room" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(100) NOT NULL UNIQUE,
        "isAvailable" BOOLEAN DEFAULT true,
        "isDeleted" BOOLEAN DEFAULT false,
        "deletedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create Appointment table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Appointment" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "doctorId" UUID NOT NULL REFERENCES "Doctor"("id"),
        "patientId" UUID NOT NULL REFERENCES "Patient"("id"),
        "roomId" UUID NOT NULL REFERENCES "Room"("id"),
        "appointmentDate" DATE NOT NULL,
        "appointmentTime" TIMESTAMP NOT NULL,
        "durationMinutes" INTEGER DEFAULT 60,
        "status" VARCHAR(50) DEFAULT 'scheduled',
        "notes" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create User table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        "name" VARCHAR(255),
        "role" VARCHAR(50) DEFAULT 'user',
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `)

    // Insert sample data if tables are empty
    const doctorCount = await pool.query('SELECT COUNT(*) FROM "Doctor"')
    if (parseInt(doctorCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO "Doctor" ("name", "specialization", "phone", "email") VALUES
        ('Иванов Иван Иванович', 'Терапевт', '+7 999 123-45-67', 'ivanov@hospital.ru'),
        ('Петрова Анна Сергеевна', 'Кардиолог', '+7 999 234-56-78', 'petrova@hospital.ru'),
        ('Сидоров Алексей Петрович', 'Хирург', '+7 999 345-67-89', 'sidorov@hospital.ru')
      `)
    }

    // Create default admin user if not exists
    const userCount = await pool.query('SELECT COUNT(*) FROM "User"')
    if (parseInt(userCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO "User" (email, password, name, role) VALUES
        ('admin@hospital.ru', 'admin123', 'Администратор', 'admin')
      `)
    }

    const roomCount = await pool.query('SELECT COUNT(*) FROM "Room"')
    if (parseInt(roomCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO "Room" ("name", "isAvailable") VALUES
        ('Кабинет 1', true),
        ('Кабинет 2', true),
        ('Кабинет 3', true),
        ('Кабинет 4', true),
        ('Кабинет 5', true),
        ('Кабинет 6', true)
      `)
    }

    console.log('Database initialized successfully!')
    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    return false
  }
}

// Doctors
export async function getDoctors() {
  const result = await pool.query('SELECT * FROM "Doctor" WHERE "isActive" = true ORDER BY name')
  return result.rows
}

export async function getAllDoctors() {
  const result = await pool.query('SELECT * FROM "Doctor" ORDER BY name')
  return result.rows
}

export async function createDoctor(data: { name: string; specialization: string; phone?: string; email?: string; telegramId?: bigint }) {
  const result = await pool.query(
    `INSERT INTO "Doctor" (name, specialization, phone, email, "telegramId", "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
     RETURNING *`,
    [data.name, data.specialization, data.phone || null, data.email || null, data.telegramId || null]
  )
  return result.rows[0]
}

// Patients
export async function getPatients() {
  const result = await pool.query('SELECT * FROM "Patient" ORDER BY name')
  return result.rows
}

export async function createPatient(data: { name: string; phone: string; birthDate?: Date }) {
  const result = await pool.query(
    `INSERT INTO "Patient" (name, phone, "birthDate", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING *`,
    [data.name, data.phone, data.birthDate || null]
  )
  return result.rows[0]
}

// Rooms
export async function getRooms() {
  const result = await pool.query('SELECT * FROM "Room" WHERE "isDeleted" = false ORDER BY name')
  return result.rows
}

export async function createRoom(data: { name: string; isAvailable?: boolean }) {
  const result = await pool.query(
    `INSERT INTO "Room" (name, "isAvailable", "isDeleted", "createdAt", "updatedAt")
     VALUES ($1, $2, false, NOW(), NOW())
     RETURNING *`,
    [data.name, data.isAvailable ?? true]
  )
  return result.rows[0]
}

// Appointments
export async function getAppointments(filters?: { date?: string; doctorId?: string }) {
  let query = `
    SELECT a.*, d.name as doctor_name, d.specialization as doctor_specialization,
           p.name as patient_name, p.phone as patient_phone,
           r.name as room_name
    FROM "Appointment" a
    JOIN "Doctor" d ON a."doctorId" = d.id
    JOIN "Patient" p ON a."patientId" = p.id
    JOIN "Room" r ON a."roomId" = r.id
  `
  
  const conditions: string[] = []
  const params: any[] = []
  
  if (filters?.date) {
    params.push(filters.date + ' 00:00:00', filters.date + ' 23:59:59')
    conditions.push(`a."appointmentDate" >= $${params.length - 1} AND a."appointmentDate" <= $${params.length}`)
  }
  
  if (filters?.doctorId) {
    params.push(filters.doctorId)
    conditions.push(`a."doctorId" = $${params.length}`)
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }
  
  query += ' ORDER BY a."appointmentDate", a."appointmentTime"'
  
  const result = await pool.query(query, params)
  return result.rows
}

export async function getAppointmentsByDateRange(startDate: string, endDate: string) {
  const query = `
    SELECT a.*, d.name as doctor_name, d.specialization as doctor_specialization,
           p.name as patient_name, p.phone as patient_phone,
           r.name as room_name
    FROM "Appointment" a
    JOIN "Doctor" d ON a."doctorId" = d.id
    JOIN "Patient" p ON a."patientId" = p.id
    JOIN "Room" r ON a."roomId" = r.id
    WHERE a."appointmentDate" >= $1 AND a."appointmentDate" <= $2
    ORDER BY a."appointmentDate", a."appointmentTime"
  `
  const result = await pool.query(query, [startDate + ' 00:00:00', endDate + ' 23:59:59'])
  return result.rows
}

export async function createAppointment(data: {
  doctorId: string
  patientId: string
  roomId: string
  appointmentDate: Date
  appointmentTime: Date
  durationMinutes?: number
  notes?: string
}) {
  const result = await pool.query(
    `INSERT INTO "Appointment" 
     ("doctorId", "patientId", "roomId", "appointmentDate", "appointmentTime", "durationMinutes", "notes", "status", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled', NOW(), NOW())
     RETURNING *`,
    [
      data.doctorId,
      data.patientId,
      data.roomId,
      data.appointmentDate,
      data.appointmentTime,
      data.durationMinutes || 60,
      data.notes || ''
    ]
  )
  return result.rows[0]
}

// Stats
export async function getStats() {
  try {
    const doctors = await pool.query('SELECT COUNT(*) as count FROM "Doctor" WHERE "isActive" = true')
    const patients = await pool.query('SELECT COUNT(*) as count FROM "Patient"')
    const rooms = await pool.query('SELECT COUNT(*) as count FROM "Room" WHERE "isAvailable" = true AND "isDeleted" = false')
    const appointments = await pool.query('SELECT COUNT(*) as count FROM "Appointment"')
    
    const today = new Date().toISOString().split('T')[0]
    const todayAppointments = await pool.query(
      `SELECT COUNT(*) as count FROM "Appointment" 
       WHERE "appointmentDate" >= $1 AND "appointmentDate" < $2`,
      [today + ' 00:00:00', today + ' 23:59:59']
    )
    
    return {
      doctorsCount: parseInt(doctors.rows[0].count),
      patientsCount: parseInt(patients.rows[0].count),
      roomsCount: parseInt(rooms.rows[0].count),
      appointmentsToday: parseInt(todayAppointments.rows[0].count),
      totalAppointments: parseInt(appointments.rows[0].count)
    }
  } catch (error) {
    // Tables might not exist yet
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
export async function createUser(data: { email: string; password: string; name?: string; role?: string }) {
  const result = await pool.query(
    `INSERT INTO "User" (email, password, name, role, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING *`,
    [data.email, data.password, data.name || null, data.role || 'user']
  )
  return result.rows[0]
}
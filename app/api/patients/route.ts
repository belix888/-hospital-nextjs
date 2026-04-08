import { getPatients, createPatient, initDatabase } from '@/lib/db'

export async function GET() {
  try {
    await initDatabase()
    const patients = await getPatients()
    return Response.json(patients)
  } catch (error: any) {
    console.error('Error fetching patients:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await initDatabase()
    const body = await request.json()
    const { name, phone, birthDate } = body

    if (!name || !phone) {
      return Response.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    const patient = await createPatient({ name, phone, birthDate: birthDate || undefined })
    return Response.json(patient)
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to create patient' }, { status: 500 })
  }
}
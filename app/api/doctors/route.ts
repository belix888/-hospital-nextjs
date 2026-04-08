import { getDoctors, createDoctor, initDatabase } from '@/lib/db'

export async function GET() {
  try {
    await initDatabase()
    const doctors = await getDoctors()
    return Response.json(doctors)
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return Response.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    await initDatabase()
    const body = await request.json()
    const { name, specialization, phone, email } = body

    if (!name || !specialization) {
      return Response.json({ error: 'Name and specialization are required' }, { status: 400 })
    }

    const doctor = await createDoctor({ name, specialization, phone, email })
    return Response.json(doctor)
  } catch (error) {
    return Response.json({ error: 'Failed to create doctor' }, { status: 500 })
  }
}
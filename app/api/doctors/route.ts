import { getDoctors, getAllDoctors, createDoctor, updateDoctor, deleteDoctor, initDatabase } from '@/lib/db'

export async function GET(request: Request) {
  try {
    await initDatabase()
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')
    
    const doctors = all === 'true' ? await getAllDoctors() : await getDoctors()
    return Response.json(doctors)
  } catch (error: any) {
    console.error('Error fetching doctors:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await initDatabase()
    const body = await request.json()
    const { id, name, specialization, phone, email, isActive } = body

    if (!id || !name || !specialization) {
      return Response.json({ error: 'ID, name and specialization are required' }, { status: 400 })
    }

    const doctor = await updateDoctor({ id, name, specialization, phone, email, isActive })
    return Response.json(doctor)
  } catch (error: any) {
    console.error('Error updating doctor:', error)
    return Response.json({ error: error.message || 'Failed to update doctor' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await initDatabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 })
    }

    await deleteDoctor(id)
    return Response.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting doctor:', error)
    return Response.json({ error: error.message || 'Failed to delete doctor' }, { status: 500 })
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
  } catch (error: any) {
    console.error('Error creating doctor:', error)
    return Response.json({ error: error.message || 'Failed to create doctor' }, { status: 500 })
  }
}
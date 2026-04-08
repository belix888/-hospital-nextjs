import { getRooms, createRoom, initDatabase } from '@/lib/db'

export async function GET() {
  try {
    await initDatabase()
    const rooms = await getRooms()
    return Response.json(rooms)
  } catch (error: any) {
    console.error('Error fetching rooms:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await initDatabase()
    const body = await request.json()
    const { name, isAvailable } = body

    if (!name) {
      return Response.json({ error: 'Name is required' }, { status: 400 })
    }

    const room = await createRoom({ name, isAvailable })
    return Response.json(room)
  } catch (error: any) {
    console.error('Error creating room:', error)
    return Response.json({ error: error.message || 'Failed to create room' }, { status: 500 })
  }
}
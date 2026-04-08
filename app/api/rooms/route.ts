import { getRooms, createRoom, updateRoom, deleteRoom, initDatabase } from '@/lib/db'

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

export async function PUT(request: Request) {
  try {
    await initDatabase()
    const body = await request.json()
    const { id, name, isAvailable } = body

    if (!id || !name) {
      return Response.json({ error: 'ID and name are required' }, { status: 400 })
    }

    const room = await updateRoom({ id, name, isAvailable })
    return Response.json(room)
  } catch (error: any) {
    console.error('Error updating room:', error)
    return Response.json({ error: error.message || 'Failed to update room' }, { status: 500 })
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

    await deleteRoom(id)
    return Response.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting room:', error)
    return Response.json({ error: error.message || 'Failed to delete room' }, { status: 500 })
  }
}
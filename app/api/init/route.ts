import { initDatabase } from '@/lib/db'

export async function POST() {
  try {
    const success = await initDatabase()
    if (success) {
      return Response.json({ message: 'Database initialized successfully!' })
    } else {
      return Response.json({ error: 'Failed to initialize database' }, { status: 500 })
    }
  } catch (error) {
    return Response.json({ error: 'Error: ' + error }, { status: 500 })
  }
}
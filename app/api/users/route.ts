import { createUser, updateUser, deleteUser, initDatabase, supabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await initDatabase()
    const { data, error } = await supabase
      .from('User')
      .select('id, email, name, role, createdAt')
      .order('createdAt', { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ошибка получения пользователей' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await initDatabase()
    const body = await request.json()
    const { email, password, name, role, doctorId } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 })
    }

    // Validate: if role is doctor, doctorId is required
    if (role === 'doctor' && !doctorId) {
      return NextResponse.json({ error: 'Для роли "Врач" необходимо выбрать профиль врача' }, { status: 400 })
    }

    const user = await createUser({ email, password, name, role, doctorId: doctorId || null })
    return NextResponse.json(user)
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Ошибка создания пользователя' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await initDatabase()
    const body = await request.json()
    const { id, email, name, role } = body

    if (!id || !email) {
      return NextResponse.json({ error: 'ID и email обязательны' }, { status: 400 })
    }

    const user = await updateUser({ id, email, name, role })
    return NextResponse.json(user)
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Ошибка обновления пользователя' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await initDatabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID обязателен' }, { status: 400 })
    }

    await deleteUser(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ошибка удаления пользователя' }, { status: 500 })
  }
}
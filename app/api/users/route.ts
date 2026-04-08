import { createUser, initDatabase } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    await initDatabase()
    const body = await request.json()
    const { email, password, name, role } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 })
    }

    const user = await createUser({ email, password, name, role })
    return NextResponse.json(user)
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Ошибка создания пользователя' }, { status: 500 })
  }
}
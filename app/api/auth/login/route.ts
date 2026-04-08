import { initDatabase, pool } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    await initDatabase()
    
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 })
    }

    // Check if user exists
    const result = await pool.query(
      'SELECT * FROM "User" WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
    }

    const user = result.rows[0]

    // Simple password check (in production use bcrypt)
    if (user.password !== password) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
    }

    // Return user info (in production use JWT)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Ошибка входа' }, { status: 500 })
  }
}
import { initDatabase, supabase } from '@/lib/db'
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
    const { data: users, error } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (error) throw error

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
    }

    const user = users[0]

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
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ error: error.message || 'Ошибка входа' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'NOT SET'
  const hasDbUrl = dbUrl.includes('supabase')
  
  return NextResponse.json({
    DATABASE_URL_SET: hasDbUrl,
    url: hasDbUrl ? 'postgres://***:***@db.***.supabase.co:5432/postgres' : dbUrl,
    nodeEnv: process.env.NODE_ENV
  })
}
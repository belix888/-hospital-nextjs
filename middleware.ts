import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require admin role
const adminRoutes = ['/admin']

// Routes that require authentication
const protectedRoutes = ['/admin']

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  
  const isAdminRoute = adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  
  if (!sessionCookie) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }
  
  try {
    const session = JSON.parse(sessionCookie.value)
    
    // Check if trying to access admin route without admin role
    if (isAdminRoute && session.role !== 'admin') {
      // If doctor, redirect to appointments
      if (session.role === 'doctor') {
        return NextResponse.redirect(new URL('/appointments/new', request.url))
      }
      // If regular user, redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    return NextResponse.next()
  } catch {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/admin/:path*']
}
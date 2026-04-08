import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require admin role
const adminRoutes = ['/admin']

// Routes that require doctor role
const doctorRoutes = ['/doctor']

// Routes that require authentication
const protectedRoutes = ['/admin', '/doctor']

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  
  const isAdminRoute = adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isDoctorRoute = doctorRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  
  if (!sessionCookie) {
    if (isAdminRoute || isDoctorRoute) {
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
    
    // Check if trying to access doctor route without doctor role
    if (isDoctorRoute && session.role !== 'doctor') {
      // If admin, redirect to admin
      if (session.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      // If regular user, redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    return NextResponse.next()
  } catch {
    if (isAdminRoute || isDoctorRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/admin/:path*', '/doctor']
}
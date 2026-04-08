'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
  doctorId?: string
  doctor?: {
    id: string
    name: string
    specialization: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: async () => {},
  checkAuth: async () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      // Add cache-busting to prevent stale data
      const res = await fetch('/api/auth/login?_=' + Date.now(), {
        cache: 'no-store'
      })
      const data = await res.json()
      
      if (data.authenticated && data.user) {
        setUser(data.user)
        // Also update localStorage as backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('hospital_user', JSON.stringify(data.user))
        }
      } else {
        setUser(null)
        // Clear localStorage on logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('hospital_user')
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Try to restore from localStorage as fallback
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('hospital_user')
        if (stored) {
          try {
            setUser(JSON.parse(stored))
          } catch {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        // Store in localStorage as backup
        if (typeof window !== 'undefined') {
          localStorage.setItem('hospital_user', JSON.stringify(data))
        }
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hospital_user')
      }
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    checkAuth()

    // Also check auth when window gains focus (e.g., switching tabs)
    const handleFocus = () => {
      checkAuth()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus)
      return () => window.removeEventListener('focus', handleFocus)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
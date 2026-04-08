'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'

interface AuthNavigationProps {
  mobile?: boolean
}

export default function AuthNavigation({ mobile = false }: AuthNavigationProps) {
  const { user, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  if (loading) {
    if (mobile) {
      return (
        <div className="animate-pulse bg-gray-200 rounded h-8 w-8"></div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-600 rounded h-8 w-20"></div>
      </div>
    )
  }

  if (!user) {
    if (mobile) {
      return (
        <Link 
          href="/login" 
          className="p-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
        >
          Вход
        </Link>
      )
    }
    return (
      <div className="flex items-center gap-3">
        <Link 
          href="/login" 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-base font-semibold hover:bg-indigo-700 shadow"
        >
          Вход
        </Link>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  if (mobile) {
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">{user.name || user.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.role === 'admin' ? 'Администратор' : user.role === 'doctor' ? 'Врач' : 'Пользователь'}
              </p>
            </div>
            <Link href="/doctor" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Кабинет врача
            </Link>
            <Link href="/schedule" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Календарь
            </Link>
            <Link href="/admin" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Админ-панель
            </Link>
            <button 
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    )
  }

  // Desktop version
  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-gray-600 dark:text-gray-300">
        <span className="font-medium">{user.name || user.email}</span>
        <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
          {user.role === 'admin' ? 'Админ' : user.role === 'doctor' ? 'Врач' : 'Пользователь'}
        </span>
      </div>
      <button 
        onClick={handleLogout}
        className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 text-sm font-medium"
      >
        Выйти
      </button>
    </div>
  )
}
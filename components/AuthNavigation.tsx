'use client'

import { useAuth } from '@/lib/auth'
import Link from 'next/link'

export default function AuthNavigation() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-pulse bg-gray-200 rounded h-8 w-20"></div>
      </div>
    )
  }

  if (!user) {
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

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-gray-600">
        <span className="font-medium">{user.name || user.email}</span>
        <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
          {user.role === 'admin' ? 'Админ' : user.role === 'doctor' ? 'Врач' : 'Пользователь'}
        </span>
      </div>
      <button 
        onClick={handleLogout}
        className="px-3 py-2 text-gray-600 hover:text-red-600 text-sm font-medium"
      >
        Выйти
      </button>
    </div>
  )
}
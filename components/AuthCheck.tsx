'use client'

import { useAuth } from '@/lib/auth'
import Link from 'next/link'

export function AuthCheck() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (user?.role === 'doctor' && user?.doctorId) {
    return (
      <div className="space-y-3">
        <Link
          href={`/appointments/new?doctorId=${user.doctorId}`}
          className="block w-full text-center px-6 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md"
        >
          ➕ Создать новую запись
        </Link>
        <Link
          href={`/schedule?doctorId=${user.doctorId}`}
          className="block w-full text-center px-6 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-md"
        >
          📅 Мое расписание
        </Link>
        <Link
          href="/doctors"
          className="block w-full text-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md"
        >
          👨‍⚕️ Список врачей
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="block w-full text-center px-6 py-4 bg-gray-300 text-gray-600 font-semibold rounded-lg cursor-not-allowed">
        ➕ Создать новую запись
      </div>
      <p className="text-xs text-gray-500 text-center">
        Только для врачей. <Link href="/login" className="text-blue-600 hover:underline">Войти</Link>
      </p>
      <Link
        href="/doctors"
        className="block w-full text-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md"
      >
        👨‍⚕️ Список врачей
      </Link>
      <Link
        href="/schedule"
        className="block w-full text-center px-6 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-md"
      >
        📅 Календарь записей
      </Link>
    </div>
  )
}
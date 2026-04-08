import Link from 'next/link'
import { getStats, initDatabase } from '@/lib/db'
import { AuthCheck } from '@/components/AuthCheck'
import { TodayAppointments } from '@/components/TodayAppointments'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Initialize database on first visit
  await initDatabase()

  let stats = {
    doctorsCount: 0,
    patientsCount: 0,
    appointmentsToday: 0,
    roomsCount: 0
  }

  try {
    stats = await getStats()
  } catch (e) {
    // Database not available during build
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Система управления больницей</h1>
        <p className="mt-2 text-gray-600">Добро пожаловать в систему управления записями больницы</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Активных врачей</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.doctorsCount}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Пациентов</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.patientsCount}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Записей сегодня</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.appointmentsToday}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Свободных кабинетов</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.roomsCount}</dd>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Быстрые действия</h3>
          <AuthCheck />
        </div>

        <TodayAppointments />
      </div>
    </div>
  )
}
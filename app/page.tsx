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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Система управления больницей</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Добро пожаловать в систему управления записями больницы</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Активных врачей</dt>
            <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">{stats.doctorsCount}</dd>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Пациентов</dt>
            <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">{stats.patientsCount}</dd>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Записей сегодня</dt>
            <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">{stats.appointmentsToday}</dd>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Свободных кабинетов</dt>
            <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">{stats.roomsCount}</dd>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Быстрые действия</h3>
          <AuthCheck />
        </div>

        <TodayAppointments />
      </div>
    </div>
  )
}
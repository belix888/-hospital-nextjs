import Link from 'next/link'
import { getStats, initDatabase } from '@/lib/db'

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
          <div className="space-y-3">
            <Link
              href="/appointments/new"
              className="block w-full text-center px-6 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md"
            >
              ➕ Создать новую запись
            </Link>
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
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Вход для врачей</h3>
          <p className="text-sm text-gray-600 mb-4">
            Войдите в систему для создания записей пациентов и просмотра расписания
          </p>
          <Link
            href="/login"
            className="block w-full text-center px-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md"
          >
            🔐 Вход для врачей
          </Link>
        </div>
      </div>
    </div>
  )
}
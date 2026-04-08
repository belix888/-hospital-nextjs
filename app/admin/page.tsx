import Link from 'next/link'
import { getStats } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const stats = await getStats()

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Админ-панель</h1>
        <Link href="/login" className="text-blue-600 hover:underline">
          Выход
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.doctorsCount}</div>
          <div className="text-sm text-gray-600">Врачей</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.patientsCount}</div>
          <div className="text-sm text-gray-600">Пациентов</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.totalAppointments}</div>
          <div className="text-sm text-gray-600">Всего записей</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.roomsCount}</div>
          <div className="text-sm text-gray-600">Кабинетов</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Управление</h2>
          <div className="space-y-3">
            <Link href="/admin/doctors" className="block py-3 px-4 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 border-2 border-blue-200">
              👨‍⚕️ Управление врачами
            </Link>
            <Link href="/admin/doctors/new" className="block py-3 px-4 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 border-2 border-green-200">
              ➕ Добавить врача
            </Link>
            <Link href="/admin/rooms" className="block py-3 px-4 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 border-2 border-blue-200">
              🚪 Управление кабинетами
            </Link>
            <Link href="/admin/rooms/new" className="block py-3 px-4 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 border-2 border-green-200">
              ➕ Добавить кабинет
            </Link>
            <Link href="/admin/users" className="block py-3 px-4 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 border-2 border-blue-200">
              👥 Управление пользователями
            </Link>
            <Link href="/admin/users/new" className="block py-3 px-4 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 border-2 border-green-200">
              ➕ Добавить пользователя
            </Link>
            <Link href="/admin/appointments" className="block py-3 px-4 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 border-2 border-blue-200">
              📅 Все записи
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Быстрые ссылки</h2>
          <div className="space-y-3">
            <Link href="/" className="block py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow">
              🏠 На главную
            </Link>
            <Link href="/schedule" className="block py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow">
              📅 Календарь записей
            </Link>
            <Link href="/doctors" className="block py-3 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow">
              👨‍⚕️ Список врачей
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
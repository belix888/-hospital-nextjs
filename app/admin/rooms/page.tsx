import Link from 'next/link'
import { getPatients, getRooms, initDatabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminRoomsPage() {
  try {
    await initDatabase()
  } catch (e) {}

  let rooms = []
  try {
    rooms = await getRooms()
  } catch (e) {}

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 hover:underline">
          ← Назад в админку
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Управление кабинетами</h1>
      
      {rooms.length === 0 ? (
        <p className="text-gray-500">Кабинеты не найдены</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Название</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Доступен</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rooms.map((room: any) => (
                <tr key={room.id}>
                  <td className="px-6 py-4">{room.name}</td>
                  <td className="px-6 py-4">{room.isAvailable ? 'Да' : 'Нет'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
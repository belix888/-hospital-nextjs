import Link from 'next/link'
import { getPatients, getRooms, initDatabase } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminPatientsPage() {
  try {
    await initDatabase()
  } catch (e) {}

  let patients = []
  try {
    patients = await getPatients()
  } catch (e) {}

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 hover:underline">
          ← Назад в админку
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Управление пациентами</h1>
      
      {patients.length === 0 ? (
        <p className="text-gray-500">Пациенты не найдены</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">ФИО</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Телефон</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map((pat: any) => (
                <tr key={pat.id}>
                  <td className="px-6 py-4">{pat.name}</td>
                  <td className="px-6 py-4">{pat.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
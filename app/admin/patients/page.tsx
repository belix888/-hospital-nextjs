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
        <Link href="/admin" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← Назад в админку
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Управление пациентами</h1>
      
      {patients.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Пациенты не найдены</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">ФИО</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Телефон</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {patients.map((pat: any) => (
                <tr key={pat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 sm:px-6 py-4 text-gray-900 dark:text-white">{pat.name}</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-300">{pat.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
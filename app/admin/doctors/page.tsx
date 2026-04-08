'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Doctor {
  id: string
  name: string
  specialization: string
  phone: string
  email: string
  isActive: boolean
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors?all=true')
      if (res.ok) {
        const data = await res.json()
        setDoctors(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого врача?')) return
    
    try {
      const res = await fetch(`/api/doctors?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchDoctors()
      } else {
        alert('Ошибка удаления врача')
      }
    } catch (e) {
      alert('Ошибка удаления врача')
    }
  }

  const handleSave = async () => {
    if (!editingDoctor) return

    try {
      const res = await fetch('/api/doctors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDoctor)
      })
      
      if (res.ok) {
        setShowModal(false)
        setEditingDoctor(null)
        fetchDoctors()
      } else {
        alert('Ошибка сохранения врача')
      }
    } catch (e) {
      alert('Ошибка сохранения врача')
    }
  }

  if (loading) {
    return <div className="p-6">Загрузка...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 hover:underline font-semibold">
          ← Назад в админку
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Управление врачами</h1>
        <Link 
          href="/admin/doctors/new" 
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md"
        >
          + Добавить врача
        </Link>
      </div>

      {doctors.length === 0 ? (
        <p className="text-gray-500 text-lg">Врачи не найдены</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ФИО</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Специализация</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Телефон</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {doctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{doc.name}</td>
                  <td className="px-6 py-4 text-gray-700">{doc.specialization}</td>
                  <td className="px-6 py-4 text-gray-700">{doc.phone || '-'}</td>
                  <td className="px-6 py-4 text-gray-700">{doc.email || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${doc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {doc.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => { setEditingDoctor(doc); setShowModal(true); }}
                      className="text-blue-600 hover:text-blue-800 font-semibold mr-4"
                    >
                      ✏️ Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      🗑️ Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editingDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Редактирование врача</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ФИО</label>
                <input
                  type="text"
                  value={editingDoctor.name}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Специализация</label>
                <input
                  type="text"
                  value={editingDoctor.specialization}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Телефон</label>
                <input
                  type="text"
                  value={editingDoctor.phone || ''}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingDoctor.email || ''}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingDoctor.isActive}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, isActive: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-semibold text-gray-700">
                  Активен
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              >
                💾 Сохранить
              </button>
              <button
                onClick={() => { setShowModal(false); setEditingDoctor(null); }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
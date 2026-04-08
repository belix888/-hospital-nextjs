'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Room {
  id: string
  name: string
  isAvailable: boolean
  isDeleted: boolean
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms')
      if (res.ok) {
        const data = await res.json()
        setRooms(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот кабинет?')) return
    
    try {
      const res = await fetch(`/api/rooms?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchRooms()
      } else {
        alert('Ошибка удаления кабинета')
      }
    } catch (e) {
      alert('Ошибка удаления кабинета')
    }
  }

  const handleSave = async () => {
    if (!editingRoom) return

    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRoom)
      })
      
      if (res.ok) {
        setShowModal(false)
        setEditingRoom(null)
        fetchRooms()
      } else {
        alert('Ошибка сохранения кабинета')
      }
    } catch (e) {
      alert('Ошибка сохранения кабинета')
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
        <h1 className="text-2xl font-bold text-gray-900">Управление кабинетами</h1>
        <Link 
          href="/admin/rooms/new" 
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md"
        >
          + Добавить кабинет
        </Link>
      </div>

      {rooms.length === 0 ? (
        <p className="text-gray-500 text-lg">Кабинеты не найдены</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Название</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Доступен</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{room.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {room.isAvailable ? 'Доступен' : 'Недоступен'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${!room.isDeleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {!room.isDeleted ? 'Активен' : 'Удалён'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => { setEditingRoom(room); setShowModal(true); }}
                      className="text-blue-600 hover:text-blue-800 font-semibold mr-4"
                    >
                      ✏️ Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
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
      {showModal && editingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Редактирование кабинета</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Название</label>
                <input
                  type="text"
                  value={editingRoom.name}
                  onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={editingRoom.isAvailable}
                  onChange={(e) => setEditingRoom({ ...editingRoom, isAvailable: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="isAvailable" className="ml-2 text-sm font-semibold text-gray-700">
                  Доступен для записи
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
                onClick={() => { setShowModal(false); setEditingRoom(null); }}
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
'use client'

import { useState } from 'react'

export default function NewRoomPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    isAvailable: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        alert('Кабинет успешно создан!')
        setFormData({ name: '', isAvailable: true })
      } else {
        const data = await res.json()
        alert(data.error || 'Ошибка при создании кабинета')
      }
    } catch (err) {
      alert('Ошибка при создании кабинета')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Добавить кабинет</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Название кабинета</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Кабинет 1"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">Доступен для записи</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Создание...' : 'Создать кабинет'}
        </button>
      </form>
    </div>
  )
}
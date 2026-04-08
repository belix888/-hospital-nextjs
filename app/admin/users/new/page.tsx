'use client'

import { useState } from 'react'

export default function NewUserPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        alert('Пользователь успешно создан!')
        setFormData({ name: '', email: '', password: '', role: 'user' })
      } else {
        const data = await res.json()
        alert(data.error || 'Ошибка при создании пользователя')
      }
    } catch (err) {
      alert('Ошибка при создании пользователя')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Добавить пользователя</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Роль</label>
          <select
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="user">Пользователь</option>
            <option value="admin">Администратор</option>
            <option value="doctor">Врач</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Создание...' : 'Создать пользователя'}
        </button>
      </form>
    </div>
  )
}
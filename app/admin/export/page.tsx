'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminExportPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert('Пожалуйста, выберите даты')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/appointments/export?startDate=${startDate}&endDate=${endDate}`)
      
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Ошибка экспорта')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `appointments_${startDate}_${endDate}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error: any) {
      alert('Ошибка экспорта: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Quick date selection presets
  const setThisMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    setStartDate(start)
    setEndDate(end)
  }

  const setLastMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
    const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
    setStartDate(start)
    setEndDate(end)
  }

  const setThisYear = () => {
    const now = new Date()
    const start = `${now.getFullYear()}-01-01`
    const end = `${now.getFullYear()}-12-31`
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 hover:underline font-semibold">
          ← Назад в админку
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Экспорт записей</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600 mb-6">
          Выберите период для экспорта всех записей в файл Excel (CSV)
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Дата начала</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Дата окончания</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={setThisMonth}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Этот месяц
            </button>
            <button
              onClick={setLastMonth}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Прошлый месяц
            </button>
            <button
              onClick={setThisYear}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Этот год
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={loading || !startDate || !endDate}
            className="w-full px-6 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Экспорт...' : '📥 Скачать Excel (CSV)'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Информация:</strong> Файл будет содержать следующие данные: дата, время, врач, специализация, пациент, телефон, кабинет, статус, заметки.
          </p>
        </div>
      </div>
    </div>
  )
}
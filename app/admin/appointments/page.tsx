'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Appointment {
  id: string
  doctor_name: string
  doctor_specialization: string
  patient_name: string
  patient_phone: string
  room_name: string
  appointmentDate: string
  appointmentTime: string
  status: string
  notes: string
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('ru')
    } catch {
      return dateStr
    }
  }

  const formatTime = (timeStr: string | null | undefined) => {
    if (!timeStr) return ''
    try {
      return new Date(timeStr).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeStr
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments')
      if (res.ok) {
        const data = await res.json()
        setAppointments(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = filter 
    ? appointments.filter(a => a.appointmentDate && a.appointmentDate.startsWith(filter))
    : appointments

  if (loading) {
    return <div className="p-6">Загрузка...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← Назад в админку
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Все записи</h1>
        <input 
          type="month" 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {filteredAppointments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Записи не найдены</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Дата</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Время</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Врач</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Пациент</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Кабинет</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 sm:px-6 py-4 text-gray-900 dark:text-white">{formatDate(apt.appointmentDate)}</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-300">
                    {formatTime(apt.appointmentTime)}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{apt.doctor_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{apt.doctor_specialization}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{apt.patient_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{apt.patient_phone}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-gray-700 dark:text-gray-300">{apt.room_name}</td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      apt.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                      apt.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      apt.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {apt.status === 'scheduled' ? 'Запланировано' : 
                       apt.status === 'completed' ? 'Завершено' : 
                       apt.status === 'cancelled' ? 'Отменено' : apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
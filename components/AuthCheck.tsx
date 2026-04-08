'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'

interface AppointmentInfo {
  id: string
  doctor_name: string
  doctor_specialization: string
  room_name: string
  appointmentTime: string
  endTime: string
}

export function AuthCheck() {
  const { user, loading } = useAuth()
  const [todayAppointments, setTodayAppointments] = useState<AppointmentInfo[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)

  useEffect(() => {
    if (user?.role === 'doctor' && user?.doctorId) {
      // Doctor sees their own appointments
      setAppointmentsLoading(true)
      const today = new Date().toISOString().split('T')[0]
      fetch(`/api/appointments?date=${today}&doctorId=${user.doctorId}`)
        .then(r => r.json())
        .then(data => {
          setTodayAppointments(data.slice(0, 5)) // Show up to 5
          setAppointmentsLoading(false)
        })
        .catch(() => setAppointmentsLoading(false))
    } else if (user?.role === 'admin') {
      // Admin sees all appointments
      setAppointmentsLoading(true)
      const today = new Date().toISOString().split('T')[0]
      fetch(`/api/appointments?date=${today}`)
        .then(r => r.json())
        .then(data => {
          setTodayAppointments(data.slice(0, 5)) // Show up to 5
          setAppointmentsLoading(false)
        })
        .catch(() => setAppointmentsLoading(false))
    }
  }, [user])

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (user?.role === 'doctor' && user?.doctorId) {
    return (
      <div className="space-y-3">
        <Link
          href={`/appointments/new?doctorId=${user.doctorId}`}
          className="block w-full text-center px-6 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md"
        >
          ➕ Создать новую запись
        </Link>
        <Link
          href={`/schedule?doctorId=${user.doctorId}`}
          className="block w-full text-center px-6 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-md"
        >
          📅 Мое расписание
        </Link>
        <Link
          href="/doctors"
          className="block w-full text-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md"
        >
          👨‍⚕️ Список врачей
        </Link>
      </div>
    )
  }

  // Show today's appointments for logged in users
  if (user && (user.role === 'admin' || user.role === 'doctor')) {
    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 border-b pb-2">Сегодня в больнице:</h4>
        
        {appointmentsLoading ? (
          <p className="text-gray-500 text-sm">Загрузка...</p>
        ) : todayAppointments.length > 0 ? (
          <div className="space-y-2">
            {todayAppointments.map(apt => (
              <div key={apt.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <div className="font-semibold text-gray-800">
                  {apt.doctor_name} ({apt.doctor_specialization})
                </div>
                <div className="text-gray-600">
                  📍 {apt.room_name} • 🕐 {apt.appointmentTime} - {apt.endTime}
                </div>
              </div>
            ))}
            {todayAppointments.length >= 5 && (
              <Link href="/schedule" className="block text-center text-sm text-blue-600 hover:underline">
                Показать все записи →
              </Link>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">На сегодня записей нет</p>
        )}
        
        <Link
          href="/schedule"
          className="block w-full text-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-md"
        >
          📅 Календарь записей
        </Link>
      </div>
    )
  }

  // Guest view
  return (
    <div className="space-y-3">
      <div className="block w-full text-center px-6 py-4 bg-gray-300 text-gray-600 font-semibold rounded-lg cursor-not-allowed">
        ➕ Создать новую запись
      </div>
      <p className="text-xs text-gray-500 text-center">
        Только для врачей. <Link href="/login" className="text-blue-600 hover:underline">Войти</Link>
      </p>
      <Link
        href="/doctors"
        className="block w-full text-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md"
      >
        👨‍⚕️ Список врачей
      </Link>
      <Link
        href="/schedule"
        className="block w-full text-center px-6 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-md"
      >
        📅 Календарь записей
      </Link>
    </div>
  )
}
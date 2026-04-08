'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

interface AppointmentInfo {
  id: string
  doctor_name: string
  doctor_specialization: string
  room_name: string
  appointmentTime: string
  endTime: string
  durationMinutes?: number
}

export function TodayAppointments() {
  const { user, loading } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentInfo[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [currentDate, setCurrentDate] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('date') || new Date().toISOString().split('T')[0]
    }
    return new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (!loading && user) {
      setLoadingData(true)
      const url = user.role === 'doctor' && user.doctorId 
        ? `/api/appointments?date=${currentDate}&doctorId=${user.doctorId}`
        : `/api/appointments?date=${currentDate}`
      
      fetch(url, { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          setAppointments(data.slice(0, 5))
          setLoadingData(false)
        })
        .catch(() => setLoadingData(false))
    }
  }, [user, loading, currentDate])

  const formatTime = (timeStr: string) => {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  // Show only for logged in users (doctors and admins)
  if (loading || !user) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Вход для врачей</h3>
        <p className="text-sm text-gray-600 mb-4">
          Войдите в систему для создания записей пациентов и просмотра расписания
        </p>
        <Link
          href="/login"
          className="block w-full text-center px-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md"
        >
          🔐 Вход для врачей
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">📅 Записи на сегодня</h3>
      
      {loadingData ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map(apt => (
            <div key={apt.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="font-semibold text-gray-800">
                👨‍⚕️ {apt.doctor_name}
                <span className="text-gray-500 text-sm ml-1">({apt.doctor_specialization})</span>
              </div>
              <div className="text-gray-600 text-sm mt-1">
                📍 <span className="font-medium">{apt.room_name}</span>
                {' ' }•{' '}
                🕐 {apt.appointmentTime && formatTime(apt.appointmentTime)}
                {apt.endTime && <> - {formatTime(apt.endTime)}</>}
              </div>
            </div>
          ))}
          {appointments.length >= 5 && (
            <Link href="/schedule" className="block text-center text-sm text-blue-600 hover:underline">
              Показать все записи →
            </Link>
          )}
        </div>
      ) : (
        <p className="text-gray-500">На сегодня записей нет</p>
      )}
      
      <Link
        href="/schedule"
        className="block w-full text-center px-4 py-2 mt-4 border border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50"
      >
        Открыть календарь
      </Link>
    </div>
  )
}
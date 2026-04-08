'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'

interface Appointment {
  id: string
  appointmentDate: string
  appointmentTime: string
  endTime?: string
  durationMinutes: number
  status: string
  notes: string
  doctor_name: string
  doctor_specialization: string
  patient_name: string
  patient_phone: string
  room_name: string
}

function DoctorCabinet() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [extendMinutes, setExtendMinutes] = useState(30)

  // Check if user is authorized (must be logged in as doctor)
  const isAuthorized = user?.role === 'doctor' && user?.doctorId

  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      router.push('/login?redirect=/doctor')
    }
  }, [authLoading, isAuthorized, router])

  // Fetch appointments
  useEffect(() => {
    if (isAuthorized) {
      fetchAppointments()
    }
  }, [selectedDate, isAuthorized])

  const fetchAppointments = async () => {
    if (!user?.doctorId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/appointments?date=${selectedDate}&doctorId=${user.doctorId}`)
      const data = await res.json()
      setAppointments(data)
    } catch (err) {
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExtend = async () => {
    if (!selectedAppointment) return
    
    try {
      const res = await fetch('/api/appointments/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: selectedAppointment.id,
          action: 'extend', 
          durationMinutes: extendMinutes 
        })
      })

      if (res.ok) {
        alert('Запись продлена!')
        setShowExtendModal(false)
        fetchAppointments()
      } else {
        const data = await res.json()
        alert(data.error || 'Ошибка при продлении')
      }
    } catch (err) {
      alert('Ошибка при продлении')
    }
  }

  const handleComplete = async (appointment: Appointment) => {
    if (!confirm('Завершить прием пациента?')) return
    
    try {
      const res = await fetch('/api/appointments/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: appointment.id,
          action: 'complete' 
        })
      })

      if (res.ok) {
        alert('Прием завершен!')
        fetchAppointments()
      } else {
        const data = await res.json()
        alert(data.error || 'Ошибка')
      }
    } catch (err) {
      alert('Ошибка')
    }
  }

  const handleCancel = async (appointment: Appointment) => {
    if (!confirm('Отменить запись?')) return
    
    try {
      const res = await fetch('/api/appointments/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: appointment.id,
          action: 'cancel' 
        })
      })

      if (res.ok) {
        alert('Запись отменена!')
        fetchAppointments()
      } else {
        const data = await res.json()
        alert(data.error || 'Ошибка')
      }
    } catch (err) {
      alert('Ошибка')
    }
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const getEndTime = (apt: Appointment) => {
    const start = new Date(apt.appointmentTime)
    const duration = apt.durationMinutes || 60
    const end = new Date(start.getTime() + duration * 60000)
    return end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  // Sync date with URL parameter from schedule
  useEffect(() => {
    const dateParam = searchParams.get('date')
    if (dateParam) {
      setSelectedDate(dateParam)
    }
  }, [searchParams])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center">
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  const activeAppointments = appointments.filter(a => a.status === 'scheduled')
  const completedAppointments = appointments.filter(a => a.status === 'completed')

  return (
    <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Личный кабинет врача</h1>
        <div className="text-sm text-gray-600">
          Врач: <span className="font-semibold">{user?.name || user?.doctor?.name}</span>
        </div>
      </div>

      {/* Date selector */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-gray-700 font-medium">Дата:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Active appointments */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Текущие записи</h2>
        
        {loading ? (
          <p className="text-gray-500">Загрузка...</p>
        ) : activeAppointments.length === 0 ? (
          <p className="text-gray-500">Нет активных записей на этот день</p>
        ) : (
          <div className="space-y-4">
            {activeAppointments.map(apt => (
              <div key={apt.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-lg font-bold text-blue-700">
                      {formatTime(apt.appointmentTime)} - {getEndTime(apt)}
                    </span>
                    <span className="ml-2 text-gray-500 text-sm">({apt.durationMinutes} мин)</span>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                    Запланировано
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Пациент:</span>
                    <span className="font-medium ml-1">{apt.patient_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Телефон:</span>
                    <span className="font-medium ml-1">{apt.patient_phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Кабинет:</span>
                    <span className="font-medium ml-1">{apt.room_name}</span>
                  </div>
                  {apt.notes && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Заметки:</span>
                      <span className="ml-1">{apt.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedAppointment(apt)
                      setShowExtendModal(true)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    ⏱ Продлить
                  </button>
                  <button
                    onClick={() => handleComplete(apt)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    ✅ Завершить
                  </button>
                  <button
                    onClick={() => handleCancel(apt)}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                  >
                    ❌ Отменить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed appointments */}
      {completedAppointments.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Завершенные приёмы</h2>
          <div className="space-y-3">
            {completedAppointments.map(apt => (
              <div key={apt.id} className="border border-gray-200 bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{formatTime(apt.appointmentTime)}</span>
                    <span className="ml-3 text-gray-600">{apt.patient_name}</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                    Завершено
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extend Modal */}
      {showExtendModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Продлить запись</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Добавить время:
              </label>
              <select
                value={extendMinutes}
                onChange={e => setExtendMinutes(parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value={15}>15 минут</option>
                <option value={30}>30 минут</option>
                <option value={45}>45 минут</option>
                <option value={60}>1 час</option>
                <option value={90}>1.5 часа</option>
                <option value={120}>2 часа</option>
              </select>
            </div>

            <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-sm">
              <p className="font-medium">Текущее время приёма:</p>
              <p>
                {formatTime(selectedAppointment.appointmentTime)} - {getEndTime(selectedAppointment)}
                {' '}({selectedAppointment.durationMinutes} мин)
              </p>
              <p className="mt-1 font-medium">Новое время приёма:</p>
              <p>
                {formatTime(selectedAppointment.appointmentTime)} - {
                  (() => {
                    const start = new Date(selectedAppointment.appointmentTime)
                    const end = new Date(start.getTime() + (selectedAppointment.durationMinutes + extendMinutes) * 60000)
                    return end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                  })()
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExtend}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Продлить
              </button>
              <button
                onClick={() => setShowExtendModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
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

function Loading() {
  return (
    <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default function DoctorPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DoctorCabinet />
    </Suspense>
  )
}
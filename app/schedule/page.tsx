'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Appointment {
  id: string
  appointmentDate: string
  appointmentTime: string
  endTime?: string
  status: string
  doctor_name: string
  doctor_specialization: string
  patient_name: string
  patient_phone: string
  room_name: string
}

interface DayInfo {
  date: string
  isCurrentMonth: boolean
  isToday: boolean
  hasAppointments: boolean
  appointmentCount: number
  appointments: Appointment[]
}

export default function SchedulePage() {
  const { user, loading: authLoading } = useAuth()
  const [currentDate, setCurrentDate] = useState(() => {
    if (typeof window !== 'undefined') {
      return new Date()
    }
    return new Date(2024, 0, 1) // Default for SSR
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if user can create appointments (must be logged in as doctor)
  const canCreateAppointments = user?.role === 'doctor' && user?.doctorId

  useEffect(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    
    const start = startOfMonth.toISOString().split('T')[0]
    const end = endOfMonth.toISOString().split('T')[0]
    
    console.log('Fetching appointments for', start, 'to', end)
    
    fetch(`/api/appointments?startDate=${start}&endDate=${end}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        console.log('Got appointments:', data)
        setAppointments(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [currentDate])

  const getDaysInMonth = (date: Date): DayInfo[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const today = new Date().toISOString().split('T')[0]
    
    const days: DayInfo[] = []
    
    // Days from previous month
    const firstDayOfWeek = firstDay.getDay() || 7
    for (let i = firstDayOfWeek - 1; i > 0; i--) {
      const d = new Date(year, month, 1 - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayAppointments = appointments.filter(a => 
        a.appointmentDate.startsWith(dateStr)
      )
      days.push({
        date: dateStr,
        isCurrentMonth: false,
        isToday: dateStr === today,
        hasAppointments: dayAppointments.length > 0,
        appointmentCount: dayAppointments.length,
        appointments: dayAppointments
      })
    }
    
    // Days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i)
      const dateStr = d.toISOString().split('T')[0]
      const dayAppointments = appointments.filter(a => 
        a.appointmentDate.startsWith(dateStr)
      )
      days.push({
        date: dateStr,
        isCurrentMonth: true,
        isToday: dateStr === today,
        hasAppointments: dayAppointments.length > 0,
        appointmentCount: dayAppointments.length,
        appointments: dayAppointments
      })
    }
    
    // Days from next month
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i)
      const dateStr = d.toISOString().split('T')[0]
      const dayAppointments = appointments.filter(a => 
        a.appointmentDate.startsWith(dateStr)
      )
      days.push({
        date: dateStr,
        isCurrentMonth: false,
        isToday: dateStr === today,
        hasAppointments: dayAppointments.length > 0,
        appointmentCount: dayAppointments.length,
        appointments: dayAppointments
      })
    }
    
    return days
  }

  const formatTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return ''
    // Если строка содержит только время (HH:MM), выводим как есть
    if (dateStr.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
      return dateStr.substring(0, 5)
    }
    // Если это ISO строка с датой и временем (содержит 'T'), извлекаем время напрямую
    if (dateStr.includes('T')) {
      const timePart = dateStr.split('T')[1]
      if (timePart) {
        // timePart имеет формат HH:MM:SS.mmmZ или HH:MM:SSZ
        return timePart.substring(0, 5)
      }
    }
    // Иначе пробуем парсить как дату
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateStr
    }
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDayClick = (day: DayInfo) => {
    if (day.hasAppointments) {
      setSelectedDay(day)
      setShowModal(true)
    }
  }

  const days = getDaysInMonth(currentDate)

  // Prevent hydration mismatch - show loading until mounted
  if (!mounted) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(42)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Календарь записей</h1>
        {canCreateAppointments && user?.doctorId ? (
          <Link
            href={`/appointments/new?doctorId=${user.doctorId}`}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md"
          >
            + Новая запись
          </Link>
        ) : authLoading ? null : (
          <div className="text-sm text-gray-500">
            <Link href="/login" className="text-blue-600 hover:underline">
              Войдите как врач
            </Link>
            {' '} для создания записей
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 sm:mb-6">
          <button
            onClick={prevMonth}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow text-sm"
          >
            ← Пред
          </button>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={nextMonth}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow text-sm"
          >
            След →
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs sm:text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">Загрузка календаря...</div>
        ) : (
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDayClick(day)}
                disabled={!day.hasAppointments}
                className={`
                  min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 rounded-lg border-2 transition-all text-xs
                  ${day.isCurrentMonth ? '' : 'opacity-40'}
                  ${day.isToday ? 'ring-2 sm:ring-4 ring-blue-400' : ''}
                  ${day.hasAppointments 
                    ? 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 hover:bg-red-200 cursor-pointer' 
                    : 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 hover:bg-green-200 cursor-default'}
                `}
              >
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {new Date(day.date).getDate()}
                </div>
                {day.hasAppointments && (
                  <div className="text-xs text-red-700 dark:text-red-400 font-semibold mt-0.5 sm:mt-1">
                    {day.appointmentCount}
                  </div>
                )}
                {!day.hasAppointments && day.isCurrentMonth && (
                  <div className="text-xs text-green-700 dark:text-green-400 font-semibold mt-0.5 sm:mt-1">
                    Свободно
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 flex gap-4 sm:gap-6 justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 dark:bg-green-900 border-2 border-green-300 dark:border-green-700 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Свободный</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-100 dark:bg-red-900 border-2 border-red-300 dark:border-red-700 rounded"></div>
          <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Есть записи</span>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Записи на {formatDate(selectedDay.date)}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedDay.appointments.map(apt => (
                  <div key={apt.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                      <div>
                        <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                          {formatTime(apt.appointmentTime)}
                        </span>
                        {apt.endTime && (
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                             - {formatTime(apt.endTime)}
                          </span>
                        )}
                      </div>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        apt.status === 'scheduled' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                        apt.status === 'completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                        'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {apt.status === 'scheduled' ? 'Запланировано' : 
                         apt.status === 'completed' ? 'Завершено' : 'Отменено'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Врач:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 ml-1">{apt.doctor_name}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">({apt.doctor_specialization})</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Кабинет:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 ml-1">{apt.room_name}</span>
                      </div>
                      {user ? (
                        <div className="col-span-1 sm:col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">Пациент:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200 ml-1">{apt.patient_name}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">{apt.patient_phone}</span>
                        </div>
                      ) : (
                        <div className="col-span-1 sm:col-span-2 text-gray-400 dark:text-gray-500 text-sm italic">
                          Войдите для просмотра деталей пациента
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
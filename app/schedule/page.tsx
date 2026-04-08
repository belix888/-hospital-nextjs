'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

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
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Check if user can create appointments (must be logged in as doctor)
  const canCreateAppointments = user?.role === 'doctor' && user?.doctorId

  useEffect(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    
    const start = startOfMonth.toISOString().split('T')[0]
    const end = endOfMonth.toISOString().split('T')[0]
    
    fetch(`/api/appointments?startDate=${start}&endDate=${end}`)
      .then(res => res.json())
      .then(data => {
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

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
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

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Календарь записей</h1>
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

      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevMonth}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow"
          >
            ← Предыдущий
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow"
          >
            Следующий →
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2 bg-gray-100 rounded-lg">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="text-center py-12">Загрузка календаря...</div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDayClick(day)}
                disabled={!day.hasAppointments}
                className={`
                  min-h-[80px] p-2 rounded-lg border-2 transition-all
                  ${day.isCurrentMonth ? '' : 'opacity-40'}
                  ${day.isToday ? 'ring-4 ring-blue-400' : ''}
                  ${day.hasAppointments 
                    ? 'bg-red-100 border-red-300 hover:bg-red-200 cursor-pointer' 
                    : 'bg-green-100 border-green-300 hover:bg-green-200 cursor-default'}
                `}
              >
                <div className="text-sm font-bold text-gray-800">
                  {new Date(day.date).getDate()}
                </div>
                {day.hasAppointments && (
                  <div className="text-xs text-red-700 font-semibold mt-1">
                    {day.appointmentCount} запись{day.appointmentCount > 1 ? 'ей' : ''}
                  </div>
                )}
                {!day.hasAppointments && day.isCurrentMonth && (
                  <div className="text-xs text-green-700 font-semibold mt-1">
                    Свободно
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex gap-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
          <span className="text-gray-700 font-medium">Свободный день</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded"></div>
          <span className="text-gray-700 font-medium">Есть записи (нажмите для деталей)</span>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Записи на {formatDate(selectedDay.date)}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedDay.appointments.map(apt => (
                  <div key={apt.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-lg font-bold text-blue-700">
                          {formatTime(apt.appointmentTime)}
                        </span>
                        {apt.endTime && (
                          <span className="text-gray-500 ml-2">
                             - {formatTime(apt.endTime)}
                          </span>
                        )}
                      </div>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        apt.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {apt.status === 'scheduled' ? 'Запланировано' : 
                         apt.status === 'completed' ? 'Завершено' : 'Отменено'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Врач:</span>
                        <span className="font-semibold text-gray-800 ml-1">{apt.doctor_name}</span>
                        <span className="text-gray-500 text-xs ml-1">({apt.doctor_specialization})</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Кабинет:</span>
                        <span className="font-semibold text-gray-800 ml-1">{apt.room_name}</span>
                      </div>
                      {user ? (
                        <div className="col-span-2">
                          <span className="text-gray-500">Пациент:</span>
                          <span className="font-semibold text-gray-800 ml-1">{apt.patient_name}</span>
                          <span className="text-gray-500 text-xs ml-1">{apt.patient_phone}</span>
                        </div>
                      ) : (
                        <div className="col-span-2 text-gray-400 text-sm italic">
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
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'

interface Doctor {
  id: string
  name: string
  specialization: string
}

interface Patient {
  id: string
  name: string
  phone: string
}

interface Room {
  id: string
  name: string
  isAvailable: boolean
}

function NewAppointmentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  
  // Get doctorId from URL query parameter (passed after login)
  const presetDoctorId = searchParams.get('doctorId')
  
  // Check if user is authorized (must be logged in as doctor)
  const isAuthorized = user?.role === 'doctor' && user?.doctorId
  
  // Redirect if not authorized (but wait for auth to load)
  useEffect(() => {
    if (!authLoading && !isAuthorized) {
      router.push('/login?redirect=/appointments/new')
    }
  }, [authLoading, isAuthorized, router])

  if (authLoading || !isAuthorized) {
    return (
      <div className="px-4 py-6 sm:px-0 max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center">
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    )
  }
  
  const [formData, setFormData] = useState({
    doctorId: presetDoctorId || '',
    patientId: '',
    roomId: '',
    date: '',
    time: '',
    durationMinutes: 60,
    notes: ''
  })
  const [newPatient, setNewPatient] = useState({ name: '', phone: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/doctors').then(r => r.json()),
      fetch('/api/patients').then(r => r.json()),
      fetch('/api/rooms').then(r => r.json())
    ]).then(([d, p, r]) => {
      setDoctors(d)
      setPatients(p)
      setRooms(r.filter((room: Room) => room.isAvailable))
    })
  }, [])

  // Update doctorId when presetDoctorId changes (after login redirect)
  useEffect(() => {
    if (presetDoctorId && !formData.doctorId) {
      setFormData(prev => ({ ...prev, doctorId: presetDoctorId }))
    }
  }, [presetDoctorId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let finalPatientId = formData.patientId

    // If no patient selected but new patient data provided, create new patient
    if (!finalPatientId && newPatient.name && newPatient.phone) {
      try {
        const res = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPatient)
        })
        
        if (res.ok) {
          const patient = await res.json()
          finalPatientId = patient.id
          // Add to local list
          setPatients([...patients, patient])
        } else {
          alert('Ошибка при создании пациента')
          setLoading(false)
          return
        }
      } catch (err) {
        alert('Ошибка при создании пациента')
        setLoading(false)
        return
      }
    }

    if (!finalPatientId) {
      alert('Выберите пациента или введите данные нового пациента')
      setLoading(false)
      return
    }

    // Validate doctor selection
    const doctorId = presetDoctorId || formData.doctorId
    if (!doctorId) {
      alert('Выберите врача')
      setLoading(false)
      return
    }

    try {
      // Determine doctor ID - use preset (from login) or form selection
      const doctorId = presetDoctorId || formData.doctorId
      
      // Send just date and time - let API handle the format
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctorId,
          patientId: finalPatientId,
          roomId: formData.roomId,
          appointmentDate: formData.date,
          appointmentTime: formData.time,
          durationMinutes: formData.durationMinutes,
          notes: formData.notes
        })
      })

      if (res.ok) {
        router.push('/schedule')
      } else {
        const data = await res.json()
        alert(data.error || 'Ошибка при создании записи')
      }
    } catch (err) {
      alert('Ошибка при создании записи')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePatient = async () => {
    if (!newPatient.name || !newPatient.phone) {
      alert('Введите имя и телефон пациента')
      return
    }

    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPatient)
    })

    if (res.ok) {
      const patient = await res.json()
      setPatients([...patients, patient])
      setFormData({ ...formData, patientId: patient.id })
      setNewPatient({ name: '', phone: '' })
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Создание новой записи</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 space-y-6">
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">Врач</label>
          {presetDoctorId ? (
            // If doctor is preset (logged in doctor), show info instead of dropdown
            <div className="w-full px-4 py-3 border-2 border-green-200 bg-green-50 rounded-lg text-lg text-green-800">
              Вы: {doctors.find(d => d.id === presetDoctorId)?.name || 'Врач'} ({doctors.find(d => d.id === presetDoctorId)?.specialization || ''})
              <input type="hidden" value={presetDoctorId} />
            </div>
          ) : (
            <select
              required
              value={formData.doctorId}
              onChange={e => setFormData({ ...formData, doctorId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">Выберите врача</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">Пациент</label>
          
          {/* Always show option to select existing patient if available */}
          {patients.length > 0 && (
            <div className="mb-3">
              <select
                value={formData.patientId}
                onChange={e => {
                  setFormData({ ...formData, patientId: e.target.value })
                  if (e.target.value) setNewPatient({ name: '', phone: '' })
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Выберите пациента</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Always show option to create new patient */}
          <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">Или создайте нового пациента:</p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="ФИО пациента"
                value={newPatient.name}
                onChange={e => {
                  setNewPatient({ ...newPatient, name: e.target.value })
                  setFormData({ ...formData, patientId: '' }) // Clear selected patient
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
              />
              <input
                type="tel"
                placeholder="Телефон"
                value={newPatient.phone}
                onChange={e => {
                  setNewPatient({ ...newPatient, phone: e.target.value })
                  setFormData({ ...formData, patientId: '' }) // Clear selected patient
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">Кабинет</label>
          <select
            required
            value={formData.roomId}
            onChange={e => setFormData({ ...formData, roomId: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="">Выберите кабинет</option>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Дата</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Время</label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">Длительность (минут)</label>
          <select
            value={formData.durationMinutes}
            onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
          >
            <option value={30}>30 минут</option>
            <option value={60}>60 минут</option>
            <option value={90}>90 минут</option>
            <option value={120}>120 минут</option>
          </select>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">Заметки</label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-4 bg-green-600 text-white font-semibold text-lg rounded-lg hover:bg-green-700 shadow-md disabled:opacity-50"
          >
            {loading ? 'Создание...' : '✅ Создать запись'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold text-lg rounded-lg hover:bg-gray-100"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="px-4 py-6 sm:px-0 max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <NewAppointmentForm />
    </Suspense>
  )
}
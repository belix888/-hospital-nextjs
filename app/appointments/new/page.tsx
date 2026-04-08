'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

export default function NewAppointmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [formData, setFormData] = useState({
    doctorId: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let finalPatientId = formData.patientId

    // If no patients exist, create a new one first
    if (patients.length === 0 && newPatient.name && newPatient.phone) {
      try {
        const res = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPatient)
        })
        
        if (res.ok) {
          const patient = await res.json()
          finalPatientId = patient.id
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

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: formData.doctorId,
          patientId: finalPatientId,
          roomId: formData.roomId,
          appointmentDate: formData.date,
          appointmentTime: `${formData.date}T${formData.time}:00`,
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
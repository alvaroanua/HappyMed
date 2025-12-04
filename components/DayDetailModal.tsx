'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './DayDetailModal.module.css'

interface Medication {
  id: string
  name: string
  medication: string
  time_to_call: string
  status: 'completed' | 'missed' | 'pending'
}

interface DayDetailModalProps {
  date: Date
  isOpen: boolean
  onClose: () => void
}

export default function DayDetailModal({ date, isOpen, onClose }: DayDetailModalProps) {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadMedicationsForDay()
    }
  }, [isOpen, date])

  const loadMedicationsForDay = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('medtracker_user_id')
      if (!userId) {
        setLoading(false)
        return
      }

      // Load all grandparents for this user
      const { data: grandparents, error } = await supabase
        .from('grandparents')
        .select('id, name, medication, time_to_call')
        .eq('user_id', userId)

      if (error) {
        console.error('Error loading medications:', error)
        setLoading(false)
        return
      }

      if (grandparents) {
        // For now, all medications show as pending (will be updated via API later)
        const meds: Medication[] = grandparents.map((gp) => ({
          id: gp.id,
          name: gp.name,
          medication: gp.medication,
          time_to_call: gp.time_to_call,
          status: 'pending' as const,
        }))

        // Sort by time
        meds.sort((a, b) => {
          const timeA = a.time_to_call
          const timeB = b.time_to_call
          return timeA.localeCompare(timeB)
        })

        setMedications(meds)
      }
    } catch (error) {
      console.error('Error loading medications:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return date.toLocaleDateString('en-US', options)
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Schedule for {formatDate(date)}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <p className={styles.loading}>Loading medications...</p>
          ) : medications.length === 0 ? (
            <p className={styles.empty}>No medications scheduled for this day.</p>
          ) : (
            <div className={styles.medicationList}>
              {medications.map((med) => (
                <div
                  key={med.id}
                  className={`${styles.medicationItem} ${styles[med.status]}`}
                >
                  <div className={styles.medicationHeader}>
                    <div className={styles.medicationName}>{med.medication}</div>
                    <div className={styles.statusBadge}>
                      {med.status === 'completed' && (
                        <span className={styles.completedBadge}>✓ Completed</span>
                      )}
                      {med.status === 'missed' && (
                        <span className={styles.missedBadge}>✗ Missed</span>
                      )}
                      {med.status === 'pending' && (
                        <span className={styles.pendingBadge}>Pending</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.medicationDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>For:</span>
                      <span className={styles.value}>{med.name}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Time:</span>
                      <span className={styles.value}>{formatTime(med.time_to_call)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


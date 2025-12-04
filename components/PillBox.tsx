'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserId } from '@/lib/session'
import DayDetailModal from './DayDetailModal'
import styles from './PillBox.module.css'

interface MedicationData {
  grandparentName: string
  medication: string
  timeToCall: string
}

interface DayStatus {
  [date: string]: 'completed' | 'missed' | 'pending'
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function PillBox() {
  const [medicationData, setMedicationData] = useState<MedicationData | null>(null)
  const [dayStatuses, setDayStatuses] = useState<DayStatus>({})
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadGrandparentData()
    loadCallLogs()
  }, [])

  const loadGrandparentData = async () => {
    try {
      const userId = getUserId()
      if (!userId) {
        console.error('User not logged in')
        setLoading(false)
        return
      }

      // Load grandparent data from Supabase
      const { data, error } = await supabase
        .from('grandparents')
        .select('id, name, medication, time_to_call')
        .eq('user_id', userId)
        .limit(1)
        .single()

      if (error) {
        console.error('Error loading grandparent data:', error)
        setLoading(false)
        return
      }

      if (data) {
        setMedicationData({
          grandparentName: data.name,
          medication: data.medication,
          timeToCall: data.time_to_call,
        })
      }
    } catch (error) {
      console.error('Error loading medication data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCallLogs = async () => {
    try {
      const userId = getUserId()
      if (!userId) return

      // Get the week date range
      const weekDates = getWeekDates()
      const startDate = formatDate(weekDates[0])
      const endDate = formatDate(weekDates[6])

      // Load all grandparents for this user
      const { data: grandparents, error: gpError } = await supabase
        .from('grandparents')
        .select('id')
        .eq('user_id', userId)

      if (gpError || !grandparents || grandparents.length === 0) return

      const grandparentIds = grandparents.map((gp) => gp.id)

      // Load call logs for this week
      const { data: callLogs, error: logsError } = await supabase
        .from('call_logs')
        .select('grandparent_id, call_date, answered, answer')
        .in('grandparent_id', grandparentIds)
        .gte('call_date', startDate)
        .lte('call_date', endDate)

      if (logsError) {
        console.error('Error loading call logs:', logsError)
        return
      }

      // Process call logs into status map
      const statusMap: DayStatus = {}
      if (callLogs) {
        callLogs.forEach((log) => {
          const dateKey = log.call_date
          // Determine status based on answered and answer
          if (!log.answered) {
            // Not answered → missed
            statusMap[dateKey] = 'missed'
          } else if (log.answer === 'yes') {
            // Answered and said yes → completed
            statusMap[dateKey] = 'completed'
          } else if (log.answer === 'no') {
            // Answered but said no → missed
            statusMap[dateKey] = 'missed'
          } else {
            // Answered but no answer recorded → pending
            statusMap[dateKey] = 'pending'
          }
        })
      }

      setDayStatuses(statusMap)
    } catch (error) {
      console.error('Error loading call logs:', error)
    }
  }

  const getWeekDates = () => {
    const today = new Date()
    const currentDay = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - currentDay)
    
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusForDate = (date: Date): 'completed' | 'missed' | 'pending' => {
    const dateKey = formatDate(date)
    
    // If status is set from call logs, return it
    if (dayStatuses[dateKey]) {
      return dayStatuses[dateKey]
    }
    
    // No call log for this date → pending
    return 'pending'
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
  }

  const weekDates = getWeekDates()

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading medication data...</p>
      </div>
    )
  }

  if (!medicationData) {
    return (
      <div className={styles.container}>
        <p>No medication data found. Please complete onboarding.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{medicationData.grandparentName}'s Medication Tracker</h2>
        <p className={styles.medicationName}>{medicationData.medication}</p>
        <p className={styles.timeInfo}>Time: {formatTime(medicationData.timeToCall)}</p>
      </div>
      
      <div className={styles.pillBox}>
        {weekDates.map((date, index) => {
          const dateKey = formatDate(date)
          const status = getStatusForDate(date)
          const isToday = dateKey === formatDate(new Date())
          
          return (
            <div
              key={dateKey}
              className={`${styles.dayBox} ${styles[status]} ${isToday ? styles.today : ''} ${styles.clickable}`}
              onClick={() => handleDayClick(date)}
            >
              <div className={styles.dayHeader}>
                <div className={styles.dayName}>{DAYS_OF_WEEK[index]}</div>
                <div className={styles.dateNumber}>{date.getDate()}</div>
              </div>
              <div className={styles.pill}>
                <div className={styles.pillContent}>
                  <span className={styles.pillTime}>{formatTime(medicationData.timeToCall)}</span>
                </div>
              </div>
              <div className={styles.statusIndicator}>
                {status === 'completed' && <span className={styles.statusText}>✓ Taken</span>}
                {status === 'missed' && <span className={styles.statusText}>✗ Missed</span>}
                {status === 'pending' && <span className={styles.statusText}>Pending</span>}
              </div>
            </div>
          )
        })}
      </div>

      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}


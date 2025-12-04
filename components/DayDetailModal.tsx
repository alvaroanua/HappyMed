'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserId } from '@/lib/session'
import SimplePopup from './SimplePopup'
import styles from './DayDetailModal.module.css'

interface Medication {
  id: string
  name: string
  medication: string
  time_to_call: string
  gender: string
  phone_number: string
  phoneAnswered: boolean | null // null = pending, true = answered, false = not answered
  medicationTaken: boolean | null // null = pending/not answered, true = yes, false = no
  callLog?: {
    answered: boolean
    answer: string | null
  }
}

interface UserInfo {
  name: string
  phone_number: string
}

interface DayDetailModalProps {
  date: Date
  isOpen: boolean
  onClose: () => void
}

const API_CALL_URL = '/api/call'

export default function DayDetailModal({ date, isOpen, onClose }: DayDetailModalProps) {
  const [medications, setMedications] = useState<Medication[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [callingMedicationId, setCallingMedicationId] = useState<string | null>(null)
  const [popup, setPopup] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
    visible: boolean
  }>({
    message: '',
    type: 'success',
    visible: false,
  })
  const [waitingForResponse, setWaitingForResponse] = useState<Set<string>>(new Set())

  // Set up polling with dynamic interval based on recent call
  // Set up polling to check database every 30 seconds, or every 5 seconds if waiting for response
  useEffect(() => {
    if (!isOpen) {
      // Reset when modal closes
      setWaitingForResponse(new Set())
      return
    }

    loadMedicationsForDay()
    loadUserInfo()
    
    // Use shorter interval (5 seconds) if waiting for any response, otherwise 30 seconds
    const interval = waitingForResponse.size > 0 ? 5000 : 30000
    
    console.log(`Starting polling with ${interval / 1000} second interval (waiting for ${waitingForResponse.size} responses)`)
    
    const intervalId = setInterval(() => {
      console.log('Polling: Refreshing medication data for date:', date)
      loadMedicationsForDay()
    }, interval)
    
    // Cleanup interval on unmount or when modal closes
    return () => {
      console.log('Cleaning up polling interval')
      clearInterval(intervalId)
    }
  }, [isOpen, date, waitingForResponse.size]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserInfo = async () => {
    console.log('=== LOADING USER INFO ===')
    try {
      const userId = getUserId()
      console.log('User ID from session:', userId)
      
      if (!userId) {
        console.warn('WARNING: No user ID found in session')
        return
      }

      console.log('Fetching user data from Supabase...')
      const { data, error } = await supabase
        .from('users')
        .select('name, phone_number')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('ERROR loading user info:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        return
      }

      console.log('User data received:', data)
      if (data) {
        const userInfoData = {
          name: data.name,
          phone_number: data.phone_number,
        }
        console.log('Setting user info:', userInfoData)
        setUserInfo(userInfoData)
      } else {
        console.warn('WARNING: No user data returned')
      }
    } catch (error) {
      console.error('EXCEPTION loading user info:', error)
      console.error('Error details:', error)
    }
  }

  const loadMedicationsForDay = async () => {
    console.log('=== LOADING MEDICATIONS FOR DAY ===')
    console.log('Date:', date)
    try {
      setLoading(true)
      const userId = getUserId()
      console.log('User ID:', userId)
      
      if (!userId) {
        console.warn('WARNING: No user ID found')
        setLoading(false)
        return
      }

      console.log('Fetching grandparents from Supabase...')
      // Load all grandparents for this user with gender and phone
      const { data: grandparents, error } = await supabase
        .from('grandparents')
        .select('id, name, medication, time_to_call, gender, phone_number')
        .eq('user_id', userId)

      if (error) {
        console.error('ERROR loading medications:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        setLoading(false)
        return
      }

      console.log('Grandparents data received:', grandparents)
      if (grandparents) {
        const grandparentIds = grandparents.map((gp) => gp.id)
        const dateKey = formatDate(date)

        // Load call logs for this date
        const { data: callLogs, error: logsError } = await supabase
          .from('call_logs')
          .select('grandparent_id, answered, answer')
          .in('grandparent_id', grandparentIds)
          .eq('call_date', dateKey)

        // Create a map of grandparent_id to call log
        const callLogMap = new Map()
        if (callLogs) {
          callLogs.forEach((log) => {
            callLogMap.set(log.grandparent_id, {
              answered: log.answered,
              answer: log.answer,
            })
          })
        }

        // Map medications with call log status
        const meds: Medication[] = grandparents.map((gp) => {
          const callLog = callLogMap.get(gp.id)
          const isWaiting = waitingForResponse.has(gp.id)
          
          // Determine phone answered status
          let phoneAnswered: boolean | null = null
          let medicationTaken: boolean | null = null

          if (callLog) {
            phoneAnswered = callLog.answered
            if (callLog.answered) {
              // If answered, check if they took medication
              if (callLog.answer === 'yes') {
                medicationTaken = true
                // Response received, stop waiting
                setWaitingForResponse(prev => {
                  const newSet = new Set(prev)
                  newSet.delete(gp.id)
                  return newSet
                })
              } else if (callLog.answer === 'no') {
                medicationTaken = false
                // Response received, stop waiting
                setWaitingForResponse(prev => {
                  const newSet = new Set(prev)
                  newSet.delete(gp.id)
                  return newSet
                })
              }
              // If answered but no answer recorded, medicationTaken stays null
            } else if (callLog.answered === false) {
              // Not answered - response received, stop waiting
              setWaitingForResponse(prev => {
                const newSet = new Set(prev)
                newSet.delete(gp.id)
                return newSet
              })
            }
            // If not answered, both stay null
          }

          const med = {
            id: gp.id,
            name: gp.name,
            medication: gp.medication,
            time_to_call: gp.time_to_call,
            gender: gp.gender,
            phone_number: gp.phone_number,
            phoneAnswered: isWaiting ? null : phoneAnswered,
            medicationTaken: isWaiting ? null : medicationTaken,
            callLog: callLog || undefined,
          }
          console.log('Mapped medication:', med, 'isWaiting:', isWaiting)
          return med
        })

        // Sort by time
        meds.sort((a, b) => {
          const timeA = a.time_to_call
          const timeB = b.time_to_call
          return timeA.localeCompare(timeB)
        })

        console.log('Final medications array:', meds)
        setMedications(meds)
      } else {
        console.warn('WARNING: No grandparents data returned')
      }
    } catch (error) {
      console.error('EXCEPTION loading medications:', error)
      console.error('Error details:', error)
    } finally {
      setLoading(false)
      console.log('=== MEDICATIONS LOADING COMPLETED ===')
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

  const triggerCall = async (medication: Medication) => {
    console.log('=== CALL TRIGGER STARTED ===')
    console.log('Medication data:', medication)
    console.log('User info:', userInfo)

    if (!userInfo) {
      console.error('ERROR: User information not loaded')
      setPopup({
        message: 'User information not loaded. Please try again.',
        type: 'error',
        visible: true,
      })
      return
    }

    // Validate required fields
    if (!medication.name) {
      console.error('ERROR: Missing medication.name')
      setPopup({
        message: 'Missing grandparent name',
        type: 'error',
        visible: true,
      })
      return
    }
    if (!medication.medication) {
      console.error('ERROR: Missing medication.medication')
      setPopup({
        message: 'Missing medication name',
        type: 'error',
        visible: true,
      })
      return
    }
    if (!medication.phone_number) {
      console.error('ERROR: Missing medication.phone_number')
      setPopup({
        message: 'Missing grandparent phone number',
        type: 'error',
        visible: true,
      })
      return
    }
    if (!userInfo.name) {
      console.error('ERROR: Missing userInfo.name')
      setPopup({
        message: 'Missing user name',
        type: 'error',
        visible: true,
      })
      return
    }
    if (!userInfo.phone_number) {
      console.error('ERROR: Missing userInfo.phone_number')
      setPopup({
        message: 'Missing user phone number',
        type: 'error',
        visible: true,
      })
      return
    }

    setCallingMedicationId(medication.id)

    try {
      const payload = {
        name_yaya: medication.name,
        pill: medication.medication,
        time: medication.time_to_call,
        gender: medication.gender,
        phone_yaya: medication.phone_number,
        name_son: userInfo.name,
        phone_son: userInfo.phone_number,
        id: medication.id,
      }

      console.log('=== API CALL PAYLOAD ===')
      console.log('URL:', API_CALL_URL)
      console.log('Payload:', JSON.stringify(payload, null, 2))

      console.log('Sending POST request to internal API...')
      const response = await fetch(API_CALL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log('=== API RESPONSE RECEIVED ===')
      console.log('Status:', response.status)
      console.log('Status Text:', response.statusText)
      console.log('Headers:', Object.fromEntries(response.headers.entries()))

      const responseData = await response.json()
      console.log('Response Body:', JSON.stringify(responseData, null, 2))

      if (!response.ok) {
        console.error('ERROR: API returned error response')
        console.error('Status:', response.status)
        console.error('Response:', responseData)
        const errorMessage = responseData.error || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      console.log('=== CALL TRIGGERED SUCCESSFULLY ===')
      console.log('Response data:', responseData)
      
      setPopup({
        message: 'Call has been triggered successfully!',
        type: 'success',
        visible: true,
      })
      
      // Mark this medication as waiting for response
      setWaitingForResponse(prev => new Set(prev).add(medication.id))
      
      // Check immediately for response
      loadMedicationsForDay()
      
      // Stop waiting after 2 minutes if no response received
      setTimeout(() => {
        setWaitingForResponse(prev => {
          const newSet = new Set(prev)
          newSet.delete(medication.id)
          return newSet
        })
      }, 120000) // 2 minutes
    } catch (error: any) {
      console.error('=== ERROR TRIGGERING CALL ===')
      console.error('Error type:', error?.constructor?.name)
      console.error('Error message:', error?.message)
      console.error('Error stack:', error?.stack)
      console.error('Full error object:', error)
      
      const errorMessage = error?.message || 'Unknown error occurred'
      setPopup({
        message: `Failed to trigger call: ${errorMessage}`,
        type: 'error',
        visible: true,
      })
    } finally {
      console.log('=== CALL TRIGGER COMPLETED ===')
      setCallingMedicationId(null)
    }
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
                  className={styles.medicationItem}
                >
                  <div className={styles.medicationHeader}>
                    <div className={styles.medicationName}>{med.medication}</div>
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
                  <div className={styles.statusSection}>
                    <div className={styles.statusRow}>
                      <span className={styles.statusLabel}>Phone Answered:</span>
                      <span className={`${styles.statusValue} ${
                        waitingForResponse.has(med.id) ? styles.statusLoading :
                        med.phoneAnswered === true ? styles.statusYes :
                        med.phoneAnswered === false ? styles.statusNo :
                        styles.statusPending
                      }`}>
                        {waitingForResponse.has(med.id) ? '⟳ Loading...' :
                         med.phoneAnswered === true ? '✓ Yes' :
                         med.phoneAnswered === false ? '✗ No' :
                         'Pending'}
                      </span>
                    </div>
                    <div className={styles.statusRow}>
                      <span className={styles.statusLabel}>Medication Taken:</span>
                      <span className={`${styles.statusValue} ${
                        waitingForResponse.has(med.id) ? styles.statusLoading :
                        med.medicationTaken === true ? styles.statusYes :
                        med.medicationTaken === false ? styles.statusNo :
                        styles.statusPending
                      }`}>
                        {waitingForResponse.has(med.id) ? '⟳ Loading...' :
                         med.medicationTaken === true ? '✓ Yes' :
                         med.medicationTaken === false ? '✗ No' :
                         'Pending'}
                      </span>
                    </div>
                  </div>
                  <button
                    className={styles.callButton}
                    onClick={() => triggerCall(med)}
                    disabled={callingMedicationId === med.id || !userInfo}
                  >
                    {callingMedicationId === med.id ? 'Calling...' : '📞 Call Now'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SimplePopup
        message={popup.message}
        type={popup.type}
        isVisible={popup.visible}
        onClose={() => setPopup({ ...popup, visible: false })}
      />
    </div>
  )
}


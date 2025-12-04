'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './OnboardingForm.module.css'

interface GrandparentInfo {
  name: string
  phoneNumber: string
  medication: string
  timeToCall: string
  gender: string
}

interface OnboardingFormProps {
  onComplete: () => void
}

const TYPICAL_MEDICATIONS = [
  'Blood Pressure Medication (Lisinopril)',
  'Diabetes Medication (Metformin)',
  'Heart Medication (Aspirin)',
  'Cholesterol Medication (Atorvastatin)',
  'Pain Relief (Ibuprofen)',
]

export default function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [grandparentInfo, setGrandparentInfo] = useState<GrandparentInfo>({
    name: '',
    phoneNumber: '',
    medication: '',
    timeToCall: '',
    gender: '',
  })
  const [showCustomMedication, setShowCustomMedication] = useState(false)
  const [customMedication, setCustomMedication] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load any saved grandparent data from localStorage (for draft)
    const savedData = localStorage.getItem('medtracker_grandparent_draft')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setGrandparentInfo(parsed)
        if (parsed.medication && !TYPICAL_MEDICATIONS.includes(parsed.medication)) {
          setShowCustomMedication(true)
          setCustomMedication(parsed.medication)
        }
      } catch (error) {
        console.error('Error loading draft data:', error)
      }
    }
  }, [])

  // Save draft to localStorage as user types
  useEffect(() => {
    localStorage.setItem('medtracker_grandparent_draft', JSON.stringify(grandparentInfo))
  }, [grandparentInfo])

  const handleMedicationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === 'custom') {
      setShowCustomMedication(true)
      setGrandparentInfo({ ...grandparentInfo, medication: '' })
    } else {
      setShowCustomMedication(false)
      setCustomMedication('')
      setGrandparentInfo({ ...grandparentInfo, medication: value })
    }
  }

  const handleCustomMedicationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomMedication(value)
    setGrandparentInfo({ ...grandparentInfo, medication: value })
  }

  const handleGrandparentInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const finalMedication = showCustomMedication ? customMedication : grandparentInfo.medication

    if (!finalMedication) {
      setError('Please select or enter a medication')
      setLoading(false)
      return
    }

    try {
      const userId = localStorage.getItem('medtracker_user_id')
      if (!userId) {
        throw new Error('User not logged in')
      }

      const finalData = {
        ...grandparentInfo,
        medication: finalMedication,
      }

      // Save to Supabase
      const { data, error: insertError } = await supabase
        .from('grandparents')
        .insert([
          {
            user_id: userId,
            name: finalData.name,
            phone_number: finalData.phoneNumber,
            medication: finalData.medication,
            time_to_call: finalData.timeToCall,
            gender: finalData.gender,
          },
        ])
        .select()
        .single()

      if (insertError) throw insertError

      // Clear draft data
      localStorage.removeItem('medtracker_grandparent_draft')

      console.log('Grandparent saved:', data)
      onComplete()
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving')
      console.error('Error saving grandparent:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Grandparent Information</h2>
      <p className={styles.subtitle}>Add information about the grandparent you're tracking</p>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleGrandparentInfoSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="grandparentName" className={styles.label}>
            Name
          </label>
          <input
            type="text"
            id="grandparentName"
            value={grandparentInfo.name}
            onChange={(e) =>
              setGrandparentInfo({ ...grandparentInfo, name: e.target.value })
            }
            className={styles.input}
            required
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="grandparentPhoneNumber" className={styles.label}>
            Phone Number
          </label>
          <input
            type="tel"
            id="grandparentPhoneNumber"
            value={grandparentInfo.phoneNumber}
            onChange={(e) =>
              setGrandparentInfo({
                ...grandparentInfo,
                phoneNumber: e.target.value,
              })
            }
            className={styles.input}
            required
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="medication" className={styles.label}>
            Medication
          </label>
          <select
            id="medication"
            value={showCustomMedication ? 'custom' : grandparentInfo.medication}
            onChange={handleMedicationChange}
            className={styles.input}
            required={!showCustomMedication}
            disabled={loading}
          >
            <option value="">Select medication</option>
            {TYPICAL_MEDICATIONS.map((med) => (
              <option key={med} value={med}>
                {med}
              </option>
            ))}
            <option value="custom">Add another medication</option>
          </select>
          {showCustomMedication && (
            <input
              type="text"
              placeholder="Enter medication name"
              value={customMedication}
              onChange={handleCustomMedicationChange}
              className={styles.input}
              style={{ marginTop: '0.5rem' }}
              required
              disabled={loading}
            />
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="timeToCall" className={styles.label}>
            Time to Call
          </label>
          <input
            type="time"
            id="timeToCall"
            value={grandparentInfo.timeToCall}
            onChange={(e) =>
              setGrandparentInfo({
                ...grandparentInfo,
                timeToCall: e.target.value,
              })
            }
            className={styles.input}
            required
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="gender" className={styles.label}>
            Gender
          </label>
          <select
            id="gender"
            value={grandparentInfo.gender}
            onChange={(e) =>
              setGrandparentInfo({
                ...grandparentInfo,
                gender: e.target.value,
              })
            }
            className={styles.input}
            required
            disabled={loading}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Saving...' : 'Complete Onboarding'}
        </button>
      </form>
    </div>
  )
}

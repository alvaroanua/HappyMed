'use client'

import { useState } from 'react'
import styles from './AddMedicationForm.module.css'

interface AddMedicationFormProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddMedicationForm({ isOpen, onClose }: AddMedicationFormProps) {
  const [formData, setFormData] = useState({
    medication: '',
    time: '',
    dosage: '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mocked - just close the form
    console.log('Mocked: Adding medication', formData)
    alert('This is a mocked form. Medication not actually added.')
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add New Medication</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="medication" className={styles.label}>
              Medication Name *
            </label>
            <input
              type="text"
              id="medication"
              name="medication"
              className={styles.input}
              value={formData.medication}
              onChange={handleChange}
              required
              placeholder="e.g., Aspirin, Metformin"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="time" className={styles.label}>
              Time to Take *
            </label>
            <input
              type="time"
              id="time"
              name="time"
              className={styles.input}
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dosage" className={styles.label}>
              Dosage
            </label>
            <input
              type="text"
              id="dosage"
              name="dosage"
              className={styles.input}
              value={formData.dosage}
              onChange={handleChange}
              placeholder="e.g., 100mg, 1 tablet"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.label}>
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              className={styles.textarea}
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes about this medication..."
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Add Medication
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


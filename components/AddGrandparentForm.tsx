'use client'

import { useState } from 'react'
import styles from './AddGrandparentForm.module.css'

interface AddGrandparentFormProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddGrandparentForm({ isOpen, onClose }: AddGrandparentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    medication: '',
    timeToCall: '',
    gender: '',
    relationship: '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mocked - just close the form
    console.log('Mocked: Adding grandparent', formData)
    alert('This is a mocked form. Grandparent not actually added.')
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
          <h2 className={styles.title}>Add New Grandparent</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.input}
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Grandma Maria"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phoneNumber" className={styles.label}>
              Phone Number *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              className={styles.input}
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="relationship" className={styles.label}>
              Relationship
            </label>
            <select
              id="relationship"
              name="relationship"
              className={styles.select}
              value={formData.relationship}
              onChange={handleChange}
            >
              <option value="">Select relationship...</option>
              <option value="grandmother">Grandmother</option>
              <option value="grandfather">Grandfather</option>
              <option value="mother">Mother</option>
              <option value="father">Father</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="gender" className={styles.label}>
              Gender *
            </label>
            <select
              id="gender"
              name="gender"
              className={styles.select}
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select gender...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="medication" className={styles.label}>
              Medication *
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
            <label htmlFor="timeToCall" className={styles.label}>
              Time to Call *
            </label>
            <input
              type="time"
              id="timeToCall"
              name="timeToCall"
              className={styles.input}
              value={formData.timeToCall}
              onChange={handleChange}
              required
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
              placeholder="Additional notes..."
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Add Grandparent
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


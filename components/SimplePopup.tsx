'use client'

import { useEffect } from 'react'
import styles from './SimplePopup.module.css'

interface SimplePopupProps {
  message: string
  type: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  autoHideDuration?: number
}

export default function SimplePopup({
  message,
  type,
  isVisible,
  onClose,
  autoHideDuration = 3000,
}: SimplePopupProps) {
  useEffect(() => {
    if (isVisible && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, autoHideDuration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, autoHideDuration, onClose])

  if (!isVisible) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.popup} ${styles[type]}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <div className={styles.icon}>
            {type === 'success' && '✓'}
            {type === 'error' && '✗'}
            {type === 'info' && 'ℹ'}
          </div>
          <div className={styles.message}>{message}</div>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  )
}


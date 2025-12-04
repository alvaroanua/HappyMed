'use client'

import { useEffect, useState } from 'react'
import styles from './Notification.module.css'

interface NotificationProps {
  message: string
  type: 'success' | 'info' | 'warning'
  isVisible: boolean
  onClose: () => void
  autoHideDuration?: number
}

export default function Notification({
  message,
  type,
  isVisible,
  onClose,
  autoHideDuration = 5000,
}: NotificationProps) {
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
    <div className={`${styles.notification} ${styles[type]}`}>
      <div className={styles.content}>
        <div className={styles.icon}>
          {type === 'success' && '✓'}
          {type === 'info' && 'ℹ'}
          {type === 'warning' && '⚠'}
        </div>
        <div className={styles.message}>{message}</div>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  )
}


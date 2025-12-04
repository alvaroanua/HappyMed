'use client'

import Link from 'next/link'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          MedTracker
        </Link>
        <Link href="/dashboard" className={styles.dashboardButton}>
          Dashboard
        </Link>
      </div>
    </nav>
  )
}


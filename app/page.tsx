import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>MedTracker</h1>
        <p className={styles.subtitle}>
          Help track medications for your elderly loved ones
        </p>
      </div>
    </main>
  )
}


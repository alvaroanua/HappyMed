'use client'

import { useState } from 'react'
import styles from './page.module.css'

export default function TestWebhookPage() {
  const [grandparentId, setGrandparentId] = useState('')
  const [answered, setAnswered] = useState('true')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const loadPreset = (type: string) => {
    switch (type) {
      case 'answered-yes':
        setAnswered('true')
        setAnswer('yes')
        break
      case 'answered-no':
        setAnswered('true')
        setAnswer('no')
        break
      case 'not-answered':
        setAnswered('false')
        setAnswer('')
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError(null)

    const payload = {
      grandparent_id: grandparentId,
      answered: answered === 'true',
      answer: answer || null,
    }

    try {
      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, status: response.status, data })
      } else {
        setResult({ success: false, status: response.status, data })
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🧪 Webhook Tester</h1>
      <p className={styles.subtitle}>
        Test the webhook endpoint at <code>/api/webhook</code>
      </p>

      <div className={styles.presetButtons}>
        <button
          type="button"
          className={styles.presetBtn}
          onClick={() => loadPreset('answered-yes')}
        >
          ✅ Answered + Yes
        </button>
        <button
          type="button"
          className={styles.presetBtn}
          onClick={() => loadPreset('answered-no')}
        >
          ❌ Answered + No
        </button>
        <button
          type="button"
          className={styles.presetBtn}
          onClick={() => loadPreset('not-answered')}
        >
          📞 Not Answered
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="grandparent_id" className={styles.label}>Grandparent ID *</label>
          <input
            type="text"
            id="grandparent_id"
            className={styles.input}
            value={grandparentId}
            onChange={(e) => setGrandparentId(e.target.value)}
            required
            placeholder="Enter a grandparent UUID from your database"
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="answered" className={styles.label}>Answered Phone? *</label>
          <select
            id="answered"
            className={styles.select}
            value={answered}
            onChange={(e) => {
              setAnswered(e.target.value)
              if (e.target.value === 'false') setAnswer('')
            }}
            required
            disabled={loading}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="answer" className={styles.label}>Answer (if answered)</label>
          <select
            id="answer"
            className={styles.select}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={loading || answered === 'false'}
          >
            <option value="">Select...</option>
            <option value="yes">Yes (took medication)</option>
            <option value="no">No (didn't take medication)</option>
          </select>
          <small className={styles.hint}>
            Leave empty if not answered
          </small>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Sending...' : 'Send Webhook'}
        </button>
      </form>

      {error && (
        <div className={`${styles.result} ${styles.error}`}>
          <strong>❌ NETWORK ERROR</strong>
          <pre>{error}</pre>
        </div>
      )}

      {result && (
        <div
          className={`${styles.result} ${
            result.success ? styles.success : styles.error
          }`}
        >
          <strong>{result.success ? '✅ SUCCESS' : '❌ ERROR'}</strong>
          <div className={styles.resultContent}>
            <div>
              <strong>Status:</strong> {result.status}
            </div>
            <div>
              <strong>Response:</strong>
              <pre>{JSON.stringify(result.data, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { hashPassword, verifyPassword } from '@/lib/password'
import styles from './LoginForm.module.css'

interface LoginFormProps {
  onLoginSuccess: () => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!password) {
        setError('Password is required')
        setLoading(false)
        return
      }

      // Check if user exists with this email and phone
      const { data: existingUsers, error: searchError } = await supabase
        .from('users')
        .select('id, name, email, phone_number, password_hash')
        .eq('email', email)
        .eq('phone_number', phoneNumber)
        .maybeSingle()

      if (searchError) {
        throw searchError
      }

      if (existingUsers) {
        // User exists, verify password
        if (!existingUsers.password_hash) {
          // Old user without password, update with new password
          const passwordHash = await hashPassword(password)
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              name: name || existingUsers.name,
              password_hash: passwordHash 
            })
            .eq('id', existingUsers.id)

          if (updateError) throw updateError
        } else {
          // Verify password
          const isValid = await verifyPassword(password, existingUsers.password_hash)
          if (!isValid) {
            setError('Invalid password')
            setLoading(false)
            return
          }

          // Update name if provided and different
          if (name && name !== existingUsers.name) {
            const { error: updateError } = await supabase
              .from('users')
              .update({ name })
              .eq('id', existingUsers.id)

            if (updateError) throw updateError
          }
        }

        // Store in session/localStorage
        localStorage.setItem('medtracker_user_id', existingUsers.id)
        localStorage.setItem('medtracker_user_name', name || existingUsers.name || '')
        localStorage.setItem('medtracker_user_email', email)
        localStorage.setItem('medtracker_user_phone', phoneNumber)
        onLoginSuccess()
      } else {
        // User doesn't exist, create new user with hashed password
        const passwordHash = await hashPassword(password)
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              name,
              email,
              phone_number: phoneNumber,
              password_hash: passwordHash,
            },
          ])
          .select()
          .single()

        if (insertError) throw insertError

        if (newUser) {
          localStorage.setItem('medtracker_user_id', newUser.id)
          localStorage.setItem('medtracker_user_name', name)
          localStorage.setItem('medtracker_user_email', email)
          localStorage.setItem('medtracker_user_phone', phoneNumber)
          onLoginSuccess()
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Login</h2>
      <p className={styles.subtitle}>Enter your information to continue</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            required
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber" className={styles.label}>
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={styles.input}
            required
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
            disabled={loading}
            minLength={6}
          />
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}


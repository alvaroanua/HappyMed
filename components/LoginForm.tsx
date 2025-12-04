'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { hashPassword, verifyPassword } from '@/lib/password'
import { setUserId } from '@/lib/session'
import styles from './LoginForm.module.css'

interface LoginFormProps {
  onLoginSuccess: () => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [isSignupMode, setIsSignupMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!email || !password) {
        setError('Email and password are required')
        setLoading(false)
        return
      }

      // Check if user exists with this email
      const { data: existingUser, error: searchError } = await supabase
        .from('users')
        .select('id, email, password_hash')
        .eq('email', email)
        .maybeSingle()

      if (searchError) {
        throw searchError
      }

      if (!existingUser) {
        setError('No account found with this email. Please sign up.')
        setLoading(false)
        return
      }

      if (!existingUser.password_hash) {
        setError('Account exists but has no password. Please contact support.')
        setLoading(false)
        return
      }

      // Verify password
      const isValid = await verifyPassword(password, existingUser.password_hash)
      if (!isValid) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      // Login successful
      setUserId(existingUser.id)
      onLoginSuccess()
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!email || !password || !name || !phoneNumber) {
        setError('All fields are required')
        setLoading(false)
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }

      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingUser) {
        setError('An account with this email already exists. Please login instead.')
        setLoading(false)
        return
      }

      // Create new user with hashed password
      const passwordHash = await hashPassword(password)
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            email,
            password_hash: passwordHash,
            name,
            phone_number: phoneNumber,
          },
        ])
        .select()
        .single()

      if (insertError) {
        if (insertError.code === '23505') {
          setError('An account with this email already exists')
        } else {
          throw insertError
        }
        setLoading(false)
        return
      }

      if (newUser) {
        // Signup successful
        setUserId(newUser.id)
        onLoginSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>
        {isSignupMode ? 'Sign Up' : 'Login'}
      </h2>
      <p className={styles.subtitle}>
        {isSignupMode 
          ? 'Create a new account' 
          : 'Enter your email and password to continue'}
      </p>
      
      {!isSignupMode ? (
        // LOGIN FORM
        <form onSubmit={handleLogin} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
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
              placeholder="your@email.com"
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
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className={styles.switchContainer}>
            <p className={styles.switchText}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignupMode(true)}
                className={styles.switchButton}
                disabled={loading}
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>
      ) : (
        // SIGNUP FORM
        <form onSubmit={handleSignup} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.formGroup}>
            <label htmlFor="signup-name" className={styles.label}>
              Name
            </label>
            <input
              type="text"
              id="signup-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
              disabled={loading}
              placeholder="Your full name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="signup-email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
              disabled={loading}
              placeholder="your@email.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="signup-phone" className={styles.label}>
              Phone Number
            </label>
            <input
              type="tel"
              id="signup-phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={styles.input}
              required
              disabled={loading}
              placeholder="+1234567890"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="signup-password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              disabled={loading}
              minLength={6}
              placeholder="Minimum 6 characters"
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
          
          <div className={styles.switchContainer}>
            <p className={styles.switchText}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignupMode(false)}
                className={styles.switchButton}
                disabled={loading}
              >
                Login
              </button>
            </p>
          </div>
        </form>
      )}
    </div>
  )
}


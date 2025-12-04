'use client'

import { useState, useEffect } from 'react'
import LoginForm from '@/components/LoginForm'
import OnboardingForm from '@/components/OnboardingForm'
import PillBox from '@/components/PillBox'
import { supabase } from '@/lib/supabase'
import { getUserId } from '@/lib/session'
import styles from './page.module.css'

type ViewState = 'login' | 'onboarding' | 'dashboard'

export default function Dashboard() {
  const [viewState, setViewState] = useState<ViewState>('login')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const userId = getUserId()
      
      if (!userId) {
        setViewState('login')
        setLoading(false)
        return
      }

      // Verify user exists in database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        console.error('User not found in database:', userError)
        setViewState('login')
        setLoading(false)
        return
      }

      // Check if user has any grandparents (onboarding complete)
      const { data: grandparents, error } = await supabase
        .from('grandparents')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (error) {
        console.error('Error checking grandparents:', error)
        setViewState('login')
      } else if (grandparents && grandparents.length > 0) {
        setViewState('dashboard')
      } else {
        setViewState('onboarding')
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setViewState('login')
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSuccess = () => {
    checkAuthStatus()
  }

  const handleOnboardingComplete = () => {
    setViewState('dashboard')
  }

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {viewState === 'login' && (
          <>
            <h1 className={styles.title}>Welcome to MedTracker</h1>
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </>
        )}
        {viewState === 'onboarding' && (
          <>
            <h1 className={styles.title}>Welcome to Dashboard</h1>
            <OnboardingForm onComplete={handleOnboardingComplete} />
          </>
        )}
        {viewState === 'dashboard' && <PillBox />}
      </div>
    </main>
  )
}


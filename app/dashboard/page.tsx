'use client'

import { useState, useEffect } from 'react'
import LoginForm from '@/components/LoginForm'
import OnboardingForm from '@/components/OnboardingForm'
import PillBox from '@/components/PillBox'
import Notification from '@/components/Notification'
import { supabase } from '@/lib/supabase'
import { getUserId } from '@/lib/session'
import styles from './page.module.css'

type ViewState = 'login' | 'onboarding' | 'dashboard'

export default function Dashboard() {
  const [viewState, setViewState] = useState<ViewState>('login')
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'info' | 'warning'
    visible: boolean
  }>({
    message: '',
    type: 'success',
    visible: false,
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => {
    // Only set up subscription when user is on dashboard
    if (viewState === 'dashboard') {
      const channel = setupRealtimeSubscription()
      
      return () => {
        // Cleanup subscription on unmount or view change
        if (channel) {
          channel.unsubscribe()
        }
      }
    }
  }, [viewState])

  const setupRealtimeSubscription = () => {
    const userId = getUserId()
    if (!userId) return null

    console.log('Setting up Realtime subscription for call_logs...')

    // Subscribe to changes in call_logs table
    const channel = supabase
      .channel(`call_logs_changes_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_logs',
        },
        async (payload) => {
          console.log('=== REALTIME UPDATE RECEIVED ===', payload)
          
          const newRecord = payload.new as any
          
          // Check if this is for a grandparent belonging to this user
          const { data: grandparent } = await supabase
            .from('grandparents')
            .select('id, name, user_id')
            .eq('id', newRecord.grandparent_id)
            .single()

          if (grandparent && grandparent.user_id === userId) {
            // Check if they answered and said yes
            if (newRecord.answered && newRecord.answer === 'yes') {
              setNotification({
                message: `✅ Great news! ${grandparent.name} has taken their medication!`,
                type: 'success',
                visible: true,
              })
              
              // Trigger a page refresh to update the pill box
              window.dispatchEvent(new Event('callLogUpdated'))
            } else if (newRecord.answered && newRecord.answer === 'no') {
              setNotification({
                message: `⚠️ ${grandparent.name} answered but did not take their medication.`,
                type: 'warning',
                visible: true,
              })
              
              window.dispatchEvent(new Event('callLogUpdated'))
            } else if (!newRecord.answered) {
              setNotification({
                message: `ℹ️ ${grandparent.name} did not answer the phone call.`,
                type: 'info',
                visible: true,
              })
              
              window.dispatchEvent(new Event('callLogUpdated'))
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    return channel
  }

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

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.visible}
        onClose={() => setNotification({ ...notification, visible: false })}
        autoHideDuration={6000}
      />
    </main>
  )
}


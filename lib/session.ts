// Session management using cookies
// Client-side only

export function setUserId(userId: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `medtracker_user_id=${userId}; path=/; max-age=86400; SameSite=Lax` // 24 hours
  }
}

export function getUserId(): string | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'medtracker_user_id') {
      return value || null
    }
  }
  return null
}

export function clearUserId() {
  if (typeof document !== 'undefined') {
    document.cookie = 'medtracker_user_id=; path=/; max-age=0'
  }
}


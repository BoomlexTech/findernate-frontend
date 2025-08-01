'use client'
import { useState } from 'react'
import { useUserStore } from '@/store/useUserStore'

export const useAuthGuard = () => {
  const { user, token } = useUserStore()
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const isAuthenticated = !!(user && token)

  const requireAuth = (callback?: () => void) => {
    if (isAuthenticated) {
      callback?.()
      return true
    } else {
      setShowAuthDialog(true)
      return false
    }
  }

  const closeAuthDialog = () => setShowAuthDialog(false)

  return { 
    requireAuth, 
    isAuthenticated, 
    showAuthDialog, 
    closeAuthDialog
  }
}
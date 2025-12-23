import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import httpClient, { setLogoutCallback } from '../services/httpClient'
import * as tokenService from '../services/tokenService'
import useInactivityTimer from '../hooks/useInactivityTimer'
import { securityConfig } from '../config/security'
import { cleanupPayPalSession } from '../services/paypal'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [refreshTimer, setRefreshTimer] = useState(null)

  const logout = useCallback(() => {
    tokenService.clearAllTokens()
    cleanupPayPalSession()
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      setRefreshTimer(null)
    }
    setUser(null)
    setIsAuthenticated(false)

    if (typeof window !== 'undefined') {
      localStorage.setItem('logout-event', Date.now().toString())
    }
  }, [refreshTimer])

  const scheduleTokenRefresh = useCallback((token) => {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }

    const expiryTime = tokenService.getTokenExpiryTime(token)
    if (!expiryTime) {
      return
    }

    const now = Math.floor(Date.now() / 1000)
    const timeUntilRefresh = Math.max(
      0,
      (expiryTime - now - securityConfig.tokenRefresh.bufferSeconds) * 1000
    )

    const timer = setTimeout(async () => {
      try {
        const refreshToken = tokenService.getRefreshToken()
        if (!refreshToken) {
          logout()
          return
        }

        const { data } = await httpClient.post('/auth/refresh', { refreshToken })
        if (data?.success && data?.token) {
          tokenService.setAccessToken(data.token)
          if (data.refreshToken) {
            tokenService.setRefreshToken(data.refreshToken)
          }
          scheduleTokenRefresh(data.token)
        } else {
          logout()
        }
      } catch (err) {
        console.error('Scheduled token refresh failed:', err)
        logout()
      }
    }, timeUntilRefresh)

    setRefreshTimer(timer)
  }, [refreshTimer, logout])

  // Use ref to avoid infinite re-renders from scheduleTokenRefresh dependency
  const scheduleTokenRefreshRef = useRef(scheduleTokenRefresh)
  useEffect(() => {
    scheduleTokenRefreshRef.current = scheduleTokenRefresh
  }, [scheduleTokenRefresh])

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenService.getAccessToken()
      if (token) {
        try {
          const { data } = await httpClient.get('/auth/profile')
          if (data?.success && data?.profile) {
            setUser(data.profile)
            setIsAuthenticated(true)
            scheduleTokenRefreshRef.current?.(token)
          } else {
            tokenService.clearAllTokens()
          }
        } catch {
          tokenService.clearAllTokens()
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])  // Empty dependency - only run once on mount

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return { success: false, message: 'Not authenticated' }
    }
    try {
      const { data } = await httpClient.get('/auth/profile')
      if (data?.success && data?.profile) {
        setUser(data.profile)
        setIsAuthenticated(true)
        return { success: true, profile: data.profile }
      }
      return { success: false, message: data?.message || 'Failed to refresh profile' }
    } catch (error) {
      return { success: false, message: error?.response?.data?.message || 'Failed to refresh profile' }
    }
  }, [])

  useEffect(() => {
    setLogoutCallback(logout)
  }, [logout])

  useInactivityTimer(securityConfig.inactivity.timeoutMinutes, logout, isAuthenticated)

  // Note: Removed beforeunload handler that was clearing tokens on page refresh
  // Tokens should only be cleared on explicit logout, not on page close/refresh

  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key === 'logout-event') {
        tokenService.clearAllTokens()
        cleanupPayPalSession()
        if (refreshTimer) {
          clearTimeout(refreshTimer)
          setRefreshTimer(null)
        }
        setUser(null)
        setIsAuthenticated(false)
      }

      if (event.key === 'accessToken' && !event.newValue && isAuthenticated) {
        logout()
      }
    }

    window.addEventListener('storage', syncLogout)
    return () => {
      window.removeEventListener('storage', syncLogout)
    }
  }, [isAuthenticated, logout, refreshTimer])

  const login = useCallback(
    async (email, password) => {
      const { data } = await httpClient.post('/auth/login', { email, password })
      if (data?.success && data?.token) {
        tokenService.setAccessToken(data.token)
        if (data.refreshToken) {
          tokenService.setRefreshToken(data.refreshToken)
        }
        setUser(data.user)
        setIsAuthenticated(true)
        scheduleTokenRefresh(data.token)
      }
      return data
    },
    [scheduleTokenRefresh]
  )

  const register = useCallback(
    async (userData) => {
      const { data } = await httpClient.post('/auth/register', userData)
      if (data?.success && data?.token) {
        tokenService.setAccessToken(data.token)
        if (data.refreshToken) {
          tokenService.setRefreshToken(data.refreshToken)
        }
        setUser(data.user)
        setIsAuthenticated(true)
        scheduleTokenRefresh(data.token)
      }
      return data
    },
    [scheduleTokenRefresh]
  )

  const forgotPassword = useCallback(async (email) => {
    const { data } = await httpClient.post('/auth/forgot-password', { email })
    return data
  }, [])

  const resetPassword = useCallback(async (token, newPassword) => {
    const { data } = await httpClient.post('/auth/reset-password', { token, newPassword })
    return data
  }, [])

  const verifyEmail = useCallback(async (token) => {
    const { data } = await httpClient.get('/auth/verify-email', { params: { token } })
    return data
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    refreshProfile,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import httpClient, { setLogoutCallback } from '../services/httpClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const { data } = await httpClient.get('/auth/profile')
          if (data?.success && data?.profile) {
            setUser(data.profile)
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem('accessToken')
          }
        } catch {
          localStorage.removeItem('accessToken')
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

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

  const login = useCallback(async (email, password) => {
    const { data } = await httpClient.post('/auth/login', { email, password })
    if (data?.success && data?.token) {
      localStorage.setItem('accessToken', data.token)
      setUser(data.user)
      setIsAuthenticated(true)
    }
    return data
  }, [])

  const register = useCallback(async (userData) => {
    const { data } = await httpClient.post('/auth/register', userData)
    if (data?.success && data?.token) {
      localStorage.setItem('accessToken', data.token)
      setUser(data.user)
      setIsAuthenticated(true)
    }
    return data
  }, [])

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

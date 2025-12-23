import axios from 'axios'
import * as tokenService from './tokenService'

const DEFAULT_API_ROOT = 'http://localhost:5000'

const resolveEnvBaseUrl = () => {
  const processBaseUrl =
    typeof process !== 'undefined' ? process.env?.REACT_APP_API_BASE_URL : undefined
  const viteBaseUrl =
    typeof import.meta !== 'undefined' ? import.meta?.env?.VITE_API_BASE_URL : undefined
  return processBaseUrl || viteBaseUrl || DEFAULT_API_ROOT
}

const resolveApiBaseUrl = () => {
  const root = resolveEnvBaseUrl()
  const trimmedRoot = root.replace(/\/+$/, '')
  return `${trimmedRoot}/api`
}

let logoutCallback = null

export const setLogoutCallback = (callback) => {
  logoutCallback = callback
}

const httpClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

let isRefreshing = false
let failedQueue = []

// Endpoints that don't require authentication skipping token refresh for these
const publicEndpoints = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
]

const isPublicEndpoint = (url) => {
  return publicEndpoints.some((endpoint) => url?.includes(endpoint))
}

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const refreshAccessToken = async () => {
  const refreshToken = tokenService.getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const { data } = await httpClient.post('/auth/refresh', { refreshToken })
  if (data?.success && data?.token) {
    tokenService.setAccessToken(data.token)
    if (data.refreshToken) {
      tokenService.setRefreshToken(data.refreshToken)
    }
    return data.token
  }

  throw new Error('Token refresh failed')
}

httpClient.interceptors.request.use(
  async (config) => {
    // Skipping token handling for public endpoints
    if (isPublicEndpoint(config.url)) {
      return config
    }

    const token = tokenService.getAccessToken()

    if (!token) {
      return config
    }

    if (tokenService.isTokenExpired(token)) {
      if (!isRefreshing) {
        isRefreshing = true

        try {
          const newToken = await refreshAccessToken()
          processQueue(null, newToken)
          config.headers.Authorization = `Bearer ${newToken}`
        } catch (err) {
          processQueue(err, null)
          if (logoutCallback) {
            logoutCallback()
          }
          return Promise.reject(err)
        } finally {
          isRefreshing = false
        }
      } else {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          config.headers.Authorization = `Bearer ${token}`
          return config
        })
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return httpClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return httpClient(originalRequest)
      } catch (err) {
        processQueue(err, null)
        if (logoutCallback) {
          logoutCallback()
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default httpClient


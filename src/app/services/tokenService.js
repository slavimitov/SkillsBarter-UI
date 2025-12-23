export const decodeToken = (token) => {
  if (!token || typeof token !== 'string') {
    return null
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

export const getTokenExpiryTime = (token) => {
  const decoded = decodeToken(token)
  return decoded?.exp || null
}

export const isTokenExpired = (token, bufferSeconds = 60) => {
  const expiryTime = getTokenExpiryTime(token)
  if (!expiryTime) {
    return true
  }

  const now = Math.floor(Date.now() / 1000)
  const expiryWithBuffer = expiryTime - bufferSeconds

  return now >= expiryWithBuffer
}

export const shouldRefreshToken = (token, thresholdMinutes = 5) => {
  const expiryTime = getTokenExpiryTime(token)
  if (!expiryTime) {
    return false
  }

  const now = Math.floor(Date.now() / 1000)
  const thresholdSeconds = thresholdMinutes * 60
  const refreshThreshold = expiryTime - thresholdSeconds

  return now >= refreshThreshold && now < expiryTime
}

export const getAccessToken = () => {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem('accessToken')
}

export const setAccessToken = (token) => {
  if (typeof window === 'undefined') {
    return
  }
  if (token) {
    window.localStorage.setItem('accessToken', token)
  } else {
    window.localStorage.removeItem('accessToken')
  }
}

export const getRefreshToken = () => {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem('refreshToken')
}

export const setRefreshToken = (token) => {
  if (typeof window === 'undefined') {
    return
  }
  if (token) {
    window.localStorage.setItem('refreshToken', token)
  } else {
    window.localStorage.removeItem('refreshToken')
  }
}

export const clearAllTokens = () => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem('accessToken')
  window.localStorage.removeItem('refreshToken')
}

export const getTokenInfo = (token) => {
  const decoded = decodeToken(token)
  const expiryTime = getTokenExpiryTime(token)
  const now = Math.floor(Date.now() / 1000)

  return {
    valid: decoded !== null,
    expired: isTokenExpired(token),
    expiryTime,
    expiryDate: expiryTime ? new Date(expiryTime * 1000).toISOString() : null,
    timeUntilExpiry: expiryTime ? expiryTime - now : null,
    shouldRefresh: shouldRefreshToken(token),
    payload: decoded,
  }
}

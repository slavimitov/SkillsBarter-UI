export const securityConfig = {
  inactivity: {
    timeoutMinutes:
      parseInt(import.meta?.env?.VITE_INACTIVITY_TIMEOUT_MINUTES) || 30,
    premiumTimeoutMinutes: 60,
  },
  tokenRefresh: {
    bufferSeconds:
      parseInt(import.meta?.env?.VITE_TOKEN_REFRESH_BUFFER_SECONDS) || 300,
    expirationBuffer: 60,
  },
  windowClose: {
    invalidateOnClose: true,
    useBeacon: true,
  },
  paypal: {
    clearTokensOnPaymentFailure: true,
    securityErrorCodes: [
      'AUTHENTICATION_FAILURE',
      'AUTHORIZATION_ERROR',
      'TOKEN_EXPIRED',
    ],
  },
}

export default securityConfig

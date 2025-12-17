const PAYPAL_SCRIPT_ID = 'paypal-sdk'
let paypalPromise = null

const buildSdkUrl = ({ clientId, components = 'buttons', vault = true, intent = 'subscription', currency = 'USD' }) => {
  const params = new URLSearchParams({
    'client-id': clientId,
    components,
    vault: vault ? 'true' : 'false',
    intent,
    currency,
  })
  return `https://www.paypal.com/sdk/js?${params.toString()}`
}

export const loadPayPalSdk = ({
  clientId,
  components = 'buttons',
  vault = true,
  intent = 'subscription',
  currency = 'USD',
} = {}) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('PayPal SDK can only load in the browser'))
  }

  if (!clientId) {
    return Promise.reject(new Error('PayPal clientId is required'))
  }

  if (paypalPromise) {
    return paypalPromise
  }

  paypalPromise = new Promise((resolve, reject) => {
    const fail = (message) => {
      const existing = typeof document !== 'undefined' && document.getElementById(PAYPAL_SCRIPT_ID)
      if (existing) {
        existing.remove()
      }
      paypalPromise = null
      reject(new Error(message))
    }

    if (window.paypal) {
      resolve(window.paypal)
      return
    }

    const existingScript = document.getElementById(PAYPAL_SCRIPT_ID)
    if (existingScript) {
      const checkPayPal = () => {
        if (window.paypal) {
          resolve(window.paypal)
        } else {
          fail('PayPal SDK failed to load')
        }
      }
      existingScript.addEventListener('load', checkPayPal)
      existingScript.addEventListener('error', () => fail('Failed to load PayPal SDK'))
      
      if (existingScript.readyState === 'complete' || existingScript.readyState === 'loaded') {
        checkPayPal()
      }
      return
    }

    const script = document.createElement('script')
    script.id = PAYPAL_SCRIPT_ID
    script.src = buildSdkUrl({ clientId, components, vault, intent, currency })
    script.type = 'text/javascript'
    script.async = true
    script.onload = () => {
      if (window.paypal) {
        resolve(window.paypal)
      } else {
        fail('PayPal SDK failed to load')
      }
    }
    script.onerror = () => fail('Failed to load PayPal SDK')
    document.body.appendChild(script)
  })

  return paypalPromise
}

export const resetPayPalLoader = () => {
  const existingScript = typeof document !== 'undefined' && document.getElementById(PAYPAL_SCRIPT_ID)
  if (existingScript) {
    existingScript.remove()
  }
  paypalPromise = null
}

export default loadPayPalSdk

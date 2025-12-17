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
    const existingScript = document.getElementById(PAYPAL_SCRIPT_ID)
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.paypal) {
          resolve(window.paypal)
        } else {
          reject(new Error('PayPal SDK failed to load'))
        }
      })
      existingScript.addEventListener('error', () => reject(new Error('Failed to load PayPal SDK')))
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
        reject(new Error('PayPal SDK failed to load'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'))
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

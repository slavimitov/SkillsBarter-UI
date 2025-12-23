import { useEffect, useRef, useCallback } from 'react'

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']

export const useInactivityTimer = (timeoutMinutes, onTimeout, isEnabled = true) => {
  const timeoutRef = useRef(null)
  const lastActivityRef = useRef(Date.now())

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now()

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (isEnabled && onTimeout) {
      timeoutRef.current = setTimeout(() => {
        onTimeout()
      }, timeoutMinutes * 60 * 1000)
    }
  }, [timeoutMinutes, onTimeout, isEnabled])

  const handleActivity = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  useEffect(() => {
    if (!isEnabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    resetTimer()

    const debouncedHandleActivity = debounce(handleActivity, 500)

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, debouncedHandleActivity, { passive: true })
    })

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, debouncedHandleActivity)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isEnabled, resetTimer, handleActivity])

  return {
    resetTimer,
    getLastActivity: () => lastActivityRef.current,
  }
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default useInactivityTimer

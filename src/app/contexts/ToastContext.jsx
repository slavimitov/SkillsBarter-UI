import React, { createContext, useContext, useState, useCallback } from 'react'
import { CToast, CToastBody, CToastHeader, CToaster } from '@coreui/react'

const ToastContext = createContext(null)

let toastId = 0

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, options = {}) => {
    const {
      title = 'Notification',
      color = 'primary',
      autohide = true,
      delay = 5000,
    } = options

    const id = ++toastId

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        title,
        color,
        autohide,
        delay,
      },
    ])

    if (autohide) {
      setTimeout(() => {
        removeToast(id)
      }, delay)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showSuccess = useCallback(
    (message, title = 'Success') => {
      return addToast(message, { title, color: 'success' })
    },
    [addToast]
  )

  const showError = useCallback(
    (message, title = 'Error') => {
      return addToast(message, { title, color: 'danger', delay: 7000 })
    },
    [addToast]
  )

  const showWarning = useCallback(
    (message, title = 'Warning') => {
      return addToast(message, { title, color: 'warning' })
    },
    [addToast]
  )

  const showInfo = useCallback(
    (message, title = 'Info') => {
      return addToast(message, { title, color: 'info' })
    },
    [addToast]
  )

  const value = {
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <CToaster
        className="p-3"
        placement="top-end"
        style={{ zIndex: 9999 }}
      >
        {toasts.map((toast) => (
          <CToast
            key={toast.id}
            visible={true}
            color={toast.color}
            className="text-white align-items-center"
            onClose={() => removeToast(toast.id)}
          >
            <CToastHeader closeButton className={`text-${toast.color}`}>
              <strong className="me-auto">{toast.title}</strong>
            </CToastHeader>
            <CToastBody>{toast.message}</CToastBody>
          </CToast>
        ))}
      </CToaster>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default ToastContext

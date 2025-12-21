import React from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
} from '@coreui/react'

/**
 * Reusable confirmation modal component
 * 
 * @param {boolean} visible - Whether the modal is visible
 * @param {function} onClose - Called when modal is closed/cancelled
 * @param {function} onConfirm - Called when user confirms the action
 * @param {string} title - Modal title (default: "Confirm Action")
 * @param {string|React.ReactNode} message - Modal body message
 * @param {string} confirmText - Text for confirm button (default: "Confirm")
 * @param {string} cancelText - Text for cancel button (default: "Cancel")
 * @param {string} confirmColor - Color for confirm button (default: "danger")
 * @param {boolean} loading - Shows spinner on confirm button when true
 */
const ConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'danger',
  loading = false,
}) => {
  return (
    <CModal visible={visible} onClose={onClose} className="fade-in">
      <CModalHeader>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>{message}</CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose} disabled={loading} className="ripple">
          {cancelText}
        </CButton>
        <CButton color={confirmColor} onClick={onConfirm} disabled={loading} className="ripple">
          {loading ? <CSpinner size="sm" className="spinner-gradient" /> : confirmText}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ConfirmModal

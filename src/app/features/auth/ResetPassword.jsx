import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormFeedback,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked } from '@coreui/icons'

import { useAuth } from '../../contexts/AuthContext'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverMessage, setServerMessage] = useState('')
  const [serverErrors, setServerErrors] = useState([])
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { resetPassword } = useAuth()

  const validate = () => {
    const currentErrors = {}
    if (!password) {
      currentErrors.password = 'Password is required.'
    } else if (password.length < 8) {
      currentErrors.password = 'Password must be at least 8 characters.'
    }
    if (!confirmPassword) {
      currentErrors.confirmPassword = 'Please confirm your password.'
    } else if (confirmPassword !== password) {
      currentErrors.confirmPassword = 'Passwords do not match.'
    }
    return currentErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerMessage('')
    setServerErrors([])
    setIsSuccess(false)

    if (!token) {
      setServerMessage('Invalid or missing reset token.')
      return
    }

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    try {
      setIsSubmitting(true)
      const data = await resetPassword(token, password)
      if (data?.success) {
        setIsSuccess(true)
        setServerMessage(data.message || 'Password has been reset successfully.')
      } else {
        setServerMessage(data?.message || 'Unable to reset your password.')
        setServerErrors(data?.errors || [])
      }
    } catch (error) {
      setServerMessage(error?.response?.data?.message || 'Unable to reset your password.')
      setServerErrors(error?.response?.data?.errors || [])
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="bg-body-tertiary min-vh-100 d-flex align-items-center">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={9} lg={7} xl={6}>
              <CCardGroup>
                <CCard className="shadow-sm border-0">
                  <CCardBody className="p-4">
                    <h1>Invalid Link</h1>
                    <CAlert color="danger" className="mb-4">
                      The password reset link is invalid or has expired.
                    </CAlert>
                    <div className="text-center">
                      <Link to="/forgot-password" className="text-decoration-none">
                        Request a new reset link
                      </Link>
                    </div>
                  </CCardBody>
                </CCard>
              </CCardGroup>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    )
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCardGroup>
              <CCard className="shadow-sm border-0">
                <CCardBody className="p-4">
                  <h1>Reset Password</h1>
                  <p className="text-body-secondary mb-4">
                    Enter your new password below.
                  </p>
                  {serverMessage && (
                    <CAlert color={isSuccess ? 'success' : 'danger'} className="mb-4">
                      <span>{serverMessage}</span>
                      {serverErrors.length > 0 && (
                        <ul className="mb-0 mt-2 ps-3">
                          {serverErrors.map((err, idx) => (
                            <li key={`${err}-${idx}`}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </CAlert>
                  )}
                  {!isSuccess ? (
                    <CForm onSubmit={handleSubmit} noValidate>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type="password"
                          name="password"
                          placeholder="New password (min 8 characters)"
                          autoComplete="new-password"
                          value={password}
                          invalid={Boolean(errors.password)}
                          onChange={(event) => setPassword(event.target.value)}
                          minLength={8}
                        />
                        <CFormFeedback invalid>{errors.password}</CFormFeedback>
                      </CInputGroup>
                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          value={confirmPassword}
                          invalid={Boolean(errors.confirmPassword)}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                        />
                        <CFormFeedback invalid>{errors.confirmPassword}</CFormFeedback>
                      </CInputGroup>
                      <div className="d-grid">
                        <CButton color="primary" type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <CSpinner size="sm" className="me-2" />
                              Resetting...
                            </>
                          ) : (
                            'Reset Password'
                          )}
                        </CButton>
                      </div>
                    </CForm>
                  ) : (
                    <div className="text-center">
                      <Link to="/login" className="btn btn-primary">
                        Sign In
                      </Link>
                    </div>
                  )}
                  {!isSuccess && (
                    <>
                      <hr className="my-4" />
                      <div className="text-center">
                        <Link to="/login" className="text-decoration-none">
                          Back to Sign In
                        </Link>
                      </div>
                    </>
                  )}
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ResetPassword

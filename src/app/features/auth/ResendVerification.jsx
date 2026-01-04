import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { cilAt } from '@coreui/icons'

import httpClient from '../../services/httpClient'

const ResendVerification = () => {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [serverMessage, setServerMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const currentErrors = {}
    if (!email.trim()) {
      currentErrors.email = 'Email is required.'
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      currentErrors.email = 'Enter a valid email address.'
    }
    return currentErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerMessage('')
    setIsSuccess(false)

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    try {
      setIsSubmitting(true)
      const { data } = await httpClient.post('/auth/resend-verification', { email: email.trim() })
      setIsSuccess(true)
      setServerMessage(data?.message || 'If an account with that email exists, a verification link has been sent.')
    } catch (error) {
      setServerMessage(error?.response?.data?.message || 'Unable to process your request right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCardGroup>
              <CCard className="shadow-sm border-0">
                <CCardBody className="p-4">
                  <h1>Resend Verification Email</h1>
                  <p className="text-body-secondary mb-4">
                    Enter your email address and we&apos;ll send you a new verification link.
                  </p>
                  {serverMessage && (
                    <CAlert color={isSuccess ? 'success' : 'danger'} className="mb-4">
                      {serverMessage}
                    </CAlert>
                  )}
                  {!isSuccess && (
                    <CForm onSubmit={handleSubmit} noValidate>
                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilAt} />
                        </CInputGroupText>
                        <CFormInput
                          type="email"
                          name="email"
                          placeholder="Email"
                          autoComplete="email"
                          value={email}
                          invalid={Boolean(errors.email)}
                          onChange={(event) => setEmail(event.target.value)}
                        />
                        <CFormFeedback invalid>{errors.email}</CFormFeedback>
                      </CInputGroup>
                      <div className="d-grid">
                        <CButton color="primary" type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <CSpinner size="sm" className="me-2" />
                              Sending...
                            </>
                          ) : (
                            'Send Verification Link'
                          )}
                        </CButton>
                      </div>
                    </CForm>
                  )}
                  <hr className="my-4" />
                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none">
                      Back to Sign In
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

export default ResendVerification

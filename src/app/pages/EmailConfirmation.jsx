import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CCard, CCardBody, CCardTitle, CAlert, CSpinner, CButton, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckAlt, cilX } from '@coreui/icons'
import { httpClient } from '../services/httpClient'

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')

  const token = searchParams.get('token')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('No verification token provided. Please check your email link.')
        return
      }

      try {
        // Call backend to verify the token
        const response = await httpClient.post('/auth/verify-email', { token })

        if (response.status === 200) {
          setStatus('success')
          setMessage(
            'Your email has been verified successfully! You can now log in to your account.',
          )
        }
      } catch (error) {
        setStatus('error')
        setMessage(
          error.response?.data?.message ||
            'Email verification failed. The link may have expired or is invalid.',
        )
      }
    }

    verifyEmail()
  }, [token])

  return (
    <CRow className="justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <CCol md={6}>
        <CCard className="shadow-lg">
          <CCardBody className="text-center p-5">
            {status === 'loading' && (
              <>
                <CSpinner color="primary" variant="grow" className="mb-3" />
                <CCardTitle className="mb-3">Verifying Your Email</CCardTitle>
                <p className="text-muted">Please wait while we confirm your email address...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mb-3">
                  <CIcon icon={cilCheckAlt} size="3xl" className="text-success" />
                </div>
                <CCardTitle className="mb-3">Email Verified!</CCardTitle>
                <CAlert color="success" className="mb-4">
                  {message}
                </CAlert>
                <CButton color="primary" onClick={() => navigate('/login')}>
                  Go to Login
                </CButton>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mb-3">
                  <CIcon icon={cilX} size="3xl" className="text-danger" />
                </div>
                <CCardTitle className="mb-3">Verification Failed</CCardTitle>
                <CAlert color="danger" className="mb-4">
                  {message}
                </CAlert>
                <div className="d-flex gap-2 justify-content-center">
                  <CButton color="primary" onClick={() => navigate('/register')}>
                    Back to Register
                  </CButton>
                  <CButton color="secondary" onClick={() => navigate('/')}>
                    Home
                  </CButton>
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default EmailConfirmation

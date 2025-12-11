import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CAlert,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CRow,
  CSpinner,
} from '@coreui/react'

import { useAuth } from '../../contexts/AuthContext'

const EmailVerification = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const { verifyEmail } = useAuth()

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setIsLoading(false)
        setMessage('Invalid or missing verification token.')
        return
      }

      try {
        const data = await verifyEmail(token)
        if (data?.success) {
          setIsSuccess(true)
          setMessage(data.message || 'Email verified successfully!')
        } else {
          setMessage(data?.message || 'Unable to verify email.')
        }
      } catch (error) {
        setMessage(error?.response?.data?.message || 'Unable to verify email.')
      } finally {
        setIsLoading(false)
      }
    }

    verify()
  }, [token, verifyEmail])

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCardGroup>
              <CCard className="shadow-sm border-0">
                <CCardBody className="p-4 text-center">
                  <h1>Email Verification</h1>
                  {isLoading ? (
                    <div className="py-5">
                      <CSpinner color="primary" />
                      <p className="mt-3 text-body-secondary">Verifying your email...</p>
                    </div>
                  ) : (
                    <>
                      <CAlert color={isSuccess ? 'success' : 'danger'} className="my-4">
                        {message}
                      </CAlert>
                      <div className="mt-4">
                        <Link to="/login" className="btn btn-primary">
                          {isSuccess ? 'Sign In' : 'Go to Sign In'}
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

export default EmailVerification

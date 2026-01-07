import React, { useState, useEffect } from 'react'
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

import httpClient from '../../services/httpClient'

const ConfirmEmailChange = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        setMessage('Invalid or missing confirmation token.')
        setLoading(false)
        return
      }

      try {
        const response = await httpClient.get('/users/confirm-email-change', {
          params: { token },
        })
        if (response.data?.success) {
          setSuccess(true)
          setMessage(response.data.message || 'Email changed successfully!')
        } else {
          setMessage(response.data?.message || 'Failed to confirm email change.')
        }
      } catch (error) {
        setMessage(
          error?.response?.data?.message ||
            'Failed to confirm email change. The link may have expired.'
        )
      } finally {
        setLoading(false)
      }
    }

    confirmEmail()
  }, [token])

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCardGroup>
              <CCard className="shadow-sm border-0">
                <CCardBody className="p-4">
                  <h1>Email Change Confirmation</h1>
                  {loading ? (
                    <div className="text-center py-4">
                      <CSpinner color="primary" />
                      <p className="mt-3">Confirming your new email address...</p>
                    </div>
                  ) : (
                    <>
                      <CAlert color={success ? 'success' : 'danger'} className="mb-4">
                        {message}
                      </CAlert>
                      <div className="text-center">
                        <Link to="/login" className="btn btn-primary">
                          {success ? 'Sign In with New Email' : 'Back to Sign In'}
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

export default ConfirmEmailChange

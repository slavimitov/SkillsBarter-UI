import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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

const OAuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const success = searchParams.get('success')
    const errorMessage = searchParams.get('error')

    if (errorMessage) {
      setError(errorMessage)
      return
    }

    if (success === 'true' && token) {
      localStorage.setItem('accessToken', token)
      navigate('/', { replace: true })
      return
    }

    if (!token) {
      setError('Authentication failed. No token received.')
    }
  }, [searchParams, navigate])

  if (error) {
    return (
      <div className="bg-body-tertiary min-vh-100 d-flex align-items-center">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={9} lg={7} xl={6}>
              <CCardGroup>
                <CCard className="shadow-sm border-0">
                  <CCardBody className="p-4 text-center">
                    <h1>Authentication Failed</h1>
                    <CAlert color="danger" className="my-4">
                      {error}
                    </CAlert>
                    <a href="/login" className="btn btn-primary">
                      Back to Sign In
                    </a>
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
                <CCardBody className="p-4 text-center">
                  <CSpinner color="primary" />
                  <p className="mt-3 text-body-secondary">Completing sign in...</p>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default OAuthCallback

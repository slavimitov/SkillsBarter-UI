import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilAt, cilLockLocked } from '@coreui/icons'

import httpClient from '../../services/httpClient'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const currentErrors = {}
    if (!email.trim()) {
      currentErrors.email = 'Email is required.'
    }
    if (!password) {
      currentErrors.password = 'Password is required.'
    }
    return currentErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    try {
      setIsSubmitting(true)
      const { data } = await httpClient.post('/auth/login', {
        email: email.trim(),
        password,
      })

      if (data?.success && data?.token && typeof window !== 'undefined') {
        window.localStorage.setItem('accessToken', data.token)
        // TODO: centralize auth persistence & redirect logic
        navigate('/')
        return
      }

      setServerError(data?.message || 'Unable to sign you in right now.')
    } catch (error) {
      setServerError(error?.response?.data?.message || 'Unable to sign you in right now.')
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
                  <h1>Welcome back</h1>
                  <p className="text-body-secondary mb-4">
                    Sign in to continue collaborating on Skills Barter.
                  </p>
                  {serverError && (
                    <CAlert color="danger" className="mb-4">
                      {serverError}
                    </CAlert>
                  )}
                  <CForm onSubmit={handleSubmit} noValidate>
                    <CInputGroup className="mb-3">
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
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        name="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        invalid={Boolean(errors.password)}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                      <CFormFeedback invalid>{errors.password}</CFormFeedback>
                    </CInputGroup>
                    <div className="d-grid">
                      <CButton color="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                      </CButton>
                    </div>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login


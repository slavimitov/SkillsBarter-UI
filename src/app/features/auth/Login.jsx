import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
import { cilAt, cilLockLocked, cibGoogle, cibFacebook } from '@coreui/icons'

import httpClient from '../../services/httpClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/login-google`
  }

  const handleFacebookLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/login-facebook`
  }

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

      if (data?.success && data?.token) {
        localStorage.setItem('accessToken', data.token)
        navigate(from, { replace: true })
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
                    <div className="d-grid mb-3">
                      <CButton color="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </CButton>
                    </div>
                    <div className="text-center">
                      <Link to="/forgot-password" className="text-decoration-none">
                        Forgot your password?
                      </Link>
                    </div>
                  </CForm>
                  <div className="position-relative my-4">
                    <hr />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-body-secondary">
                      or continue with
                    </span>
                  </div>
                  <div className="d-grid gap-2">
                    <CButton
                      color="light"
                      className="border"
                      onClick={handleGoogleLogin}
                    >
                      <CIcon icon={cibGoogle} className="me-2" />
                      Sign in with Google
                    </CButton>
                    <CButton
                      color="light"
                      className="border"
                      onClick={handleFacebookLogin}
                    >
                      <CIcon icon={cibFacebook} className="me-2 text-primary" />
                      Sign in with Facebook
                    </CButton>
                  </div>
                  <hr className="my-4" />
                  <div className="text-center">
                    <span className="text-body-secondary">Don&apos;t have an account? </span>
                    <Link to="/register" className="text-decoration-none">
                      Create one
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

export default Login


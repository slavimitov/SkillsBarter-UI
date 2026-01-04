import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilAt, cilDescription, cilLockLocked, cilUser, cibGoogle } from '@coreui/icons'

import { useAuth } from '../../contexts/AuthContext'
import httpClient from '../../services/httpClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const initialValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  description: '',
}

const Register = () => {
  const [searchParams] = useSearchParams()
  const oauthMode = searchParams.get('oauth') === '1'
  const [formValues, setFormValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [serverMessage, setServerMessage] = useState('')
  const [serverErrors, setServerErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()
  const { register, isAuthenticated, loading, refreshProfile } = useAuth()

  const handleGoogleRegister = () => {
    window.location.href = `${API_BASE_URL}/api/auth/login-google`
  }

  useEffect(() => {
    const hydrateOAuthUser = async () => {
      if (!oauthMode) return

      if (!loading && !isAuthenticated) {
        navigate('/login', { replace: true })
        return
      }

      // Wait for auth context to finish its initial load to avoid double calls
      if (loading) return

      try {
        const { data } = await httpClient.get('/auth/profile')
        if (data?.success && data?.profile) {
          setFormValues((prev) => ({
            ...prev,
            name: data.profile?.name || prev.name,
            email: data.profile?.email || prev.email,
          }))
        }
      } catch {
        // If profile fetch fails, force user back to login
        navigate('/login', { replace: true })
      }
    }

    hydrateOAuthUser()
  }, [oauthMode, loading, isAuthenticated, navigate])

  const trimmedValues = useMemo(
    () => ({
      name: formValues.name.trim(),
      email: formValues.email.trim(),
      description: formValues.description.trim(),
    }),
    [formValues.name, formValues.email, formValues.description],
  )

  const validate = () => {
    const validationErrors = {}
    if (oauthMode) {
      if (!trimmedValues.description) {
        validationErrors.description = 'Description is required.'
      }
      return validationErrors
    }

    if (!trimmedValues.name) {
      validationErrors.name = 'Name is required.'
    }

    if (!trimmedValues.email) {
      validationErrors.email = 'Email is required.'
    } else if (!/^\S+@\S+\.\S+$/.test(trimmedValues.email)) {
      validationErrors.email = 'Enter a valid email address.'
    }

    if (!formValues.password) {
      validationErrors.password = 'Password is required.'
    } else if (formValues.password.length < 8) {
      validationErrors.password = 'Password must be at least 8 characters.'
    }

    if (!formValues.confirmPassword) {
      validationErrors.confirmPassword = 'Please confirm your password.'
    } else if (formValues.confirmPassword !== formValues.password) {
      validationErrors.confirmPassword = 'Passwords do not match.'
    }

    return validationErrors
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setServerMessage('')
    setServerErrors([])
    setSuccessMessage('')

    try {
      setIsSubmitting(true)
      if (oauthMode) {
        const { data } = await httpClient.put('/users/profile', {
          description: trimmedValues.description,
        })

        if (data?.success) {
          await refreshProfile()
          setSuccessMessage(data?.message || 'Registration completed successfully!')
          setTimeout(() => navigate('/'), 1200)
          return
        }

        setServerMessage(data?.message || 'Unable to complete registration.')
        return
      }

      const payload = {
        name: trimmedValues.name,
        email: trimmedValues.email,
        password: formValues.password,
        confirmPassword: formValues.confirmPassword,
        description: trimmedValues.description || null,
      }

      const data = await register(payload)
      if (data?.success) {
        setSuccessMessage(data.message || 'Registration successful! Please check your email to verify your account.')
        setTimeout(() => navigate('/login'), 3000)
        return
      }

      setServerMessage(data?.message || 'Unable to create your account.')
      setServerErrors(data?.errors || [])
    } catch (error) {
      const responseMessage = error?.response?.data?.message
      const responseErrors = error?.response?.data?.errors
      setServerMessage(responseMessage || (oauthMode ? 'Unable to complete registration.' : 'Unable to create your account.'))
      setServerErrors(responseErrors || [])
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
                  <h1>Create Account</h1>
                  <p className="text-body-secondary mb-4">
                    {oauthMode
                      ? 'Welcome! Please add a short description to complete your Google registration.'
                      : 'Join Skills Barter by sharing a few details below.'}
                  </p>
                  {!oauthMode && (
                    <>
                      <div className="d-grid gap-2 mb-4">
                        <CButton color="light" className="border" onClick={handleGoogleRegister}>
                          <CIcon icon={cibGoogle} className="me-2" />
                          Sign up with Google
                        </CButton>
                      </div>
                      <div className="position-relative my-4">
                        <hr />
                        <span className="position-absolute top-50 start-50 translate-middle bg-body px-3 text-body-secondary">
                          or sign up with email
                        </span>
                      </div>
                    </>
                  )}
                  {successMessage && (
                    <CAlert color="success" className="mb-4">
                      {successMessage}
                    </CAlert>
                  )}
                  {serverMessage && (
                    <CAlert color="danger" className="mb-4">
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
                  <CForm onSubmit={handleSubmit} noValidate>
                    {oauthMode && (
                      <>
                        <CInputGroup className="mb-3">
                          <CInputGroupText>
                            <CIcon icon={cilUser} />
                          </CInputGroupText>
                          <CFormInput name="name" placeholder="Name" value={formValues.name} disabled readOnly />
                        </CInputGroup>

                        <CInputGroup className="mb-3">
                          <CInputGroupText>
                            <CIcon icon={cilAt} />
                          </CInputGroupText>
                          <CFormInput
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formValues.email}
                            disabled
                            readOnly
                          />
                        </CInputGroup>
                      </>
                    )}

                    {!oauthMode && (
                      <>
                        <CInputGroup className="mb-3">
                          <CInputGroupText>
                            <CIcon icon={cilUser} />
                          </CInputGroupText>
                          <CFormInput
                            name="name"
                            placeholder="Name"
                            autoComplete="name"
                            value={formValues.name}
                            onChange={handleChange}
                            invalid={Boolean(errors.name)}
                          />
                          <CFormFeedback invalid>{errors.name}</CFormFeedback>
                        </CInputGroup>

                        <CInputGroup className="mb-3">
                          <CInputGroupText>
                            <CIcon icon={cilAt} />
                          </CInputGroupText>
                          <CFormInput
                            type="email"
                            name="email"
                            placeholder="Email"
                            autoComplete="email"
                            value={formValues.email}
                            onChange={handleChange}
                            invalid={Boolean(errors.email)}
                          />
                          <CFormFeedback invalid>{errors.email}</CFormFeedback>
                        </CInputGroup>

                        <CInputGroup className="mb-3">
                          <CInputGroupText>
                            <CIcon icon={cilLockLocked} />
                          </CInputGroupText>
                          <CFormInput
                            type="password"
                            name="password"
                            placeholder="Password (min 8 characters)"
                            autoComplete="new-password"
                            value={formValues.password}
                            onChange={handleChange}
                            invalid={Boolean(errors.password)}
                            minLength={8}
                          />
                          <CFormFeedback invalid>{errors.password}</CFormFeedback>
                        </CInputGroup>

                        <CInputGroup className="mb-3">
                          <CInputGroupText>
                            <CIcon icon={cilLockLocked} />
                          </CInputGroupText>
                          <CFormInput
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm password"
                            autoComplete="new-password"
                            value={formValues.confirmPassword}
                            onChange={handleChange}
                            invalid={Boolean(errors.confirmPassword)}
                          />
                          <CFormFeedback invalid>{errors.confirmPassword}</CFormFeedback>
                        </CInputGroup>
                      </>
                    )}

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilDescription} />
                      </CInputGroupText>
                      <CFormTextarea
                        name="description"
                        placeholder={oauthMode ? 'Tell others about your skills (required)' : 'Tell others about your skills (optional)'}
                        value={formValues.description}
                        onChange={handleChange}
                        rows={3}
                        invalid={Boolean(errors.description)}
                      />
                      {oauthMode && <CFormFeedback invalid>{errors.description}</CFormFeedback>}
                    </CInputGroup>

                    <div className="d-grid">
                      <CButton type="submit" color="primary" disabled={isSubmitting || successMessage}>
                        {isSubmitting ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            {oauthMode ? 'Completing registration...' : 'Creating account...'}
                          </>
                        ) : (
                          oauthMode ? 'Complete Registration' : 'Create Account'
                        )}
                      </CButton>
                    </div>
                  </CForm>
                  <hr className="my-4" />
                  <div className="text-center">
                    <span className="text-body-secondary">Already have an account? </span>
                    <Link to="/login" className="text-decoration-none">
                      Sign in
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

export default Register


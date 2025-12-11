import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { cilAt, cilDescription, cilLockLocked, cilUser } from '@coreui/icons'

import { useAuth } from '../../contexts/AuthContext'

const initialValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  description: '',
}

const Register = () => {
  const [formValues, setFormValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [serverMessage, setServerMessage] = useState('')
  const [serverErrors, setServerErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()
  const { register } = useAuth()

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

    const payload = {
      name: trimmedValues.name,
      email: trimmedValues.email,
      password: formValues.password,
      confirmPassword: formValues.confirmPassword,
      description: trimmedValues.description || null,
    }

    try {
      setIsSubmitting(true)
      const data = await register(payload)
      if (data?.success) {
        setSuccessMessage(data.message || 'Account created successfully!')
        setTimeout(() => navigate('/'), 2000)
        return
      }

      setServerMessage(data?.message || 'Unable to create your account.')
      setServerErrors(data?.errors || [])
    } catch (error) {
      const responseMessage = error?.response?.data?.message
      const responseErrors = error?.response?.data?.errors
      setServerMessage(responseMessage || 'Unable to create your account.')
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
                    Join Skills Barter by sharing a few details below.
                  </p>
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

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilDescription} />
                      </CInputGroupText>
                      <CFormTextarea
                        name="description"
                        placeholder="Tell others about your skills (optional)"
                        value={formValues.description}
                        onChange={handleChange}
                        rows={3}
                      />
                    </CInputGroup>

                    <div className="d-grid">
                      <CButton type="submit" color="primary" disabled={isSubmitting || successMessage}>
                        {isSubmitting ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            Creating account...
                          </>
                        ) : (
                          'Create Account'
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


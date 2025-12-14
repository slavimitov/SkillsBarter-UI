import React, { useMemo, useState, useEffect } from 'react'
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
import { cilAt, cilDescription, cilUser } from '@coreui/icons'

import { useAuth } from '../../contexts/AuthContext'

const initialValues = {
  name: '',
  description: '',
}

const OAuthProfileCompletion = () => {
  const [formValues, setFormValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [serverMessage, setServerMessage] = useState('')
  const [serverErrors, setServerErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    if (user) {
      setUserEmail(user.email || '')
      setFormValues(prev => ({
        ...prev,
        name: user.name || ''
      }))
    }
  }, [user])

  const trimmedValues = useMemo(
    () => ({
      name: formValues.name.trim(),
      description: formValues.description.trim(),
    }),
    [formValues.name, formValues.description],
  )

  const validate = () => {
    const validationErrors = {}
    if (!trimmedValues.name) {
      validationErrors.name = 'Name is required.'
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

    setSuccessMessage('Profile setup complete! Welcome to Skills Barter.')
    setTimeout(() => navigate('/'), 2000)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCardGroup>
              <CCard className="shadow-sm border-0">
                <CCardBody className="p-4">
                  <h1>Complete Your Profile</h1>
                  <p className="text-body-secondary mb-4">
                    Welcome! Just a few more details to get started.
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
                        <CIcon icon={cilAt} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={userEmail}
                        disabled
                        readOnly
                      />
                    </CInputGroup>

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

                    <div className="d-grid mb-3">
                      <CButton type="submit" color="primary" disabled={isSubmitting || successMessage}>
                        {isSubmitting ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            Setting up profile...
                          </>
                        ) : (
                          'Complete Setup'
                        )}
                      </CButton>
                    </div>

                    <div className="text-center">
                      <span className="text-body-secondary">Not you? </span>
                      <Link to="#" onClick={handleLogout} className="text-decoration-none">
                        Sign in with different account
                      </Link>
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

export default OAuthProfileCompletion

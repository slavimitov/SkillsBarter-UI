import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { useAuth } from '../contexts/AuthContext'
import httpClient from '../services/httpClient'

const CreateOffer = () => {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillId: '',
  })

  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [skillsLoading, setSkillsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setSkillsLoading(true)
        const response = await httpClient.get('/skills', { params: { pageSize: 100 } })
        const payload = response.data
        const items = Array.isArray(payload) ? payload : payload?.items
        setSkills(Array.isArray(items) ? items : [])
      } catch (err) {
        setError('Failed to load skills. Please try again.')
        console.error('Error fetching skills:', err)
      } finally {
        setSkillsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchSkills()
    }
  }, [isAuthenticated])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!formData.skillId) {
      setError('Please select a skill')
      return
    }

    try {
      setLoading(true)
      const response = await httpClient.post('/offers', {
        title: formData.title,
        description: formData.description || null,
        skillId: parseInt(formData.skillId, 10),
      })

      if (response.data) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/offers')
        }, 1500)
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to create offer. Please try again.'
      setError(errorMessage)
      console.error('Error creating offer:', err)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="text-center">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <CRow>
      <CCol xs={12} md={8} lg={6} className="mx-auto">
        <CCard>
          <CCardHeader>
            <h4 className="mb-0">Create New Offer</h4>
          </CCardHeader>
          <CCardBody>
            {error && (
              <CAlert color="danger" dismissible onClose={() => setError('')}>
                {error}
              </CAlert>
            )}
            {success && (
              <CAlert color="success">
                Offer created successfully! Redirecting to offers page...
              </CAlert>
            )}

            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="title">Title *</CFormLabel>
                <CFormInput
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter offer title"
                  disabled={loading}
                  required
                />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="skillId">Skill *</CFormLabel>
                <CFormSelect
                  id="skillId"
                  name="skillId"
                  value={formData.skillId}
                  onChange={handleChange}
                  disabled={loading || skillsLoading}
                  required
                >
                  <option value="">
                    {skillsLoading ? 'Loading skills...' : 'Select a skill'}
                  </option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                      {skill.categoryLabel ? ` (${skill.categoryLabel})` : ''}
                    </option>
                  ))}
                </CFormSelect>
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="description">Description</CFormLabel>
                <CFormTextarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter offer description (optional)"
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <CButton
                  color="secondary"
                  onClick={() => navigate('/offers')}
                  disabled={loading}
                >
                  Cancel
                </CButton>
                <CButton color="primary" type="submit" disabled={loading || skillsLoading}>
                  {loading ? (
                    <>
                      <CSpinner component="span" size="sm" aria-hidden="true" /> Creating...
                    </>
                  ) : (
                    'Create Offer'
                  )}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CreateOffer

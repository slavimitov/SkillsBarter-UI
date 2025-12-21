import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CButton,
  CCol,
  CContainer,
  CForm,
  CFormFeedback,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CRow,
  CSpinner,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilGift, cilLayers, cilList, cilNotes, cilShortText } from '@coreui/icons'

import httpClient from '../services/httpClient'
import { useToast } from '../contexts/ToastContext'

const normalizeSkill = (skill) => {
  const id = skill?.id ?? skill?.Id
  const name = skill?.name ?? skill?.Name
  const categoryLabel = skill?.categoryLabel ?? skill?.CategoryLabel
  const categoryCode = skill?.categoryCode ?? skill?.CategoryCode
  return {
    id,
    name,
    categoryLabel: categoryLabel || categoryCode || 'Other',
  }
}

const groupSkillsByCategory = (skills = []) => {
  const groups = new Map()
  skills
    .map(normalizeSkill)
    .filter((s) => s.id != null && s.name)
    .forEach((s) => {
      const key = s.categoryLabel || 'Other'
      const next = groups.get(key) || []
      next.push(s)
      groups.set(key, next)
    })

  // Sort categories and skills for consistent UX
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({
      category,
      items: items.sort((x, y) => x.name.localeCompare(y.name)),
    }))
}

const initialValues = {
  title: '',
  description: '',
  skillId: '',
  extraDetails: '',
}

const CreateOffer = () => {
  const [formValues, setFormValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [skills, setSkills] = useState([])
  const [skillsError, setSkillsError] = useState('')
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)
  const navigate = useNavigate()
  const { showError, showSuccess } = useToast()
  const { id } = useParams()
  const isEditing = Boolean(id)

  useEffect(() => {
    if (!id) return

    let isMounted = true
    const fetchOffer = async () => {
      try {
        const { data } = await httpClient.get(`/offers/${id}`)
        if (isMounted) {
          const splitDesc = data.description.split('\n\nDetails:\n')

          setFormValues({
            title: data.title,
            description: splitDesc[0] || '',
            extraDetails: splitDesc[1] || '',
            skillId: data.skillId,
          })
        }
      } catch (error) {
        if (isMounted) {
          showError('Failed to load offer details')
          navigate('/offers')
        }
      }
    }

    fetchOffer()
    return () => {
      isMounted = false
    }
  }, [id, navigate, showError])

  useEffect(() => {
    let isMounted = true
    const fetchSkills = async () => {
      try {
        setIsLoadingSkills(true)
        setSkillsError('')
        const { data } = await httpClient.get('/skills', {
          params: { page: 1, pageSize: 100 },
        })
        const items = data?.items || data?.Items || []
        if (isMounted) {
          setSkills(items)
        }
      } catch (error) {
        if (isMounted) {
          setSkillsError('Unable to load skills. Please try again.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingSkills(false)
        }
      }
    }
    fetchSkills()
    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const validationErrors = {}
    if (!formValues.title.trim()) {
      validationErrors.title = 'Title is required.'
    }
    if (!formValues.description.trim()) {
      validationErrors.description = 'Description is required.'
    }
    if (!formValues.skillId) {
      validationErrors.skillId = 'Choose a skill.'
    }
    return validationErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})

    const mergedDescription = formValues.extraDetails.trim()
      ? `${formValues.description.trim()}\n\nDetails:\n${formValues.extraDetails.trim()}`
      : formValues.description.trim()

    const payload = {
      title: formValues.title.trim(),
      description: mergedDescription,
      skillId: Number(formValues.skillId),
    }

    try {
      setIsSubmitting(true)
      if (isEditing) {
        await httpClient.put(`/offers/${id}`, payload)
        showSuccess('Offer updated successfully.')
      } else {
        await httpClient.post('/offers', payload)
        showSuccess('Offer posted successfully.')
      }
      setFormValues(initialValues)
      setTimeout(() => navigate('/offers'), 800)
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to post offer right now.'
      showError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex align-items-center py-5">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol lg={10} xl={8}>
            <div className="bg-body rounded-4 shadow overflow-hidden">
              <div
                className="px-4 px-md-5 py-4 text-white"
                style={{ backgroundColor: 'var(--cui-primary)' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: '56px',
                      height: '56px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <CIcon icon={cilGift} size="xl" />
                  </div>
                  <div>
                    <h1 className="mb-1 fw-bold fs-2">{isEditing ? 'Edit Offer' : 'Share an Offer'}</h1>
                    <p className="mb-0 opacity-75">
                      {isEditing ? 'Update your offer details' : 'Describe the skill or service you want to exchange with the community'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 p-md-5">
                <CForm onSubmit={handleSubmit} noValidate>
                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-2 fs-6">
                      <CIcon icon={cilShortText} className="me-2 text-primary" />
                      Offer Title
                    </label>
                    <CFormInput
                      name="title"
                      placeholder="e.g., Guitar Lessons, Web Design Help, Math Tutoring"
                      autoComplete="off"
                      value={formValues.title}
                      invalid={Boolean(errors.title)}
                      onChange={handleChange}
                      size="lg"
                      className="py-3"
                    />
                    <CFormFeedback invalid>{errors.title}</CFormFeedback>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-2 fs-6">
                      <CIcon icon={cilLayers} className="me-2 text-primary" />
                      Skill Category
                    </label>
                    <CFormSelect
                      name="skillId"
                      value={formValues.skillId}
                      invalid={Boolean(errors.skillId)}
                      onChange={handleChange}
                      disabled={isLoadingSkills || Boolean(skillsError)}
                      size="lg"
                      className="py-3"
                    >
                      <option value="">Select a skill category...</option>
                      {groupSkillsByCategory(skills).map((group) => (
                        <optgroup key={group.category} label={group.category}>
                          {group.items.map((skill) => (
                            <option key={skill.id} value={skill.id}>
                              {skill.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </CFormSelect>
                    <CFormFeedback invalid>{errors.skillId}</CFormFeedback>
                    {skillsError && (
                      <CAlert color="warning" className="mt-3 mb-0">
                        {skillsError}
                      </CAlert>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold mb-2 fs-6">
                      <CIcon icon={cilList} className="me-2 text-primary" />
                      Description
                    </label>
                    <CFormTextarea
                      name="description"
                      placeholder="Describe what you are offering in detail. Include your experience level, what you can help with, and any relevant background information..."
                      value={formValues.description}
                      invalid={Boolean(errors.description)}
                      rows={6}
                      onChange={handleChange}
                      className="py-3"
                      style={{ fontSize: '1rem', lineHeight: '1.6' }}
                    />
                    <CFormFeedback invalid>{errors.description}</CFormFeedback>
                  </div>

                  <div className="mb-5">
                    <label className="form-label fw-semibold mb-2 fs-6">
                      <CIcon icon={cilNotes} className="me-2 text-primary" />
                      Additional Notes
                      <span className="text-body-secondary fw-normal ms-2">(Optional)</span>
                    </label>
                    <CFormTextarea
                      name="extraDetails"
                      placeholder="Availability, expectations, preferred communication method, or any other helpful information..."
                      value={formValues.extraDetails}
                      rows={4}
                      onChange={handleChange}
                      className="py-3 bg-body-secondary"
                      style={{ fontSize: '1rem', lineHeight: '1.6' }}
                    />
                  </div>

                  <div className="d-grid">
                    <CButton
                      color="primary"
                      type="submit"
                      disabled={isSubmitting}
                      className="py-3 fw-bold fs-5"
                    >
                      {isSubmitting ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Publishing Your Offer...
                        </>
                      ) : (
                        <>
                          <CIcon icon={cilGift} className="me-2" />
                          {isEditing ? 'Update Offer' : 'Post Your Offer'}
                        </>
                      )}
                    </CButton>
                  </div>
                </CForm>
              </div>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default CreateOffer


import React, { useEffect, useState } from 'react'
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
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLayers, cilList, cilShortText } from '@coreui/icons'

import httpClient from '../services/httpClient'

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
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [skills, setSkills] = useState([])
  const [skillsError, setSkillsError] = useState('')
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)
  const navigate = useNavigate()

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
    setServerError('')
    setSuccessMessage('')

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
      await httpClient.post('/offers', payload)
      setSuccessMessage('Offer posted successfully.')
      setFormValues(initialValues)
      setTimeout(() => navigate('/offers'), 800)
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to post offer right now.'
      setServerError(message)
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
                  <h1>Share an offer</h1>
                  <p className="text-body-secondary mb-4">
                    Describe the skill or service you want to exchange with the community.
                  </p>
                  {serverError && (
                    <CAlert color="danger" className="mb-4">
                      {serverError}
                    </CAlert>
                  )}
                  {successMessage && (
                    <CAlert color="success" className="mb-4">
                      {successMessage}
                    </CAlert>
                  )}
                  <CForm onSubmit={handleSubmit} noValidate>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilShortText} />
                      </CInputGroupText>
                      <CFormInput
                        name="title"
                        placeholder="Offer title"
                        autoComplete="off"
                        value={formValues.title}
                        invalid={Boolean(errors.title)}
                        onChange={handleChange}
                      />
                      <CFormFeedback invalid>{errors.title}</CFormFeedback>
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLayers} />
                      </CInputGroupText>
                      <CFormSelect
                        name="skillId"
                        value={formValues.skillId}
                        invalid={Boolean(errors.skillId)}
                        onChange={handleChange}
                        disabled={isLoadingSkills || Boolean(skillsError)}
                      >
                        <option value="">Select a skill</option>
                        {groupSkillsByCategory(skills).map((group) => (
                          <optgroup key={group.category} label={`--${group.category}`}>
                            {group.items.map((skill) => (
                              <option key={skill.id} value={skill.id}>
                                {skill.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </CFormSelect>
                      <CFormFeedback invalid>{errors.skillId}</CFormFeedback>
                    </CInputGroup>
                    {skillsError && (
                      <CAlert color="warning" className="mb-3">
                        {skillsError}
                      </CAlert>
                    )}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilList} />
                      </CInputGroupText>
                      <CFormTextarea
                        name="description"
                        placeholder="Describe what you are offering"
                        value={formValues.description}
                        invalid={Boolean(errors.description)}
                        rows={4}
                        onChange={handleChange}
                      />
                      <CFormFeedback invalid>{errors.description}</CFormFeedback>
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>Notes</CInputGroupText>
                      <CFormTextarea
                        name="extraDetails"
                        placeholder="Availability, expectations, or anything helpful (optional)"
                        value={formValues.extraDetails}
                        rows={3}
                        onChange={handleChange}
                      />
                    </CInputGroup>
                    <div className="d-grid">
                      <CButton color="primary" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <CSpinner size="sm" className="me-2" />
                            Publishing...
                          </>
                        ) : (
                          'Post Offer'
                        )}
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

export default CreateOffer


import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardText,
  CCardTitle,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CRow,
  CListGroup,
  CListGroupItem,
  CAlert,
  CAvatar,
  CProgress,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilStar, cilCheckAlt } from '@coreui/icons'
import httpClient from '../services/httpClient'

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(null)

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        // Adjust endpoint based on your backend
        const response = await httpClient.get('/users/profile')
        setProfile(response.data.profile)
        setFormData(response.data.profile)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile')
        console.error('Profile fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <CRow className="justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <CCol className="text-center">
          <CSpinner color="primary" />
          <p className="mt-3">Loading your profile...</p>
        </CCol>
      </CRow>
    )
  }

  if (error) {
    return (
      <CRow>
        <CCol xs={12}>
          <CAlert color="danger">{error}</CAlert>
        </CCol>
      </CRow>
    )
  }

  if (!profile || !formData) {
    return (
      <CRow>
        <CCol xs={12}>
          <CAlert color="warning">No profile data available</CAlert>
        </CCol>
      </CRow>
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSave = async () => {
    try {
      // Send update to backend
      await httpClient.put('/users/profile', formData)
      setProfile(formData)
      setIsEditing(false)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err.response?.data?.message || 'Failed to save profile')
    }
  }

  const handleCancel = () => {
    setFormData(profile)
    setIsEditing(false)
  }

  const handleSkillChange = (e, index) => {
    const newSkills = [...formData.skills]
    newSkills[index] = e.target.value
    setFormData({ ...formData, skills: newSkills })
  }

  const addSkill = () => {
    setFormData({ ...formData, skills: [...formData.skills, ''] })
  }

  const removeSkill = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index)
    setFormData({ ...formData, skills: newSkills })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <CCardTitle className="m-0">Your Profile</CCardTitle>
            {!isEditing && (
              <CButton color="primary" size="sm" onClick={() => setIsEditing(true)}>
                Edit Profile
              </CButton>
            )}
          </CCardHeader>
          <CCardBody>
            {isEditing && (
              <CAlert color="info" className="mb-4">
                Update your profile information below
              </CAlert>
            )}

            <CForm>
              {/* Personal Information */}
              <div className="mb-4">
                <h5 className="mb-3">Personal Information</h5>
                <CRow>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="name">Name</CFormLabel>
                    <CFormInput
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Your full name"
                    />
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="email">Email</CFormLabel>
                    <CFormInput
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="your@email.com"
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CCol md={6} className="mb-3">
                    <CFormLabel htmlFor="phone">Phone</CFormLabel>
                    <CFormInput
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Your phone number"
                    />
                  </CCol>
                </CRow>
              </div>

              {/* Bio */}
              <div className="mb-4">
                <h5 className="mb-3">Bio / Description</h5>
                <CFormLabel htmlFor="bio">Tell us about yourself</CFormLabel>
                <CFormTextarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Write a brief bio about your skills and experience..."
                />
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="m-0">Skills List</h5>
                  {isEditing && (
                    <CButton color="success" size="sm" onClick={addSkill}>
                      + Add Skill
                    </CButton>
                  )}
                </div>
                <CListGroup>
                  {formData.skills.map((skill, index) => (
                    <CListGroupItem
                      key={index}
                      className="d-flex justify-content-between align-items-center"
                    >
                      {isEditing ? (
                        <CFormInput
                          type="text"
                          value={skill}
                          onChange={(e) => handleSkillChange(e, index)}
                          placeholder="Skill name"
                          className="me-2"
                        />
                      ) : (
                        <span>{skill}</span>
                      )}
                      {isEditing && (
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => removeSkill(index)}
                          className="ms-2"
                        >
                          Remove
                        </CButton>
                      )}
                    </CListGroupItem>
                  ))}
                </CListGroup>
              </div>

              {/* Reputation */}
              <div className="mb-4">
                <h5 className="mb-3">Reputation</h5>
                <CRow>
                  <CCol md={6} className="mb-3">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <CIcon icon={cilStar} size="xl" className="text-warning" />
                      </div>
                      <div>
                        <div className="fw-bold">{profile.rating} / 5.0</div>
                        <CCardText className="m-0 text-muted">
                          {profile.reviewCount} reviews
                        </CCardText>
                      </div>
                    </div>
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CProgress color="warning" value={profile.rating * 20} className="mt-2" />
                  </CCol>
                </CRow>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="d-flex gap-2">
                  <CButton color="primary" onClick={handleSave}>
                    Save Changes
                  </CButton>
                  <CButton color="secondary" onClick={handleCancel}>
                    Cancel
                  </CButton>
                </div>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Profile

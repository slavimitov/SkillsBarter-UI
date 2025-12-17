import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { useAuth } from '../contexts/AuthContext'

const Profile = () => {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(null)

  // Fetch user profile on component mount
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setProfile(null)
      setFormData(null)
      setError(null)
      setLoading(false)
      return
    }

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
  }, [authLoading, isAuthenticated])

  if (authLoading) {
    return (
      <CRow className="justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <CCol className="text-center">
          <CSpinner color="primary" />
          <p className="mt-3">Loading...</p>
        </CCol>
      </CRow>
    )
  }

  if (!isAuthenticated) {
    return (
      <CRow className="justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <CCol className="text-center">
          <CAlert color="info" className="mb-4">
            Please log in to view your profile.
          </CAlert>
          <CButton color="primary" onClick={() => navigate('/login')}>
            Login
          </CButton>
        </CCol>
      </CRow>
    )
  }

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
      // Prepare data for backend - convert skills array to skillIds
      const updateData = {
        name: formData.name,
        description: formData.description,
        phoneNumber: formData.phoneNumber,
        skillIds: formData.skills?.map(skill => skill.skillId).filter(id => id) || []
      }
      
      // Send update to backend
      const response = await httpClient.put('/users/profile', updateData)
      
      // Update local profile with response data
      setProfile(response.data.profile)
      setFormData(response.data.profile)
      setIsEditing(false)
      setError(null)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err.response?.data?.message || 'Failed to save profile')
    }
  }

  const handleCancel = () => {
    setFormData(profile)
    setIsEditing(false)
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
                    <CFormLabel htmlFor="phoneNumber">Phone</CFormLabel>
                    <CFormInput
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
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
                <CFormLabel htmlFor="description">Tell us about yourself</CFormLabel>
                <CFormTextarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
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
                </div>
                {formData.skills && formData.skills.length > 0 ? (
                  <CListGroup>
                    {formData.skills.map((skill, index) => (
                      <CListGroupItem
                        key={skill.skillId || index}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <span>{skill.skillName || skill}</span>
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
                ) : (
                  <CCardText className="text-muted">No skills added yet</CCardText>
                )}
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
                        <div className="fw-bold">{profile.stats?.averageRating || 0} / 5.0</div>
                        <CCardText className="m-0 text-muted">
                          {profile.stats?.totalReviews || 0} reviews
                        </CCardText>
                      </div>
                    </div>
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <CProgress color="warning" value={(profile.stats?.averageRating || 0) * 20} className="mt-2" />
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

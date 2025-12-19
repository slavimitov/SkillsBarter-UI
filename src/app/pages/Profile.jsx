import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAlert,
  CAvatar,
  CBadge,
  CButton,
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
  CListGroup,
  CListGroupItem,
  CNav,
  CNavItem,
  CNavLink,
  CPagination,
  CPaginationItem,
  CProgress,
  CRow,
  CSpinner,
  CTabContent,
  CTabPane,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBriefcase,
  cilCheckAlt,
  cilCheckCircle,
  cilHandshake,
  cilPencil,
  cilStar,
  cilTrash,
  cilUser,
  cilXCircle,
} from '@coreui/icons'
import httpClient from '../services/httpClient'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import loadPayPalSdk, { resetPayPalLoader } from '../services/paypal'
import reviewService from '../services/reviewService'

const Profile = () => {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading, refreshProfile } = useAuth()
  const { showSuccess, showError } = useToast()
  const paypalButtonsRef = useRef(null)

  const [activeTab, setActiveTab] = useState('profile')

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(null)

  const [paypalReady, setPaypalReady] = useState(false)
  const [paypalError, setPaypalError] = useState(null)
  const [paypalMessage, setPaypalMessage] = useState(null)
  const [paypalLoading, setPaypalLoading] = useState(false)
  const [activating, setActivating] = useState(false)
  const [paypalContainerReady, setPaypalContainerReady] = useState(false)

  const [offers, setOffers] = useState([])
  const [offersLoading, setOffersLoading] = useState(false)
  const [offersLoaded, setOffersLoaded] = useState(false)
  const [offersPagination, setOffersPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
  })

  const [agreements, setAgreements] = useState([])
  const [agreementsLoading, setAgreementsLoading] = useState(false)
  const [agreementsLoaded, setAgreementsLoaded] = useState(false)
  const [agreementsPagination, setAgreementsPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
  })

  const [reviews, setReviews] = useState([])
  const [reviewsSummary, setReviewsSummary] = useState({ totalReviews: 0, averageRating: 0 })
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsLoaded, setReviewsLoaded] = useState(false)
  const [reviewsPagination, setReviewsPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 0,
    totalCount: 0,
  })

  const paypalContainerRef = useCallback((node) => {
    paypalButtonsRef.current = node
    setPaypalContainerReady(!!node)
  }, [])

  const resolveEnv = (key) => {
    if (typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
      return import.meta.env[key]
    }
    if (typeof process !== 'undefined' && process.env && key in process.env) {
      return process.env[key]
    }
    return undefined
  }

  const paypalClientId =
    resolveEnv('VITE_PAYPAL_CLIENT_ID') || resolveEnv('REACT_APP_PAYPAL_CLIENT_ID')
  const paypalPlanId = resolveEnv('VITE_PAYPAL_PLAN_ID') || resolveEnv('REACT_APP_PAYPAL_PLAN_ID')
  const missingPaypalConfig = !paypalClientId || !paypalPlanId

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
        const response = await httpClient.get('/users/profile')
        setProfile(response.data.profile)
        setFormData(response.data.profile)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [authLoading, isAuthenticated])

  const reloadProfile = useCallback(async () => {
    const response = await httpClient.get('/users/profile')
    setProfile(response.data.profile)
    setFormData(response.data.profile)
  }, [])

  const isPremium = profile?.roles?.includes('Premium') || profile?.isPremium

  useEffect(() => {
    if (isPremium || missingPaypalConfig) return

    let cancelled = false
    const initPaypal = async () => {
      setPaypalLoading(true)
      setPaypalError(null)
      try {
        await loadPayPalSdk({
          clientId: paypalClientId,
          components: 'buttons',
          vault: true,
          intent: 'subscription',
        })
        if (!cancelled) {
          setPaypalReady(true)
        }
      } catch (err) {
        if (!cancelled) {
          setPaypalError(err?.message || 'Failed to load PayPal')
        }
      } finally {
        if (!cancelled) {
          setPaypalLoading(false)
        }
      }
    }

    initPaypal()
    return () => {
      cancelled = true
    }
  }, [isPremium, missingPaypalConfig, paypalClientId])

  const handleSubscriptionApproved = useCallback(
    async (data) => {
      setActivating(true)
      setPaypalError(null)
      setPaypalMessage(null)
      try {
        await httpClient.post('/users/premium', {
          subscriptionId: data?.subscriptionID || data?.subscriptionId,
        })
        await refreshProfile()
        await reloadProfile()
        setPaypalMessage('Premium activated. Enjoy the new features!')
      } catch (err) {
        setPaypalError(err?.response?.data?.message || 'Failed to activate premium')
      } finally {
        setActivating(false)
      }
    },
    [refreshProfile, reloadProfile],
  )

  useEffect(() => {
    if (!paypalReady || !paypalContainerReady || !paypalButtonsRef.current || isPremium || missingPaypalConfig) return

    let buttonsInstance = null
    let isCancelled = false

    const renderButtons = async () => {
      try {
        const paypal = await loadPayPalSdk({
          clientId: paypalClientId,
          components: 'buttons',
          vault: true,
          intent: 'subscription',
        })

        if (paypalButtonsRef.current) {
          paypalButtonsRef.current.innerHTML = ''
        }

        buttonsInstance = paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe',
          },
          createSubscription: (_, actions) => {
            if (!paypalPlanId) {
              setPaypalError('Missing PayPal plan id. Please configure it and retry.')
              return null
            }
            return actions.subscription.create({
              plan_id: paypalPlanId,
            })
          },
          onApprove: async (data) => {
            await handleSubscriptionApproved(data)
          },
          onCancel: () => {
            setPaypalMessage('Payment was cancelled. You can try again anytime.')
          },
          onError: (err) => {
            setPaypalError(err?.message || 'Payment failed. Please try again.')
          },
        })

        if (!isCancelled && paypalButtonsRef.current) {
          buttonsInstance.render(paypalButtonsRef.current).catch((err) => {
            if (!isCancelled) {
              console.error('PayPal render error:', err)
              setPaypalError(err?.message || 'Unable to render PayPal buttons')
            }
          })
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('PayPal initialization error:', err)
          setPaypalError(err?.message || 'Unable to initialize PayPal buttons')
          resetPayPalLoader()
        }
      }
    }

    renderButtons()

    return () => {
      isCancelled = true
      if (buttonsInstance?.close) {
        buttonsInstance.close()
      }
      if (paypalButtonsRef.current) {
        paypalButtonsRef.current.innerHTML = ''
      }
    }
  }, [
    handleSubscriptionApproved,
    isPremium,
    missingPaypalConfig,
    paypalClientId,
    paypalContainerReady,
    paypalPlanId,
    paypalReady,
  ])

  const fetchOffers = useCallback(async (page = 1) => {
    try {
      setOffersLoading(true)
      const response = await httpClient.get('/offers/mine', {
        params: { page, pageSize: offersPagination.pageSize }
      })
      const data = response.data
      setOffers(data.items || [])
      setOffersPagination(prev => ({
        ...prev,
        page: data.page || page,
        totalPages: data.totalPages || Math.ceil((data.total || 0) / prev.pageSize),
        totalCount: data.total || 0,
      }))
      setOffersLoaded(true)
    } catch (err) {
      console.error('Error fetching offers:', err)
      setOffers([])
      setOffersLoaded(true)
    } finally {
      setOffersLoading(false)
    }
  }, [offersPagination.pageSize])

  const fetchAgreements = useCallback(async (page = 1) => {
    try {
      setAgreementsLoading(true)
      const response = await httpClient.get('/agreements/my', {
        params: { page, pageSize: agreementsPagination.pageSize }
      })
      const data = response.data
      setAgreements(data.agreements || [])
      setAgreementsPagination(prev => ({
        ...prev,
        page: data.page || page,
        totalPages: data.totalPages || 0,
        totalCount: data.totalCount || 0,
      }))
      setAgreementsLoaded(true)
    } catch (err) {
      console.error('Error fetching agreements:', err)
      setAgreements([])
      setAgreementsLoaded(true)
    } finally {
      setAgreementsLoading(false)
    }
  }, [agreementsPagination.pageSize])

  const fetchReviews = useCallback(async (page = 1) => {
    if (!profile?.id) return
    
    try {
      setReviewsLoading(true)
      const data = await reviewService.getUserReviewsWithSummary(profile.id, page, reviewsPagination.pageSize)
      setReviews(data.reviews?.items || [])
      setReviewsSummary(data.summary || { totalReviews: 0, averageRating: 0 })
      setReviewsPagination(prev => ({
        ...prev,
        page: data.reviews?.page || page,
        totalPages: data.reviews?.totalPages || 0,
        totalCount: data.reviews?.totalCount || 0,
      }))
      setReviewsLoaded(true)
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setReviews([])
      setReviewsLoaded(true)
    } finally {
      setReviewsLoading(false)
    }
  }, [profile?.id, reviewsPagination.pageSize])

  useEffect(() => {
    if (!profile?.id) return

    if (activeTab === 'offers' && !offersLoaded && !offersLoading) {
      fetchOffers(1)
    } else if (activeTab === 'agreements' && !agreementsLoaded && !agreementsLoading) {
      fetchAgreements(1)
    } else if (activeTab === 'reviews' && !reviewsLoaded && !reviewsLoading) {
      fetchReviews(1)
    }
  }, [activeTab, profile?.id, offersLoaded, agreementsLoaded, reviewsLoaded])

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getRelativeTime = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  const renderStars = (rating) => {
    const normalizedRating = rating || 0
    return (
      <div className="d-flex align-items-center gap-1">
        <CIcon icon={cilStar} size="sm" className="text-warning" />
        <span className="small fw-medium">{normalizedRating.toFixed(1)}/11</span>
      </div>
    )
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { color: 'warning', label: 'Pending' },
      1: { color: 'info', label: 'In Progress' },
      2: { color: 'success', label: 'Completed' },
      3: { color: 'danger', label: 'Cancelled' },
      4: { color: 'secondary', label: 'Disputed' },
    }
    const info = statusMap[status] || { color: 'secondary', label: 'Unknown' }
    return <CBadge color={info.color}>{info.label}</CBadge>
  }

  const getOfferStatusBadge = (statusCode) => {
    const statusMap = {
      'Active': { color: 'success', label: 'Active' },
      'Inactive': { color: 'secondary', label: 'Inactive' },
      'Cancelled': { color: 'danger', label: 'Cancelled' },
    }
    const info = statusMap[statusCode] || { color: 'secondary', label: statusCode }
    return <CBadge color={info.color}>{info.label}</CBadge>
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSave = async () => {
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        phoneNumber: formData.phoneNumber,
        skillIds: formData.skills?.map(skill => skill.skillId).filter(id => id) || []
      }
      
      const response = await httpClient.put('/users/profile', updateData)
      
      setProfile(response.data.profile)
      setFormData(response.data.profile)
      setIsEditing(false)
      setError(null)
      showSuccess('Profile updated successfully!')
    } catch (err) {
      console.error('Error saving profile:', err)
      showError(err.response?.data?.message || 'Failed to save profile')
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

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return
    
    try {
      await httpClient.delete(`/offers/${offerId}`)
      showSuccess('Offer deleted successfully')
      fetchOffers(offersPagination.page)
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete offer')
    }
  }

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

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <CCardTitle className="m-0">My Account</CCardTitle>
          </CCardHeader>
          <CCardBody className="p-0">       
            <CNav variant="tabs" className="px-4 pt-3">
              <CNavItem>
                <CNavLink
                  active={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilUser} size="sm" className="me-2" />
                  Profile
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'offers'}
                  onClick={() => setActiveTab('offers')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilBriefcase} size="sm" className="me-2" />
                  My Offers
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'agreements'}
                  onClick={() => setActiveTab('agreements')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilHandshake} size="sm" className="me-2" />
                  Agreements
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'reviews'}
                  onClick={() => setActiveTab('reviews')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilStar} size="sm" className="me-2" />
                  My Reviews
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent className="p-4">
              <CTabPane visible={activeTab === 'profile'}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">Profile Information</h5>
                  {!isEditing && (
                    <CButton color="primary" size="sm" onClick={() => setIsEditing(true)}>
                      <CIcon icon={cilPencil} size="sm" className="me-1" />
                      Edit Profile
                    </CButton>
                  )}
                </div>

                {isEditing && (
                  <CAlert color="info" className="mb-4">
                    Update your profile information below
                  </CAlert>
                )}

                <div className="mb-4">
                  <h6 className="mb-3">Premium Status</h6>
                  <div
                    className="p-4 rounded-3"
                    style={{
                      maxWidth: '420px',
                      backgroundColor: 'var(--cui-tertiary-bg)',
                      border: '1px solid var(--cui-border-color)',
                    }}
                  >
                    {isPremium ? (
                      <CAlert color="success" className="mb-0 d-flex align-items-center">
                        <CIcon icon={cilCheckAlt} className="me-2" />
                        You have Premium access.
                      </CAlert>
                    ) : (
                      <>
                        {paypalMessage && (
                          <CAlert color="success" className="mb-3">
                            {paypalMessage}
                          </CAlert>
                        )}
                        {paypalError && (
                          <CAlert color="danger" className="mb-3">
                            {paypalError}
                          </CAlert>
                        )}
                        {missingPaypalConfig && (
                          <CAlert color="warning" className="mb-0">
                            PayPal is not configured.
                          </CAlert>
                        )}
                        {!missingPaypalConfig && (
                          <>
                            <CCardText className="mb-3">
                              Unlock Premium for advanced features and priority placement.
                            </CCardText>
                            {paypalLoading && (
                              <div className="d-flex align-items-center mb-3">
                                <CSpinner size="sm" className="me-2" />
                                <span>Preparing payment options...</span>
                              </div>
                            )}
                            <div ref={paypalContainerRef} className="mb-0" />
                            {activating && (
                              <div className="d-flex align-items-center mt-3">
                                <CSpinner size="sm" className="me-2" />
                                <span>Activating your premium...</span>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <CForm>
                  <div className="mb-4">
                    <h6 className="mb-3">Personal Information</h6>
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

                  <div className="mb-4">
                    <h6 className="mb-3">Bio / Description</h6>
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

                  <div className="mb-4">
                    <h6 className="mb-3">Skills</h6>
                    {formData.skills && formData.skills.length > 0 ? (
                      <div className="d-flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <CBadge
                            key={skill.skillId || index}
                            color="primary"
                            className="px-3 py-2 d-flex align-items-center gap-2"
                            shape="rounded-pill"
                          >
                            {skill.skillName || skill}
                            {isEditing && (
                              <CIcon
                                icon={cilXCircle}
                                size="sm"
                                style={{ cursor: 'pointer' }}
                                onClick={() => removeSkill(index)}
                              />
                            )}
                          </CBadge>
                        ))}
                      </div>
                    ) : (
                      <CCardText className="text-muted">No skills added yet</CCardText>
                    )}
                  </div>

                  <div className="mb-4">
                    <h6 className="mb-3">Reputation</h6>
                    <CCard className="border" style={{ backgroundColor: 'var(--cui-tertiary-bg)', maxWidth: '400px' }}>
                      <CCardBody className="d-flex align-items-center gap-3">
                        <CIcon icon={cilStar} size="xl" className="text-warning" />
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fs-4 fw-bold">{(profile.stats?.averageRating || 0).toFixed(1)}</span>
                            <span className="text-muted">/ 11</span>
                          </div>
                          <CCardText className="m-0 text-muted small">
                            Based on {profile.stats?.totalReviews || 0} reviews
                          </CCardText>
                          <CProgress
                            color="warning"
                            value={((profile.stats?.averageRating || 0) / 11) * 100}
                            className="mt-2"
                            style={{ height: '6px' }}
                          />
                        </div>
                      </CCardBody>
                    </CCard>
                  </div>

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
              </CTabPane>

              <CTabPane visible={activeTab === 'offers'}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">My Offers</h5>
                  <CButton color="primary" size="sm" onClick={() => navigate('/offers/new')}>
                    Create New Offer
                  </CButton>
                </div>

                {offersLoading ? (
                  <div className="text-center py-5">
                    <CSpinner color="primary" />
                  </div>
                ) : offers.length > 0 ? (
                  <>
                    <CTable hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Title</CTableHeaderCell>
                          <CTableHeaderCell>Skill</CTableHeaderCell>
                          <CTableHeaderCell>Status</CTableHeaderCell>
                          <CTableHeaderCell>Created</CTableHeaderCell>
                          <CTableHeaderCell>Actions</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {offers.map((offer) => (
                          <CTableRow key={offer.id}>
                            <CTableDataCell>
                              <span
                                className="text-primary"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/offers/${offer.id}`)}
                              >
                                {offer.title}
                              </span>
                            </CTableDataCell>
                            <CTableDataCell>
                              <CBadge color="info">{offer.skillName || 'N/A'}</CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                              {getOfferStatusBadge(offer.statusCode)}
                            </CTableDataCell>
                            <CTableDataCell>
                              <small className="text-muted">{formatDate(offer.createdAt)}</small>
                            </CTableDataCell>
                            <CTableDataCell>
                              <div className="d-flex gap-1">
                                <CButton
                                  color="outline-primary"
                                  size="sm"
                                  onClick={() => navigate(`/offers/${offer.id}/edit`)}
                                >
                                  <CIcon icon={cilPencil} size="sm" />
                                </CButton>
                                <CButton
                                  color="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteOffer(offer.id)}
                                >
                                  <CIcon icon={cilTrash} size="sm" />
                                </CButton>
                              </div>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>

                    {offersPagination.totalPages > 1 && (
                      <CPagination className="justify-content-center">
                        <CPaginationItem
                          disabled={offersPagination.page === 1}
                          onClick={() => fetchOffers(offersPagination.page - 1)}
                        >
                          Previous
                        </CPaginationItem>
                        {[...Array(offersPagination.totalPages)].map((_, i) => (
                          <CPaginationItem
                            key={i + 1}
                            active={offersPagination.page === i + 1}
                            onClick={() => fetchOffers(i + 1)}
                          >
                            {i + 1}
                          </CPaginationItem>
                        ))}
                        <CPaginationItem
                          disabled={offersPagination.page === offersPagination.totalPages}
                          onClick={() => fetchOffers(offersPagination.page + 1)}
                        >
                          Next
                        </CPaginationItem>
                      </CPagination>
                    )}
                  </>
                ) : (
                  <div className="text-center py-5">
                    <CIcon icon={cilBriefcase} size="3xl" className="text-body-tertiary mb-3" />
                    <p className="text-body-secondary mb-3">You haven't created any offers yet</p>
                    <CButton color="primary" onClick={() => navigate('/offers/new')}>
                      Create Your First Offer
                    </CButton>
                  </div>
                )}
              </CTabPane>

              <CTabPane visible={activeTab === 'agreements'}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">My Agreements</h5>
                  <CButton color="outline-primary" size="sm" onClick={() => navigate('/agreements')}>
                    View All
                  </CButton>
                </div>

                {agreementsLoading ? (
                  <div className="text-center py-5">
                    <CSpinner color="primary" />
                  </div>
                ) : agreements.length > 0 ? (
                  <>
                    <CTable hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Offer</CTableHeaderCell>
                          <CTableHeaderCell>Partner</CTableHeaderCell>
                          <CTableHeaderCell>Role</CTableHeaderCell>
                          <CTableHeaderCell>Progress</CTableHeaderCell>
                          <CTableHeaderCell>Status</CTableHeaderCell>
                          <CTableHeaderCell>Created</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {agreements.map((agreement) => {
                          const progress = agreement.totalMilestones > 0
                            ? Math.round((agreement.completedMilestones / agreement.totalMilestones) * 100)
                            : 0

                          return (
                            <CTableRow
                              key={agreement.id}
                              style={{ cursor: 'pointer' }}
                              onClick={() => navigate(`/agreements/${agreement.id}`)}
                            >
                              <CTableDataCell>
                                <span className="text-primary">{agreement.offerTitle}</span>
                              </CTableDataCell>
                              <CTableDataCell>
                                <div className="d-flex align-items-center gap-2">
                                  <CAvatar
                                    color="secondary"
                                    textColor="white"
                                    size="sm"
                                  >
                                    {getInitials(agreement.role === 'Requester' ? agreement.providerName : agreement.requesterName)}
                                  </CAvatar>
                                  <span className="small">
                                    {agreement.role === 'Requester' ? agreement.providerName : agreement.requesterName}
                                  </span>
                                </div>
                              </CTableDataCell>
                              <CTableDataCell>
                                <CBadge color={agreement.role === 'Provider' ? 'info' : 'secondary'}>
                                  {agreement.role}
                                </CBadge>
                              </CTableDataCell>
                              <CTableDataCell>
                                <div className="d-flex align-items-center gap-2">
                                  <CProgress
                                    value={progress}
                                    color={progress === 100 ? 'success' : 'primary'}
                                    style={{ width: '80px', height: '6px' }}
                                  />
                                  <span className="small text-muted">
                                    {agreement.completedMilestones}/{agreement.totalMilestones}
                                  </span>
                                </div>
                              </CTableDataCell>
                              <CTableDataCell>
                                {getStatusBadge(agreement.status)}
                              </CTableDataCell>
                              <CTableDataCell>
                                <small className="text-muted">{formatDate(agreement.createdAt)}</small>
                              </CTableDataCell>
                            </CTableRow>
                          )
                        })}
                      </CTableBody>
                    </CTable>

                    {agreementsPagination.totalPages > 1 && (
                      <CPagination className="justify-content-center">
                        <CPaginationItem
                          disabled={agreementsPagination.page === 1}
                          onClick={() => fetchAgreements(agreementsPagination.page - 1)}
                        >
                          Previous
                        </CPaginationItem>
                        {[...Array(agreementsPagination.totalPages)].map((_, i) => (
                          <CPaginationItem
                            key={i + 1}
                            active={agreementsPagination.page === i + 1}
                            onClick={() => fetchAgreements(i + 1)}
                          >
                            {i + 1}
                          </CPaginationItem>
                        ))}
                        <CPaginationItem
                          disabled={agreementsPagination.page === agreementsPagination.totalPages}
                          onClick={() => fetchAgreements(agreementsPagination.page + 1)}
                        >
                          Next
                        </CPaginationItem>
                      </CPagination>
                    )}
                  </>
                ) : (
                  <div className="text-center py-5">
                    <CIcon icon={cilHandshake} size="3xl" className="text-body-tertiary mb-3" />
                    <p className="text-body-secondary mb-3">You don't have any agreements yet</p>
                    <CButton color="primary" onClick={() => navigate('/offers')}>
                      Browse Offers
                    </CButton>
                  </div>
                )}
              </CTabPane>

              <CTabPane visible={activeTab === 'reviews'}>
                <h5 className="mb-4">Reviews I've Received</h5>

                {/* Rating Summary */}
                <CCard className="border mb-4" style={{ backgroundColor: 'var(--cui-tertiary-bg)' }}>
                  <CCardBody className="d-flex align-items-center gap-4">
                    <div className="text-center">
                      <div className="display-4 fw-bold text-warning">
                        {(reviewsSummary.averageRating || 0).toFixed(1)}
                      </div>
                      <div className="d-flex justify-content-center mb-1">
                        {renderStars(reviewsSummary.averageRating)}
                      </div>
                      <div className="text-body-secondary small">
                        {reviewsSummary.totalReviews} review{reviewsSummary.totalReviews !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <CProgress
                        className="mb-2"
                        value={((reviewsSummary.averageRating || 0) / 11) * 100}
                        color="warning"
                        style={{ height: '8px' }}
                      />
                      <small className="text-body-secondary">
                        Overall rating based on {reviewsSummary.totalReviews} reviews
                      </small>
                    </div>
                  </CCardBody>
                </CCard>

                {reviewsLoading ? (
                  <div className="text-center py-5">
                    <CSpinner color="primary" />
                  </div>
                ) : reviews.length > 0 ? (
                  <>
                    <div className="d-flex flex-column gap-4">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="pb-4 border-bottom"
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <CAvatar
                                color="secondary"
                                textColor="white"
                                size="md"
                              >
                                {getInitials(review.reviewerName)}
                              </CAvatar>
                              <div>
                                <div className="fw-medium">{review.reviewerName}</div>
                                <div className="d-flex gap-1">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                            </div>
                            <span className="text-body-secondary small">
                              {getRelativeTime(review.createdAt)}
                            </span>
                          </div>
                          {review.body && (
                            <p className="text-body-secondary mb-0 mt-2" style={{ lineHeight: 1.6 }}>
                              {review.body}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {reviewsPagination.totalPages > 1 && (
                      <CPagination className="justify-content-center mt-4">
                        <CPaginationItem
                          disabled={reviewsPagination.page === 1}
                          onClick={() => fetchReviews(reviewsPagination.page - 1)}
                        >
                          Previous
                        </CPaginationItem>
                        {[...Array(reviewsPagination.totalPages)].map((_, i) => (
                          <CPaginationItem
                            key={i + 1}
                            active={reviewsPagination.page === i + 1}
                            onClick={() => fetchReviews(i + 1)}
                          >
                            {i + 1}
                          </CPaginationItem>
                        ))}
                        <CPaginationItem
                          disabled={reviewsPagination.page === reviewsPagination.totalPages}
                          onClick={() => fetchReviews(reviewsPagination.page + 1)}
                        >
                          Next
                        </CPaginationItem>
                      </CPagination>
                    )}
                  </>
                ) : (
                  <div className="text-center py-5">
                    <CIcon icon={cilStar} size="3xl" className="text-body-tertiary mb-3" />
                    <p className="text-body-secondary mb-0">No reviews yet</p>
                    <p className="text-body-tertiary small">
                      Complete agreements to receive reviews from other users
                    </p>
                  </div>
                )}
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Profile

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CAlert,
  CAvatar,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CListGroup,
  CListGroupItem,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilArrowLeft,
  cilBriefcase,
  cilCalendar,
  cilCheckCircle,
  cilEnvelopeOpen,
  cilPeople,
  cilStar,
  cilUser,
  cilBadge,
} from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import userService from '../services/userService'
import reviewService from '../services/reviewService'
import httpClient from '../services/httpClient'

const UserProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user: currentUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [reviews, setReviews] = useState([])
  const [reviewsSummary, setReviewsSummary] = useState({ totalReviews: 0, averageRating: 0 })
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsPagination, setReviewsPagination] = useState({
    page: 1,
    pageSize: 5,
    totalPages: 0,
    totalCount: 0,
  })

  const [canReview, setCanReview] = useState(false)
  const [eligibleAgreements, setEligibleAgreements] = useState([])
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    agreementId: '',
    rating: 6,
    body: '',
  })

  const [offers, setOffers] = useState([])
  const [offersLoading, setOffersLoading] = useState(false)

  const [dataLoaded, setDataLoaded] = useState(false)

  const [activeTab, setActiveTab] = useState('about')

  const isOwnProfile = currentUser?.id === id

  useEffect(() => {
    setDataLoaded(false)
    setProfile(null)
    setReviews([])
    setOffers([])
    setReviewsSummary({ totalReviews: 0, averageRating: 0 })
  }, [id])

  const fetchProfile = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError('')
      const data = await userService.getPublicProfile(id)
      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err.response?.data?.message || 'Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchReviews = useCallback(async (page = 1) => {
    if (!id) return

    try {
      setReviewsLoading(true)
      const data = await reviewService.getUserReviewsWithSummary(id, page, reviewsPagination.pageSize)

      setReviews(data.reviews?.items || [])
      setReviewsSummary(data.summary || { totalReviews: 0, averageRating: 0 })
      setReviewsPagination(prev => ({
        ...prev,
        page: data.reviews?.page || page,
        totalPages: data.reviews?.totalPages || 0,
        totalCount: data.reviews?.totalCount || 0,
      }))
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setReviewsLoading(false)
    }
  }, [id, reviewsPagination.pageSize])

  const checkReviewEligibility = useCallback(async () => {
    if (!isAuthenticated || isOwnProfile || !id) {
      setCanReview(false)
      setEligibleAgreements([])
      return
    }

    try {
      const { canReview: eligible, agreements } = await userService.checkCanReview(id)
      setCanReview(eligible)
      setEligibleAgreements(agreements)
    } catch (err) {
      console.error('Error checking review eligibility:', err)
      setCanReview(false)
      setEligibleAgreements([])
    }
  }, [id, isAuthenticated, isOwnProfile])

  const fetchUserOffers = useCallback(async () => {
    if (!id) return

    try {
      setOffersLoading(true)
      const response = await httpClient.get('/offers', {
        params: { userId: id, pageSize: 10 }
      })
      const offersData = response.data
      const userOffers = Array.isArray(offersData) ? offersData : offersData?.items || []

      setOffers(userOffers)
    } catch (err) {
      console.error('Error fetching user offers:', err)
      setOffers([])
    } finally {
      setOffersLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (profile && !dataLoaded) {
      setDataLoaded(true)
      fetchReviews(1)
      checkReviewEligibility()
      fetchUserOffers()
    }
  }, [profile, dataLoaded])

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!reviewForm.agreementId) {
      showError('Please select an agreement')
      return
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 11) {
      showError('Please select a valid rating (1-11)')
      return
    }

    try {
      setSubmittingReview(true)
      await reviewService.createReview({
        recipientId: id,
        agreementId: reviewForm.agreementId,
        rating: reviewForm.rating,
        body: reviewForm.body || null,
      })

      showSuccess('Review submitted successfully!')
      setReviewModalVisible(false)
      setReviewForm({ agreementId: '', rating: 6, body: '' })

      const [newReviewsData, newEligibility, newProfile] = await Promise.all([
        reviewService.getUserReviewsWithSummary(id, 1, reviewsPagination.pageSize),
        userService.checkCanReview(id),
        userService.getPublicProfile(id),
      ])

      setReviews(newReviewsData.reviews?.items || [])
      setReviewsSummary(newReviewsData.summary || { totalReviews: 0, averageRating: 0 })
      setReviewsPagination(prev => ({
        ...prev,
        page: newReviewsData.reviews?.page || 1,
        totalPages: newReviewsData.reviews?.totalPages || 0,
        totalCount: newReviewsData.reviews?.totalCount || 0,
      }))
      setCanReview(newEligibility.canReview)
      setEligibleAgreements(newEligibility.agreements)
      setProfile(newProfile)
    } catch (err) {
      console.error('Error submitting review:', err)
      showError(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

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
      month: 'long',
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

  const getVerificationBadge = (level) => {
    const levels = {
      0: { label: 'Unverified', color: 'secondary' },
      1: { label: 'Email Verified', color: 'info' },
      2: { label: 'Phone Verified', color: 'primary' },
      3: { label: 'ID Verified', color: 'success' },
    }
    const info = levels[level] || levels[0]
    return <CBadge color={info.color}>{info.label}</CBadge>
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4">
        <CButton
          color="link"
          className="p-0 mb-3 text-decoration-none d-flex align-items-center gap-1"
          onClick={() => navigate(-1)}
        >
          <CIcon icon={cilArrowLeft} size="sm" />
          Go back
        </CButton>
        <CAlert color="danger">{error}</CAlert>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="py-4">
        <CButton
          color="link"
          className="p-0 mb-3 text-decoration-none d-flex align-items-center gap-1"
          onClick={() => navigate(-1)}
        >
          <CIcon icon={cilArrowLeft} size="sm" />
          Go back
        </CButton>
        <CAlert color="secondary">User not found.</CAlert>
      </div>
    )
  }

  return (
    <div className="user-profile-page">

      <CButton
        color="link"
        className="p-0 mb-4 text-decoration-none d-flex align-items-center gap-1"
        onClick={() => navigate(-1)}
      >
        <CIcon icon={cilArrowLeft} size="sm" />
        Go back
      </CButton>

      <CRow className="g-4">
        <CCol lg={4}>
          <CCard className="border-0 shadow-sm mb-4">
            <CCardBody className="p-4 text-center">
              <CAvatar
                color="primary"
                textColor="white"
                size="xl"
                style={{ width: '100px', height: '100px', fontSize: '2rem' }}
                className="mb-3"
              >
                {getInitials(profile.name)}
              </CAvatar>

              <h4 className="fw-bold mb-2">{profile.name}</h4>

              <div className="mb-3">
                {getVerificationBadge(profile.verificationLevel)}
              </div>

              <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                {renderStars(profile.stats?.averageRating || reviewsSummary.averageRating)}
                <span className="text-body-secondary small">
                  ({profile.stats?.totalReviews || reviewsSummary.totalReviews} reviews)
                </span>
              </div>

              <div className="d-flex justify-content-center gap-4 mb-4 py-3 border-top border-bottom">
                <div className="text-center">
                  <div className="fw-bold fs-5">{profile.stats?.totalActiveOffers || 0}</div>
                  <div className="text-body-secondary small">Active Offers</div>
                </div>
                <div className="text-center">
                  <div className="fw-bold fs-5">{profile.stats?.totalReviews || 0}</div>
                  <div className="text-body-secondary small">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="fw-bold fs-5">{profile.reputationScore || 0}</div>
                  <div className="text-body-secondary small">Reputation</div>
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-center gap-2 text-body-secondary small mb-4">
                <CIcon icon={cilCalendar} size="sm" />
                <span>Member since {formatDate(profile.createdAt)}</span>
              </div>

              {!isOwnProfile && isAuthenticated && (
                <div className="d-flex flex-column gap-2">
                  <CButton
                    color="primary"
                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => navigate(`/messages/${id}`)}
                  >
                    <CIcon icon={cilEnvelopeOpen} size="sm" />
                    Send Message
                  </CButton>

                  {canReview && (
                    <CButton
                      color="outline-warning"
                      className="w-100 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => setReviewModalVisible(true)}
                    >
                      <CIcon icon={cilStar} size="sm" />
                      Leave a Review
                    </CButton>
                  )}
                </div>
              )}

              {isOwnProfile && (
                <CButton
                  color="outline-primary"
                  className="w-100"
                  onClick={() => navigate('/profile')}
                >
                  Edit Your Profile
                </CButton>
              )}
            </CCardBody>
          </CCard>

          <CCard className="border-0 shadow-sm">
            <CCardBody className="p-4">
              <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                <CIcon icon={cilBadge} size="sm" />
                Skills
              </h6>

              {profile.skills && profile.skills.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <CBadge
                      key={skill.skillId || idx}
                      color="primary"
                      className="px-3 py-2"
                      shape="rounded-pill"
                    >
                      {skill.skillName}
                      {skill.activeOffersCount > 0 && (
                        <span className="ms-1 opacity-75">({skill.activeOffersCount})</span>
                      )}
                    </CBadge>
                  ))}
                </div>
              ) : (
                <p className="text-body-secondary mb-0">No skills listed</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={8}>
          <CCard className="border-0 shadow-sm">
            <CCardBody className="p-0">
              <CNav variant="tabs" className="px-4 pt-3">
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'about'}
                    onClick={() => setActiveTab('about')}
                    style={{ cursor: 'pointer' }}
                  >
                    <CIcon icon={cilUser} size="sm" className="me-2" />
                    About
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'offers'}
                    onClick={() => setActiveTab('offers')}
                    style={{ cursor: 'pointer' }}
                  >
                    <CIcon icon={cilBriefcase} size="sm" className="me-2" />
                    Offers ({offers.length})
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 'reviews'}
                    onClick={() => setActiveTab('reviews')}
                    style={{ cursor: 'pointer' }}
                  >
                    <CIcon icon={cilStar} size="sm" className="me-2" />
                    Reviews ({reviewsSummary.totalReviews})
                  </CNavLink>
                </CNavItem>
              </CNav>

              <CTabContent className="p-4">
                <CTabPane visible={activeTab === 'about'}>
                  <h5 className="fw-semibold mb-3">About {profile.name}</h5>

                  {profile.description ? (
                    <p className="text-body-secondary" style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                      {profile.description}
                    </p>
                  ) : (
                    <p className="text-body-tertiary fst-italic">
                      This user hasn't added a description yet.
                    </p>
                  )}

                  {!isOwnProfile && isAuthenticated && (
                    <div className="mt-4 pt-4 border-top">
                      {canReview ? (
                        <CAlert color="success" className="d-flex align-items-center">
                          <CIcon icon={cilCheckCircle} className="me-2" />
                          <div>
                            <strong>You can leave a review!</strong>
                            <p className="mb-0 small">You have completed an agreement with {profile.name}.</p>
                          </div>
                        </CAlert>
                      ) : (
                        <CAlert color="info" className="d-flex align-items-center">
                          <CIcon icon={cilPeople} className="me-2" />
                          <div>
                            <strong>Complete an agreement to leave a review</strong>
                            <p className="mb-0 small">Reviews can only be left after completing a skill barter agreement.</p>
                          </div>
                        </CAlert>
                      )}
                    </div>
                  )}
                </CTabPane>

                <CTabPane visible={activeTab === 'offers'}>
                  <h5 className="fw-semibold mb-3">{profile.name}'s Offers</h5>

                  {offersLoading ? (
                    <div className="text-center py-4">
                      <CSpinner color="primary" />
                    </div>
                  ) : offers.length > 0 ? (
                    <CListGroup>
                      {offers.map((offer) => (
                        <CListGroupItem
                          key={offer.id}
                          className="d-flex justify-content-between align-items-start p-3"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/offers/${offer.id}`)}
                        >
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <h6 className="mb-0 fw-semibold">{offer.title}</h6>
                              <CBadge color="primary" size="sm">
                                {offer.skillName || 'General'}
                              </CBadge>
                            </div>
                            <p className="text-body-secondary small mb-0" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}>
                              {offer.description || 'No description'}
                            </p>
                          </div>
                          <div className="text-end ms-3">
                            <small className="text-body-secondary">
                              {getRelativeTime(offer.createdAt)}
                            </small>
                          </div>
                        </CListGroupItem>
                      ))}
                    </CListGroup>
                  ) : (
                    <div className="text-center py-5">
                      <CIcon icon={cilBriefcase} size="3xl" className="text-body-tertiary mb-3" />
                      <p className="text-body-secondary">No offers yet</p>
                    </div>
                  )}
                </CTabPane>

                <CTabPane visible={activeTab === 'reviews'}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-semibold mb-0">Reviews for {profile.name}</h5>
                    {canReview && (
                      <CButton
                        color="warning"
                        size="sm"
                        onClick={() => setReviewModalVisible(true)}
                      >
                        <CIcon icon={cilStar} size="sm" className="me-1" />
                        Leave Review
                      </CButton>
                    )}
                  </div>

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
                          className="mb-2 rounded-pill"
                          value={((reviewsSummary.averageRating || 0) / 11) * 100}
                          color="warning"
                          style={{ height: '10px', backgroundColor: 'transparent' }}
                        />
                        <small className="text-body-secondary">
                          Overall rating based on {reviewsSummary.totalReviews} reviews
                        </small>
                      </div>
                    </CCardBody>
                  </CCard>

                  {reviewsLoading ? (
                    <div className="text-center py-4">
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
                        Be the first to review {profile.name} after completing a barter!
                      </p>
                    </div>
                  )}
                </CTabPane>
              </CTabContent>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Leave a Review for {profile.name}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmitReview}>
          <CModalBody>
            <div className="mb-4">
              <CFormLabel htmlFor="agreementId">Select Agreement *</CFormLabel>
              <CFormSelect
                id="agreementId"
                value={reviewForm.agreementId}
                onChange={(e) => setReviewForm({ ...reviewForm, agreementId: e.target.value })}
                required
              >
                <option value="">Choose an agreement...</option>
                {eligibleAgreements.map((agreement) => (
                  <option key={agreement.id} value={agreement.id}>
                    {agreement.offerTitle} - {formatDate(agreement.createdAt)}
                  </option>
                ))}
              </CFormSelect>
              <div className="form-text">Select the agreement this review is for</div>
            </div>

            <div className="mb-4">
              <CFormLabel>Rating * (1-11)</CFormLabel>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <div className="d-flex gap-1 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((value) => (
                    <CButton
                      key={value}
                      color={value <= reviewForm.rating ? 'warning' : 'light'}
                      size="sm"
                      onClick={() => setReviewForm({ ...reviewForm, rating: value })}
                      style={{
                        minWidth: '36px',
                        fontWeight: value === reviewForm.rating ? 'bold' : 'normal'
                      }}
                    >
                      {value}
                    </CButton>
                  ))}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <CIcon icon={cilStar} size="lg" className="text-warning" />
                  <span className="fs-4 fw-semibold text-warning">{reviewForm.rating}/11</span>
                </div>
              </div>
              <div className="form-text mt-2">
                1 = Poor, 6 = Average, 11 = Excellent
              </div>
            </div>

            <div className="mb-3">
              <CFormLabel htmlFor="reviewBody">Your Review (Optional)</CFormLabel>
              <CFormTextarea
                id="reviewBody"
                value={reviewForm.body}
                onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                rows={4}
                maxLength={1000}
                placeholder="Share your experience working with this person..."
              />
              <div className="form-text">
                {reviewForm.body.length}/1000 characters
              </div>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => setReviewModalVisible(false)}
              disabled={submittingReview}
            >
              Cancel
            </CButton>
            <CButton color="warning" type="submit" disabled={submittingReview}>
              {submittingReview ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CIcon icon={cilStar} size="sm" className="me-2" />
                  Submit Review
                </>
              )}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </div>
  )
}

export default UserProfile

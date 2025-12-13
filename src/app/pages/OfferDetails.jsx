import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  CAlert,
  CAvatar,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilArrowLeft,
  cilStar,
  cilUser,
  cilEnvelopeOpen,
  cilCalendar,
  cilLocationPin,
  cilLayers,
  cilClock,
} from '@coreui/icons'
import httpClient from '../services/httpClient'
import { useAuth } from '../contexts/AuthContext'

const OfferDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [offer, setOffer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const fetchOffer = async () => {
      try {
        setLoading(true)
        setError('')
        const { data } = await httpClient.get(`/offers/${id}`)
        if (!cancelled) {
          setOffer(data || null)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load offer details. Please try again.')
          console.error('Error loading offer detail:', err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (id) {
      fetchOffer()
    }

    return () => {
      cancelled = true
    }
  }, [id])

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getMemberSince = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
  }

  const getStatusColor = (statusCode, statusLabel) => {
    const status = (statusLabel || statusCode || '').toLowerCase()
    if (status.includes('active') || status.includes('open')) return 'success'
    if (status.includes('paused') || status.includes('pending')) return 'warning'
    if (status.includes('completed') || status.includes('closed')) return 'secondary'
    return 'info'
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

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating || 0)
    const hasHalf = (rating || 0) - fullStars >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <CIcon key={i} icon={cilStar} size="sm" className="text-warning" />
        )
      } else if (i === fullStars && hasHalf) {
        stars.push(
          <CIcon key={i} icon={cilStar} size="sm" className="text-warning opacity-50" />
        )
      } else {
        stars.push(
          <CIcon key={i} icon={cilStar} size="sm" className="text-body-tertiary" />
        )
      }
    }
    return stars
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
          onClick={() => navigate('/offers')}
        >
          <CIcon icon={cilArrowLeft} size="sm" />
          Back to offers
        </CButton>
        <CAlert color="danger">{error}</CAlert>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="py-4">
        <CButton
          color="link"
          className="p-0 mb-3 text-decoration-none d-flex align-items-center gap-1"
          onClick={() => navigate('/offers')}
        >
          <CIcon icon={cilArrowLeft} size="sm" />
          Back to offers
        </CButton>
        <CAlert color="secondary">Offer not found.</CAlert>
      </div>
    )
  }

  const skillName = offer.skillName || `Skill #${offer.skillId}` || 'General'
  const statusText = offer.statusLabel || offer.statusCode || 'Active'
  const statusColor = getStatusColor(offer.statusCode, offer.statusLabel)
  const providerName = offer.owner?.name || offer.ownerName || 'Anonymous'
  const providerId = offer.owner?.id || offer.ownerId
  const rating = offer.owner?.rating ?? offer.rating
  const reviewCount = offer.owner?.reviewCount ?? offer.reviewCount ?? 0
  const avatarUrl = offer.owner?.avatarUrl || offer.avatarUrl
  const memberSince = getMemberSince(offer.owner?.createdAt || offer.owner?.memberSince)
  const tags = offer.tags || []
  const reviews = offer.reviews || []
  const location = offer.location || offer.owner?.location
  const availability = offer.availability

  return (
    <div className="offer-details-page">
      <CButton
        color="link"
        className="p-0 mb-4 text-decoration-none d-flex align-items-center gap-1"
        onClick={() => navigate('/offers')}
      >
        <CIcon icon={cilArrowLeft} size="sm" />
        Back to offers
      </CButton>

      <CRow className="g-4">
        <CCol lg={8} className="order-2 order-lg-1">
          <div className="mb-4">
            <div className="d-flex flex-wrap gap-2 mb-3">
              <CBadge color="primary" shape="rounded-pill" className="px-3 py-2">
                {skillName}
              </CBadge>
              <CBadge color={statusColor} shape="rounded-pill" className="px-3 py-2">
                {statusText}
              </CBadge>
            </div>

            <h1 className="fw-bold mb-3" style={{ fontSize: '2rem', lineHeight: 1.2 }}>
              {offer.title}
            </h1>

            <div className="d-flex align-items-center gap-3 text-body-secondary">
              <span className="d-flex align-items-center gap-1">
                by <strong className="text-body">{providerName}</strong>
              </span>
              <span className="text-body-tertiary">·</span>
              {rating != null ? (
                <span className="d-flex align-items-center gap-1">
                  <CIcon icon={cilStar} size="sm" className="text-warning" />
                  <span>{Number(rating).toFixed(1)}</span>
                  <span>({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
                </span>
              ) : (
                <span className="fst-italic">No reviews yet</span>
              )}
            </div>
          </div>

          <CCard className="border-0 shadow-sm mb-4">
            <CCardBody className="p-4">
              <h5 className="fw-semibold mb-3">Overview</h5>
              <div
                className="text-body-secondary"
                style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
              >
                {offer.description || 'No description provided.'}
              </div>
            </CCardBody>
          </CCard>

          {(tags.length > 0 || location || availability) && (
            <CCard className="border-0 shadow-sm mb-4">
              <CCardBody className="p-4">
                <h5 className="fw-semibold mb-3">Details</h5>

                {tags.length > 0 && (
                  <div className="mb-3">
                    <div className="text-body-secondary small mb-2">Tags</div>
                    <div className="d-flex flex-wrap gap-2">
                      {tags.map((tag, idx) => (
                        <CBadge
                          key={idx}
                          color="light"
                          textColor="dark"
                          className="px-3 py-2 fw-normal"
                        >
                          {tag}
                        </CBadge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="d-flex flex-wrap gap-4">
                  {location && (
                    <div className="d-flex align-items-center gap-2 text-body-secondary">
                      <CIcon icon={cilLocationPin} size="sm" />
                      <span>{location}</span>
                    </div>
                  )}
                  {availability && (
                    <div className="d-flex align-items-center gap-2 text-body-secondary">
                      <CIcon icon={cilClock} size="sm" />
                      <span>{availability}</span>
                    </div>
                  )}
                </div>

                <div className="d-flex flex-wrap gap-4 mt-3 pt-3 border-top text-body-secondary small">
                  <div className="d-flex align-items-center gap-2">
                    <CIcon icon={cilCalendar} size="sm" />
                    <span>Created {getRelativeTime(offer.createdAt) || formatDate(offer.createdAt)}</span>
                  </div>
                  {offer.updatedAt && offer.updatedAt !== offer.createdAt && (
                    <div className="d-flex align-items-center gap-2">
                      <span>Updated {getRelativeTime(offer.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </CCardBody>
            </CCard>
          )}

          <CCard className="border-0 shadow-sm">
            <CCardBody className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-semibold mb-0">Reviews</h5>
                {reviewCount > 0 && (
                  <span className="text-body-secondary small">{reviewCount} total</span>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="d-flex flex-column gap-4">
                  {reviews.slice(0, 3).map((review, idx) => (
                    <div
                      key={review.id || idx}
                      className={idx < reviews.slice(0, 3).length - 1 ? 'pb-4 border-bottom' : ''}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <CAvatar
                            color="secondary"
                            textColor="white"
                            size="sm"
                            src={review.reviewer?.avatarUrl}
                          >
                            {!review.reviewer?.avatarUrl &&
                              getInitials(review.reviewer?.name || review.reviewerName)}
                          </CAvatar>
                          <span className="fw-medium">
                            {review.reviewer?.name || review.reviewerName || 'Anonymous'}
                          </span>
                        </div>
                        <span className="text-body-secondary small">
                          {getRelativeTime(review.createdAt)}
                        </span>
                      </div>
                      <div className="d-flex gap-1 mb-2">{renderStars(review.rating)}</div>
                      <p className="text-body-secondary mb-0" style={{ lineHeight: 1.6 }}>
                        {review.comment || review.text}
                      </p>
                    </div>
                  ))}

                  {reviews.length > 3 && (
                    <CButton
                      color="link"
                      className="p-0 text-decoration-none align-self-start"
                    >
                      View all {reviewCount} reviews
                    </CButton>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-body-tertiary mb-2">
                    <CIcon icon={cilStar} size="xl" />
                  </div>
                  <p className="text-body-secondary mb-0">No reviews yet</p>
                  <p className="text-body-tertiary small">
                    Be the first to review after completing a barter!
                  </p>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={4} className="order-1 order-lg-2">
          <div className="sticky-lg-top" style={{ top: '1.5rem' }}>
            <CCard className="border-0 shadow-sm mb-4">
              <CCardBody className="p-4">
                <CButton
                  color="primary"
                  className="w-100 py-2 mb-3 fw-semibold"
                  size="lg"
                  disabled={!isAuthenticated}
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate(`/offers/${id}/request`)
                    }
                  }}
                >
                  Request this Offer
                </CButton>

                <CButton
                  color="outline-primary"
                  className="w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                  disabled={!isAuthenticated}
                  onClick={() => {
                    if (isAuthenticated && providerId) {
                      navigate(`/messages/${providerId}`)
                    }
                  }}
                >
                  <CIcon icon={cilEnvelopeOpen} size="sm" />
                  Message Provider
                </CButton>

                {!isAuthenticated && (
                  <p className="text-body-secondary text-center small mt-3 mb-0">
                    <Link to="/login" className="text-decoration-none">
                      Log in
                    </Link>{' '}
                    to request this offer or message the provider.
                  </p>
                )}
              </CCardBody>
            </CCard>

            <CCard className="border-0 shadow-sm mb-4">
              <CCardBody className="p-4">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <CAvatar
                    color="primary"
                    textColor="white"
                    size="xl"
                    src={avatarUrl}
                    style={{ width: '64px', height: '64px', fontSize: '1.25rem' }}
                  >
                    {!avatarUrl && getInitials(providerName)}
                  </CAvatar>
                  <div>
                    <h6 className="fw-semibold mb-1">{providerName}</h6>
                    {rating != null ? (
                      <div className="d-flex align-items-center gap-1">
                        <div className="d-flex gap-0">{renderStars(rating)}</div>
                        <span className="text-body-secondary small ms-1">
                          {Number(rating).toFixed(1)} ({reviewCount})
                        </span>
                      </div>
                    ) : (
                      <span className="text-body-tertiary small fst-italic">New member</span>
                    )}
                  </div>
                </div>

                {memberSince && (
                  <div className="d-flex align-items-center gap-2 text-body-secondary small mb-3">
                    <CIcon icon={cilUser} size="sm" />
                    <span>Member since {memberSince}</span>
                  </div>
                )}

                {providerId && (
                  <CButton
                    color="light"
                    className="w-100"
                    onClick={() => navigate(`/users/${providerId}`)}
                  >
                    View Profile
                  </CButton>
                )}
              </CCardBody>
            </CCard>

            <CCard className="border-0 shadow-sm">
              <CCardBody className="p-4">
                <h6 className="fw-semibold mb-3 text-body-secondary small text-uppercase">
                  Offer Details
                </h6>

                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-start gap-3">
                    <CIcon icon={cilLayers} size="sm" className="text-body-tertiary mt-1" />
                    <div>
                      <div className="text-body-secondary small">Category</div>
                      <div className="fw-medium">{skillName}</div>
                    </div>
                  </div>

                  {location && (
                    <div className="d-flex align-items-start gap-3">
                      <CIcon icon={cilLocationPin} size="sm" className="text-body-tertiary mt-1" />
                      <div>
                        <div className="text-body-secondary small">Location</div>
                        <div className="fw-medium">{location}</div>
                      </div>
                    </div>
                  )}

                  {!location && (
                    <div className="d-flex align-items-start gap-3">
                      <CIcon icon={cilLocationPin} size="sm" className="text-body-tertiary mt-1" />
                      <div>
                        <div className="text-body-secondary small">Location</div>
                        <div className="fw-medium">Remote</div>
                      </div>
                    </div>
                  )}

                  {availability && (
                    <div className="d-flex align-items-start gap-3">
                      <CIcon icon={cilClock} size="sm" className="text-body-tertiary mt-1" />
                      <div>
                        <div className="text-body-secondary small">Availability</div>
                        <div className="fw-medium">{availability}</div>
                      </div>
                    </div>
                  )}

                  <div className="d-flex align-items-start gap-3">
                    <CIcon icon={cilCalendar} size="sm" className="text-body-tertiary mt-1" />
                    <div>
                      <div className="text-body-secondary small">Posted</div>
                      <div className="fw-medium">{formatDate(offer.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </div>
        </CCol>
      </CRow>
    </div>
  )
}

export default OfferDetails

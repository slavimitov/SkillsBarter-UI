import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAlert,
  CAvatar,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilStar, cilUser, cilCalendar, cilArrowRight } from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext'
import httpClient from '../services/httpClient'

const Offers = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [offers, setOffers] = useState([])
  const [skillsMap, setSkillsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [skillsLoaded, setSkillsLoaded] = useState(false)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skillsRes = await httpClient.get('/skills', { params: { pageSize: 200 } })
        const skillsPayload = skillsRes?.data
        const skillsItems = Array.isArray(skillsPayload) ? skillsPayload : skillsPayload?.items
        const map = {}
        ;(Array.isArray(skillsItems) ? skillsItems : []).forEach((s) => {
          if (s?.id != null) {
            map[s.id] = s.name || `Skill #${s.id}`
          }
        })
        setSkillsMap(map)
        setSkillsLoaded(true)
      } catch (err) {
        console.error('Error loading skills:', err)
        setSkillsLoaded(true)
      }
    }
    fetchSkills()
  }, [])

  useEffect(() => {
    if (!skillsLoaded) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        const params = {
          pageSize: 50,
        }

        if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
          params.q = debouncedSearchTerm.trim()
        }

        if (categoryFilter) {
          const skillEntry = Object.entries(skillsMap).find(([_, name]) => name === categoryFilter)
          if (skillEntry) {
            params.skillId = parseInt(skillEntry[0])
          }
        }

        const offersRes = await httpClient.get('/offers', { params })
        const offersPayload = offersRes?.data
        const offersItems = Array.isArray(offersPayload) ? offersPayload : offersPayload?.items

        setOffers(Array.isArray(offersItems) ? offersItems : [])
      } catch (err) {
        setError('Failed to load offers. Please try again.')
        console.error('Error loading offers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [debouncedSearchTerm, categoryFilter, skillsLoaded])

  const handleCreateOffer = () => {
    navigate(isAuthenticated ? '/offers/new' : '/login')
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

  const getSkillName = (skillId) => {
    if (skillId == null) return 'General'
    return skillsMap[skillId] || 'General'
  }

  const truncateText = (text, maxLength = 120) => {
    if (!text) return 'No description provided.'
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  const getStatusColor = (statusCode, statusLabel) => {
    const status = (statusLabel || statusCode || '').toLowerCase()
    if (status.includes('active') || status.includes('open')) return 'success'
    if (status.includes('paused') || status.includes('pending')) return 'warning'
    if (status.includes('completed') || status.includes('closed')) return 'secondary'
    return 'info'
  }

  const isActiveStatus = (statusCode, statusLabel) => {
    const status = (statusLabel || statusCode || '').toLowerCase()
    return status.includes('active') || status.includes('open') || status === ''
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

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(Object.values(skillsMap))).sort()
  }, [skillsMap])

  const filteredOffers = useMemo(() => {
    let result = [...offers]


    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }

    return result
  }, [offers, sortBy])

  const hasOffers = filteredOffers.length > 0

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    )
  }

  return (
    <div className="offers-page">
      <CRow className="mb-4 align-items-center">
        <CCol>
          <h2 className="mb-1 fw-bold">Browse Offers</h2>
          <p className="text-body-secondary mb-0">
            Discover skills people are offering to barter
          </p>
        </CCol>
        <CCol xs="auto">
          <CButton color="primary" onClick={handleCreateOffer} className="px-4">
            + Create Offer
          </CButton>
        </CCol>
      </CRow>

      <CCard className="mb-4 border-0 shadow-sm">
        <CCardBody className="py-3">
          <CRow className="g-3 align-items-center">
            <CCol md={5} lg={4}>
              <CFormInput
                type="search"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CCol>
            <CCol md={4} lg={3}>
              <CFormSelect
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3} lg={2}>
              <CFormSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="rating">Top Rated</option>
              </CFormSelect>
            </CCol>
            <CCol lg={3} className="text-lg-end">
              <span className="text-body-secondary small">
                {filteredOffers.length} offer{filteredOffers.length !== 1 ? 's' : ''} found
              </span>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {error && (
        <CAlert color="danger" dismissible onClose={() => setError('')}>
          {error}
        </CAlert>
      )}

      {!hasOffers && !error && (
        <CCard className="border-0 shadow-sm text-center py-5">
          <CCardBody>
            <div className="text-body-secondary mb-3">
              <CIcon icon={cilUser} size="3xl" />
            </div>
            <h5 className="text-body-secondary">No offers found</h5>
            <p className="text-body-secondary mb-4">
              {searchTerm || categoryFilter
                ? 'Try adjusting your filters or search term.'
                : 'Be the first to create an offer!'}
            </p>
            <CButton color="primary" onClick={handleCreateOffer}>
              Create an Offer
            </CButton>
          </CCardBody>
        </CCard>
      )}

      {hasOffers && (
        <CRow className="g-4">
          {filteredOffers.map((offer) => {
            const skillName = getSkillName(offer.skillId)
            const isActive = isActiveStatus(offer.statusCode, offer.statusLabel)
            const statusText = offer.statusLabel || offer.statusCode
            const providerName = offer.owner?.name || offer.ownerName || 'Anonymous'
            const rating = offer.owner?.rating ?? offer.rating
            const reviewCount = offer.owner?.reviewCount ?? offer.reviewCount ?? 0
            const relativeTime = getRelativeTime(offer.createdAt)
            const tags = offer.tags || []

            return (
              <CCol key={offer.id} sm={12} lg={6}>
                <CCard
                  className="h-100 border-0 shadow-sm offer-card"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => navigate(`/offers/${offer.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 0.5rem 1.5rem rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = ''
                  }}
                >
                  <CCardBody className="d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <CBadge color="primary" shape="rounded-pill" className="px-3 py-1">
                          {skillName}
                        </CBadge>
                        {!isActive && statusText && (
                          <CBadge
                            color={getStatusColor(offer.statusCode, offer.statusLabel)}
                            shape="rounded-pill"
                            className="px-2 py-1"
                          >
                            {statusText}
                          </CBadge>
                        )}
                      </div>
                      {relativeTime && (
                        <span className="text-body-secondary small d-flex align-items-center gap-1">
                          <CIcon icon={cilCalendar} size="sm" />
                          {relativeTime}
                        </span>
                      )}
                    </div>

                    <h5 className="fw-semibold mb-2" style={{ lineHeight: 1.3 }}>
                      {offer.title}
                    </h5>

                    <p
                      className="text-body-secondary mb-3 flex-grow-1"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.6,
                      }}
                    >
                      {truncateText(offer.description, 150)}
                    </p>

                    {tags.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {tags.slice(0, 4).map((tag, idx) => (
                          <CBadge
                            key={idx}
                            color="light"
                            textColor="secondary"
                            className="fw-normal px-2 py-1"
                            style={{ fontSize: '0.75rem' }}
                          >
                            {tag}
                          </CBadge>
                        ))}
                        {tags.length > 4 && (
                          <CBadge
                            color="light"
                            textColor="secondary"
                            className="fw-normal px-2 py-1"
                            style={{ fontSize: '0.75rem' }}
                          >
                            +{tags.length - 4}
                          </CBadge>
                        )}
                      </div>
                    )}

                    <div
                      className="d-flex justify-content-between align-items-center pt-3 mt-auto"
                      style={{ borderTop: '1px solid var(--cui-border-color)' }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <CAvatar
                          color="primary"
                          textColor="white"
                          size="md"
                          src={offer.owner?.avatarUrl || offer.avatarUrl}
                        >
                          {!offer.owner?.avatarUrl && !offer.avatarUrl && getInitials(providerName)}
                        </CAvatar>
                        <div>
                          <div className="fw-medium small">{providerName}</div>
                          <div className="d-flex align-items-center gap-1 text-body-secondary small">
                            {rating != null ? (
                              <>
                                <CIcon icon={cilStar} size="sm" className="text-warning" />
                                <span>{Number(rating).toFixed(1)}</span>
                                <span className="text-body-tertiary">·</span>
                                <span>
                                  {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                                </span>
                              </>
                            ) : (
                              <span className="text-body-tertiary fst-italic">No reviews yet</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <CButton
                        color="primary"
                        variant="ghost"
                        size="sm"
                        className="d-flex align-items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/offers/${offer.id}`)
                        }}
                      >
                        View offer
                        <CIcon icon={cilArrowRight} size="sm" />
                      </CButton>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            )
          })}
        </CRow>
      )}
    </div>
  )
}

export default Offers

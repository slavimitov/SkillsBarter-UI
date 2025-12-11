import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardText,
  CCardTitle,
  CListGroup,
  CListGroupItem,
  CSpinner,
} from '@coreui/react'
import { useAuth } from '../contexts/AuthContext'
import httpClient from '../services/httpClient'

const Offers = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [offers, setOffers] = useState([])
  const [skillsMap, setSkillsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        const [offersRes, skillsRes] = await Promise.all([
          httpClient.get('/offers', { params: { pageSize: 50 } }),
          httpClient.get('/skills', { params: { pageSize: 200 } }),
        ])

        const offersPayload = offersRes?.data
        const offersItems = Array.isArray(offersPayload) ? offersPayload : offersPayload?.items
        const skillsPayload = skillsRes?.data
        const skillsItems = Array.isArray(skillsPayload) ? skillsPayload : skillsPayload?.items

        if (!cancelled) {
          setOffers(Array.isArray(offersItems) ? offersItems : [])
          const map = {}
          ;(Array.isArray(skillsItems) ? skillsItems : []).forEach((s) => {
            if (s?.id != null) {
              map[s.id] = s.name || `Skill #${s.id}`
            }
          })
          setSkillsMap(map)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load offers. Please try again.')
          console.error('Error loading offers:', err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [])

  const handleCreateOffer = () => {
    navigate(isAuthenticated ? '/offers/create' : '/login')
  }

  const hasOffers = useMemo(() => Array.isArray(offers) && offers.length > 0, [offers])

  const renderStatusBadge = (offer) => {
    const status = offer?.statusLabel || offer?.statusCode || 'Unknown'
    return (
      <CBadge color="primary" shape="rounded-pill">
        {status}
      </CBadge>
    )
  }

  const renderSkill = (skillId) => {
    if (skillId == null) return 'Unspecified'
    return skillsMap[skillId] || `Skill #${skillId}`
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <CCardTitle className="mb-0">Offers</CCardTitle>
          <CButton color="primary" onClick={handleCreateOffer}>
            Create Offer
          </CButton>
        </div>

        {error && (
          <CAlert color="danger" dismissible onClose={() => setError('')}>
            {error}
          </CAlert>
        )}

        {!hasOffers && !error && <CAlert color="secondary">No offers found.</CAlert>}

        {hasOffers && (
          <CListGroup flush>
            {offers.map((offer) => (
              <CListGroupItem
                key={offer.id}
                className="d-flex justify-content-between align-items-start"
                action
                onClick={() => navigate(`/offers/${offer.id}`)}
                role="button"
              >
                <div className="ms-0">
                  <div className="fw-semibold d-flex align-items-center gap-2">
                    {offer.title}
                    {renderStatusBadge(offer)}
                  </div>
                  <CCardText className="mb-1 text-body-secondary">
                    {offer.description || 'No description provided.'}
                  </CCardText>
                  <small className="text-body-secondary">
                    Skill: {renderSkill(offer.skillId)} • Created:{' '}
                    {offer.createdAt ? new Date(offer.createdAt).toLocaleString() : 'n/a'}
                  </small>
                </div>
              </CListGroupItem>
            ))}
          </CListGroup>
        )}
      </CCardBody>
    </CCard>
  )
}

export default Offers


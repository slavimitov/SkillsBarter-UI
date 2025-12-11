import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import httpClient from '../services/httpClient'

const OfferDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

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

  const renderStatus = (statusCode, statusLabel) => {
    const text = statusLabel || statusCode || 'Unknown'
    return (
      <CBadge color="primary" className="ms-2">
        {text}
      </CBadge>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (error) {
    return (
      <CAlert color="danger" dismissible onClose={() => setError('')}>
        {error}
      </CAlert>
    )
  }

  if (!offer) {
    return (
      <CAlert color="secondary" dismissible onClose={() => navigate('/offers')}>
        Offer not found.
      </CAlert>
    )
  }

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardBody>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <CCardTitle className="mb-0">{offer.title}</CCardTitle>
            {renderStatus(offer.statusCode, offer.statusLabel)}
          </div>
          <CButton color="secondary" size="sm" onClick={() => navigate('/offers')}>
            Back to Offers
          </CButton>
        </div>
        <CListGroup flush className="mt-3">
          <CListGroupItem>
            <strong>Description:</strong>{' '}
            {offer.description ? offer.description : 'No description provided.'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Skill:</strong> {offer.skillName || `Skill #${offer.skillId}`}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Owner:</strong> {offer.owner?.name || 'Unknown'} (rating:{' '}
            {offer.owner?.rating ?? 'n/a'})
          </CListGroupItem>
          <CListGroupItem>
            <strong>Created:</strong>{' '}
            {offer.createdAt ? new Date(offer.createdAt).toLocaleString() : 'n/a'}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Updated:</strong>{' '}
            {offer.updatedAt ? new Date(offer.updatedAt).toLocaleString() : 'n/a'}
          </CListGroupItem>
        </CListGroup>
      </CCardBody>
    </CCard>
  )
}

export default OfferDetails


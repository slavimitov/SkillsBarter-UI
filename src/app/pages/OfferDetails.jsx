import React from 'react'
import { useParams } from 'react-router-dom'
import { CBadge, CCard, CCardBody, CCardText, CCardTitle } from '@coreui/react'

const mockOffers = {
  1: {
    title: 'Web Development Help',
    category: 'Programming',
    description:
      'I offer mentoring and help with frontend development (HTML, CSS, JavaScript, React).',
    provider: 'John Doe',
  },
  2: {
    title: 'Graphic Design Logo Package',
    category: 'Design',
    description: 'Professional logo package including 3 concepts and unlimited revisions.',
    provider: 'Anna Smith',
  },
  3: {
    title: 'Guitar Lessons for Beginners',
    category: 'Music',
    description: 'Online guitar lessons for complete beginners. Learn chords, rhythm, and songs.',
    provider: 'Mark Lee',
  },
}

const OfferDetails = () => {
  const { id } = useParams()
  const offer = mockOffers[id]

  if (!offer) {
    return (
      <CCard className="mb-4 shadow-sm">
        <CCardBody>
          <CCardTitle>Offer Not Found</CCardTitle>
          <CCardText>This offer does not exist or is unavailable.</CCardText>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardBody>
        <CCardTitle>{offer.title}</CCardTitle>

        <CBadge color="info" className="mb-3">
          {offer.category}
        </CBadge>

        <CCardText className="mt-3">
          <strong>Description:</strong>
          <br />
          {offer.description}
        </CCardText>

        <CCardText className="mt-3">
          <strong>Provider:</strong> {offer.provider}
        </CCardText>
      </CCardBody>
    </CCard>
  )
}

export default OfferDetails

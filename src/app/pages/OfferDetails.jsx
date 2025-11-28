import React from 'react'
import { useParams } from 'react-router-dom'
import { CBadge, CCard, CCardBody, CCardText, CCardTitle } from '@coreui/react'

const OfferDetails = () => {
  const { id } = useParams()

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardBody>
        <CCardTitle>Offer #{id}</CCardTitle>
        <CBadge color="info" className="mb-3">
          Coming soon
        </CBadge>
        <CCardText>
          Detailed information for this offer will appear here once the backend integration is
          wired up.
        </CCardText>
      </CCardBody>
    </CCard>
  )
}

export default OfferDetails


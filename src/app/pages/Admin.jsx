import React from 'react'
import { CBadge, CCard, CCardBody, CCardText, CCardTitle, CProgress } from '@coreui/react'

const Admin = () => {
  return (
    <CCard className="mb-4 shadow-sm">
      <CCardBody>
        <CCardTitle>Admin Console</CCardTitle>
        <CBadge color="warning" className="mb-3">
          Dashboard preview
        </CBadge>
        <CCardText className="mb-4">
          review flagged offers, and manage users from this dashboard once
          admin APIs are ready.
        </CCardText>
        <div className="mb-2">User onboarding</div>
        <CProgress value={60} className="mb-3" />
        <div className="mb-2">Offer approvals</div>
        <CProgress value={35} color="info" />
      </CCardBody>
    </CCard>
  )
}

export default Admin


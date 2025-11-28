import React from 'react'
import { CBadge, CButton, CCard, CCardBody, CCardText, CCardTitle } from '@coreui/react'

const Profile = () => {
  return (
    <CCard className="mb-4 shadow-sm">
      <CCardBody>
        <CCardTitle>Your Profile</CCardTitle>
        <CBadge color="success" className="mb-3">
          Editable soon
        </CBadge>
        <CCardText>
          Manage your bio, availability, and highlighted skills right here once profile editing is
          ready.
        </CCardText>
        <CButton color="primary" disabled>
          Update details
        </CButton>
      </CCardBody>
    </CCard>
  )
}

export default Profile


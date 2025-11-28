import React from 'react'
import { CCard, CCardBody, CCardText, CCardTitle } from '@coreui/react'

const Home = () => {
  return (
    <CCard className="mb-4 shadow-sm">
      <CCardBody>
        <CCardTitle>Welcome to Skills Barter</CCardTitle>
        <CCardText>
          Discover and exchange skills with other community members. Use the sidebar to jump into
          offers, messages, and more.
        </CCardText>
      </CCardBody>
    </CCard>
  )
}

export default Home


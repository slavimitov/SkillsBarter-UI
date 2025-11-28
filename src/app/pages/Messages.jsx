import React from 'react'
import { CCard, CCardBody, CCardText, CCardTitle } from '@coreui/react'

const Messages = () => {
  return (
    <CCard className="mb-4 shadow-sm">
      <CCardBody>
        <CCardTitle>Messages</CCardTitle>
        <CCardText>
          Centralize your barter conversations here. Threaded messaging and notifications will appear
          in this space.
        </CCardText>
      </CCardBody>
    </CCard>
  )
}

export default Messages


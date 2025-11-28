import React from 'react'
import { useParams } from 'react-router-dom'
import { CCard, CCardBody, CCardText, CCardTitle } from '@coreui/react'

const MessageThread = () => {
  const { threadId } = useParams()

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardBody>
        <CCardTitle>Thread #{threadId}</CCardTitle>
        <CCardText>
          Conversation history and real-time replies will show up here. This is a placeholder until
          messaging is connected to the API.
        </CCardText>
      </CCardBody>
    </CCard>
  )
}

export default MessageThread


import React from 'react'
import { useParams } from 'react-router-dom'
import { CCard, CCardBody, CCardTitle, CListGroup, CListGroupItem } from '@coreui/react'

const UserProfile = () => {
  const { id } = useParams()

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardBody>
        <CCardTitle>User Profile #{id}</CCardTitle>
        <CListGroup className="mt-3">
          <CListGroupItem>Skill tags</CListGroupItem>
          <CListGroupItem>Rating & reviews</CListGroupItem>
          <CListGroupItem>Recent offers</CListGroupItem>
        </CListGroup>
      </CCardBody>
    </CCard>
  )
}

export default UserProfile


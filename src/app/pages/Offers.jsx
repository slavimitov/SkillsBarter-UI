import React from 'react'
import { CCard, CCardBody, CCardText, CCardTitle, CListGroup, CListGroupItem } from '@coreui/react'

const Offers = () => {
  return (
    <CCard className="mb-4 shadow-sm">
      <CCardBody>
        <CCardTitle>Offers</CCardTitle>
        <CCardText>Browse community offers. This will soon be powered by live data.</CCardText>
        <CListGroup flush>
          <CListGroupItem>test offer</CListGroupItem>
          <CListGroupItem>test offer</CListGroupItem>
          <CListGroupItem>test offer</CListGroupItem>
        </CListGroup>
      </CCardBody>
    </CCard>
  )
}

export default Offers


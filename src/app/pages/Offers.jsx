import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardText,
  CCardTitle,
  CListGroup,
  CListGroupItem,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CButton,
} from '@coreui/react'
import { Link } from 'react-router-dom'

const mockOffers = [
  {
    id: '1',
    title: 'Web Development Help',
    category: 'Programming',
    description: 'I can assist with HTML, CSS, JavaScript and React projects.',
    provider: 'John Doe',
  },
  {
    id: '2',
    title: 'Graphic Design Logo Package',
    category: 'Design',
    description: 'Professional logo creation with 3 variations.',
    provider: 'Anna Smith',
  },
  {
    id: '3',
    title: 'Guitar Lessons for Beginners',
    category: 'Music',
    description: 'Start learning guitar from zero with personal online lessons.',
    provider: 'Mark Lee',
  },
]

const Offers = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const filteredOffers = mockOffers.filter((offer) => {
    const normalize = (str) => str.toLowerCase().replace(/\s+/g, ``) // маха интервали и прави lowercase
    const matchesSearch =
      normalize(offer.title).includes(normalize(search)) ||
      normalize(offer.description).includes(normalize(search))

    const matchesCategory = category === '' || offer.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardBody>
        <CCardTitle className="mb-3">Offers</CCardTitle>
        <CCardText>Browse community offers available on the platform.</CCardText>

        {/* Search + Filters */}
        <CRow className="mb-4">
          <CCol sm={6}>
            <CFormInput
              type="text"
              placeholder="Search offers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </CCol>
          <CCol sm={6}>
            <CFormSelect value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Music">Music</option>
            </CFormSelect>
          </CCol>
        </CRow>

        {/* Offer list */}
        <CListGroup flush>
          {filteredOffers.length === 0 ? (
            <CListGroupItem>No offers match your search.</CListGroupItem>
          ) : (
            filteredOffers.map((offer) => (
              <CListGroupItem key={offer.id} className="py-3">
                <h5>{offer.title}</h5>
                <small className="text-muted">{offer.category}</small>
                <p className="mt-2">{offer.description}</p>
                <p className="text-muted">Provider: {offer.provider}</p>

                <Link to={`/offers/${offer.id}`}>
                  <CButton color="primary" size="sm">
                    View Details
                  </CButton>
                </Link>
              </CListGroupItem>
            ))
          )}
        </CListGroup>
      </CCardBody>
    </CCard>
  )
}

export default Offers

import React from 'react'
import { CAvatar, CBadge, CButton, CCard, CCardBody, CCardText, CCardTitle } from '@coreui/react'

import avatar8 from 'src/template/assets/images/avatars/8.jpg'

import { useAuth } from '../contexts/AuthContext'

const getPrimaryRole = (roles) => {
  if (!Array.isArray(roles) || roles.length === 0) return null

  const priority = ['Admin', 'Moderator', 'Premium', 'Freemium']
  for (const r of priority) {
    if (roles.includes(r)) return r
  }
  return roles[0]
}

const getRoleCapsule = (role) => {
  switch (role) {
    case 'Admin':
      return { label: 'Admin', color: 'danger' }
    case 'Moderator':
      return { label: 'Moderator', color: 'warning' }
    case 'Premium':
      return { label: 'Premium Member', color: 'success' }
    case 'Freemium':
      return { label: 'Freemium', color: 'info' }
    default:
      return null
  }
}

const Profile = () => {
  const { user } = useAuth()
  const capsule = getRoleCapsule(getPrimaryRole(user?.roles))

  return (
    <CCard className="mb-4 shadow-sm">
      <CCardBody>
        <div className="d-flex align-items-center mb-3">
          <div className="position-relative me-3">
            <CAvatar src={avatar8} size="lg" />
            {capsule && (
              <CBadge
                color={capsule.color}
                className="position-absolute top-50 start-100 translate-middle-y ms-1 rounded-pill px-2 py-1"
              >
                {capsule.label}
              </CBadge>
            )}
          </div>
          <div>
            <CCardTitle className="mb-0">Your Profile</CCardTitle>
            {user?.userName && <small className="text-body-secondary">@{user.userName}</small>}
          </div>
        </div>
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


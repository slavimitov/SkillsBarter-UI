import React from 'react'
import {
  CAvatar,
  CBadge,
  CButton,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../app/contexts/AuthContext'

const getFirstLetter = (value) => {
  const text = (value || '').toString().trim()
  return text ? text[0].toUpperCase() : '?'
}

const stringToHslColor = (str, saturation = 65, lightness = 40) => {
  const input = (str || 'user').toString()
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue} ${saturation}% ${lightness}%)`
}

const AppHeaderDropdown = () => {
  const { logout, isAuthenticated, loading, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return (
      <CButton color="primary" variant="outline" size="sm" onClick={() => navigate('/login')}>
        Login
      </CButton>
    )
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar
          size="md"
          style={{
            backgroundColor: stringToHslColor(user?.email || user?.name || 'user'),
            color: '#fff',
            fontWeight: 700,
            userSelect: 'none',
          }}
        >
          {getFirstLetter(user?.name || user?.email)}
        </CAvatar>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        <CDropdownItem onClick={() => navigate('/messages')} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilEnvelopeOpen} className="me-2" />
          Messages
        </CDropdownItem>
        <CDropdownItem onClick={() => navigate('/proposals')} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilFile} className="me-2" />
          My Requests
        </CDropdownItem>
        <CDropdownItem onClick={() => navigate('/agreements')} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilTask} className="me-2" />
          My Agreements
        </CDropdownItem>
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
        <CDropdownItem onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown

import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormSelect,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { useAuth } from '../contexts/AuthContext'
import adminService from '../services/adminService'

const ROLES = ['Freemium', 'Premium', 'Moderator', 'Admin']
const ALLOWED_ROLES = ['Admin', 'Moderator']

const Admin = () => {
  const { user } = useAuth()
  const hasAccess = user?.roles?.some((role) => ALLOWED_ROLES.includes(role))

  if (!hasAccess) {
    return <Navigate to="/" replace />
  }
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [actionLoading, setActionLoading] = useState(null)
  const pageSize = 20

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await adminService.getUsers(page, pageSize)
      setUsers(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page])

  const handleBanToggle = async (user) => {
    try {
      setActionLoading(user.id)
      setError('')
      const result = await adminService.updateUserBan(user.id, !user.isBanned)
      setSuccess(result.message)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isBanned: !u.isBanned } : u))
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRoleChange = async (user, newRole) => {
    if (user.roles?.includes(newRole)) return
    try {
      setActionLoading(user.id)
      setError('')
      const result = await adminService.updateUserRole(user.id, newRole)
      setSuccess(result.message)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, roles: [newRole] } : u))
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role')
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'danger'
      case 'Moderator':
        return 'warning'
      case 'Premium':
        return 'info'
      default:
        return 'secondary'
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  if (loading && users.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <>
      <h2 className="mb-4">Admin Console</h2>

      {error && (
        <CAlert color="danger" dismissible onClose={() => setError('')}>
          {error}
        </CAlert>
      )}
      {success && (
        <CAlert color="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </CAlert>
      )}

      <CCard className="mb-4 shadow-sm">
        <CCardHeader>
          <strong>Users</strong> <span className="text-body-secondary">({total} total)</span>
        </CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Joined</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.map((user) => {
                const primaryRole = user.roles?.[0] || 'Freemium'
                const isAdmin = user.roles?.includes('Admin')
                const isLoading = actionLoading === user.id

                return (
                  <CTableRow key={user.id}>
                    <CTableDataCell>{user.name}</CTableDataCell>
                    <CTableDataCell>{user.email}</CTableDataCell>
                    <CTableDataCell>
                      <CFormSelect
                        size="sm"
                        value={primaryRole}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
                        disabled={isAdmin || isLoading}
                        style={{ width: '120px' }}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </CFormSelect>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={user.isBanned ? 'danger' : 'success'}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color={user.isBanned ? 'success' : 'danger'}
                        variant="outline"
                        size="sm"
                        onClick={() => handleBanToggle(user)}
                        disabled={isAdmin || isLoading}
                      >
                        {isLoading ? (
                          <CSpinner size="sm" />
                        ) : user.isBanned ? (
                          'Unban'
                        ) : (
                          'Ban'
                        )}
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                )
              })}
            </CTableBody>
          </CTable>

          {totalPages > 1 && (
            <CPagination className="mt-3">
              <CPaginationItem
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </CPaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <CPaginationItem disabled>...</CPaginationItem>}
                      <CPaginationItem active={p === page} onClick={() => setPage(p)}>
                        {p}
                      </CPaginationItem>
                    </React.Fragment>
                  )
                })}
              <CPaginationItem
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </CPaginationItem>
            </CPagination>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Admin

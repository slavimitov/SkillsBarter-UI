import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
    CAlert,
    CBadge,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CNav,
    CNavItem,
    CNavLink,
    CRow,
    CSpinner,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilArrowRight,
    cilCheckCircle,
    cilClock,
    cilWarning,
    cilPeople,
    cilStar,
} from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext'
import adminService from '../services/adminService'

const ALLOWED_ROLES = ['Admin', 'Moderator']

const getStatusBadge = (status) => {
    const statusMap = {
        0: { color: 'info', label: 'Awaiting Response' },
        1: { color: 'primary', label: 'Under Review' },
        2: { color: 'success', label: 'Resolved' },
        3: { color: 'warning', label: 'With Moderator' },
        4: { color: 'secondary', label: 'Closed' },
        'AwaitingResponse': { color: 'info', label: 'Awaiting Response' },
        'UnderReview': { color: 'primary', label: 'Under Review' },
        'Resolved': { color: 'success', label: 'Resolved' },
        'EscalatedToModerator': { color: 'warning', label: 'With Moderator' },
        'Closed': { color: 'secondary', label: 'Closed' },
    }
    const info = statusMap[status] || { color: 'secondary', label: status }
    return <CBadge color={info.color}>{info.label}</CBadge>
}

const getResolutionBadge = (resolution) => {
    if (resolution === null || resolution === undefined) return <CBadge color="secondary">Pending</CBadge>
    const resolutionMap = {
        0: { color: 'secondary', label: 'Pending' },
        1: { color: 'success', label: 'Favors Complainer' },
        2: { color: 'info', label: 'Favors Respondent' },
        3: { color: 'warning', label: 'Moderator Decision' },
        4: { color: 'secondary', label: 'Split' },
        'Pending': { color: 'secondary', label: 'Pending' },
        'FavorsComplainer': { color: 'success', label: 'Favors Complainer' },
        'FavorsRespondent': { color: 'info', label: 'Favors Respondent' },
        'ModeratorDecision': { color: 'warning', label: 'Moderator Decision' },
        'Split': { color: 'secondary', label: 'Split' },
    }
    const info = resolutionMap[resolution] || { color: 'secondary', label: resolution }
    return <CBadge color={info.color}>{info.label}</CBadge>
}

const getReasonLabel = (reasonCode) => {
    const reasonMap = {
        0: 'Non-Delivery',
        1: 'Quality Issue',
        2: 'Communication',
        3: 'Missed Deadline',
        4: 'Other',
        'NonDelivery': 'Non-Delivery',
        'QualityIssue': 'Quality Issue',
        'Communication': 'Communication',
        'Deadline': 'Missed Deadline',
        'Other': 'Other',
    }
    return reasonMap[reasonCode] || reasonCode
}

const AdminDisputes = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const hasAccess = user?.roles?.some((role) => ALLOWED_ROLES.includes(role))

    const [disputes, setDisputes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (hasAccess) {
            fetchDisputes()
        }
    }, [hasAccess])

    const fetchDisputes = async () => {
        try {
            setLoading(true)
            setError('')
            const data = await adminService.getDisputes()
            setDisputes(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Error fetching disputes:', err)
            setError(err.response?.data?.message || 'Failed to load disputes.')
        } finally {
            setLoading(false)
        }
    }

    if (!hasAccess) {
        return <Navigate to="/" replace />
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString()
    }

    if (loading && disputes.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <CSpinner color="primary" />
            </div>
        )
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>
                    <CIcon icon={cilWarning} className="me-2" />
                    Disputes Requiring Moderation
                </h2>
                <CButton color="secondary" variant="outline" onClick={() => navigate('/admin')}>
                    Back to Admin Console
                </CButton>
            </div>

            {error && (
                <CAlert color="danger" dismissible onClose={() => setError('')}>
                    {error}
                </CAlert>
            )}

            {/* Stats Card */}
            <CRow className="mb-4">
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-warning mb-3">
                        <CCardBody className="d-flex align-items-center">
                            <CIcon icon={cilWarning} size="3xl" className="me-3" />
                            <div>
                                <div className="fs-4 fw-semibold">{disputes.length}</div>
                                <div>Pending Review</div>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <CCard className="mb-4 shadow-sm">
                <CCardHeader>
                    <strong>Escalated Disputes</strong>
                </CCardHeader>
                <CCardBody>
                    {disputes.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <CIcon icon={cilCheckCircle} size="3xl" className="mb-3 text-success" />
                            <p>No disputes require moderation at this time.</p>
                        </div>
                    ) : (
                        <CTable hover responsive>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Reason</CTableHeaderCell>
                                    <CTableHeaderCell>Parties</CTableHeaderCell>
                                    <CTableHeaderCell>Score</CTableHeaderCell>
                                    <CTableHeaderCell>Status</CTableHeaderCell>
                                    <CTableHeaderCell>Resolution</CTableHeaderCell>
                                    <CTableHeaderCell>Created</CTableHeaderCell>
                                    <CTableHeaderCell>Actions</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {disputes.map((dispute) => (
                                    <CTableRow key={dispute.id} className="table-warning">
                                        <CTableDataCell>
                                            <CBadge color="secondary">
                                                {getReasonLabel(dispute.reasonCode)}
                                            </CBadge>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <div className="small">
                                                <div>
                                                    <CIcon icon={cilPeople} size="sm" className="me-1" />
                                                    <strong>C:</strong>{' '}
                                                    <span
                                                        className="text-primary"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => navigate(`/users/${dispute.complainerId}`)}
                                                    >
                                                        {dispute.complainerName}
                                                    </span>
                                                </div>
                                                <div>
                                                    <strong>R:</strong>{' '}
                                                    <span
                                                        className="text-primary"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => navigate(`/users/${dispute.respondentId}`)}
                                                    >
                                                        {dispute.respondentName}
                                                    </span>
                                                </div>
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <CTooltip content="System calculated score">
                                                <span>
                                                    <CIcon icon={cilStar} className="me-1 text-warning" />
                                                    {dispute.score}
                                                </span>
                                            </CTooltip>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            {getStatusBadge(dispute.status)}
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            {getResolutionBadge(dispute.resolution)}
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <small>{formatDate(dispute.createdAt)}</small>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <CButton
                                                color="warning"
                                                size="sm"
                                                onClick={() => navigate(`/admin/disputes/${dispute.id}`)}
                                            >
                                                Review <CIcon icon={cilArrowRight} size="sm" />
                                            </CButton>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    )}
                </CCardBody>
            </CCard>
        </>
    )
}

export default AdminDisputes

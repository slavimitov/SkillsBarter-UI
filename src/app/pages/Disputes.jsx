import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableBody,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CTableDataCell,
    CButton,
    CBadge,
    CSpinner,
    CAlert,
    CNav,
    CNavItem,
    CNavLink,
    CTabContent,
    CTabPane,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowRight, cilWarning, cilClock, cilCheckCircle, cilUser } from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext'
import disputeService from '../services/disputeService'

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
    if (resolution === null || resolution === undefined) return null
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

const Disputes = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [disputes, setDisputes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('all')

    useEffect(() => {
        if (user?.id) {
            fetchDisputes()
        }
    }, [user])

    const fetchDisputes = async () => {
        try {
            setLoading(true)
            setError('')
            const data = await disputeService.getMyDisputes()
            setDisputes(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Error fetching disputes:', err)
            setError(err.response?.data?.message || 'Failed to load disputes.')
        } finally {
            setLoading(false)
        }
    }

    const isResolved = (status) => status === 2 || status === 4 || status === 'Resolved' || status === 'Closed'
    const isAwaitingResponse = (status) => status === 0 || status === 'AwaitingResponse'
    const isEscalated = (status) => status === 3 || status === 'EscalatedToModerator'

    const filteredDisputes = () => {
        if (activeTab === 'all') return disputes
        if (activeTab === 'active') return disputes.filter(d => !isResolved(d.status))
        if (activeTab === 'awaiting') return disputes.filter(d => isAwaitingResponse(d.status))
        if (activeTab === 'escalated') return disputes.filter(d => isEscalated(d.status))
        if (activeTab === 'resolved') return disputes.filter(d => isResolved(d.status))
        if (activeTab === 'action') return disputes.filter(d => d.requiresAction)
        return disputes
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString()
    }

    const formatDeadline = (dateString) => {
        if (!dateString) return null
        const deadline = new Date(dateString)
        const now = new Date()
        const isOverdue = deadline < now
        const diffHours = Math.round((deadline - now) / (1000 * 60 * 60))
        
        return (
            <span className={isOverdue ? 'text-danger fw-bold' : 'text-warning'}>
                {isOverdue ? 'Overdue' : `${diffHours}h left`}
            </span>
        )
    }

    const stats = {
        total: disputes.length,
        active: disputes.filter(d => !isResolved(d.status)).length,
        awaiting: disputes.filter(d => isAwaitingResponse(d.status)).length,
        escalated: disputes.filter(d => isEscalated(d.status)).length,
        resolved: disputes.filter(d => isResolved(d.status)).length,
        requiresAction: disputes.filter(d => d.requiresAction).length,
    }

    if (loading && disputes.length === 0) {
        return (
            <div className="text-center p-5">
                <CSpinner />
                <p className="mt-2">Loading disputes...</p>
            </div>
        )
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <strong>
                            <CIcon icon={cilWarning} className="me-2" />
                            My Disputes
                        </strong>
                        {stats.requiresAction > 0 && (
                            <CBadge color="danger">
                                {stats.requiresAction} require{stats.requiresAction > 1 ? '' : 's'} your action
                            </CBadge>
                        )}
                    </CCardHeader>
                    <CCardBody>
                        {error && <CAlert color="danger">{error}</CAlert>}

                        <CNav variant="tabs" className="mb-3">
                            <CNavItem>
                                <CNavLink
                                    active={activeTab === 'all'}
                                    onClick={() => setActiveTab('all')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    All ({stats.total})
                                </CNavLink>
                            </CNavItem>
                            {stats.requiresAction > 0 && (
                                <CNavItem>
                                    <CNavLink
                                        active={activeTab === 'action'}
                                        onClick={() => setActiveTab('action')}
                                        style={{ cursor: 'pointer' }}
                                        className="text-danger"
                                    >
                                        <CIcon icon={cilWarning} className="me-1" />
                                        Action Required ({stats.requiresAction})
                                    </CNavLink>
                                </CNavItem>
                            )}
                            <CNavItem>
                                <CNavLink
                                    active={activeTab === 'active'}
                                    onClick={() => setActiveTab('active')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <CIcon icon={cilClock} className="me-1" />
                                    Active ({stats.active})
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink
                                    active={activeTab === 'awaiting'}
                                    onClick={() => setActiveTab('awaiting')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    Awaiting Response ({stats.awaiting})
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink
                                    active={activeTab === 'escalated'}
                                    onClick={() => setActiveTab('escalated')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <CIcon icon={cilUser} className="me-1" />
                                    With Moderator ({stats.escalated})
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink
                                    active={activeTab === 'resolved'}
                                    onClick={() => setActiveTab('resolved')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <CIcon icon={cilCheckCircle} className="me-1" />
                                    Resolved ({stats.resolved})
                                </CNavLink>
                            </CNavItem>
                        </CNav>

                        <CTabContent>
                            <CTabPane visible={true}>
                                {filteredDisputes().length === 0 ? (
                                    <div className="text-center text-muted py-5">
                                        <CIcon icon={cilWarning} size="3xl" className="mb-3" />
                                        <p>No disputes found.</p>
                                        <p className="small">Disputes you create or are involved in will appear here.</p>
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
                                                <CTableHeaderCell>Deadline</CTableHeaderCell>
                                                <CTableHeaderCell>Actions</CTableHeaderCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {filteredDisputes().map((dispute) => (
                                                <CTableRow 
                                                    key={dispute.id}
                                                    className={dispute.requiresAction ? 'table-warning' : ''}
                                                >
                                                    <CTableDataCell>
                                                        <div>
                                                            <CBadge color="secondary">
                                                                {getReasonLabel(dispute.reasonCode)}
                                                            </CBadge>
                                                            {dispute.requiresAction && (
                                                                <div className="small text-danger mt-1">
                                                                    <CIcon icon={cilWarning} size="sm" className="me-1" />
                                                                    Response required
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <div className="small">
                                                            <div><strong>Complainer:</strong> {dispute.complainerName}</div>
                                                            <div><strong>Respondent:</strong> {dispute.respondentName}</div>
                                                        </div>
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <span className="fw-bold">{dispute.score}</span>
                                                        <div className="small text-muted">/100</div>
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
                                                        {isAwaitingResponse(dispute.status) && dispute.responseDeadline && (
                                                            formatDeadline(dispute.responseDeadline)
                                                        )}
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <CButton
                                                            color={dispute.requiresAction ? 'warning' : 'primary'}
                                                            size="sm"
                                                            variant={dispute.requiresAction ? undefined : 'outline'}
                                                            onClick={() => navigate(`/disputes/${dispute.id}`)}
                                                        >
                                                            {dispute.requiresAction ? 'Respond' : 'View'}{' '}
                                                            <CIcon icon={cilArrowRight} size="sm" />
                                                        </CButton>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))}
                                        </CTableBody>
                                    </CTable>
                                )}
                            </CTabPane>
                        </CTabContent>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default Disputes

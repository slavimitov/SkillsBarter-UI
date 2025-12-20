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
    CFormSelect,
    CNav,
    CNavItem,
    CNavLink,
    CPagination,
    CPaginationItem,
    CProgress,
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
    cilTask,
    cilPeople,
} from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext'
import adminService from '../services/adminService'

const ALLOWED_ROLES = ['Admin', 'Moderator']

const AdminAgreements = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const hasAccess = user?.roles?.some((role) => ALLOWED_ROLES.includes(role))

    const [agreements, setAgreements] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [statusFilter, setStatusFilter] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 0,
    })

    useEffect(() => {
        if (hasAccess) {
            fetchAgreements()
        }
    }, [hasAccess, statusFilter, pagination.page])

    const fetchAgreements = async () => {
        try {
            setLoading(true)
            setError('')

            const status = statusFilter !== '' ? parseInt(statusFilter) : undefined
            const data = await adminService.getAgreements({
                status,
                page: pagination.page,
                pageSize: pagination.pageSize,
            })

            setAgreements(data.agreements || [])
            setPagination((prev) => ({
                ...prev,
                totalCount: data.totalCount,
                totalPages: data.totalPages,
            }))
        } catch (err) {
            console.error('Error fetching agreements:', err)
            setError(err.response?.data?.message || 'Failed to load agreements.')
        } finally {
            setLoading(false)
        }
    }

    if (!hasAccess) {
        return <Navigate to="/" replace />
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            0: { color: 'warning', label: 'Pending' },
            1: { color: 'primary', label: 'In Progress' },
            2: { color: 'success', label: 'Completed' },
            3: { color: 'danger', label: 'Cancelled' },
            4: { color: 'dark', label: 'Disputed' },
            Pending: { color: 'warning', label: 'Pending' },
            InProgress: { color: 'primary', label: 'In Progress' },
            Completed: { color: 'success', label: 'Completed' },
            Cancelled: { color: 'danger', label: 'Cancelled' },
            Disputed: { color: 'dark', label: 'Disputed' },
        }
        const info = statusMap[status] || { color: 'secondary', label: status }
        return <CBadge color={info.color}>{info.label}</CBadge>
    }

    const filteredAgreements = () => {
        if (activeTab === 'all') return agreements
        if (activeTab === 'active')
            return agreements.filter((a) => a.status === 1 || a.status === 'InProgress')
        if (activeTab === 'completed')
            return agreements.filter((a) => a.status === 2 || a.status === 'Completed')
        if (activeTab === 'disputed') return agreements.filter((a) => a.hasDispute)
        return agreements
    }

    const handlePageChange = (page) => {
        setPagination((prev) => ({ ...prev, page }))
    }

    const stats = {
        total: agreements.length,
        active: agreements.filter((a) => a.status === 1 || a.status === 'InProgress').length,
        completed: agreements.filter((a) => a.status === 2 || a.status === 'Completed').length,
        disputed: agreements.filter((a) => a.hasDispute).length,
    }

    if (loading && agreements.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <CSpinner color="primary" />
            </div>
        )
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Admin - Agreements Monitor</h2>
                <CButton color="secondary" variant="outline" onClick={() => navigate('/admin')}>
                    Back to Admin Console
                </CButton>
            </div>

            {error && (
                <CAlert color="danger" dismissible onClose={() => setError('')}>
                    {error}
                </CAlert>
            )}

            {/* Stats Cards */}
            <CRow className="mb-4">
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-primary mb-3">
                        <CCardBody className="d-flex align-items-center">
                            <CIcon icon={cilTask} size="3xl" className="me-3" />
                            <div>
                                <div className="fs-4 fw-semibold">{pagination.totalCount}</div>
                                <div>Total Agreements</div>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-info mb-3">
                        <CCardBody className="d-flex align-items-center">
                            <CIcon icon={cilClock} size="3xl" className="me-3" />
                            <div>
                                <div className="fs-4 fw-semibold">{stats.active}</div>
                                <div>Active</div>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-success mb-3">
                        <CCardBody className="d-flex align-items-center">
                            <CIcon icon={cilCheckCircle} size="3xl" className="me-3" />
                            <div>
                                <div className="fs-4 fw-semibold">{stats.completed}</div>
                                <div>Completed</div>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm={6} lg={3}>
                    <CCard className="text-white bg-danger mb-3">
                        <CCardBody className="d-flex align-items-center">
                            <CIcon icon={cilWarning} size="3xl" className="me-3" />
                            <div>
                                <div className="fs-4 fw-semibold">{stats.disputed}</div>
                                <div>With Disputes</div>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <CCard className="mb-4 shadow-sm">
                <CCardHeader className="d-flex justify-content-between align-items-center">
                    <strong>All Agreements</strong>
                    <div className="d-flex gap-2 align-items-center">
                        <CFormSelect
                            size="sm"
                            style={{ width: '150px' }}
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value)
                                setPagination((prev) => ({ ...prev, page: 1 }))
                            }}
                        >
                            <option value="">All Status</option>
                            <option value="0">Pending</option>
                            <option value="1">In Progress</option>
                            <option value="2">Completed</option>
                            <option value="3">Cancelled</option>
                            <option value="4">Disputed</option>
                        </CFormSelect>
                    </div>
                </CCardHeader>
                <CCardBody>
                    <CNav variant="tabs" className="mb-3">
                        <CNavItem>
                            <CNavLink
                                active={activeTab === 'all'}
                                onClick={() => setActiveTab('all')}
                                style={{ cursor: 'pointer' }}
                            >
                                All ({agreements.length})
                            </CNavLink>
                        </CNavItem>
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
                                active={activeTab === 'completed'}
                                onClick={() => setActiveTab('completed')}
                                style={{ cursor: 'pointer' }}
                            >
                                <CIcon icon={cilCheckCircle} className="me-1" />
                                Completed ({stats.completed})
                            </CNavLink>
                        </CNavItem>
                        <CNavItem>
                            <CNavLink
                                active={activeTab === 'disputed'}
                                onClick={() => setActiveTab('disputed')}
                                style={{ cursor: 'pointer' }}
                            >
                                <CIcon icon={cilWarning} className="me-1" />
                                Disputed ({stats.disputed})
                            </CNavLink>
                        </CNavItem>
                    </CNav>

                    {filteredAgreements().length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <CIcon icon={cilTask} size="3xl" className="mb-3" />
                            <p>No agreements found.</p>
                        </div>
                    ) : (
                        <>
                            <CTable hover responsive>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell>Offer</CTableHeaderCell>
                                        <CTableHeaderCell>Parties</CTableHeaderCell>
                                        <CTableHeaderCell>Progress</CTableHeaderCell>
                                        <CTableHeaderCell>Deliverables</CTableHeaderCell>
                                        <CTableHeaderCell>Status</CTableHeaderCell>
                                        <CTableHeaderCell>Created</CTableHeaderCell>
                                        <CTableHeaderCell>Actions</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {filteredAgreements().map((agreement) => {
                                        const progressPercent =
                                            agreement.totalMilestones > 0
                                                ? Math.round(
                                                    (agreement.completedMilestones /
                                                        agreement.totalMilestones) *
                                                    100,
                                                )
                                                : 0

                                        return (
                                            <CTableRow
                                                key={agreement.id}
                                                className={agreement.hasDispute ? 'table-danger' : ''}
                                            >
                                                <CTableDataCell>
                                                    <div>
                                                        <strong>{agreement.offerTitle}</strong>
                                                        <div className="small text-muted">
                                                            <CBadge color="info" size="sm">
                                                                {agreement.skillName}
                                                            </CBadge>
                                                        </div>
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="small">
                                                        <div>
                                                            <CIcon
                                                                icon={cilPeople}
                                                                size="sm"
                                                                className="me-1"
                                                            />
                                                            <strong>Req:</strong>{' '}
                                                            <span
                                                                className="text-primary"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/users/${agreement.requesterId}`,
                                                                    )
                                                                }
                                                            >
                                                                {agreement.requesterName}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <strong>Prov:</strong>{' '}
                                                            <span
                                                                className="text-primary"
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/users/${agreement.providerId}`,
                                                                    )
                                                                }
                                                            >
                                                                {agreement.providerName}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell style={{ minWidth: '120px' }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <CProgress
                                                            value={progressPercent}
                                                            variant={progressPercent > 0 && progressPercent < 100 ? 'striped' : undefined}
                                                            animated={progressPercent > 0 && progressPercent < 100}
                                                            className="rounded-pill"
                                                            style={{ flex: 1, height: '10px', backgroundColor: 'transparent' }}
                                                            color={
                                                                progressPercent === 100
                                                                    ? 'success'
                                                                    : 'primary'
                                                            }
                                                        />
                                                        <small className="text-muted">
                                                            {agreement.completedMilestones}/
                                                            {agreement.totalMilestones}
                                                        </small>
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CTooltip
                                                        content={`${agreement.approvedDeliverables} approved out of ${agreement.totalDeliverables} total`}
                                                    >
                                                        <span>
                                                            {agreement.approvedDeliverables}/
                                                            {agreement.totalDeliverables}
                                                            {agreement.totalDeliverables > 0 &&
                                                                agreement.approvedDeliverables ===
                                                                agreement.totalDeliverables && (
                                                                    <CIcon
                                                                        icon={cilCheckCircle}
                                                                        className="ms-1 text-success"
                                                                        size="sm"
                                                                    />
                                                                )}
                                                        </span>
                                                    </CTooltip>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div>
                                                        {getStatusBadge(agreement.status)}
                                                        {agreement.hasDispute && (
                                                            <CBadge
                                                                color="danger"
                                                                className="ms-1"
                                                            >
                                                                <CIcon
                                                                    icon={cilWarning}
                                                                    size="sm"
                                                                    className="me-1"
                                                                />
                                                                Dispute
                                                            </CBadge>
                                                        )}
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <div className="small">
                                                        {new Date(
                                                            agreement.createdAt,
                                                        ).toLocaleDateString()}
                                                        {agreement.completedAt && (
                                                            <div className="text-success">
                                                                Completed:{' '}
                                                                {new Date(
                                                                    agreement.completedAt,
                                                                ).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CButton
                                                        color="primary"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            navigate(`/agreements/${agreement.id}`)
                                                        }
                                                    >
                                                        View <CIcon icon={cilArrowRight} size="sm" />
                                                    </CButton>
                                                </CTableDataCell>
                                            </CTableRow>
                                        )
                                    })}
                                </CTableBody>
                            </CTable>

                            {pagination.totalPages > 1 && (
                                <CPagination className="mt-3">
                                    <CPaginationItem
                                        disabled={pagination.page === 1}
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                    >
                                        Previous
                                    </CPaginationItem>
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                        .filter(
                                            (p) =>
                                                p === 1 ||
                                                p === pagination.totalPages ||
                                                Math.abs(p - pagination.page) <= 2,
                                        )
                                        .map((p, idx, arr) => {
                                            const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                                            return (
                                                <React.Fragment key={p}>
                                                    {showEllipsis && (
                                                        <CPaginationItem disabled>...</CPaginationItem>
                                                    )}
                                                    <CPaginationItem
                                                        active={p === pagination.page}
                                                        onClick={() => handlePageChange(p)}
                                                    >
                                                        {p}
                                                    </CPaginationItem>
                                                </React.Fragment>
                                            )
                                        })}
                                    <CPaginationItem
                                        disabled={pagination.page === pagination.totalPages}
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                    >
                                        Next
                                    </CPaginationItem>
                                </CPagination>
                            )}
                        </>
                    )}
                </CCardBody>
            </CCard>
        </>
    )
}

export default AdminAgreements


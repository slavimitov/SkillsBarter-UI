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
    CProgress,
    CFormSelect,
    CPagination,
    CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowRight, cilCheckCircle, cilClock, cilTask } from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext'
import agreementService from '../services/agreementService'

const Agreements = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [agreements, setAgreements] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [statusFilter, setStatusFilter] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0
    })

    useEffect(() => {
        if (user?.id) {
            fetchAgreements()
        }
    }, [user, statusFilter, pagination.page])

    const fetchAgreements = async () => {
        try {
            setLoading(true)
            setError('')

            const status = statusFilter !== '' ? parseInt(statusFilter) : undefined
            const data = await agreementService.getMyAgreements({
                status,
                page: pagination.page,
                pageSize: pagination.pageSize
            })

            setAgreements(data.agreements || [])
            setPagination(prev => ({
                ...prev,
                totalCount: data.totalCount,
                totalPages: data.totalPages
            }))
        } catch (err) {
            console.error('Error fetching agreements:', err)
            setError(err.response?.data?.message || 'Failed to load agreements.')
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            0: { color: 'warning', label: 'Pending' },
            1: { color: 'primary', label: 'In Progress' },
            2: { color: 'success', label: 'Completed' },
            3: { color: 'danger', label: 'Cancelled' },
            4: { color: 'dark', label: 'Disputed' },
            'Pending': { color: 'warning', label: 'Pending' },
            'InProgress': { color: 'primary', label: 'In Progress' },
            'Completed': { color: 'success', label: 'Completed' },
            'Cancelled': { color: 'danger', label: 'Cancelled' },
            'Disputed': { color: 'dark', label: 'Disputed' },
        }
        const info = statusMap[status] || { color: 'secondary', label: status }
        return <CBadge color={info.color}>{info.label}</CBadge>
    }

    const getRoleBadge = (role) => {
        if (role === 'Requester') {
            return <CBadge color="info" className="ms-1">Requester</CBadge>
        }
        return <CBadge color="success" className="ms-1">Provider</CBadge>
    }

    const filteredAgreements = () => {
        if (activeTab === 'all') return agreements
        if (activeTab === 'active') return agreements.filter(a => a.status === 1 || a.status === 'InProgress')
        if (activeTab === 'completed') return agreements.filter(a => a.status === 2 || a.status === 'Completed')
        if (activeTab === 'requester') return agreements.filter(a => a.role === 'Requester')
        if (activeTab === 'provider') return agreements.filter(a => a.role === 'Provider')
        return agreements
    }

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page }))
    }

    if (loading && agreements.length === 0) {
        return (
            <div className="text-center p-5">
                <CSpinner />
                <p className="mt-2">Loading agreements...</p>
            </div>
        )
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <strong>My Agreements</strong>
                        <div className="d-flex gap-2 align-items-center">
                            <CFormSelect
                                size="sm"
                                style={{ width: '150px' }}
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value)
                                    setPagination(prev => ({ ...prev, page: 1 }))
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
                        {error && <CAlert color="danger">{error}</CAlert>}

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
                                    Active
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink
                                    active={activeTab === 'completed'}
                                    onClick={() => setActiveTab('completed')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <CIcon icon={cilCheckCircle} className="me-1" />
                                    Completed
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink
                                    active={activeTab === 'requester'}
                                    onClick={() => setActiveTab('requester')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    As Requester
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink
                                    active={activeTab === 'provider'}
                                    onClick={() => setActiveTab('provider')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    As Provider
                                </CNavLink>
                            </CNavItem>
                        </CNav>

                        <CTabContent>
                            <CTabPane visible={true}>
                                {filteredAgreements().length === 0 ? (
                                    <div className="text-center text-muted py-5">
                                        <CIcon icon={cilTask} size="3xl" className="mb-3" />
                                        <p>No agreements found.</p>
                                        <CButton color="primary" onClick={() => navigate('/offers')}>
                                            Browse Offers
                                        </CButton>
                                    </div>
                                ) : (
                                    <>
                                        <CTable hover responsive>
                                            <CTableHead>
                                                <CTableRow>
                                                    <CTableHeaderCell>Offer</CTableHeaderCell>
                                                    <CTableHeaderCell>Partner</CTableHeaderCell>
                                                    <CTableHeaderCell>Your Role</CTableHeaderCell>
                                                    <CTableHeaderCell>Progress</CTableHeaderCell>
                                                    <CTableHeaderCell>Status</CTableHeaderCell>
                                                    <CTableHeaderCell>Created</CTableHeaderCell>
                                                    <CTableHeaderCell>Actions</CTableHeaderCell>
                                                </CTableRow>
                                            </CTableHead>
                                            <CTableBody>
                                                {filteredAgreements().map((agreement) => {
                                                    const partnerName = agreement.role === 'Requester'
                                                        ? agreement.providerName
                                                        : agreement.requesterName
                                                    const progressPercent = agreement.totalMilestones > 0
                                                        ? Math.round((agreement.completedMilestones / agreement.totalMilestones) * 100)
                                                        : 0

                                                    return (
                                                        <CTableRow key={agreement.id}>
                                                            <CTableDataCell>
                                                                <div>
                                                                    <strong>{agreement.offerTitle}</strong>
                                                                    <div className="small text-muted">
                                                                        <CBadge color="info" size="sm">{agreement.skillName}</CBadge>
                                                                    </div>
                                                                </div>
                                                            </CTableDataCell>
                                                            <CTableDataCell>
                                                                <span
                                                                    className="text-primary"
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => navigate(`/users/${agreement.role === 'Requester' ? agreement.providerId : agreement.requesterId}`)}
                                                                >
                                                                    {partnerName}
                                                                </span>
                                                            </CTableDataCell>
                                                            <CTableDataCell>
                                                                {getRoleBadge(agreement.role)}
                                                            </CTableDataCell>
                                                            <CTableDataCell style={{ minWidth: '150px' }}>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <CProgress
                                                                        value={progressPercent}
                                                                        variant={progressPercent > 0 && progressPercent < 100 ? 'striped' : undefined}
                                                                        animated={progressPercent > 0 && progressPercent < 100}
                                                                        className="rounded-pill"
                                                                        style={{ flex: 1, height: '10px', backgroundColor: 'transparent' }}
                                                                        color={progressPercent === 100 ? 'success' : 'primary'}
                                                                    />
                                                                    <small className="text-muted">
                                                                        {agreement.completedMilestones}/{agreement.totalMilestones}
                                                                    </small>
                                                                </div>
                                                            </CTableDataCell>
                                                            <CTableDataCell>
                                                                {getStatusBadge(agreement.status)}
                                                            </CTableDataCell>
                                                            <CTableDataCell>
                                                                <small>{new Date(agreement.createdAt).toLocaleDateString()}</small>
                                                            </CTableDataCell>
                                                            <CTableDataCell>
                                                                <CButton
                                                                    color="primary"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => navigate(`/agreements/${agreement.id}`)}
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
                                            <CPagination align="center" className="mt-3">
                                                <CPaginationItem
                                                    disabled={pagination.page === 1}
                                                    onClick={() => handlePageChange(pagination.page - 1)}
                                                >
                                                    Previous
                                                </CPaginationItem>
                                                {[...Array(pagination.totalPages)].map((_, i) => (
                                                    <CPaginationItem
                                                        key={i + 1}
                                                        active={pagination.page === i + 1}
                                                        onClick={() => handlePageChange(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </CPaginationItem>
                                                ))}
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
                            </CTabPane>
                        </CTabContent>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default Agreements

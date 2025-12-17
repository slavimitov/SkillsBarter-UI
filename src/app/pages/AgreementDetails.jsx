import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CSpinner,
    CAlert,
    CBadge,
    CButton,
    CProgress,
    CListGroup,
    CListGroupItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilCalendar, cilCheckCircle, cilTask } from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext'
import agreementService from '../services/agreementService'
import deliverableService from '../services/deliverableService'

const AgreementDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [agreement, setAgreement] = useState(null)
    const [deliverables, setDeliverables] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (id) {
            fetchAgreement()
        }
    }, [id])

    const fetchAgreement = async () => {
        try {
            setLoading(true)
            setError('')
            const data = await agreementService.getAgreement(id)
            setAgreement(data)

            try {
                const delivData = await deliverableService.getAgreementDeliverables(id)
                setDeliverables(delivData || [])
            } catch {
                setDeliverables([])
            }
        } catch (err) {
            console.error('Error fetching agreement:', err)
            setError(err.response?.data?.message || 'Failed to load agreement details.')
        } finally {
            setLoading(false)
        }
    }

    const handleComplete = async () => {
        if (!window.confirm('Are you sure you want to mark this agreement as complete?')) return

        try {
            await agreementService.completeAgreement(id)
            await fetchAgreement()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to complete agreement')
        }
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            0: { color: 'warning', label: 'Pending' },
            1: { color: 'primary', label: 'Active' },
            2: { color: 'success', label: 'Completed' },
            3: { color: 'danger', label: 'Cancelled' },
            4: { color: 'dark', label: 'Disputed' },
            'Pending': { color: 'warning', label: 'Pending' },
            'Active': { color: 'primary', label: 'Active' },
            'Completed': { color: 'success', label: 'Completed' },
            'Cancelled': { color: 'danger', label: 'Cancelled' },
            'Disputed': { color: 'dark', label: 'Disputed' },
        }
        const info = statusMap[status] || { color: 'secondary', label: status }
        return <CBadge color={info.color}>{info.label}</CBadge>
    }

    const getMilestoneStatusBadge = (status) => {
        const statusMap = {
            0: { color: 'secondary', label: 'Pending' },
            1: { color: 'primary', label: 'In Progress' },
            2: { color: 'success', label: 'Completed' },
            'Pending': { color: 'secondary', label: 'Pending' },
            'InProgress': { color: 'primary', label: 'In Progress' },
            'Completed': { color: 'success', label: 'Completed' },
        }
        const info = statusMap[status] || { color: 'info', label: status }
        return <CBadge color={info.color}>{info.label}</CBadge>
    }

    if (loading) {
        return (
            <div className="text-center p-5">
                <CSpinner />
            </div>
        )
    }

    if (error) {
        return (
            <CRow>
                <CCol>
                    <CAlert color="danger">{error}</CAlert>
                    <CButton color="primary" onClick={() => navigate(-1)}>
                        Go Back
                    </CButton>
                </CCol>
            </CRow>
        )
    }

    if (!agreement) {
        return (
            <CRow>
                <CCol>
                    <CAlert color="warning">Agreement not found.</CAlert>
                </CCol>
            </CRow>
        )
    }

    const isRequester = user?.id === agreement.requesterId
    const isProvider = user?.id === agreement.providerId
    const canComplete = (isRequester || isProvider) && (agreement.status === 1 || agreement.status === 'Active')

    const completedMilestones = agreement.milestones?.filter(m => m.status === 2 || m.status === 'Completed').length || 0
    const totalMilestones = agreement.milestones?.length || 0
    const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Agreement Details</strong>
                            <span className="ms-2">{getStatusBadge(agreement.status)}</span>
                        </div>
                        <div>
                            {canComplete && (
                                <CButton color="success" size="sm" onClick={handleComplete}>
                                    <CIcon icon={cilCheckCircle} className="me-1" />
                                    Mark Complete
                                </CButton>
                            )}
                        </div>
                    </CCardHeader>
                    <CCardBody>
                        {/* Offer Info */}
                        <div className="mb-4">
                            <h5>
                                <Link to={`/offers/${agreement.offer?.id}`}>
                                    {agreement.offer?.title || 'Untitled Offer'}
                                </Link>
                            </h5>
                            <p className="text-muted mb-2">{agreement.offer?.description}</p>
                            <CBadge color="info">{agreement.offer?.skillName}</CBadge>
                        </div>

                        <hr />

                        {/* Parties */}
                        <CRow className="mb-4">
                            <CCol md={6}>
                                <div className="d-flex align-items-center mb-2">
                                    <CIcon icon={cilUser} className="me-2 text-primary" />
                                    <strong>Requester</strong>
                                    {isRequester && <CBadge color="info" className="ms-2">You</CBadge>}
                                </div>
                                <Link to={`/users/${agreement.requester?.id}`}>
                                    {agreement.requester?.name}
                                </Link>
                                <div className="small text-muted">{agreement.requester?.email}</div>
                            </CCol>
                            <CCol md={6}>
                                <div className="d-flex align-items-center mb-2">
                                    <CIcon icon={cilUser} className="me-2 text-success" />
                                    <strong>Provider</strong>
                                    {isProvider && <CBadge color="info" className="ms-2">You</CBadge>}
                                </div>
                                <Link to={`/users/${agreement.provider?.id}`}>
                                    {agreement.provider?.name}
                                </Link>
                                <div className="small text-muted">{agreement.provider?.email}</div>
                            </CCol>
                        </CRow>

                        <hr />

                        {/* Terms */}
                        {agreement.terms && (
                            <div className="mb-4">
                                <h6>Terms</h6>
                                <p className="bg-light p-3 rounded">{agreement.terms}</p>
                            </div>
                        )}

                        {/* Dates */}
                        <CRow className="mb-4">
                            <CCol md={4}>
                                <div className="d-flex align-items-center">
                                    <CIcon icon={cilCalendar} className="me-2 text-muted" />
                                    <div>
                                        <small className="text-muted">Created</small>
                                        <div>{new Date(agreement.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </CCol>
                            {agreement.acceptedAt && (
                                <CCol md={4}>
                                    <div className="d-flex align-items-center">
                                        <CIcon icon={cilCheckCircle} className="me-2 text-success" />
                                        <div>
                                            <small className="text-muted">Accepted</small>
                                            <div>{new Date(agreement.acceptedAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </CCol>
                            )}
                            {agreement.completedAt && (
                                <CCol md={4}>
                                    <div className="d-flex align-items-center">
                                        <CIcon icon={cilCheckCircle} className="me-2 text-primary" />
                                        <div>
                                            <small className="text-muted">Completed</small>
                                            <div>{new Date(agreement.completedAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </CCol>
                            )}
                        </CRow>
                    </CCardBody>
                </CCard>

                {/* Milestones */}
                {agreement.milestones?.length > 0 && (
                    <CCard className="mb-4">
                        <CCardHeader>
                            <div className="d-flex justify-content-between align-items-center">
                                <strong>
                                    <CIcon icon={cilTask} className="me-2" />
                                    Milestones
                                </strong>
                                <span className="text-muted">
                                    {completedMilestones} / {totalMilestones} completed
                                </span>
                            </div>
                            <CProgress value={progressPercent} className="mt-2" />
                        </CCardHeader>
                        <CCardBody>
                            <CListGroup>
                                {agreement.milestones.map((milestone, index) => (
                                    <CListGroupItem key={milestone.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{index + 1}. {milestone.title}</strong>
                                            <div className="small text-muted">
                                                Duration: {milestone.durationInDays} days
                                                {milestone.dueAt && ` • Due: ${new Date(milestone.dueAt).toLocaleDateString()}`}
                                            </div>
                                        </div>
                                        {getMilestoneStatusBadge(milestone.status)}
                                    </CListGroupItem>
                                ))}
                            </CListGroup>
                        </CCardBody>
                    </CCard>
                )}

                {/* Deliverables */}
                {deliverables.length > 0 && (
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>Deliverables</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CListGroup>
                                {deliverables.map((deliverable) => (
                                    <CListGroupItem key={deliverable.id}>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <div className="fw-bold">{deliverable.description || 'Deliverable'}</div>
                                                {deliverable.link && (
                                                    <a href={deliverable.link} target="_blank" rel="noopener noreferrer" className="small">
                                                        {deliverable.link}
                                                    </a>
                                                )}
                                                <div className="small text-muted">
                                                    Submitted: {new Date(deliverable.submittedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <CBadge color={deliverable.status === 'Approved' ? 'success' : deliverable.status === 'Pending' ? 'warning' : 'info'}>
                                                {deliverable.status}
                                            </CBadge>
                                        </div>
                                    </CListGroupItem>
                                ))}
                            </CListGroup>
                        </CCardBody>
                    </CCard>
                )}

                {/* Reviews */}
                {agreement.reviews?.length > 0 && (
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>Reviews</strong>
                        </CCardHeader>
                        <CCardBody>
                            {agreement.reviews.map((review) => (
                                <div key={review.id} className="mb-3 pb-3 border-bottom">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <strong>{review.reviewerName}</strong>
                                            <span className="text-muted"> → {review.recipientName}</span>
                                        </div>
                                        <div>
                                            {'⭐'.repeat(review.rating)}
                                            <span className="text-muted ms-1">({review.rating}/5)</span>
                                        </div>
                                    </div>
                                    {review.body && <p className="mb-0 mt-2">{review.body}</p>}
                                    <small className="text-muted">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                            ))}
                        </CCardBody>
                    </CCard>
                )}
            </CCol>
        </CRow>
    )
}

export default AgreementDetails

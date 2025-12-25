import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
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
    CListGroup,
    CListGroupItem,
    CForm,
    CFormLabel,
    CFormTextarea,
    CFormSelect,
    CCallout,
    CProgress,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilUser,
    cilCalendar,
    cilWarning,
    cilCheckCircle,
    cilCommentSquare,
    cilClock,
    cilStar,
    cilShieldAlt,
    cilPeople,
    cilArrowTop,
    cilExternalLink,
} from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import disputeService from '../services/disputeService'
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

const getSystemDecisionBadge = (decision) => {
    if (decision === null || decision === undefined) return <CBadge color="secondary">Pending</CBadge>
    const decisionMap = {
        0: { color: 'warning', label: 'Escalate to Moderator' },
        1: { color: 'info', label: 'Provider Wins' },
        2: { color: 'success', label: 'Complainant Wins' },
        'EscalateToModerator': { color: 'warning', label: 'Escalate to Moderator' },
        'ProviderWins': { color: 'info', label: 'Provider Wins' },
        'ComplainantWins': { color: 'success', label: 'Complainant Wins' },
    }
    const info = decisionMap[decision] || { color: 'secondary', label: decision }
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

const AdminDisputeDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { showSuccess, showError, showWarning } = useToast()
    const hasAccess = user?.roles?.some((role) => ALLOWED_ROLES.includes(role))

    const [dispute, setDispute] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [resolution, setResolution] = useState({
        resolution: '',
        notes: '',
    })
    const [resolveLoading, setResolveLoading] = useState(false)
    const [notesError, setNotesError] = useState('')

    useEffect(() => {
        if (id && hasAccess) {
            fetchDispute()
        }
    }, [id, hasAccess])

    const fetchDispute = async () => {
        try {
            setLoading(true)
            setError('')
            const data = await disputeService.getDispute(id)
            setDispute(data)
        } catch (err) {
            console.error('Error fetching dispute:', err)
            setError(err.response?.data?.message || 'Failed to load dispute details.')
        } finally {
            setLoading(false)
        }
    }

    const handleResolve = async () => {
        setNotesError('')
        
        if (!resolution.resolution) {
            showWarning('Please select a resolution')
            return
        }

        if (!resolution.notes || resolution.notes.trim().length < 20) {
            setNotesError('Notes must be at least 20 characters long')
            return
        }

        try {
            setResolveLoading(true)
            await adminService.resolveDispute(id, {
                resolution: resolution.resolution,
                notes: resolution.notes,
            })
            showSuccess('Dispute resolved successfully!')
            await fetchDispute()
        } catch (err) {
            const errorData = err.response?.data
            if (errorData?.errors?.Notes) {
                setNotesError(errorData.errors.Notes[0])
            } else {
                showError(errorData?.message || 'Failed to resolve dispute')
            }
        } finally {
            setResolveLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleString()
    }

    if (!hasAccess) {
        return <Navigate to="/" replace />
    }

    if (loading) {
        return (
            <div className="text-center p-5">
                <CSpinner />
                <p className="mt-2">Loading dispute...</p>
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

    if (!dispute) {
        return (
            <CRow>
                <CCol>
                    <CAlert color="warning">Dispute not found.</CAlert>
                </CCol>
            </CRow>
        )
    }

    const isResolved = dispute.status === 2 || dispute.status === 4 || dispute.status === 'Resolved' || dispute.status === 'Closed'
    const isEscalated = dispute.status === 3 || dispute.status === 'EscalatedToModerator'

    return (
        <CRow>
            <CCol xs={12}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2>
                            <CIcon icon={cilShieldAlt} className="me-2" />
                            Dispute Review
                        </h2>
                        <small className="text-muted">ID: {dispute.id}</small>
                    </div>
                    <CButton color="secondary" variant="outline" onClick={() => navigate('/admin/disputes')}>
                        Back to Disputes
                    </CButton>
                </div>

                {/* Status Alert */}
                {isEscalated && (
                    <CCallout color="warning" className="mb-4">
                        <div className="d-flex align-items-center">
                            <CIcon icon={cilWarning} size="xl" className="me-3" />
                            <div>
                                <strong>This dispute requires your review!</strong>
                                <p className="mb-0 small">
                                    The parties have escalated this dispute for moderator intervention.
                                    Please review all evidence and make a fair decision.
                                </p>
                            </div>
                        </div>
                    </CCallout>
                )}

                {isResolved && (
                    <CCallout color="success" className="mb-4">
                        <div className="d-flex align-items-center">
                            <CIcon icon={cilCheckCircle} size="xl" className="me-3" />
                            <div>
                                <strong>This dispute has been resolved.</strong>
                                <p className="mb-0 small">
                                    Resolution: {getResolutionBadge(dispute.resolution)}
                                </p>
                            </div>
                        </div>
                    </CCallout>
                )}

                <CRow>
                    {/* Main Dispute Info */}
                    <CCol lg={8}>
                        <CCard className="mb-4">
                            <CCardHeader className="d-flex justify-content-between align-items-center">
                                <strong>Dispute Information</strong>
                                {getStatusBadge(dispute.status)}
                            </CCardHeader>
                            <CCardBody>
                                {/* Agreement Info */}
                                <div className="mb-4">
                                    <h6>Related Agreement</h6>
                                    <Link to={`/agreements/${dispute.agreementId}`}>
                                        <strong>View Agreement</strong>
                                    </Link>
                                </div>

                                <hr />

                                {/* Parties */}
                                <CRow className="mb-4">
                                    <CCol md={6}>
                                        <div className="d-flex align-items-center mb-2">
                                            <CIcon icon={cilWarning} className="me-2 text-warning" />
                                            <strong>Complainer</strong>
                                        </div>
                                        <Link to={`/users/${dispute.complainer?.userId}`}>
                                            {dispute.complainer?.name}
                                        </Link>
                                    </CCol>
                                    <CCol md={6}>
                                        <div className="d-flex align-items-center mb-2">
                                            <CIcon icon={cilUser} className="me-2 text-info" />
                                            <strong>Respondent</strong>
                                        </div>
                                        <Link to={`/users/${dispute.respondent?.userId}`}>
                                            {dispute.respondent?.name}
                                        </Link>
                                    </CCol>
                                </CRow>

                                <hr />

                                {/* Dispute Reason & Description */}
                                <div className="mb-4">
                                    <h6>Reason for Dispute</h6>
                                    <CBadge color="secondary" className="mb-2">{getReasonLabel(dispute.reasonCode)}</CBadge>
                                    <div className="bg-body-secondary p-3 rounded">
                                        <strong>Complainer's Statement:</strong>
                                        <p className="mb-0 mt-2">{dispute.description}</p>
                                    </div>
                                </div>

                                <hr />

                                {/* Score Section */}
                                <CRow className="mb-4">
                                    <CCol md={6}>
                                        <h6>
                                            <CIcon icon={cilStar} className="me-2 text-warning" />
                                            System Score
                                        </h6>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="fs-2 fw-bold">{dispute.score}</div>
                                            <CProgress 
                                                value={dispute.score} 
                                                className="flex-grow-1" 
                                                style={{ height: '20px' }}
                                                color={dispute.score >= 70 ? 'info' : dispute.score >= 40 ? 'warning' : 'success'}
                                            />
                                        </div>
                                        {dispute.scoreBreakdown && (
                                            <div className="small text-muted mt-2">
                                                {dispute.scoreBreakdown.interpretation}
                                            </div>
                                        )}
                                    </CCol>
                                    <CCol md={6}>
                                        <h6>System Decision</h6>
                                        {getSystemDecisionBadge(dispute.systemDecision)}
                                    </CCol>
                                </CRow>

                                {/* Score Breakdown */}
                                {dispute.scoreBreakdown && (
                                    <>
                                        <hr />
                                        <div className="mb-4">
                                            <h6>Score Breakdown</h6>
                                            <CRow className="g-2">
                                                <CCol md={6}>
                                                    <div className="p-2 border rounded">
                                                        <strong>Complainer:</strong>
                                                        <ul className="mb-0 small">
                                                            <li>Delivered: {dispute.scoreBreakdown.complainerDelivered ? '✅ Yes' : '❌ No'}</li>
                                                            <li>On Time: {dispute.scoreBreakdown.complainerOnTime ? '✅ Yes' : '❌ No'}</li>
                                                            <li>Approved: {dispute.scoreBreakdown.complainerApprovedBeforeDispute ? '✅ Yes' : '❌ No'}</li>
                                                        </ul>
                                                    </div>
                                                </CCol>
                                                <CCol md={6}>
                                                    <div className="p-2 border rounded">
                                                        <strong>Respondent:</strong>
                                                        <ul className="mb-0 small">
                                                            <li>Delivered: {dispute.scoreBreakdown.respondentDelivered ? '✅ Yes' : '❌ No'}</li>
                                                            <li>On Time: {dispute.scoreBreakdown.respondentOnTime ? '✅ Yes' : '❌ No'}</li>
                                                            <li>Approved: {dispute.scoreBreakdown.respondentApprovedBeforeDispute ? '✅ Yes' : '❌ No'}</li>
                                                        </ul>
                                                    </div>
                                                </CCol>
                                            </CRow>
                                        </div>
                                    </>
                                )}

                                {/* Resolution Summary */}
                                {dispute.resolutionSummary && (
                                    <>
                                        <hr />
                                        <div className="mb-4">
                                            <h6>Resolution Summary</h6>
                                            <div className="bg-body-secondary p-3 rounded">
                                                {dispute.resolutionSummary}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <hr />

                                {/* Dates */}
                                <CRow>
                                    <CCol md={3}>
                                        <div className="d-flex align-items-center">
                                            <CIcon icon={cilCalendar} className="me-2 text-muted" />
                                            <div>
                                                <small className="text-muted">Created</small>
                                                <div>{formatDate(dispute.createdAt)}</div>
                                            </div>
                                        </div>
                                    </CCol>
                                    {dispute.responseReceivedAt && (
                                        <CCol md={3}>
                                            <div className="d-flex align-items-center">
                                                <CIcon icon={cilCommentSquare} className="me-2 text-info" />
                                                <div>
                                                    <small className="text-muted">Response</small>
                                                    <div>{formatDate(dispute.responseReceivedAt)}</div>
                                                </div>
                                            </div>
                                        </CCol>
                                    )}
                                    {dispute.escalatedAt && (
                                        <CCol md={3}>
                                            <div className="d-flex align-items-center">
                                                <CIcon icon={cilArrowTop} className="me-2 text-warning" />
                                                <div>
                                                    <small className="text-muted">Escalated</small>
                                                    <div>{formatDate(dispute.escalatedAt)}</div>
                                                </div>
                                            </div>
                                        </CCol>
                                    )}
                                    {dispute.closedAt && (
                                        <CCol md={3}>
                                            <div className="d-flex align-items-center">
                                                <CIcon icon={cilCheckCircle} className="me-2 text-success" />
                                                <div>
                                                    <small className="text-muted">Closed</small>
                                                    <div>{formatDate(dispute.closedAt)}</div>
                                                </div>
                                            </div>
                                        </CCol>
                                    )}
                                </CRow>
                            </CCardBody>
                        </CCard>

                        {/* Evidence Section */}
                        <CCard className="mb-4">
                            <CCardHeader>
                                <strong>Evidence</strong>
                            </CCardHeader>
                            <CCardBody>
                                {(!dispute.evidence || dispute.evidence.length === 0) ? (
                                    <div className="text-muted">No evidence submitted.</div>
                                ) : (
                                    <CListGroup>
                                        {dispute.evidence.map((ev) => (
                                            <CListGroupItem key={ev.id}>
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <strong>{ev.submittedByName}</strong>
                                                        <div className="small text-muted">
                                                            {formatDate(ev.submittedAt)}
                                                        </div>
                                                    </div>
                                                    <a href={ev.link} target="_blank" rel="noopener noreferrer">
                                                        <CIcon icon={cilExternalLink} className="me-1" />
                                                        View
                                                    </a>
                                                </div>
                                                <p className="mb-0 mt-2">{ev.description}</p>
                                            </CListGroupItem>
                                        ))}
                                    </CListGroup>
                                )}
                            </CCardBody>
                        </CCard>
                    </CCol>

                    {/* Moderator Actions Panel */}
                    <CCol lg={4}>
                        <CCard className="mb-4 border-warning">
                            <CCardHeader className="bg-warning text-white">
                                <strong>
                                    <CIcon icon={cilShieldAlt} className="me-2" />
                                    Moderator Decision
                                </strong>
                            </CCardHeader>
                            <CCardBody>
                                {isResolved ? (
                                    <div>
                                        <CAlert color="success">
                                            <strong>This dispute has been resolved.</strong>
                                        </CAlert>
                                        <div className="mb-3">
                                            <strong>Final Resolution:</strong>
                                            <div className="mt-1">{getResolutionBadge(dispute.resolution)}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <CForm>
                                        <CAlert color="info" className="mb-3">
                                            <small>
                                                Review all evidence carefully before making a decision.
                                                Your decision is final and will affect both parties.
                                            </small>
                                        </CAlert>

                                        <div className="mb-3">
                                            <CFormLabel>Resolution *</CFormLabel>
                                            <CFormSelect
                                                value={resolution.resolution}
                                                onChange={(e) => setResolution({ ...resolution, resolution: e.target.value })}
                                            >
                                                <option value="">Select a resolution</option>
                                                <option value="FavorsComplainer">
                                                    Favors Complainer - Rule in favor of {dispute.complainer?.name}
                                                </option>
                                                <option value="FavorsRespondent">
                                                    Favors Respondent - Rule in favor of {dispute.respondent?.name}
                                                </option>
                                                <option value="Split">
                                                    Split - Neither party fully at fault
                                                </option>
                                            </CFormSelect>
                                        </div>

                                        <div className="mb-3">
                                            <CFormLabel>Moderator Notes *</CFormLabel>
                                            <CFormTextarea
                                                rows={4}
                                                placeholder="Add notes explaining your decision (minimum 20 characters)..."
                                                value={resolution.notes}
                                                onChange={(e) => {
                                                    setResolution({ ...resolution, notes: e.target.value })
                                                    if (notesError && e.target.value.trim().length >= 20) {
                                                        setNotesError('')
                                                    }
                                                }}
                                                invalid={!!notesError}
                                            />
                                            <div className="d-flex justify-content-between align-items-center mt-1">
                                                {notesError ? (
                                                    <small className="text-danger">{notesError}</small>
                                                ) : (
                                                    <small className="text-muted">Min 20 characters required</small>
                                                )}
                                                <small className={resolution.notes.trim().length < 20 ? 'text-danger' : 'text-success'}>
                                                    {resolution.notes.trim().length}/20
                                                </small>
                                            </div>
                                        </div>

                                        <CButton
                                            color="warning"
                                            className="w-100"
                                            onClick={handleResolve}
                                            disabled={resolveLoading || !resolution.resolution || resolution.notes.trim().length < 20}
                                        >
                                            {resolveLoading ? (
                                                <CSpinner size="sm" />
                                            ) : (
                                                <>
                                                    <CIcon icon={cilCheckCircle} className="me-1" />
                                                    Resolve Dispute
                                                </>
                                            )}
                                        </CButton>
                                    </CForm>
                                )}
                            </CCardBody>
                        </CCard>

                        {/* Quick Links */}
                        <CCard>
                            <CCardHeader>
                                <strong>Quick Links</strong>
                            </CCardHeader>
                            <CCardBody>
                                <div className="d-grid gap-2">
                                    <CButton
                                        color="light"
                                        size="sm"
                                        onClick={() => navigate(`/agreements/${dispute.agreementId}`)}
                                    >
                                        View Agreement
                                    </CButton>
                                    <CButton
                                        color="light"
                                        size="sm"
                                        onClick={() => navigate(`/users/${dispute.complainer?.userId}`)}
                                    >
                                        View Complainer Profile
                                    </CButton>
                                    <CButton
                                        color="light"
                                        size="sm"
                                        onClick={() => navigate(`/users/${dispute.respondent?.userId}`)}
                                    >
                                        View Respondent Profile
                                    </CButton>
                                </div>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CCol>
        </CRow>
    )
}

export default AdminDisputeDetails

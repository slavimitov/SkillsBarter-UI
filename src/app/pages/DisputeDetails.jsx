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
    CListGroup,
    CListGroupItem,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CForm,
    CFormLabel,
    CFormTextarea,
    CFormInput,
    CCallout,
    CProgress,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilUser,
    cilCalendar,
    cilWarning,
    cilCheckCircle,
    cilXCircle,
    cilArrowTop,
    cilCommentSquare,
    cilClock,
    cilStar,
    cilPlus,
    cilTrash,
    cilExternalLink,
} from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { ConfirmModal } from '../components'
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

const DisputeDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { showSuccess, showError, showWarning } = useToast()

    const [dispute, setDispute] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [respondModalVisible, setRespondModalVisible] = useState(false)
    const [responseText, setResponseText] = useState('')
    const [responseEvidence, setResponseEvidence] = useState([])
    const [respondLoading, setRespondLoading] = useState(false)

    const [acceptModalVisible, setAcceptModalVisible] = useState(false)
    const [acceptLoading, setAcceptLoading] = useState(false)

    const [escalateModalVisible, setEscalateModalVisible] = useState(false)
    const [escalateReason, setEscalateReason] = useState('')
    const [escalateLoading, setEscalateLoading] = useState(false)

    const [evidenceModalVisible, setEvidenceModalVisible] = useState(false)
    const [newEvidence, setNewEvidence] = useState({ link: '', description: '' })
    const [evidenceLoading, setEvidenceLoading] = useState(false)

    useEffect(() => {
        if (id) {
            fetchDispute()
        }
    }, [id])

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

    const addEvidenceField = () => {
        setResponseEvidence([...responseEvidence, { link: '', description: '' }])
    }

    const removeEvidenceField = (index) => {
        setResponseEvidence(responseEvidence.filter((_, i) => i !== index))
    }

    const updateEvidenceField = (index, field, value) => {
        const updated = [...responseEvidence]
        updated[index][field] = value
        setResponseEvidence(updated)
    }

    const handleRespond = async () => {
        if (!responseText || responseText.length < 20) {
            showWarning('Please provide a detailed response (at least 20 characters)')
            return
        }

        for (const ev of responseEvidence) {
            if (ev.link && !ev.description) {
                showWarning('Please provide a description for all evidence links')
                return
            }
        }

        try {
            setRespondLoading(true)
            await disputeService.respondToDispute(id, { 
                response: responseText,
                evidence: responseEvidence.filter(e => e.link && e.description)
            })
            setRespondModalVisible(false)
            setResponseText('')
            setResponseEvidence([])
            showSuccess('Response submitted successfully!')
            await fetchDispute()
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to submit response')
        } finally {
            setRespondLoading(false)
        }
    }

    const handleAcceptDecision = async (accept) => {
        try {
            setAcceptLoading(true)
            await disputeService.acceptDecision(id, { accept })
            setAcceptModalVisible(false)
            showSuccess(accept ? 'Decision accepted!' : 'Decision rejected, dispute may be escalated.')
            await fetchDispute()
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to record decision')
        } finally {
            setAcceptLoading(false)
        }
    }

    const handleEscalate = async () => {
        try {
            setEscalateLoading(true)
            await disputeService.escalateDispute(id, { reason: escalateReason })
            setEscalateModalVisible(false)
            setEscalateReason('')
            showSuccess('Dispute escalated to moderator!')
            await fetchDispute()
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to escalate dispute')
        } finally {
            setEscalateLoading(false)
        }
    }

    const handleAddEvidence = async () => {
        if (!newEvidence.link || !newEvidence.description) {
            showWarning('Please provide both a link and description')
            return
        }

        try {
            setEvidenceLoading(true)
            await disputeService.addEvidence(id, newEvidence)
            setEvidenceModalVisible(false)
            setNewEvidence({ link: '', description: '' })
            showSuccess('Evidence added successfully!')
            await fetchDispute()
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to add evidence')
        } finally {
            setEvidenceLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleString()
    }

    const formatDeadline = (dateString) => {
        if (!dateString) return null
        const deadline = new Date(dateString)
        const now = new Date()
        const isOverdue = deadline < now
        const diffHours = Math.round((deadline - now) / (1000 * 60 * 60))
        
        if (isOverdue) {
            return <span className="text-danger fw-bold">Overdue</span>
        }
        return <span className="text-warning">{diffHours} hours remaining</span>
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

    const isComplainer = user?.id === dispute.complainer?.userId
    const isRespondent = user?.id === dispute.respondent?.userId
    const isResolved = dispute.status === 2 || dispute.status === 4 || dispute.status === 'Resolved' || dispute.status === 'Closed'
    const isAwaitingResponse = dispute.status === 0 || dispute.status === 'AwaitingResponse'
    const isUnderReview = dispute.status === 1 || dispute.status === 'UnderReview'
    const isEscalated = dispute.status === 3 || dispute.status === 'EscalatedToModerator'

    return (
        <CRow>
            <CCol xs={12}>
                {/* Main Dispute Info */}
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Dispute Details</strong>
                            <span className="ms-2">{getStatusBadge(dispute.status)}</span>
                            {isComplainer && <CBadge color="warning" className="ms-2">You are Complainer</CBadge>}
                            {isRespondent && <CBadge color="info" className="ms-2">You are Respondent</CBadge>}
                        </div>
                        <div className="d-flex gap-2">
                            <CButton color="secondary" size="sm" variant="outline" onClick={() => navigate('/disputes')}>
                                Back to Disputes
                            </CButton>
                        </div>
                    </CCardHeader>
                    <CCardBody>
                        {/* Deadline Warning for Respondent */}
                        {isAwaitingResponse && dispute.responseDeadline && (
                            <CCallout color={isRespondent ? 'danger' : 'warning'} className="mb-4">
                                <div className="d-flex align-items-center">
                                    <CIcon icon={cilClock} className="me-2" size="xl" />
                                    <div>
                                        <strong>Response Deadline:</strong> {formatDate(dispute.responseDeadline)}
                                        <span className="ms-2">({formatDeadline(dispute.responseDeadline)})</span>
                                    </div>
                                </div>
                                {isRespondent && (
                                    <div className="mt-2">
                                        <strong className="text-danger">You must respond to this dispute within 72 hours!</strong>
                                        <p className="mb-0 small">If you don't respond, the dispute will be automatically resolved in favor of the complainer.</p>
                                    </div>
                                )}
                            </CCallout>
                        )}

                        {/* Agreement Info */}
                        <div className="mb-4">
                            <h6>Related Agreement</h6>
                            <Link to={`/agreements/${dispute.agreementId}`}>
                                <strong>View Agreement</strong>
                            </Link>
                        </div>

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

                        {/* Parties */}
                        <CRow className="mb-4">
                            <CCol md={6}>
                                <div className="d-flex align-items-center mb-2">
                                    <CIcon icon={cilWarning} className="me-2 text-warning" />
                                    <strong>Complainer</strong>
                                    {isComplainer && <CBadge color="info" className="ms-2">You</CBadge>}
                                </div>
                                <Link to={`/users/${dispute.complainer?.userId}`}>
                                    {dispute.complainer?.name}
                                </Link>
                                <div className="small text-muted mt-1">
                                    Decision: {dispute.complainerDecision === 1 || dispute.complainerDecision === 'Accept' 
                                        ? <CBadge color="success">Accepted</CBadge>
                                        : dispute.complainerDecision === 2 || dispute.complainerDecision === 'Reject'
                                        ? <CBadge color="danger">Rejected</CBadge>
                                        : <CBadge color="secondary">Pending</CBadge>}
                                </div>
                            </CCol>
                            <CCol md={6}>
                                <div className="d-flex align-items-center mb-2">
                                    <CIcon icon={cilUser} className="me-2 text-info" />
                                    <strong>Respondent</strong>
                                    {isRespondent && <CBadge color="info" className="ms-2">You</CBadge>}
                                </div>
                                <Link to={`/users/${dispute.respondent?.userId}`}>
                                    {dispute.respondent?.name}
                                </Link>
                                <div className="small text-muted mt-1">
                                    Decision: {dispute.respondentDecision === 1 || dispute.respondentDecision === 'Accept' 
                                        ? <CBadge color="success">Accepted</CBadge>
                                        : dispute.respondentDecision === 2 || dispute.respondentDecision === 'Reject'
                                        ? <CBadge color="danger">Rejected</CBadge>
                                        : <CBadge color="secondary">Pending</CBadge>}
                                </div>
                            </CCol>
                        </CRow>

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
                                <div className="mt-2">
                                    <h6>Resolution</h6>
                                    {getResolutionBadge(dispute.resolution)}
                                </div>
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
                        <CRow className="mb-4">
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
                                            <small className="text-muted">Response Received</small>
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
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <strong>Evidence</strong>
                        {dispute.canAddEvidence && (
                            <CButton 
                                color="primary" 
                                size="sm"
                                onClick={() => setEvidenceModalVisible(true)}
                            >
                                <CIcon icon={cilPlus} className="me-1" />
                                Add Evidence
                            </CButton>
                        )}
                    </CCardHeader>
                    <CCardBody>
                        {(!dispute.evidence || dispute.evidence.length === 0) ? (
                            <div className="text-muted">No evidence submitted yet.</div>
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

                {/* Actions Panel */}
                {!isResolved && (
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>Available Actions</strong>
                        </CCardHeader>
                        <CCardBody>
                            {/* Respond Action - for respondent when awaiting response */}
                            {dispute.canRespond && (
                                <CAlert color="danger">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Response Required!</strong>
                                            <p className="mb-0 small">
                                                You must respond to this dispute. Provide your side of the story and any evidence.
                                            </p>
                                        </div>
                                        <CButton 
                                            color="primary" 
                                            onClick={() => setRespondModalVisible(true)}
                                        >
                                            <CIcon icon={cilCommentSquare} className="me-1" />
                                            Respond Now
                                        </CButton>
                                    </div>
                                </CAlert>
                            )}

                            {/* Accept/Reject Decision - when under review and can accept */}
                            {dispute.canAcceptDecision && (
                                <CAlert color="warning">
                                    <div className="mb-3">
                                        <strong>System Decision Available</strong>
                                        <p className="mb-0 small">
                                            The system has made a preliminary decision based on the evidence. 
                                            You can accept this decision or reject it to escalate to a moderator.
                                        </p>
                                        <div className="mt-2">
                                            <strong>Decision:</strong> {getSystemDecisionBadge(dispute.systemDecision)}
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <CButton 
                                            color="success" 
                                            onClick={() => setAcceptModalVisible(true)}
                                        >
                                            <CIcon icon={cilCheckCircle} className="me-1" />
                                            Accept Decision
                                        </CButton>
                                        <CButton 
                                            color="danger" 
                                            variant="outline"
                                            onClick={() => handleAcceptDecision(false)}
                                            disabled={acceptLoading}
                                        >
                                            <CIcon icon={cilXCircle} className="me-1" />
                                            Reject & Escalate
                                        </CButton>
                                    </div>
                                </CAlert>
                            )}

                            {/* Escalate Action */}
                            {dispute.canEscalate && !dispute.canAcceptDecision && (
                                <CAlert color="info">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Escalate to Moderator</strong>
                                            <p className="mb-0 small">
                                                If you disagree with the system decision, you can escalate to a human moderator.
                                            </p>
                                        </div>
                                        <CButton 
                                            color="warning" 
                                            onClick={() => setEscalateModalVisible(true)}
                                        >
                                            <CIcon icon={cilArrowTop} className="me-1" />
                                            Escalate
                                        </CButton>
                                    </div>
                                </CAlert>
                            )}

                            {/* Escalated status message */}
                            {isEscalated && (
                                <CAlert color="primary">
                                    <CIcon icon={cilClock} className="me-2" />
                                    <strong>Pending Moderator Review</strong>
                                    <p className="mb-0 small mt-1">
                                        This dispute has been escalated and is awaiting review by a moderator. 
                                        You will be notified when a decision is made.
                                    </p>
                                </CAlert>
                            )}

                            {/* No actions available */}
                            {!dispute.canRespond && !dispute.canAcceptDecision && !dispute.canEscalate && !isEscalated && (
                                <div className="text-muted">
                                    No actions available at this time. Wait for the other party or moderator.
                                </div>
                            )}
                        </CCardBody>
                    </CCard>
                )}

                {/* Resolved Card */}
                {isResolved && (
                    <CCard className="mb-4 border-success">
                        <CCardHeader className="bg-success text-white">
                            <strong>
                                <CIcon icon={cilCheckCircle} className="me-2" />
                                Dispute Resolved
                            </strong>
                        </CCardHeader>
                        <CCardBody>
                            <div className="mb-3">
                                <strong>Final Resolution:</strong> {getResolutionBadge(dispute.resolution)}
                            </div>
                            {dispute.resolutionSummary && (
                                <div className="bg-body-secondary p-3 rounded">
                                    {dispute.resolutionSummary}
                                </div>
                            )}
                        </CCardBody>
                    </CCard>
                )}
            </CCol>

            {/* Respond Modal */}
            <CModal
                visible={respondModalVisible}
                onClose={() => {
                    setRespondModalVisible(false)
                    setResponseText('')
                    setResponseEvidence([])
                }}
                size="lg"
            >
                <CModalHeader>
                    <CModalTitle>Respond to Dispute</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CAlert color="warning">
                        <CIcon icon={cilWarning} className="me-2" />
                        <strong>Important:</strong> Provide a detailed and honest response. 
                        Include any evidence that supports your case.
                    </CAlert>
                    <CForm>
                        <div className="mb-3">
                            <CFormLabel>Your Response *</CFormLabel>
                            <CFormTextarea
                                rows={6}
                                placeholder="Explain your side of the situation. Be specific about what happened and provide context..."
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                            />
                            <small className="text-muted">Minimum 20 characters required</small>
                        </div>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <CFormLabel className="mb-0">Evidence (Optional)</CFormLabel>
                                <CButton size="sm" color="light" onClick={addEvidenceField}>
                                    <CIcon icon={cilPlus} className="me-1" />
                                    Add Evidence
                                </CButton>
                            </div>
                            {responseEvidence.map((ev, index) => (
                                <CCard key={index} className="mb-2">
                                    <CCardBody className="p-2">
                                        <div className="d-flex gap-2 align-items-start">
                                            <div className="flex-grow-1">
                                                <CFormInput
                                                    placeholder="Link (URL)"
                                                    value={ev.link}
                                                    onChange={(e) => updateEvidenceField(index, 'link', e.target.value)}
                                                    className="mb-2"
                                                />
                                                <CFormInput
                                                    placeholder="Description"
                                                    value={ev.description}
                                                    onChange={(e) => updateEvidenceField(index, 'description', e.target.value)}
                                                />
                                            </div>
                                            <CButton 
                                                color="danger" 
                                                size="sm" 
                                                variant="ghost"
                                                onClick={() => removeEvidenceField(index)}
                                            >
                                                <CIcon icon={cilTrash} />
                                            </CButton>
                                        </div>
                                    </CCardBody>
                                </CCard>
                            ))}
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setRespondModalVisible(false)}>
                        Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleRespond} disabled={respondLoading}>
                        {respondLoading ? <CSpinner size="sm" /> : 'Submit Response'}
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Accept Decision Confirmation Modal */}
            <ConfirmModal
                visible={acceptModalVisible}
                onClose={() => setAcceptModalVisible(false)}
                onConfirm={() => handleAcceptDecision(true)}
                title="Accept Decision"
                message={
                    <div>
                        <p>Are you sure you want to accept the system decision?</p>
                        <p><strong>Decision:</strong> {getSystemDecisionBadge(dispute?.systemDecision)}</p>
                        <p className="text-muted small">
                            Both parties must accept for the dispute to be resolved. 
                            If you accept but the other party rejects, the dispute will be escalated to a moderator.
                        </p>
                    </div>
                }
                confirmText="Accept Decision"
                confirmColor="success"
                loading={acceptLoading}
            />

            {/* Escalate Modal */}
            <CModal
                visible={escalateModalVisible}
                onClose={() => {
                    setEscalateModalVisible(false)
                    setEscalateReason('')
                }}
            >
                <CModalHeader>
                    <CModalTitle>Escalate to Moderator</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CAlert color="info">
                        A moderator will review all evidence and make a final decision.
                        This process may take additional time.
                    </CAlert>
                    <CForm>
                        <div className="mb-3">
                            <CFormLabel>Reason for Escalation (Optional)</CFormLabel>
                            <CFormTextarea
                                rows={3}
                                placeholder="Explain why you want to escalate this dispute..."
                                value={escalateReason}
                                onChange={(e) => setEscalateReason(e.target.value)}
                            />
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setEscalateModalVisible(false)}>
                        Cancel
                    </CButton>
                    <CButton color="warning" onClick={handleEscalate} disabled={escalateLoading}>
                        {escalateLoading ? <CSpinner size="sm" /> : 'Escalate'}
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Add Evidence Modal */}
            <CModal
                visible={evidenceModalVisible}
                onClose={() => {
                    setEvidenceModalVisible(false)
                    setNewEvidence({ link: '', description: '' })
                }}
            >
                <CModalHeader>
                    <CModalTitle>Add Evidence</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <div className="mb-3">
                            <CFormLabel>Link *</CFormLabel>
                            <CFormInput
                                type="url"
                                placeholder="https://..."
                                value={newEvidence.link}
                                onChange={(e) => setNewEvidence({ ...newEvidence, link: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Description *</CFormLabel>
                            <CFormTextarea
                                rows={3}
                                placeholder="Describe what this evidence shows..."
                                value={newEvidence.description}
                                onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                            />
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setEvidenceModalVisible(false)}>
                        Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleAddEvidence} disabled={evidenceLoading}>
                        {evidenceLoading ? <CSpinner size="sm" /> : 'Add Evidence'}
                    </CButton>
                </CModalFooter>
            </CModal>
        </CRow>
    )
}

export default DisputeDetails

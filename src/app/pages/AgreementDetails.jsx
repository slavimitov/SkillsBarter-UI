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
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CForm,
    CFormLabel,
    CFormInput,
    CFormTextarea,
    CFormSelect,
    CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilUser,
    cilCalendar,
    cilCheckCircle,
    cilTask,
    cilCloudUpload,
    cilThumbUp,
    cilLoop,
    cilExternalLink,
    cilStar,
    cilWarning,
    cilClock,
} from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { ConfirmModal } from '../components'
import agreementService from '../services/agreementService'
import deliverableService from '../services/deliverableService'

const AgreementDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { showSuccess, showError, showWarning } = useToast()

    const [agreement, setAgreement] = useState(null)
    const [deliverables, setDeliverables] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [submitModalVisible, setSubmitModalVisible] = useState(false)
    const [submitForm, setSubmitForm] = useState({ link: '', description: '', milestoneId: '' })
    const [submitLoading, setSubmitLoading] = useState(false)

    const [revisionModalVisible, setRevisionModalVisible] = useState(false)
    const [revisionReason, setRevisionReason] = useState('')
    const [selectedDeliverableId, setSelectedDeliverableId] = useState(null)
    const [revisionLoading, setRevisionLoading] = useState(false)

    const [resubmitModalVisible, setResubmitModalVisible] = useState(false)
    const [resubmitForm, setResubmitForm] = useState({ link: '', description: '' })
    const [resubmitLoading, setResubmitLoading] = useState(false)

    const [completeModalVisible, setCompleteModalVisible] = useState(false)
    const [completeLoading, setCompleteLoading] = useState(false)
    const [approveModalVisible, setApproveModalVisible] = useState(false)
    const [approveLoading, setApproveLoading] = useState(false)
    const [deliverableToApprove, setDeliverableToApprove] = useState(null)

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
                setDeliverables(delivData)
            } catch {
                setDeliverables(null)
            }
        } catch (err) {
            console.error('Error fetching agreement:', err)
            setError(err.response?.data?.message || 'Failed to load agreement details.')
        } finally {
            setLoading(false)
        }
    }

    const handleComplete = async () => {
        try {
            setCompleteLoading(true)
            await agreementService.completeAgreement(id)
            setCompleteModalVisible(false)
            showSuccess('Agreement marked as complete!')
            await fetchAgreement()
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to complete agreement')
        } finally {
            setCompleteLoading(false)
        }
    }

    const handleSubmitDeliverable = async () => {
        if (!submitForm.link || !submitForm.description) {
            showWarning('Please fill in all fields')
            return
        }

        // Simple URL validation
        try {
            const url = new URL(submitForm.link)
            if (!['http:', 'https:'].includes(url.protocol)) {
                showWarning('Please provide a valid URL starting with http:// or https://')
                return
            }
        } catch (_) {
            showWarning('Please provide a valid URL (e.g., https://github.com/...)')
            return
        }

        try {
            setSubmitLoading(true)
            await deliverableService.submit({
                agreementId: id,
                milestoneId: submitForm.milestoneId || null,
                link: submitForm.link,
                description: submitForm.description,
            })
            setSubmitModalVisible(false)
            setSubmitForm({ link: '', description: '', milestoneId: '' })
            showSuccess('Deliverable submitted successfully!')
            await fetchAgreement()
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to submit deliverable')
        } finally {
            setSubmitLoading(false)
        }
    }

    const openApproveModal = (deliverableId) => {
        setDeliverableToApprove(deliverableId)
        setApproveModalVisible(true)
    }

    const handleApprove = async () => {
        if (!deliverableToApprove) return

        try {
            setApproveLoading(true)
            await deliverableService.approve(deliverableToApprove)
            setApproveModalVisible(false)
            setDeliverableToApprove(null)
            showSuccess('Deliverable approved!')
            await fetchAgreement()
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to approve deliverable')
        } finally {
            setApproveLoading(false)
        }
    }

    const openRevisionModal = (deliverableId) => {
        setSelectedDeliverableId(deliverableId)
        setRevisionReason('')
        setRevisionModalVisible(true)
    }

    const handleRequestRevision = async () => {
        if (!revisionReason || revisionReason.length < 10) {
            showWarning('Please provide a detailed reason (at least 10 characters)')
            return
        }

        try {
            setRevisionLoading(true)
            await deliverableService.requestRevision(selectedDeliverableId, revisionReason)
            setRevisionModalVisible(false)
            setRevisionReason('')
            showSuccess('Revision requested successfully!')
            await fetchAgreement()
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to request revision')
        } finally {
            setRevisionLoading(false)
        }
    }

    const openResubmitModal = (deliverable) => {
        setSelectedDeliverableId(deliverable.id)
        setResubmitForm({
            link: deliverable.link || '',
            description: deliverable.description || '',
        })
        setResubmitModalVisible(true)
    }

    const handleResubmit = async () => {
        if (!resubmitForm.link || !resubmitForm.description) {
            showWarning('Please fill in all fields')
            return
        }

        // Simple URL validation
        try {
            const url = new URL(resubmitForm.link)
            if (!['http:', 'https:'].includes(url.protocol)) {
                showWarning('Please provide a valid URL starting with http:// or https://')
                return
            }
        } catch (_) {
            showWarning('Please provide a valid URL (e.g., https://github.com/...)')
            return
        }

        try {
            setResubmitLoading(true)
            await deliverableService.resubmit(selectedDeliverableId, {
                agreementId: id,
                link: resubmitForm.link,
                description: resubmitForm.description,
            })
            setResubmitModalVisible(false)
            setResubmitForm({ link: '', description: '' })
            showSuccess('Deliverable resubmitted successfully!')
            await fetchAgreement()
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to resubmit deliverable')
        } finally {
            setResubmitLoading(false)
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

    const getDeliverableStatusBadge = (status) => {
        const statusMap = {
            0: { color: 'warning', label: 'Submitted' },
            1: { color: 'success', label: 'Approved' },
            2: { color: 'info', label: 'Revision Requested' },
            'Submitted': { color: 'warning', label: 'Submitted' },
            'Approved': { color: 'success', label: 'Approved' },
            'RevisionRequested': { color: 'info', label: 'Revision Requested' },
        }
        const info = statusMap[status] || { color: 'secondary', label: status }
        return <CBadge color={info.color}>{info.label}</CBadge>
    }

    if (loading) {
        return (
            <div className="text-center p-5">
                <CSpinner />
                <p className="mt-2">Loading agreement...</p>
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
    const isActive = agreement.status === 1 || agreement.status === 'InProgress'
    const canComplete = (isRequester || isProvider) && isActive && deliverables?.bothApproved

    const completedMilestones = agreement.milestones?.filter(m => m.status === 2 || m.status === 'Completed').length || 0
    const totalMilestones = agreement.milestones?.length || 0
    const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

    const myDeliverable = isRequester
        ? deliverables?.requesterDeliverable
        : deliverables?.providerDeliverable
    const otherDeliverable = isRequester
        ? deliverables?.providerDeliverable
        : deliverables?.requesterDeliverable

    const canSubmitDeliverable = isActive && !myDeliverable

    const myMilestones = agreement.milestones?.filter(m => m.responsibleUserId === user?.id) || []
    const otherMilestones = agreement.milestones?.filter(m => m.responsibleUserId !== user?.id) || []

    return (
        <CRow>
            <CCol xs={12}>
                {/* Main Agreement Info */}
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Agreement Details</strong>
                            <span className="ms-2">{getStatusBadge(agreement.status)}</span>
                            {isRequester && <CBadge color="info" className="ms-2">You are Requester</CBadge>}
                            {isProvider && <CBadge color="success" className="ms-2">You are Provider</CBadge>}
                        </div>
                        <div className="d-flex gap-2">
                            {canComplete && (
                                <CButton color="success" size="sm" onClick={() => setCompleteModalVisible(true)}>
                                    <CIcon icon={cilCheckCircle} className="me-1" />
                                    Mark Complete
                                </CButton>
                            )}
                            <CButton color="secondary" size="sm" variant="outline" onClick={() => navigate('/agreements')}>
                                Back to Agreements
                            </CButton>
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
                                <p className="bg-body-secondary p-3 rounded">{agreement.terms}</p>
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

                {/* Milestones - Your Responsibilities */}
                {myMilestones.length > 0 && (
                    <CCard className="mb-4">
                        <CCardHeader className="bg-primary text-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <strong>
                                    <CIcon icon={cilTask} className="me-2" />
                                    Your Milestones (What You Need to Deliver)
                                </strong>
                                <span>
                                    {myMilestones.filter(m => m.status === 2 || m.status === 'Completed').length} / {myMilestones.length} completed
                                </span>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            <CListGroup>
                                {myMilestones.map((milestone, index) => (
                                    <CListGroupItem key={milestone.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{index + 1}. {milestone.title}</strong>
                                            <div className="small text-muted">
                                                Duration: {milestone.durationInDays} days
                                                {milestone.dueAt && ` | Due: ${new Date(milestone.dueAt).toLocaleDateString()}`}
                                            </div>
                                        </div>
                                        {getMilestoneStatusBadge(milestone.status)}
                                    </CListGroupItem>
                                ))}
                            </CListGroup>
                        </CCardBody>
                    </CCard>
                )}

                {/* Milestones - Partner's Responsibilities */}
                {otherMilestones.length > 0 && (
                    <CCard className="mb-4">
                        <CCardHeader>
                            <div className="d-flex justify-content-between align-items-center">
                                <strong>
                                    <CIcon icon={cilTask} className="me-2" />
                                    Partner's Milestones (What They Will Deliver)
                                </strong>
                                <span className="text-muted">
                                    {otherMilestones.filter(m => m.status === 2 || m.status === 'Completed').length} / {otherMilestones.length} completed
                                </span>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            <CListGroup>
                                {otherMilestones.map((milestone, index) => (
                                    <CListGroupItem key={milestone.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{index + 1}. {milestone.title}</strong>
                                            <div className="small text-muted">
                                                Duration: {milestone.durationInDays} days
                                                {milestone.dueAt && ` | Due: ${new Date(milestone.dueAt).toLocaleDateString()}`}
                                            </div>
                                        </div>
                                        {getMilestoneStatusBadge(milestone.status)}
                                    </CListGroupItem>
                                ))}
                            </CListGroup>
                        </CCardBody>
                    </CCard>
                )}

                {/* Overall Progress */}
                {totalMilestones > 0 && (
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>Overall Progress</strong>
                        </CCardHeader>
                        <CCardBody>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Milestones Completed</span>
                                <span>{completedMilestones} / {totalMilestones}</span>
                            </div>
                            <CProgress value={progressPercent} color={progressPercent === 100 ? 'success' : 'primary'} />
                        </CCardBody>
                    </CCard>
                )}

                {/* Deliverables Section */}
                <CCard className="mb-4">
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <strong>
                            <CIcon icon={cilCloudUpload} className="me-2" />
                            Deliverables
                        </strong>
                        {canSubmitDeliverable && (
                            <CButton color="primary" size="sm" onClick={() => setSubmitModalVisible(true)}>
                                <CIcon icon={cilCloudUpload} className="me-1" />
                                Submit Your Deliverable
                            </CButton>
                        )}
                    </CCardHeader>
                    <CCardBody>
                        {deliverables?.bothApproved && (
                            <CAlert color="success" className="d-flex align-items-center">
                                <CIcon icon={cilCheckCircle} className="me-2" />
                                <strong>Both deliverables have been approved! You can now mark the agreement as complete.</strong>
                            </CAlert>
                        )}

                        <CRow>
                            {/* Your Deliverable */}
                            <CCol md={6}>
                                <CCard className={`h-100 ${myDeliverable ? '' : 'border-dashed'}`}>
                                    <CCardHeader className="bg-primary text-white">
                                        <strong>Your Deliverable</strong>
                                    </CCardHeader>
                                    <CCardBody>
                                        {myDeliverable ? (
                                            <div>
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>{getDeliverableStatusBadge(myDeliverable.status)}</div>
                                                    {myDeliverable.revisionCount > 0 && (
                                                        <small className="text-muted">
                                                            Revisions: {myDeliverable.revisionCount}
                                                        </small>
                                                    )}
                                                </div>
                                                {myDeliverable.milestoneTitle && (
                                                    <p><strong>Milestone:</strong> {myDeliverable.milestoneTitle}</p>
                                                )}
                                                <p><strong>Description:</strong></p>
                                                <p className="bg-body-secondary p-2 rounded">{myDeliverable.description}</p>
                                                <p>
                                                    <strong>Link:</strong>{' '}
                                                    <a href={myDeliverable.link} target="_blank" rel="noopener noreferrer">
                                                        {myDeliverable.link} <CIcon icon={cilExternalLink} size="sm" />
                                                    </a>
                                                </p>
                                                <small className="text-muted">
                                                    Submitted: {new Date(myDeliverable.submittedAt).toLocaleString()}
                                                </small>
                                                {myDeliverable.revisionReason && (
                                                    <CAlert color="warning" className="mt-3">
                                                        <CIcon icon={cilWarning} className="me-2" />
                                                        <strong>Revision Requested:</strong> {myDeliverable.revisionReason}
                                                    </CAlert>
                                                )}
                                                {(myDeliverable.status === 2 || myDeliverable.status === 'RevisionRequested') && (
                                                    <CButton
                                                        color="primary"
                                                        className="mt-3"
                                                        onClick={() => openResubmitModal(myDeliverable)}
                                                    >
                                                        <CIcon icon={cilLoop} className="me-1" />
                                                        Resubmit Deliverable
                                                    </CButton>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted py-4">
                                                <CIcon icon={cilCloudUpload} size="3xl" className="mb-3" />
                                                <p>You haven't submitted a deliverable yet.</p>
                                                {isActive && (
                                                    <CButton color="primary" onClick={() => setSubmitModalVisible(true)}>
                                                        Submit Now
                                                    </CButton>
                                                )}
                                            </div>
                                        )}
                                    </CCardBody>
                                </CCard>
                            </CCol>

                            {/* Partner's Deliverable */}
                            <CCol md={6}>
                                <CCard className="h-100">
                                    <CCardHeader>
                                        <strong>Partner's Deliverable</strong>
                                    </CCardHeader>
                                    <CCardBody>
                                        {otherDeliverable ? (
                                            <div>
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>{getDeliverableStatusBadge(otherDeliverable.status)}</div>
                                                    {otherDeliverable.revisionCount > 0 && (
                                                        <small className="text-muted">
                                                            Revisions: {otherDeliverable.revisionCount}
                                                        </small>
                                                    )}
                                                </div>
                                                <p><strong>Submitted by:</strong> {otherDeliverable.submittedByName}</p>
                                                {otherDeliverable.milestoneTitle && (
                                                    <p><strong>Milestone:</strong> {otherDeliverable.milestoneTitle}</p>
                                                )}
                                                <p><strong>Description:</strong></p>
                                                <p className="bg-body-secondary p-2 rounded">{otherDeliverable.description}</p>
                                                <p>
                                                    <strong>Link:</strong>{' '}
                                                    <a href={otherDeliverable.link} target="_blank" rel="noopener noreferrer">
                                                        {otherDeliverable.link} <CIcon icon={cilExternalLink} size="sm" />
                                                    </a>
                                                </p>
                                                <small className="text-muted">
                                                    Submitted: {new Date(otherDeliverable.submittedAt).toLocaleString()}
                                                </small>
                                                
                                                {/* Action buttons for partner's deliverable */}
                                                {otherDeliverable.canApprove && (
                                                    <div className="mt-3 d-flex gap-2">
                                                        <CButton
                                                            color="success"
                                                            onClick={() => openApproveModal(otherDeliverable.id)}
                                                        >
                                                            <CIcon icon={cilThumbUp} className="me-1" />
                                                            Approve
                                                        </CButton>
                                                        {otherDeliverable.canRequestRevision && (
                                                            <CButton
                                                                color="warning"
                                                                onClick={() => openRevisionModal(otherDeliverable.id)}
                                                            >
                                                                <CIcon icon={cilLoop} className="me-1" />
                                                                Request Revision
                                                            </CButton>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted py-4">
                                                <CIcon icon={cilClock} size="3xl" className="mb-3" />
                                                <p>Waiting for partner to submit their deliverable.</p>
                                            </div>
                                        )}
                                    </CCardBody>
                                </CCard>
                            </CCol>
                        </CRow>
                    </CCardBody>
                </CCard>

                {/* Reviews */}
                {agreement.reviews?.length > 0 && (
                    <CCard className="mb-4">
                        <CCardHeader>
                            <strong>
                                <CIcon icon={cilStar} className="me-2" />
                                Reviews
                            </strong>
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

            {/* Submit Deliverable Modal */}
            <CModal visible={submitModalVisible} onClose={() => setSubmitModalVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Submit Your Deliverable</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        {myMilestones.length > 0 && (
                            <div className="mb-3">
                                <CFormLabel>Link to Milestone</CFormLabel>
                                <CFormSelect
                                    value={submitForm.milestoneId}
                                    onChange={(e) => setSubmitForm({ ...submitForm, milestoneId: e.target.value })}
                                >
                                    <option value="">No specific milestone</option>
                                    {myMilestones.map((m) => (
                                        <option key={m.id} value={m.id}>{m.title}</option>
                                    ))}
                                </CFormSelect>
                            </div>
                        )}
                        <div className="mb-3">
                            <CFormLabel>Link to Deliverable *</CFormLabel>
                            <CFormInput
                                type="url"
                                placeholder="https://..."
                                value={submitForm.link}
                                onChange={(e) => setSubmitForm({ ...submitForm, link: e.target.value })}
                            />
                            <small className="text-muted">
                                Provide a link to your work (GitHub repo, Google Drive, Dropbox, etc.)
                            </small>
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Description *</CFormLabel>
                            <CFormTextarea
                                rows={4}
                                placeholder="Describe what you've delivered and how it meets the agreement requirements..."
                                value={submitForm.description}
                                onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                            />
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setSubmitModalVisible(false)}>
                        Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleSubmitDeliverable} disabled={submitLoading}>
                        {submitLoading ? <CSpinner size="sm" /> : 'Submit Deliverable'}
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Request Revision Modal */}
            <CModal visible={revisionModalVisible} onClose={() => setRevisionModalVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Request Revision</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CAlert color="info">
                        Please explain what needs to be changed or improved in the deliverable.
                    </CAlert>
                    <CForm>
                        <div className="mb-3">
                            <CFormLabel>Reason for Revision *</CFormLabel>
                            <CFormTextarea
                                rows={4}
                                placeholder="Explain what needs to be changed..."
                                value={revisionReason}
                                onChange={(e) => setRevisionReason(e.target.value)}
                            />
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setRevisionModalVisible(false)}>
                        Cancel
                    </CButton>
                    <CButton color="warning" onClick={handleRequestRevision} disabled={revisionLoading}>
                        {revisionLoading ? <CSpinner size="sm" /> : 'Request Revision'}
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Resubmit Deliverable Modal */}
            <CModal visible={resubmitModalVisible} onClose={() => setResubmitModalVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Resubmit Deliverable</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CAlert color="info">
                        Update your deliverable based on the feedback received.
                    </CAlert>
                    <CForm>
                        <div className="mb-3">
                            <CFormLabel>Link to Deliverable *</CFormLabel>
                            <CFormInput
                                type="url"
                                placeholder="https://..."
                                value={resubmitForm.link}
                                onChange={(e) => setResubmitForm({ ...resubmitForm, link: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Description *</CFormLabel>
                            <CFormTextarea
                                rows={4}
                                placeholder="Describe the changes you've made..."
                                value={resubmitForm.description}
                                onChange={(e) => setResubmitForm({ ...resubmitForm, description: e.target.value })}
                            />
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setResubmitModalVisible(false)}>
                        Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleResubmit} disabled={resubmitLoading}>
                        {resubmitLoading ? <CSpinner size="sm" /> : 'Resubmit'}
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Complete Agreement Confirmation Modal */}
            <ConfirmModal
                visible={completeModalVisible}
                onClose={() => setCompleteModalVisible(false)}
                onConfirm={handleComplete}
                title="Complete Agreement"
                message="Are you sure you want to mark this agreement as complete? This action cannot be undone."
                confirmText="Mark Complete"
                confirmColor="success"
                loading={completeLoading}
            />

            {/* Approve Deliverable Confirmation Modal */}
            <ConfirmModal
                visible={approveModalVisible}
                onClose={() => {
                    setApproveModalVisible(false)
                    setDeliverableToApprove(null)
                }}
                onConfirm={handleApprove}
                title="Approve Deliverable"
                message="Are you sure you want to approve this deliverable? Make sure you have reviewed it thoroughly."
                confirmText="Approve"
                confirmColor="success"
                loading={approveLoading}
            />
        </CRow>
    )
}

export default AgreementDetails

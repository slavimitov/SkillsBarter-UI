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
    cilFire,
} from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { ConfirmModal } from '../components'
import agreementService from '../services/agreementService'
import deliverableService from '../services/deliverableService'
import disputeService from '../services/disputeService'

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
    const [resubmitMilestoneId, setResubmitMilestoneId] = useState('')
    const [resubmitLoading, setResubmitLoading] = useState(false)

    const [completeModalVisible, setCompleteModalVisible] = useState(false)
    const [completeLoading, setCompleteLoading] = useState(false)
    const [approveModalVisible, setApproveModalVisible] = useState(false)
    const [approveLoading, setApproveLoading] = useState(false)
    const [deliverableToApprove, setDeliverableToApprove] = useState(null)

    const [disputeModalVisible, setDisputeModalVisible] = useState(false)
    const [disputeForm, setDisputeForm] = useState({ reason: '', description: '' })
    const [disputeLoading, setDisputeLoading] = useState(false)

    useEffect(() => {
        if (id) {
            fetchAgreement()
        }
    }, [id])

    const openSubmitModal = (milestoneId = '') => {
        setSubmitForm({ link: '', description: '', milestoneId: milestoneId || '' })
        setSubmitModalVisible(true)
    }

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
        if (!submitForm.milestoneId) {
            showWarning('Please select a milestone for this deliverable')
            return
        }

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
                milestoneId: submitForm.milestoneId,
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

    const handleCreateDispute = async () => {
        if (!disputeForm.reason) {
            showWarning('Please select a reason for the dispute')
            return
        }
        if (!disputeForm.description || disputeForm.description.length < 20) {
            showWarning('Please provide a detailed description (at least 20 characters)')
            return
        }

        try {
            setDisputeLoading(true)
            const result = await disputeService.createDispute({
                agreementId: id,
                reasonCode: disputeForm.reason,
                description: disputeForm.description,
                evidence: []
            })
            setDisputeModalVisible(false)
            setDisputeForm({ reason: '', description: '' })
            showSuccess('Dispute created successfully!')
            if (result.id) {
                navigate(`/disputes/${result.id}`)
            } else {
                navigate('/disputes')
            }
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to create dispute')
        } finally {
            setDisputeLoading(false)
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
        setResubmitMilestoneId(deliverable.milestoneId || '')
        setResubmitForm({
            link: deliverable.link || '',
            description: deliverable.description || '',
        })
        setResubmitModalVisible(true)
    }

    const handleResubmit = async () => {
        if (!resubmitMilestoneId) {
            showWarning('Missing milestone for this deliverable')
            return
        }

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
                milestoneId: resubmitMilestoneId,
                link: resubmitForm.link,
                description: resubmitForm.description,
            })
            setResubmitModalVisible(false)
            setResubmitForm({ link: '', description: '' })
            setResubmitMilestoneId('')
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
    const canComplete = (isRequester || isProvider) && isActive && deliverables?.allApproved
    const isDisputed = agreement.status === 4 || agreement.status === 'Disputed'
    const canStartDispute = (isRequester || isProvider) && isActive && !agreement.hasActiveDispute

    const completedMilestones = agreement.milestones?.filter(m => m.status === 2 || m.status === 'Completed').length || 0
    const totalMilestones = agreement.milestones?.length || 0
    const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

    const fallbackMilestones = (agreement.milestones || []).map((m) => ({
        milestoneId: m.id,
        milestoneTitle: m.title,
        milestoneStatus: m.status,
        durationInDays: m.durationInDays,
        dueAt: m.dueAt,
        responsibleUserId: m.responsibleUserId,
        responsibleUserName: m.responsibleUserName || '',
        deliverable: null,
    }))

    const deliverableMilestones =
        deliverables?.milestones && deliverables.milestones.length > 0
            ? deliverables.milestones
            : fallbackMilestones
    const getMilestoneStatusValue = (milestone) => milestone.milestoneStatus ?? milestone.status
    const myMilestones = deliverableMilestones.filter(m => m.responsibleUserId === user?.id)
    const otherMilestones = deliverableMilestones.filter(m => m.responsibleUserId !== user?.id)
    const submitReadyMilestones = myMilestones.filter(m => !m.deliverable)

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
                            {canStartDispute && (
                                <CButton color="danger" size="sm" variant="outline" onClick={() => setDisputeModalVisible(true)}>
                                    <CIcon icon={cilFire} className="me-1" />
                                    Start Dispute
                                </CButton>
                            )}
                            {isDisputed && (
                                <CButton color="warning" size="sm" onClick={() => navigate('/disputes')}>
                                    <CIcon icon={cilWarning} className="me-1" />
                                    View Disputes
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
                                    {myMilestones.filter(m => getMilestoneStatusValue(m) === 2 || getMilestoneStatusValue(m) === 'Completed').length} / {myMilestones.length} completed
                                </span>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            <CListGroup>
                                {myMilestones.map((milestone, index) => (
                                    <CListGroupItem key={milestone.milestoneId || milestone.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{index + 1}. {milestone.milestoneTitle || milestone.title}</strong>
                                            <div className="small text-muted">
                                                Duration: {milestone.durationInDays} days
                                                {milestone.dueAt && ` | Due: ${new Date(milestone.dueAt).toLocaleDateString()}`}
                                            </div>
                                        </div>
                                        {getMilestoneStatusBadge(getMilestoneStatusValue(milestone))}
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
                                    {otherMilestones.filter(m => getMilestoneStatusValue(m) === 2 || getMilestoneStatusValue(m) === 'Completed').length} / {otherMilestones.length} completed
                                </span>
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            <CListGroup>
                                {otherMilestones.map((milestone, index) => (
                                    <CListGroupItem key={milestone.milestoneId || milestone.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{index + 1}. {milestone.milestoneTitle || milestone.title}</strong>
                                            <div className="small text-muted">
                                                Duration: {milestone.durationInDays} days
                                                {milestone.dueAt && ` | Due: ${new Date(milestone.dueAt).toLocaleDateString()}`}
                                            </div>
                                        </div>
                                        {getMilestoneStatusBadge(getMilestoneStatusValue(milestone))}
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
                        {isActive && submitReadyMilestones.length > 0 && (
                            <CTooltip content="Submit a deliverable for one of your milestones">
                                <CButton
                                    color="primary"
                                    size="sm"
                                    onClick={() => openSubmitModal(submitReadyMilestones[0].milestoneId)}
                                >
                                    <CIcon icon={cilCloudUpload} className="me-1" />
                                    Submit Deliverable
                                </CButton>
                            </CTooltip>
                        )}
                    </CCardHeader>
                    <CCardBody>
                        {deliverables?.allApproved && (
                            <CAlert color="success" className="d-flex align-items-center">
                                <CIcon icon={cilCheckCircle} className="me-2" />
                                <strong>All milestone deliverables have been approved! You can now mark the agreement as complete.</strong>
                            </CAlert>
                        )}

                        {deliverableMilestones.length === 0 ? (
                            <div className="text-muted">No milestones defined for this agreement yet.</div>
                        ) : (
                            <CRow className="g-3">
                                <CCol md={6}>
                                    <h6 className="mb-3">Your deliverables</h6>
                                    {myMilestones.length === 0 ? (
                                        <div className="text-muted">You have no assigned milestones.</div>
                                    ) : (
                                        myMilestones.map((milestone, index) => (
                                            <CCard className="mb-3" key={milestone.milestoneId}>
                                                <CCardHeader className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{index + 1}. {milestone.milestoneTitle}</strong>
                                                        <div className="small text-muted">Responsible: You</div>
                                                    </div>
                                                    {getMilestoneStatusBadge(getMilestoneStatusValue(milestone))}
                                                </CCardHeader>
                                                <CCardBody>
                                                    {milestone.deliverable ? (
                                                        <div>
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <div>{getDeliverableStatusBadge(milestone.deliverable.status)}</div>
                                                                {milestone.deliverable.revisionCount > 0 && (
                                                                    <small className="text-muted">
                                                                        Revisions: {milestone.deliverable.revisionCount}
                                                                    </small>
                                                                )}
                                                            </div>
                                                            <p className="mb-1"><strong>Description:</strong></p>
                                                            <p className="bg-body-secondary p-2 rounded">{milestone.deliverable.description}</p>
                                                            <p>
                                                                <strong>Link:</strong>{' '}
                                                                <a href={milestone.deliverable.link} target="_blank" rel="noopener noreferrer">
                                                                    {milestone.deliverable.link} <CIcon icon={cilExternalLink} size="sm" />
                                                                </a>
                                                            </p>
                                                            <small className="text-muted">
                                                                Submitted: {new Date(milestone.deliverable.submittedAt).toLocaleString()}
                                                            </small>
                                                            {milestone.deliverable.revisionReason && (
                                                                <CAlert color="warning" className="mt-3">
                                                                    <CIcon icon={cilWarning} className="me-2" />
                                                                    <strong>Revision Requested:</strong> {milestone.deliverable.revisionReason}
                                                                </CAlert>
                                                            )}
                                                            {(milestone.deliverable.status === 2 || milestone.deliverable.status === 'RevisionRequested') && (
                                                                <CButton
                                                                    color="primary"
                                                                    className="mt-3"
                                                                    onClick={() => openResubmitModal(milestone.deliverable)}
                                                                >
                                                                    <CIcon icon={cilLoop} className="me-1" />
                                                                    Resubmit Deliverable
                                                                </CButton>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="text-muted">No deliverable submitted for this milestone.</span>
                                                            {isActive && (
                                                                <CButton color="primary" size="sm" onClick={() => openSubmitModal(milestone.milestoneId)}>
                                                                    Submit
                                                                </CButton>
                                                            )}
                                                        </div>
                                                    )}
                                                </CCardBody>
                                            </CCard>
                                        ))
                                    )}
                                </CCol>
                                <CCol md={6}>
                                    <h6 className="mb-3">Partner's deliverables</h6>
                                    {otherMilestones.length === 0 ? (
                                        <div className="text-muted">Your partner has no assigned milestones.</div>
                                    ) : (
                                        otherMilestones.map((milestone, index) => (
                                            <CCard className="mb-3" key={milestone.milestoneId}>
                                                <CCardHeader className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{index + 1}. {milestone.milestoneTitle}</strong>
                                                        <div className="small text-muted">Responsible: {milestone.responsibleUserName || 'Partner'}</div>
                                                    </div>
                                                    {getMilestoneStatusBadge(getMilestoneStatusValue(milestone))}
                                                </CCardHeader>
                                                <CCardBody>
                                                    {milestone.deliverable ? (
                                                        <div>
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <div>{getDeliverableStatusBadge(milestone.deliverable.status)}</div>
                                                                {milestone.deliverable.revisionCount > 0 && (
                                                                    <small className="text-muted">
                                                                        Revisions: {milestone.deliverable.revisionCount}
                                                                    </small>
                                                                )}
                                                            </div>
                                                            <p><strong>Submitted by:</strong> {milestone.deliverable.submittedByName}</p>
                                                            <p className="mb-1"><strong>Description:</strong></p>
                                                            <p className="bg-body-secondary p-2 rounded">{milestone.deliverable.description}</p>
                                                            <p>
                                                                <strong>Link:</strong>{' '}
                                                                <a href={milestone.deliverable.link} target="_blank" rel="noopener noreferrer">
                                                                    {milestone.deliverable.link} <CIcon icon={cilExternalLink} size="sm" />
                                                                </a>
                                                            </p>
                                                            <small className="text-muted">
                                                                Submitted: {new Date(milestone.deliverable.submittedAt).toLocaleString()}
                                                            </small>
                                                            
                                                            {milestone.deliverable.canApprove && (
                                                                <div className="mt-3 d-flex gap-2">
                                                                    <CButton
                                                                        color="success"
                                                                        onClick={() => openApproveModal(milestone.deliverable.id)}
                                                                    >
                                                                        <CIcon icon={cilThumbUp} className="me-1" />
                                                                        Approve
                                                                    </CButton>
                                                                    {milestone.deliverable.canRequestRevision && (
                                                                        <CButton
                                                                            color="warning"
                                                                            onClick={() => openRevisionModal(milestone.deliverable.id)}
                                                                        >
                                                                            <CIcon icon={cilLoop} className="me-1" />
                                                                            Request Revision
                                                                        </CButton>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="text-muted">Waiting for partner to submit this milestone.</span>
                                                            {!isActive && <CIcon icon={cilClock} className="text-muted" />}
                                                        </div>
                                                    )}
                                                </CCardBody>
                                            </CCard>
                                        ))
                                    )}
                                </CCol>
                            </CRow>
                        )}
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
            <CModal
                visible={submitModalVisible}
                onClose={() => {
                    setSubmitModalVisible(false)
                    setSubmitForm({ link: '', description: '', milestoneId: '' })
                }}
            >
                <CModalHeader>
                    <CModalTitle>Submit Your Deliverable</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        {submitReadyMilestones.length > 0 && (
                            <div className="mb-3">
                                <CFormLabel>Link to Milestone *</CFormLabel>
                                <CFormSelect
                                    value={submitForm.milestoneId}
                                    onChange={(e) => setSubmitForm({ ...submitForm, milestoneId: e.target.value })}
                                >
                                    <option value="">Select a milestone</option>
                                    {submitReadyMilestones.map((m) => (
                                        <option key={m.milestoneId} value={m.milestoneId}>{m.milestoneTitle}</option>
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
            <CModal
                visible={resubmitModalVisible}
                onClose={() => {
                    setResubmitModalVisible(false)
                    setResubmitForm({ link: '', description: '' })
                    setResubmitMilestoneId('')
                    setSelectedDeliverableId(null)
                }}
            >
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

            {/* Create Dispute Modal */}
            <CModal
                visible={disputeModalVisible}
                onClose={() => {
                    setDisputeModalVisible(false)
                    setDisputeForm({ reason: '', description: '' })
                }}
                size="lg"
            >
                <CModalHeader>
                    <CModalTitle>
                        <CIcon icon={cilFire} className="me-2 text-danger" />
                        Start a Dispute
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CAlert color="warning">
                        <CIcon icon={cilWarning} className="me-2" />
                        <strong>Before starting a dispute:</strong>
                        <ul className="mb-0 mt-2">
                            <li>Try to resolve the issue directly with your partner first</li>
                            <li>Make sure you have evidence to support your claim</li>
                            <li>Be honest and accurate in your description</li>
                        </ul>
                    </CAlert>
                    <CForm>
                        <div className="mb-3">
                            <CFormLabel>Reason for Dispute *</CFormLabel>
                            <CFormSelect
                                value={disputeForm.reason}
                                onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                            >
                                <option value="">Select a reason</option>
                                <option value="NonDelivery">Non-Delivery - Work was not delivered</option>
                                <option value="QualityIssue">Quality Issue - Work does not meet requirements</option>
                                <option value="Communication">Communication - Partner is unresponsive</option>
                                <option value="Deadline">Deadline - Missed agreed deadlines</option>
                                <option value="Other">Other</option>
                            </CFormSelect>
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Description *</CFormLabel>
                            <CFormTextarea
                                rows={5}
                                placeholder="Describe the issue in detail. Include specific examples, dates, and any attempts you've made to resolve this..."
                                value={disputeForm.description}
                                onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
                            />
                            <small className="text-muted">Minimum 20 characters required</small>
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDisputeModalVisible(false)}>
                        Cancel
                    </CButton>
                    <CButton color="danger" onClick={handleCreateDispute} disabled={disputeLoading}>
                        {disputeLoading ? <CSpinner size="sm" /> : 'Submit Dispute'}
                    </CButton>
                </CModalFooter>
            </CModal>
        </CRow>
    )
}

export default AgreementDetails

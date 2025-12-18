import React, { useEffect, useState } from 'react'
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
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CForm,
    CFormLabel,
    CFormTextarea,
    CFormInput,
    CNav,
    CNavItem,
    CNavLink,
    CTabContent,
    CTabPane,
    CListGroup,
    CListGroupItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext'
import proposalService from '../services/proposalService'

const Proposals = () => {
    const { user } = useAuth()

    const [sentProposals, setSentProposals] = useState([])
    const [receivedProposals, setReceivedProposals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeKey, setActiveKey] = useState(1)

    const [modalVisible, setModalVisible] = useState(false)
    const [selectedProposal, setSelectedProposal] = useState(null)
    const [counterTerms, setCounterTerms] = useState('')
    const [actionLoading, setActionLoading] = useState(false)
    
    const [acceptModalVisible, setAcceptModalVisible] = useState(false)
    const [acceptMilestones, setAcceptMilestones] = useState([{ title: '', durationInDays: 7, dueAt: '' }])

    useEffect(() => {
        if (user?.id) {
            fetchProposals()
        }
    }, [user])

    const fetchProposals = async () => {
        if (!user?.id) {
            setError('User not authenticated.')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError('')
            const myProposalsData = await proposalService.getMyProposals({ pageSize: 100 })

            const proposals = myProposalsData?.proposals || []

            const sent = proposals.filter(p => p.proposerId === user.id)

            const received = proposals.filter(p => p.offerOwnerId === user.id)

            setSentProposals(sent)
            setReceivedProposals(received)
        } catch (err) {
            console.error('Error fetching proposals:', err)
            setError(err.response?.data?.message || 'Failed to load proposals.')
        } finally {
            setLoading(false)
        }
    }

    const openAcceptModal = (proposal) => {
        setSelectedProposal(proposal)
        setAcceptMilestones([{ title: '', durationInDays: 7, dueAt: '' }])
        setAcceptModalVisible(true)
    }

    const handleAcceptMilestoneChange = (index, field, value) => {
        const newMilestones = [...acceptMilestones]
        newMilestones[index][field] = value
        setAcceptMilestones(newMilestones)
    }

    const addAcceptMilestone = () => {
        setAcceptMilestones([...acceptMilestones, { title: '', durationInDays: 7, dueAt: '' }])
    }

    const removeAcceptMilestone = (index) => {
        if (acceptMilestones.length > 1) {
            setAcceptMilestones(acceptMilestones.filter((_, i) => i !== index))
        }
    }

    const submitAccept = async () => {
        try {
            setActionLoading(true)
            
            const milestones = acceptMilestones.map(m => ({
                title: m.title,
                durationInDays: parseInt(m.durationInDays) || 7,
                dueAt: m.dueAt ? new Date(m.dueAt).toISOString() : null
            }))

            await proposalService.respondToProposal(selectedProposal.id, 0, { milestones }) // 0 = Accept
            setAcceptModalVisible(false)
            await fetchProposals()
        } catch (err) {
            alert(err.response?.data?.message || "Failed to accept proposal")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDecline = async (id) => {
        if (!window.confirm("Are you sure you want to decline this proposal?")) return

        try {
            setActionLoading(true)
            await proposalService.respondToProposal(id, 2) 
            await fetchProposals()
        } catch (err) {
            alert(err.response?.data?.message || "Failed to decline proposal")
        } finally {
            setActionLoading(false)
        }
    }

    const openCounterOffer = (proposal) => {
        setSelectedProposal(proposal)
        setCounterTerms(proposal.terms || '') 
        setModalVisible(true)
    }

    const submitCounterOffer = async () => {
        try {
            setActionLoading(true)
            const modifications = {
                terms: counterTerms
            }
            await proposalService.respondToProposal(selectedProposal.id, 1, modifications) 
            setModalVisible(false)
            await fetchProposals()
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send counter-offer")
        } finally {
            setActionLoading(false)
        }
    }

    const handleWithdraw = async (id) => {
        if (!window.confirm("Withdraw this proposal?")) return
        try {
            setActionLoading(true)
            await proposalService.withdrawProposal(id)
            await fetchProposals()
        } catch (err) {
            alert(err.response?.data?.message || "Failed to withdraw")
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) return <CSpinner />

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>My Proposals</strong>
                    </CCardHeader>
                    <CCardBody>
                        {error && <CAlert color="danger">{error}</CAlert>}

                        <CNav variant="tabs">
                            <CNavItem>
                                <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)} style={{ cursor: 'pointer' }}>
                                    Received (Action Required)
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)} style={{ cursor: 'pointer' }}>
                                    Sent (My Requests)
                                </CNavLink>
                            </CNavItem>
                        </CNav>
                        <CTabContent className="p-3 border border-top-0 rounded-bottom">
                            <CTabPane visible={activeKey === 1}>
                                <ProposalTable
                                    proposals={receivedProposals}
                                    isReceived={true}
                                    onAccept={openAcceptModal}
                                    onDecline={handleDecline}
                                    onCounter={openCounterOffer}
                                    user={user}
                                />
                            </CTabPane>
                            <CTabPane visible={activeKey === 2}>
                                <ProposalTable
                                    proposals={sentProposals}
                                    isReceived={false}
                                    onWithdraw={handleWithdraw}
                                />
                            </CTabPane>
                        </CTabContent>
                    </CCardBody>
                </CCard>
            </CCol>

            {/* Counter Offer Modal */}
            <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Send Counter-Offer</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <div className="mb-3">
                            <CFormLabel>Revised Terms</CFormLabel>
                            <CFormTextarea
                                rows={5}
                                value={counterTerms}
                                onChange={(e) => setCounterTerms(e.target.value)}
                            />
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancel</CButton>
                    <CButton color="primary" onClick={submitCounterOffer} disabled={actionLoading}>
                        {actionLoading ? <CSpinner size="sm" /> : 'Send Counter-Offer'}
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Accept Proposal Modal - Enter Your Milestones */}
            <CModal size="lg" visible={acceptModalVisible} onClose={() => setAcceptModalVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Accept Proposal - Define Your Deliverables</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CAlert color="info" className="mb-3">
                        The proposer has defined what they will deliver. Now specify what <strong>you</strong> will deliver in this exchange.
                    </CAlert>
                    <CForm>
                        <div className="mb-3">
                            <CFormLabel><strong>Your Milestones (What You Will Deliver)</strong></CFormLabel>
                            <CListGroup className="mb-3">
                                {acceptMilestones.map((milestone, index) => (
                                    <CListGroupItem key={index} className="d-flex flex-column gap-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <strong>Milestone #{index + 1}</strong>
                                            {acceptMilestones.length > 1 && (
                                                <CButton
                                                    color="danger"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeAcceptMilestone(index)}
                                                >
                                                    <CIcon icon={cilTrash} />
                                                </CButton>
                                            )}
                                        </div>
                                        <CRow className="g-3">
                                            <CCol md={6}>
                                                <CFormInput
                                                    placeholder="What will you deliver?"
                                                    value={milestone.title}
                                                    onChange={(e) => handleAcceptMilestoneChange(index, 'title', e.target.value)}
                                                    required
                                                />
                                            </CCol>
                                            <CCol md={3}>
                                                <CFormInput
                                                    type="number"
                                                    placeholder="Days"
                                                    min="1"
                                                    value={milestone.durationInDays}
                                                    onChange={(e) => handleAcceptMilestoneChange(index, 'durationInDays', e.target.value)}
                                                    title="Duration in Days"
                                                />
                                            </CCol>
                                            <CCol md={3}>
                                                <CFormInput
                                                    type="date"
                                                    value={milestone.dueAt}
                                                    onChange={(e) => handleAcceptMilestoneChange(index, 'dueAt', e.target.value)}
                                                    placeholder="Due Date"
                                                />
                                            </CCol>
                                        </CRow>
                                    </CListGroupItem>
                                ))}
                            </CListGroup>
                            <CButton color="secondary" size="sm" onClick={addAcceptMilestone}>
                                <CIcon icon={cilPlus} className="me-1" />
                                Add Milestone
                            </CButton>
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setAcceptModalVisible(false)}>Cancel</CButton>
                    <CButton 
                        color="success" 
                        onClick={submitAccept} 
                        disabled={actionLoading || !acceptMilestones.some(m => m.title.trim())}
                    >
                        {actionLoading ? <CSpinner size="sm" /> : 'Accept & Create Agreement'}
                    </CButton>
                </CModalFooter>
            </CModal>
        </CRow>
    )
}

const ProposalTable = ({ proposals, isReceived, onAccept, onDecline, onCounter, onWithdraw, user }) => {
    if (!proposals.length) return <div className="text-center p-3 text-muted">No proposals found.</div>

    return (
        <CTable hover responsive>
            <CTableHead>
                <CTableRow>
                    <CTableHeaderCell>Offer</CTableHeaderCell>
                    <CTableHeaderCell>From</CTableHeaderCell>
                    <CTableHeaderCell>Terms</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
            </CTableHead>
            <CTableBody>
                {proposals.map(p => (
                    <CTableRow key={p.id}>
                        <CTableDataCell>
                            <strong>{p.offerTitle || "Offer #" + p.offerId.substring(0, 8)}</strong>
                        </CTableDataCell>
                        <CTableDataCell>{p.proposerName}</CTableDataCell>
                        <CTableDataCell>
                            <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {p.terms}
                            </div>
                        </CTableDataCell>
                        <CTableDataCell>
                            {/* Display Status string or resolve badge */}
                            <StatusBadge status={p.status} />
                        </CTableDataCell>
                        <CTableDataCell>
                            <div className="d-flex gap-2">
                                {/* Actions for Received Proposals - show when it's my turn to respond */}
                                {isReceived && p.pendingResponseFromUserId === user?.id && (
                                    <>
                                        <CButton color="success" size="sm" variant="outline" onClick={() => onAccept(p)}>Accept</CButton>
                                        <CButton color="info" size="sm" variant="outline" onClick={() => onCounter(p)}>Counter</CButton>
                                        <CButton color="danger" size="sm" variant="outline" onClick={() => onDecline(p.id)}>Decline</CButton>
                                    </>
                                )}

                                {/* Actions for Sent Proposals - can withdraw if in pending state */}
                                {!isReceived && (p.status === 0 || p.status === 1 || 
                                    p.status === 'PendingOfferOwnerReview' || p.status === 'PendingProposerReview') && (
                                    <CButton color="secondary" size="sm" onClick={() => onWithdraw(p.id)}>Withdraw</CButton>
                                )}
                            </div>
                        </CTableDataCell>
                    </CTableRow>
                ))}
            </CTableBody>
        </CTable>
    )
}

const StatusBadge = ({ status }) => {
    if (status === 'PendingOfferOwnerReview' || status === 0) return <CBadge color="warning">Pending Review</CBadge>
    if (status === 'PendingProposerReview' || status === 1) return <CBadge color="info">Counter-Offer</CBadge>
    if (status === 'Accepted' || status === 2) return <CBadge color="success">Accepted</CBadge>
    if (status === 'Declined' || status === 3) return <CBadge color="danger">Declined</CBadge>
    if (status === 'Expired' || status === 4) return <CBadge color="secondary">Expired</CBadge>
    if (status === 'Withdrawn' || status === 5) return <CBadge color="secondary">Withdrawn</CBadge>
    return <CBadge color="light">{status}</CBadge>
}

export default Proposals

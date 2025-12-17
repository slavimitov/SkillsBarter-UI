import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CForm,
    CFormInput,
    CFormLabel,
    CFormTextarea,
    CRow,
    CSpinner,
    CAlert,
    CListGroup,
    CListGroupItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash, cilArrowLeft } from '@coreui/icons'
import httpClient from '../services/httpClient'
import proposalService from '../services/proposalService'
import { useAuth } from '../contexts/AuthContext'

const RequestOffer = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [offer, setOffer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        terms: '',
        milestones: [{ title: '', durationInDays: 1, dueAt: '' }],
    })

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                setLoading(true)
                const { data } = await httpClient.get(`/offers/${id}`)
                setOffer(data)
            } catch (err) {
                setError('Failed to load offer details.')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchOffer()
    }, [id])

    const handleMilestoneChange = (index, field, value) => {
        const newMilestones = [...formData.milestones]
        newMilestones[index][field] = value
        setFormData({ ...formData, milestones: newMilestones })
    }

    const addMilestone = () => {
        setFormData({
            ...formData,
            milestones: [...formData.milestones, { title: '', durationInDays: 1, dueAt: '' }],
        })
    }

    const removeMilestone = (index) => {
        if (formData.milestones.length > 1) {
            const newMilestones = formData.milestones.filter((_, i) => i !== index)
            setFormData({ ...formData, milestones: newMilestones })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        try {
            if (!offer) return

            const milestonesText = formData.milestones
                .map((m, i) => `Milestone ${i + 1}: ${m.title} (${m.durationInDays} days)${m.dueAt ? ' - Due: ' + m.dueAt : ''}`)
                .join('\n');

            const fullTerms = `${formData.terms}\n\nProposed Milestones:\n${milestonesText}`;

            const payload = {
                offerId: offer.id,
                terms: fullTerms,
                proposerOffer: "I will complete the work as described in the terms.", 
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }

            await proposalService.createProposal(payload)
            navigate('/proposals')
        } catch (err) {
            console.error(err)
            const msg = err.response?.data?.message
                || (err.response?.data?.errors ? Object.values(err.response.data.errors).join(', ') : null)
                || err.message
                || 'Failed to create proposal.'
            setError(msg)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <CSpinner color="primary" />
            </div>
        )
    }

    if (!offer) {
        return (
            <div className="py-4">
                <CAlert color="danger">Offer not found.</CAlert>
                <CButton color="link" onClick={() => navigate('/offers')}>Back to Offers</CButton>
            </div>
        )
    }

    return (
        <CRow>
            <CCol xs={12}>
                <div className="mb-4">
                    <CButton color="link" className="p-0 text-decoration-none" onClick={() => navigate(`/offers/${id}`)}>
                        <CIcon icon={cilArrowLeft} className="me-2" />
                        Back to Offer
                    </CButton>
                </div>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Request Agreement for: {offer.title}</strong>
                    </CCardHeader>
                    <CCardBody>
                        {error && <CAlert color="danger">{error}</CAlert>}

                        <CForm onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <CFormLabel>Proposed Terms</CFormLabel>
                                <CFormTextarea
                                    rows={4}
                                    value={formData.terms}
                                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                                    placeholder="Describe the terms of the agreement..."
                                />
                            </div>

                            <div className="mb-3">
                                <CFormLabel>Milestones</CFormLabel>
                                <CListGroup className="mb-3">
                                    {formData.milestones.map((milestone, index) => (
                                        <CListGroupItem key={index} className="d-flex flex-column gap-2">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <strong>Milestone #{index + 1}</strong>
                                                {formData.milestones.length > 1 && (
                                                    <CButton
                                                        color="danger"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeMilestone(index)}
                                                    >
                                                        <CIcon icon={cilTrash} />
                                                    </CButton>
                                                )}
                                            </div>
                                            <CRow className="g-3">
                                                <CCol md={6}>
                                                    <CFormInput
                                                        placeholder="Milestone Title"
                                                        value={milestone.title}
                                                        onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                                                        required
                                                    />
                                                </CCol>
                                                <CCol md={3}>
                                                    <CFormLabel className="visually-hidden">Duration (Days)</CFormLabel>
                                                    <CFormInput
                                                        type="number"
                                                        placeholder="Duration (Days)"
                                                        min="1"
                                                        value={milestone.durationInDays}
                                                        onChange={(e) => handleMilestoneChange(index, 'durationInDays', e.target.value)}
                                                        title="Duration in Days"
                                                    />
                                                </CCol>
                                                <CCol md={3}>
                                                    <CFormLabel className="visually-hidden">Due Date (Optional)</CFormLabel>
                                                    <CFormInput
                                                        type="date"
                                                        value={milestone.dueAt}
                                                        onChange={(e) => handleMilestoneChange(index, 'dueAt', e.target.value)}
                                                        placeholder="Due Date"
                                                    />
                                                </CCol>
                                            </CRow>
                                        </CListGroupItem>
                                    ))}
                                </CListGroup>
                                <CButton color="secondary" size="sm" onClick={addMilestone}>
                                    <CIcon icon={cilPlus} className="me-1" />
                                    Add Milestone
                                </CButton>
                            </div>

                            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                <CButton color="primary" type="submit" disabled={submitting}>
                                    {submitting ? <CSpinner size="sm" /> : 'Send Request'}
                                </CButton>
                            </div>
                        </CForm>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default RequestOffer

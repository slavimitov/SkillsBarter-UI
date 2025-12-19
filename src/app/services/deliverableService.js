import httpClient from './httpClient'

const deliverableService = {
  submit: async ({ agreementId, milestoneId, link, description }) => {
    return httpClient.post('/deliverables', { agreementId, milestoneId, link, description })
  },

  getAgreementDeliverables: async (agreementId) => {
    const { data } = await httpClient.get(`/deliverables/agreement/${agreementId}`)
    return data
  },

  approve: async (deliverableId) => {
    return httpClient.post(`/deliverables/${deliverableId}/approve`)
  },

  requestRevision: async (deliverableId, reason) => {
    return httpClient.post(`/deliverables/${deliverableId}/request-revision`, { reason })
  },

  resubmit: async (deliverableId, { agreementId, milestoneId, link, description }) => {
    return httpClient.put(`/deliverables/${deliverableId}/resubmit`, { agreementId, milestoneId, link, description })
  },
}

export default deliverableService

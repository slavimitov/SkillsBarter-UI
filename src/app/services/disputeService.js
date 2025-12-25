import httpClient from './httpClient'

const disputeService = {
    getMyDisputes: async () => {
        const { data } = await httpClient.get('/disputes/my')
        return data
    },

    getDispute: async (id) => {
        const { data } = await httpClient.get(`/disputes/${id}`)
        return data
    },

    createDispute: async (payload) => {
        const { data } = await httpClient.post('/disputes', payload)
        return data
    },

    respondToDispute: async (id, payload) => {
        const { data } = await httpClient.post(`/disputes/${id}/respond`, payload)
        return data
    },

    acceptDecision: async (id, payload) => {
        const { data } = await httpClient.post(`/disputes/${id}/accept`, payload)
        return data
    },

    escalateDispute: async (id, payload) => {
        const { data } = await httpClient.post(`/disputes/${id}/escalate`, payload)
        return data
    },

    addEvidence: async (id, payload) => {
        const { data } = await httpClient.post(`/disputes/${id}/evidence`, payload)
        return data
    },
}

export default disputeService

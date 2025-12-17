import httpClient from './httpClient'

const proposalService = {
    createProposal: async (data) => {
        return await httpClient.post('/proposals', data)
    },

    getProposal: async (id) => {
        const { data } = await httpClient.get(`/proposals/${id}`)
        return data
    },

    getMyProposals: async (params) => {
        const { data } = await httpClient.get('/proposals/my', { params })
        return data
    },

    getPendingProposals: async (page = 1, pageSize = 10) => {
        const { data } = await httpClient.get('/proposals/pending', { params: { page, pageSize } })
        return data
    },

    respondToProposal: async (id, action, modifications = null) => {
        const payload = {
            action,
            ...modifications
        }
        const { data } = await httpClient.post(`/proposals/${id}/respond`, payload)
        return data
    },

    withdrawProposal: async (id) => {
        const { data } = await httpClient.post(`/proposals/${id}/withdraw`)
        return data
    }
}

export default proposalService

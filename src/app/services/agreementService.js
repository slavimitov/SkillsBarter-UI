import httpClient from './httpClient'

const agreementService = {
    createAgreement: async (data) => {
        return await httpClient.post('/agreements', data)
    },

    getAgreement: async (id) => {
        const { data } = await httpClient.get(`/agreements/${id}`)
        return data
    },

    getMyAgreements: async ({ status, page = 1, pageSize = 10 } = {}) => {
        const params = new URLSearchParams()
        if (status !== undefined && status !== null) params.append('status', status)
        params.append('page', page)
        params.append('pageSize', pageSize)
        const { data } = await httpClient.get(`/agreements/my?${params.toString()}`)
        return data
    },

    completeAgreement: async (id) => {
        return await httpClient.put(`/agreements/${id}/complete`)
    }
}

export default agreementService

import httpClient from './httpClient'

const agreementService = {
    createAgreement: async (data) => {
        return await httpClient.post('/agreements', data)
    },

    getAgreement: async (id) => {
        const { data } = await httpClient.get(`/agreements/${id}`)
        return data
    },

    completeAgreement: async (id) => {
        return await httpClient.put(`/agreements/${id}/complete`)
    }
}

export default agreementService

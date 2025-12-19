import httpClient from './httpClient'

const userService = {
    getPublicProfile: async (userId) => {
        const response = await httpClient.get(`/users/${userId}`)
        return response.data
    },

    getDetailedProfile: async (userId) => {
        const response = await httpClient.get(`/users/${userId}/details`)
        return response.data
    },

    getMyProfile: async () => {
        const response = await httpClient.get('/users/profile')
        return response.data
    },

    updateMyProfile: async (data) => {
        const response = await httpClient.put('/users/profile', data)
        return response.data
    },

    getMyOffers: async (params = {}) => {
        const response = await httpClient.get('/offers/mine', { params })
        return response.data
    },

    checkCanReview: async (userId) => {
        try {
            const response = await httpClient.get('/agreements/my', {
                params: { status: 2, pageSize: 100 } // status 2 = Completed
            })
            const agreements = response.data?.agreements || []
            
            const canReview = agreements.some(agreement => 
                agreement.providerId === userId || agreement.requesterId === userId
            )
            
            const relevantAgreements = agreements.filter(agreement =>
                agreement.providerId === userId || agreement.requesterId === userId
            )
            
            return { canReview, agreements: relevantAgreements }
        } catch (error) {
            return { canReview: false, agreements: [] }
        }
    }
}

export default userService

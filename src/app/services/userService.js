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
                params: { status: 2, pageSize: 100 } 
            })
            const agreements = response.data?.agreements || []

            const relevantAgreements = agreements.filter(agreement =>
                (agreement.providerId === userId || agreement.requesterId === userId) && !agreement.hasReviewFromMe
            )

            const canReview = relevantAgreements.length > 0
            
            return { canReview, agreements: relevantAgreements }
        } catch (error) {
            return { canReview: false, agreements: [] }
        }
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await httpClient.post('/users/change-password', {
            currentPassword,
            newPassword
        })
        return response.data
    },

    changeEmail: async (newEmail) => {
        const response = await httpClient.post('/users/change-email', {
            newEmail
        })
        return response.data
    },

    deleteAccount: async () => {
        const response = await httpClient.delete('/users/account')
        return response.data
    },

    getPreferences: async () => {
        const response = await httpClient.get('/users/preferences')
        return response.data
    },

    updatePreferences: async (preferences) => {
        const response = await httpClient.put('/users/preferences', preferences)
        return response.data
    }
}

export default userService

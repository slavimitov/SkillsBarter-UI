import httpClient from './httpClient'

const reviewService = {

    createReview: async (data) => {
        const response = await httpClient.post('/reviews', data)
        return response.data
    },
 
     
    getReviewsForUser: async (userId, page = 1, pageSize = 10) => {
        const response = await httpClient.get(`/reviews/user/${userId}`, {
            params: { page, pageSize }
        })
        return response.data
    },

    getUserReviewsWithSummary: async (userId, page, pageSize) => {
        const response = await httpClient.get(`/users/${userId}/reviews`, {
            params: { page, pageSize }
        })
        return response.data
    }
}

export default reviewService

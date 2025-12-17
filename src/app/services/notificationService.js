import httpClient from './httpClient'

const notificationService = {
    getNotifications: async (page = 1, pageSize = 20, unreadOnly = false) => {

        const skip = (page - 1) * pageSize
        const { data } = await httpClient.get('/notifications', {
            params: { skip, take: pageSize, unreadOnly }
        })
        return data
    },

    markAsRead: async (notificationIds) => {
        const { data } = await httpClient.post('/notifications/mark-read', {
            ids: notificationIds,
            markAll: false
        })
        return data
    },

    markAllAsRead: async () => {
        const { data } = await httpClient.post('/notifications/mark-read', {
            ids: [],
            markAll: true
        })
        return data
    },
}

export default notificationService

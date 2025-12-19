import httpClient from './httpClient'

const adminService = {
  getUsers: async (page = 1, pageSize = 20) => {
    const { data } = await httpClient.get('/admin/users', { params: { page, pageSize } })
    return data
  },

  updateUserBan: async (userId, isBanned) => {
    const { data } = await httpClient.put(`/admin/users/${userId}/ban`, { isBanned })
    return data
  },

  updateUserRole: async (userId, role) => {
    const { data } = await httpClient.put(`/admin/users/${userId}/role`, { role })
    return data
  },

  getDisputes: async () => {
    const { data } = await httpClient.get('/admin/disputes')
    return data
  },

  getDispute: async (id) => {
    const { data } = await httpClient.get(`/admin/disputes/${id}`)
    return data
  },

  resolveDispute: async (id, resolution) => {
    const { data } = await httpClient.put(`/admin/disputes/${id}/resolve`, resolution)
    return data
  },

  getAgreements: async ({ status, page = 1, pageSize = 20 } = {}) => {
    const params = new URLSearchParams()
    if (status !== undefined && status !== null) params.append('status', status)
    params.append('page', page)
    params.append('pageSize', pageSize)
    const { data } = await httpClient.get(`/admin/agreements?${params.toString()}`)
    return data
  },
}

export default adminService

import axios from 'axios'

const DEFAULT_API_ROOT = 'https://localhost:7155'

const resolveEnvBaseUrl = () => {
  const processBaseUrl =
    typeof process !== 'undefined' ? process.env?.REACT_APP_API_BASE_URL : undefined
  const viteBaseUrl =
    typeof import.meta !== 'undefined' ? import.meta?.env?.REACT_APP_API_BASE_URL : undefined
  return processBaseUrl || viteBaseUrl || DEFAULT_API_ROOT
}

const resolveApiBaseUrl = () => {
  const root = resolveEnvBaseUrl()
  const trimmedRoot = root.replace(/\/+$/, '')
  return `${trimmedRoot}/api`
}

const httpClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

httpClient.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : undefined
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // TODO: update token retrieval if auth storage changes
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // TODO: handle unauthorized responses globally
    }
    return Promise.reject(error)
  },
)

export default httpClient


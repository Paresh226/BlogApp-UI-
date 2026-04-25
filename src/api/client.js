import axios from 'axios'
import { storage } from '../lib/storage.js'

const SESSION_KEY = 'blogapp.admin.session.v2'
const API_BASE = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/+$/g, '')

export const resolveApiUrl = (path) => {
  const clean = String(path || '')

  if (!clean) return API_BASE
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean
  if (!API_BASE) return clean
  if (clean.startsWith('/')) return `${API_BASE}${clean}`
  return `${API_BASE}/${clean}`
}

export const apiClient = axios.create({
  baseURL: API_BASE || undefined,
})

apiClient.interceptors.request.use((config) => {
  const session = storage.read(SESSION_KEY, null)

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }

  return config
})

export const getApiErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.response?.data?.title ||
  error?.message ||
  fallbackMessage

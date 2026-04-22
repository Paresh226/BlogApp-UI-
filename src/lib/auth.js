import { apiFetch } from './api.js'
import { storage } from './storage.js'

const SESSION_KEY = 'blogapp.admin.session.v2'

export const getSession = () => storage.read(SESSION_KEY, null)

export const isAuthenticated = () => {
  const session = getSession()
  if (!session?.token) return false
  if (!session?.expiresAtUtc) return true
  const expiresAt = Date.parse(session.expiresAtUtc)
  if (!Number.isFinite(expiresAt)) return true
  return Date.now() < expiresAt
}

export const login = async ({ username, password }) => {
  const data = await apiFetch('/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const session = {
    token: data.token,
    username: data.username,
    expiresAtUtc: data.expiresAtUtc,
    createdAt: new Date().toISOString(),
  }

  storage.write(SESSION_KEY, session)
  return session
}

export const logout = () => storage.remove(SESSION_KEY)

export const withAuth = (headers = {}) => {
  const session = getSession()
  if (!session?.token) return headers
  return { ...headers, Authorization: `Bearer ${session.token}` }
}

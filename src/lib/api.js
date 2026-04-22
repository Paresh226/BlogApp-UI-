const API_BASE = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/+$/g, '')

export const resolveApiUrl = (path) => {
  const clean = String(path || '')
  if (!clean) return API_BASE
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean
  if (!API_BASE) return clean
  if (clean.startsWith('/')) return `${API_BASE}${clean}`
  return `${API_BASE}/${clean}`
}

export const apiFetch = async (path, options = {}) => {
  const res = await fetch(resolveApiUrl(path), options)
  const contentType = res.headers.get('content-type') || ''

  let data = null
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null)
  } else {
    data = await res.text().catch(() => '')
  }

  if (!res.ok) {
    const message =
      data?.message ||
      data?.title ||
      (typeof data === 'string' ? data : '') ||
      `Request failed (${res.status})`
    const error = new Error(message)
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}


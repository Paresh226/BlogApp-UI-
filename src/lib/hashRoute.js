import { useEffect, useMemo, useState } from 'react'

const normalizePath = (path) => {
  const trimmed = (path || '').trim()
  if (!trimmed) return '/'
  if (trimmed.startsWith('/')) return trimmed
  return `/${trimmed}`
}

export const getHashPath = () => {
  const raw = window.location.hash || '#/'
  const withoutHash = raw.startsWith('#') ? raw.slice(1) : raw
  return normalizePath(withoutHash)
}

export const navigate = (path) => {
  const normalized = normalizePath(path)
  window.location.hash = `#${normalized}`
}

export const useHashPath = () => {
  const [path, setPath] = useState(() => getHashPath())

  useEffect(() => {
    const onChange = () => setPath(getHashPath())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}

export const matchRoute = (path) => {
  const clean = normalizePath(path).replace(/^\/+|\/+$/g, '')
  const parts = clean ? clean.split('/') : []

  if (parts.length === 0) return { name: 'home' }

  if (parts[0] === 'post' && parts[1]) return { name: 'post', slug: parts[1] }

  if (parts[0] === 'admin') {
    if (parts[1] === 'login') return { name: 'adminLogin' }
    if (parts[1] === 'posts' && !parts[2]) return { name: 'adminPosts' }
    if (parts[1] === 'posts' && parts[2] === 'new')
      return { name: 'adminPostNew' }
    if (parts[1] === 'posts' && parts[2])
      return { name: 'adminPostEdit', id: parts[2] }
    return { name: 'adminPosts' }
  }

  return { name: 'notFound' }
}

export const useRoute = () => {
  const path = useHashPath()
  return useMemo(() => matchRoute(path), [path])
}


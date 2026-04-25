export const formatDate = (value) => {
  if (!value) {
    return ''
  }

  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export const formatShortDate = (value) => {
  if (!value) {
    return ''
  }

  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

export const countWords = (value) => {
  return String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

export const getReadingTimeLabel = (value) => {
  const words = countWords(value)
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

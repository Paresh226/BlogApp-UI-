const safeJsonParse = (value, fallback) => {
  if (value == null) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export const storage = {
  read(key, fallback) {
    return safeJsonParse(localStorage.getItem(key), fallback)
  },
  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove(key) {
    localStorage.removeItem(key)
  },
}


import { storage } from './storage.js'

const THEME_KEY = 'blogapp.theme'

export const THEME_OPTIONS = ['system', 'light', 'dark']

export const getStoredThemePreference = () => {
  const storedTheme = storage.read(THEME_KEY, 'system')
  return THEME_OPTIONS.includes(storedTheme) ? storedTheme : 'system'
}

export const saveThemePreference = (theme) => {
  storage.write(THEME_KEY, theme)
}

export const getSystemTheme = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const resolveTheme = (themePreference) => {
  return themePreference === 'system' ? getSystemTheme() : themePreference
}

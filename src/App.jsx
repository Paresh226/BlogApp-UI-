import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import './App.css'
import Footer from './components/layout/Footer.jsx'
import Header from './components/layout/Header.jsx'
import { navigate, useRoute } from './lib/hashRoute.js'
import {
  getStoredThemePreference,
  getSystemTheme,
  resolveTheme,
  saveThemePreference,
} from './lib/theme.js'
import AdminPostEditorPage from './pages/AdminPostEditorPage.jsx'
import AdminPostsPage from './pages/AdminPostsPage.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import PostDetailsPage from './pages/PostDetailsPage.jsx'
import {
  logoutAdmin,
  selectIsAuthenticated,
  selectSession,
  syncSessionFromStorage,
} from './store/authSlice.js'

function App() {
  const dispatch = useDispatch()
  const route = useRoute()
  const session = useSelector(selectSession)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [themePreference, setThemePreference] = useState(() => getStoredThemePreference())
  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme())

  useEffect(() => {
    dispatch(syncSessionFromStorage())
  }, [dispatch])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (event) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    const activeTheme = themePreference === 'system' ? systemTheme : resolveTheme(themePreference)

    document.documentElement.dataset.theme = activeTheme
    document.documentElement.style.colorScheme = activeTheme
  }, [systemTheme, themePreference])

  useEffect(() => {
    const isAdminRoute = String(route.name).startsWith('admin')

    if (isAdminRoute && route.name !== 'adminLogin' && !isAuthenticated) {
      navigate('/admin/login')
      return
    }

    if (route.name === 'adminLogin' && isAuthenticated) {
      navigate('/admin/posts')
    }
  }, [isAuthenticated, route])

  const handleLogout = () => {
    dispatch(logoutAdmin())
    navigate('/')
  }

  const handleThemeChange = (nextTheme) => {
    setThemePreference(nextTheme)
    saveThemePreference(nextTheme)
  }

  let page = <NotFoundPage />

  if (route.name === 'home') {
    page = <HomePage />
  } else if (route.name === 'post') {
    page = <PostDetailsPage slug={route.slug} />
  } else if (route.name === 'adminLogin') {
    page = <AdminLoginPage />
  } else if (route.name === 'adminPosts' && isAuthenticated) {
    page = <AdminPostsPage />
  } else if (route.name === 'adminPostNew' && isAuthenticated) {
    page = <AdminPostEditorPage key="admin-post-new" mode="create" />
  } else if (route.name === 'adminPostEdit' && isAuthenticated) {
    page = <AdminPostEditorPage key={`admin-post-${route.id}`} mode="edit" postId={route.id} />
  }

  return (
    <div className="app">
      <Header
        session={session}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        themePreference={themePreference}
        onThemeChange={handleThemeChange}
      />
      <main className="container">{page}</main>
      <Footer />
    </div>
  )
}

export default App

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiClient, getApiErrorMessage } from '../api/client.js'
import { storage } from '../lib/storage.js'

const SESSION_KEY = 'blogapp.admin.session.v2'

const getStoredSession = () => storage.read(SESSION_KEY, null)

const hasValidSession = (session) => {
  if (!session?.token) return false
  if (!session?.expiresAtUtc) return true

  const expiresAt = Date.parse(session.expiresAtUtc)
  if (!Number.isFinite(expiresAt)) return true

  return Date.now() < expiresAt
}

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/admin/login', credentials)

      const session = {
        token: response.data.token,
        username: response.data.username,
        expiresAtUtc: response.data.expiresAtUtc,
        createdAt: new Date().toISOString(),
      }

      storage.write(SESSION_KEY, session)
      return session
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Login failed.'))
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    session: getStoredSession(),
    loading: false,
    error: '',
  },
  reducers: {
    logoutAdmin(state) {
      state.session = null
      state.error = ''
      storage.remove(SESSION_KEY)
    },
    syncSessionFromStorage(state) {
      state.session = getStoredSession()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.session = action.payload
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Login failed.'
      })
  },
})

export const { logoutAdmin, syncSessionFromStorage } = authSlice.actions

export const selectSession = (state) => state.auth.session
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error
export const selectIsAuthenticated = (state) => hasValidSession(state.auth.session)

export default authSlice.reducer

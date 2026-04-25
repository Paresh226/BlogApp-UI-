import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiClient, getApiErrorMessage } from '../api/client.js'
import { toUpsertFormData } from '../utils/postForm.js'

export const fetchAdminPosts = createAsyncThunk(
  'adminPosts/fetchAdminPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/admin/posts')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load admin posts.'))
    }
  },
)

export const fetchAdminPostById = createAsyncThunk(
  'adminPosts/fetchAdminPostById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/admin/posts/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load post.'))
    }
  },
)

export const createAdminPost = createAsyncThunk(
  'adminPosts/createAdminPost',
  async (draft, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/admin/posts', toUpsertFormData(draft))
      return response.data
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create post.'))
    }
  },
)

export const updateAdminPost = createAsyncThunk(
  'adminPosts/updateAdminPost',
  async ({ id, draft }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/api/admin/posts/${id}`, toUpsertFormData(draft))
      return response.data
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update post.'))
    }
  },
)

export const deleteAdminPost = createAsyncThunk(
  'adminPosts/deleteAdminPost',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/admin/posts/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete post.'))
    }
  },
)

const adminPostsSlice = createSlice({
  name: 'adminPosts',
  initialState: {
    items: [],
    currentPost: null,
    listLoading: false,
    postLoading: false,
    saveLoading: false,
    deleteLoading: false,
    listError: '',
    postError: '',
    saveError: '',
    deleteError: '',
  },
  reducers: {
    clearCurrentAdminPost(state) {
      state.currentPost = null
      state.postError = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminPosts.pending, (state) => {
        state.listLoading = true
        state.listError = ''
      })
      .addCase(fetchAdminPosts.fulfilled, (state, action) => {
        state.listLoading = false
        state.items = action.payload
      })
      .addCase(fetchAdminPosts.rejected, (state, action) => {
        state.listLoading = false
        state.listError = action.payload || 'Failed to load admin posts.'
      })
      .addCase(fetchAdminPostById.pending, (state) => {
        state.postLoading = true
        state.postError = ''
        state.currentPost = null
      })
      .addCase(fetchAdminPostById.fulfilled, (state, action) => {
        state.postLoading = false
        state.currentPost = action.payload
      })
      .addCase(fetchAdminPostById.rejected, (state, action) => {
        state.postLoading = false
        state.postError = action.payload || 'Failed to load post.'
      })
      .addCase(createAdminPost.pending, (state) => {
        state.saveLoading = true
        state.saveError = ''
      })
      .addCase(createAdminPost.fulfilled, (state) => {
        state.saveLoading = false
      })
      .addCase(createAdminPost.rejected, (state, action) => {
        state.saveLoading = false
        state.saveError = action.payload || 'Failed to create post.'
      })
      .addCase(updateAdminPost.pending, (state) => {
        state.saveLoading = true
        state.saveError = ''
      })
      .addCase(updateAdminPost.fulfilled, (state, action) => {
        state.saveLoading = false
        state.currentPost = action.payload
      })
      .addCase(updateAdminPost.rejected, (state, action) => {
        state.saveLoading = false
        state.saveError = action.payload || 'Failed to update post.'
      })
      .addCase(deleteAdminPost.pending, (state) => {
        state.deleteLoading = true
        state.deleteError = ''
      })
      .addCase(deleteAdminPost.fulfilled, (state, action) => {
        state.deleteLoading = false
        state.items = state.items.filter((post) => post.id !== action.payload)
      })
      .addCase(deleteAdminPost.rejected, (state, action) => {
        state.deleteLoading = false
        state.deleteError = action.payload || 'Failed to delete post.'
      })
  },
})

export const { clearCurrentAdminPost } = adminPostsSlice.actions

export const selectAdminPosts = (state) => state.adminPosts.items
export const selectAdminPostsLoading = (state) => state.adminPosts.listLoading
export const selectAdminPostsError = (state) => state.adminPosts.listError
export const selectEditingPost = (state) => state.adminPosts.currentPost
export const selectEditingPostLoading = (state) => state.adminPosts.postLoading
export const selectEditingPostError = (state) => state.adminPosts.postError
export const selectSaveLoading = (state) => state.adminPosts.saveLoading
export const selectSaveError = (state) => state.adminPosts.saveError
export const selectDeleteLoading = (state) => state.adminPosts.deleteLoading
export const selectDeleteError = (state) => state.adminPosts.deleteError

export default adminPostsSlice.reducer

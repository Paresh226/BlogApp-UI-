import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiClient, getApiErrorMessage } from '../api/client.js'

export const fetchPublishedPosts = createAsyncThunk(
  'posts/fetchPublishedPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/posts')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load posts.'))
    }
  },
)

export const fetchPostBySlug = createAsyncThunk(
  'posts/fetchPostBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/api/posts/${encodeURIComponent(slug)}`)
      return response.data
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load post.'))
    }
  },
)

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    currentPost: null,
    listLoading: false,
    postLoading: false,
    listError: '',
    postError: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublishedPosts.pending, (state) => {
        state.listLoading = true
        state.listError = ''
      })
      .addCase(fetchPublishedPosts.fulfilled, (state, action) => {
        state.listLoading = false
        state.items = action.payload
      })
      .addCase(fetchPublishedPosts.rejected, (state, action) => {
        state.listLoading = false
        state.listError = action.payload || 'Failed to load posts.'
      })
      .addCase(fetchPostBySlug.pending, (state) => {
        state.postLoading = true
        state.postError = ''
        state.currentPost = null
      })
      .addCase(fetchPostBySlug.fulfilled, (state, action) => {
        state.postLoading = false
        state.currentPost = action.payload
      })
      .addCase(fetchPostBySlug.rejected, (state, action) => {
        state.postLoading = false
        state.postError = action.payload || 'Failed to load post.'
      })
  },
})

export const selectPublishedPosts = (state) => state.posts.items
export const selectPostListLoading = (state) => state.posts.listLoading
export const selectPostListError = (state) => state.posts.listError
export const selectCurrentPost = (state) => state.posts.currentPost
export const selectCurrentPostLoading = (state) => state.posts.postLoading
export const selectCurrentPostError = (state) => state.posts.postError

export default postsSlice.reducer

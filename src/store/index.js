import { configureStore } from '@reduxjs/toolkit'
import adminPostsReducer from './adminPostsSlice.js'
import authReducer from './authSlice.js'
import postsReducer from './postsSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    adminPosts: adminPostsReducer,
  },
})

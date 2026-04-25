import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PostEditorForm from '../components/admin/PostEditorForm.jsx'
import { navigate } from '../lib/hashRoute.js'
import {
  clearCurrentAdminPost,
  createAdminPost,
  deleteAdminPost,
  fetchAdminPostById,
  selectDeleteLoading,
  selectEditingPost,
  selectEditingPostError,
  selectEditingPostLoading,
  selectSaveError,
  selectSaveLoading,
  updateAdminPost,
} from '../store/adminPostsSlice.js'
import { createDraftPost } from '../utils/postForm.js'

function mapPostToDraft(post) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    imageUrl: post.imageUrl,
    published: Boolean(post.publishedAt),
    removeImage: false,
    imageFile: null,
  }
}

function AdminPostEditorPage({ mode, postId }) {
  const dispatch = useDispatch()
  const editingPost = useSelector(selectEditingPost)
  const loading = useSelector(selectEditingPostLoading)
  const loadError = useSelector(selectEditingPostError)
  const saveLoading = useSelector(selectSaveLoading)
  const saveError = useSelector(selectSaveError)
  const deleteLoading = useSelector(selectDeleteLoading)

  useEffect(() => {
    if (mode === 'edit' && postId) {
      dispatch(fetchAdminPostById(postId))
    }

    return () => {
      dispatch(clearCurrentAdminPost())
    }
  }, [dispatch, mode, postId])

  const initial = mode === 'create' ? createDraftPost() : editingPost ? mapPostToDraft(editingPost) : null

  const handleSave = async (draft) => {
    let result

    if (mode === 'create') {
      result = await dispatch(createAdminPost(draft))
    } else {
      result = await dispatch(updateAdminPost({ id: postId, draft }))
    }

    if (createAdminPost.fulfilled.match(result) || updateAdminPost.fulfilled.match(result)) {
      navigate('/admin/posts')
    }
  }

  const handleDelete = async () => {
    if (!postId) {
      return
    }

    const ok = window.confirm('Delete this post? This cannot be undone.')
    if (!ok) {
      return
    }

    const result = await dispatch(deleteAdminPost(postId))

    if (deleteAdminPost.fulfilled.match(result)) {
      navigate('/admin/posts')
    }
  }

  if (loading) {
    return <div className="muted">Loading...</div>
  }

  if (loadError && !initial) {
    return <div className="error">{loadError}</div>
  }

  if (!initial) {
    return null
  }

  return (
    <>
      {loadError ? <div className="error">{loadError}</div> : null}
      {saveError ? <div className="error">{saveError}</div> : null}
      <PostEditorForm
        key={mode === 'create' ? 'new-post' : `edit-${postId}`}
        mode={mode}
        initial={initial}
        busy={saveLoading || deleteLoading}
        onCancel={() => navigate('/admin/posts')}
        onDelete={mode === 'edit' ? handleDelete : undefined}
        onSave={handleSave}
      />
    </>
  )
}

export default AdminPostEditorPage

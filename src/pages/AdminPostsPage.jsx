import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EmptyState from '../components/shared/EmptyState.jsx'
import { navigate } from '../lib/hashRoute.js'
import {
  deleteAdminPost,
  fetchAdminPosts,
  selectAdminPosts,
  selectAdminPostsError,
  selectAdminPostsLoading,
  selectDeleteError,
} from '../store/adminPostsSlice.js'
import { formatDate } from '../utils/format.js'

function AdminPostsPage() {
  const dispatch = useDispatch()
  const posts = useSelector(selectAdminPosts)
  const loading = useSelector(selectAdminPostsLoading)
  const listError = useSelector(selectAdminPostsError)
  const deleteError = useSelector(selectDeleteError)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    dispatch(fetchAdminPosts())
  }, [dispatch])

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return posts.filter((post) => {
      const title = (post.title || '').toLowerCase()
      const excerpt = (post.excerpt || '').toLowerCase()
      const slug = (post.slug || '').toLowerCase()
      const matchesQuery =
        !normalizedQuery ||
        title.includes(normalizedQuery) ||
        excerpt.includes(normalizedQuery) ||
        slug.includes(normalizedQuery)

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && Boolean(post.publishedAt)) ||
        (statusFilter === 'draft' && !post.publishedAt)

      return matchesQuery && matchesStatus
    })
  }, [posts, query, statusFilter])

  const publishedCount = posts.filter((post) => Boolean(post.publishedAt)).length
  const draftCount = posts.length - publishedCount
  const error = deleteError || listError

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this post? This cannot be undone.')
    if (!ok) {
      return
    }

    const result = await dispatch(deleteAdminPost(id))

    if (deleteAdminPost.fulfilled.match(result)) {
      dispatch(fetchAdminPosts())
      navigate('/admin/posts')
    }
  }

  return (
    <section className="stack">
      <div className="sectionHeader">
        <h1 className="sectionTitle">Posts</h1>

        <div className="row">
          <button className="btn primary" type="button" onClick={() => navigate('/admin/posts/new')}>
            New post
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => dispatch(fetchAdminPosts())}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="statsGrid">
        <button className={`statCard statButton ${statusFilter === 'all' ? 'active' : ''}`} type="button" onClick={() => setStatusFilter('all')}>
          <span className="statLabel">All posts</span>
          <strong>{posts.length}</strong>
        </button>
        <button className={`statCard statButton ${statusFilter === 'published' ? 'active' : ''}`} type="button" onClick={() => setStatusFilter('published')}>
          <span className="statLabel">Published</span>
          <strong>{publishedCount}</strong>
        </button>
        <button className={`statCard statButton ${statusFilter === 'draft' ? 'active' : ''}`} type="button" onClick={() => setStatusFilter('draft')}>
          <span className="statLabel">Drafts</span>
          <strong>{draftCount}</strong>
        </button>
      </div>

      <div className="toolbar">
        <input
          className="input search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search posts..."
          aria-label="Search posts"
        />

        <button
          className="btn"
          type="button"
          onClick={() => {
            setQuery('')
            setStatusFilter('all')
          }}
        >
          Clear filters
        </button>
      </div>

      {error ? <div className="error">{error}</div> : null}

      {loading ? (
        <div className="muted">Loading...</div>
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          title="No posts found"
          description="Create a new post or clear the filters."
          action={
            <button className="btn primary" type="button" onClick={() => navigate('/admin/posts/new')}>
              New post
            </button>
          }
        />
      ) : (
        <div className="table">
          <div className="thead">
            <div>Title</div>
            <div>Status</div>
            <div>Updated</div>
            <div className="right">Actions</div>
          </div>

          {filteredPosts.map((post) => (
            <div key={post.id} className="trow interactiveRow">
              <div className="titleCell">
                <div className="titleLine">{post.title || 'Untitled'}</div>
                <div className="muted small">/{post.slug}</div>
              </div>

              <div>
                {post.publishedAt ? (
                  <span className="pill">Published</span>
                ) : (
                  <span className="pill draft">Draft</span>
                )}
              </div>

              <div className="muted">{formatDate(post.updatedAt)}</div>

              <div className="right actions">
                <button className="btn" type="button" onClick={() => navigate(`/admin/posts/${post.id}`)}>
                  Edit
                </button>

                <button className="btn danger" type="button" onClick={() => handleDelete(post.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default AdminPostsPage

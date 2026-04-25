import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PostCard from '../components/blog/PostCard.jsx'
import EmptyState from '../components/shared/EmptyState.jsx'
import { navigate } from '../lib/hashRoute.js'
import {
  fetchPublishedPosts,
  selectPostListError,
  selectPostListLoading,
  selectPublishedPosts,
} from '../store/postsSlice.js'
import { formatShortDate } from '../utils/format.js'

function HomePage() {
  const dispatch = useDispatch()
  const posts = useSelector(selectPublishedPosts)
  const loading = useSelector(selectPostListLoading)
  const error = useSelector(selectPostListError)
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    dispatch(fetchPublishedPosts())
  }, [dispatch])

  const visiblePosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const filteredPosts = posts.filter((post) => {
      if (!normalizedQuery) {
        return true
      }

      const title = (post.title || '').toLowerCase()
      const excerpt = (post.excerpt || '').toLowerCase()
      const slug = (post.slug || '').toLowerCase()

      return (
        title.includes(normalizedQuery) ||
        excerpt.includes(normalizedQuery) ||
        slug.includes(normalizedQuery)
      )
    })

    const sortedPosts = [...filteredPosts]

    if (sortBy === 'title') {
      sortedPosts.sort((left, right) => (left.title || '').localeCompare(right.title || ''))
      return sortedPosts
    }

    sortedPosts.sort((left, right) => {
      const leftDate = Date.parse(left.publishedAt || left.updatedAt || 0)
      const rightDate = Date.parse(right.publishedAt || right.updatedAt || 0)
      return sortBy === 'oldest' ? leftDate - rightDate : rightDate - leftDate
    })

    return sortedPosts
  }, [posts, query, sortBy])

  const featuredPost = visiblePosts[0]
  const latestDate = featuredPost?.publishedAt || featuredPost?.updatedAt

  return (
    <div className="stack">
      <section className="heroCard heroGrid">
        <div>
          <h1 className="heroTitle">Your Blog</h1>
          <p className="heroSubtitle">
            Search posts, sort them instantly, and jump straight into the admin panel.
          </p>
          <div className="heroActions">
            <a className="btn primary" href="#/admin/posts">
              Go to Admin
            </a>
            <a className="btn" href="#/admin/login">
              Admin Login
            </a>
          </div>
        </div>

        <div className="statsGrid">
          <div className="statCard">
            <span className="statLabel">Published posts</span>
            <strong>{posts.length}</strong>
          </div>
          <div className="statCard">
            <span className="statLabel">Showing now</span>
            <strong>{visiblePosts.length}</strong>
          </div>
          <div className="statCard">
            <span className="statLabel">Latest update</span>
            <strong>{latestDate ? formatShortDate(latestDate) : 'No posts yet'}</strong>
          </div>
        </div>
      </section>

      <section className="stack">
        <div className="sectionHeader">
          <h2 className="sectionTitle">Latest posts</h2>
          <span className="muted">{visiblePosts.length} visible</span>
        </div>

        <div className="toolbar">
          <input
            className="input search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, excerpt, or slug..."
          />

          <select className="input selectInput" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A-Z</option>
          </select>

          <button className="btn" type="button" onClick={() => {
            setQuery('')
            setSortBy('newest')
          }}>
            Clear
          </button>
        </div>

        {featuredPost ? (
          <button
            className="featuredPost"
            type="button"
            onClick={() => navigate(`/post/${featuredPost.slug}`)}
          >
            <span className="pill">Featured</span>
            <strong>{featuredPost.title || 'Untitled'}</strong>
            <span className="muted">{featuredPost.excerpt || 'Open the latest story.'}</span>
          </button>
        ) : null}

        {error ? <div className="error">{error}</div> : null}

        {loading ? (
          <div className="muted">Loading...</div>
        ) : visiblePosts.length === 0 ? (
          <EmptyState
            title="No published posts yet"
            description="Log in as admin and publish your first post."
            action={
              <a className="btn primary" href="#/admin/login">
                Admin Login
              </a>
            }
          />
        ) : (
          <div className="grid">
            {visiblePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage

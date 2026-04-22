/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { apiFetch, resolveApiUrl } from './lib/api.js'
import { getSession, isAuthenticated, login, logout, withAuth } from './lib/auth.js'
import { navigate, useRoute } from './lib/hashRoute.js'
import { createDraftPost, slugify, toUpsertFormData } from './lib/posts.js'

const formatDate = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

const resolveImageSrc = (imageUrl) => {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))
    return imageUrl
  return resolveApiUrl(imageUrl)
}

function App() {
  const route = useRoute()
  const [session, setSession] = useState(() => getSession())

  const [publicPosts, setPublicPosts] = useState([])
  const [publicLoading, setPublicLoading] = useState(false)
  const [publicError, setPublicError] = useState('')

  const [postDetail, setPostDetail] = useState(null)
  const [postLoading, setPostLoading] = useState(false)
  const [postError, setPostError] = useState('')

  const [adminPosts, setAdminPosts] = useState([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState('')

  const [editingPost, setEditingPost] = useState(null)
  const [editorLoading, setEditorLoading] = useState(false)
  const [editorError, setEditorError] = useState('')

  const refreshPublic = async () => {
    setPublicLoading(true)
    setPublicError('')
    try {
      const items = await apiFetch('/api/posts')
      setPublicPosts(Array.isArray(items) ? items : [])
    } catch (e) {
      setPublicError(e?.message || 'Failed to load posts.')
    } finally {
      setPublicLoading(false)
    }
  }

  const refreshAdmin = async () => {
    setAdminLoading(true)
    setAdminError('')
    try {
      const items = await apiFetch('/api/admin/posts', {
        headers: withAuth(),
      })
      setAdminPosts(Array.isArray(items) ? items : [])
    } catch (e) {
      setAdminError(e?.message || 'Failed to load admin posts.')
    } finally {
      setAdminLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      setSession(null)
    }
  }, [route.name])

  useEffect(() => {
    const isAdminRoute = String(route.name).startsWith('admin')
    if (isAdminRoute && route.name !== 'adminLogin' && !isAuthenticated()) {
      navigate('/admin/login')
    }
    if (route.name === 'adminLogin' && isAuthenticated()) {
      navigate('/admin/posts')
    }
  }, [route])

  useEffect(() => {
    if (route.name === 'home') refreshPublic()
  }, [route.name])

  useEffect(() => {
    if (route.name !== 'post') return
    const slug = route.slug
    if (!slug) return

    let cancelled = false
    setPostLoading(true)
    setPostError('')
    setPostDetail(null)

    apiFetch(`/api/posts/${encodeURIComponent(slug)}`)
      .then((data) => {
        if (cancelled) return
        setPostDetail(data)
      })
      .catch((e) => {
        if (cancelled) return
        setPostError(e?.message || 'Failed to load post.')
      })
      .finally(() => {
        if (cancelled) return
        setPostLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [route.name, route.slug])

  useEffect(() => {
    if (!isAuthenticated()) return
    if (route.name === 'adminPosts') refreshAdmin()
  }, [route.name])

  useEffect(() => {
    if (!isAuthenticated()) return
    if (route.name !== 'adminPostEdit') return

    let cancelled = false
    setEditorLoading(true)
    setEditorError('')
    setEditingPost(null)

    apiFetch(`/api/admin/posts/${route.id}`, {
      headers: withAuth(),
    })
      .then((data) => {
        if (cancelled) return
        setEditingPost(data)
      })
      .catch((e) => {
        if (cancelled) return
        setEditorError(e?.message || 'Failed to load post.')
      })
      .finally(() => {
        if (cancelled) return
        setEditorLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [route.name, route.id])

  const onLogout = () => {
    logout()
    setSession(null)
    navigate('/')
  }

  const onDelete = async (id) => {
    const ok = window.confirm('Delete this post? This cannot be undone.')
    if (!ok) return

    await apiFetch(`/api/admin/posts/${id}`, {
      method: 'DELETE',
      headers: withAuth(),
    })

    await refreshAdmin()
    navigate('/admin/posts')
  }

  const publicCountLabel = useMemo(() => `${publicPosts.length} published`, [publicPosts.length])

  return (
    <div className="app">
      <TopBar session={session} onLogout={onLogout} />
      <main className="container">
        {route.name === 'home' && (
          <Home
            posts={publicPosts}
            loading={publicLoading}
            error={publicError}
            countLabel={publicCountLabel}
          />
        )}

        {route.name === 'post' && (
          <PostView post={postDetail} loading={postLoading} error={postError} />
        )}

        {route.name === 'adminLogin' && (
          <AdminLogin
            onLoggedIn={(nextSession) => {
              setSession(nextSession)
              navigate('/admin/posts')
            }}
          />
        )}

        {route.name === 'adminPosts' && isAuthenticated() && (
          <AdminPosts
            posts={adminPosts}
            loading={adminLoading}
            error={adminError}
            onRefresh={refreshAdmin}
            onCreate={() => navigate('/admin/posts/new')}
            onEdit={(id) => navigate(`/admin/posts/${id}`)}
            onDelete={(id) => onDelete(id)}
          />
        )}

        {route.name === 'adminPostNew' && isAuthenticated() && (
          <PostEditor
            key="new"
            mode="create"
            initial={createDraftPost()}
            busy={false}
            error={editorError}
            onCancel={() => navigate('/admin/posts')}
            onSave={async (draft) => {
              setEditorError('')
              const formData = toUpsertFormData(draft)
              await apiFetch('/api/admin/posts', {
                method: 'POST',
                headers: withAuth(),
                body: formData,
              })
              await refreshAdmin()
              navigate('/admin/posts')
            }}
          />
        )}

        {route.name === 'adminPostEdit' && isAuthenticated() && (
          <>
            {editorLoading ? <div className="muted">Loading…</div> : null}
            {!editorLoading && editorError ? (
              <div className="error">{editorError}</div>
            ) : null}
            {!editorLoading && editingPost ? (
              <PostEditor
                key={`edit:${route.id}`}
                mode="edit"
                initial={{
                  id: editingPost.id,
                  title: editingPost.title,
                  slug: editingPost.slug,
                  excerpt: editingPost.excerpt,
                  content: editingPost.content,
                  imageUrl: editingPost.imageUrl,
                  published: Boolean(editingPost.publishedAt),
                  removeImage: false,
                  imageFile: null,
                }}
                onCancel={() => navigate('/admin/posts')}
                onDelete={() => onDelete(route.id)}
                onSave={async (draft) => {
                  setEditorError('')
                  const formData = toUpsertFormData(draft)
                  await apiFetch(`/api/admin/posts/${route.id}`, {
                    method: 'PUT',
                    headers: withAuth(),
                    body: formData,
                  })
                  await refreshAdmin()
                  navigate('/admin/posts')
                }}
              />
            ) : null}
          </>
        )}

        {route.name === 'notFound' && (
          <EmptyState
            title="Page not found"
            description="Check the URL and try again."
            action={
              <a className="btn primary" href="#/">
                Go home
              </a>
            }
          />
        )}
      </main>
      <Footer />
    </div>
  )
}

function TopBar({ session, onLogout }) {
  const authed = isAuthenticated()
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#/">
          BlogApp
        </a>
        <nav className="nav">
          <a className="navlink" href="#/">
            Home
          </a>
          <a className="navlink" href="#/admin/posts">
            Admin
          </a>
          {authed ? (
            <button className="btn" type="button" onClick={onLogout}>
              Logout ({session?.username || 'admin'})
            </button>
          ) : (
            <a className="btn" href="#/admin/login">
              Login
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>React UI + .NET API + MySQL</span>
        <span className="muted">Images are served from API `/uploads/*`.</span>
      </div>
    </footer>
  )
}

function Home({ posts, loading, error, countLabel }) {
  return (
    <div className="stack">
      <section className="heroCard">
        <div>
          <h1 className="heroTitle">Your Blog</h1>
          <p className="heroSubtitle">
            Publish posts with images from the admin panel.
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
      </section>

      <section className="stack">
        <div className="sectionHeader">
          <h2 className="sectionTitle">Latest posts</h2>
          <span className="muted">{countLabel}</span>
        </div>

        {error ? <div className="error">{error}</div> : null}

        {loading ? (
          <div className="muted">Loading…</div>
        ) : posts.length === 0 ? (
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
            {posts.map((post) => (
              <article key={post.id} className="card">
                {post.imageUrl ? (
                  <img
                    className="cardImg"
                    src={resolveImageSrc(post.imageUrl)}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <div className="cardImg placeholder" aria-hidden="true" />
                )}
                <div className="cardBody">
                  <a className="cardTitle" href={`#/post/${post.slug}`}>
                    {post.title || 'Untitled'}
                  </a>
                  <p className="cardExcerpt">{post.excerpt}</p>
                  <div className="cardMeta">
                    <span className="pill">Published</span>
                    <span className="muted">{formatDate(post.publishedAt)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function PostView({ post, loading, error }) {
  if (loading) return <div className="muted">Loading…</div>

  if (error) {
    return (
      <EmptyState
        title="Could not load post"
        description={error}
        action={
          <a className="btn primary" href="#/">
            Back to home
          </a>
        }
      />
    )
  }

  if (!post) {
    return (
      <EmptyState
        title="Post not found"
        description="It may have been deleted or is not published."
        action={
          <a className="btn primary" href="#/">
            Back to home
          </a>
        }
      />
    )
  }

  return (
    <article className="post">
      <div className="postHeader">
        <a className="back" href="#/">
          ← Back
        </a>
        <h1 className="postTitle">{post.title || 'Untitled'}</h1>
        <div className="postMeta">
          <span className="muted">Published {formatDate(post.publishedAt)}</span>
        </div>
      </div>

      {post.imageUrl ? (
        <img className="postImg" src={resolveImageSrc(post.imageUrl)} alt="" />
      ) : null}

      <div className="postContent">{post.content}</div>
    </article>
  )
}

function AdminLogin({ onLoggedIn }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')

    try {
      const nextSession = await login({ username, password })
      onLoggedIn(nextSession)
    } catch (e2) {
      setError(e2?.message || 'Login failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="authWrap">
      <section className="authCard">
        <div className="authHeader">
          <h1 className="authTitle">Admin login</h1>
          <p className="muted">Uses API endpoint <code>/api/admin/login</code></p>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span className="label">Username</span>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span className="label">Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error ? <div className="error">{error}</div> : null}

          <div className="row">
            <button className="btn primary" type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
            <a className="btn" href="#/">
              Cancel
            </a>
          </div>
        </form>

        <div className="hint">
          Configure API admin credentials in <code>BlogApp(API)\\appsettings.json</code>.
        </div>
      </section>
    </div>
  )
}

function AdminPosts({ posts, loading, error, onRefresh, onCreate, onEdit, onDelete }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter((p) => {
      const title = (p.title || '').toLowerCase()
      const excerpt = (p.excerpt || '').toLowerCase()
      const slug = (p.slug || '').toLowerCase()
      return title.includes(q) || excerpt.includes(q) || slug.includes(q)
    })
  }, [posts, query])

  return (
    <section className="stack">
      <div className="sectionHeader">
        <h1 className="sectionTitle">Posts</h1>
        <div className="row">
          <input
            className="input search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            aria-label="Search posts"
          />
          <button className="btn" type="button" onClick={onRefresh} disabled={loading}>
            Refresh
          </button>
          <button className="btn primary" type="button" onClick={onCreate}>
            New post
          </button>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}

      {loading ? (
        <div className="muted">Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No posts found"
          description="Create a new post or clear the search."
          action={
            <button className="btn primary" type="button" onClick={onCreate}>
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
          {filtered.map((p) => (
            <div key={p.id} className="trow">
              <div className="titleCell">
                <div className="titleLine">{p.title || 'Untitled'}</div>
                <div className="muted small">/{p.slug}</div>
              </div>
              <div>
                {p.publishedAt ? (
                  <span className="pill">Published</span>
                ) : (
                  <span className="pill draft">Draft</span>
                )}
              </div>
              <div className="muted">{formatDate(p.updatedAt)}</div>
              <div className="right actions">
                <button className="btn" type="button" onClick={() => onEdit(p.id)}>
                  Edit
                </button>
                <button className="btn danger" type="button" onClick={() => onDelete(p.id)}>
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

function PostEditor({ mode, initial, onCancel, onSave, onDelete }) {
  const [draft, setDraft] = useState(() => initial)
  const [slugTouched, setSlugTouched] = useState(false)
  const [localError, setLocalError] = useState('')
  const [busy, setBusy] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  if (!draft) return null

  const setField = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }))

  const onPickImage = (file) => {
    if (!file) return
    if (file.size > 2.5 * 1024 * 1024) {
      setLocalError('Image is too large. Please use a file under 2.5MB.')
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const nextPreview = URL.createObjectURL(file)
    setPreviewUrl(nextPreview)

    setLocalError('')
    setField('removeImage', false)
    setField('imageFile', file)
  }

  const validate = () => {
    const title = (draft.title || '').trim()
    const slug = (draft.slug || '').trim()
    if (!title) return 'Title is required.'
    if (!slug) return 'Slug is required.'
    return ''
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setLocalError(validationError)
      return
    }

    setLocalError('')
    setBusy(true)
    try {
      await onSave(draft)
    } catch (e2) {
      setLocalError(e2?.message || 'Save failed.')
    } finally {
      setBusy(false)
    }
  }

  const showError = localError
  const showImage = previewUrl
    ? previewUrl
    : draft.imageUrl && !draft.removeImage
      ? resolveImageSrc(draft.imageUrl)
      : ''

  return (
    <section className="editor">
      <div className="sectionHeader">
        <h1 className="sectionTitle">
          {mode === 'create' ? 'New post' : 'Edit post'}
        </h1>
        <div className="row">
          {onDelete ? (
            <button className="btn danger" type="button" onClick={onDelete} disabled={busy}>
              Delete
            </button>
          ) : null}
          <button className="btn" type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="btn primary" type="submit" form="postForm" disabled={busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <form id="postForm" className="form editorGrid" onSubmit={onSubmit}>
        <label className="field">
          <span className="label">Title</span>
          <input
            className="input"
            value={draft.title}
            onChange={(e) => {
              const nextTitle = e.target.value
              setField('title', nextTitle)
              if (!slugTouched) setField('slug', slugify(nextTitle))
            }}
            placeholder="My awesome post"
          />
        </label>

        <label className="field">
          <span className="label">Slug</span>
          <input
            className="input"
            value={draft.slug}
            onChange={(e) => {
              setSlugTouched(true)
              setField('slug', slugify(e.target.value))
            }}
            placeholder="my-awesome-post"
          />
        </label>

        <label className="field span2">
          <span className="label">Excerpt</span>
          <textarea
            className="input textarea"
            value={draft.excerpt}
            onChange={(e) => setField('excerpt', e.target.value)}
            rows={3}
            placeholder="Short summary shown on the homepage…"
          />
        </label>

        <label className="field span2">
          <span className="label">Content</span>
          <textarea
            className="input textarea content"
            value={draft.content}
            onChange={(e) => setField('content', e.target.value)}
            rows={12}
            placeholder="Write your post content here…"
          />
        </label>

        <div className="field span2">
          <div className="row between">
            <div>
              <div className="label">Cover image</div>
              <div className="muted small">JPG/PNG/WebP/GIF up to 2.5MB</div>
            </div>
            <div className="row">
              <label className="btn">
                Upload
                <input
                  className="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPickImage(e.target.files?.[0] || null)}
                />
              </label>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  if (previewUrl) URL.revokeObjectURL(previewUrl)
                  setPreviewUrl('')
                  setField('imageFile', null)
                  setField('removeImage', true)
                }}
                disabled={!draft.imageUrl && !draft.imageFile && !previewUrl}
              >
                Remove
              </button>
            </div>
          </div>

          {showImage ? (
            <img className="previewImg" src={showImage} alt="" />
          ) : (
            <div className="previewImg placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="field span2">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={Boolean(draft.published)}
              onChange={(e) => setField('published', e.target.checked)}
            />
            <span>Published</span>
          </label>
          <div className="muted small">
            {draft.published
              ? 'This post will be visible on the homepage.'
              : 'This post is a draft and will not show on the homepage.'}
          </div>
        </div>

        {showError ? <div className="error span2">{showError}</div> : null}

        <div className="field span2">
          <div className="label">Preview</div>
          <div className="preview">
            <div className="previewTitle">{draft.title || 'Untitled'}</div>
            <div className="muted small">/{draft.slug}</div>
            <div className="previewBody">{draft.content || 'No content yet.'}</div>
          </div>
        </div>
      </form>
    </section>
  )
}

function EmptyState({ title, description, action }) {
  return (
    <div className="empty">
      <div className="emptyTitle">{title}</div>
      <div className="muted">{description}</div>
      <div className="emptyAction">{action}</div>
    </div>
  )
}

export default App

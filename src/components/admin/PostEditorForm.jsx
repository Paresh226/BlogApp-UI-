import { useEffect, useMemo, useState } from 'react'
import { countWords, getReadingTimeLabel } from '../../utils/format.js'
import { slugify } from '../../utils/postForm.js'
import { resolveImageSrc } from '../../utils/media.js'

function PostEditorForm({ mode, initial, busy = false, onCancel, onDelete, onSave }) {
  const [draft, setDraft] = useState(() => initial)
  const [slugTouched, setSlugTouched] = useState(false)
  const [localError, setLocalError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const contentWordCount = useMemo(() => countWords(draft.content), [draft.content])
  const readingTime = useMemo(() => getReadingTimeLabel(draft.content), [draft.content])

  if (!draft) {
    return null
  }

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handlePickImage = (file) => {
    if (!file) {
      return
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setLocalError('Image is too large. Please use a file under 2.5MB.')
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    const nextPreviewUrl = URL.createObjectURL(file)

    setPreviewUrl(nextPreviewUrl)
    setLocalError('')
    setField('removeImage', false)
    setField('imageFile', file)
  }

  const validate = () => {
    const title = (draft.title || '').trim()
    const slug = (draft.slug || '').trim()

    if (!title) {
      return 'Title is required.'
    }

    if (!slug) {
      return 'Slug is required.'
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationError = validate()
    if (validationError) {
      setLocalError(validationError)
      return
    }

    setLocalError('')

    try {
      await onSave(draft)
    } catch (error) {
      setLocalError(error?.message || 'Save failed.')
    }
  }

  const showImage = previewUrl
    ? previewUrl
    : draft.imageUrl && !draft.removeImage
      ? resolveImageSrc(draft.imageUrl)
      : ''

  return (
    <section className="editor">
      <div className="sectionHeader">
        <h1 className="sectionTitle">{mode === 'create' ? 'New post' : 'Edit post'}</h1>

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
            {busy ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="editorStats">
        <div className="statCard">
          <span className="statLabel">Title length</span>
          <strong>{draft.title.trim().length}</strong>
        </div>
        <div className="statCard">
          <span className="statLabel">Excerpt length</span>
          <strong>{draft.excerpt.trim().length}</strong>
        </div>
        <div className="statCard">
          <span className="statLabel">Words</span>
          <strong>{contentWordCount}</strong>
        </div>
        <div className="statCard">
          <span className="statLabel">Read time</span>
          <strong>{readingTime}</strong>
        </div>
      </div>

      <form id="postForm" className="form editorGrid" onSubmit={handleSubmit}>
        <label className="field">
          <span className="label">Title</span>
          <input
            className="input"
            value={draft.title}
            onChange={(event) => {
              const nextTitle = event.target.value
              setField('title', nextTitle)

              if (!slugTouched) {
                setField('slug', slugify(nextTitle))
              }
            }}
            placeholder="My awesome post"
          />
        </label>

        <div className="field">
          <div className="row between">
            <span className="label">Slug</span>
            <button
              className="textButton"
              type="button"
              onClick={() => setField('slug', slugify(draft.title))}
            >
              Use title
            </button>
          </div>
          <input
            className="input"
            value={draft.slug}
            onChange={(event) => {
              setSlugTouched(true)
              setField('slug', slugify(event.target.value))
            }}
            placeholder="my-awesome-post"
          />
        </div>

        <label className="field span2">
          <span className="label">Excerpt</span>
          <textarea
            className="input textarea"
            value={draft.excerpt}
            onChange={(event) => setField('excerpt', event.target.value)}
            rows={3}
            placeholder="Short summary shown on the homepage..."
          />
        </label>

        <label className="field span2">
          <div className="row between">
            <span className="label">Content</span>
            <span className="muted small">{readingTime}</span>
          </div>
          <textarea
            className="input textarea content"
            value={draft.content}
            onChange={(event) => setField('content', event.target.value)}
            rows={12}
            placeholder="Write your post content here..."
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
                  onChange={(event) => handlePickImage(event.target.files?.[0] || null)}
                />
              </label>

              <button
                className="btn"
                type="button"
                onClick={() => {
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl)
                  }

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
              onChange={(event) => setField('published', event.target.checked)}
            />
            <span>Published</span>
          </label>
          <div className="muted small">
            {draft.published
              ? 'This post will be visible on the homepage.'
              : 'This post is a draft and will not show on the homepage.'}
          </div>
        </div>

        {localError ? <div className="error span2">{localError}</div> : null}

        <div className="field span2">
          <div className="label">Live preview</div>
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

export default PostEditorForm

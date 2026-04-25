import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EmptyState from '../components/shared/EmptyState.jsx'
import {
  fetchPostBySlug,
  selectCurrentPost,
  selectCurrentPostError,
  selectCurrentPostLoading,
} from '../store/postsSlice.js'
import { formatDate, getReadingTimeLabel } from '../utils/format.js'
import { resolveImageSrc } from '../utils/media.js'

function PostDetailsPage({ slug }) {
  const dispatch = useDispatch()
  const post = useSelector(selectCurrentPost)
  const loading = useSelector(selectCurrentPostLoading)
  const error = useSelector(selectCurrentPostError)
  const [copyLabel, setCopyLabel] = useState('Copy link')

  useEffect(() => {
    if (!slug) {
      return
    }

    dispatch(fetchPostBySlug(slug))
  }, [dispatch, slug])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyLabel('Copied!')
      window.setTimeout(() => setCopyLabel('Copy link'), 1500)
    } catch {
      setCopyLabel('Copy failed')
      window.setTimeout(() => setCopyLabel('Copy link'), 1500)
    }
  }

  if (loading) {
    return <div className="muted">Loading...</div>
  }

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
          &larr; Back
        </a>
        <h1 className="postTitle">{post.title || 'Untitled'}</h1>
        <div className="postMeta row">
          <span className="pill">Published</span>
          <span className="muted">{formatDate(post.publishedAt)}</span>
          <span className="muted">{getReadingTimeLabel(post.content)}</span>
          <button className="btn" type="button" onClick={handleCopy}>
            {copyLabel}
          </button>
        </div>
      </div>

      {post.imageUrl ? (
        <img className="postImg" src={resolveImageSrc(post.imageUrl)} alt="" />
      ) : null}

      <div className="postContent">{post.content}</div>
    </article>
  )
}

export default PostDetailsPage

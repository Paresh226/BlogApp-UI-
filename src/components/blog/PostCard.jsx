import { formatShortDate, getReadingTimeLabel } from '../../utils/format.js'
import { resolveImageSrc } from '../../utils/media.js'

function PostCard({ post }) {
  return (
    <article className="card interactiveCard">
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
        <div className="cardMeta">
          <span className="pill">Published</span>
          <span className="muted">{formatShortDate(post.publishedAt)}</span>
        </div>

        <a className="cardTitle" href={`#/post/${post.slug}`}>
          {post.title || 'Untitled'}
        </a>

        <p className="cardExcerpt">{post.excerpt || 'Open this story to read the full post.'}</p>

        <div className="cardFooter">
          <span className="muted">{getReadingTimeLabel(post.content || post.excerpt)}</span>
          <a className="textButton" href={`#/post/${post.slug}`}>
            Read story
          </a>
        </div>
      </div>
    </article>
  )
}

export default PostCard

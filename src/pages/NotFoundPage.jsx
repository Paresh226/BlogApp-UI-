import EmptyState from '../components/shared/EmptyState.jsx'

function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="Check the URL and try again."
      action={
        <a className="btn primary" href="#/">
          Go home
        </a>
      }
    />
  )
}

export default NotFoundPage

function EmptyState({ title, description, action }) {
  return (
    <div className="empty">
      <div className="emptyTitle">{title}</div>
      <div className="muted">{description}</div>
      <div className="emptyAction">{action}</div>
    </div>
  )
}

export default EmptyState

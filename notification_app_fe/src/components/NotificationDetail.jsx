export default function NotificationDetail({ notification, onBack }) {
  if (!notification) return null;

  const { type, title, message, priority, metadata, actionUrl, createdAt, read } = notification;

  return (
    <div className="detail-view">
      <button className="detail-back" onClick={onBack}>← Back</button>
      <div className="detail-card">
        <div className="detail-header">
          <span className={`detail-type type-${type}`}>{type}</span>
          <span className={`detail-priority priority-${priority}`}>{priority}</span>
          {!read && <span className="detail-unread-dot" />}
        </div>
        <h2 className="detail-title">{title}</h2>
        <p className="detail-message">{message}</p>
        <div className="detail-meta">
          <span>Received: {new Date(createdAt).toLocaleString()}</span>
          {actionUrl && <a href={actionUrl} className="detail-action-link">Open →</a>}
        </div>
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="detail-metadata">
            <h4>Additional Details</h4>
            <div className="metadata-grid">
              {Object.entries(metadata).map(([key, val]) => (
                <div key={key} className="metadata-item">
                  <span className="metadata-key">{key}</span>
                  <span className="metadata-val">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

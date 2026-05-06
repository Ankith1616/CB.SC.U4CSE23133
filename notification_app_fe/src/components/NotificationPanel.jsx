import NotificationItem from './NotificationItem';

export default function NotificationPanel({ notifications, onClose, onMarkRead, onMarkAllRead, onDelete, onRefresh }) {
  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()} id="notification-panel">
        <div className="panel-header">
          <h2>Notifications</h2>
          <div className="panel-header-actions">
            <button className="panel-action-btn" onClick={onRefresh} title="Refresh">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
            {unread.length > 0 && (
              <button className="panel-action-btn mark-all" onClick={onMarkAllRead}>
                Mark all read
              </button>
            )}
            <button className="panel-close-btn" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="panel-body">
          {notifications.length === 0 ? (
            <div className="panel-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} onDelete={onDelete} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

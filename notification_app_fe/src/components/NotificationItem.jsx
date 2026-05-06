const TYPE_CONFIG = {
  info:    { icon: 'ℹ', color: 'var(--info)',    label: 'Info' },
  alert:   { icon: '⚠', color: 'var(--error)',   label: 'Alert' },
  warning: { icon: '⚡', color: 'var(--warning)', label: 'Warning' },
  success: { icon: '✓', color: 'var(--success)', label: 'Success' },
  system:  { icon: '⚙', color: 'var(--text-muted)', label: 'System' },
};

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationItem({ notification, onMarkRead, onDelete }) {
  const { id, type, title, message, read, priority, createdAt } = notification;
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  return (
    <div className={`notif-item ${read ? 'read' : 'unread'} priority-${priority}`} id={`notif-${id}`}>
      <div className="notif-icon" style={{ backgroundColor: `${config.color}18`, color: config.color }}>
        {config.icon}
      </div>
      <div className="notif-content">
        <div className="notif-header">
          <span className="notif-title">{title}</span>
          <span className="notif-time">{timeAgo(createdAt)}</span>
        </div>
        <p className="notif-message">{message}</p>
        <div className="notif-footer">
          <span className="notif-type-badge" style={{ color: config.color, borderColor: `${config.color}40` }}>
            {config.label}
          </span>
          {priority === 'high' && <span className="notif-priority-badge">High Priority</span>}
        </div>
      </div>
      <div className="notif-actions">
        {!read && (
          <button className="notif-action-btn" onClick={() => onMarkRead(id)} title="Mark as read">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        )}
        <button className="notif-action-btn delete" onClick={() => onDelete(id)} title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

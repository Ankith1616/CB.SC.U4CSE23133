import { useState } from 'react';
import NotificationBell from './NotificationBell';
import NotificationPanel from './NotificationPanel';
import PreferencesPanel from './PreferencesPanel';
import { useSocket } from '../context/SocketContext';

export default function Navbar({ unreadCount, notifications, onRefresh, onMarkRead, onMarkAllRead, onDelete }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const { connected } = useSocket();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span>NotifyHub</span>
        </div>
        <span className="navbar-subtitle">Afford Medical Technologies</span>
      </div>

      <div className="navbar-actions">
        <div className={`connection-badge ${connected ? 'online' : 'offline'}`}>
          <span className="connection-dot"></span>
          {connected ? 'Live' : 'Offline'}
        </div>

        <button className="nav-btn" onClick={() => { setPrefsOpen(!prefsOpen); setPanelOpen(false); }} title="Preferences">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        <NotificationBell count={unreadCount} onClick={() => { setPanelOpen(!panelOpen); setPrefsOpen(false); }} />
      </div>

      {panelOpen && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setPanelOpen(false)}
          onMarkRead={onMarkRead}
          onMarkAllRead={() => { onMarkAllRead(); }}
          onDelete={onDelete}
          onRefresh={onRefresh}
        />
      )}

      {prefsOpen && <PreferencesPanel onClose={() => setPrefsOpen(false)} />}
    </nav>
  );
}

import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead as markAsReadApi,
  markAllAsRead as markAllAsReadApi,
  deleteNotification as deleteNotificationApi,
  createNotification as createNotificationApi,
} from './services/api';
import './App.css';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        fetchNotifications({ limit: 50 }),
        fetchUnreadCount(),
      ]);
      setNotifications(notifRes.data.notifications);
      setUnreadCount(countRes.data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) loadNotifications();
  }, [authLoading, user, loadNotifications]);

  // Real-time Socket.IO listeners
  useEffect(() => {
    if (!socket) return;

    const handleNew = (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };
    const handleRead = ({ id }) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };
    const handleReadAll = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    };
    const handleDeleted = ({ id }) => {
      setNotifications((prev) => {
        const n = prev.find((x) => x.id === id);
        if (n && !n.read) setUnreadCount((c) => Math.max(0, c - 1));
        return prev.filter((x) => x.id !== id);
      });
    };

    socket.on('notification:new', handleNew);
    socket.on('notification:read', handleRead);
    socket.on('notification:readAll', handleReadAll);
    socket.on('notification:deleted', handleDeleted);

    return () => {
      socket.off('notification:new', handleNew);
      socket.off('notification:read', handleRead);
      socket.off('notification:readAll', handleReadAll);
      socket.off('notification:deleted', handleDeleted);
    };
  }, [socket]);

  const handleMarkRead = async (id) => {
    try { await markAsReadApi(id); } catch (e) { console.error(e); }
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    try { await markAllAsReadApi(); } catch (e) { console.error(e); }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (id) => {
    const n = notifications.find((x) => x.id === id);
    try { await deleteNotificationApi(id); } catch (e) { console.error(e); }
    setNotifications((prev) => prev.filter((x) => x.id !== id));
    if (n && !n.read) setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleSendTest = async () => {
    const types = ['info', 'alert', 'warning', 'success', 'system'];
    const titles = ['New Lab Results', 'Appointment Update', 'Insurance Alert', 'Payment Confirmed', 'System Update'];
    const messages = [
      'Your latest test results have been uploaded.',
      'Your upcoming appointment has been rescheduled.',
      'Your insurance policy requires attention.',
      'Payment of ₹3,200 received successfully.',
      'A new system update is available.',
    ];
    const i = Math.floor(Math.random() * types.length);
    try {
      await createNotificationApi({
        userId: user.userId,
        type: types[i],
        title: titles[i],
        message: messages[i],
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      });
    } catch (e) { console.error(e); }
  };

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loader" />
        <p>Connecting...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar
        unreadCount={unreadCount}
        notifications={notifications}
        onRefresh={loadNotifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onDelete={handleDelete}
      />

      <main className="main-content">
        <div className="hero-section">
          <div className="hero-glow" />
          <h1>Notification Center</h1>
          <p className="hero-subtitle">
            Real-time notifications powered by WebSocket — click the bell icon to view your notifications.
          </p>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{notifications.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card accent">
              <span className="stat-value">{unreadCount}</span>
              <span className="stat-label">Unread</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{notifications.filter((n) => n.read).length}</span>
              <span className="stat-label">Read</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{notifications.filter((n) => n.priority === 'high').length}</span>
              <span className="stat-label">High Priority</span>
            </div>
          </div>

          <button className="test-btn" onClick={handleSendTest} id="send-test-notification">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Send Test Notification
          </button>
        </div>

        <footer className="app-footer">
          <p>Afford Medical Technologies Private Limited © 2026</p>
        </footer>
      </main>
    </div>
  );
}

export default App;

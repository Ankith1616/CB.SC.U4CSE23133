import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Skeleton, Fade } from '@mui/material';
import NotificationCard from '../components/NotificationCard';
import { fetchAllNotifications } from '../api';

const SvgInboxEmpty = (props) => (
  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="url(#paint0_linear)"/>
    <path d="M17 12L12 15.5L7 12V7L12 10.5L17 7V12Z" fill="url(#paint1_linear)"/>
    <defs>
      <linearGradient id="paint0_linear" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f43f5e" />
        <stop offset="1" stopColor="#fbbf24" />
      </linearGradient>
      <linearGradient id="paint1_linear" x1="7" y1="7" x2="17" y2="15.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f43f5e" />
        <stop offset="1" stopColor="#ec4899" />
      </linearGradient>
    </defs>
  </svg>
);

const WEIGHTS = {
  Placement: 300,
  Result: 200,
  Event: 100,
};

export default function PriorityInbox({ readSet, markAsRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPriorityNotifications();
  }, []);

  const loadPriorityNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllNotifications();
      
      const scoredNotifications = data.map(notif => {
        const baseWeight = WEIGHTS[notif.Type] || 0;
        const timestampMs = new Date(notif.Timestamp).getTime();
        const recencyFactor = timestampMs / 100000000000;
        return {
          ...notif,
          priorityScore: baseWeight + recencyFactor
        };
      });

      scoredNotifications.sort((a, b) => b.priorityScore - a.priorityScore);
      setNotifications(scoredNotifications.slice(0, 10));
    } catch (err) {
      setError(err.message || 'Failed to fetch priority notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box mb={4} p={3} borderRadius={3} sx={{ background: 'linear-gradient(to right, rgba(244, 63, 94, 0.1), transparent)', borderLeft: '4px solid #f43f5e' }}>
        <Typography variant="h5" color="#fda4af" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{ fontSize: '1.2em' }}>🔥</span> Priority Inbox
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600 }}>
          The intelligent engine automatically surfaces your Top 10 most critical alerts based on an advanced heuristic scoring algorithm prioritizing Placements and Results.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(244, 63, 94, 0.1)', color: '#fda4af' }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={118} sx={{ mb: 2, borderRadius: 4, bgcolor: 'rgba(30, 41, 59, 0.5)' }} />
          ))}
        </Box>
      ) : notifications.length === 0 ? (
        <Fade in={true}>
          <Box display="flex" flexDirection="column" alignItems="center" p={6} bgcolor="rgba(30, 41, 59, 0.2)" borderRadius={4} border="1px dashed rgba(255,255,255,0.1)">
            <SvgInboxEmpty style={{ opacity: 0.8, filter: 'drop-shadow(0 0 20px rgba(244, 63, 94, 0.3))' }} />
            <Typography variant="h6" color="text.primary" mt={3} mb={1}>
              Your Priority Inbox is Clear
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={300}>
              There are no high-priority critical alerts that require your immediate attention.
            </Typography>
          </Box>
        </Fade>
      ) : (
        <Box>
          {notifications.map((notif, index) => (
            <Fade in={true} timeout={300 + (index * 100)} key={notif.ID}>
              <Box>
                <NotificationCard 
                  notification={notif} 
                  isRead={readSet.has(notif.ID)}
                  onMarkRead={markAsRead}
                />
              </Box>
            </Fade>
          ))}
        </Box>
      )}
    </Box>
  );
}

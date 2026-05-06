import React, { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Pagination, Alert, Skeleton, Fade } from '@mui/material';
import NotificationCard from '../components/NotificationCard';
import { fetchNotifications } from '../api';

const SvgEmptyState = (props) => (
  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="url(#paint0_linear)"/>
    <path d="M16 11H13V8C13 7.45 12.55 7 12 7C11.45 7 11 7.45 11 8V11H8C7.45 11 7 11.45 7 12C7 12.55 7.45 13 8 13H11V16C11 16.55 11.45 17 12 17C12.55 17 13 16.55 13 16V13H16C16.55 13 17 12.55 17 12C17 11.45 16.55 11 16 11Z" fill="url(#paint1_linear)"/>
    <defs>
      <linearGradient id="paint0_linear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="paint1_linear" x1="7" y1="7" x2="17" y2="17" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6" />
        <stop offset="1" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
  </svg>
);

export default function AllNotifications({ readSet, markAsRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('All');
  
  const limit = 5;

  useEffect(() => {
    loadNotifications();
  }, [page, type]);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(page, limit, type);
      setNotifications(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => setPage(value);
  const handleTypeChange = (event) => {
    setType(event.target.value);
    setPage(1);
  };

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" mb={4} gap={2}>
        <Typography variant="h5" color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
          All Notifications
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: 'text.secondary' }}>Filter Category</InputLabel>
          <Select 
            value={type} 
            label="Filter Category" 
            onChange={handleTypeChange}
            sx={{ borderRadius: 2, bgcolor: 'rgba(30, 41, 59, 0.5)' }}
          >
            <MenuItem value="All">All Types</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(244, 63, 94, 0.1)', color: '#fda4af', '& .MuiAlert-icon': { color: '#fb7185' } }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={118} sx={{ mb: 2, borderRadius: 4, bgcolor: 'rgba(30, 41, 59, 0.5)' }} />
          ))}
        </Box>
      ) : notifications.length === 0 ? (
        <Fade in={true}>
          <Box display="flex" flexDirection="column" alignItems="center" p={6} bgcolor="rgba(30, 41, 59, 0.2)" borderRadius={4} border="1px dashed rgba(255,255,255,0.1)">
            <SvgEmptyState style={{ opacity: 0.8, filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.3))' }} />
            <Typography variant="h6" color="text.primary" mt={3} mb={1}>
              You're all caught up!
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={300}>
              There are no new notifications in this category right now. Check back later for updates.
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
          
          <Box display="flex" justifyContent="center" mt={5}>
            <Pagination 
              count={5} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
              sx={{ '& .MuiPaginationItem-root': { color: '#e2e8f0', bgcolor: 'rgba(30,41,59,0.5)', '&.Mui-selected': { bgcolor: 'primary.main', color: 'white' } } }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

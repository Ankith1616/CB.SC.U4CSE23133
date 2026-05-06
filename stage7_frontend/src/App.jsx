import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Container, Box, Tabs, Tab, Typography, Paper, SvgIcon, Badge } from '@mui/material';
import theme from './theme';
import AllNotifications from './pages/AllNotifications';
import PriorityInbox from './pages/PriorityInbox';

const NotificationsIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></SvgIcon>
);
const WhatshotIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></SvgIcon>
);

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [readSet, setReadSet] = useState(new Set());

  // Load read status from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('read_notifications');
    if (saved) {
      setReadSet(new Set(JSON.parse(saved)));
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const markAsRead = (id) => {
    setReadSet((prev) => {
      const updated = new Set(prev).add(id);
      localStorage.setItem('read_notifications', JSON.stringify([...updated]));
      return updated;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="fade-in-up" sx={{ minHeight: '100vh', pt: { xs: 2, md: 6 }, pb: 8, px: { xs: 1, sm: 2 } }}>
        <Container maxWidth="md" disableGutters>
          <Paper 
            className="glass-panel"
            elevation={0} 
            sx={{ 
              p: 0, 
              overflow: 'hidden', 
              borderRadius: 4, 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Animated Gradient Header */}
            <Box 
              className="animate-gradient-x"
              sx={{ 
                p: { xs: 3, md: 5 },
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #06b6d4 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Decorative elements */}
              <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)' }} />
              <Box sx={{ position: 'absolute', bottom: -30, left: 20, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)' }} />
              
              <Box position="relative" zIndex={1}>
                <Typography variant="h3" fontWeight={800} display="flex" alignItems="center" gap={2} sx={{ mb: 1, letterSpacing: '-0.03em' }}>
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: 3, display: 'flex', backdropFilter: 'blur(10px)' }}>
                    <NotificationsIcon fontSize="large" sx={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                  </Box>
                  NotifyHub
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, pl: 1, fontSize: '1.1rem', fontWeight: 300 }}>
                  Afford Medical Technologies Student Portal
                </Typography>
              </Box>
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ px: 2, pt: 2, borderBottom: '1px solid', borderColor: 'rgba(255,255,255,0.05)', bgcolor: 'rgba(15, 23, 42, 0.4)' }}>
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange} 
                variant="fullWidth"
                sx={{ mb: 1 }}
              >
                <Tab icon={<NotificationsIcon />} iconPosition="start" label="All Notifications" />
                <Tab icon={<WhatshotIcon sx={{ color: currentTab === 1 ? '#fbbf24' : 'inherit' }} />} iconPosition="start" label="Priority Inbox" />
              </Tabs>
            </Box>

            {/* Main Content Area */}
            <Box p={{ xs: 2, md: 4 }} sx={{ minHeight: 400 }}>
              {currentTab === 0 && <AllNotifications readSet={readSet} markAsRead={markAsRead} />}
              {currentTab === 1 && <PriorityInbox readSet={readSet} markAsRead={markAsRead} />}
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

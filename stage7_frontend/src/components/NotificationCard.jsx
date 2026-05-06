import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, SvgIcon, Avatar, Tooltip } from '@mui/material';

const CheckCircleOutlineIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/></SvgIcon>
);
const EventIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></SvgIcon>
);
const AssuredWorkloadIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z"/></SvgIcon>
);
const AnalyticsIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-5h2v5zm4 0h-2v-3h2v3zm0-5h-2v-2h2v2zm4 5h-2V7h2v10z"/></SvgIcon>
);

const getTypeConfig = (type) => {
  switch (type) {
    case 'Placement': 
      return { 
        icon: <AssuredWorkloadIcon fontSize="small" sx={{ color: '#fff' }} />, 
        bg: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
        glow: 'rgba(168, 85, 247, 0.4)'
      };
    case 'Result': 
      return { 
        icon: <AnalyticsIcon fontSize="small" sx={{ color: '#fff' }} />, 
        bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        glow: 'rgba(16, 185, 129, 0.4)'
      };
    case 'Event': 
      return { 
        icon: <EventIcon fontSize="small" sx={{ color: '#fff' }} />, 
        bg: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
        glow: 'rgba(245, 158, 11, 0.4)'
      };
    default: 
      return { 
        icon: null, 
        bg: '#475569',
        glow: 'rgba(0,0,0,0)'
      };
  }
};

export default function NotificationCard({ notification, isRead, onMarkRead }) {
  const { ID, Type, Message, Timestamp, priorityScore } = notification;
  const config = getTypeConfig(Type);

  return (
    <Card 
      className={isRead ? '' : 'pulse-unread'}
      sx={{ 
        mb: 2, 
        bgcolor: isRead ? 'rgba(30, 41, 59, 0.3)' : 'rgba(30, 41, 59, 0.7)',
        borderLeft: isRead ? '4px solid transparent' : `4px solid ${config.bg.includes('#10b981') ? '#10b981' : config.bg.includes('#a855f7') ? '#a855f7' : '#f59e0b'}`,
        transform: 'translateY(0)',
        opacity: isRead ? 0.75 : 1,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px -8px ${isRead ? 'rgba(0,0,0,0.5)' : config.glow}`,
          bgcolor: isRead ? 'rgba(30, 41, 59, 0.5)' : 'rgba(30, 41, 59, 0.8)',
          borderColor: 'rgba(255,255,255,0.1)'
        }
      }}
    >
      <CardContent sx={{ pb: '16px !important', p: { xs: 2, md: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar 
              sx={{ 
                background: config.bg,
                width: 36, 
                height: 36,
                boxShadow: `0 4px 10px ${config.glow}`
              }}
            >
              {config.icon}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="text.primary" fontWeight={700} sx={{ letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                {Type}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(Timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          </Box>
          {priorityScore && (
            <Chip 
              label={`Priority Score: ${priorityScore.toFixed(2)}`} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(244, 63, 94, 0.1)', 
                color: '#fda4af', 
                border: '1px solid rgba(244, 63, 94, 0.3)',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          )}
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-end">
          <Typography 
            variant="body1" 
            fontWeight={isRead ? 400 : 500} 
            color={isRead ? 'text.secondary' : '#f8fafc'}
            sx={{ pr: 2, fontSize: '1.05rem', lineHeight: 1.5 }}
          >
            {Message}
          </Typography>
          
          {!isRead && (
            <Tooltip title="Mark as Read" placement="top">
              <IconButton 
                color="secondary" 
                onClick={() => onMarkRead(ID)}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(45, 212, 191, 0.1)',
                  '&:hover': { bgcolor: 'rgba(45, 212, 191, 0.2)' }
                }}
              >
                <CheckCircleOutlineIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

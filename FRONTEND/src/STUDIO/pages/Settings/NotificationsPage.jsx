import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DoneIcon from '@mui/icons-material/Done';
import { alpha } from '@mui/material/styles';
import useTheme from '../../../theme/useTheme';

const NotificationsPage = () => {
  const theme = useTheme();
  const surfaceColor = theme.colors?.bg?.surface || theme.palette.background.paper;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/notifications/');
        if (!response.ok) throw new Error('błąd pobierania powiadomień');
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: surfaceColor,
        borderRadius: '16px',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        p: 4,
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mb: 3,
          textAlign: 'center',
          color: theme.colors?.text?.primary || theme.palette.text.primary
        }}
      >
        powiadomienia
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : notifications.length === 0 ? (
        <Typography color={theme.palette.text.secondary}>
          brak powiadomień
        </Typography>
      ) : (
        <List sx={{ width: '100%', maxWidth: 700 }}>
          {notifications.map((n, idx) => (
            <React.Fragment key={n.id}>
              <ListItem
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  backgroundColor: alpha(
                    theme.palette.primary.main,
                    n.is_read ? 0.04 : 0.1
                  ),
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(
                      theme.palette.primary.main,
                      n.is_read ? 0.1 : 0.15
                    )
                  }
                }}
              >
                <ListItemIcon>
                  {n.is_read ? (
                    <DoneIcon
                      sx={{ color: alpha(theme.palette.text.primary, 0.6) }}
                    />
                  ) : (
                    <NotificationsActiveIcon
                      sx={{ color: theme.palette.primary.main }}
                    />
                  )}
                </ListItemIcon>

                <ListItemText
                  primary={n.message}
                  secondary={new Date(n.created_at).toLocaleString('pl-PL')}
                  primaryTypographyProps={{
                    color:
                      theme.colors?.text?.primary || theme.palette.text.primary,
                    fontWeight: n.is_read ? 400 : 600
                  }}
                />

                {!n.is_read && (
                  <Chip
                    label="nowe"
                    color="primary"
                    size="small"
                    sx={{ fontSize: '0.7rem', ml: 1 }}
                  />
                )}
              </ListItem>
              {idx < notifications.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default NotificationsPage;

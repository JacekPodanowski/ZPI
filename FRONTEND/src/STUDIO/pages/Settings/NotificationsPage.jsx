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
  Chip,
  Button,
  Stack
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DoneIcon from '@mui/icons-material/Done';
import SendIcon from '@mui/icons-material/Send';
import { alpha } from '@mui/material/styles';
import useTheme from '../../../theme/useTheme';
import apiClient from '../../../services/apiClient';
import { useToast } from '../../../contexts/ToastContext';

const NotificationsPage = () => {
  const theme = useTheme();
  const surfaceColor = theme.colors?.bg?.surface || theme.palette.background.paper;
  const addToast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications/');
      setNotifications(response.data || []);
      setError(null);
    } catch (err) {
      // Provide a clearer, localized error message
      const msg = err?.response?.status
        ? `Błąd ${err.response.status}: nie udało się pobrać powiadomień`
        : 'Nie udało się pobrać powiadomień. Upewnij się, że jesteś zalogowany.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const sendMockNotification = async () => {
    setSending(true);
    try {
      const mockNotifications = [
        { message: 'Nowa rezerwacja na jutro o 10:00', notification_type: 'other' },
        { message: 'Gratulacje! Osiągnięto 50 sesji', notification_type: 'achievement' },
        { message: 'Klient anulował spotkanie zaplanowane na 15:00', notification_type: 'cancellation' },
        { message: 'Grupa "Joga dla początkujących" jest pełna', notification_type: 'group_full' },
      ];
      
      const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
      
      await apiClient.post('/notifications/', randomNotification);
      addToast('Wysłano testowe powiadomienie!', { variant: 'success' });
      
      // Refresh the notifications list
      await fetchNotifications();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Nie udało się wysłać powiadomienia';
      addToast(msg, { variant: 'error' });
    } finally {
      setSending(false);
    }
  };

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
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, width: '100%', maxWidth: 700 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            flex: 1,
            color: theme.colors?.text?.primary || theme.palette.text.primary
          }}
        >
          powiadomienia
        </Typography>
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={<SendIcon />}
          onClick={sendMockNotification}
          disabled={sending}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          {sending ? 'Wysyłanie...' : 'Test'}
        </Button>
      </Stack>

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

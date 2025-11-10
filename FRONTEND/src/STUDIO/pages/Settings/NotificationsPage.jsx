import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Stack,
  Checkbox,
  IconButton,
  Box,
  Toolbar,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
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
  const [selected, setSelected] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications/');
      setNotifications(response.data || []);
      setError(null);
    } catch (err) {
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

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(notifications.map(n => n.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post('/notifications/mark_all_read/');
      addToast('Wszystkie powiadomienia oznaczone jako przeczytane', { variant: 'success' });
      await fetchNotifications();
      setSelected([]);
    } catch (err) {
      addToast('Nie udało się oznaczyć jako przeczytane', { variant: 'error' });
    }
  };

  const handleMarkSelectedRead = async () => {
    try {
      await Promise.all(
        selected.map(id => apiClient.post(`/notifications/${id}/mark_read/`))
      );
      addToast(`Oznaczono ${selected.length} powiadomień jako przeczytane`, { variant: 'success' });
      await fetchNotifications();
      setSelected([]);
    } catch (err) {
      addToast('Nie udało się oznaczyć jako przeczytane', { variant: 'error' });
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    try {
      await apiClient.post('/notifications/delete_selected/', { ids: selected });
      addToast(`Usunięto ${selected.length} powiadomień`, { variant: 'success' });
      await fetchNotifications();
      setSelected([]);
    } catch (err) {
      addToast('Nie udało się usunąć powiadomień', { variant: 'error' });
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const allSelected = notifications.length > 0 && selected.length === notifications.length;
  const someSelected = selected.length > 0 && selected.length < notifications.length;

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: surfaceColor,
        borderRadius: '16px',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        p: { xs: 2, sm: 3, md: 4 },
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Stack 
        direction="row"
        alignItems="center" 
        sx={{ mb: 3 }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            flex: 1,
            color: theme.colors?.text?.primary || theme.palette.text.primary,
            fontSize: { xs: '1.25rem', md: '1.5rem' }
          }}
        >
          powiadomienia
          {unreadCount > 0 && (
            <Typography
              component="span"
              sx={{
                ml: 2,
                fontSize: '0.9rem',
                color: theme.palette.text.secondary,
                fontWeight: 400
              }}
            >
              ({unreadCount} nowych)
            </Typography>
          )}
        </Typography>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: 'center', py: 8 }}>
          {error}
        </Typography>
      ) : notifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <MailOutlineIcon sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
          <Typography color={theme.palette.text.secondary}>
            brak powiadomień
          </Typography>
        </Box>
      ) : (
        <>
          {/* Action Toolbar */}
          <Toolbar
            sx={{
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
              mb: 2,
              borderRadius: '8px',
              ...(selected.length > 0 && {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              }),
            }}
          >
            <Checkbox
              indeterminate={someSelected}
              checked={allSelected}
              onChange={handleSelectAll}
              sx={{ mr: 1 }}
            />
            {selected.length > 0 ? (
              <>
                <Typography
                  sx={{ flex: '1 1 100%' }}
                  color="inherit"
                  variant="subtitle1"
                  component="div"
                >
                  {selected.length} zaznaczonych
                </Typography>
                <Tooltip title="Oznacz jako przeczytane">
                  <IconButton onClick={handleMarkSelectedRead}>
                    <MarkEmailReadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Usuń zaznaczone">
                  <IconButton onClick={handleDeleteSelected} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Typography
                  sx={{ flex: '1 1 100%' }}
                  variant="subtitle1"
                  component="div"
                >
                  Zaznacz powiadomienia
                </Typography>
                {unreadCount > 0 && (
                  <Tooltip title="Oznacz wszystkie jako przeczytane">
                    <IconButton onClick={handleMarkAllRead}>
                      <DoneAllIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
          </Toolbar>

          {/* Notifications List */}
          <List sx={{ width: '100%' }}>
            {notifications.map((n) => {
              const isSelected = selected.includes(n.id);
              return (
                <ListItem
                  key={n.id}
                  sx={{
                    borderRadius: '8px',
                    mb: 1,
                    cursor: 'pointer',
                    backgroundColor: n.is_read 
                      ? 'transparent' 
                      : alpha(theme.palette.primary.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.divider, n.is_read ? 0.05 : 0.1)}`,
                    transition: 'all 0.2s ease',
                    ...(isSelected && {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      borderColor: theme.palette.primary.main,
                    }),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    }
                  }}
                  onClick={() => handleSelectOne(n.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    sx={{ mr: 2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOne(n.id);
                    }}
                  />

                  <ListItemText
                    primary={n.message}
                    secondary={new Date(n.created_at).toLocaleString('pl-PL', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    primaryTypographyProps={{
                      color: theme.colors?.text?.primary || theme.palette.text.primary,
                      fontWeight: n.is_read ? 400 : 600,
                      fontSize: '0.95rem'
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.8rem'
                    }}
                  />

                  {!n.is_read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: theme.palette.primary.main,
                        ml: 2
                      }}
                    />
                  )}
                </ListItem>
              );
            })}
          </List>
        </>
      )}
    </Paper>
  );
};

export default NotificationsPage;

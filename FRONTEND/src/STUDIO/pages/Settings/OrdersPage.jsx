import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  Button,
  Divider,
  Collapse
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HistoryIcon from '@mui/icons-material/History';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import useTheme from '../../../theme/useTheme';
import apiClient from '../../../services/apiClient';
import { checkOrderStatus, getOrderHistory, retryDnsConfiguration } from '../../../services/domainService';

const OrdersPage = () => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(null);
  const [retryingDns, setRetryingDns] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderHistories, setOrderHistories] = useState({});
  const [loadingHistory, setLoadingHistory] = useState(null);

  const accentColor = theme.colors?.interactive?.default || theme.palette.primary.main;
  const surfaceColor = theme.colors?.bg?.surface || theme.palette.background.paper;

  useEffect(() => {
    loadAllOrders();
  }, []);

  const loadAllOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is admin
      const userResponse = await apiClient.get('/users/me/');
      const isAdmin = userResponse.data.is_staff;
      
      let allOrders = [];
      
      if (isAdmin) {
        // Admin: get ALL orders at once (no site_id filter)
        console.log('[OrdersPage] Loading all orders for admin...');
        const ordersResponse = await apiClient.get('/domains/orders/');
        allOrders = ordersResponse.data;
        
        // Backend already includes site info via serializer
        console.log('[OrdersPage] Admin orders loaded:', allOrders.length);
      } else {
        // Regular user: get orders per site
        console.log('[OrdersPage] Loading orders for regular user...');
        
        const sitesResponse = await apiClient.get('/sites/');
        const sites = Array.isArray(sitesResponse.data) 
          ? sitesResponse.data 
          : sitesResponse.data.results || [];
        
        console.log('[OrdersPage] User sites:', sites.length);
        
        for (const site of sites) {
          try {
            const ordersResponse = await apiClient.get('/domains/orders/', {
              params: { site_id: site.id }
            });
            
            // Add site info to each order
            const ordersWithSite = ordersResponse.data.map(order => ({
              ...order,
              site_name: site.name,
              site_identifier: site.identifier
            }));
            
            allOrders.push(...ordersWithSite);
          } catch (err) {
            console.error(`Failed to load orders for site ${site.id}:`, err);
          }
        }
      }
      
      console.log('[OrdersPage] Total orders:', allOrders.length);
      
      // Sort by creation date (newest first)
      allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setOrders(allOrders);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Nie udało się załadować zamówień. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOrderStatus = async (orderId) => {
    try {
      setCheckingStatus(orderId);
      await checkOrderStatus(orderId);
      
      // Reload orders to get updated status
      await loadAllOrders();
    } catch (err) {
      console.error('Failed to check order status:', err);
      setError('Nie udało się sprawdzić statusu zamówienia.');
    } finally {
      setCheckingStatus(null);
    }
  };

  const handleRetryDns = async (orderId) => {
    try {
      setRetryingDns(orderId);
      await retryDnsConfiguration(orderId);
      
      // Reload orders to get updated status
      await loadAllOrders();
    } catch (err) {
      console.error('Failed to retry DNS configuration:', err);
      setError(err.message || 'Nie udało się ponownie uruchomić konfiguracji DNS.');
    } finally {
      setRetryingDns(null);
    }
  };

  const handleToggleHistory = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setExpandedOrder(orderId);

    // Load history if not already loaded
    if (!orderHistories[orderId]) {
      try {
        setLoadingHistory(orderId);
        const historyData = await getOrderHistory(orderId);
        setOrderHistories(prev => ({
          ...prev,
          [orderId]: historyData.history || []
        }));
      } catch (err) {
        console.error('Failed to load order history:', err);
        setError('Nie udało się załadować historii zamówienia.');
      } finally {
        setLoadingHistory(null);
      }
    }
  };

  const translateStatus = (status) => {
    const translations = {
      'notPaid': 'Trwa tworzenie zamówienia',
      'checking': 'Trwa potwierdzanie płatności',
      'delivering': 'Trwa przygotowywanie Twojego zamówienia',
      'delivered': 'Zamówienie zakończone',
      'validated': 'Płatność zatwierdzona'
    };
    return translations[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'configuring_dns':
        return 'info';
      case 'pending_payment':
        return 'warning';
      default:
        return 'error';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          backgroundColor: surfaceColor,
          borderRadius: '16px',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          p: { xs: 2, sm: 3, md: 4 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: surfaceColor,
        borderRadius: '16px',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        p: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <ShoppingBagOutlinedIcon sx={{ fontSize: 28, color: accentColor }} />
        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
          Twoje Zamówienia
        </Typography>
      </Box>
      
      <Typography variant="body2" sx={{ mb: 4, color: theme.colors?.text?.secondary }}>
        Historia zakupów domen i ich statusy
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: theme.colors?.text?.secondary
          }}
        >
          <ShoppingBagOutlinedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Brak zamówień
          </Typography>
          <Typography variant="body2">
            Nie masz jeszcze żadnych zamówień domenowych
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {orders.map((order, index) => (
            <React.Fragment key={order.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  bgcolor: order.status === 'active' 
                    ? alpha(theme.palette.success.main, 0.05) 
                    : 'background.default',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {order.domain_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.colors?.text?.secondary }}>
                      Dla strony: {order.site_name}
                    </Typography>
                  </Box>
                  <Chip
                    label={order.status_display}
                    size="small"
                    color={getStatusColor(order.status)}
                    icon={order.status === 'active' ? <CheckCircleIcon /> : undefined}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.colors?.text?.secondary, display: 'block' }}>
                      ID Zamówienia
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      #{order.id}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.colors?.text?.secondary, display: 'block' }}>
                      Cena
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {order.price} PLN
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.colors?.text?.secondary, display: 'block' }}>
                      Data zamówienia
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDate(order.created_at)}
                    </Typography>
                  </Box>
                </Box>

                {order.status === 'pending_payment' && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    {order.payment_url && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => window.location.href = order.payment_url}
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: accentColor,
                          '&:hover': {
                            backgroundColor: alpha(accentColor, 0.9)
                          }
                        }}
                      >
                        Dokończ płatność
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={checkingStatus === order.id}
                      onClick={() => handleCheckOrderStatus(order.id)}
                      startIcon={checkingStatus === order.id ? <CircularProgress size={16} /> : null}
                      sx={{
                        borderRadius: '8px',
                        borderColor: accentColor,
                        color: accentColor,
                        '&:hover': {
                          borderColor: accentColor,
                          backgroundColor: alpha(accentColor, 0.08)
                        }
                      }}
                    >
                      {checkingStatus === order.id ? 'Sprawdzam...' : 'Sprawdź status'}
                    </Button>
                  </Box>
                )}

                {order.status === 'configuring_dns' && (
                  <Alert severity="info" sx={{ mt: 2, borderRadius: '8px' }}>
                    Konfiguracja przekierowania domeny w toku... Zazwyczaj zajmuje to 1-2 minuty.
                  </Alert>
                )}

                {order.status === 'active' && (
                  <Alert 
                    severity="success"
                    sx={{ mt: 2, borderRadius: '8px' }}
                  >
                    {order.dns_configuration?.method === 'cloudflare' ? (
                      <>
                        <strong>✓ Domena aktywna i skonfigurowana przez Cloudflare</strong>
                        <Box sx={{ mt: 1, fontSize: '0.875rem' }}>
                          DNS wskazuje na: {order.dns_configuration?.target || 'Google Cloud'}
                          <br />
                          Nameservery: {order.dns_configuration?.nameservers?.join(', ') || 'Cloudflare'}
                          <br />
                          <em style={{ color: 'rgba(0,0,0,0.6)' }}>
                            Propagacja DNS może potrwać 24-48h
                          </em>
                        </Box>
                      </>
                    ) : order.dns_configuration?.method === 'dns_only' ? (
                      <>
                        <strong>⚠️ Domena aktywna - wymagana ręczna konfiguracja DNS</strong>
                        <Box sx={{ mt: 1, fontSize: '0.875rem' }}>
                          {order.dns_configuration?.message || 'Przekierowanie automatyczne nie jest dostępne dla tego typu domeny.'}
                          <br />
                          Aby skonfigurować domenę, skontaktuj się z supportem lub skonfiguruj rekordy DNS ręcznie.
                        </Box>
                      </>
                    ) : (
                      '✓ Domena jest aktywna i przekierowuje odwiedzających'
                    )}
                  </Alert>
                )}

                {order.status === 'dns_error' && order.error_message && (
                  <Alert 
                    severity="error" 
                    sx={{ mt: 2, borderRadius: '8px' }}
                    action={
                      <Button 
                        color="inherit" 
                        size="small"
                        onClick={() => handleRetryDns(order.id)}
                        disabled={retryingDns === order.id}
                      >
                        {retryingDns === order.id ? 'Ponawiam...' : 'Spróbuj ponownie'}
                      </Button>
                    }
                  >
                    Błąd konfiguracji: {order.error_message}
                  </Alert>
                )}

                {/* Order History Timeline */}
                {order.ovh_order_id && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      onClick={() => handleToggleHistory(order.id)}
                      endIcon={expandedOrder === order.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      startIcon={<HistoryIcon />}
                      sx={{
                        color: accentColor,
                        '&:hover': {
                          backgroundColor: alpha(accentColor, 0.08)
                        }
                      }}
                    >
                      {expandedOrder === order.id ? 'Ukryj historię' : 'Pokaż historię zamówienia'}
                    </Button>

                    <Collapse in={expandedOrder === order.id}>
                      <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.divider, 0.05), borderRadius: '8px' }}>
                        {loadingHistory === order.id ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : orderHistories[order.id] && orderHistories[order.id].length > 0 ? (
                          <>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <HistoryIcon fontSize="small" />
                              Historia zamówienia
                            </Typography>
                            <Stack spacing={2}>
                              {orderHistories[order.id].map((historyItem, idx) => (
                                <Box 
                                  key={idx}
                                  sx={{ 
                                    display: 'flex', 
                                    gap: 2,
                                    position: 'relative',
                                    '&:not(:last-child)::before': {
                                      content: '""',
                                      position: 'absolute',
                                      left: '7px',
                                      top: '24px',
                                      bottom: '-16px',
                                      width: '2px',
                                      bgcolor: alpha(accentColor, 0.2)
                                    }
                                  }}
                                >
                                  <Box sx={{ pt: 0.5, zIndex: 1 }}>
                                    <FiberManualRecordIcon 
                                      sx={{ 
                                        fontSize: 16,
                                        color: idx === 0 ? accentColor : theme.palette.text.secondary,
                                        bgcolor: surfaceColor,
                                        borderRadius: '50%'
                                      }} 
                                    />
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: idx === 0 ? 600 : 400, mb: 0.5 }}>
                                      {translateStatus(historyItem.status)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.colors?.text?.secondary }}>
                                      {new Date(historyItem.date).toLocaleString('pl-PL', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                      })}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Stack>
                          </>
                        ) : (
                          <Typography variant="body2" sx={{ color: theme.colors?.text?.secondary, textAlign: 'center', py: 2 }}>
                            Brak historii dla tego zamówienia
                          </Typography>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                )}
              </Paper>
              
              {index < orders.length - 1 && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default OrdersPage;

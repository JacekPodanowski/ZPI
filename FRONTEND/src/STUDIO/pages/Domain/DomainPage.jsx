import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Paper, 
    CircularProgress, 
    TextField, 
    Button, 
    Chip, 
    Alert,
    InputAdornment,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Link,
    Collapse,
    IconButton
} from '@mui/material';
import { 
    Add as AddIcon,
    OpenInNew as OpenInNewIcon,
    ExpandMore as ExpandMoreIcon,
    ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { fetchSiteById } from '../../../services/siteService';
import { getDomainOrders, checkOrderStatus, addDomainWithCloudflare } from '../../../services/domainService';
import REAL_DefaultLayout from '../../layouts/REAL_DefaultLayout';
import { getSiteUrlDisplay } from '../../../utils/siteUrlUtils';

const DomainPage = () => {
    const { siteId } = useParams();
    const navigate = useNavigate();
    const [site, setSite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Domain orders state
    const [domainOrders, setDomainOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    
    // Status checking
    const [searchError, setSearchError] = useState(null);
    const [returnedFromPayment, setReturnedFromPayment] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(null); // order ID being checked
    
    // Add domain state
    const [newDomainName, setNewDomainName] = useState('');
    const [addingDomain, setAddingDomain] = useState(false);
    
    // Collapse state for nameserver instructions
    const [expandedOrders, setExpandedOrders] = useState({});

    useEffect(() => {
        const loadSite = async () => {
            if (!siteId) {
                // No siteId provided, skip loading site
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                const data = await fetchSiteById(siteId);
                setSite(data);
            } catch (err) {
                console.error('Failed to load site:', err);
                setError('Failed to load site. You may not have access to this site.');
            } finally {
                setLoading(false);
            }
        };

        loadSite();
    }, [siteId]);
    
    useEffect(() => {
        const loadDomainOrders = async () => {
            try {
                setLoadingOrders(true);
                const orders = await getDomainOrders(siteId ? parseInt(siteId) : null);
                setDomainOrders(orders);
                return orders || [];
            } catch (err) {
                console.error('Failed to load domain orders:', err);
                return [];
            } finally {
                setLoadingOrders(false);
            }
        };

        loadDomainOrders();
        
        // Auto-refresh orders every 10 seconds if any are in progress
        const interval = setInterval(async () => {
            const orders = await loadDomainOrders();
            if (orders && orders.length > 0) {
                const hasOrdersInProgress = orders.some(order => 
                    order.status === 'pending_payment' || order.status === 'configuring_dns'
                );
                
                if (hasOrdersInProgress) {
                    console.log('[DomainPage] Auto-refreshing orders (in progress detected)');
                } else {
                    // No orders in progress, stop auto-refresh
                    clearInterval(interval);
                }
            }
        }, 10000); // 10 seconds
        
        return () => clearInterval(interval);
    }, [siteId]); // Remove domainOrders from dependencies
    
    // Check if user just returned from OVH payment
    useEffect(() => {
        const storedSiteId = localStorage.getItem('domain_purchase_site_id');
        const storedOrderId = localStorage.getItem('domain_purchase_order_id');
        
        if (storedSiteId && storedOrderId && storedSiteId === siteId) {
            setReturnedFromPayment(true);
            
            // Clear localStorage
            localStorage.removeItem('domain_purchase_site_id');
            localStorage.removeItem('domain_purchase_order_id');
            
            // Hide message after 10 seconds
            setTimeout(() => {
                setReturnedFromPayment(false);
            }, 10000);
        }
    }, [siteId]);

    const handleAddDomain = async () => {
        if (!newDomainName.trim()) {
            setSearchError('Please enter a domain name');
            return;
        }
        
        console.log('[DomainPage] Adding domain to Cloudflare:', newDomainName);
        
        try {
            setAddingDomain(true);
            setSearchError(null);
            const response = await addDomainWithCloudflare(newDomainName.trim(), siteId ? parseInt(siteId) : null);
            
            console.log('[DomainPage] Domain added to Cloudflare:', response);
            
            // Reload orders to show the new domain
            const orders = await getDomainOrders(parseInt(siteId));
            setDomainOrders(orders);
            
            // Clear the input
            setNewDomainName('');
            
        } catch (err) {
            console.error('[DomainPage] Failed to add domain:', err);
            setSearchError(err.message || 'Failed to add domain to Cloudflare');
        } finally {
            setAddingDomain(false);
        }
    };
    
    const handleCheckOrderStatus = async (orderId) => {
        try {
            setCheckingStatus(orderId);
            console.log('[DomainPage] Checking order status:', orderId);
            
            const result = await checkOrderStatus(orderId);
            console.log('[DomainPage] Status check result:', result);
            
            // Reload orders to get updated status
            const orders = await getDomainOrders(parseInt(siteId));
            setDomainOrders(orders);
            
            // Show success message if DNS configuration was triggered
            if (result.dns_configuration_triggered) {
                setSearchError(null);
                // You could add a success snackbar here
            }
        } catch (err) {
            console.error('[DomainPage] Failed to check order status:', err);
            setSearchError(err.message || 'Failed to check order status');
        } finally {
            setCheckingStatus(null);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <REAL_DefaultLayout
                title="Error"
                subtitle="Unable to load domain settings"
            >
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" color="error" gutterBottom>
                        {error}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Please check the URL and try again.
                    </Typography>
                </Paper>
            </REAL_DefaultLayout>
        );
    }

    return (
        <REAL_DefaultLayout
            title="Mam domenę"
            subtitle={site ? `Dodaj własną domenę do ${site.name}` : "Dodaj i skonfiguruj własną domenę"}
        >
            {/* Site URL and Add Domain Button - Only show if site is loaded */}
            {site && (
                <Paper
                    sx={{
                        p: 3,
                        mb: 3,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2
                    }}
                >
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Current Site URL
                        </Typography>
                        <Link
                            href={`https://${getSiteUrlDisplay(site)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                color: 'primary.main',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            {getSiteUrlDisplay(site)}
                            <OpenInNewIcon sx={{ fontSize: 18 }} />
                        </Link>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => {
                            if (siteId) {
                                navigate(`/studio/${siteId}/domain/buy`);
                            } else {
                                navigate('/studio/domain/buy');
                            }
                        }}
                        sx={{
                            bgcolor: 'primary.main',
                            color: '#fff',
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            }
                        }}
                    >
                        Kup domenę
                    </Button>
                </Paper>
            )}

            {/* Payment Return Notification */}
            {returnedFromPayment && (
                <Alert 
                    severity="info" 
                    sx={{ mb: 3 }}
                    onClose={() => setReturnedFromPayment(false)}
                >
                    Thank you for your payment! Your domain order is being processed. 
                    Check the "Your Domain Orders" section below for status updates.
                </Alert>
            )}
            
            {/* Domain Orders Section */}
            {domainOrders.length > 0 && (
                <Paper
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                    }}
                >
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Your Domain Orders
                    </Typography>
                    {domainOrders.map((order) => (
                        <Box
                            key={order.id}
                            sx={{
                                p: 2,
                                mb: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                bgcolor: order.status === 'active' ? 'success.50' : 'background.default'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {order.domain_name}
                                </Typography>
                                <Chip
                                    label={order.status_display}
                                    size="small"
                                    color={
                                        order.status === 'active' ? 'success' :
                                        order.status === 'configuring_dns' ? 'info' :
                                        order.status === 'pending_payment' ? 'warning' :
                                        order.status === 'pending' ? 'warning' :
                                        order.status === 'free' ? 'default' :
                                        'error'
                                    }
                                    icon={order.status === 'pending' || order.status === 'free' ? <Box component="span">⏳</Box> : undefined}
                                />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Order ID: {order.id} | Price: {order.price} PLN
                            </Typography>
                            
                            {/* Display nameservers for pending/free domains */}
                            {(order.status === 'pending' || order.status === 'free') && order.cloudflare_nameservers && order.cloudflare_nameservers.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="warning"
                                        onClick={() => setExpandedOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                                        endIcon={
                                            <ExpandMoreIcon
                                                sx={{
                                                    transform: expandedOrders[order.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.3s'
                                                }}
                                            />
                                        }
                                        sx={{
                                            justifyContent: 'space-between',
                                            textTransform: 'none',
                                            borderColor: 'warning.main',
                                            color: 'warning.dark',
                                            '&:hover': {
                                                borderColor: 'warning.dark',
                                                bgcolor: 'warning.50'
                                            }
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            ⚠️ Konfiguracja nameserverów
                                        </Typography>
                                    </Button>
                                    
                                    <Collapse in={expandedOrders[order.id]} timeout="auto">
                                        <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.50', borderRadius: 1, border: '1px solid', borderColor: 'warning.main' }}>
                                            <Alert severity="warning" sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    ⚠️ Ustaw nameservery u rejestratora
                                                </Typography>
                                            </Alert>
                                            
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                                Nameservery Cloudflare:
                                            </Typography>
                                            <Box sx={{ 
                                                bgcolor: 'white', 
                                                p: 1.5, 
                                                borderRadius: 1,
                                                fontFamily: 'monospace',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                mb: 2
                                            }}>
                                                {order.cloudflare_nameservers.map((ns, index) => (
                                                    <Typography 
                                                        key={index} 
                                                        variant="body2" 
                                                        sx={{ 
                                                            mb: index < order.cloudflare_nameservers.length - 1 ? 0.5 : 0,
                                                            fontFamily: 'monospace',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {ns}
                                                    </Typography>
                                                ))}
                                            </Box>
                                            
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                • Jeśli <strong>nie zmieniłeś</strong> nameserverów - zmień je u rejestratora na powyższe wartości.
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                • Jeśli <strong>już zmieniłeś</strong> - nie rób nic, propagacja trwa do 48 godzin.
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                                Jeśli po 2 dniach status się nie zmieni, skontaktuj się z pomocą techniczną.
                                            </Typography>
                                        </Box>
                                    </Collapse>
                                </Box>
                            )}
                            
                            {order.status === 'pending_payment' && (
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    {order.payment_url && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => window.location.href = order.payment_url}
                                        >
                                            Complete Payment
                                        </Button>
                                    )}
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        disabled={checkingStatus === order.id}
                                        onClick={() => handleCheckOrderStatus(order.id)}
                                        startIcon={checkingStatus === order.id ? <CircularProgress size={16} /> : null}
                                    >
                                        {checkingStatus === order.id ? 'Checking...' : 'Check Status'}
                                    </Button>
                                </Box>
                            )}
                            {order.status === 'configuring_dns' && (
                                <Alert severity="info" sx={{ mt: 1, py: 0.5 }}>
                                    Configuring domain redirect... This usually takes 1-2 minutes.
                                </Alert>
                            )}
                            {order.status === 'active' && (
                                <Alert severity="success" sx={{ mt: 1, py: 0.5 }}>
                                    ✓ Domain is active and redirecting visitors
                                </Alert>
                            )}
                        </Box>
                    ))}
                </Paper>
            )}
            
            {/* Add Domain to Cloudflare */}
            <Paper
                sx={{
                    p: 4,
                    mb: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
            >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Dodaj swoją domenę
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Masz już domenę? Dodaj ją tutaj, aby skonfigurować przekierowanie na Twoją stronę.
                </Typography>
                <Typography variant="body2" color="primary" sx={{ mb: 3, fontWeight: 600 }}>
                    💡 Nie masz domeny? <Link href="/studio/domain/buy" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Kup domenę tutaj</Link>
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Wpisz swoją domenę (np. mojastrona.com)"
                        value={newDomainName}
                        onChange={(e) => setNewDomainName(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleAddDomain();
                            }
                        }}
                        disabled={addingDomain}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleAddDomain}
                        disabled={addingDomain || !newDomainName.trim()}
                        sx={{
                            minWidth: 140,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            bgcolor: 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            }
                        }}
                    >
                        {addingDomain ? <CircularProgress size={24} /> : 'Dodaj domenę'}
                    </Button>
                </Box>
                
                {searchError && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {searchError}
                    </Alert>
                )}
            </Paper>
        </REAL_DefaultLayout>
    );
};

export default DomainPage;

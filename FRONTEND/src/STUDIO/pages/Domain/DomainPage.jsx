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
    DialogActions
} from '@mui/material';
import { 
    Search as SearchIcon, 
    CheckCircle as CheckCircleIcon,
    ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSiteById } from '../../../services/siteService';
import { checkDomainAvailability, purchaseDomain, getDomainOrders, checkOrderStatus } from '../../../services/domainService';
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
    
    // Domain search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [domainResults, setDomainResults] = useState([]);
    
    // Purchase state
    const [purchasing, setPurchasing] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [returnedFromPayment, setReturnedFromPayment] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(null); // order ID being checked

    useEffect(() => {
        const loadSite = async () => {
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

        if (siteId) {
            loadSite();
        }
    }, [siteId]);
    
    useEffect(() => {
        const loadDomainOrders = async () => {
            if (!siteId) return;
            
            try {
                setLoadingOrders(true);
                const orders = await getDomainOrders(parseInt(siteId));
                setDomainOrders(orders);
                return orders;
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
            const hasOrdersInProgress = orders.some(order => 
                order.status === 'pending_payment' || order.status === 'configuring_dns'
            );
            
            if (hasOrdersInProgress) {
                console.log('[DomainPage] Auto-refreshing orders (in progress detected)');
            } else {
                // No orders in progress, stop auto-refresh
                clearInterval(interval);
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

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchError('Please enter a domain name');
            return;
        }

        // Remove any TLD if user entered it
        const cleanQuery = searchQuery.trim().toLowerCase().replace(/\.(com|pl|io|net|app|store|online)$/i, '');

        console.log('[DomainPage] Starting domain search for:', cleanQuery);

        try {
            setSearching(true);
            setSearchError(null);
            setDomainResults([]);

            const results = await checkDomainAvailability(cleanQuery);
            console.log('[DomainPage] Search results:', results);
            
            // Sort: available first (by price), then unavailable (alphabetically)
            const sortedResults = results.sort((a, b) => {
                if (a.available && !b.available) return -1;
                if (!a.available && b.available) return 1;
                if (a.available && b.available) {
                    return parseFloat(a.price) - parseFloat(b.price);
                }
                return a.domain.localeCompare(b.domain);
            });
            
            console.log('[DomainPage] Sorted results:', sortedResults);
            setDomainResults(sortedResults);

            const availableCount = sortedResults.filter(d => d.available).length;
            if (availableCount === 0) {
                setSearchError('No available domains found. Try a different name.');
            }
        } catch (err) {
            console.error('[DomainPage] Domain search failed:', err);
            console.error('[DomainPage] Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            
            // Handle specific error types
            if (err.response?.status === 403) {
                setSearchError(
                    'Domain service configuration error: ' + 
                    (err.response?.data?.detail || 'API credentials do not have required permissions. Please contact support.')
                );
            } else if (err.response?.status === 503) {
                setSearchError(
                    'Domain service temporarily unavailable. ' + 
                    (err.response?.data?.detail || 'Please try again later or contact support.')
                );
            } else {
                setSearchError(err.message || 'Failed to search domains. Please try again.');
            }
        } finally {
            setSearching(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    
    const handlePurchaseClick = (domain) => {
        setSelectedDomain(domain);
        setConfirmDialogOpen(true);
    };
    
    const handleConfirmPurchase = async () => {
        if (!selectedDomain) return;
        
        console.log('[DomainPage] Purchasing domain:', selectedDomain.domain);
        
        try {
            setPurchasing(true);
            const response = await purchaseDomain(selectedDomain.domain, parseInt(siteId));
            
            console.log('[DomainPage] Purchase initiated:', response);
            
            // Store site_id in localStorage so we can navigate back after OVH payment
            localStorage.setItem('domain_purchase_site_id', siteId);
            localStorage.setItem('domain_purchase_order_id', response.order_id);
            
            // Redirect to payment URL (mock or real)
            if (response.payment_url) {
                window.location.href = response.payment_url;
            } else {
                // Fallback: redirect to success page directly
                navigate(`/studio/domain-purchase-success?orderId=${response.order_id}`);
            }
        } catch (err) {
            console.error('[DomainPage] Purchase failed:', err);
            setSearchError(err.message || 'Failed to initiate purchase. Please try again.');
            setConfirmDialogOpen(false);
        } finally {
            setPurchasing(false);
        }
    };
    
    const handleCancelPurchase = () => {
        setConfirmDialogOpen(false);
        setSelectedDomain(null);
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

    if (error || !site) {
        return (
            <REAL_DefaultLayout
                title="Error"
                subtitle="Unable to load domain settings"
            >
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" color="error" gutterBottom>
                        {error || 'Site not found'}
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
            title="Domain Management"
            subtitle={`Search and purchase a custom domain for ${site.name}`}
        >
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
                                        'error'
                                    }
                                />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Order ID: {order.id} | Price: {order.price} PLN
                            </Typography>
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
            
            {/* Current Domain Display */}
            <Paper
                sx={{
                    p: 3,
                    mb: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
            >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current URL:
                </Typography>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        fontFamily: 'monospace',
                        color: 'primary.main',
                        fontWeight: 600,
                        mb: 1
                    }}
                >
                    {getSiteUrlDisplay(site.identifier)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Production URL: {site.identifier}.youreasysite.com
                </Typography>
            </Paper>

            {/* Domain Search */}
            <Paper
                sx={{
                    p: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
            >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    Search Available Domains
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Enter your desired domain name (without extension). We'll check availability across multiple TLDs.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Enter domain name (e.g., mybusiness)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={searching}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSearch}
                        disabled={searching || !searchQuery.trim()}
                        sx={{
                            minWidth: 120,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600
                        }}
                    >
                        {searching ? <CircularProgress size={24} /> : 'Search'}
                    </Button>
                </Box>

                {searchError && (
                    <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                        {searchError}
                    </Alert>
                )}

                {/* Domain Results */}
                <AnimatePresence>
                    {domainResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
                                Domain Results ({domainResults.filter(d => d.available).length} available, {domainResults.filter(d => !d.available).length} taken)
                            </Typography>
                            <Grid container spacing={2}>
                                {domainResults.map((domain, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={domain.domain}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <Paper
                                                sx={{
                                                    p: 3,
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 2,
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: domain.available ? 'divider' : 'error.light',
                                                    opacity: domain.available ? 1 : 0.7,
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    ...(!domain.available && {
                                                        backgroundColor: (theme) => theme.palette.mode === 'light' 
                                                            ? 'rgba(211, 47, 47, 0.05)' 
                                                            : 'rgba(211, 47, 47, 0.1)'
                                                    }),
                                                    ...(domain.available && {
                                                        '&:hover': {
                                                            boxShadow: '0 8px 30px rgba(146, 0, 32, 0.15)',
                                                            transform: 'translateY(-4px)',
                                                            borderColor: 'primary.main'
                                                        }
                                                    })
                                                }}
                                            >
                                                <Box>
                                                    <Typography 
                                                        variant="h6" 
                                                        sx={{ 
                                                            fontWeight: 700,
                                                            fontSize: '1.1rem',
                                                            mb: 1,
                                                            wordBreak: 'break-all'
                                                        }}
                                                    >
                                                        {domain.domain}
                                                    </Typography>
                                                    <Chip
                                                        icon={domain.available ? <CheckCircleIcon /> : <Box component="span" sx={{ fontSize: '1rem' }}>✕</Box>}
                                                        label={domain.available ? "Available" : "Taken"}
                                                        color={domain.available ? "success" : "error"}
                                                        size="small"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </Box>

                                                <Box sx={{ flex: 1 }}>
                                                    {domain.available ? (
                                                        <>
                                                            <Typography 
                                                                variant="h4" 
                                                                color="primary" 
                                                                sx={{ fontWeight: 700, mb: 0.5 }}
                                                            >
                                                                {domain.price} {domain.currency || 'PLN'}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Registration
                                                            </Typography>
                                                            {domain.renewalPrice && (
                                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                                    Renewal: {domain.renewalPrice} {domain.currency || 'PLN'}/year
                                                                </Typography>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Typography 
                                                                variant="h5" 
                                                                color="error" 
                                                                sx={{ fontWeight: 700, mb: 0.5 }}
                                                            >
                                                                Registered
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                This domain is taken
                                                            </Typography>
                                                            {domain.expiryDate && (
                                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                                    Expires: {domain.expiryDate}
                                                                </Typography>
                                                            )}
                                                        </>
                                                    )}
                                                </Box>

                                                {domain.available && (
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        startIcon={<ShoppingCartIcon />}
                                                        onClick={() => handlePurchaseClick(domain)}
                                                        disabled={purchasing}
                                                        sx={{
                                                            borderRadius: 2,
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            py: 1.5
                                                        }}
                                                    >
                                                        {purchasing && selectedDomain?.domain === domain.domain ? (
                                                            <CircularProgress size={24} color="inherit" />
                                                        ) : (
                                                            'Buy Now'
                                                        )}
                                                    </Button>
                                                )}
                                            </Paper>
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Paper>
            
            {/* Purchase Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleCancelPurchase}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 2,
                        maxWidth: 500
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
                    Confirm Domain Purchase
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You are about to purchase the domain <strong>{selectedDomain?.domain}</strong> for <strong>{selectedDomain?.price} {selectedDomain?.currency || 'PLN'}</strong>.
                    </DialogContentText>
                    <DialogContentText sx={{ mt: 2 }}>
                        After clicking "Proceed to Payment", you will be redirected to complete the purchase.
                    </DialogContentText>
                    <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                        <Typography variant="body2">
                            <strong>Note:</strong> This is a demo version. In production, you would be redirected to a secure payment gateway.
                        </Typography>
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={handleCancelPurchase}
                        disabled={purchasing}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmPurchase}
                        variant="contained"
                        disabled={purchasing}
                        sx={{ 
                            textTransform: 'none', 
                            fontWeight: 600,
                            minWidth: 160
                        }}
                    >
                        {purchasing ? <CircularProgress size={24} color="inherit" /> : 'Proceed to Payment'}
                    </Button>
                </DialogActions>
            </Dialog>
        </REAL_DefaultLayout>
    );
};

export default DomainPage;

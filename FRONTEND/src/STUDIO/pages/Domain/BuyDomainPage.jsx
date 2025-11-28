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
} from '@mui/material';
import { 
    Search as SearchIcon, 
    CheckCircle as CheckCircleIcon,
    ShoppingCart as ShoppingCartIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { checkDomainAvailability, purchaseDomain } from '../../../services/domainService';
import REAL_DefaultLayout from '../../layouts/REAL_DefaultLayout';

const BuyDomainPage = () => {
    const { siteId } = useParams();
    const navigate = useNavigate();
    
    // Domain search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [domainResults, setDomainResults] = useState([]);
    
    // Purchase state
    const [purchasing, setPurchasing] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchError('Please enter a domain name');
            return;
        }

        // Remove any TLD if user entered it
        const cleanQuery = searchQuery.trim().toLowerCase().replace(/\.(com|pl|io|net|app|store|online)$/i, '');

        try {
            setSearching(true);
            setSearchError(null);
            setDomainResults([]);

            const results = await checkDomainAvailability(cleanQuery);
            
            // Sort: available first (by price), then unavailable (alphabetically)
            const sortedResults = results.sort((a, b) => {
                if (a.available && !b.available) return -1;
                if (!a.available && b.available) return 1;
                if (a.available && b.available) {
                    return parseFloat(a.price) - parseFloat(b.price);
                }
                return a.domain.localeCompare(b.domain);
            });
            
            setDomainResults(sortedResults);

            const availableCount = sortedResults.filter(d => d.available).length;
            if (availableCount === 0) {
                setSearchError('No available domains found. Try a different name.');
            }
        } catch (err) {
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
        
        try {
            setPurchasing(true);
            const response = await purchaseDomain(selectedDomain.domain, siteId ? parseInt(siteId) : null);
            
            // Store site_id in localStorage so we can navigate back after payment
            if (siteId) {
                localStorage.setItem('domain_purchase_site_id', siteId);
            }
            localStorage.setItem('domain_purchase_order_id', response.order_id);
            
            // Redirect to payment URL (mock or real)
            if (response.payment_url) {
                window.location.href = response.payment_url;
            } else {
                // Fallback: redirect to success page directly
                navigate(`/studio/domain-purchase-success?orderId=${response.order_id}`);
            }
        } catch (err) {
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

    const handleBackToDomain = () => {
        if (siteId) {
            navigate(`/studio/${siteId}/domain`);
        } else {
            navigate('/studio/domain');
        }
    };

    return (
        <REAL_DefaultLayout
            title="Kup domenę"
            subtitle="Wyszukaj i kup nową domenę dla swojej strony"
        >
            {/* Back button */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBackToDomain}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: 'text.secondary',
                        '&:hover': {
                            color: 'primary.main',
                            bgcolor: 'transparent'
                        }
                    }}
                >
                    Powrót do zarządzania domenami
                </Button>
            </Box>

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
                    Wyszukaj dostępne domeny
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Wprowadź pożądaną nazwę domeny (bez rozszerzenia). Sprawdzimy dostępność dla różnych rozszerzeń.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Wpisz nazwę domeny (np. mojafirma)"
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
                        {searching ? <CircularProgress size={24} /> : 'Szukaj'}
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
                                Wyniki wyszukiwania ({domainResults.filter(d => d.available).length} dostępne, {domainResults.filter(d => !d.available).length} zajęte)
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
                                                        label={domain.available ? "Dostępna" : "Zajęta"}
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
                                                                Rejestracja
                                                            </Typography>
                                                            {domain.renewalPrice && (
                                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                                    Odnowienie: {domain.renewalPrice} {domain.currency || 'PLN'}/rok
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
                                                                Zarejestrowana
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Ta domena jest zajęta
                                                            </Typography>
                                                            {domain.expiryDate && (
                                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                                    Wygasa: {domain.expiryDate}
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
                                                            'Kup teraz'
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
                    Potwierdź zakup domeny
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Zamierzasz kupić domenę <strong>{selectedDomain?.domain}</strong> za <strong>{selectedDomain?.price} {selectedDomain?.currency || 'PLN'}</strong>.
                    </DialogContentText>
                    <DialogContentText sx={{ mt: 2 }}>
                        Po kliknięciu "Przejdź do płatności" zostaniesz przekierowany do finalizacji zakupu.
                    </DialogContentText>
                    <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                        <Typography variant="body2">
                            <strong>Uwaga:</strong> To jest wersja demo. W wersji produkcyjnej zostaniesz przekierowany do bezpiecznej bramki płatności.
                        </Typography>
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={handleCancelPurchase}
                        disabled={purchasing}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Anuluj
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
                        {purchasing ? <CircularProgress size={24} color="inherit" /> : 'Przejdź do płatności'}
                    </Button>
                </DialogActions>
            </Dialog>
        </REAL_DefaultLayout>
    );
};

export default BuyDomainPage;

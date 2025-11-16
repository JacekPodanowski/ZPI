import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
    Grid
} from '@mui/material';
import { 
    Search as SearchIcon, 
    CheckCircle as CheckCircleIcon,
    OpenInNew as OpenInNewIcon 
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchSiteById } from '../../../services/siteService';
import { checkDomainAvailability } from '../../../services/domainService';
import REAL_DefaultLayout from '../../layouts/REAL_DefaultLayout';

const DomainPage = () => {
    const { siteId } = useParams();
    const [site, setSite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Domain search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [domainResults, setDomainResults] = useState([]);

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
            setSearchError(err.message || 'Failed to search domains. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
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
                        fontWeight: 600
                    }}
                >
                    {site.identifier}.youreasysite.com
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
                                                                ${domain.price}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Registration
                                                            </Typography>
                                                            {domain.renewalPrice && (
                                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                                    Renewal: ${domain.renewalPrice}/year
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
                                                        endIcon={<OpenInNewIcon />}
                                                        href={domain.purchaseUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{
                                                            borderRadius: 2,
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            py: 1.5
                                                        }}
                                                    >
                                                        Buy Now
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
        </REAL_DefaultLayout>
    );
};

export default DomainPage;

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
    Grid2 as Grid
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
        const cleanQuery = searchQuery.trim().toLowerCase().replace(/\.(com|pl|io|net|dev|app|tech|store|online)$/i, '');

        try {
            setSearching(true);
            setSearchError(null);
            setDomainResults([]);

            const results = await checkDomainAvailability(cleanQuery);
            
            // Filter only available domains and sort by price
            const available = results
                .filter(domain => domain.available)
                .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            
            setDomainResults(available);

            if (available.length === 0) {
                setSearchError('No available domains found. Try a different name.');
            }
        } catch (err) {
            console.error('Domain search failed:', err);
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
                                Available Domains ({domainResults.length})
                            </Typography>
                            <Grid container spacing={2}>
                                {domainResults.map((domain, index) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={domain.domain}>
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
                                                    borderColor: 'divider',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        boxShadow: '0 8px 30px rgba(146, 0, 32, 0.15)',
                                                        transform: 'translateY(-4px)',
                                                        borderColor: 'primary.main'
                                                    }
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
                                                        icon={<CheckCircleIcon />}
                                                        label="Available"
                                                        color="success"
                                                        size="small"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </Box>

                                                <Box sx={{ flex: 1 }}>
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
                                                </Box>

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

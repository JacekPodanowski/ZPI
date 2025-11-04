import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Stack,
    Alert,
    Chip,
    IconButton,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save as SaveIcon,
    History as HistoryIcon,
    Visibility as VisibilityIcon,
    Code as CodeIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import apiClient from '../../../services/apiClient';
import useTheme from '../../../theme/useTheme';

const TermsAdminPage = () => {
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [content, setContent] = useState('');
    const [newVersion, setNewVersion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'preview'
    const theme = useTheme();

    // Załaduj wszystkie wersje regulaminu
    const loadVersions = async () => {
        try {
            const response = await apiClient.get('/terms/all/');
            const allVersions = response.data;
            setVersions(allVersions);
            
            // Automatycznie załaduj najnowszą wersję (pomijając 0.0)
            const nonZeroVersions = allVersions.filter(v => v.version !== '0.0');
            if (nonZeroVersions.length > 0) {
                loadVersion(nonZeroVersions[0]);
            }
        } catch (err) {
            setError('Nie udało się załadować wersji regulaminu');
            console.error(err);
        }
    };

    // Załaduj konkretną wersję
    const loadVersion = (version) => {
        setSelectedVersion(version);
        setContent(version.content_md);
        setViewMode('edit');
        // Sugeruj następną wersję
        const currentVersionNum = parseFloat(version.version);
        if (!isNaN(currentVersionNum)) {
            setNewVersion((currentVersionNum + 0.1).toFixed(1));
        }
    };

    // Zapisz jako nową wersję
    const saveAsNewVersion = async () => {
        if (!newVersion.trim()) {
            setError('Podaj numer wersji');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await apiClient.post('/terms/create/', {
                version: newVersion,
                content_md: content,
            });

            setSuccess(`Zapisano nową wersję regulaminu: ${newVersion}`);
            await loadVersions(); // Przeładuj listę
        } catch (err) {
            setError(err.response?.data?.detail || 'Nie udało się zapisać regulaminu');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVersions();
    }, []);

    const isLatestVersion = selectedVersion && versions[0]?.id === selectedVersion.id;
    const syntaxTheme = theme.mode === 'dark' ? vscDarkPlus : vs;

    return (
        <Box
            sx={{
                height: 'calc(100vh - 60px)',
                background: (theme) => theme.palette.mode === 'light'
                    ? 'linear-gradient(180deg, rgba(228, 229, 218, 0.4) 0%, rgba(228, 229, 218, 1) 100%)'
                    : 'linear-gradient(180deg, rgba(12, 12, 12, 0.4) 0%, rgba(12, 12, 12, 1) 100%)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            <Box 
                sx={{ 
                    maxWidth: 1600, 
                    mx: 'auto',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    py: { xs: 2, md: 3 },
                    px: { xs: 2, md: 4, lg: 6 }
                }}
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 600,
                            letterSpacing: '-0.02em',
                            background: (theme) => theme.palette.mode === 'light'
                                ? 'linear-gradient(135deg, rgb(146, 0, 32) 0%, rgb(30, 30, 30) 100%)'
                                : 'linear-gradient(135deg, rgb(114, 0, 21) 0%, rgb(220, 220, 220) 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 0.5
                        }}
                    >
                        Terms of Service
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                        Manage and version your Terms of Service documents
                    </Typography>
                </motion.div>

                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

                <Stack 
                    direction={{ xs: 'column', lg: 'row' }} 
                    spacing={3}
                    sx={{ 
                        flex: 1,
                        minHeight: 0,
                        overflow: 'hidden'
                    }}
                >
                    {/* Lista wersji */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        style={{ 
                            width: '100%', 
                            maxWidth: '320px',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0
                        }}
                    >
                        <Card 
                            elevation={0} 
                            sx={{ 
                                borderRadius: 4, 
                                border: '1px solid rgba(160, 0, 22, 0.14)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <HistoryIcon sx={{ color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Versions
                                    </Typography>
                                </Stack>
                                <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                                    <List sx={{ py: 0 }}>
                                        {versions.filter(v => v.version !== '0.0').map((version, index) => (
                                            <ListItem key={version.id} disablePadding>
                                                <ListItemButton
                                                    selected={selectedVersion?.id === version.id}
                                                    onClick={() => loadVersion(version)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        mb: 0.5,
                                                        '&.Mui-selected': {
                                                            bgcolor: 'rgba(160, 0, 22, 0.08)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(160, 0, 22, 0.12)'
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    v{version.version}
                                                                </Typography>
                                                                {index === 0 && (
                                                                    <Chip label="Latest" size="small" color="primary" />
                                                                )}
                                                            </Stack>
                                                        }
                                                        secondary={new Date(version.published_at).toLocaleDateString('pl-PL')}
                                                        secondaryTypographyProps={{ variant: 'caption' }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                        {versions.filter(v => v.version !== '0.0').length === 0 && (
                                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                                No versions yet
                                            </Typography>
                                        )}
                                    </List>
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Edytor */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        style={{ 
                            flex: 1, 
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0
                        }}
                    >
                        <Card 
                            elevation={0} 
                            sx={{ 
                                borderRadius: 4, 
                                border: '1px solid rgba(160, 0, 22, 0.14)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                {selectedVersion ? (
                                    <>
                                        <Stack 
                                            direction="row" 
                                            justifyContent="space-between" 
                                            alignItems="center" 
                                            sx={{ mb: 2 }}
                                            flexWrap="wrap"
                                            gap={2}
                                        >
                                            <ToggleButtonGroup
                                                value={viewMode}
                                                exclusive
                                                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                                                size="small"
                                            >
                                                <ToggleButton value="edit">
                                                    <CodeIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                                    Code
                                                </ToggleButton>
                                                <ToggleButton value="preview">
                                                    <VisibilityIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                                    Preview
                                                </ToggleButton>
                                            </ToggleButtonGroup>

                                            {isLatestVersion && (
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                                        New Version:
                                                    </Typography>
                                                    <TextField
                                                        value={newVersion}
                                                        onChange={(e) => setNewVersion(e.target.value)}
                                                        size="small"
                                                        sx={{ 
                                                            width: 100,
                                                            '& .MuiOutlinedInput-root': {
                                                                '& fieldset': {
                                                                    borderColor: 'transparent',
                                                                    transition: 'border-color 0.2s'
                                                                },
                                                                '&:hover fieldset': {
                                                                    borderColor: 'rgba(160, 0, 22, 0.3)'
                                                                },
                                                                '&.Mui-focused fieldset': {
                                                                    borderColor: 'primary.main'
                                                                }
                                                            }
                                                        }}
                                                        placeholder="2.0"
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<SaveIcon />}
                                                        onClick={saveAsNewVersion}
                                                        disabled={loading || !content.trim() || !newVersion.trim()}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'primary.main',
                                                            borderRadius: 2,
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            boxShadow: '0 2px 8px rgba(146, 0, 32, 0.2)',
                                                            '&:hover': {
                                                                boxShadow: '0 4px 12px rgba(146, 0, 32, 0.3)'
                                                            }
                                                        }}
                                                    >
                                                        {loading ? 'Saving...' : 'Save'}
                                                    </Button>
                                                </Stack>
                                            )}
                                        </Stack>

                                        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                            {viewMode === 'edit' ? (
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                    disabled={!isLatestVersion}
                                                    placeholder="Enter your Terms of Service in Markdown format..."
                                                    inputProps={{
                                                        spellCheck: false,
                                                        autoComplete: 'off',
                                                        autoCorrect: 'off',
                                                        autoCapitalize: 'off',
                                                        style: {
                                                            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                                            fontSize: '14px',
                                                            lineHeight: '1.6',
                                                            whiteSpace: 'pre',
                                                            overflowWrap: 'normal',
                                                        }
                                                    }}
                                                    sx={{
                                                        flex: 1,
                                                        minHeight: 0,
                                                        '& .MuiInputBase-root': {
                                                            bgcolor: theme.mode === 'dark' ? 'rgba(30, 30, 30, 0.6)' : 'rgba(250, 250, 250, 0.8)',
                                                            padding: '16px',
                                                            height: '100%',
                                                            alignItems: 'flex-start',
                                                            borderRadius: 2,
                                                            border: '1px solid',
                                                            borderColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                                        },
                                                        '& .MuiInputBase-input': {
                                                            color: theme.mode === 'dark' ? '#e0e0e0' : '#1a1a1a',
                                                            overflow: 'auto',
                                                            '&::selection': {
                                                                backgroundColor: 'rgba(160, 0, 22, 0.3)'
                                                            }
                                                        },
                                                        '& fieldset': {
                                                            border: 'none'
                                                        },
                                                        '& .MuiInputBase-input:disabled': {
                                                            WebkitTextFillColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <Box 
                                                    sx={{ 
                                                        flex: 1,
                                                        minHeight: 0,
                                                        overflow: 'auto',
                                                        p: 3,
                                                        bgcolor: theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                                        borderRadius: 2,
                                                        '& h1': { fontSize: '2rem', fontWeight: 600, mb: 2, mt: 3 },
                                                        '& h2': { fontSize: '1.5rem', fontWeight: 600, mb: 1.5, mt: 2.5 },
                                                        '& h3': { fontSize: '1.25rem', fontWeight: 600, mb: 1, mt: 2 },
                                                        '& p': { mb: 1.5, lineHeight: 1.7 },
                                                        '& ul, & ol': { mb: 1.5, pl: 3 },
                                                        '& li': { mb: 0.5 },
                                                        '& code': { 
                                                            bgcolor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 1,
                                                            fontSize: '0.9em'
                                                        }
                                                    }}
                                                >
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {content}
                                                    </ReactMarkdown>
                                                </Box>
                                            )}
                                        </Box>

                                        {!isLatestVersion && (
                                            <Alert severity="info" sx={{ mt: 3 }}>
                                                This is an archived version and cannot be edited. 
                                                To make changes, go to the latest version and save as a new version.
                                            </Alert>
                                        )}
                                    </>
                                ) : (
                                    <Box
                                        sx={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 3
                                        }}
                                    >
                                        <Typography 
                                            variant="h4" 
                                            sx={{ 
                                                color: 'text.disabled',
                                                opacity: 0.3,
                                                fontWeight: 300,
                                                textAlign: 'center'
                                            }}
                                        >
                                            No terms yet
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<SaveIcon />}
                                            onClick={() => {
                                                setNewVersion('1.0');
                                                setContent('# Terms of Service\n\nEnter your terms here...');
                                                setTimeout(async () => {
                                                    setLoading(true);
                                                    setError('');
                                                    setSuccess('');
                                                    try {
                                                        await apiClient.post('/terms/create/', {
                                                            version: '1.0',
                                                            content_md: '# Terms of Service\n\nEnter your terms here...',
                                                        });
                                                        setSuccess('Created version 1.0');
                                                        await loadVersions();
                                                    } catch (err) {
                                                        setError(err.response?.data?.detail || 'Failed to create terms');
                                                        console.error(err);
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }, 100);
                                            }}
                                            disabled={loading}
                                            sx={{
                                                bgcolor: 'primary.main',
                                                px: 4,
                                                py: 1.5,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                fontSize: '1rem',
                                                boxShadow: '0 4px 12px rgba(146, 0, 32, 0.2)',
                                                '&:hover': {
                                                    boxShadow: '0 6px 20px rgba(146, 0, 32, 0.3)'
                                                }
                                            }}
                                        >
                                            {loading ? 'Creating...' : 'Create First Version'}
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </Stack>
            </Box>
        </Box>
    );
};

export default TermsAdminPage;

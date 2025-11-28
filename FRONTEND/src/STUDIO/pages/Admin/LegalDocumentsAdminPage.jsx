import { useState, useEffect, useRef } from 'react';
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
    ToggleButton,
    ToggleButtonGroup,
    Tabs,
    Tab
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    Save as SaveIcon,
    History as HistoryIcon,
    Visibility as VisibilityIcon,
    Code as CodeIcon,
    Gavel as GavelIcon,
    Shield as ShieldIcon,
    MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import apiClient from '../../../services/apiClient';
import useTheme from '../../../theme/useTheme';
import REAL_DefaultLayout from '../../layouts/REAL_DefaultLayout';

const DOCUMENT_TYPES = [
    { id: 'terms', label: 'Regulamin', icon: <GavelIcon /> },
    { id: 'policy', label: 'Polityka Prywatności', icon: <ShieldIcon /> },
    { id: 'guide', label: 'Poradnik', icon: <MenuBookIcon /> },
];

const LegalDocumentsAdminPage = () => {
    const [activeDocType, setActiveDocType] = useState('terms');
    const [versions, setVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [content, setContent] = useState('');
    const [newVersion, setNewVersion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [viewMode, setViewMode] = useState('edit');
    const theme = useTheme();
    const textareaRef = useRef(null);
    const overlayRef = useRef(null);

    // Load all versions for current document type
    const loadVersions = async (docType = activeDocType) => {
        try {
            const response = await apiClient.get(`/documents/${docType}/all/`);
            const allVersions = response.data;
            setVersions(allVersions);
            
            // Auto-load latest version (skip 0.0)
            const nonZeroVersions = allVersions.filter(v => v.version !== '0.0');
            if (nonZeroVersions.length > 0) {
                loadVersion(nonZeroVersions[0]);
            } else {
                setSelectedVersion(null);
                setContent('');
                setNewVersion('1.0');
            }
        } catch (err) {
            setError('Nie udało się załadować wersji dokumentu');
            console.error(err);
        }
    };

    // Load specific version
    const loadVersion = (version) => {
        setSelectedVersion(version);
        setContent(version.content_md);
        setViewMode('edit');
        const currentVersionNum = parseFloat(version.version);
        if (!isNaN(currentVersionNum)) {
            setNewVersion((currentVersionNum + 0.1).toFixed(1));
        }
    };

    // Save as new version
    const saveAsNewVersion = async () => {
        if (!newVersion.trim()) {
            setError('Podaj numer wersji');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await apiClient.post(`/documents/${activeDocType}/create/`, {
                version: newVersion,
                content_md: content,
            });

            const docLabel = DOCUMENT_TYPES.find(d => d.id === activeDocType)?.label || activeDocType;
            setSuccess(`Zapisano nową wersję dokumentu "${docLabel}": ${newVersion}`);
            await loadVersions();
        } catch (err) {
            setError(err.response?.data?.detail || 'Nie udało się zapisać dokumentu');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Sync scroll between textarea and overlay
    const handleScroll = (e) => {
        if (overlayRef.current && textareaRef.current) {
            overlayRef.current.scrollTop = e.target.scrollTop;
            overlayRef.current.scrollLeft = e.target.scrollLeft;
        }
    };

    // Render content with syntax highlighting for headers
    const renderColoredContent = (text) => {
        const lines = text.split('\n');
        return lines.map((line, index) => {
            const isHeader = /^#{1,3}\s/.test(line);
            return (
                <div key={index} style={{ minHeight: '1.6em' }}>
                    <span style={{ 
                        color: isHeader 
                            ? (theme.mode === 'dark' ? '#60a5fa' : '#2563eb')
                            : (theme.mode === 'dark' ? '#e0e0e0' : '#1a1a1a'),
                        fontWeight: isHeader ? 600 : 400
                    }}>
                        {line || '\u00A0'}
                    </span>
                </div>
            );
        });
    };

    // Handle document type change
    const handleDocTypeChange = (event, newValue) => {
        if (newValue !== null) {
            setActiveDocType(newValue);
            setSelectedVersion(null);
            setContent('');
            setError('');
            setSuccess('');
        }
    };

    useEffect(() => {
        loadVersions(activeDocType);
    }, [activeDocType]);

    const isLatestVersion = selectedVersion && versions[0]?.id === selectedVersion.id;
    const currentDocLabel = DOCUMENT_TYPES.find(d => d.id === activeDocType)?.label || activeDocType;

    return (
        <REAL_DefaultLayout
            title="Legal Documents"
            subtitle="Zarządzaj dokumentami prawnymi platformy"
            maxWidth={1600}
        >
            {/* Document Type Tabs */}
            <Card 
                elevation={0} 
                sx={{ 
                    mb: 3,
                    borderRadius: 4, 
                    border: '1px solid rgba(160, 0, 22, 0.14)',
                }}
            >
                <Tabs
                    value={activeDocType}
                    onChange={handleDocTypeChange}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': {
                            py: 2,
                            fontWeight: 600,
                            textTransform: 'none',
                        },
                        '& .Mui-selected': {
                            color: 'primary.main',
                        },
                    }}
                >
                    {DOCUMENT_TYPES.map((doc) => (
                        <Tab
                            key={doc.id}
                            value={doc.id}
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    {doc.icon}
                                    <span>{doc.label}</span>
                                </Stack>
                            }
                        />
                    ))}
                </Tabs>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Stack 
                direction={{ xs: 'column', lg: 'row' }} 
                spacing={3}
                sx={{ 
                    height: 'calc(100vh - 360px)',
                    minHeight: '500px',
                    overflow: 'hidden'
                }}
            >
                {/* Versions List */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{ 
                        width: '100%', 
                        maxWidth: '160px',
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
                                            Brak wersji
                                        </Typography>
                                    )}
                                </List>
                            </Box>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Editor */}
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
                                                    Nowa wersja:
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
                                                    {loading ? 'Zapisuję...' : 'Zapisz'}
                                                </Button>
                                            </Stack>
                                        )}
                                    </Stack>

                                    <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                        {viewMode === 'edit' ? (
                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    minHeight: 0,
                                                    position: 'relative',
                                                    bgcolor: theme.mode === 'dark' ? 'rgba(30, 30, 30, 0.6)' : 'rgba(250, 250, 250, 0.8)',
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {/* Colored overlay */}
                                                <Box
                                                    ref={overlayRef}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        padding: '16px',
                                                        overflow: 'hidden',
                                                        pointerEvents: 'none',
                                                        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                                        fontSize: '14px',
                                                        lineHeight: '1.6',
                                                        whiteSpace: 'pre-wrap',
                                                        wordWrap: 'break-word',
                                                    }}
                                                >
                                                    {renderColoredContent(content)}
                                                </Box>
                                                
                                                {/* Actual textarea */}
                                                <textarea
                                                    ref={textareaRef}
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                    onScroll={handleScroll}
                                                    disabled={!isLatestVersion}
                                                    placeholder={`Wpisz treść dokumentu "${currentDocLabel}" w formacie Markdown...`}
                                                    spellCheck={false}
                                                    autoComplete="off"
                                                    autoCorrect="off"
                                                    autoCapitalize="off"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        padding: '16px',
                                                        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                                        fontSize: '14px',
                                                        lineHeight: '1.6',
                                                        whiteSpace: 'pre-wrap',
                                                        wordWrap: 'break-word',
                                                        color: 'transparent',
                                                        caretColor: theme.mode === 'dark' ? '#e0e0e0' : '#1a1a1a',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        outline: 'none',
                                                        resize: 'none',
                                                        overflow: 'auto',
                                                    }}
                                                />
                                            </Box>
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
                                            To jest zarchiwizowana wersja i nie można jej edytować. 
                                            Aby dokonać zmian, przejdź do najnowszej wersji i zapisz jako nową wersję.
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
                                        Brak wersji dokumentu "{currentDocLabel}"
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        onClick={() => {
                                            setNewVersion('1.0');
                                            setContent(`# ${currentDocLabel}\n\nWpisz treść tutaj...`);
                                            setTimeout(async () => {
                                                setLoading(true);
                                                setError('');
                                                setSuccess('');
                                                try {
                                                    await apiClient.post(`/documents/${activeDocType}/create/`, {
                                                        version: '1.0',
                                                        content_md: `# ${currentDocLabel}\n\nWpisz treść tutaj...`,
                                                    });
                                                    setSuccess('Utworzono wersję 1.0');
                                                    await loadVersions();
                                                } catch (err) {
                                                    setError(err.response?.data?.detail || 'Nie udało się utworzyć dokumentu');
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
                                        {loading ? 'Tworzę...' : 'Utwórz pierwszą wersję'}
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </Stack>
        </REAL_DefaultLayout>
    );
};

export default LegalDocumentsAdminPage;

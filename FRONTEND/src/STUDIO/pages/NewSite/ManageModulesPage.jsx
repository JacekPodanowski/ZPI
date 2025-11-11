import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Stack,
    Switch,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getModulesForCategory } from './wizardConstants';
import ModuleWarningModal from './ModuleWarningModal';
import { fetchSiteById, updateSiteTemplate } from '../../../services/siteService';
import { DEFAULT_STYLE_ID } from '../../../SITES/styles';
import { normalizeStyleState } from '../../../SITES/styles/utils';
import Navigation from '../../../components/Navigation/Navigation';

const MONTSERRAT_FONT = '"Montserrat", "Inter", "Roboto", "Helvetica", "Arial", sans-serif';

const ModuleCard = ({ module, onToggle, index }) => {
    const IconComponent = module.icon;
    const isDisabled = !module.enabled;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.03, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        >
            <Box
                sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 1,
                    px: 2,
                    borderRadius: 3,
                    border: '1.5px solid',
                    borderColor: isDisabled 
                        ? 'rgba(158, 158, 158, 0.3)' 
                        : 'rgba(146, 0, 32, 0.25)',
                    backgroundColor: (theme) => 
                        isDisabled 
                            ? (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(158,158,158,0.08)')
                            : (theme.palette.mode === 'dark' ? 'rgba(146,0,32,0.06)' : 'rgba(146,0,32,0.05)'),
                    opacity: isDisabled ? 0.85 : 1,
                    transition: 'all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    mb: 0.8,
                    overflow: 'visible',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 4,
                        height: '60%',
                        borderRadius: '0 4px 4px 0',
                        backgroundColor: isDisabled 
                            ? 'rgba(158, 158, 158, 0.5)' 
                            : 'rgba(146, 0, 32, 0.85)',
                        transition: 'all 0.32s ease',
                        boxShadow: isDisabled 
                            ? 'none'
                            : '0 0 12px rgba(146, 0, 32, 0.4)'
                    },
                    '&:hover': {
                        backgroundColor: (theme) =>
                            isDisabled
                                ? (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(158,158,158,0.12)')
                                : (theme.palette.mode === 'dark' ? 'rgba(146,0,32,0.1)' : 'rgba(146,0,32,0.08)'),
                        borderColor: isDisabled 
                            ? 'rgba(158, 158, 158, 0.4)' 
                            : 'rgba(146, 0, 32, 0.4)',
                        transform: 'translateX(4px)',
                        boxShadow: isDisabled 
                            ? '0 2px 8px rgba(158, 158, 158, 0.15)'
                            : '0 4px 16px rgba(146, 0, 32, 0.15)'
                    }
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        background: isDisabled
                            ? 'rgba(158, 158, 158, 0.2)'
                            : 'rgba(146,0,32,0.12)',
                        border: '1px solid',
                        borderColor: isDisabled
                            ? 'rgba(158, 158, 158, 0.3)'
                            : 'rgba(146,0,32,0.2)',
                        transition: 'all 0.32s ease'
                    }}
                >
                    <IconComponent
                        sx={{
                            fontSize: 20,
                            color: isDisabled 
                                ? 'rgba(158, 158, 158, 0.85)' 
                                : 'rgba(146, 0, 32, 0.9)',
                            transition: 'color 0.32s ease'
                        }}
                    />
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            fontWeight: 700, 
                            mb: 0.2, 
                            letterSpacing: 0.3, 
                            fontSize: '0.9rem',
                            color: isDisabled ? 'rgba(100, 100, 100, 0.9)' : 'text.primary'
                        }}
                    >
                        {module.name}
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: isDisabled ? 'rgba(120, 120, 120, 0.85)' : 'text.secondary', 
                            fontSize: '0.8rem',
                            lineHeight: 1.3
                        }}
                    >
                        {module.description}
                    </Typography>
                </Box>
                <Switch
                    checked={module.enabled}
                    onChange={() => onToggle(module)}
                    sx={{
                        '& .MuiSwitch-switchBase': {
                            color: 'rgba(158, 158, 158, 0.8)',
                            '&.Mui-checked': {
                                color: 'rgba(146, 0, 32, 1)',
                                '& + .MuiSwitch-track': {
                                    backgroundColor: 'rgba(146, 0, 32, 0.5)',
                                    opacity: 1
                                }
                            }
                        },
                        '& .MuiSwitch-track': {
                            backgroundColor: 'rgba(158, 158, 158, 0.3)',
                            opacity: 1,
                            transition: 'background-color 0.28s ease'
                        },
                        '& .MuiSwitch-thumb': {
                            transition: 'all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            boxShadow: module.enabled
                                ? '0 2px 8px rgba(146, 0, 32, 0.4)'
                                : '0 2px 4px rgba(158, 158, 158, 0.3)'
                        }
                    }}
                />
            </Box>
        </motion.div>
    );
};

const ManageModulesPage = () => {
    const navigate = useNavigate();
    const { siteId } = useParams();
    const [siteName, setSiteName] = useState('');
    const [modules, setModules] = useState([]);
    const [warningModal, setWarningModal] = useState({ open: false, module: null });
    const [pageVisible, setPageVisible] = useState(false);
    const [showAdditionalModules, setShowAdditionalModules] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [site, setSite] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => setPageVisible(true), 80);
        return () => clearTimeout(timer);
    }, []);

    // Load site data
    useEffect(() => {
        const loadSite = async () => {
            try {
                setLoading(true);
                const siteData = await fetchSiteById(siteId);
                const templateConfig = siteData.template_config || {};
                const { styleId, styleOverrides, style } = normalizeStyleState(templateConfig);

                const normalizedTemplateConfig = {
                    ...templateConfig,
                    styleId: styleId || DEFAULT_STYLE_ID,
                    styleOverrides,
                    style,
                    vibe: undefined,
                    vibeId: undefined,
                    theme: undefined,
                    themeId: undefined,
                    themeOverrides: undefined
                };

                const normalizedSiteData = {
                    ...siteData,
                    template_config: normalizedTemplateConfig
                };

                setSite(normalizedSiteData);
                setSiteName(normalizedSiteData.name);
                
                // Get the category from template_config or default
                const category = normalizedTemplateConfig?.category || 'default';
                
                // Get all available modules for this category
                const availableModules = getModulesForCategory(category);
                
                // Get enabled modules from template_config
                const enabledModuleIds = normalizedTemplateConfig?.modules || [];
                
                // Set module states based on what's enabled in template_config
                const modulesWithState = availableModules.map(module => ({
                    ...module,
                    enabled: enabledModuleIds.includes(module.id)
                }));
                
                setModules(modulesWithState);
            } catch (err) {
                console.error('Failed to load site:', err);
                setError(err.message || 'Failed to load site');
            } finally {
                setLoading(false);
            }
        };

        loadSite();
    }, [siteId]);

    const handleToggle = (module) => {
        if (module.enabled && module.disableWarning?.enabled) {
            setWarningModal({ open: true, module });
        } else {
            toggleModule(module.id);
        }
    };

    const toggleModule = (moduleId) => {
        setModules((prev) =>
            prev.map((m) => (m.id === moduleId ? { ...m, enabled: !m.enabled } : m))
        );
    };

    const handleConfirmDisable = () => {
        if (warningModal.module) {
            toggleModule(warningModal.module.id);
        }
        setWarningModal({ open: false, module: null });
    };

    const handleBack = () => {
        navigate('/studio/sites');
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            const enabledModules = modules.filter((m) => m.enabled).map((m) => m.id);
            const templateConfig = site.template_config || {};
            const { styleId, styleOverrides, style } = normalizeStyleState(templateConfig);

            // Update template_config with new module selection
            const updatedTemplateConfig = {
                ...templateConfig,
                modules: enabledModules,
                styleId: styleId || DEFAULT_STYLE_ID,
                styleOverrides,
                style
            };

            delete updatedTemplateConfig.vibe;
            delete updatedTemplateConfig.vibeId;
            delete updatedTemplateConfig.theme;
            delete updatedTemplateConfig.themeId;
            delete updatedTemplateConfig.themeOverrides;
            
            // Use updateSiteTemplate to ensure proper backend handling
            await updateSiteTemplate(siteId, updatedTemplateConfig, site.name);

            // Keep local state in sync post-save
            setSite((prevSite) =>
                prevSite ? { ...prevSite, template_config: updatedTemplateConfig } : prevSite
            );

            // Navigate back to sites page
            navigate('/studio/sites');
        } catch (error) {
            console.error('Failed to save modules:', error);
            setError('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Navigation />
                <Container maxWidth="md">
                    <Alert severity="error">{error}</Alert>
                    <Box sx={{ mt: 2 }}>
                        <Typography
                            onClick={handleBack}
                            sx={{
                                cursor: 'pointer',
                                color: 'primary.main',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            ← Back to Sites
                        </Typography>
                    </Box>
                </Container>
            </Box>
        );
    }

    return (
        <>
            <Navigation />
            <Box
                sx={{
                    minHeight: 'calc(100vh - 60px)',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    backgroundColor: 'background.default',
                    py: 2,
                    position: 'relative',
                    overflow: 'auto'
                }}
            >
                {/* Ethereal background */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            position: 'absolute',
                            width: '45vw',
                            height: '45vw',
                            top: '-15vw',
                            right: '-10vw',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(160,0,22,0.05) 0%, rgba(160,0,22,0) 70%)',
                            animation: 'configDrift1 28s ease-in-out infinite',
                            '@keyframes configDrift1': {
                                '0%': { transform: 'translate3d(0,0,0)', opacity: 0.6 },
                                '50%': { transform: 'translate3d(-25px, 35px, 0)', opacity: 0.35 },
                                '100%': { transform: 'translate3d(0,0,0)', opacity: 0.6 }
                            }
                        }}
                    />
                    <Box
                        component="span"
                        sx={{
                            position: 'absolute',
                            width: '55vw',
                            height: '55vw',
                            bottom: '-20vw',
                            left: '-18vw',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(114,0,21,0.04) 0%, rgba(114,0,21,0) 65%)',
                            animation: 'configDrift2 32s ease-in-out infinite',
                            '@keyframes configDrift2': {
                                '0%': { transform: 'translate3d(0,0,0) scale(1)', opacity: 0.5 },
                                '50%': { transform: 'translate3d(35px,-25px,0) scale(1.08)', opacity: 0.3 },
                                '100%': { transform: 'translate3d(0,0,0) scale(1)', opacity: 0.5 }
                            }
                        }}
                    />
                </Box>

                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                    <Stack 
                        spacing={2}
                        sx={{
                            opacity: pageVisible ? 1 : 0,
                            transform: pageVisible ? 'translateY(0)' : 'translateY(-30px)',
                            transition: 'opacity 0.8s ease, transform 0.8s ease'
                        }}
                    >
                        {/* Site Name Display */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                        >
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        letterSpacing: 2,
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        display: 'block',
                                        mb: 0.5,
                                        fontSize: '0.75rem',
                                        opacity: 0.7
                                    }}
                                >
                                    ZARZĄDZAJ MODUŁAMI
                                </Typography>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, rgba(30,30,30,1) 0%, rgba(146,0,32,0.85) 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}
                                >
                                    {siteName}
                                </Typography>
                            </Box>
                        </motion.div>

                        {/* Modules Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <Box sx={{ maxHeight: 'none', overflow: 'visible', pr: 1 }}>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        fontWeight: 600, 
                                        mb: 2,
                                        letterSpacing: 0.5
                                    }}
                                >
                                    Główne Moduły
                                </Typography>
                                
                                {/* Main Modules */}
                                <Stack spacing={0}>
                                    {modules.filter(m => !m.isAdditional).map((module, index) => (
                                        <ModuleCard 
                                            key={module.id} 
                                            module={module} 
                                            onToggle={handleToggle} 
                                            index={index} 
                                        />
                                    ))}
                                </Stack>

                                {/* Więcej Button */}
                                {modules.some(m => m.isAdditional) && (
                                    <Box sx={{ textAlign: 'center', my: 3 }}>
                                        <Box
                                            onClick={() => setShowAdditionalModules(!showAdditionalModules)}
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                cursor: 'pointer',
                                                color: 'text.secondary',
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                letterSpacing: 1.2,
                                                px: 2,
                                                py: 1,
                                                borderRadius: 2,
                                                transition: 'all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                '&:hover': {
                                                    color: 'primary.main',
                                                    backgroundColor: 'rgba(146, 0, 32, 0.05)',
                                                    transform: 'scale(1.05)',
                                                    '& .chevron-icon': {
                                                        transform: showAdditionalModules ? 'rotate(180deg) translateY(2px)' : 'translateY(2px)'
                                                    }
                                                }
                                            }}
                                        >
                                            Więcej
                                            <ChevronRightIcon 
                                                className="chevron-icon"
                                                sx={{ 
                                                    fontSize: 20,
                                                    transform: showAdditionalModules ? 'rotate(90deg)' : 'rotate(90deg)',
                                                    transition: 'transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                                }} 
                                            />
                                        </Box>
                                    </Box>
                                )}

                                {/* Additional Modules */}
                                {showAdditionalModules && modules.some(m => m.isAdditional) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                fontWeight: 500, 
                                                mb: 1.5,
                                                mt: 2,
                                                color: 'text.secondary',
                                                fontSize: '0.85rem',
                                                letterSpacing: 0.8,
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            Dodatkowe moduły
                                        </Typography>
                                        <Stack spacing={0}>
                                            {modules.filter(m => m.isAdditional).map((module, index) => (
                                                <ModuleCard 
                                                    key={module.id} 
                                                    module={module} 
                                                    onToggle={handleToggle} 
                                                    index={index + modules.filter(m => !m.isAdditional).length} 
                                                />
                                            ))}
                                        </Stack>
                                    </motion.div>
                                )}
                            </Box>
                        </motion.div>

                        {/* Navigation Buttons */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                pt: 2,
                                borderTop: '1px solid rgba(146, 0, 32, 0.1)'
                            }}
                        >
                            <Box
                                onClick={handleBack}
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    cursor: 'pointer',
                                    color: 'text.secondary',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    letterSpacing: 1,
                                    transition: 'all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    px: 1.5,
                                    py: 0.75,
                                    '&:hover': {
                                        color: 'primary.main',
                                        letterSpacing: 1.5,
                                        transform: 'scale(1.08)',
                                        filter: 'drop-shadow(0 4px 12px rgba(146, 0, 32, 0.3))',
                                        '& .back-arrow': {
                                            transform: 'translateX(-4px)'
                                        }
                                    }
                                }}
                            >
                                <ChevronLeftIcon 
                                    className="back-arrow"
                                    sx={{ 
                                        fontSize: 20,
                                        transition: 'transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }} 
                                />
                                Anuluj
                            </Box>

                            <Box
                                onClick={!saving ? handleSave : undefined}
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 3,
                                    backgroundColor: saving ? 'rgba(146, 0, 32, 0.25)' : 'rgba(146, 0, 32, 0.9)',
                                    color: '#ffffff',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    fontFamily: MONTSERRAT_FONT,
                                    fontWeight: 600,
                                    fontSize: '0.95rem',
                                    letterSpacing: 0.8,
                                    boxShadow: saving ? 'none' : '0 6px 20px rgba(146, 0, 32, 0.2)',
                                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': !saving ? {
                                        transform: 'translateY(-2px)',
                                        backgroundColor: 'rgba(146, 0, 32, 1)',
                                        boxShadow: '0 10px 30px rgba(146, 0, 32, 0.3)',
                                        letterSpacing: 1.2,
                                        '& .save-arrow': {
                                            transform: 'translateX(4px)'
                                        }
                                    } : {}
                                }}
                            >
                                {saving ? 'Zapisywanie...' : 'Zapisz'}
                                {!saving && (
                                    <ChevronRightIcon 
                                        className="save-arrow"
                                        sx={{ 
                                            fontSize: 20,
                                            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }} 
                                    />
                                )}
                            </Box>
                        </Box>
                    </Stack>

                    <ModuleWarningModal
                        open={warningModal.open}
                        onClose={() => setWarningModal({ open: false, module: null })}
                        onConfirm={handleConfirmDisable}
                        warning={warningModal.module?.disableWarning}
                    />
                </Container>
            </Box>
        </>
    );
};

export default ManageModulesPage;

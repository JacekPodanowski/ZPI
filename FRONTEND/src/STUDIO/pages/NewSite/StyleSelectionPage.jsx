import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Stack,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import { STYLE_LIST, DEFAULT_STYLE_ID } from '../../../SITES/styles';
import composeSiteStyle from '../../../SITES/styles/utils';
import { createSite } from '../../../services/siteService';
import { buildTemplateFromModules } from '../../utils/templateBuilder';
import { WIZARD_STORAGE_KEYS } from './wizardConstants';
import StylePreviewRenderer from '../../components_STUDIO/StylePreview/StylePreviewRenderer';
import {
    WIZARD_STAGES,
    validateStageAccess,
    getWizardData,
    completeStage,
    clearStageAndFollowing,
    getStageRoute
} from './wizardStageManager';

const StyleStrip = ({ styleDefinition, index, onSelect, isPending }) => {
    const motionDelay = 0.15 + index * 0.07;
    const isReversed = index % 2 === 1; // Co drugi kafelek odwrócony

    const handleClick = useCallback(() => {
        if (!isPending) {
            onSelect(styleDefinition);
        }
    }, [isPending, onSelect, styleDefinition]);

    return (
        <motion.div
            initial={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: motionDelay, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ width: '100%' }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    flexDirection: isReversed ? 'row-reverse' : 'row',
                    gap: 6,
                    alignItems: 'center'
                }}
            >
                {/* Podgląd strony - proporcje 16:9 z hover efektem */}
                <Box
                    onClick={handleClick}
                    sx={{
                        position: 'relative',
                        width: '50%',
                        aspectRatio: '16/9',
                        overflow: 'hidden',
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: 'divider',
                        backgroundColor: styleDefinition.backgroundColor || 'rgba(245, 242, 235, 1)',
                        flexShrink: 0,
                        cursor: isPending ? 'wait' : 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                        '&:hover': !isPending ? {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.18)',
                            borderColor: 'primary.main'
                        } : {}
                    }}
                >
                    <StylePreviewRenderer styleId={styleDefinition.id} />
                </Box>

                {/* Opis stylu */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        justifyContent: 'center',
                        textAlign: isReversed ? 'right' : 'left'
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontFamily: styleDefinition.titleFont || '"Montserrat", sans-serif',
                            fontWeight: 700,
                            fontSize: { xs: '1.75rem', md: '2.5rem' },
                            color: 'text.primary',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
                            letterSpacing: 0.5
                        }}
                    >
                        {styleDefinition.name}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            lineHeight: 1.7,
                            fontSize: '1.05rem'
                        }}
                    >
                        {styleDefinition.description}
                    </Typography>
                </Box>
            </Box>
        </motion.div>
    );
};

const StyleSelectionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [pageVisible, setPageVisible] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [pendingStyle, setPendingStyle] = useState(null);
    const [error, setError] = useState(null);
    const [wizardData, setWizardData] = useState(null);

    // Validate stage access on mount
    useEffect(() => {
        const validation = validateStageAccess(WIZARD_STAGES.STYLE);
        
        if (!validation.canAccess) {
            // Redirect to the appropriate stage
            navigate(validation.redirectTo, { replace: true });
            return;
        }

        // Load wizard data
        const data = getWizardData();
        if (data) {
            setWizardData(data);
        } else {
            // Should not happen due to validation, but redirect just in case
            navigate(getStageRoute(WIZARD_STAGES.CATEGORY), { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        const timer = setTimeout(() => setPageVisible(true), 80);
        return () => clearTimeout(timer);
    }, []);

    const styles = STYLE_LIST;

    const pendingStyleLabel = useMemo(() => {
        if (!pendingStyle) {
            return '';
        }

        const match = STYLE_LIST.find(
            (style) => style.id === pendingStyle || style.name === pendingStyle
        );

        return match?.name || pendingStyle;
    }, [pendingStyle]);

    const handleBack = useCallback(() => {
        // Clear this stage and following stages when going back
        clearStageAndFollowing(WIZARD_STAGES.PROJECT);
        navigate(getStageRoute(WIZARD_STAGES.PROJECT));
    }, [navigate]);

    const handleSelectStyle = useCallback(async (styleDefinition) => {
        if (!wizardData || isCreating) {
            return;
        }

        setError(null);
        setIsCreating(true);
        setPendingStyle(styleDefinition.id || styleDefinition.name);

        const enabledModules = wizardData.modules || [];
        const templateConfig = buildTemplateFromModules(enabledModules, wizardData.name, wizardData.category);
        templateConfig.modules = enabledModules;
        templateConfig.category = wizardData.category;

        const styleId = styleDefinition.id || DEFAULT_STYLE_ID;
        const styleSnapshot = composeSiteStyle(styleId);

        templateConfig.styleId = styleId;
        templateConfig.styleOverrides = {};
        templateConfig.style = styleSnapshot;
        delete templateConfig.vibe;
        delete templateConfig.vibeId;
        delete templateConfig.theme;
        delete templateConfig.themeId;
        delete templateConfig.themeOverrides;

        // Complete this stage
        completeStage(WIZARD_STAGES.STYLE, {
            templateConfig: templateConfig
        });

        // Redirect to login page
        navigate(getStageRoute(WIZARD_STAGES.LOGIN));
    }, [wizardData, isCreating, navigate]);

    // Show loading state while validating
    if (!wizardData) {
        return (
            <Box
                sx={{
                    minHeight: 'calc(100vh - 60px)',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'background.default'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 60px)',
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                backgroundColor: 'background.default',
                position: 'relative',
                overflow: 'auto',
                py: 4
            }}
        >
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
                            top: '-18vw',
                            right: '-12vw',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(146,0,32,0.04) 0%, rgba(146,0,32,0) 70%)',
                            animation: 'styleGlow1 28s ease-in-out infinite',
                            '@keyframes styleGlow1': {
                                '0%': { transform: 'translate3d(0,0,0)', opacity: 0.4 },
                                '50%': { transform: 'translate3d(-25px, 30px, 0)', opacity: 0.18 },
                                '100%': { transform: 'translate3d(0,0,0)', opacity: 0.4 }
                            }
                        }}
                    />
                    <Box
                        component="span"
                        sx={{
                            position: 'absolute',
                            width: '55vw',
                            height: '55vw',
                            bottom: '-22vw',
                            left: '-18vw',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(114,0,21,0.05) 0%, rgba(114,0,21,0) 68%)',
                            animation: 'styleGlow2 32s ease-in-out infinite',
                            '@keyframes styleGlow2': {
                                '0%': { transform: 'translate3d(0,0,0)', opacity: 0.35 },
                                '50%': { transform: 'translate3d(35px,-25px,0)', opacity: 0.2 },
                                '100%': { transform: 'translate3d(0,0,0)', opacity: 0.35 }
                            }
                        }}
                    />
                </Box>

                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 10,
                        width: '100%',
                        maxWidth: '1400px',
                        opacity: pageVisible ? 1 : 0,
                        transform: pageVisible ? 'translateY(0)' : 'translateY(-24px)',
                        transition: 'opacity 0.8s ease, transform 0.8s ease',
                        px: { xs: 2, md: 4 }
                    }}
                >
                    <Stack spacing={0} sx={{ width: '100%' }}>
                        <Box sx={{ px: { xs: 3, md: 5 }, py: { xs: 4, md: 6 } }}>
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.6 }}
                            >
                                <Typography
                                    variant="overline"
                                    sx={{
                                        letterSpacing: 6,
                                        color: 'secondary.main',
                                        fontWeight: 600
                                    }}
                                >
                                    WYBIERZ STYL
                                </Typography>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: -14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.18, duration: 0.6 }}
                            >
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 700,
                                        mt: 2,
                                        background: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'linear-gradient(135deg, rgba(220,220,220,1) 0%, rgba(146,0,32,0.8) 100%)'
                                                : 'linear-gradient(135deg, rgba(30,30,30,1) 0%, rgba(146,0,32,0.85) 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}
                                >
                                    Wybierz styl dla swojej strony
                                </Typography>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.26, duration: 0.7 }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'text.secondary',
                                        maxWidth: 540,
                                        lineHeight: 1.7,
                                        fontWeight: 400,
                                        mt: 2
                                    }}
                                >
                                    Każdy styl zawiera dopasowaną typografię i tło. Wybierz ten, który najlepiej oddaje charakter Twojej marki.
                                </Typography>
                            </motion.div>
                        </Box>

                        {error && (
                            <Box sx={{ px: { xs: 3, md: 5 }, pb: 2 }}>
                                <Alert severity="error">{error}</Alert>
                            </Box>
                        )}

                        <Stack spacing={3} sx={{ width: '100%', px: { xs: 3, md: 5 }, py: 2 }}>
                            {styles.map((styleDefinition, index) => (
                                <StyleStrip
                                    key={styleDefinition.id || styleDefinition.name || index}
                                    styleDefinition={styleDefinition}
                                    index={index}
                                    onSelect={handleSelectStyle}
                                    isPending={isCreating}
                                />
                            ))}
                        </Stack>

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                px: { xs: 3, md: 5 },
                                py: 4,
                                mt: 0,
                                borderTop: '1px solid rgba(146, 0, 32, 0.1)',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: { xs: 2, sm: 0 }
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
                                    fontSize: { xs: '0.9rem', md: '0.95rem' },
                                    fontWeight: 600,
                                    letterSpacing: { xs: 0.8, md: 1 },
                                    transition: 'all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    px: 1.5,
                                    py: 0.75,
                                    '&:hover': {
                                        color: 'primary.main',
                                        letterSpacing: { xs: 1.2, md: 1.5 },
                                        transform: 'scale(1.08)',
                                        filter: 'drop-shadow(0 4px 12px rgba(146, 0, 32, 0.3))'
                                    }
                                }}
                            >
                                ← Wróć do modułów
                            </Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    fontStyle: 'italic',
                                    letterSpacing: 0.6
                                }}
                            >
                                {isCreating
                                    ? 'Tworzymy Twoją stronę...'
                                    : 'Kliknij w sekcję, aby wybrać styl.'}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                {isCreating && (
                    <Box
                        sx={{
                            position: 'fixed',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                            backgroundColor: 'rgba(12,12,12,0.2)',
                            zIndex: 9
                        }}
                    >
                        <Stack spacing={2} alignItems="center">
                            <CircularProgress size={48} thickness={4} />
                            <Typography variant="body1" sx={{ color: '#ffffff' }}>
                                Tworzymy Twoją stronę w stylu {pendingStyle ? pendingStyleLabel : ''}...
                            </Typography>
                        </Stack>
                    </Box>
                )}
        </Box>
    );
};

export default StyleSelectionPage;

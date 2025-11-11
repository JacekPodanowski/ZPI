import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Container,
    Stack,
    Switch,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getModulesForCategory, validateSiteName, WIZARD_STORAGE_KEYS } from './wizardConstants';
import ModuleWarningModal from './ModuleWarningModal';
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
                    gap: { xs: 1, md: 1.5 },
                    py: { xs: 0.75, md: 1 },
                    px: { xs: 1.5, md: 2 },
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
                        width: { xs: 36, md: 40 },
                        height: { xs: 36, md: 40 },
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
                            fontSize: { xs: 18, md: 20 },
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
                            fontSize: { xs: '0.85rem', md: '0.9rem' },
                            color: isDisabled ? 'rgba(100, 100, 100, 0.9)' : 'text.primary'
                        }}
                    >
                        {module.name}
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: isDisabled ? 'rgba(120, 120, 120, 0.85)' : 'text.secondary', 
                            fontSize: { xs: '0.75rem', md: '0.8rem' },
                            lineHeight: 1.3,
                            display: { xs: 'none', sm: 'block' }
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

const NewProjectPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const selectedCategory = location.state?.category || 'default';
    
    const [siteName, setSiteName] = useState('');
    const [modules, setModules] = useState(() => getModulesForCategory(selectedCategory));
    const [warningModal, setWarningModal] = useState({ open: false, module: null });
    const [nameError, setNameError] = useState(null);
    const [pageVisible, setPageVisible] = useState(false);
    const [titleConfirmed, setTitleConfirmed] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [showAdditionalModules, setShowAdditionalModules] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setPageVisible(true), 80);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const storedDraft = window.localStorage.getItem(WIZARD_STORAGE_KEYS.ACTIVE_DRAFT);
            if (!storedDraft) {
                return;
            }

            const parsedDraft = JSON.parse(storedDraft);
            if (!parsedDraft || parsedDraft.category !== selectedCategory) {
                return;
            }

            if (parsedDraft.name && !siteName) {
                setSiteName(parsedDraft.name);
                setTitleConfirmed(true);
            }

            if (Array.isArray(parsedDraft.modules) && parsedDraft.modules.length) {
                setModules((prevModules) =>
                    prevModules.map((module) => ({
                        ...module,
                        enabled: parsedDraft.modules.includes(module.id)
                    }))
                );
            }
        } catch (draftError) {
            console.warn('[NewProjectPage] Failed to restore wizard draft:', draftError);
        }
    }, [selectedCategory, siteName]);

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

    const handleConfirmTitle = () => {
        if (siteName?.trim() && !validateSiteName(siteName)) {
            setTitleConfirmed(true);
        }
    };

    const handleEditTitle = (e) => {
        if (!isEditingTitle) {
            e.preventDefault();
            setIsEditingTitle(true);
            // Move cursor to the end of the input
            setTimeout(() => {
                const input = e.currentTarget;
                const length = input.value.length;
                input.setSelectionRange(length, length);
                input.focus();
            }, 0);
        }
    };

    const handleBack = () => {
        navigate('/studio/new');
    };

    const handleNext = () => {
        if (!siteName?.trim() || validateSiteName(siteName)) {
            return;
        }

        const enabledModules = modules.filter((m) => m.enabled).map((m) => m.id);
        const draftPayload = {
            name: siteName.trim(),
            category: selectedCategory,
            modules: enabledModules
        };

        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(
                    WIZARD_STORAGE_KEYS.ACTIVE_DRAFT,
                    JSON.stringify(draftPayload)
                );
            } catch (storageError) {
                console.warn('[NewProjectPage] Failed to persist wizard draft:', storageError);
            }
        }

        navigate('/studio/new/style', { state: draftPayload });
    };

    const canProceed = siteName?.trim() && !validateSiteName(siteName);

    // Listen for Enter key when modules section is visible
    useEffect(() => {
        if (!titleConfirmed || !canProceed) {
            return;
        }

        const handleKeyDown = (e) => {
            // Only trigger if not typing in an input field
            if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [titleConfirmed, canProceed]);

    return (
        <>
            <Navigation />
            <Box
                sx={{
                    minHeight: 'calc(100vh - 60px)',
                    width: '100%',
                    display: 'flex',
                    alignItems: titleConfirmed ? 'flex-start' : 'center',
                    justifyContent: 'center',
                    backgroundColor: 'background.default',
                    transition: 'align-items 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    py: titleConfirmed ? 2 : 0,
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

            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, width: '100%', px: { xs: 2, sm: 3, md: 4 } }}>
                {!titleConfirmed ? (
                    // Initial title entry - centered on page
                    <Box
                        sx={{
                            textAlign: 'center',
                            opacity: pageVisible ? 1 : 0,
                            transform: pageVisible ? 'translateY(0)' : 'translateY(-30px)',
                            transition: 'opacity 0.8s ease, transform 0.8s ease'
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.6 }}
                        >
                            <Typography
                                variant="overline"
                                sx={{
                                    letterSpacing: { xs: 3, md: 6 },
                                    color: 'secondary.main',
                                    fontWeight: 600,
                                    mb: 3,
                                    fontSize: { xs: '0.65rem', md: '0.75rem' }
                                }}
                            >
                                NAZWA TWOJEJ STRONY
                            </Typography>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.7 }}
                        >
                            <Box sx={{ display: 'inline-block', minWidth: { xs: '280px', sm: '360px', md: '400px' }, width: '100%', maxWidth: '100%' }}>
                                <input
                                    type="text"
                                    value={siteName}
                                    onChange={(e) => {
                                        const newText = e.target.value;
                                        if (newText.length <= 20) {
                                            setSiteName(newText);
                                            const error = validateSiteName(newText);
                                            setNameError(error);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && siteName?.trim() && !nameError) {
                                            handleConfirmTitle();
                                        }
                                    }}
                                    autoFocus
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        background: 'linear-gradient(135deg, rgba(30,30,30,1) 0%, rgba(146,0,32,0.85) 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        textAlign: 'center',
                                        fontSize: isMobile ? '2rem' : '3.5rem',
                                        fontWeight: 700,
                                        padding: '0.5rem 1rem',
                                        width: '100%',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </Box>

                            {nameError && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'error.main',
                                        mt: 2,
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {nameError}
                                </Typography>
                            )}
                        </motion.div>

                        {siteName?.trim() && !nameError && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                <Box
                                    onClick={handleConfirmTitle}
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mt: 5,
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 50,
                                        backgroundColor: 'primary.main',
                                        color: '#ffffff',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        letterSpacing: 1,
                                        boxShadow: '0 8px 24px rgba(146, 0, 32, 0.3)',
                                        transition: 'all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-2px) scale(1.05)',
                                            boxShadow: '0 12px 32px rgba(146, 0, 32, 0.4)',
                                            '& .ok-arrow': {
                                                transform: 'translateX(4px)'
                                            }
                                        }
                                    }}
                                >
                                    Dalej
                                    <ChevronRightIcon 
                                        className="ok-arrow"
                                        sx={{ 
                                            fontSize: 20,
                                            transition: 'transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                        }} 
                                    />
                                </Box>
                            </motion.div>
                        )}
                    </Box>
                ) : (
                    // After title confirmed - show modules
                    <Stack 
                        spacing={2}
                        sx={{
                            opacity: pageVisible ? 1 : 0,
                            transform: pageVisible ? 'translateY(0)' : 'translateY(-30px)',
                            transition: 'opacity 0.8s ease, transform 0.8s ease'
                        }}
                    >
                        {/* Editable Title at top */}
                        <motion.div
                            initial={{ opacity: 0, scale: 1.5, y: 200 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
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
                                    NAZWA PROJEKTU
                                </Typography>
                                <input
                                    type="text"
                                    value={siteName}
                                    onChange={(e) => {
                                        if (!isEditingTitle) return;
                                        const newText = e.target.value;
                                        if (newText.length <= 20) {
                                            setSiteName(newText);
                                            const error = validateSiteName(newText);
                                            setNameError(error);
                                        }
                                    }}
                                    onBlur={() => setIsEditingTitle(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.currentTarget.blur();
                                        }
                                    }}
                                    onClick={handleEditTitle}
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        background: 'linear-gradient(135deg, rgba(30,30,30,1) 0%, rgba(146,0,32,0.85) 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        color: 'transparent',
                                        caretColor: 'rgba(146, 0, 32, 1)',
                                        textAlign: 'center',
                                        fontSize: isEditingTitle ? (isMobile ? '2rem' : '3rem') : (isMobile ? '1.5rem' : '2rem'),
                                        fontWeight: 700,
                                        padding: '0.5rem 1rem',
                                        minWidth: isMobile ? '200px' : '300px',
                                        width: '100%',
                                        fontFamily: 'inherit',
                                        lineHeight: 1.167,
                                        cursor: isEditingTitle ? 'text' : 'pointer',
                                        transition: 'all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        borderRadius: '8px',
                                        WebkitUserSelect: isEditingTitle ? 'text' : 'none',
                                        userSelect: isEditingTitle ? 'text' : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isEditingTitle) {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.filter = 'brightness(1.2)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.filter = 'brightness(1)';
                                    }}
                                />
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
                                    order: { xs: 2, sm: 1 },
                                    width: { xs: '100%', sm: 'auto' },
                                    justifyContent: { xs: 'center', sm: 'flex-start' },
                                    '&:hover': {
                                        color: 'primary.main',
                                        letterSpacing: { xs: 1.2, md: 1.5 },
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
                                Wstecz
                            </Box>

                            <Box
                                onClick={canProceed ? handleNext : undefined}
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: { xs: 3, md: 4 },
                                    py: 1.5,
                                    borderRadius: 3,
                                    backgroundColor: canProceed ? 'rgba(146, 0, 32, 0.9)' : 'rgba(146, 0, 32, 0.25)',
                                    color: canProceed ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                                    cursor: canProceed ? 'pointer' : 'not-allowed',
                                    fontFamily: MONTSERRAT_FONT,
                                    fontWeight: 600,
                                    fontSize: { xs: '0.9rem', md: '0.95rem' },
                                    letterSpacing: 0.8,
                                    boxShadow: canProceed ? '0 6px 20px rgba(146, 0, 32, 0.2)' : 'none',
                                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                                    order: { xs: 1, sm: 2 },
                                    width: { xs: '100%', sm: 'auto' },
                                    justifyContent: 'center',
                                    '&:hover': canProceed ? {
                                        transform: 'translateY(-2px)',
                                        backgroundColor: 'rgba(146, 0, 32, 1)',
                                        boxShadow: '0 10px 30px rgba(146, 0, 32, 0.3)',
                                        letterSpacing: 1.2,
                                        '& .next-arrow': {
                                            transform: 'translateX(4px)'
                                        }
                                    } : {}
                                }}
                            >
                                Dalej
                                <ChevronRightIcon 
                                    className="next-arrow"
                                    sx={{ 
                                        fontSize: 20,
                                        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }} 
                                />
                            </Box>
                        </Box>
                    </Stack>
                )}

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

export default NewProjectPage;

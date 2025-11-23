import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { 
    Box, 
    Typography, 
    Button, 
    TextField, 
    Stack,
    IconButton,
    InputAdornment,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Google as GoogleIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../../../contexts/AuthContext';
import { createSite } from '../../../services/siteService';
import { WIZARD_STORAGE_KEYS } from '../NewSite/wizardConstants';
import {
    WIZARD_STAGES,
    validateStageAccess,
    getWizardData,
    clearWizardData,
    getStageRoute
} from '../NewSite/wizardStageManager';

const MONTSERRAT_FONT = '"Montserrat", "Inter", "Roboto", "Helvetica", "Arial", sans-serif';

const AnimatedBuilding = () => {
    // Parametry animacji
    const BLOCK_DELAY_IN_ROW = 150; // ms - odstęp między klockami w jednym rzędzie
    const ROW_DELAY = 400; // ms - odstęp między rzędami
    const BUILD_HOLD_TIME = 2000; // ms - czas trzymania pełnej budowli
    const FLY_OUT_DURATION = 1200; // ms - czas wylotu w górę

    const [animationPhase, setAnimationPhase] = useState('building');
    const [currentBlocks, setCurrentBlocks] = useState([]);

    // Możliwe kombinacje klocków (tylko wysokie wersje)
    const blockCombinations = [
        { type: '1-full-tall', blocks: [{ x: '10%', y: '30%', width: '80%', height: '25%' }] },
        { type: '2-half-tall', blocks: [
            { x: '10%', y: '30%', width: '38%', height: '25%' },
            { x: '52%', y: '30%', width: '38%', height: '25%' }
        ]},
        { type: '2-mixed-tall', blocks: [
            { x: '10%', y: '30%', width: '30%', height: '25%' },
            { x: '45%', y: '30%', width: '45%', height: '25%' }
        ]},
        { type: '3-third-tall', blocks: [
            { x: '10%', y: '30%', width: '24%', height: '25%' },
            { x: '38%', y: '30%', width: '24%', height: '25%' },
            { x: '66%', y: '30%', width: '24%', height: '25%' }
        ]}
    ];

    // Generuj 3 rzędy z losowych kombinacji
    const generateBuilding = () => {
        const rows = [];
        const selectedCombinations = [];
        
        // Wybierz 3 losowe kombinacje
        for (let i = 0; i < 3; i++) {
            selectedCombinations.push(blockCombinations[Math.floor(Math.random() * blockCombinations.length)]);
        }
        
        // Oblicz pozycje Y dynamicznie w zależności od wysokości
        let currentY = 10; // Zaczynamy od 10% (przesunięte do góry)
        const gap = 4; // Stały odstęp między rzędami
        
        for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
            const combination = selectedCombinations[rowIndex];
            const blockHeight = parseFloat(combination.blocks[0].height); // Wszystkie klocki w rzędzie mają tę samą wysokość
            
            const rowBlocks = combination.blocks.map((block, blockIndex) => ({
                ...block,
                y: `${currentY}%`,
                id: `${rowIndex}-${blockIndex}`,
                rowIndex,
                blockIndexInRow: blockIndex,
                blocksInRow: combination.blocks.length
            }));
            
            rows.push(...rowBlocks);
            
            // Dodaj wysokość bloku + stały odstęp
            currentY += blockHeight + gap;
        }

        return rows;
    };

    useEffect(() => {
        const blocks = generateBuilding();
        setCurrentBlocks(blocks);

        // Oblicz całkowity czas budowania
        const totalBuildTime = (3 * ROW_DELAY) + (Math.max(...blocks.map(b => b.blocksInRow)) * BLOCK_DELAY_IN_ROW);
        const cycleTime = totalBuildTime + BUILD_HOLD_TIME + FLY_OUT_DURATION + 500;

        const cycleInterval = setInterval(() => {
            const newBlocks = generateBuilding();
            setCurrentBlocks(newBlocks);
            setAnimationPhase('building');
            
            setTimeout(() => {
                setAnimationPhase('flying');
            }, totalBuildTime + BUILD_HOLD_TIME);
        }, cycleTime);

        return () => clearInterval(cycleInterval);
    }, []);

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >


            {/* Building blocks container */}
            <Box
                sx={{
                    position: 'relative',
                    width: '80%',
                    maxWidth: 400,
                    aspectRatio: '3/4',
                    transform: 'translateY(-25px)'
                }}
            >
                {currentBlocks.map((block, index) => {
                    // Module colors array
                    const moduleColors = [
                        '#FF6B6B', // Hero
                        '#4ECDC4', // About
                        '#45B7D1', // Services
                        '#FFA07A', // Gallery
                        '#98D8C8', // Calendar
                        '#FFD93D', // Contact
                        '#A8E6CF', // Text
                        '#C7CEEA', // Video
                        '#F8B195', // Testimonials
                        '#88D8B0', // Pricing
                        '#FFEAA7', // FAQ
                        '#DFE6E9'  // Team
                    ];
                    const blockColor = moduleColors[index % moduleColors.length];
                    // Oblicz delay bazując na poprzednich rzędach
                    let cumulativeDelay = 0;
                    for (let i = 0; i < block.rowIndex; i++) {
                        const previousRowBlocks = currentBlocks.filter(b => b.rowIndex === i);
                        if (previousRowBlocks.length > 0) {
                            const blocksDelay = previousRowBlocks.length * BLOCK_DELAY_IN_ROW;
                            cumulativeDelay += ROW_DELAY + blocksDelay;
                        }
                    }
                    const entryDelay = cumulativeDelay + (block.blockIndexInRow * BLOCK_DELAY_IN_ROW);
                    
                    return (
                        <motion.div
                            key={block.id}
                            initial={{ opacity: 0, y: 300 }}
                            animate={
                                animationPhase === 'building'
                                    ? {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            delay: entryDelay / 1000,
                                            duration: 0.6,
                                            ease: [0.34, 1.56, 0.64, 1]
                                        }
                                    }
                                    : {
                                        opacity: 0,
                                        y: -400,
                                        transition: {
                                            duration: FLY_OUT_DURATION / 1000,
                                            ease: [0.85, 0, 0.15, 1],
                                            delay: (block.rowIndex * 0.05)
                                        }
                                    }
                            }
                            style={{
                                position: 'absolute',
                                left: block.x,
                                top: block.y,
                                width: block.width,
                                height: block.height
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 2,
                                    backgroundColor: `${blockColor}40`, // 40 = ~25% opacity
                                    backdropFilter: 'blur(4px)',
                                    boxShadow: `0 4px 20px ${blockColor}25`,
                                }}
                            />
                        </motion.div>
                    );
                })}
            </Box>

            {/* Pulsing text below */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: { xs: '10%', md: '15%' },
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    width: '100%',
                    px: 2
                }}
            >
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: MONTSERRAT_FONT,
                            fontWeight: 300,
                            letterSpacing: 2,
                            color: 'text.secondary',
                            fontSize: { xs: '1.1rem', md: '1.4rem' }
                        }}
                    >
                        Przygotowujemy Twoją przestrzeń...
                    </Typography>
                </motion.div>
            </Box>
        </Box>
    );
};

const BuildingLoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { googleLogin, user } = useAuth();

    const [showEmailForm, setShowEmailForm] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const siteCreationAttemptedRef = useRef(false);

    // Validate stage access on mount
    useEffect(() => {
        const validation = validateStageAccess(WIZARD_STAGES.LOGIN);
        
        if (!validation.canAccess) {
            // Redirect to the appropriate stage
            navigate(validation.redirectTo, { replace: true });
            return;
        }
    }, [navigate]);

    const handleCreateSiteAfterLogin = useCallback(async () => {
        // Prevent duplicate site creation
        if (siteCreationAttemptedRef.current) {
            return;
        }

        try {
            // Odczytaj zapisane dane z localStorage
            const wizardData = getWizardData();
            
            if (!wizardData || !wizardData.templateConfig) {
                navigate(getStageRoute(WIZARD_STAGES.CATEGORY), { replace: true });
                return;
            }

            // Mark that we're attempting to create a site
            siteCreationAttemptedRef.current = true;
            setIsSubmitting(true);

            // Debug: creating site with name

            // Utwórz stronę
            const newSite = await createSite({
                name: wizardData.name,
                template_config: wizardData.templateConfig
            });

            // Debug: site created successfully

            // Wyczyść dane wizard flow - CRITICAL to prevent re-creation
            clearWizardData();

            // Przekieruj do listy stron
            navigate('/studio/sites', { replace: true });
        } catch (err) {
            // Error: failed to create site
            
            // Check if error is due to duplicate identifier
            if (err.response?.data?.identifier) {
                // Duplicate site detected, clearing wizard data and redirecting
                clearWizardData();
                navigate('/studio/sites', { replace: true });
                return;
            }
            
            setError('Nie udało się utworzyć strony. Spróbuj ponownie.');
            setIsSubmitting(false);
            // Reset flag on error to allow retry
            siteCreationAttemptedRef.current = false;
        }
    }, [navigate]);

    useEffect(() => {
        // Sprawdź czy użytkownik jest już zalogowany
        if (user && !siteCreationAttemptedRef.current) {
            handleCreateSiteAfterLogin();
        }
    }, [user, handleCreateSiteAfterLogin]);

    const handleGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsSubmitting(true);
            setError('');
            try {
                await googleLogin(tokenResponse.access_token);
                // handleCreateSiteAfterLogin zostanie wywołane przez useEffect po zalogowaniu
            } catch (err) {
                setError('Nie udało się zalogować przez Google. Spróbuj ponownie.');
                setIsSubmitting(false);
            }
        },
        onError: () => {
            setError('Wystąpił błąd po stronie Google. Spróbuj ponownie.');
            setIsSubmitting(false);
        }
    });

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLogin && password !== confirmPassword) {
            setError('Hasła nie są identyczne');
            return;
        }

        // TODO: Implementacja logowania/rejestracji emailem
        setError('Logowanie emailem będzie dostępne wkrótce');
    };

    const benefits = [
        { icon: <CheckCircleOutlineIcon />, text: 'Zapisz swoją konfigurację' },
        { icon: <CheckCircleOutlineIcon />, text: 'Zarządzaj wszystkimi stronami' },
        { icon: <CheckCircleOutlineIcon />, text: 'Publikuj kiedy chcesz' }
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'background.default'
            }}
        >
            {/* Lewa strona - Animacja */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{
                    flex: isMobile ? '0 0 40vh' : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}
            >
                <AnimatedBuilding />
            </motion.div>

            {/* Prawa strona - Moduł logowania */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 3, md: 6 },
                    position: 'relative'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{ width: '100%', maxWidth: 480 }}
                >
                    <Box
                        sx={{
                            backgroundColor: 'background.paper',
                            borderRadius: 4,
                            p: { xs: 3, md: 5 },
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        {/* Header */}
                        <Stack spacing={2} sx={{ mb: 4 }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontFamily: '"Playfair Display", "Georgia", serif',
                                    fontWeight: 600,
                                    letterSpacing: '-0.01em',
                                    background: (theme) => theme.palette.mode === 'light'
                                        ? 'linear-gradient(135deg, rgb(146, 0, 32) 0%, rgb(30, 30, 30) 100%)'
                                        : 'linear-gradient(135deg, rgb(114, 0, 21) 0%, rgb(220, 220, 220) 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontSize: { xs: '2rem', md: '2.5rem' }
                                }}
                            >
                                Jeszcze moment...
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: 'text.secondary',
                                    lineHeight: 1.7,
                                    fontSize: { xs: '0.95rem', md: '1.05rem' }
                                }}
                            >
                                Budujemy fundamenty Twojej strony. W tym czasie utwórz bezpieczne konto.
                            </Typography>
                        </Stack>

                        {/* Benefits */}
                        <Stack spacing={1.5} sx={{ mb: 4 }}>
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                color: 'primary.main',
                                                display: 'flex',
                                                fontSize: { xs: '1.2rem', md: '1.4rem' }
                                            }}
                                        >
                                            {benefit.icon}
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'text.primary',
                                                fontWeight: 500,
                                                fontSize: { xs: '0.9rem', md: '1rem' }
                                            }}
                                        >
                                            {benefit.text}
                                        </Typography>
                                    </Box>
                                </motion.div>
                            ))}
                        </Stack>

                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Box
                                    sx={{
                                        mb: 3,
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: 'error.light',
                                        color: 'error.contrastText',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {error}
                                </Box>
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {!showEmailForm ? (
                                <motion.div
                                    key="buttons"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Stack spacing={2}>
                                        {/* Google Login */}
                                        <Button
                                            fullWidth
                                            size="large"
                                            variant="contained"
                                            startIcon={<GoogleIcon />}
                                            onClick={handleGoogle}
                                            disabled={isSubmitting}
                                            sx={{
                                                py: 1.5,
                                                backgroundColor: '#ffffff',
                                                color: '#1f1f1f',
                                                border: '2px solid rgba(0,0,0,0.1)',
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                                '&:hover': {
                                                    backgroundColor: '#f8f8f8',
                                                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                                                    transform: 'translateY(-2px)'
                                                },
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            Kontynuuj z Google
                                        </Button>

                                        {/* Email Option */}
                                        <Button
                                            fullWidth
                                            size="large"
                                            variant="outlined"
                                            onClick={() => setShowEmailForm(true)}
                                            sx={{
                                                py: 1.5,
                                                borderColor: 'primary.main',
                                                color: 'primary.main',
                                                textTransform: 'none',
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                borderWidth: 2,
                                                '&:hover': {
                                                    borderWidth: 2,
                                                    backgroundColor: 'rgba(146, 0, 32, 0.05)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 6px 20px rgba(146, 0, 32, 0.15)'
                                                },
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            Utwórz konto emailem
                                        </Button>

                                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'text.secondary',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        color: 'primary.main',
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                                onClick={() => {
                                                    setShowEmailForm(true);
                                                    setIsLogin(true);
                                                }}
                                            >
                                                Mam już konto
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <form onSubmit={handleEmailSubmit}>
                                        <Stack spacing={3}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        '&:hover fieldset': {
                                                            borderColor: 'primary.main'
                                                        }
                                                    }
                                                }}
                                            />
                                            <TextField
                                                fullWidth
                                                label="Hasło"
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                edge="end"
                                                            >
                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        '&:hover fieldset': {
                                                            borderColor: 'primary.main'
                                                        }
                                                    }
                                                }}
                                            />
                                            {!isLogin && (
                                                <TextField
                                                    fullWidth
                                                    label="Potwierdź hasło"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            '&:hover fieldset': {
                                                                borderColor: 'primary.main'
                                                            }
                                                        }
                                                    }}
                                                />
                                            )}

                                            <Button
                                                fullWidth
                                                size="large"
                                                type="submit"
                                                variant="contained"
                                                disabled={isSubmitting}
                                                sx={{
                                                    py: 1.5,
                                                    backgroundColor: 'primary.main',
                                                    color: 'white',
                                                    textTransform: 'none',
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    borderRadius: 2,
                                                    boxShadow: '0 4px 12px rgba(146, 0, 32, 0.25)',
                                                    '&:hover': {
                                                        backgroundColor: 'primary.dark',
                                                        boxShadow: '0 6px 20px rgba(146, 0, 32, 0.35)',
                                                        transform: 'translateY(-2px)'
                                                    },
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                            >
                                                {isLogin ? 'Zaloguj się' : 'Utwórz konto'}
                                            </Button>

                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'text.secondary',
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            color: 'primary.main',
                                                            textDecoration: 'underline'
                                                        }
                                                    }}
                                                    onClick={() => {
                                                        setShowEmailForm(false);
                                                        setError('');
                                                    }}
                                                >
                                                    ← Powrót
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>
                </motion.div>
            </Box>
        </Box>
    );
};

export default BuildingLoginPage;

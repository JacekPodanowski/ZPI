import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Navigation from '../../../components/Navigation/Navigation';
import AnimatedLogo from '../../../components/Logo/AnimatedLogo';
import LegalFooter from '../../components_STUDIO/Legal/LegalFooter';

import { typography } from '../../../theme/typography.js';

const NAVIGATION_ANIMATION_DELAY_MS = 100;
const LOGO_ANIMATION_DELAY_MS = 250;
const MONTSERRAT_BUTTON_FONT = '"Montserrat", "Inter", "Roboto", "Helvetica", "Arial", sans-serif';
const WORDMARK_EXPAND_DURATION_S = 1.2;
const WORDMARK_COLLAPSE_DURATION_S = 0.3;
const SCROLL_INDICATOR_APPEAR_DELAY_MS = LOGO_ANIMATION_DELAY_MS + WORDMARK_EXPAND_DURATION_S * 1000 + 1000;
const NAV_SCROLL_DIRECTION_THRESHOLD_PX = 4;
const NAV_BOTTOM_LOCK_THRESHOLD_PX = 12;

const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [pageVisible, setPageVisible] = useState(false);
    const [logoExpanded, setLogoExpanded] = useState(false);
    const [aboutVisible, setAboutVisible] = useState(false);
    const [isScrollIndicatorReady, setIsScrollIndicatorReady] = useState(false);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);
    const [navVisible, setNavVisible] = useState(true);
    const [ctaVisible, setCtaVisible] = useState(false);
    const aboutRef = useRef(null);
    const ctaRef = useRef(null);
    const lastScrollY = useRef(0);
    const navVisibleRef = useRef(true);

    useEffect(() => {
        const raf = requestAnimationFrame(() => setPageVisible(true));
        const showLogoTimer = setTimeout(() => setLogoExpanded(true), LOGO_ANIMATION_DELAY_MS);

        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(showLogoTimer);
        };
    }, []);

    useEffect(() => {
        const element = aboutRef.current;
        if (!element) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setAboutVisible(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.05, rootMargin: '100px' }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const element = ctaRef.current;
        if (!element) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => setCtaVisible(true), 500);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsScrollIndicatorReady(true);
            if (typeof window !== 'undefined') {
                setShowScrollIndicator(window.scrollY < 80);
            } else {
                setShowScrollIndicator(true);
            }
        }, SCROLL_INDICATOR_APPEAR_DELAY_MS);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isScrollIndicatorReady || typeof window === 'undefined') {
            return undefined;
        }

        const updateVisibility = () => {
            setShowScrollIndicator(window.scrollY < 80);
        };

        updateVisibility();
        window.addEventListener('scroll', updateVisibility, { passive: true });

        return () => window.removeEventListener('scroll', updateVisibility);
    }, [isScrollIndicatorReady]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const maxScrollY = Math.max(
                document.documentElement.scrollHeight - window.innerHeight,
                0
            );
            const isNearTop = currentScrollY < 10;
            const isNearBottom = maxScrollY - currentScrollY <= NAV_BOTTOM_LOCK_THRESHOLD_PX;
            const delta = currentScrollY - lastScrollY.current;

            if (isNearTop) {
                if (!navVisibleRef.current) {
                    setNavVisible(true);
                }
            } else if (delta > NAV_SCROLL_DIRECTION_THRESHOLD_PX && currentScrollY > 100) {
                if (navVisibleRef.current) {
                    setNavVisible(false);
                }
            } else if (delta < -NAV_SCROLL_DIRECTION_THRESHOLD_PX && !isNearBottom) {
                if (!navVisibleRef.current) {
                    setNavVisible(true);
                }
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        navVisibleRef.current = navVisible;

        if (typeof window === 'undefined') {
            return undefined;
        }

        const raf = requestAnimationFrame(() => {
            lastScrollY.current = window.scrollY;
        });

        return () => cancelAnimationFrame(raf);
    }, [navVisible]);

    const proceedToNewSite = useCallback(() => {
        const go = () => {
            // Zawsze przekieruj na /studio/new - logowanie będzie wymagane dopiero przy zapisywaniu strony
            navigate('/studio/new');
        };

        setLogoExpanded(false);
        setTimeout(go, 420);
    }, [isAuthenticated, navigate]);

    const goToLogin = useCallback(() => {
        setLogoExpanded(false);
        setTimeout(() => navigate('/login'), 420);
    }, [navigate]);

    const narrativeSlices = useMemo(
        () => ([
            {
                id: 'essence',
                eyebrow: 'philosophy',
                headline: 'Przestrzeń oddycha',
                body: 'Projektujemy doświadczenia, które słuchają – układy reagują na gest, kolory pulsują z emocją, a treści pojawiają się dokładnie wtedy, kiedy są potrzebne.',
                visual: 'wave'
            },
            {
                id: 'flow',
                eyebrow: 'interaction',
                headline: 'Ruch jest językiem',
                body: 'Każda interakcja to choreografia mikroanimacji, którą czujesz w palcach. Scrollowanie staje się historią, a hover odkrywa nowe warstwy znaczeń.',
                visual: 'ripple'
            },
            {
                id: 'horizon',
                eyebrow: 'vision',
                headline: 'Horyzont bez granic',
                body: 'Nie budujemy stron – tworzymy światy, które ewoluują z Twoją marką. Studio to żywy ekosystem, w którym pomysły rosną organicznie.',
                visual: 'bloom'
            }
        ]), []);

    return (
        <>
            <Navigation />
            <Box 
                component="main" 
                sx={{ 
                    position: 'relative', 
                    overflow: 'hidden', 
                    backgroundColor: (theme) => theme.palette.background.default,
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    perspective: 1000,
                    transform: 'translateZ(0)',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale'
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        overflow: 'hidden',
                        '& > span': {
                            position: 'absolute',
                            borderRadius: '50%'
                        }
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            width: { xs: '68vw', md: '42vw' },
                            height: { xs: '68vw', md: '42vw' },
                            top: { xs: '-28vw', md: '-18vw' },
                            right: { xs: '-32vw', md: '-14vw' },
                            background: 'radial-gradient(circle, rgba(146,0,32,0.08) 0%, rgba(146,0,32,0) 70%)',
                            animation: 'accentDriftOne 32s ease-in-out infinite',
                            '@keyframes accentDriftOne': {
                                '0%': { transform: 'translate3d(0,0,0)', opacity: 0.65 },
                                '50%': { transform: 'translate3d(-6vw, 4vw, 0)', opacity: 0.35 },
                                '100%': { transform: 'translate3d(0,0,0)', opacity: 0.65 }
                            }
                        }}
                    />
                    <Box
                        component="span"
                        sx={{
                            width: { xs: '80vw', md: '46vw' },
                            height: { xs: '80vw', md: '46vw' },
                            bottom: { xs: '-30vw', md: '-24vw' },
                            left: { xs: '-34vw', md: '-16vw' },
                            background: 'radial-gradient(circle, rgba(114,0,21,0.06) 0%, rgba(114,0,21,0) 68%)',
                            animation: 'accentDriftTwo 38s ease-in-out infinite',
                            '@keyframes accentDriftTwo': {
                                '0%': { transform: 'translate3d(0,0,0) scale(0.92)', opacity: 0.5 },
                                '50%': { transform: 'translate3d(5vw,-6vw,0) scale(1.08)', opacity: 0.3 },
                                '100%': { transform: 'translate3d(0,0,0) scale(0.92)', opacity: 0.5 }
                            }
                        }}
                    />
                    <Box
                        component="span"
                        sx={{
                            width: { xs: '55vw', md: '28vw' },
                            height: { xs: '55vw', md: '28vw' },
                            top: { xs: '40vh', md: '38vh' },
                            left: { xs: '20vw', md: '35vw' },
                            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
                            animation: 'accentDriftThree 28s ease-in-out infinite',
                            '@keyframes accentDriftThree': {
                                '0%': { transform: 'translate3d(0,0,0) scale(1)' },
                                '50%': { transform: 'translate3d(4vw,3vw,0) scale(1.06)' },
                                '100%': { transform: 'translate3d(0,0,0) scale(1)' }
                            }
                        }}
                    />
                </Box>

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box
                        sx={{
                            position: 'relative',
                            minHeight: { xs: '85vh', md: '80vh' },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: { xs: 6, md: 8 },
                            backgroundColor: 'transparent'
                        }}
                    >
                        <Container maxWidth="lg">
                        <Stack
                            spacing={{ xs: 6, md: 8 }}
                            sx={{
                                alignItems: 'center',
                                textAlign: 'center',
                                opacity: pageVisible ? 1 : 0,
                                transform: pageVisible ? 'translateY(0)' : 'translateY(-48px)',
                                transition: 'opacity 0.8s ease, transform 0.8s ease',
                                transitionDelay: pageVisible ? '0.1s' : '0s'
                            }}
                        >
                            <Box
                                sx={{
                                    transform: {
                                        xs: 'scale(1.08)',
                                        sm: 'scale(1.12)',
                                        md: 'scale(1.28)'
                                    },
                                    transformOrigin: 'center top'
                                }}
                            >
                                <AnimatedLogo
                                    expanded={logoExpanded}
                                    allowToggle={false}
                                    align="center"
                                    size="heroLarge"
                                    expandDuration={WORDMARK_EXPAND_DURATION_S}
                                    collapseDuration={WORDMARK_COLLAPSE_DURATION_S}
                                />
                            </Box>

                            <Stack spacing={2} sx={{ maxWidth: 720 }}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'text.primary',
                                        letterSpacing: { xs: 0.5, md: 1 },
                                        lineHeight: 1.4
                                    }}
                                >
                                    Zmień swój pomysł w stronę,<br />
                                    która oddycha spokojem i&nbsp;profesjonalizmem.
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'text.secondary',
                                        maxWidth: 640,
                                        mx: 'auto',
                                        lineHeight: 1.6
                                    }}
                                >
                                    Poprowadzimy cię krok po kroku — od&nbsp;inspiracji,<br />
                                    aż po publikację na własnej domenie.
                                </Typography>
                            </Stack>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                alignItems="center"
                                spacing={{ xs: 2.5, sm: 3 }}
                                sx={{ mt: { xs: 4, md: 6 } }}
                            >
                                <Button
                                    onClick={goToLogin}
                                    size="large"
                                    sx={{
                                        px: { xs: 6, sm: 8 },
                                        py: { xs: 1.8, sm: 2 },
                                        fontSize: { xs: '1rem', sm: '1.1rem' },
                                        fontWeight: 600,
                                        fontFamily: MONTSERRAT_BUTTON_FONT,
                                        backgroundColor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255,255,255,0.12)'
                                                : '#ffffff',
                                        color: 'primary.main',
                                        borderRadius: 5,
                                        boxShadow: '0 12px 28px rgba(146,0,32,0.12)',
                                        border: '1px solid',
                                        borderColor: 'primary.main',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255,255,255,0.18)'
                                                    : 'rgba(255,255,255,0.9)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 16px 32px rgba(146,0,32,0.18)'
                                        }
                                    }}
                                >
                                    Zaloguj się do Studia
                                </Button>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: 4,
                                        color: 'text.secondary'
                                    }}
                                >
                                    lub
                                </Typography>
                                <Button
                                    size="large"
                                    variant="contained"
                                    color="primary"
                                    onClick={proceedToNewSite}
                                    sx={{
                                        px: { xs: 6.5, sm: 8.5 },
                                        py: { xs: 1.8, sm: 2 },
                                        fontSize: { xs: '1rem', sm: '1.1rem' },
                                        fontWeight: 600,
                                        fontFamily: MONTSERRAT_BUTTON_FONT,
                                        borderRadius: 5,
                                        boxShadow: '0 16px 36px rgba(146,0,32,0.2)',
                                        transition: 'transform 0.28s ease',
                                        '&:hover': {
                                            transform: 'translateY(-3px) scale(1.02)',
                                            boxShadow: '0 24px 42px rgba(146,0,32,0.28)'
                                        }
                                    }}
                                >
                                    Stwórz swoją stronę
                                </Button>
                            </Stack>
                        </Stack>
                    </Container>

                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: { xs: 32, md: 48 },
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                pointerEvents: 'none',
                                opacity: showScrollIndicator ? 1 : 0,
                                transition: 'opacity 0.6s ease',
                                color: 'text.secondary',
                                '@keyframes scrollIndicatorPulse': {
                                    '0%': { transform: 'translateY(0)', opacity: 1 },
                                    '50%': { transform: 'translateY(1.5px)', opacity: 0.82 },
                                    '100%': { transform: 'translateY(0)', opacity: 1 }
                                }
                            }}
                        >
                            <Box
                                sx={{
                                    transform: 'scaleX(2)',
                                    transformOrigin: 'center'
                                }}
                            >
                                <KeyboardArrowDownOutlinedIcon
                                    sx={{
                                        fontSize: 42,
                                        color: (theme) => (theme.palette.mode === 'dark'
                                            ? 'rgba(220,220,220,0.35)'
                                            : 'rgba(30,30,30,0.32)'),
                                        animation: showScrollIndicator ? 'scrollIndicatorPulse 3s ease-in-out infinite' : 'none'
                                    }}
                                />
                            </Box>
                        </Box>

                    </Box>

                    <Box
                        ref={aboutRef}
                        sx={{
                            position: 'relative',
                            py: { xs: 12, md: 16 },
                            pb: { xs: 5, md: 6 },
                            backgroundColor: 'transparent',
                            overflow: 'hidden'
                        }}
                    >
                    <Container maxWidth="lg">
                        <Stack
                            spacing={{ xs: 6, md: 8 }}
                            sx={{
                                textAlign: 'center',
                                alignItems: 'center',
                                opacity: aboutVisible ? 1 : 0,
                                transform: aboutVisible ? 'translateY(0)' : 'translateY(64px)',
                                transition: 'opacity 0.9s ease, transform 0.9s ease',
                                transitionDelay: aboutVisible ? '0.05s' : '0s'
                            }}
                        >
                            <Stack spacing={2} sx={{ maxWidth: 880 }}>
                                <Typography
                                    variant="overline"
                                    sx={{
                                        letterSpacing: 8,
                                        color: 'secondary.main',
                                        fontWeight: 600
                                    }}
                                >
                                    MANIFEST
                                </Typography>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 700,
                                        background: (muiTheme) =>
                                            muiTheme.palette.mode === 'dark'
                                                ? 'linear-gradient(135deg, rgba(220,220,220,1) 0%, rgba(146,0,32,0.85) 100%)'
                                                : 'linear-gradient(135deg, rgba(30,30,30,1) 0%, rgba(146,0,32,0.9) 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}
                                >
                                    Everyone Deserves Their Truly Own Online Place
                                </Typography>
                            </Stack>

                            <Box
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    maxWidth: 1200,
                                    mx: 'auto'
                                }}
                            >
                                <Stack spacing={{ xs: 8, md: 12 }}>
                                    {narrativeSlices.map((slice, index) => (
                                        <Box
                                            key={slice.id}
                                            sx={{
                                                position: 'relative',
                                                display: 'grid',
                                                gridTemplateColumns: { xs: '1fr', md: index % 2 === 0 ? '1.2fr 1fr' : '1fr 1.2fr' },
                                                gap: { xs: 5, md: 8 },
                                                alignItems: 'center',
                                                opacity: aboutVisible ? 1 : 0,
                                                transform: aboutVisible
                                                    ? 'translateY(0)'
                                                    : `translateY(${80 + index * 20}px)`,
                                                transition: 'opacity 1.2s ease, transform 1.2s ease',
                                                transitionDelay: aboutVisible ? `${0.2 + index * 0.15}s` : '0s'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    order: { xs: 1, md: index % 2 === 0 ? 1 : 2 },
                                                    textAlign: { xs: 'center', md: index % 2 === 0 ? 'left' : 'right' }
                                                }}
                                            >
                                                <Stack spacing={3} alignItems={{ xs: 'center', md: index % 2 === 0 ? 'flex-start' : 'flex-end' }}>
                                                    <Typography
                                                        variant="overline"
                                                        sx={{
                                                            letterSpacing: 5,
                                                            color: 'secondary.main',
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        {slice.eyebrow}
                                                    </Typography>
                                                    <Typography
                                                        variant="h3"
                                                        sx={{
                                                            fontWeight: 700,
                                                            maxWidth: 480
                                                        }}
                                                    >
                                                        {slice.headline}
                                                    </Typography>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            color: 'text.secondary',
                                                            fontWeight: 400,
                                                            maxWidth: 440,
                                                            lineHeight: 1.7
                                                        }}
                                                    >
                                                        {slice.body}
                                                    </Typography>
                                                </Stack>
                                            </Box>

                                            <Box
                                                sx={{
                                                    order: { xs: 2, md: index % 2 === 0 ? 2 : 1 },
                                                    position: 'relative',
                                                    aspectRatio: '1 / 1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transformStyle: 'preserve-3d',
                                                    perspective: '1200px'
                                                }}
                                            >
                                                {slice.visual === 'wave' && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            inset: '-40%',
                                                            background: `
                                                                radial-gradient(circle at 35% 45%, rgba(146,0,32,0.4) 0%, transparent 55%),
                                                                radial-gradient(circle at 65% 55%, rgba(255,255,255,0.25) 0%, transparent 55%)
                                                            `,
                                                            animation: 'waveFlow 10s ease-in-out infinite',
                                                            filter: 'blur(40px)',
                                                            willChange: 'transform, opacity',
                                                            '@keyframes waveFlow': {
                                                                '0%': {
                                                                    transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)',
                                                                    opacity: 0.75
                                                                },
                                                                '33%': {
                                                                    transform: 'translate3d(-8px, -12px, 0) scale(1.12) rotate(2deg)',
                                                                    opacity: 0.95
                                                                },
                                                                '66%': {
                                                                    transform: 'translate3d(8px, 12px, 0) scale(0.92) rotate(-2deg)',
                                                                    opacity: 0.8
                                                                },
                                                                '100%': {
                                                                    transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)',
                                                                    opacity: 0.75
                                                                }
                                                            }
                                                        }}
                                                    />
                                                )}
                                                {slice.visual === 'ripple' && (
                                                    <>
                                                        {[...Array(5)].map((_, i) => (
                                                            <Box
                                                                key={i}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    inset: `${i * 12}%`,
                                                                    borderRadius: '50%',
                                                                    border: '2px solid',
                                                                    borderColor: 'rgba(146,0,32,0.35)',
                                                                    animation: `ripplePulse 7s ease-in-out infinite`,
                                                                    animationDelay: `${i * 0.35}s`,
                                                                    willChange: 'transform, opacity',
                                                                    '@keyframes ripplePulse': {
                                                                        '0%': { transform: 'scale(0.92)', opacity: 0 },
                                                                        '40%': { transform: 'scale(1)', opacity: 0.6 },
                                                                        '80%': { transform: 'scale(1.08)', opacity: 0 },
                                                                        '100%': { transform: 'scale(1.08)', opacity: 0 }
                                                                    }
                                                                }}
                                                            />
                                                        ))}
                                                    </>
                                                )}
                                                {slice.visual === 'bloom' && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            inset: '-30%',
                                                            background: `
                                                                radial-gradient(circle at 50% 50%, rgba(146,0,32,0.35) 0%, transparent 45%),
                                                                conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.25) 90deg, transparent 180deg, rgba(146,0,32,0.25) 270deg, transparent 360deg)
                                                            `,
                                                            animation: 'bloomRotate 16s linear infinite',
                                                            filter: 'blur(28px)',
                                                            willChange: 'transform',
                                                            '@keyframes bloomRotate': {
                                                                '0%': { transform: 'rotate(0deg) scale(1)' },
                                                                '25%': { transform: 'rotate(90deg) scale(1.06)' },
                                                                '50%': { transform: 'rotate(180deg) scale(1)' },
                                                                '75%': { transform: 'rotate(270deg) scale(1.06)' },
                                                                '100%': { transform: 'rotate(360deg) scale(1)' }
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>

                            {/* Integrated glow for CTA */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: '-20%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: { xs: '90%', md: '60%' },
                                    height: '60%',
                                    background: (theme) => theme.palette.mode === 'dark'
                                        ? 'radial-gradient(ellipse, rgba(146,0,32,0.12) 0%, rgba(146,0,32,0.06) 30%, transparent 60%)'
                                        : 'radial-gradient(ellipse, rgba(146,0,32,0.1) 0%, rgba(146,0,32,0.05) 30%, transparent 60%)',
                                    opacity: ctaVisible ? 0.4 : 0,
                                    transition: 'opacity 3s ease',
                                    pointerEvents: 'none',
                                    animation: ctaVisible ? 'integratedGlowPulse 8s ease-in-out infinite' : 'none',
                                    '@keyframes integratedGlowPulse': {
                                        '0%': { opacity: 0.4, transform: 'translateX(-50%) scale(1)' },
                                        '50%': { opacity: 0.55, transform: 'translateX(-50%) scale(1.05)' },
                                        '100%': { opacity: 0.4, transform: 'translateX(-50%) scale(1)' }
                                    }
                                }}
                            />

                            {/* Final CTA */}
                            <Box
                                ref={ctaRef}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mt: { xs: 10, md: 12 },
                                    opacity: aboutVisible ? 1 : 0,
                                    transform: aboutVisible ? 'translateY(0)' : 'translateY(64px)',
                                    transition: 'opacity 0.9s ease, transform 0.9s ease',
                                    transitionDelay: aboutVisible ? '0.05s' : '0s'
                                }}
                            >
                                <Box
                                    onClick={proceedToNewSite}
                                    sx={{
                                        position: 'relative',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        px: { xs: 3, md: 4 },
                                        py: { xs: 1.5, md: 2 },
                                        opacity: ctaVisible ? 1 : 0,
                                        transform: ctaVisible ? 'translateY(0)' : 'translateY(20px)',
                                        transition: 'opacity 2s ease, transform 2s ease',
                                        '&:hover': {
                                            '& .cta-text': {
                                                letterSpacing: 12,
                                                color: 'primary.main'
                                            },
                                            '& .cta-underline': {
                                                width: '100%',
                                                opacity: 1
                                            }
                                        }
                                    }}
                                >
                                    {/* Main text */}
                                    <Typography
                                        className="cta-text"
                                        variant="h5"
                                        sx={{
                                            position: 'relative',
                                            zIndex: 1,
                                            fontWeight: 700,
                                            fontFamily: MONTSERRAT_BUTTON_FONT,
                                            color: 'text.primary',
                                            letterSpacing: 4,
                                            textTransform: 'uppercase',
                                            fontSize: { xs: '1.2rem', md: '1.5rem' },
                                            transition: 'letter-spacing 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.4s ease',
                                            userSelect: 'none'
                                        }}
                                    >
                                        Start Creating
                                    </Typography>

                                    {/* Animated underline */}
                                    <Box
                                        className="cta-underline"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: '30%',
                                            height: 2,
                                            backgroundColor: 'primary.main',
                                            opacity: 0.4,
                                            transition: 'width 0.6s ease, opacity 0.6s ease'
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Stack>
                    </Container>
                    </Box>
                </Box>
            </Box>

            {/* Legal Footer */}
            <LegalFooter />
        </>
    );
};

export default HomePage;

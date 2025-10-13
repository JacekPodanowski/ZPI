import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Navigation from '../../../components/Navigation/Navigation';
import AnimatedWordmark from '../../../components/Logo/AnimatedWordmark';

const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [pageVisible, setPageVisible] = useState(false);
    const [logoExpanded, setLogoExpanded] = useState(false);
    const [aboutVisible, setAboutVisible] = useState(false);
    const aboutRef = useRef(null);

    useEffect(() => {
        const raf = requestAnimationFrame(() => setPageVisible(true));
        const showLogoTimer = setTimeout(() => setLogoExpanded(true), 1600);

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
            { threshold: 0.2 }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    const proceedToNewSite = useCallback(() => {
        const go = () => {
            if (isAuthenticated) {
                navigate('/studio/new');
            } else {
                navigate('/login', { state: { from: { pathname: '/studio/new' } } });
            }
        };

        setLogoExpanded(false);
        setTimeout(go, 420);
    }, [isAuthenticated, navigate]);

    const goToLogin = useCallback(() => {
        setLogoExpanded(false);
        setTimeout(() => navigate('/login'), 420);
    }, [navigate]);

    const goToStyles = useCallback(() => {
        setLogoExpanded(false);
        setTimeout(() => navigate('/styles'), 420);
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
            <Box component="main" sx={{ position: 'relative', overflow: 'hidden', backgroundColor: (theme) => theme.palette.background.default }}>
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
                            minHeight: '100vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: { xs: 8, md: 12 },
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
                                <AnimatedWordmark
                                    expanded={logoExpanded}
                                    allowToggle={false}
                                    align="center"
                                    size="hero"
                                    duration={1.4}
                                />
                            </Box>

                            <Stack spacing={2} sx={{ maxWidth: 720 }}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'text.primary',
                                        letterSpacing: { xs: 1, md: 1.5 }
                                    }}
                                >
                                    Zmień pomysł w stronę, która oddycha spokojem i profesjonalizmem.
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'text.secondary',
                                        maxWidth: 640,
                                        mx: 'auto'
                                    }}
                                >
                                    Poprowadzimy cię krok po kroku — od inspiracji, aż po publikację na własnej domenie.
                                </Typography>
                            </Stack>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                alignItems="center"
                                spacing={{ xs: 2.5, sm: 3 }}
                            >
                                <Button
                                    onClick={goToLogin}
                                    size="large"
                                    sx={{
                                        px: { xs: 5, sm: 6 },
                                        py: { xs: 1.4, sm: 1.6 },
                                        fontWeight: 600,
                                        backgroundColor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255,255,255,0.12)'
                                                : '#ffffff',
                                        color: 'primary.main',
                                        borderRadius: 999,
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
                                        px: { xs: 5.5, sm: 7 },
                                        py: { xs: 1.4, sm: 1.6 },
                                        fontWeight: 600,
                                        borderRadius: 999,
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

                            <Button
                                variant="text"
                                onClick={goToStyles}
                                sx={{
                                    textTransform: 'none',
                                    color: 'secondary.main',
                                    fontWeight: 500,
                                    '&:hover': {
                                        color: 'primary.main'
                                    }
                                }}
                            >
                                Zobacz style aplikacji
                            </Button>
                        </Stack>
                    </Container>

                    </Box>

                    <Box
                        ref={aboutRef}
                        sx={{
                            position: 'relative',
                            py: { xs: 14, md: 18 },
                            backgroundColor: 'transparent'
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
                                    Tworzymy sztukę, która żyje w sieci
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: 'text.secondary',
                                        fontWeight: 400,
                                        maxWidth: 720,
                                        mx: 'auto'
                                    }}
                                >
                                    Gdzie kod spotyka emocję, a technologia staje się niewidzialna – pozostaje tylko doświadczenie.
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
                                                    borderRadius: 6,
                                                    overflow: 'hidden',
                                                    background: (muiTheme) =>
                                                        muiTheme.palette.mode === 'dark'
                                                            ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(20,20,20,0.85) 100%)'
                                                            : 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,244,238,0.88) 100%)',
                                                    border: '1px solid',
                                                    borderColor: 'rgba(146,0,32,0.15)',
                                                    boxShadow: '0 32px 64px rgba(0,0,0,0.12)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {slice.visual === 'wave' && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            background: `
                                                                radial-gradient(circle at 30% 40%, rgba(146,0,32,0.3) 0%, transparent 50%),
                                                                radial-gradient(circle at 70% 60%, rgba(255,255,255,0.15) 0%, transparent 50%)
                                                            `,
                                                            animation: 'waveFlow 12s ease-in-out infinite',
                                                            '@keyframes waveFlow': {
                                                                '0%': {
                                                                    transform: 'translate3d(0,0,0) scale(1) rotate(0deg)',
                                                                    opacity: 0.8
                                                                },
                                                                '33%': {
                                                                    transform: 'translate3d(-20px, 15px, 0) scale(1.1) rotate(3deg)',
                                                                    opacity: 1
                                                                },
                                                                '66%': {
                                                                    transform: 'translate3d(15px, -20px, 0) scale(0.95) rotate(-2deg)',
                                                                    opacity: 0.85
                                                                },
                                                                '100%': {
                                                                    transform: 'translate3d(0,0,0) scale(1) rotate(0deg)',
                                                                    opacity: 0.8
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
                                                                    borderColor: 'rgba(146,0,32,0.25)',
                                                                    animation: `ripplePulse 8s ease-in-out infinite`,
                                                                    animationDelay: `${i * 0.4}s`,
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
                                                            inset: 0,
                                                            background: `
                                                                radial-gradient(circle at 50% 50%, rgba(146,0,32,0.25) 0%, transparent 40%),
                                                                conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.15) 90deg, transparent 180deg, rgba(146,0,32,0.15) 270deg, transparent 360deg)
                                                            `,
                                                            animation: 'bloomRotate 20s linear infinite',
                                                            '@keyframes bloomRotate': {
                                                                '0%': { transform: 'rotate(0deg) scale(1)' },
                                                                '50%': { transform: 'rotate(180deg) scale(1.05)' },
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
                        </Stack>
                    </Container>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default HomePage;

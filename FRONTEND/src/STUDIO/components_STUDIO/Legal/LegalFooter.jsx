import { Box, Container, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Logo from '../../../components/Logo/Logo';

const LegalFooter = () => {
    return (
        <Box
            component="footer"
            sx={{
                mt: 8,
                py: 2.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.default'
            }}
        >
            <Container maxWidth="lg">
                {/* Górna linia - Logo wycentrowane */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1.5,
                        position: 'relative'
                    }}
                >
                    {/* Logo i NIP wycentrowane */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: 0.5,
                        width: '100%'
                    }}>
                        <Box sx={{ display: 'inline-flex', justifyContent: 'center' }}>
                            <Logo />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                            NIP: 8993042136
                        </Typography>
                    </Box>

                    {/* Linki do stron prawnych */}
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link
                            component={RouterLink}
                            to="/terms"
                            sx={{
                                color: 'text.secondary',
                                textDecoration: 'none',
                                fontSize: '0.7rem',
                                '&:hover': {
                                    color: 'primary.main',
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            Regulamin
                        </Link>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>•</Typography>
                        <Link
                            component={RouterLink}
                            to="/policy"
                            sx={{
                                color: 'text.secondary',
                                textDecoration: 'none',
                                fontSize: '0.7rem',
                                '&:hover': {
                                    color: 'primary.main',
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            Polityka Prywatności
                        </Link>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>•</Typography>
                        <Link
                            component={RouterLink}
                            to="/guide"
                            sx={{
                                color: 'text.secondary',
                                textDecoration: 'none',
                                fontSize: '0.7rem',
                                '&:hover': {
                                    color: 'primary.main',
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            Poradnik
                        </Link>
                    </Box>
                </Box>

                {/* Dolna linia - Operator płatności i ikony */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        flexWrap: 'wrap'
                    }}
                >
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.65rem',
                            textAlign: 'center',
                            lineHeight: 1.4
                        }}
                    >
                        Operator płatności: PayPro SA Agent Rozliczeniowy, ul. Pastelowa 8, 60-198 Poznań, KRS 0000347935, NIP 7792369887, REGON 301345068
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <svg width="24" height="16" viewBox="0 0 48 32" fill="none" style={{ opacity: 0.7 }}>
                            <rect width="48" height="32" rx="4" fill="#1434CB"/>
                            <path d="M20 16h-4v-4h4v4zm0 4h-4v-4h4v4zm8-4h-4v-4h4v4zm0 4h-4v-4h4v4z" fill="white"/>
                            <text x="24" y="28" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">VISA</text>
                        </svg>
                        <svg width="24" height="16" viewBox="0 0 48 32" fill="none" style={{ opacity: 0.7 }}>
                            <rect width="48" height="32" rx="4" fill="#EB001B"/>
                            <circle cx="18" cy="16" r="10" fill="#FF5F00" opacity="0.8"/>
                            <circle cx="30" cy="16" r="10" fill="#F79E1B" opacity="0.8"/>
                        </svg>
                        <svg width="24" height="16" viewBox="0 0 48 32" fill="none" style={{ opacity: 0.7 }}>
                            <rect width="48" height="32" rx="4" fill="white" stroke="#E5E5E5"/>
                            <text x="24" y="20" fontSize="10" fill="#000" textAnchor="middle" fontWeight="bold">BLIK</text>
                        </svg>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default LegalFooter;

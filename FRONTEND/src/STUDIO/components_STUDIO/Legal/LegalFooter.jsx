import React, { useState } from 'react';
import { Box, Container, Typography, Link, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Logo from '../../../components/Logo/Logo';
import Regulamin from './Regulamin';
import PolitykaPrywatnosci from './PolitykaPrywatnosci';

const LegalFooter = () => {
    const [openRegulamin, setOpenRegulamin] = useState(false);
    const [openPrivacy, setOpenPrivacy] = useState(false);

    return (
        <>
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
                        {/* Logo i NIP wycentrowane - przesunięte w lewo */}
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

                        {/* Linki wycentrowane */}
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Link
                                component="button"
                                onClick={() => setOpenRegulamin(true)}
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
                                component="button"
                                onClick={() => setOpenPrivacy(true)}
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

            {/* Modal - Regulamin */}
            <Modal
                open={openRegulamin}
                onClose={() => setOpenRegulamin(false)}
                aria-labelledby="regulamin-modal"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: '80%', md: '70%' },
                        maxWidth: 900,
                        maxHeight: '90vh',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                        overflow: 'auto'
                    }}
                >
                    <IconButton
                        onClick={() => setOpenRegulamin(false)}
                        sx={{ position: 'absolute', top: 16, right: 16 }}
                    >
                        <CloseIcon />
                    </IconButton>
                    
                    <Regulamin />
                </Box>
            </Modal>

            {/* Modal - Polityka Prywatności */}
            <Modal
                open={openPrivacy}
                onClose={() => setOpenPrivacy(false)}
                aria-labelledby="privacy-modal"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '90%', sm: '80%', md: '70%' },
                        maxWidth: 900,
                        maxHeight: '90vh',
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                        overflow: 'auto'
                    }}
                >
                    <IconButton
                        onClick={() => setOpenPrivacy(false)}
                        sx={{ position: 'absolute', top: 16, right: 16 }}
                    >
                        <CloseIcon />
                    </IconButton>
                    
                    <PolitykaPrywatnosci />
                </Box>
            </Modal>
        </>
    );
};

export default LegalFooter;

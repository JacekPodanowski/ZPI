import React, { useState } from 'react';
import { Box, Container, Typography, Link, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Logo from '../../components/Logo/Logo';

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
                            transform: 'translateX(-16px)' // połowa szerokości logo (32px / 2)
                        }}>
                            <Box sx={{ width: 32, height: 32, flexShrink: 0 }}>
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
                    
                    <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                        Regulamin sprzedaży
                    </Typography>
                    
                    <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        1. Dane sprzedawcy
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Sprzedawca: YourEasySite.com<br />
                        NIP: 8993042136
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        2. Warunki płatności
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Płatności realizowane są poprzez system Przelewy24. Dostępne metody płatności: 
                        przelewy online, karty płatnicze (Visa, Mastercard), BLIK.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        <strong>Operator płatności kartami:</strong> PayPro SA Agent Rozliczeniowy, 
                        ul. Pastelowa 8, 60-198 Poznań, wpisany do Rejestru Przedsiębiorców Krajowego 
                        Rejestru Sądowego prowadzonego przez Sąd Rejonowy Poznań Nowe Miasto i Wilda w Poznaniu, 
                        VIII Wydział Gospodarczy Krajowego Rejestru Sądowego pod numerem KRS 0000347935, 
                        NIP 7792369887, REGON 301345068.
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        3. Warunki dostawy
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Usługi świadczone są w formie elektronicznej. Dostęp do serwisu następuje 
                        niezwłocznie po potwierdzeniu płatności.
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        4. Prawo odstąpienia od umowy
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Zgodnie z art. 38 pkt 13 Ustawy o prawach konsumenta, konsument nie ma prawa 
                        odstąpienia od umowy o dostarczanie treści cyfrowych, które nie są zapisane na 
                        nośniku materialnym, jeżeli spełnianie świadczenia rozpoczęło się za wyraźną zgodą 
                        konsumenta przed upływem terminu do odstąpienia od umowy i po poinformowaniu go 
                        przez przedsiębiorcę o utracie prawa odstąpienia od umowy.
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Wzór oświadczenia o odstąpieniu od umowy dostępny jest na żądanie pod adresem email 
                        wskazanym w danych kontaktowych.
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        5. Reklamacje
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Reklamacje dotyczące świadczonych usług można zgłaszać na adres email wskazany 
                        w danych kontaktowych. Reklamacje będą rozpatrywane w terminie 14 dni od daty ich otrzymania.
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        6. Postanowienia końcowe
                    </Typography>
                    <Typography variant="body2" paragraph>
                        W sprawach nieuregulowanych niniejszym Regulaminem mają zastosowanie przepisy 
                        Kodeksu cywilnego oraz Ustawy o prawach konsumenta.
                    </Typography>
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
                    
                    <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                        Polityka Prywatności
                    </Typography>
                    
                    <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        1. Administrator danych
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Administratorem danych osobowych jest YourEasySite.com, NIP: 8993042136.
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        2. Cele i podstawy prawne przetwarzania
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Dane osobowe przetwarzane są w następujących celach:
                    </Typography>
                    <Typography variant="body2" component="div" paragraph>
                        <ul>
                            <li>Realizacja umowy o świadczenie usług (art. 6 ust. 1 lit. b RODO)</li>
                            <li>Wystawianie faktur (art. 6 ust. 1 lit. c RODO)</li>
                            <li>Marketing bezpośredni (art. 6 ust. 1 lit. f RODO)</li>
                            <li>Obsługa zapytań i komunikacja (art. 6 ust. 1 lit. f RODO)</li>
                        </ul>
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        3. Odbiorcy danych
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Dane osobowe mogą być przekazywane następującym kategoriom odbiorców:
                    </Typography>
                    <Typography variant="body2" component="div" paragraph>
                        <ul>
                            <li>Dostawcy usług IT i hostingowych</li>
                            <li>Operatorzy płatności (PayPro SA - Przelewy24)</li>
                            <li>Firmy księgowe</li>
                            <li>Organy publiczne w zakresie wymaganym prawem</li>
                        </ul>
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        4. Okresy przechowywania danych
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Dane osobowe przechowywane są przez okres:
                    </Typography>
                    <Typography variant="body2" component="div" paragraph>
                        <ul>
                            <li>Niezbędny do realizacji umowy</li>
                            <li>Wymagany przepisami prawa (np. rachunkowe - 5 lat)</li>
                            <li>Do momentu wniesienia sprzeciwu (w przypadku marketingu)</li>
                        </ul>
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        5. Prawa użytkownika
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Użytkownik ma prawo do:
                    </Typography>
                    <Typography variant="body2" component="div" paragraph>
                        <ul>
                            <li>Dostępu do swoich danych osobowych</li>
                            <li>Sprostowania danych</li>
                            <li>Usunięcia danych</li>
                            <li>Ograniczenia przetwarzania</li>
                            <li>Przenoszenia danych</li>
                            <li>Wniesienia sprzeciwu wobec przetwarzania</li>
                            <li>Cofnięcia zgody w dowolnym momencie</li>
                            <li>Wniesienia skargi do organu nadzorczego (UODO)</li>
                        </ul>
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        6. Pliki cookies
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Serwis wykorzystuje pliki cookies w celu zapewnienia prawidłowego działania strony, 
                        personalizacji treści oraz analizy ruchu. Użytkownik może zarządzać plikami cookies 
                        poprzez ustawienia przeglądarki.
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        7. Bezpieczeństwo danych
                    </Typography>
                    <Typography variant="body2" paragraph>
                        Administrator stosuje odpowiednie środki techniczne i organizacyjne w celu 
                        zabezpieczenia danych osobowych przed nieuprawnionym dostępem, utratą lub zniszczeniem.
                    </Typography>
                </Box>
            </Modal>
        </>
    );
};

export default LegalFooter;

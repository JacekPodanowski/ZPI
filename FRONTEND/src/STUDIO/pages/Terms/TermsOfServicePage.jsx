import React from 'react';
import { Box, Container, Paper, Typography, Divider } from '@mui/material';
import Logo from '../../../components/Logo/Logo';

const TermsOfServicePage = () => {
    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
            <Container maxWidth="md">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, md: 6 },
                        borderRadius: 5,
                        border: '1px solid rgba(160, 0, 22, 0.14)'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <Logo size="large" variant="shadow" />
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center', mb: 2 }}>
                        Regulamin Świadczenia Usług
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
                        Wersja 1.0 | Ostatnia aktualizacja: 3 listopada 2025
                    </Typography>
                    <Divider sx={{ mb: 4 }} />

                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                        1. Postanowienia ogólne
                    </Typography>
                    <Typography paragraph>
                        Niniejszy regulamin określa zasady korzystania z platformy YourEasySite, dostępnej pod adresem youreasy.site. Właścicielem i administratorem platformy jest firma "YES Services".
                    </Typography>
                    
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 4 }}>
                        2. Definicje
                    </Typography>
                    <Typography paragraph>
                        <b>Użytkownik</b> – osoba fizyczna, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, która korzysta z usług świadczonych drogą elektroniczną przez Usługodawcę.
                        <br />
                        <b>Usługa</b> – usługa świadczona drogą elektroniczną przez Usługodawcę, polegająca na udostępnieniu narzędzi do tworzenia i zarządzania stronami internetowymi.
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 4 }}>
                        3. Rodzaj i zakres usług
                    </Typography>
                    <Typography paragraph>
                        Platforma YourEasySite umożliwia tworzenie, personalizację oraz publikację stron internetowych w oparciu o dostępne szablony i moduły. Zakres funkcjonalności zależy od wybranego planu subskrypcyjnego.
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 4 }}>
                        4. Odpowiedzialność
                    </Typography>
                    <Typography paragraph>
                        Usługodawca nie ponosi odpowiedzialności za treści publikowane przez Użytkowników na stworzonych przez nich stronach. Użytkownik jest zobowiązany do przestrzegania obowiązującego prawa oraz praw autorskich.
                    </Typography>

                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mt: 4 }}>
                        5. Postanowienia końcowe
                    </Typography>
                    <Typography paragraph>
                        Usługodawca zastrzega sobie prawo do wprowadzania zmian w regulaminie. O wszelkich zmianach Użytkownicy zostaną poinformowani drogą elektroniczną.
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default TermsOfServicePage;

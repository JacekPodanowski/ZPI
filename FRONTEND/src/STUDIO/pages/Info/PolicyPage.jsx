import React from 'react';
import { Box, Container, Typography, Paper, Stack } from '@mui/material';
import useTheme from '../../../theme/useTheme';
import Navigation from '../../../components/Navigation/Navigation';

const PolicyPage = () => {
  const theme = useTheme();

  return (
    <>
      <Navigation />
      <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.mode === 'dark' ? 'rgb(12, 12, 12)' : 'rgb(228, 229, 218)',
        py: 8
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)'
              }}
            >
              Polityka Prywatności
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.mode === 'dark' ? 'rgb(188, 186, 179)' : 'rgb(70, 70, 68)'
              }}
            >
              Informacje o przetwarzaniu danych osobowych
            </Typography>
          </Box>

          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)'
                  }}
                >
                  1. Administrator danych
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)',
                    lineHeight: 1.8
                  }}
                >
                  Administratorem danych osobowych jest YourEasySite.com, NIP: 8993042136.
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)'
                  }}
                >
                  2. Cele i podstawy prawne przetwarzania
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)',
                    lineHeight: 1.8,
                    mb: 1
                  }}
                >
                  Dane osobowe przetwarzane są w następujących celach:
                </Typography>
                <Box component="ul" sx={{ pl: 3 }}>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Realizacja umowy o świadczenie usług (art. 6 ust. 1 lit. b RODO)
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Wystawianie faktur (art. 6 ust. 1 lit. c RODO)
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Marketing bezpośredni (art. 6 ust. 1 lit. f RODO)
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8 }}>
                    Obsługa zapytań i komunikacja (art. 6 ust. 1 lit. f RODO)
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)'
                  }}
                >
                  3. Odbiorcy danych
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)',
                    lineHeight: 1.8,
                    mb: 1
                  }}
                >
                  Dane osobowe mogą być przekazywane następującym kategoriom odbiorców:
                </Typography>
                <Box component="ul" sx={{ pl: 3 }}>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Dostawcy usług IT i hostingowych
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Operatorzy płatności (PayPro SA - Przelewy24)
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Firmy księgowe
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8 }}>
                    Organy publiczne w zakresie wymaganym prawem
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)'
                  }}
                >
                  4. Okresy przechowywania danych
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)',
                    lineHeight: 1.8,
                    mb: 1
                  }}
                >
                  Dane osobowe przechowywane są przez okres:
                </Typography>
                <Box component="ul" sx={{ pl: 3 }}>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Niezbędny do realizacji umowy
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Wymagany przepisami prawa (np. rachunkowe - 5 lat)
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8 }}>
                    Do momentu wniesienia sprzeciwu (w przypadku marketingu)
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)'
                  }}
                >
                  5. Prawa użytkownika
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)',
                    lineHeight: 1.8,
                    mb: 1
                  }}
                >
                  Użytkownik ma prawo do:
                </Typography>
                <Box component="ul" sx={{ pl: 3 }}>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Dostępu do swoich danych osobowych
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Sprostowania danych
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Usunięcia danych
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Ograniczenia przetwarzania
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Przenoszenia danych
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Wniesienia sprzeciwu wobec przetwarzania
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8, mb: 0.5 }}>
                    Cofnięcia zgody w dowolnym momencie
                  </Typography>
                  <Typography component="li" variant="body1" sx={{ color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)', lineHeight: 1.8 }}>
                    Wniesienia skargi do organu nadzorczego (UODO)
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)'
                  }}
                >
                  6. Pliki cookies
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)',
                    lineHeight: 1.8
                  }}
                >
                  Serwis wykorzystuje pliki cookies w celu zapewnienia prawidłowego działania strony,
                  personalizacji treści oraz analizy ruchu. Użytkownik może zarządzać plikami cookies
                  poprzez ustawienia przeglądarki.
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)'
                  }}
                >
                  7. Bezpieczeństwo danych
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.mode === 'dark' ? 'rgb(220, 220, 220)' : 'rgb(30, 30, 30)',
                    lineHeight: 1.8
                  }}
                >
                  Administrator stosuje odpowiednie środki techniczne i organizacyjne w celu
                  zabezpieczenia danych osobowych przed nieuprawnionym dostępem, utratą lub zniszczeniem.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
    </>
  );
};

export default PolicyPage;

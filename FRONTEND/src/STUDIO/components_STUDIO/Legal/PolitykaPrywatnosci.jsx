import React from 'react';
import { Typography } from '@mui/material';

const PolitykaPrywatnosci = () => {
    return (
        <>
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
        </>
    );
};

export default PolitykaPrywatnosci;

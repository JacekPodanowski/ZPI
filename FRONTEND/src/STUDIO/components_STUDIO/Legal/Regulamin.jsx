import React from 'react';
import { Typography } from '@mui/material';

const Regulamin = () => {
    return (
        <>
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
        </>
    );
};

export default Regulamin;

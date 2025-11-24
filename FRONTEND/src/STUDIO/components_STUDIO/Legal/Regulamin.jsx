import React from 'react';
import { Typography } from '@mui/material';

const Regulamin = () => {
    return (
        <>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                Regulamin Platformy YourEasySite
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                1. Postanowienia ogólne
            </Typography>
            <Typography variant="body2" paragraph>
                1.1. Definicje:<br />
                - <strong>Usługodawca</strong> – YourEasySite, NIP: 8993042136;<br />
                - <strong>Platforma</strong> – serwis internetowy YourEasySite.pl;<br />
                - <strong>Kreator</strong> – użytkownik tworzący i zarządzający Witryną;<br />
                - <strong>Witryna</strong> – strona tworzona przez Kreatora;<br />
                - <strong>Konto</strong> – zasoby i uprawnienia Kreatora w Platformie;<br />
                - <strong>Studio</strong> – panel administracyjny Kreatora;<br />
                - <strong>Edytor</strong> – narzędzie do projektowania Witryny;<br />
                - <strong>Regulamin</strong> – niniejszy dokument.
            </Typography>
            <Typography variant="body2" paragraph>
                1.2. Akceptacja Regulaminu jest wymagana do korzystania z Platformy. Regulamin jest dostępny online do pobrania i wydrukowania.
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                2. Wymagania techniczne
            </Typography>
            <Typography variant="body2" paragraph>
                Platforma wymaga urządzenia z dostępem do Internetu, aktualnej przeglądarki (Chrome, Firefox, Safari, Edge), aktywnego adresu e-mail oraz włączonych plików cookies. Usługodawca nie odpowiada za ograniczenia sprzętowe lub awarie Internetu.
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                3. Zakładanie Konta i rejestracja
            </Typography>
            <Typography variant="body2" paragraph>
                Kreator może założyć Konto poprzez formularz rejestracyjny lub OAuth Google. Podawanie prawdziwych danych jest obowiązkowe. Jedno Konto przypisane jest do jednego e-maila. Kreator odpowiada za bezpieczeństwo konta.
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                4. Zakres usług
            </Typography>
            <Typography variant="body2" paragraph>
                Platforma oferuje narzędzia do tworzenia Witryn, hosting, edytor wizualny z AI, system kalendarza, statystyki i analizy. Szczegóły dostępne są w Cenniku. Usługodawca zastrzega sobie prawo do modyfikacji oferty.
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                5. Płatności i świadczenie usług
            </Typography>
            <Typography variant="body2" paragraph>
                5.1. Płatności są pobierane cyklicznie (miesięczne, roczne) i realizowane z góry przez operatorów płatności, np. Przelewy24.  
                5.2. Usługa hostingu świadczona jest natychmiast po opłaceniu subskrypcji. Kreator wyraża zgodę na natychmiastowe rozpoczęcie świadczenia i traci prawo do odstąpienia od umowy zgodnie z art. 38 ustawy o prawach konsumenta. Opłaty nie podlegają zwrotowi.
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                6. Publikowanie Witryn
            </Typography>
            <Typography variant="body2" paragraph>
                Kreator może publikować i aktualizować Witrynę poprzez funkcję "Publikuj". Publikacja udostępnia Witrynę publicznie pod unikalnym adresem URL. Kreator ponosi pełną odpowiedzialność za treści.
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                7. Licencja i własność intelektualna
            </Typography>
            <Typography variant="body2" paragraph>
                Usługodawca udziela Kreatorowi niewyłącznej, nieprzenoszalnej licencji do korzystania z Platformy. Kreator zachowuje prawa autorskie do tworzonych treści, a Usługodawca otrzymuje licencję do wykorzystywania treści tylko w celu świadczenia usług.
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                8. Reklamacje
            </Typography>
            <Typography variant="body2" paragraph>
                Reklamacje dotyczące usług należy przesyłać na adres e-mail kontakt@youreasysite.pl. Reklamacje rozpatrywane są w terminie 14 dni od otrzymania.
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                9. Postanowienia końcowe
            </Typography>
            <Typography variant="body2" paragraph>
                W sprawach nieuregulowanych niniejszym Regulaminem mają zastosowanie przepisy Kodeksu cywilnego i Ustawy o prawach konsumenta. Kontakt: kontakt@youreasysite.pl
            </Typography>
        </>
    );
};

export default Regulamin;

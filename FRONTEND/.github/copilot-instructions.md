Tworzysz frontend dla :

Generatora stron osobistych dla 1-osobych działalności

Apliakjca jest bardzo minimalistyczna, prosta i intuicyjna.
Design jest elegancki i nowoczesny 

Kierowana jest do użytkowików bez znajomości kodowania/projektowania stron, dlatego musi być maksymalnie prosta aby ich nie rozpraszać i nie przytłaczać.

W trybie edycji pomaga ZINTEGROWANY AGENT AI, który wykonuje operacje zlecone przez użytkowika, oferuje 3 rozwiąznaia danego problemu tak aby użykowik mógł wybrać która mu najbardziej odpowiada.

# TO DO
Zrobić welcome page i menu wyboru tempaltów (jest 1 testwoy)
Po wyborze tempaltu odpala się szczegołowsze menu gdzie można zanaczyć co z danego tempaltu się chce a czego nie, on ma bazowo zaznaczone jakieś elementy

Głowym modleułem jest strona główna, kalendarz oraz strona o mnie <--- To zrobić
ale do wyboru powinny być też inne moduły i podstrony (moduł i podstrona to chyba to samo) 

-------------------------------------------------------
Edytor to główna aplikacja, strona zawiera się w nim :
<Edytor>
    <Strona>
        <Kalendarz></Kalendarz>
    </Strona>
</Edytor>
------------------------------------------------------

# TEMPLATY i Zapis
Kluczowa jest możliwość eksportu storny jako TEMPLATU, 
powinien być to np plik z rozszerzniem ".page" (lub folder by zapsiać użyte multimedia)

Eksportuje to wszytkie ustawinia użyte do stworzenia strony,
jako że strona jest w całości stworzona z naszych modułów, którym nadano jakieś ustawienia, możemy wszytkie te informacje łatwo zapisać, zapisując ustwiania użytych modułów.

W ten sosób możemy proawdzić wersojnowanie strony, po portsu zapsiaywać stronę jako nowy tempalte po zmianach. 

Załadowanie templatu do pustego edytora powinno odtowrzyć stronę w identycznym stanie.

# HOME PAGE
na początku pwoien wyświetlić się ekran powitalny, czarne logo na beżowym(lub białym) tle i przycisk "Stwórz swoją stronę"

W prawym górym rogu powinno być zaloguj które przeniesie użytkowika do "Studia" czyli strony do zarządzania stronami.

powinno być też autmatyczne logowanie aby ułatwić życie

Przycisk "Stwórz swoją stronę" otiwera menu wybierania templetu (na pocztaku 1 tetsowy)

Po wybrnaiu templatu wyświetla się szczegołowsze menu gdzie można zanaczyć lub odznaczyć moduły(podstrony) i zmienić ich ustawienia.

KAZDY MODÓŁ MA SWOJE USTWAINIA np dla kalendarza :
minimaly odstęp między spotaknami w kalndarzu,
rozdaj zajęć [indywidualne/ grupowe]

Po wybraniu opcji kliknąć OK

# EDYTOR
następnie powinno nastąpić przejście do edytora.
Nasz edytor wyróżnia się tym że wygląda jak normalna strona, jedynie na górze pojawia się mały pasek z najważniejszymi narzędziami i zmainia orietacji na mobilną itd oraz miejce na czat z Agentem. 

Kliknięte elemnty powinny się zanzaczyć a w oknie czatu pownno pisać jaki elemt jest zanaczony, można zanaczyć wiele trzymając shift lub ctrl.

edycja powinna być maksymalnie prosta, agent pyta co zrobić.
po wpisaniu powinien zanzaczyć co zmienia i wyświtelić 3 możliwe opcje zmiany lub dopytać się o szczegóły.

powinien wyśiwtelić też porzebne do edycji narzędzia np okno do zmiany koloru. Musi ono być proste w obsłudze, efekty muszą być widoczne od razu, musi wykonwać ono 1 funkcjonalość, np zmeiniać kolor wybranego elementu.

Edytor musi być minimalny, ładny i prosty, ui musi być płynne, zaookroglne i eststyczne 
jest to celowane do użytkowiników którzy cenią sobie profesjonalość (ale mogą nie znać sie na porgramowaniu)

edytor pwoonien zapsiaywać zmiany w prostym systemie wersjonowania, 1 gałąź main aby można było wrócic po zmianaich

# Struktura projektu
Głównya witryna to [HOME PAGE] edytora opisnay powyżej,
następnie można się zalogować aby zarządzać swoimi stronami
lub nie logować się i kliknąć przycisk aby rozpocząć tworzenie nowej strony(logowanie potem)

Każdy użytkowik może mieć :
    max 3 strony(frontend) osobiste - (każda na inną działalność)
    1 backend zarządzający wszystkimi stronami
    1 bazę danych zapisującą wszytkie wydarzenia ze wszytkich stron
    (+ jakiś backup jako że chcemy używać darmowych hostingów xd)

Po zalogowaniu do edytora użytkowik zobaczy swoje "Studio" ze stronami i może :
    stworzyć nową stronę i przejść do edycji
    wybrać dowolną ze swoich stron by ją załadować do edytora
    wybrać dowolną ze swoich stron i przejść do niej bez edytora (po prostu link)

Edytor zmienia układ strony, dodaje i usuwa moduły itd. ale każda ze stron ma ten swój panel admina gdzie układa się spotaknia, terminy oraz dostępność, tego NIE ROBI SIE W EDYTORZE.

Struktura projektu musi być modułowa i łatwa do modyfikacji.

Aplikacja jest stworzona dla 1osobowych działnosci wiec strony są proste i nie przewiduje się bardzo dużego ruchu.

Główną funckjonalsoćą jest kalendarz integrujacy sie z google kalnadrzem, system rezerwacji, wysyłanie maili z potwierdzeniami, zajecia indywidujane i grupowe(kazde z nich to osobna część kalendarza)

# Struktura Infrastruktury
strona użytkowika jest hostawana z ostaniej(najnowszej) wersji strony stworzonej w edytorze ale edytor działa tylko u nas a przycisk edycji przenosi go do naszego edytora gdzie może zmieniać swoją stronę.

wtedy każdy może mieć własny mały backend i frontend (w trybie produkcyjnym)
a edycja bedzie działała u nas (w trybie deloperskim, co daje hot realod - zmiany są widoczne od razu)

Po skończeniu edycji następuje relunch prawdziwej strony z nową wersją

Każdy użytkowik może mieć max 3 storny, wszytskie powinny mieć 1 współny bakcend. 
jest to strona osobista więc jeśli użytkowik ma zajęcia yogi od 14 do 15 to na innej swojej stronie gdizie prowadzi np kurs kulinarny jest niedostępny w tym terminie.

Znacznie ułatwia to integracje wielu stron danego użytkownika, mamy 1 backend i 1 baze danych i max 3 frontedny (dla każdej innej działalności). Każdy frontend powinien więc zapisawć do bazy z której strony pochodzi dany wpis, każda strona powinna mieć krótki tytuł np [YOGA] lub [KULINARIA], taki tag, najepiej 1 słowo, niech użytowkik sam to wpisze.



---------------------------------------------------------------------------------------------
# BACKEND
Backend dzili się na 2 części :
    BIG BACKEND
    Small Backend

# Small Backend
Jest to osobisty backend każdego z klinetów i odpowiada on za utrzymanie jego stron.
Zarządza jego osobistą bazą danych, rezerwuje spotkania itd.

Czy small backned może hostować frontendy ?
jeśli tak to będzie fajnie.

# BIG BACKEND
Jest to głowny backend naszej apliakcji - Edytora/Generatora stron.
Ma on BAZĘ klinetów którzy mają u nas strony.

Każdy klient ma :
    ID (PK)
    Imię
    Nazwisko
    Email
    Telefon
    Saldo
    Typ klienta [Free/Pro]
    Tag [JACEK/BODAN/STANISLAW/WEB/0DAY] (Tag będzie pokazywał skąd pochodzi dany klinet)
    Strony[ID_STONY,ID_STRONY,ID_STRONY] (powiązanie strony z klientem)
    Small_Backend[ID_Small_Backendu]
    Baza Danych[ID_Bazy]
    itd...

Do każdego klineta są podłączone strony, klient jest główym obiektem a strony są pod nim, nie może być strony bez klienta.

Każda strona(frontend) ma :
    ID (PK)
    Nazwę[YOGA]
    Hsitorię wersji

Każda baza ma:
    ID (PK)
    Hoster (Kto hostuje tą baze,np Amazon itd)
    Dane do połaczenia
    ID_Backupu (jakoś ogarnąć backupy, możemy mieć backup każdego klienta u siebe w bazie)

Każdy Small_Backend ma :
    ID (PK)
    Dane do połączenia
    ...

Z BIG BAKCENDU powinniśmy móc monitorować działanie każdego z mniejszych systemów czyli :   
    Lączyć się do small_backendu jakiegos usera bo coś nie działa
    Mieć healthchecki i wysietlać czy dany system działa
    Wyświetlać wsyztkie niedziałajace systemy
    Móc ściągnąć logi każdego z systemów
    Wyłączyć/włączyć dany serwis

Powinnimy też móc zarządzać userami, zmieniać ich dane i uprawnienia

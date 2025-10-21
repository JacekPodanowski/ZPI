### System zarządzania multimediami

1. Wszystkie uploady zapisują fizyczny plik w `media/` oraz rekord w tabeli `MediaAsset` z hash-em, typem i autorem.
2. Każde użycie pliku dostaje wpis `MediaUsage`, który wskazuje, czy zasób należy do avatara użytkownika czy do konkretnej strony.
3. Avatar użytkownika ma zawsze pojedynczy wpis `MediaUsage`; nowe zdjęcie podmienia poprzedni rekord i usuwa stary plik, jeśli nie ma innych powiązań.
4. Edytor stron przesyła `usage=site_content` oraz `site_id`, dzięki czemu backend wie, do której strony przypisać plik.
5. Helpery `normalize_media_path`, `get_asset_by_path_or_url` i `cleanup_asset_if_unused` pilnują spójności danych oraz kasują sieroty.
6. Usunięcie ostatniego `MediaUsage` danego pliku uruchamia kasowanie rekordu `MediaAsset` oraz fizycznego pliku przez sygnał Django.
7. Hash SHA-256 pozwala deduplikować multimedialne uploady – jeśli plik już istnieje, backend zwraca dawny rekord zamiast kopiować dane.
8. `deleteMediaAsset` na froncie przekazuje typ użycia i identyfikator strony, a backend usuwa odpowiedni wpis `MediaUsage` i ewentualnie plik.
9. Migracja `0006_mediaasset_mediausage` wprowadza nowe tabele oraz ograniczenia gwarantujące, że jedno użycie odnosi się do jednej strony albo jednego użytkownika.
10. Panel admina pozwala filtrować zasoby według typu i operatora, ułatwiając kontrolę biblioteki multimediów.
11. Backend blokuje usuwanie pliku, dopóki istnieją inne wpisy `MediaUsage`, więc nie ma ryzyka utraty aktywnych materiałów.
12. Skasowanie całej strony powoduje usunięcie powiązanych wpisów `MediaUsage`, co finalnie usuwa nieużywane pliki.
13. Odpowiedź z `/api/v1/upload/` zawiera `asset_id`, `hash` i flagę `deduplicated`, co ułatwia diagnostykę po stronie klienta.
14. Avatarowy uploader zawsze wysyła `usage=avatar`, dzięki czemu backend rozpoznaje typ zasobu bez dodatkowej logiki.
15. Próba kasowania bez wskazania `usage` lub `site_id` jest odrzucana, co chroni przed przypadkowymi operacjami.
16. Logi backendu pokazują, kiedy zasób stał się osierocony i został fizycznie usunięty.
17. Stare pliki wgrane przed wdrożeniem systemu nie mają rekordów `MediaAsset`, więc nie podlegają deduplikacji ani automatycznemu czyszczeniu.
18. Takie legacy pliki trzeba ręcznie przenieść do nowego systemu (ponownie wgrać) lub ręcznie usunąć po weryfikacji.
19. Zestawienie `MediaAsset` + `MediaUsage` pozwala łatwo sprawdzić, które witryny i użytkownicy korzystają z konkretnego zasobu.
20. API zwraca 200 przy deduplikacji i 201 przy zapisie nowego pliku, co od razu informuje o stanie biblioteki.
21. Backend gwarantuje, że użytkownik ma maksymalnie jeden avatar, a każdy zasób strony jest jednoznacznie przypisany do witryny.
22. Mechanizm jest niezależny od rodzaju magazynu (lokalny dysk, S3 itp.), bo korzysta z warstwy `default_storage`.
23. W przypadku błędów zapisu log przechowuje szczegóły wyjątku i ścieżkę pliku, ułatwiając diagnostykę.
24. Ręczne usunięcie wpisu `MediaUsage` w panelu admina także uruchamia sprzątanie, jeśli nie pozostały inne powiązania.
25. Dzięki temu rozwiązaniu zachowujemy pełną kontrolę nad multimediami, eliminując duplikaty i osierocone pliki, z wyjątkiem legacy uploadów.

# Instrukcje są w `.github/copilot-instructions.md`

# Robić branche :
    Najlepiej małe i tematyczne np: HomePage
    Jak działa wrzucać na maina

# Przed uruchomieniem upewinj się że masz 3 pliki .env :
    1 w katalogu ZPI
    2 w ZPI/BACKEND
    3 w ZPI/FRONTEND

Każdy folder ma plik `.env.example` z którego należy skopiować wszytsko i zrobić `.env`

# Do uruchomiaia używać docera :
    docker-compose up --build
    lub
    docker-compose up --build -d   (w tle, nie zawala konsoli logami)


# Docer uruchaminia:
    Frontend  na          localhost:3000
    Backend na            localhost:8000
    Api backendu na       http://localhost:8000/api/v1/

# Hot-realod :
    jak coś zmnienicie po paru sekundach odświerzcie strone i powinno być (jak nie to patrz na logi)
    na FRONTENDZIE jest hot-realod
    na BACKENDZIE jest hot-realod

# Komendy do docera są w `docer_commands.md`

# Używane technologie są w `Technology_Stack.md`

# Konsultacje z AI
* Przed rozpoczęciem pracy zróbcie sobie instrucje. (ratuje to masę czasu)
* Wklejcie cały plik `copilot-instructions.md` w google AI Studio (gemmini 2.5)
* Opiszcie niżej co chcecie zrobić i dodajcie na koniec :

`Act as an expert consultant. Analyze project description and my request. Based on this analysis, propose an optimal solution that aligns with project's vision and reflects professional best practices. Shortly explain why your proposed solution is the most effective. If your proposal introduces significant strategic changes to my original request, present your solution and ask for my confirmation before you proceed. If your proposal only refines or details my request without major changes, present it and then create a detailed work plan.`


# Jeśli dalej macie wątpliwości to piszcie na grupie.
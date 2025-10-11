# WSTĘP PO POLSKU - OPIS PROJEKTU
## SCZEGÓŁOWY OPIS TECHNICZNY W 2 CZĘŚCI PLIKU

Tworzymy aplikajce generatora/edytora/hostera stron osobistych dla 1-osobych działalności.
Celem jest dostarczenie profesjonalnego, prostego w obsłudze narzędzia dla użytkowników bez wiedzy technicznej.

# FRONTEND
Apliakjca jest bardzo minimalistyczna, prosta i intuicyjna.
Design jest elegancki i nowoczesny 

Kierowana jest do użytkowików bez znajomości kodowania/projektowania stron, dlatego musi być maksymalnie prosta aby ich nie rozpraszać i nie przytłaczać.

W trybie edycji pomaga ZINTEGROWANY AGENT AI, który wykonuje operacje zlecone przez użytkowika, oferuje 3 rozwiąznaia danego problemu tak aby użykowik mógł wybrać która mu najbardziej odpowiada.

# TO DO
Zrobić welcome page i menu wyboru tempaltów (jest 1 testwoy)
Po wyborze tempaltu odpala się szczegołowsze menu gdzie można zanaczyć co z danego tempaltu się chce a czego nie, on ma bazowo zaznaczone jakieś elementy

# Proces Tworzenia Strony:
Po kliknięciu "Stwórz", użytkownik wybiera szablon (na start 1 testowy).
Następnie, w szczegółowym menu, zaznacza moduły (podstrony), które chce zawrzeć na swojej stronie (np. Strona Główna, Kalendarz, O Mnie). Domyślne moduły są już zaznaczone.
Każdy moduł ma swoje specyficzne ustawienia (np. kalendarz: minimalny odstęp między spotkaniami, typy zajęć [indywidualne/grupowe]).

# Edytor 
Po konfiguracji, użytkownik przechodzi do edytora, który wygląda jak normalna strona, ale z minimalistycznym paskiem narzędzi na górze (zapis, cofnij/ponów, widok mobilny) oraz oknem czatu z Agentem AI.

-------------------------------------------------------
Edytor to główna aplikacja, strona zawiera się w nim :
<Edytor>
    <Strona>
        <Kalendarz></Kalendarz>
    </Strona>
</Edytor>
------------------------------------------------------

# TEMPLATY i Zapis
Kluczowa jest możliwość zapsiu storny jako TEMPLATU, 
powinien być to json.

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

# Live Preview:
Zmiany wprowadzane w edytorze muszą być widoczne natychmiast, dając wrażenie "hot-reloadingu".


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

Po skończeniu edycji i kliknięciu "Publikuj" następuje relunch prawdziwej strony z nową wersją.
* Szczegóły hostingu w instrukcji technicznej.

Każdy użytkowik może mieć max 3 storny. 

Stosujemy architekturę jednego, centralnego backendu (Multi-Tenant), który obsługuje wszystkie strony i wszystkich użytkowników. Eliminuje to potrzebę zarządzania wieloma "małymi backendami".

Znacznie ułatwia to integracje wielu stron danego użytkownika, mamy 1 backend i 1 baze danych i max 3 frontedny każdego użytkowika (dla każdej innej działalności).
Każdy frontend powinien więc zapisawć do bazy z której strony pochodzi dany wpis, każda strona powinna mieć krótki identyfikator np [YOGA] lub [KULINARIA].



#  SZCZEGÓŁOWY OPIS CAŁEJ APLIKACJI (Wersja produkcyjna - najbardziej dokładna) ================================================================================================
                    Project Plan & Copilot Instructions: The Personal Site Generator
================================================================================================

This document outlines the complete architecture for a multi-tenant personal site generator. The
core of the platform is a single, powerful backend that serves multiple, independent frontend
sites, providing a scalable and manageable solution.

------------------------------------------------------------------------------------------------
                             Part 1: Vision & High-Level Architecture
------------------------------------------------------------------------------------------------

1.1. Project Introduction
-------------------------
We are building a minimalist, elegant, and modern **Personal Site Generator**. This platform is
for solo entrepreneurs who need a professional online presence without coding knowledge. The user
experience is centered around simplicity, intuition, and an integrated **AI Assistant** that
makes changes through natural language.

App should guide the users using simple steps in site creation like : template, structure, colors etc...
each step will be shortly explained and simple tools needed for this step will be displayed,
**AI Assistant** should be always available and guide the users.

1.2. Project Vision
--------------------
Our goal is to create a platform that empowers users to build and manage their personal websites.
We want to eliminate the technical barriers and encourage users creativity and self expression.
We want to help them create truly their own unique online presence.

The theme is **"Modern Wellness"**. The design should be clean, calming, simple, minimalistic and inviting.

1.3. Core Color Palette:
-------------------------

In light mode :
    background       rgb(228, 229, 218)
    Red accent color rgb(146, 0, 32)
    Text             rgb(30, 30, 30)

In dark mode :
    background       rgb(12, 12, 12)
    Red accent color rgb(114, 0, 21)
    Text             rgb(220, 220, 220)

The typography should be elegant and easy to read, with a focus on whitespace and simplicity.

1.4. Core Architectural Principle: Multi-Tenant Single Backend
-------------------------------------------------------------
The system is built on a **"single backend, multiple frontends"** model. This is the industry
standard for scalable SaaS applications and avoids the immense complexity, cost, and security
risks of managing separate backends for each user.

*   **Core Components:**
    *   **The Generator (Editor Platform):** Our main application, consisting of the central
        backend API and a frontend "Studio." This is where site owners log in to create, edit,
        and manage their websites.

    *   **Personal Sites (Frontends):** The live, statically-hosted websites generated for
        users (e.g., yogastudio.com). These are separate, sandboxed frontend applications that
        communicate with our central API.

    *   **Central API (The Multi-Tenant Backend):** A single, unified Django backend that
        handles authentication, data storage (with strict data separation per site), and all
        business logic.

------------------------------------------------------------------------------------------------
                              Part 2: Project & Code Structure
------------------------------------------------------------------------------------------------

We will use a simple monorepo structure without extra tooling. The project will live in a single
Git repository named `ZPI`.

2.1. Final Monorepo Structure
-----------------------------
ZPI/
├── .git/
│
├── BACKEND/                # Entire backend project
│ ├── api/
│ ├── site_project/
│ ├── Dockerfile
│ ├── docker-compose.yml
│ └── README.md             # Instructions specific to the backend
│
├── FRONTEND/
│ ├── public/               # Shared assets (fonts, global favicon)
│ ├── src/
│ │ ├── components/          # SHARED components (Button)
│ │ ├── contexts/            # SHARED contexts (AuthContext)
│ │ ├── services/            # SHARED API services
│ │ │
│ │ ├── editor/              # LOGIC for the Editor Application
│ │ │ ├── components/        # UI for the Editor (TopBar, AIChat)
│ │ │ ├── pages/             # Pages for the Editor (Welcome, Studio)
│ │ │ └── EditorApp.jsx      # Main entry point for the Editor build
│ │ │
│ │ └── site-template/      # LOGIC for the generated Site Template
│ │ ├── components/         # Components for building sites (Hero, Calendar, Paragraph)
│ │ ├── pages/              # Pages for the template (HomePage, InfoPage, NotFoundPage)
│ │ └── SiteApp.jsx         # Main entry point for the Site build
│ │
│ ├── package.json          # ONE package.json for the entire frontend
│ └── README.md             # Instructions specific to the frontend
│
├── .gitignore              # Main gitignore for repo-wide rules
├── docker-compose.yml      # Main docker-compose to orchestrate services
└── README.md               # High-level project documentation


2.2. Explanation of the Frontend Structure
------------------------------------------
We will maintain ONE React project in the `FRONTEND` folder. This simplifies dependency
management. We will create two different applications from this single codebase using environment
variables.

*   `src/editor/` contains the code for your SaaS platform (the editor, studio, etc.).
*   `src/site-template/` contains the code for the websites your users will build.
*   Shared folders like `src/components/` contain code used by BOTH.

The entry point (`src/App.jsx`) will decide which application to render based on an environment
variable (`REACT_APP_BUILD_TARGET`).

------------------------------------------------------------------------------------------------
                     Part 3: Detailed Backend Implementation Plan
------------------------------------------------------------------------------------------------

3.1. Database Model Refactoring (api/models.py)
-----------------------------------------------
*   **`PlatformUser`** (replaces `User`): Represents your customers.
    -   Fields: `id`, `email`, `password`, `first_name`, `account_type` (`[Free, Pro]`),
        `source_tag` (`[JACEK, WEB]`), etc.

*   **`Site`**: Represents a personal website.
    -   Fields: `id`, `owner` (ForeignKey to `PlatformUser`), `name` (changeable),
        `identifier` (auto-generated, permanent slug), `template_config` (JSONField),
        `version_history` (JSONField).

*   **`Client`**: Represents the end-users who book appointments.
    -   Fields: `id`, `site` (ForeignKey to `Site`), `email`, `name`, `google_id`.

*   **`Event`** (replaces `TimeSlot`): The core calendar model.
    -   Fields: `id`, `site` (ForeignKey to `Site`), `admin` (ForeignKey to `PlatformUser`),
        `event_type` (`[individual, group]`), `capacity`, `attendees` (ManyToManyField to `Client`).

*   **`Booking`**: A record of a client booking an event.
    -   Handles both registered clients and guests via nullable fields: `client` (ForeignKey)
        and `guest_email`/`guest_name`.


------------------------------------------------------------------------------------------------
                    Part 4: Detailed Frontend Implementation Plan
------------------------------------------------------------------------------------------------

4.1. Core Functionality: The Editor & AI
----------------------------------------
*   User Flow: Welcome Page -> Template Selection -> Module Config -> Editor.
*   Editor UI: The user's site is rendered inside a sandboxed `<SiteCanvas>` component. A
    minimal top bar provides tools and the AI Chat window.
*   AI Interaction: Users select elements and type commands. The AI presents 3 visual options,
    previewed instantly on hover and applied on click.


4.2. "Hot Reload" via State Management
--------------------------------------
The editor is a **production React app**. The "instant changes" effect is achieved by holding
the site's `template_config` in a central state store (e.g., Zustand). UI tools dispatch
actions to update this state, and React instantly re-renders the `<SiteCanvas>` component.


4.3. Saving & Versioning (Database-Driven)
------------------------------------------
The "Save" button updates the `template_config` JSON in the `Site` model. Each save can also 
create a timestamped snapshot in the `version_history` field, allowing users to revert to 
previous versions.


4.4. Hybrid Booking & Authentication
------------------------------------
*   **Individual Sessions:** Allow guest booking (email/name). The confirmation email includes
    a one-click "Create Account" link.
*   **Group Sessions:** Require a `Client` account, prompting login via Google.
*   **Guest-to-Client Upgrade:** When an account is created, the backend links all previous
    guest bookings with the same email to the new account.
*   **Unified OAuth:** A single Google OAuth app handles both `PlatformUser` logins (to the
    Studio) and `Client` logins (on personal sites).


------------------------------------------------------------------------------------------------
           Part 5: Hosting, Deployment, and the "Publish" Workflow
------------------------------------------------------------------------------------------------

This is the core mechanism for updating live sites from the editor.

5.1. Hosting Strategy
---------------------
*   **Backend:** The Django project in `ZPI/BACKEND/` will be containerized using Docker and
    deployed as a single application (e.g., on Railway).
*   **Frontends:** All frontend applications (the Editor and all personal sites) will be
    hosted on a modern static hosting platform like **Vercel** or **Netlify**.


5.2. Vercel Configuration with a Monorepo
-----------------------------------------
1.  **Project 1: The Editor**
    -   Create a Vercel project named `zpi-editor`. Link it to your `ZPI` Git repository.
    -   In Vercel settings, set the **Root Directory** to `FRONTEND`.
    -   Add an environment variable: `REACT_APP_BUILD_TARGET` = `editor`.


2.  **For EACH New Client Site (e.g., Anna's Yoga Site):**
    -   Create a new Vercel project (e.g., `anna-yoga-site`). Link it to the same `ZPI` repo.
    -   Set the **Root Directory** to `FRONTEND`.
    -   Add two environment variables:
        1. `REACT_APP_BUILD_TARGET` = `site` (or leave blank for default)
        2. `REACT_APP_SITE_IDENTIFIER` = `(Anna's unique site identifier)`
    -   Generate a **Build Hook URL** in Vercel's settings and save it in your backend.


5.3. The "Publish" Workflow in Action
-------------------------------------
1.  **Click Publish:** The user clicks "Publish" in the Editor.
2.  **API Call:** The Editor sends a request to your API: `POST /api/v1/sites/{id}/publish/`.
3.  **Trigger Hook:** Your backend retrieves the unique Build Hook URL for that site and sends a
    POST request to it.
4.  **Vercel Builds:** Vercel receives the signal and starts a new deployment for that site.
5.  **Fetch Config:** During its build process, the React app (`SiteApp.jsx`) reads its
    `REACT_APP_SITE_IDENTIFIER` and makes a GET request to your API to fetch the latest saved
    `template_config` JSON.
6.  **Generate Site:** The build process uses this fresh JSON to generate the final static
    HTML, CSS, and JS files.
7.  **Go Live:** Vercel automatically deploys the newly built files to the user's domain.


------------------------------------------------------------------------------------------------
                       Part 6: Adapting Your Existing Project
------------------------------------------------------------------------------------------------

We are evolving your existing codebases into this new structure.

6.1. Frontend (`site_frontend` -> `ZPI/FRONTEND/`)
-------------------------------------------------
Your `site_frontend` project is the source code for the new, unified frontend application.

1.  **Restructure `src`:** Create the `src/editor` and `src/site-template` folders.
2.  **Migrate Code:**
    *   Move shared components (`CustomCalendar`, etc.) into `src/components/`. Do the same for `contexts` and `services`.
    *   Your existing pages (`HomePage`, etc.) will become the foundation for the `site-template`. Move them into `src/site-template/pages/`.
3.  **Create Editor Components:** Build the new UI for the editor (`TopBar`, `AIChat`, `Studio` pages) inside the `src/editor/` folder.
4.  **Create Configurable Template Components:** This is the most significant task. Based on the components now in `site-template` and the shared folders, create a new set of highly flexible components. These new versions should be built to be completely "dumb," meaning they render everything based on props passed down from a `template_config` object. Instead of refactoring the existing files, you are creating their new, configurable counterparts that align with the more flexible new design.



------------------------------------------------------------------------------------------------
                       Part 7: Technology Stack Overview
------------------------------------------------------------------------------------------------

## Backend (Central API)

*   **Django:** The core Python framework for building the application logic and database models.
*   **Django REST Framework:** The toolkit for building our secure and scalable RESTful API endpoints.
*   **PostgreSQL:** Our primary relational database for storing all user, site, and booking data.
*   **Simple JWT (with dj-rest-auth):** Handles token-based authentication for both platform and site users.
*   **Gunicorn:** The production-grade WSGI server for running the Django application.
*   **Docker:** Used to containerize the backend application for consistent development and deployment.

======================================================================================================

## Frontend (Editor & Site Template)

*   **React:** Builds the user interfaces for both the editor and site template.
*   **React Router:** Manages all client-side page navigation within the applications.
*   **Zustand:** A lightweight state management library used for the editor's "hot reload" feature.
*   **Axios:** The HTTP client used to communicate with our Django REST API from the browser.
*   **Material-UI (MUI):** The component library for building the user interface of the **Editor/Studio**.
*   **Tailwind CSS:** The utility-first CSS framework for styling the generated **Personal Sites**.
*   **@react-oauth/google:** The client-side library for integrating "Sign in with Google."

====================================================================================================

## Hosting & Deployment

*   **Railway (or similar):** Hosts our containerized Django backend application and PostgreSQL database.
*   **Vercel:** Hosts all our static frontend applications (the Editor and all user sites).
*   **Vercel Build Hooks:** The core mechanism that allows our backend to trigger a new Vercel deployment when a user publishes their site.
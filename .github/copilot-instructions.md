================================================================================================
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

1.2. Core Architectural Principle: Multi-Tenant Single Backend
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
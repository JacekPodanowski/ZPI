Of course. You've done the hard work of refactoring the repository; now your documentation needs to reflect that new, clean structure.

I have updated **only the necessary sections** of your project plan to match your current file hierarchy. The formatting, headers, and all other parts of the document have been preserved exactly as you requested.

Here is the corrected instruction file:

================================================================================================
                    Project Plan & Copilot Instructions: The Personal Site Generator
                                                Phase 2
================================================================================================

This document outlines the complete architecture and Phase 2 implementation plan for the multi-tenant personal site generator. The core of the platform is a single, powerful backend that serves multiple, independent frontend sites, providing a scalable and manageable solution. Phase 2 focuses on building the core user-facing features: the editor experience, the advanced admin calendar, and the template management system.

------------------------------------------------------------------------------------------------
                             Part 1: Vision & High-Level Architecture (Established)
------------------------------------------------------------------------------------------------

1.1. Project Introduction
-------------------------
We are building a minimalist, elegant, and modern **Personal Site Generator**. This platform is for solo entrepreneurs who need a professional online presence without technical knowledge. The user experience is centered around simplicity, intuition, and an integrated **AI Assistant** that makes changes through natural language.

The application guides users through simple, explained steps in site creation (template selection, structure, colors). The AI Assistant is always available to guide users and execute their requests.

1.2. Project Vision
--------------------
Our goal is to create a platform that empowers users to build and manage their personal websites. We aim to eliminate technical barriers, encourage creativity, and help them create a unique online presence.

The guiding theme is **"Modern Wellness."** The design must be clean, calming, simple, minimalist, and inviting.

1.3. Key Principles
-------------------
App motto is simplicity.
Do not over-engineer. If something can be done in a simpler way, do it that way.
The system prioritizes discoverability and prevents complexity from overwhelming the user.
Always think how user journey can be made smooth as possible.

Before implementing any feature, think if it can be done in the simpler way !


1.4. Core Color Palette & Typography
------------------------------------
*   **Light Mode:**
    *   background: `rgb(228, 229, 218)`
    *   Red accent color: `rgb(146, 0, 32)`
    *   Text: `rgb(30, 30, 30)`
    *   Grey: `rgb(188, 186, 179)`

*   **Dark Mode:**
    *   background: `rgb(12, 12, 12)`
    *   Red accent color: `rgb(114, 0, 21)`
    *   Text: `rgb(220, 220, 220)`
    *   Grey: `rgb(70, 70, 68)`

*   **Typography:** Elegant and easy to read, with a focus on whitespace and simplicity.

1.5. Core Architectural Principle: Multi-Tenant Single Backend
-------------------------------------------------------------
The system is built on a **"single backend, multiple frontends"** model, which is the industry standard for scalable SaaS applications. Each user can have a maximum of three personal sites, all managed by one central backend and database.

*   **Core Components:**
    *   **The Studio (SaaS Platform):** The main application where site owners log in. It consists of the central backend API and a frontend "Studio" interface for high-level management (listing sites, managing billing, launching the editor). The Studio itself does not contain the calendar or site design tools.
    *   **The Editor:** A dedicated interface launched from the Studio for a specific site. This is where all visual editing, content management, and calendar scheduling occurs.
    *   **Personal Sites (Frontends):** The live, statically-hosted websites generated for users. These are separate frontend applications that fetch data from the central API.
    *   **Central API (The Multi-Tenant Backend):** A single, unified Django backend that handles authentication, data storage (with strict data separation per site via a `site` identifier), and all business logic.

------------------------------------------------------------------------------------------------
                              **Part 2: Project & Code Structure (Established)**
------------------------------------------------------------------------------------------------

2.1. Monorepo Structure
-----------------------
```
ZPI/
├── BACKEND/
└── FRONTEND/
    ├── src/
    │   ├── components/      # SHARED simple components (Button, Modal)
    │   ├── contexts/        # SHARED contexts (AuthContext)
    │   ├── services/        # SHARED API services
    │   │
    │   ├── STUDIO/          # === THE MAIN SAAS APPLICATION ===
    │   │   ├── components/  # Components used ONLY by the Studio (TopBar, Configurator)
    │   │   ├── pages/       # All pages for the Studio (Dashboard, Editor, Login)
    │   │   ├── layouts/     # Layouts for Studio pages
    │   │   ├── store/       # Zustand state management stores
    │   │   └── routes.jsx   # Main router for the Studio application
    │   │
    │   └── SITES/           # === THE GENERATED USER SITE TEMPLATE ===
    │       ├── components/  # Components for building user sites (HeroSection, PublicCalendar)
    │       ├── pages/       # Pages for the template (HomePage, InfoPage)
    │       └── SiteApp.jsx  # Root component that renders a site from a config
    │
    ├── App.jsx              # Top-level router
    └── main.jsx
```
Keep the project structure clean and simple. App motto is simplicity.

------------------------------------------
We will maintain ONE React project in the `FRONTEND` folder. This simplifies dependency
management. The codebase is organized into two primary applications and a set of shared resources.

*   `src/STUDIO/` contains the code for your entire SaaS platform. This is the main application that users log into. It includes the dashboard, the site creation wizard, the editor, and all related pages and components.
*   `src/SITES/` contains the template code for the public-facing websites your users will build. It's a self-contained application that renders a site based on a configuration.
*   Shared folders like `src/components/` and `src/services/` contain code that is used by BOTH applications.

The main entry point (`src/App.jsx`) now directly renders the Studio application, which handles all user-facing pages and routing. The code in `src/SITES` is imported by the Studio's editor for live previews and serves as the codebase for the final, deployed user websites.

------------------------------------------------------------------------------------------------
                    Part 3: Detailed Backend Implementation (Established)
------------------------------------------------------------------------------------------------

We split the users of our application into 3 groups:
1. Admins - us, the developers
2. Creators - users of the editor (they create and manage their personal sites)
3. Clients - users of the personal sites (they book appointments)

3.1. Database Models (`api/models.py`)
--------------------------------------
*   **`PlatformUser`**: Represents the site creators.

*   **`Site`**: Represents a personal website.
    -   `id`: Primary key for internal logic (e.g., `1547`).
    -   `owner`: ForeignKey to `PlatformUser`.
    -   `name`: The user-provided name (e.g., "Pracownia Jogi").
    -   `identifier`: A unique, auto-generated slug for URLs and display (e.g., `1547-pracownia_jogi`).
    -   `template_config`: `JSONField` storing all settings, modules, colors, and content for the site.
    -   `version_history`: `JSONField` for storing previous versions of `template_config`.

*   **`Client`**: Represents the end-users who book appointments on personal sites.

*   **`Event`**: The core calendar model, with an `event_type` of `[individual, group]`, linked to a specific `Site`.

*   **`Booking`**: A record of a `Client` booking an `Event`.


3.2. Hybrid Booking & Authentication
------------------------------------
*   **Individual Sessions:** Allow guest booking (email/name). The confirmation email includes
    a one-click "Create Account" link.
*   **Group Sessions:** Require a `Client` account, prompting login via Google.
*   **Guest-to-Client Upgrade:** When an account is created, the backend links all previous
    guest bookings with the same email to the new account.
*   **Unified OAuth:** A single Google OAuth app handles both `PlatformUser` logins (to the
    Studio) and `Client` logins (on personal sites).

------------------------------------------------------------------------------------------------
                    **Part 4: Phase 2 Frontend Implementation Plan (Primary Focus)**
------------------------------------------------------------------------------------------------

4.1. User Flow Implementation
-----------------------------
1.  **Welcome Page:** Create the initial landing page with the logo on the themed background and a single primary button: **"Create Your Site"**. A "Log In" button in the top-right corner navigates to the Studio/Login page.
2.  **Template Selection:** "Create Your Site" leads to a simple menu to select a site template (start with one test template).
3.  **Module Configuration:** The user then sees a detailed menu to check/uncheck the modules (pages) they want (e.g., Home, Calendar). Each module will have specific settings.
4.  **Launch Editor:** After confirmation, the user is taken to the main Editor view.

4.2. The Editor Interface
-------------------------
*   **Structure:** The main component will be an `<Editor>` wrapper that contains the user's `<SiteCanvas>`.
*   **Site Canvas:** The `<SiteCanvas>` component renders the actual user site based on the state-managed `template_config` JSON.
*   **Minimalist Top Bar:** A small, unobtrusive toolbar at the top with essential tools: Save, Undo/Redo, Mobile/Desktop view toggle.
*   **AI Assistant Chat:** A dedicated window for the AI Chat. When a user clicks an element in the canvas, the element is outlined, and the chat shows which element is selected. The user can type commands, and the AI will present 3 visual options with instant hover previews.

4.3. "Hot Reload" via State Management
--------------------------------------
Implement **Zustand** as the state management library. The entire `template_config` JSON for the site being edited will be held in a Zustand store. All editor tools and AI actions will dispatch updates to this store, causing the `<SiteCanvas>` to re-render instantly.

4.4. Saving, Templates, and Versioning
--------------------------------------
*   **Saving:** The "Save" button will trigger an API call to update the `template_config` JSON in the `Site` model.
*   **Versioning:** Each save will also create a timestamped snapshot of the `template_config` and add it to the `version_history` field.
*   **Templates:** The `template_config` is the "template." Loading a template means fetching its JSON and setting it as the current state in the Zustand store.

4.5. Complete Rework of the Admin Calendar
------------------------------------------
The existing `AdminCalendar` component must be overhauled to become the central scheduling tool.

*   **Multi-Site View:** The calendar must display events from **all** sites owned by the user.
    -   Events from the current site are fully editable.
    -   Events from other sites are displayed as read-only, gray blocks. Clicking them shows a popup: "Edit in [Other Site Name]," which opens that site's editor in a new tab.

*   **Day/Week Templates:**
    -   **UI:** Implement a "Templates" section on the left side of the calendar, with "Day" and "Week" areas. Each section has a `+` icon to create new templates.
    -   **Drag-and-Drop:** Templates must be draggable. Implement animations: the template element shrinks and follows the cursor; the target calendar area is highlighted with a red, animated, dotted "edit grid."
    -   **Drop Logic:** Dropping a template triggers a confirmation modal showing a preview of changes and any overwritten events.
    -   **Apply to Month:** Dragging a template over the month's name (which will "glow") applies it to the whole month, subject to confirmation.
    -   **Deletion:** A "trash zone" appears on the left when dragging a template for deletion.

*   **Day Details Modal Rework:**
    -   Clicking a day opens a modal showing a vertical timeline. Events and availability blocks are rendered on this timeline.
    -   A `+` button in the corner asks: **"How do you want to schedule this?"** with two options:
        1.  **[📅 Fixed Meeting]:** Creates a standard `Event`.
        2.  **[🕐 Available Hours]:** Creates an **Availability Block**.

*   **Availability Blocks:**
    -   Define windows where clients can book appointments.
    -   Settings include allowed meeting lengths, time snapping ("Meetings can start at: Every 15 minutes"), and buffer time.
    -   Rendered as semi-transparent green areas on the timeline.
    -   When a client books an appointment, we create a event within this block.
    -   Availability blocks can be dragged and resized, with real-time conflict detection.

*   **Event Creation:** Clicking on the timeline or on + icon opens a modal to create an event, with fields for title, description, type (individual/group), date/time, duration, and location (in-person/Zoom).
------------------------------------------------------------------------------------------------
                Part 5: Hosting, Deployment, and the "Publish" Workflow
------------------------------------------------------------------------------------------------

5.1. Hosting Strategy
---------------------
*   **Backend:** The Django project will be containerized using Docker and deployed on a platform like Railway.
*   **Frontends:** All frontend applications (The Studio/Editor and all personal sites) will be hosted on Vercel.

5.2. Vercel Configuration
-------------------------
Configure Vercel projects as specified in the original plan, using environment variables (`REACT_APP_BUILD_TARGET` and `REACT_APP_SITE_IDENTIFIER`) to differentiate builds.

5.3. Implement the "Publish" Workflow
-------------------------------------
1.  **Create API Endpoint:** In the backend, create `POST /api/v1/SITES/{id}/publish/`.
2.  **Trigger Hook:** This endpoint's logic will retrieve the site's Vercel Build Hook URL and send a POST request to it.
3.  **Frontend Build Logic:** In `SiteApp.jsx`, implement logic to read the `REACT_APP_SITE_IDENTIFIER`, fetch the latest `template_config` from a public API endpoint, and use it to generate the static site during the Vercel build.
4.  **Editor Button:** The "Publish" button in the editor's top bar will trigger the API call.

------------------------------------------------------------------------------------------------
                       **Part 6: Technology Stack (Established & Planned)**
------------------------------------------------------------------------------------------------

## Backend (Central API)

*   **Django:** The core Python framework.
*   **Django REST Framework:** The toolkit for building the RESTful API.
*   **PostgreSQL:** The primary relational database.
*   **Simple JWT (with dj-rest-auth):** Handles token-based authentication.
*   **Gunicorn:** The production-grade WSGI server.
*   **Docker:** Used to containerize the backend application.

## Frontend (Editor & Site Template)

*   **React:** Builds the user interfaces.
*   **React Router:** Manages client-side page navigation.
*   **Zustand:** (To Be Implemented) A lightweight state management library for the editor's "hot reload" feature.
*   **Axios:** The HTTP client for communicating with the Django API.
*   **Material-UI (MUI):** The component library for the **Editor/Studio**.
*   **Tailwind CSS:** (To Be Implemented) The utility-first CSS framework for styling the generated **Personal Sites**.
*   **@react-oauth/google:** The client-side library for "Sign in with Google."

## Hosting & Deployment

*   **Railway (or similar):** Hosts the containerized Django backend.
*   **Vercel:** Hosts all static frontend applications.
*   **Vercel Build Hooks:** The core mechanism for the "Publish" workflow.
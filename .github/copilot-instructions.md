================================================================================================
                    Project Plan & Copilot Instructions: YourEasySite.com
                                                Phase 3
================================================================================================

This document outlines the complete architecture and implementation plan for the multi-tenant personal site generator. The core of the platform is a single, powerful backend that serves multiple, independent frontend sites, providing a scalable and manageable solution. Phase 3 focuses on building the core user-facing features: the editor experience and the advanced creator calendar.

------------------------------------------------------------------------------------------------
                             Part 1: Vision & High-Level Architecture (Established)
------------------------------------------------------------------------------------------------

1.1. Project Introduction
-------------------------
We are building a minimalist, elegant, and modern **Personal Site Generator**. This platform is for solo entrepreneurs who need a professional online presence without technical knowledge. The user experience is centered around simplicity, intuition, and an integrated **AI Assistant** that makes changes through natural language.

The application guides users through simple steps in site creation (template selection, structure, colors, etc.). The AI Assistant is always available to guide users and execute their requests.

1.2. Project Vision
--------------------
Our goal is to create a platform that empowers users to build and manage their personal websites. We aim to eliminate technical barriers, encourage creativity, and help them create a unique online presence.

The guiding theme is **"Ethereal Minimalism"** with a Cinematic and Atmospheric user experience. It's designed to feel calming, professional, and immersive, guiding the user through a narrative rather than just presenting information. The "high vibe" of our app comes from a careful blend of spaciousness, subtle motion, and a focus on emotional connection.

Layout and Structure:
Use a clean, spacious, and uncluttered layout with a strong emphasis on whitespace.
The design should be mobile-responsive, adapting seamlessly to different screen sizes.

Typography:
Employ a strong typographic hierarchy. Use a clean and highly legible sans-serif font (like Inter, Roboto, or Montserrat) for body copy.
For headlines, use a bold, elegant font that adds personality. This could be a slightly more stylized sans-serif or a modern serif font.
Vary font weights and sizes to guide the user's attention to the most important information.

Animations and Interactions:
All animations should be smooth, subtle, and purposeful. Avoid anything jarring or overly fast.
Implement "scrollytelling" effects: elements should gracefully fade in or slide into view as the user scrolls down the page.

Include micro-interactions on buttons and interactive elements. For example, buttons could have a subtle glow, a slight lift, or a change in color on hover.

Content and Imagery:
Use high-quality, professional images and graphics. Abstract visuals, like animated waves, ripples, or blooming effects, are preferred over generic stock photos.

The written content should be concise, evocative, and emotionally resonant. Use a tone that is both professional and inspiring.

1.3. Key Principles
-------------------
App motto is simplicity.
Do not over-engineer. If something can be done in a simpler way, do it that way.
The system prioritizes discoverability and prevents complexity from overwhelming the user.

Before implementing any feature, think if it can be done in the simpler way !


1.4. AI Agent Development Standards
------------------------------------

**1. SOLID Principles Always**
Every component must follow Single Responsibility, be Open for extension but Closed for modification, use proper abstractions over concrete implementations, and maintain clear dependency hierarchies pointing inward.

**2. Simple, Clean Architecture**
Separate business logic from infrastructure, use clear layers (Presentation → Application → Domain → Infrastructure), and abstract all external dependencies for easy testing and replacement.

**3. Code Quality & Maintainability**
Write self-documenting code with clear naming, follow DRY/YAGNI/KISS principles, and favor composition over inheritance.

**4. Design for Future Growth**
Use dependency injection, design for horizontal scaling and multi-tenancy from day one, implement event-driven patterns for decoupling, and write code that's easy to delete or modify.

**5. Before Writing Code, Validate**
Ask: Is this the simplest solution? Does it follow SOLID? Can it be easily tested and extended? Are dependencies properly abstracted? What happens when requirements change?

**6. Code Quality Alerts**
When reviewing or writing code, if you identify patterns, implementations, or architectural decisions that could cause maintenance issues, scalability problems, or technical debt in the future, you MUST flag these in your summary with:
- Clear description of the potential issue
- Why it will cause problems as the system grows
- Recommended refactoring approach or alternative solution
- Urgency level (Low/Medium/High/Critical)

**7. AI Summary Format**
Every response involving code changes MUST include a short max 5 sentence summary of the changes made. Summary must be precise and to the point. Do not include unnecessary details. Save tokens.

**Code Quality Alerts in summary:** (only include if issues are identified, otherwise omit this section entirely)
- **Issue:** [Clear description of the potential problem]
  **Impact:** [Why it will cause problems as the system grows]
  **Solution:** [Recommended refactoring approach or alternative]
  **Urgency:** [Low/Medium/High/Critical]

**8. Development Environment**
All services run in Docker containers with hot-reload enabled, DO NOT propose to run services natively on host machine, assume every change is instantly reflected in running containers.

**9. Readme files**
DO NOT CREATE README FILES ABOUT CHANGES MADE. DO THEM ONLY IF TOLD TO DO SO.

1.5. Core Color Palette & Typography
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

1.6. Core Architectural Principle: Multi-Tenant Single Backend
-------------------------------------------------------------
The system is built on a **"single backend, multiple frontends"** model, which is the industry standard for scalable SaaS applications. Each user can have a maximum of three personal sites, all managed by one central backend and database.

*   **Core Components:**
    *   **The Studio (SaaS Platform):** The main application where site owners log in. It consists of the central backend API and a frontend "Studio" interface for high-level management (listing sites, managing billing, launching the editor and and calendar scheduling).
    *   **The Editor:** A dedicated interface launched from the Studio for a specific site. This is where all visual editing happens, with the integrated AI Assistant.
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
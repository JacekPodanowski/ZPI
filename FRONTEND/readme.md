# Frontend

This directory contains the frontend code for the Personal Site Generator.

## Core Structure

The frontend is organized into two main applications and a set of shared resources.

- `src/`
  - `components/`: **Shared** React components used across the entire project (e.g., Button, Modal).
  - `contexts/`: **Shared** React contexts (e.g., AuthContext).
  - `services/`: **Shared** API services for communicating with the backend.
  - `theme/`: The **Shared** application-wide theme and styling system.
  - `assets/`: Global static assets like icons and images.

### 1. The Studio Application (`src/STUDIO`)

This is the main SaaS platform where users log in to create and manage their websites.

- `STUDIO/components/`: Components that are used **only** within the Studio app (e.g., TopBar, AIChat, Configurator).
- `STUDIO/layouts/`: Layout components that wrap Studio pages (e.g., adding a navigation bar).
- `STUDIO/pages/`: All pages for the Studio, organized by feature (Dashboard, Editor, Login, etc.).
- `STUDIO/store/`: Zustand state management stores for the Studio (e.g., editorStore).
- `STUDIO/routes.jsx`: The main React Router configuration for the entire Studio application.

### 2. The Sites Template (`src/SITES`)

This is the template for the public-facing websites that are generated for users. It is a separate application that renders content based on a configuration provided by the backend.

- `SITES/components/`: Components for building the public site pages (e.g., HeroSection, PublicCalendar).
- `SITES/pages/`: Page templates for the public site (e.g., HomePage, ContactPage).
- `SITES/SiteApp.jsx`: The root component that renders a complete user site from a config.
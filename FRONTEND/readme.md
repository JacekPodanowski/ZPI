# Frontend

This directory contains the frontend code for the Personal Site Generator.

## Structure

- `public/`: Shared assets like fonts and favicons.
- `src/`: Source code.
  - `components/`: Shared React components (e.g., Button, Calendar).
  - `contexts/`: Shared React contexts (e.g., AuthContext).
  - `services/`: Shared services (e.g., apiClient.js).
  - `editor/`: The Editor application.
    - `components/`: UI components for the Editor (e.g., TopBar, AIChat).
    - `pages/`: Pages for the Editor (e.g., WelcomePage, Studio).
    - `EditorApp.jsx`: The main component for the Editor.
  - `site-template/`: The template for the generated personal sites.
    - `components/`: Components for building the site pages (e.g., Hero, AboutMe).
    - `pages/`: Pages for the site template (e.g., HomePage, InfoPage).
    - `SiteApp.jsx`: The main component that renders the site from a config.
- `package.json`: A single `package.json` for the entire frontend.
- `README.md`: This file.

# Technology Stack: Personal Site Generator

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
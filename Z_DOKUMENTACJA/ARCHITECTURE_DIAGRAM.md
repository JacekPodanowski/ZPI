# YourEasySite - Diagram Architektury Systemu

## Przegląd Systemu

YourEasySite to wielodomenowa platforma SaaS do tworzenia osobistych stron internetowych, zbudowana w architekturze **Single Backend - Multiple Frontends**.

---

## Diagram Architektury Wysokiego Poziomu

```mermaid
---
title: Architektura Wysokiego Poziomu
---
graph TB
    subgraph "Użytkownicy"
        ADMIN[👤 Admini<br/>Deweloperzy]
        CREATOR[👤 Twórcy<br/>Właściciele Stron]
        CLIENT[👤 Klienci<br/>Użytkownicy Stron]
    end

    subgraph "Frontend Layer"
        STUDIO[🎨 Studio Frontend<br/>React SPA<br/>Port 3000]
        SITE[🌐 Osobiste Strony<br/>Statyczne Buildy<br/>Vercel]
    end

    subgraph "Backend Layer"
        DJANGO[⚙️ Django Backend<br/>REST API + WebSockets<br/>Port 8000]
        CELERY[⏰ Celery Worker<br/>Async Tasks]
        BEAT[📅 Celery Beat<br/>Scheduled Tasks]
    end

    subgraph "Data Layer"
        POSTGRES[(🗄️ PostgreSQL<br/>Port 5432)]
        REDIS[(💾 Redis<br/>Port 6379)]
        SUPABASE[☁️ Supabase Storage<br/>Media Files]
    end

    subgraph "External Services"
        GOOGLE[🔐 Google OAuth]
        P24[💳 Przelewy24<br/>Payments]
        OVH[🌍 OVH API<br/>Domain Management]
        CF[⚡ Cloudflare<br/>DNS + Worker]
        OPENAI[🤖 OpenAI API<br/>AI Assistant]
    end

    ADMIN --> STUDIO
    CREATOR --> STUDIO
    CLIENT --> SITE
    
    STUDIO --> DJANGO
    SITE --> DJANGO
    
    DJANGO --> POSTGRES
    DJANGO --> REDIS
    DJANGO --> SUPABASE
    
    CELERY --> REDIS
    CELERY --> POSTGRES
    BEAT --> REDIS
    
    DJANGO --> GOOGLE
    DJANGO --> P24
    DJANGO --> OVH
    DJANGO --> CF
    DJANGO --> OPENAI

    style STUDIO fill:#e1bee7
    style SITE fill:#c5e1a5
    style DJANGO fill:#90caf9
    style POSTGRES fill:#ffcc80
    style REDIS fill:#ef9a9a
```

---

## Szczegółowa Architektura Backend

```mermaid
---
title: Django Backend Architecture
---
graph TB
    subgraph "Django Backend - api/"
        VIEWS[views.py<br/>ViewSets & Endpoints]
        PAYMENT_VIEWS[payment_views.py<br/>Przelewy24 Integration]
        MODELS[models.py<br/>Database Models]
        SERIALIZERS[serializers.py<br/>DRF Serializers]
        PERMISSIONS[permissions.py<br/>Access Control]
        TASKS[tasks.py<br/>Celery Tasks]
        CONSUMERS[consumers.py<br/>WebSocket Handlers]
        AI_SERVICES[ai_services.py<br/>OpenAI Integration]
        MEDIA_STORAGE[media_storage.py<br/>Supabase Integration]
        SIGNALS[signals.py<br/>Django Signals]
        UTILS[utils.py<br/>Helper Functions]
    end

    VIEWS --> SERIALIZERS
    VIEWS --> PERMISSIONS
    VIEWS --> MODELS
    VIEWS --> TASKS
    PAYMENT_VIEWS --> MODELS
    SERIALIZERS --> MODELS
    CONSUMERS --> MODELS
    TASKS --> MODELS
    TASKS --> AI_SERVICES
    TASKS --> MEDIA_STORAGE
    SIGNALS --> MODELS

    style VIEWS fill:#90caf9
    style MODELS fill:#ffcc80
    style TASKS fill:#a5d6a7
    style CONSUMERS fill:#ce93d8
```

---

## Modele Bazy Danych

```mermaid
---
title: Database Models ERD
---
erDiagram
    PlatformUser ||--o{ Site : owns
    PlatformUser ||--o{ TeamMember : "linked to"
    PlatformUser ||--o{ Event : creates
    PlatformUser ||--o{ Payment : makes
    PlatformUser ||--o{ MagicLink : "has links"
    PlatformUser ||--o{ MediaAsset : uploads
    PlatformUser ||--o{ AttendedSession : hosts
    
    Site ||--o{ Client : "has clients"
    Site ||--o{ Event : "has events"
    Site ||--o{ Booking : "has bookings"
    Site ||--o{ AvailabilityBlock : "has availability"
    Site ||--o{ TeamMember : "has team"
    Site ||--o{ CustomReactComponent : "has components"
    Site ||--o{ SiteVersion : "has versions"
    Site ||--o{ DomainOrder : "has domains"
    Site ||--o{ Testimonial : "has testimonials"
    Site ||--o{ NewsletterSubscription : "has subscribers"
    Site ||--o{ MediaUsage : "uses media"
    Site ||--o{ AttendedSession : "tracks sessions"
    
    Event ||--o{ Booking : "has bookings"
    Event }o--o{ Client : "attendees"
    Event }o--|| TeamMember : "assigned to"
    Event }o--|| PlatformUser : "assigned to owner"
    
    TeamMember ||--o{ Event : "assigned events"
    TeamMember ||--o{ AvailabilityBlock : "availability"
    TeamMember ||--o{ AttendedSession : hosts
    
    Client ||--o{ Booking : makes
    
    MediaAsset ||--o{ MediaUsage : "used in"
    
    NewsletterSubscription ||--o{ NewsletterAnalytics : "tracks"
    
    TermsOfService ||--o{ PlatformUser : "agreed by users"

    PlatformUser {
        int id PK
        string email UK
        string username
        string first_name
        string last_name
        string avatar_url
        string account_type
        string source_tag
        json preferences
        datetime created_at
    }

    Site {
        int id PK
        int owner_id FK
        string name
        string identifier UK
        int color_index
        int team_size
        bool is_mock
        json template_config
        datetime created_at
    }

    SiteVersion {
        uuid id PK
        int site_id FK
        int version_number
        json template_config
        string notes
        text change_summary
        datetime created_at
    }

    Client {
        int id PK
        int site_id FK
        string email
        string name
        string google_id
        datetime created_at
    }

    TeamMember {
        int id PK
        int site_id FK
        int linked_user_id FK
        string first_name
        string last_name
        string email
        string role_description
        text bio
        string invitation_status
        uuid invitation_token
        string permission_role
        datetime created_at
    }

    Event {
        int id PK
        int site_id FK
        int creator_id FK
        int assigned_to_team_member_id FK
        int assigned_to_owner_id FK
        string title
        text description
        datetime start_time
        datetime end_time
        int capacity
        string event_type
        bool show_host
        datetime created_at
    }

    AvailabilityBlock {
        int id PK
        int site_id FK
        int creator_id FK
        int assigned_to_team_member_id FK
        int assigned_to_owner_id FK
        string title
        date date
        time start_time
        time end_time
        int meeting_length
        int time_snapping
        int buffer_time
        bool show_host
        datetime created_at
    }

    Booking {
        int id PK
        int site_id FK
        int event_id FK
        int client_id FK
        string guest_email
        string guest_name
        text notes
        datetime created_at
    }

    AttendedSession {
        int id PK
        int site_id FK
        int event_id FK
        string host_type
        int host_user_id FK
        int host_team_member_id FK
        string title
        datetime start_time
        datetime end_time
        int duration_minutes
        datetime recorded_at
    }

    MediaAsset {
        int id PK
        int uploaded_by_id FK
        string file_name
        string storage_path UK
        string file_url UK
        string file_hash UK
        string media_type
        bigint file_size
        string storage_bucket
        datetime uploaded_at
    }

    MediaUsage {
        int id PK
        int asset_id FK
        int site_id FK
        int user_id FK
        string usage_type
        datetime created_at
    }

    CustomReactComponent {
        int id PK
        int site_id FK
        int created_by_id FK
        string name
        text description
        text source_code
        file compiled_js
        datetime created_at
    }

    DomainOrder {
        int id PK
        int user_id FK
        int site_id FK
        string domain_name
        string ovh_order_id
        decimal price
        string status
        string target
        bool proxy_mode
        json dns_configuration
        datetime created_at
    }

    Testimonial {
        int id PK
        int site_id FK
        string author_name
        string author_email
        int rating
        text content
        bool is_approved
        datetime created_at
    }

    NewsletterSubscription {
        int id PK
        int site_id FK
        string email
        string frequency
        bool is_active
        bool is_confirmed
        string confirmation_token UK
        string unsubscribe_token UK
        datetime subscribed_at
    }

    NewsletterAnalytics {
        int id PK
        int subscription_id FK
        datetime sent_at
        datetime opened_at
        datetime clicked_at
        string tracking_token UK
    }

    MagicLink {
        int id PK
        int user_id FK
        int team_member_id FK
        string email
        string token UK
        string action_type
        datetime expires_at
        bool used
        datetime created_at
    }

    Payment {
        int id PK
        int user_id FK
        string session_id UK
        int amount
        string currency
        string description
        string plan_id
        string status
        datetime created_at
    }

    TermsOfService {
        int id PK
        string version UK
        text content_md
        datetime published_at
    }
```

---

## Architektura Frontend - Studio

```mermaid
---
title: Frontend Architecture - Studio
---
graph TB
    subgraph "FRONTEND/src/"
        APP[App.jsx<br/>Main Router]
        
        subgraph "STUDIO - Platforma SaaS"
            STUDIO_ROUTES[routes.jsx<br/>Studio Router]
            
            subgraph "Pages"
                HOME[Home/<br/>Landing Page]
                AUTH[Auth/<br/>Login, Register]
                EDITOR[Editor/<br/>Visual Editor]
                CREATOR[Creator/<br/>Calendar Management]
                SITES_MGMT[Sites/<br/>Sites List]
                SETTINGS[Settings/<br/>User Settings]
                TEAM[Team/<br/>Team Management]
                DOMAIN[Domain/<br/>Domain Purchase]
                NEWSLETTER[Newsletter/<br/>Confirm, Unsubscribe]
                ADMIN[Admin/<br/>Admin Panel]
            end
            
            subgraph "Layouts"
                NAV_LAYOUT[NavigationLayout<br/>TopBar + Sidebar]
                EDITOR_LAYOUT[EditorLayout<br/>Editor Wrapper]
            end
            
            subgraph "Store (Zustand)"
                AUTH_STORE[authStore<br/>User State]
                SITE_STORE[siteStore<br/>Sites Data]
                EDITOR_STORE[editorStore<br/>Editor State]
                CALENDAR_STORE[calendarStore<br/>Calendar State]
                UI_STORE[uiStore<br/>UI State]
            end
        end
        
        subgraph "SITES - Public Templates"
            SITE_RENDERER[PublicSiteRendererPage<br/>Dynamic Renderer]
            SITE_PAGES[Pages/<br/>HomePage, CalendarPage<br/>ContactPage, etc.]
            SITE_COMPONENTS[Components/<br/>HeroSection, AboutSection<br/>CalendarSection, etc.]
        end
        
        subgraph "Shared Resources"
            COMPONENTS[components/<br/>Button, Modal, etc.]
            CONTEXTS[contexts/<br/>AuthContext, ThemeContext]
            SERVICES[services/<br/>API Services]
            HOOKS[hooks/<br/>Custom Hooks]
        end
    end

    APP --> STUDIO_ROUTES
    APP --> SITE_RENDERER
    
    STUDIO_ROUTES --> HOME
    STUDIO_ROUTES --> AUTH
    STUDIO_ROUTES --> EDITOR
    STUDIO_ROUTES --> CREATOR
    STUDIO_ROUTES --> SITES_MGMT
    STUDIO_ROUTES --> SETTINGS
    STUDIO_ROUTES --> TEAM
    STUDIO_ROUTES --> DOMAIN
    
    EDITOR --> EDITOR_LAYOUT
    CREATOR --> NAV_LAYOUT
    SITES_MGMT --> NAV_LAYOUT
    
    EDITOR --> EDITOR_STORE
    CREATOR --> CALENDAR_STORE
    AUTH --> AUTH_STORE
    
    SITE_RENDERER --> SITE_PAGES
    SITE_PAGES --> SITE_COMPONENTS
    
    STUDIO_ROUTES --> SERVICES
    SITE_RENDERER --> SERVICES
    SERVICES --> CONTEXTS

    style STUDIO_ROUTES fill:#e1bee7
    style SITE_RENDERER fill:#c5e1a5
    style SERVICES fill:#90caf9
```

---

## Przepływ Danych - Editor

```mermaid
---
title: Editor Data Flow
---
sequenceDiagram
    participant U as Użytkownik
    participant E as Editor UI
    participant S as editorStore
    participant AI as AI Assistant
    participant API as Django API
    participant DB as PostgreSQL

    U->>E: Otwiera Editor
    E->>API: GET /sites/{id}
    API->>DB: Pobierz Site + template_config
    DB-->>API: Site Data
    API-->>E: Site Configuration
    E->>S: updateSiteConfig(config)
    S-->>E: Zaktualizowany Stan
    E-->>U: Renderuje Preview

    U->>E: Zmienia kolor
    E->>S: updateColor(newColor)
    S->>API: PATCH /sites/{id}
    API->>DB: UPDATE template_config
    DB-->>API: Success
    API-->>S: Updated Config
    S-->>E: Re-render Preview

    U->>AI: "Dodaj sekcję galerii"
    AI->>API: POST /ai-task/
    API->>Celery: Async AI Processing
    Celery->>OpenAI: Generate Changes
    OpenAI-->>Celery: New Config
    Celery->>DB: Update template_config
    DB-->>API: Success
    API-->>AI: Task Complete
    AI-->>U: "Dodano sekcję galerii"
    AI->>E: Refresh Preview
```

---

## Przepływ Rezerwacji - Kalendarz

```mermaid
---
title: Booking Flow - Calendar
---
sequenceDiagram
    participant C as Klient (Guest)
    participant PS as Public Site
    participant API as Django API
    participant DB as PostgreSQL
    participant Email as Email Service

    C->>PS: Otwiera Kalendarz
    PS->>API: GET /public-sites/{id}/availability/
    API->>DB: Query Events & AvailabilityBlocks
    DB-->>API: Available Slots
    API-->>PS: Dostępne Terminy
    PS-->>C: Wyświetla Kalendarz

    C->>PS: Wybiera slot + wypełnia formularz
    PS->>API: POST /public-sites/{id}/bookings/
    API->>DB: CREATE Booking + Event
    DB-->>API: Booking Created
    
    API->>Email: Wyślij potwierdzenie
    Email-->>C: Email potwierdzenia
    API->>Email: Notify Creator
    Email-->>Creator: Powiadomienie o rezerwacji
    
    API-->>PS: Booking Success
    PS-->>C: Potwierdzenie + Link do anulowania
```

---

## Integracje Zewnętrzne

```mermaid
---
title: External Integrations
---
graph LR
    subgraph "Django Backend"
        VIEWS[Views & Tasks]
    end

    subgraph "Autentykacja"
        GOOGLE[Google OAuth 2.0<br/>Login dla Creators & Clients]
        MAGIC[Magic Links<br/>Passwordless Auth]
    end

    subgraph "Płatności"
        P24[Przelewy24<br/>Pro/Pro+ Subscriptions]
    end

    subgraph "Domeny"
        OVH[OVH API<br/>Domain Purchase & Management]
        CF[Cloudflare API<br/>DNS Configuration]
        CF_WORKER[Cloudflare Worker<br/>Domain Proxy/Redirect]
    end

    subgraph "Media & Storage"
        SUPABASE[Supabase Storage<br/>Images & Videos]
    end

    subgraph "AI & Automation"
        OPENAI[OpenAI GPT-4<br/>AI Assistant]
        CELERY[Celery<br/>Background Tasks]
    end

    subgraph "Email"
        SMTP[SMTP Service<br/>Transactional Emails]
    end

    VIEWS --> GOOGLE
    VIEWS --> MAGIC
    VIEWS --> P24
    VIEWS --> OVH
    VIEWS --> CF
    VIEWS --> SUPABASE
    VIEWS --> OPENAI
    VIEWS --> CELERY
    VIEWS --> SMTP
    
    CF --> CF_WORKER

    style GOOGLE fill:#ea4335
    style P24 fill:#4caf50
    style OVH fill:#123f6d
    style CF fill:#f38020
    style SUPABASE fill:#3ecf8e
    style OPENAI fill:#10a37f
```

---

## Struktura URL API

```mermaid
---
title: API URL Structure
---
graph TB
    ROOT[/api/v1/]
    
    ROOT --> AUTH[/auth/*<br/>Login, Register, OAuth]
    ROOT --> USERS[/users/<br/>PlatformUser CRUD]
    ROOT --> SITES[/sites/<br/>Site CRUD]
    ROOT --> EVENTS[/events/<br/>Event CRUD]
    ROOT --> BOOKINGS[/bookings/<br/>Booking CRUD]
    ROOT --> CLIENTS[/clients/<br/>Client CRUD]
    ROOT --> TEAM[/team-members/<br/>Team Management]
    ROOT --> AVAILABILITY[/availability-blocks/<br/>Availability CRUD]
    ROOT --> TEMPLATES[/templates/<br/>Calendar Templates]
    ROOT --> COMPONENTS[/custom-components/<br/>React Components]
    ROOT --> MEDIA[/upload/<br/>Media Upload]
    ROOT --> NOTIFICATIONS[/notifications/<br/>User Notifications]
    ROOT --> TERMS[/terms/*<br/>Terms of Service]
    ROOT --> EMAIL[/emails/*<br/>Email Templates]
    ROOT --> DOMAINS[/domains/*<br/>Domain Management]
    ROOT --> PAYMENTS[/payments/*<br/>Przelewy24]
    ROOT --> NEWSLETTER[/newsletter/*<br/>Newsletter Management]
    ROOT --> TESTIMONIALS[/testimonials/<br/>Testimonials CRUD]
    ROOT --> AI[/ai-task/<br/>AI Assistant]
    ROOT --> PUBLIC[/public-sites/*<br/>Public API for Sites]
    ROOT --> ADMIN[/admin/*<br/>Admin Panel]

    style AUTH fill:#f8bbd0
    style PUBLIC fill:#c5e1a5
    style AI fill:#ce93d8
    style PAYMENTS fill:#ffccbc
```

---

## Przepływ Deploymentu

```mermaid
---
title: Deployment Flow
---
graph LR
    subgraph "Development"
        DEV[Local Development<br/>Docker Compose]
    end

    subgraph "Version Control"
        GIT[GitHub Repository<br/>main branch]
    end

    subgraph "CI/CD"
        GHA[GitHub Actions<br/>Optional]
    end

    subgraph "Production"
        RAILWAY[Railway<br/>Django Backend + DB]
        VERCEL_STUDIO[Vercel<br/>Studio Frontend]
        VERCEL_SITES[Vercel<br/>User Sites<br/>Multiple Projects]
    end

    DEV -->|git push| GIT
    GIT -->|webhook| GHA
    GHA -->|deploy| RAILWAY
    GHA -->|deploy| VERCEL_STUDIO
    
    RAILWAY -.->|Publish Trigger| VERCEL_SITES
    
    style DEV fill:#90caf9
    style RAILWAY fill:#b39ddb
    style VERCEL_STUDIO fill:#e1bee7
    style VERCEL_SITES fill:#c5e1a5
```

---

## Konteneryzacja (Docker Compose)

```mermaid
---
title: Docker Compose Stack
---
graph TB
    subgraph "Docker Compose Stack"
        subgraph "Data Services"
            DB[postgres:16-alpine<br/>Port 5432<br/>Volume: site_db_data]
            REDIS[redis:7-alpine<br/>Port 6379]
        end
        
        subgraph "Backend Services"
            SETUP[backend-setup<br/>Migrations + Setup<br/>One-time run]
            DJANGO[backend<br/>Daphne ASGI Server<br/>Port 8000<br/>WebSockets Support]
            CELERY_W[celery-worker<br/>Async Task Processing]
            CELERY_B[celery-beat<br/>Periodic Tasks Scheduler]
        end
        
        subgraph "Frontend Services"
            STUDIO_FE[studio-frontend<br/>Vite Dev Server<br/>Port 3000<br/>Hot Reload]
        end
    end

    DB -.->|healthcheck| SETUP
    REDIS -.->|healthcheck| SETUP
    SETUP -->|depends_on| DJANGO
    SETUP -->|depends_on| CELERY_W
    SETUP -->|depends_on| CELERY_B
    
    DJANGO --> DB
    DJANGO --> REDIS
    CELERY_W --> DB
    CELERY_W --> REDIS
    CELERY_B --> REDIS
    
    STUDIO_FE --> DJANGO

    style DB fill:#ffcc80
    style REDIS fill:#ef9a9a
    style DJANGO fill:#90caf9
    style STUDIO_FE fill:#e1bee7
```

---

## Typy Użytkowników i Uprawnienia

```mermaid
---
title: User Types and Permissions
---
graph TB
    subgraph "Hierarchia Użytkowników"
        ADMIN[👨‍💼 Admin<br/>is_staff=True<br/>account_type=PRO]
        CREATOR[👤 Creator - Platform User<br/>Free / Pro / Pro+]
        TEAM[👥 Team Member<br/>Linked to Site]
        CLIENT[🙋 Client<br/>End User]
        GUEST[👻 Guest<br/>No Account]
    end

    subgraph "Uprawnienia Creator"
        C_OWN[Zarządza swoimi Sites]
        C_EDIT[Edytuje template_config]
        C_CALENDAR[Tworzy Events]
        C_TEAM[Zarządza Team Members]
        C_DOMAIN[Kupuje domeny]
        C_PAYMENT[Płaci za subskrypcje]
    end

    subgraph "Uprawnienia Team Member"
        T_CALENDAR[Zarządza własnymi Events]
        T_EDIT[Edytuje Site (role-based)]
        T_VIEW[Przegląda kalendarz]
    end

    subgraph "Uprawnienia Client"
        CL_BOOK[Rezerwuje group sessions]
        CL_VIEW[Przegląda historię rezerwacji]
        CL_CANCEL[Anuluje rezerwacje]
    end

    subgraph "Uprawnienia Guest"
        G_BOOK[Rezerwuje individual sessions]
        G_UPGRADE[Może utworzyć konto]
    end

    ADMIN --> C_OWN
    CREATOR --> C_OWN
    CREATOR --> C_EDIT
    CREATOR --> C_CALENDAR
    CREATOR --> C_TEAM
    CREATOR --> C_DOMAIN
    CREATOR --> C_PAYMENT
    
    TEAM --> T_CALENDAR
    TEAM --> T_EDIT
    TEAM --> T_VIEW
    
    CLIENT --> CL_BOOK
    CLIENT --> CL_VIEW
    CLIENT --> CL_CANCEL
    
    GUEST --> G_BOOK
    GUEST --> G_UPGRADE

    style ADMIN fill:#f44336
    style CREATOR fill:#2196f3
    style TEAM fill:#4caf50
    style CLIENT fill:#ff9800
    style GUEST fill:#9e9e9e
```

---

## Konwencje ID i Dane Mockowe

```mermaid
---
title: Site ID Conventions
---
graph LR
    subgraph "Site ID Ranges"
        ID_1[ID = 1<br/>YourEasySite Demo<br/>Showcase Site]
        ID_2_99[IDs 2-99<br/>Mock/Test Sites<br/>is_mock=True]
        ID_100[IDs ≥ 100<br/>Real User Sites<br/>is_mock=False]
    end

    ID_1 -.->|Showcase| PUBLIC
    ID_2_99 -.->|Development| TESTING
    ID_100 -.->|Production| USERS

    style ID_1 fill:#f44336
    style ID_2_99 fill:#ff9800
    style ID_100 fill:#4caf50
```

---

## Roadmap Funkcji

```mermaid
gantt
    title YourEasySite Development Phases
    dateFormat  YYYY-MM-DD
    section Phase 1 ✅
    Core Backend (Models, API)      :done, 2024-01-01, 30d
    Studio Frontend (Basic UI)      :done, 2024-01-15, 30d
    Authentication (OAuth + Magic)  :done, 2024-02-01, 14d
    section Phase 2 ✅
    Calendar System                 :done, 2024-02-15, 30d
    Booking System                  :done, 2024-03-01, 21d
    Team Management                 :done, 2024-03-15, 14d
    section Phase 3 🚧
    Editor Experience               :active, 2024-04-01, 30d
    AI Assistant Integration        :active, 2024-04-15, 21d
    Advanced Calendar Features      :active, 2024-05-01, 14d
    section Phase 4 📋
    Domain Purchase System          :2024-05-15, 21d
    Payment Integration (P24)       :2024-06-01, 14d
    Newsletter System               :2024-06-15, 14d
    section Phase 5 🔮
    Testimonials & Reviews          :2024-07-01, 14d
    Analytics & Reporting           :2024-07-15, 21d
    Mobile App (Optional)           :2024-08-01, 60d
```

---

## Podsumowanie Technologii

| Warstwa | Technologia | Opis |
|---------|-------------|------|
| **Frontend** | React 18 + Vite | Single Page Application |
| **Routing** | React Router v6 | Client-side routing |
| **State Management** | Zustand | Lightweight state management |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Backend** | Django 5.1 + DRF | REST API |
| **WebSockets** | Django Channels + Daphne | Real-time communication |
| **Database** | PostgreSQL 16 | Relational database |
| **Cache/Queue** | Redis 7 | Message broker |
| **Async Tasks** | Celery | Background job processing |
| **File Storage** | Supabase Storage | Media assets |
| **Authentication** | Google OAuth 2.0 | Social login |
| **Payments** | Przelewy24 | Polish payment gateway |
| **Domain Management** | OVH API + Cloudflare | Domain purchase & DNS |
| **AI** | OpenAI GPT-4 | AI Assistant |
| **Email** | SMTP + Django Templates | Transactional emails |
| **Containerization** | Docker + Docker Compose | Development environment |
| **Hosting (Backend)** | Railway | PaaS for Django |
| **Hosting (Frontend)** | Vercel | Static site hosting |

---

## Bezpieczeństwo i Najlepsze Praktyki

- **Multi-tenancy**: Wszystkie zapytania filtrowane po `site_id`
- **Permissions**: Role-based access control (Owner, Manager, Contributor, Viewer)
- **Authentication**: OAuth2 + Magic Links + Password Reset
- **Data Isolation**: Każdy Site ma oddzielne dane
- **Media Storage**: Pliki hashowane (SHA-256) i deduplikowane
- **Rate Limiting**: Ochrona API przed nadużyciami
- **CORS**: Konfiguracja dla wielu domen
- **Environment Variables**: Wrażliwe dane w `.env`
- **Migrations**: Wszystkie zmiany DB przez Django migrations
- **Health Checks**: Docker healthchecks dla DB i Redis
- **Error Handling**: Globalne middleware dla błędów
- **Logging**: Structured logging dla debugging

---

**Wersja dokumentu**: 1.0  
**Data aktualizacji**: 21 listopada 2025  
**Autor**: YourEasySite Development Team

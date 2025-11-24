erDiagram
    %% Core User & Site Models
    PlatformUser ||--o{ Site : "owns"
    PlatformUser ||--o{ SiteVersion : "creates"
    PlatformUser ||--o{ Template : "owns"
    PlatformUser ||--o{ MagicLink : "has"
    PlatformUser ||--o{ Notification : "receives"
    PlatformUser ||--o{ MediaAsset : "uploads"
    PlatformUser ||--o{ CustomReactComponent : "creates"
    PlatformUser ||--o{ EmailTemplate : "owns"
    PlatformUser ||--o{ Payment : "makes"
    PlatformUser ||--o{ DomainOrder : "places"
    PlatformUser ||--|| TermsOfService : "agrees_to"
    
    Site ||--o{ SiteVersion : "has"
    Site ||--o{ Client : "has"
    Site ||--o{ TeamMember : "has"
    Site ||--o{ Event : "contains"
    Site ||--o{ AvailabilityBlock : "has"
    Site ||--o{ Booking : "receives"
    Site ||--o{ AttendedSession : "tracks"
    Site ||--o{ MediaUsage : "uses_media"
    Site ||--o{ CustomReactComponent : "has"
    Site ||--o{ DomainOrder : "orders_domain"
    Site ||--o{ Testimonial : "has"
    Site ||--|| TestimonialSummary : "has_summary"
    Site ||--o{ NewsletterSubscription : "has_subscribers"
    Site ||--o{ BigEvent : "hosts"
    
    %% Team System
    TeamMember }o--|| Site : "belongs_to"
    TeamMember }o--o| PlatformUser : "linked_to"
    TeamMember ||--o{ Event : "assigned_events"
    TeamMember ||--o{ AvailabilityBlock : "assigned_blocks"
    TeamMember ||--o{ AttendedSession : "hosts"
    TeamMember ||--o{ MagicLink : "invitation_links"
    
    %% Calendar & Booking System
    Event }o--|| Site : "belongs_to"
    Event }o--|| PlatformUser : "created_by"
    Event }o--o| TeamMember : "assigned_to_team_member"
    Event }o--o| PlatformUser : "assigned_to_owner"
    Event ||--o{ Booking : "has"
    Event ||--o{ AttendedSession : "generates"
    Event }o--o{ Client : "attendees"
    
    AvailabilityBlock }o--|| Site : "belongs_to"
    AvailabilityBlock }o--|| PlatformUser : "created_by"
    AvailabilityBlock }o--o| TeamMember : "assigned_to_team_member"
    AvailabilityBlock }o--o| PlatformUser : "assigned_to_owner"
    
    Booking }o--|| Site : "belongs_to"
    Booking }o--|| Event : "for_event"
    Booking }o--o| Client : "made_by"
    
    AttendedSession }o--|| Site : "belongs_to"
    AttendedSession }o--o| Event : "from_event"
    AttendedSession }o--o| PlatformUser : "hosted_by_owner"
    AttendedSession }o--o| TeamMember : "hosted_by_member"
    
    %% Client System
    Client }o--|| Site : "belongs_to"
    Client ||--o{ Booking : "makes"
    Client }o--o{ Event : "attends"
    
    %% Media System
    MediaAsset ||--o{ MediaUsage : "used_in"
    MediaAsset }o--|| PlatformUser : "uploaded_by"
    
    MediaUsage }o--o| Site : "for_site"
    MediaUsage }o--o| PlatformUser : "for_user"
    MediaUsage }o--|| MediaAsset : "uses"
    
    %% Custom Components
    CustomReactComponent }o--|| Site : "belongs_to"
    CustomReactComponent }o--o| PlatformUser : "created_by"
    
    %% Authentication
    MagicLink }o--o| PlatformUser : "for_user"
    MagicLink }o--o| TeamMember : "for_invitation"
    
    %% Email & Communication
    EmailTemplate }o--o| PlatformUser : "owner"
    
    NewsletterSubscription }o--|| Site : "subscribes_to"
    NewsletterSubscription ||--o{ NewsletterAnalytics : "tracks"
    
    %% Domain Management
    DomainOrder }o--|| PlatformUser : "ordered_by"
    DomainOrder }o--|| Site : "for_site"
    
    %% Testimonials
    Testimonial }o--|| Site : "belongs_to"
    TestimonialSummary ||--|| Site : "summarizes"
    
    %% Big Events
    BigEvent }o--|| Site : "belongs_to"
    BigEvent }o--|| PlatformUser : "created_by"
    
    %% Payments
    Payment }o--|| PlatformUser : "paid_by"
    
    %% Versioning
    SiteVersion }o--|| Site : "versions_of"
    SiteVersion }o--o| PlatformUser : "created_by"
    
    %% Templates
    Template }o--|| PlatformUser : "owned_by"
    
    %% Terms of Service
    TermsOfService ||--o{ PlatformUser : "agreed_by_users"
    
    %% Model Details
    TermsOfService {
        int id PK
        string version
        text content_pl
        text content_en
        datetime effective_date
        datetime created_at
    }
    
    PlatformUser {
        int id PK
        string email UK
        string account_type
        string source_tag
        int terms_agreement FK
        boolean is_staff
        boolean is_active
        datetime date_joined
        datetime last_login
    }
    
    Site {
        int id PK
        int owner FK
        string name
        string identifier UK
        json template_config
        json version_history
        datetime created_at
        datetime updated_at
    }
    
    SiteVersion {
        uuid id PK
        int site FK
        int version_number
        json config_snapshot
        int created_by FK
        datetime created_at
    }
    
    Template {
        int id PK
        int owner FK
        string name
        text description
        json config
        datetime created_at
    }
    
    Client {
        int id PK
        int site FK
        string email
        string first_name
        string last_name
        datetime created_at
    }
    
    TeamMember {
        int id PK
        int site FK
        int linked_user FK
        string email
        string first_name
        string last_name
        string invitation_status
        string permission_role
        uuid invitation_token UK
        datetime invited_at
        datetime created_at
    }
    
    Event {
        int id PK
        int site FK
        int creator FK
        int assigned_to_team_member FK
        int assigned_to_owner FK
        string title
        text description
        datetime start_time
        datetime end_time
        int capacity
        string event_type
        boolean show_host
        datetime created_at
    }
    
    AvailabilityBlock {
        int id PK
        int site FK
        int creator FK
        int assigned_to_team_member FK
        int assigned_to_owner FK
        string title
        date date
        time start_time
        time end_time
        int meeting_length
        int time_snapping
        int buffer_time
        boolean show_host
        datetime created_at
    }
    
    Booking {
        int id PK
        int site FK
        int event FK
        int client FK
        string guest_email
        string guest_name
        text notes
        datetime created_at
    }
    
    AttendedSession {
        int id PK
        int site FK
        int event FK
        string host_type
        int host_user FK
        int host_team_member FK
        string title
        datetime start_time
        datetime end_time
        int duration_minutes
        datetime recorded_at
        string source
    }
    
    MediaAsset {
        int id PK
        string file_name
        string storage_path UK
        string file_url UK
        string file_hash UK
        string media_type
        bigint file_size
        string storage_bucket
        int uploaded_by FK
        datetime uploaded_at
    }
    
    MediaUsage {
        int id PK
        int asset FK
        int site FK
        int user FK
        string usage_type
        datetime created_at
    }
    
    CustomReactComponent {
        int id PK
        int site FK
        int created_by FK
        string name
        text description
        text source_code
        string compiled_js
        datetime created_at
        datetime updated_at
    }
    
    Notification {
        int id PK
        int user FK
        text message
        boolean is_read
        string notification_type
        datetime created_at
    }
    
    MagicLink {
        int id PK
        int user FK
        int team_member FK
        string email
        string token UK
        string action_type
        boolean used
        datetime created_at
        datetime expires_at
        datetime used_at
    }
    
    EmailTemplate {
        int id PK
        string name
        string slug UK
        string category
        string subject_pl
        string subject_en
        text content_pl
        text content_en
        boolean is_default
        int owner FK
        datetime created_at
    }
    
    DomainOrder {
        int id PK
        int user FK
        int site FK
        string domain_name
        string ovh_order_id
        string ovh_cart_id
        decimal price
        string status
        string payment_url
        json dns_configuration
        string target
        boolean proxy_mode
        text error_message
        datetime created_at
    }
    
    Testimonial {
        int id PK
        int site FK
        string author_name
        string author_email
        int rating
        text content
        boolean is_approved
        datetime created_at
    }
    
    TestimonialSummary {
        int id PK
        int site FK
        text summary
        text detailed_summary
        int total_count
        float average_rating
        datetime created_at
    }
    
    NewsletterSubscription {
        int id PK
        int site FK
        string email
        string frequency
        boolean is_active
        boolean is_confirmed
        string confirmation_token UK
        string unsubscribe_token UK
        datetime subscribed_at
        datetime confirmed_at
        datetime last_sent_at
        int emails_sent
        int emails_opened
        int emails_clicked
    }
    
    NewsletterAnalytics {
        int id PK
        int subscription FK
        datetime sent_at
        datetime opened_at
        datetime clicked_at
        string tracking_token UK
    }
    
    Payment {
        int id PK
        int user FK
        string session_id UK
        int amount
        string currency
        string description
        string email
        string plan_id
        string token
        string status
        string p24_order_id
        datetime created_at
    }
    
    BigEvent {
        int id PK
        int site FK
        int creator FK
        string title
        text description
        string location
        date start_date
        date end_date
        int max_participants
        int current_participants
        decimal price
        string status
        boolean send_email_on_publish
        boolean email_sent
        datetime email_sent_at
        string image_url
        json details
        datetime created_at
        datetime published_at
    }
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CelebrationIcon from '@mui/icons-material/Celebration';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArticleIcon from '@mui/icons-material/Article';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import GroupIcon from '@mui/icons-material/Group';

// Module definitions with icons, descriptions, and warnings
export const MODULE_DEFINITIONS = {
    publicCalendar: {
        id: 'publicCalendar',
        name: 'Spotkania',
        icon: CalendarMonthIcon,
        description: 'Kalendarz rezerwacji i dostępnych terminów',
        enabled: true,
        disableWarning: {
            enabled: true,
            title: 'Wyłączyć rezerwacje?',
            message: 'Jeśli wyłączysz ten moduł, Twoi klienci nie będą mogli zamawiać wizyt online. Czy na pewno?',
            confirmText: 'Wyłącz',
            cancelText: 'Zostaw włączone'
        }
    },
    about: {
        id: 'about',
        name: 'O mnie',
        icon: PersonIcon,
        description: 'Opowiedz o swoim doświadczeniu i podejściu',
        enabled: true
    },
    services: {
        id: 'services',
        name: 'Usługi',
        icon: ListAltIcon,
        description: 'Karty usług z opisami i cenami',
        enabled: true
    },
    events: {
        id: 'events',
        name: 'Wydarzenia',
        icon: CelebrationIcon,
        description: 'Wydarzenia grupowe, warsztaty i wyjazdy',
        enabled: false
    },
    pricing: {
        id: 'pricing',
        name: 'Cennik',
        icon: LocalOfferIcon,
        description: 'Pakiety cenowe i warianty współpracy',
        enabled: true
    },
    gallery: {
        id: 'gallery',
        name: 'Galeria',
        icon: PhotoLibraryIcon,
        description: 'Galeria zdjęć z elastycznym układem',
        enabled: true
    },
    faq: {
        id: 'faq',
        name: 'FAQ',
        icon: HelpOutlineIcon,
        description: 'Lista najczęściej zadawanych pytań',
        enabled: false
    },
    blog: {
        id: 'blog',
        name: 'Blog',
        icon: ArticleIcon,
        description: 'Aktualności i artykuły tworzące Twoją historię',
        enabled: false
    },
    contact: {
        id: 'contact',
        name: 'Kontakt',
        icon: ContactMailIcon,
        description: 'Dane kontaktowe i formularz zapisu',
        enabled: true
    },
    team: {
        id: 'team',
        name: 'Zespół',
        icon: GroupIcon,
        description: 'Prezentacja zespołu i ról',
        enabled: false
    }
};

// Category to module mapping
export const CATEGORY_MODULE_CONFIGS = {
    wellness: ['publicCalendar', 'about', 'services', 'events', 'pricing', 'gallery', 'contact'],
    education: ['publicCalendar', 'about', 'services', 'pricing', 'faq', 'contact'],
    creative: ['publicCalendar', 'about', 'services', 'gallery', 'pricing', 'blog', 'contact'],
    health: ['publicCalendar', 'about', 'services', 'pricing', 'faq', 'contact'],
    default: ['publicCalendar', 'about', 'services', 'pricing', 'faq', 'contact']
};

// Site name validation
export const validateSiteName = (name) => {
    if (!name || name.trim().length < 1) {
        return 'Nazwa musi zawierać przynajmniej 1 znak';
    }
    if (name.length > 20) {
        return 'Nazwa nie może być dłuższa niż 20 znaków';
    }
    if (!/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s]+$/.test(name)) {
        return 'Nazwa może zawierać tylko litery, cyfry i spacje';
    }
    return null; // valid
};

// Get modules for a category
export const getModulesForCategory = (categoryId) => {
    const moduleIds = CATEGORY_MODULE_CONFIGS[categoryId] || CATEGORY_MODULE_CONFIGS.default;
    return moduleIds.map((id) => ({
        ...MODULE_DEFINITIONS[id],
        enabled: CATEGORY_MODULE_CONFIGS[categoryId || 'default'].includes(id)
    }));
};

// localStorage keys
export const WIZARD_STORAGE_KEYS = {
    CATEGORY: 'editor:wizardCategory',
    STEP: 'editor:wizardStep',
    PENDING_CONFIG: 'editor:pendingTemplateConfig',
    PENDING_META: 'editor:pendingSiteMeta',
    ACTIVE_DRAFT: 'editor:activeNewDraft'
};

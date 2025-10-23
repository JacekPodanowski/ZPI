import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CelebrationIcon from '@mui/icons-material/Celebration';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArticleIcon from '@mui/icons-material/Article';
// import GroupIcon from '@mui/icons-material/Group'; // [DEV: Unused - team module marked for deletion]

// Module definitions with icons, descriptions, and warnings
export const MODULE_DEFINITIONS = {
    publicCalendar: {
        id: 'publicCalendar',
        name: 'Spotkania',
        icon: CalendarMonthIcon,
        description: 'Kalendarz rezerwacji terminów',
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
        name: 'O mnie & Kontakt',
        icon: PersonIcon,
        description: '[DEV: Merged "About" + "Contact"] O Tobie i kontakt',
        enabled: true
    },
    services: {
        id: 'services',
        name: 'Usługi & Cennik',
        icon: ListAltIcon,
        description: '[DEV: Merged "Services" + "Pricing"] Oferta i ceny',
        enabled: true
    },
    events: {
        id: 'events',
        name: 'Wydarzenia',
        icon: CelebrationIcon,
        description: 'Warsztaty i wyjazdy grupowe',
        enabled: false
    },
    gallery: {
        id: 'gallery',
        name: 'Galeria',
        icon: PhotoLibraryIcon,
        description: 'Zdjęcia z Twoich zajęć',
        enabled: false
    },
    faq: {
        id: 'faq',
        name: 'FAQ',
        icon: HelpOutlineIcon,
        description: 'Odpowiedzi na pytania',
        enabled: false
    },
    blog: {
        id: 'blog',
        name: 'Blog',
        icon: ArticleIcon,
        description: 'Artykuły i aktualności',
        enabled: false
    },
    // [DEV: TO DELETE] Team module - doesn't make sense for solo entrepreneurs
    // team: {
    //     id: 'team',
    //     name: 'Zespół',
    //     icon: GroupIcon,
    //     description: 'Twój zespół i role',
    //     enabled: false
    // }
};

// Category to module mapping
export const CATEGORY_MODULE_CONFIGS = {
    wellness: ['publicCalendar', 'about', 'services', 'events', 'gallery', 'blog', 'faq'],
    education: ['publicCalendar', 'about', 'services', 'events', 'gallery', 'blog', 'faq'],
    creative: ['publicCalendar', 'about', 'services', 'events', 'gallery', 'blog', 'faq'],
    health: ['publicCalendar', 'about', 'services', 'events', 'gallery', 'blog', 'faq'],
    default: ['publicCalendar', 'about', 'services', 'events', 'gallery', 'blog', 'faq']
};

// Which modules should be ENABLED by default per category
export const CATEGORY_DEFAULT_ENABLED = {
    wellness: ['publicCalendar', 'about', 'services', 'events', 'gallery'],
    education: ['publicCalendar', 'about', 'services'],
    creative: ['publicCalendar', 'about', 'services', 'gallery', 'blog'],
    health: ['publicCalendar', 'about', 'services'],
    default: ['publicCalendar', 'about', 'services']
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
    const enabledIds = CATEGORY_DEFAULT_ENABLED[categoryId] || CATEGORY_DEFAULT_ENABLED.default;
    
    return moduleIds.map((id) => ({
        ...MODULE_DEFINITIONS[id],
        enabled: enabledIds.includes(id)
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

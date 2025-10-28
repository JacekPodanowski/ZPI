import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CelebrationIcon from '@mui/icons-material/Celebration';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArticleIcon from '@mui/icons-material/Article';
import EmailIcon from '@mui/icons-material/Email';

// Module definitions with icons, descriptions, and warnings
export const MODULE_DEFINITIONS = {
    publicCalendar: {
        id: 'publicCalendar',
        name: 'Spotkania',
        icon: CalendarMonthIcon,
        description: 'Kalendarz rezerwacji terminów',
        enabled: true,
        isAdditional: false,
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
        description: 'Opowiedz o sobie',
        enabled: true,
        isAdditional: false
    },
    servicesAndPricing: {
        id: 'servicesAndPricing',
        name: 'Oferta',
        icon: ListAltIcon,
        description: 'Oferta z cenami',
        enabled: true,
        isAdditional: false
    },
    events: {
        id: 'events',
        name: 'Wydarzenia',
        icon: CelebrationIcon,
        description: 'Warsztaty i wyjazdy grupowe',
        enabled: false,
        isAdditional: false
    },
    gallery: {
        id: 'gallery',
        name: 'Galeria',
        icon: PhotoLibraryIcon,
        description: 'Zdjęcia z Twoich zajęć',
        enabled: false,
        isAdditional: false
    },
    blog: {
        id: 'blog',
        name: 'Blog',
        icon: ArticleIcon,
        description: 'Artykuły i aktualności',
        enabled: false,
        isAdditional: false
    },
    contact: {
        id: 'contact',
        name: 'Formularz kontaktowy',
        icon: EmailIcon,
        description: 'Formularz do wysyłania wiadomości',
        enabled: false,
        isAdditional: true
    },
    faq: {
        id: 'faq',
        name: 'FAQ',
        icon: HelpOutlineIcon,
        description: 'Odpowiedzi na pytania',
        enabled: false,
        isAdditional: true
    }
};

// Category to module mapping
export const CATEGORY_MODULE_CONFIGS = {
    wellness: ['publicCalendar', 'about', 'servicesAndPricing', 'events', 'gallery', 'blog', 'contact', 'faq'],
    education: ['publicCalendar', 'about', 'servicesAndPricing', 'events', 'gallery', 'blog', 'contact', 'faq'],
    creative: ['publicCalendar', 'about', 'servicesAndPricing', 'events', 'gallery', 'blog', 'contact', 'faq'],
    health: ['publicCalendar', 'about', 'servicesAndPricing', 'events', 'gallery', 'blog', 'contact', 'faq'],
    default: ['publicCalendar', 'about', 'servicesAndPricing', 'events', 'gallery', 'blog', 'contact', 'faq']
};

// Which modules should be ENABLED by default per category
export const CATEGORY_DEFAULT_ENABLED = {
    wellness: ['publicCalendar', 'about', 'servicesAndPricing', 'events', 'gallery'],
    education: ['publicCalendar', 'about', 'servicesAndPricing'],
    creative: ['publicCalendar', 'about', 'servicesAndPricing', 'gallery', 'blog'],
    health: ['publicCalendar', 'about', 'servicesAndPricing'],
    default: ['publicCalendar', 'about', 'servicesAndPricing']
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

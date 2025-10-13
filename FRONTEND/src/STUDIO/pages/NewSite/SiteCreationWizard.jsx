import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useTemplateStore from '../../store/templateStore';
import useEditorStore, { createDefaultTemplateConfig } from '../../store/editorStore';

const steps = ['Wybierz szablon', 'Dopasuj moduły', 'Gotowe'];

const createDraftId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `draft-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
};

const VISIBLE_MODULE_TYPES = new Set(['services', 'pricing', 'faq', 'team', 'events', 'blog', 'video', 'gallery']);

const VISIBLE_MODULE_KEYWORDS = [
    'hero',
    'about',
    'calendar',
    'contact',
    'gallery',
    'service',
    'pricing',
    'faq',
    'team',
    'event',
    'blog',
    'video'
];

const shouldDisplayModule = (module = {}) => {
    const moduleType = module.type?.toLowerCase();
    if (moduleType && VISIBLE_MODULE_TYPES.has(moduleType)) {
        return true;
    }

    const moduleId = module.id?.toLowerCase() || '';
    return VISIBLE_MODULE_KEYWORDS.some((keyword) => moduleId.includes(keyword));
};

const MODULE_DESCRIPTION_RULES = [
    {
        test: (module) => module.id?.toLowerCase().includes('hero'),
        text: 'Sekcja powitalna z hasłem przewodnim.'
    },
    {
        test: (module) => module.id?.toLowerCase().includes('about'),
        text: 'Opowiedz o sobie i swoim doświadczeniu.'
    },
    {
        test: (module) => module.id?.toLowerCase().includes('calendar'),
        text: 'Harmonogram zajęć i szybkie rezerwacje.'
    },
    {
        test: (module) => module.id?.toLowerCase().includes('contact'),
        text: 'Dane kontaktowe i formularz zapisu.'
    },
    {
        test: (module) => module.type === 'gallery' || module.id?.toLowerCase().includes('gallery'),
        text: 'Galeria zdjęć z elastycznym układem.'
    },
    {
        test: (module) => module.type === 'services' || module.id?.toLowerCase().includes('service'),
        text: 'Karty usług z opisami i zdjęciami.'
    },
    {
        test: (module) => module.type === 'pricing' || module.id?.toLowerCase().includes('pricing') || module.id?.toLowerCase().includes('cennik'),
        text: 'Pakiety cenowe i warianty współpracy.'
    },
    {
        test: (module) => module.type === 'faq' || module.id?.toLowerCase().includes('faq'),
        text: 'Lista najczęściej zadawanych pytań.'
    },
    {
        test: (module) => module.type === 'team' || module.id?.toLowerCase().includes('team'),
        text: 'Prezentacja zespołu i ról.'
    },
    {
        test: (module) => module.type === 'events' || module.id?.toLowerCase().includes('event'),
        text: 'Lista wydarzeń i specjalnych spotkań.'
    },
    {
        test: (module) => module.type === 'blog' || module.id?.toLowerCase().includes('blog'),
        text: 'Aktualności i artykuły tworzące Twoją historię.'
    },
    {
        test: (module) => module.type === 'video' || module.id?.toLowerCase().includes('video'),
        text: 'Sekcja z osadzonym nagraniem wideo.'
    }
];

const getModuleDescription = (module) => {
    const match = MODULE_DESCRIPTION_RULES.find((rule) => rule.test(module));
    return match ? match.text : 'Konfigurowalny moduł strony.';
};

const PENDING_CONFIG_KEY = 'editor:pendingTemplateConfig';
const PENDING_META_KEY = 'editor:pendingSiteMeta';
const ACTIVE_NEW_DRAFT_KEY = 'editor:activeNewDraft';
const NEW_DRAFT_PREFIX = 'editor:draft:new:';

const SiteCreationWizard = () => {
    const navigate = useNavigate();
    const templates = useTemplateStore((state) => state.templates);
    const fetchTemplates = useTemplateStore((state) => state.fetchTemplates);
    const loading = useTemplateStore((state) => state.loading);
    const error = useTemplateStore((state) => state.error);
    const { templateConfig, resetTemplateConfig, setTemplateConfig, toggleModule } = useEditorStore();

    const [activeStep, setActiveStep] = useState(0);
    const [siteName, setSiteName] = useState('Moja nowa strona');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [draftId] = useState(() => {
        if (typeof window === 'undefined') {
            return createDraftId();
        }
        const previousActive = window.localStorage.getItem(ACTIVE_NEW_DRAFT_KEY);
        if (previousActive) {
            window.localStorage.removeItem(`${NEW_DRAFT_PREFIX}${previousActive}`);
        }
        const generated = createDraftId();
        window.localStorage.setItem(ACTIVE_NEW_DRAFT_KEY, generated);
        return generated;
    });

    useEffect(() => {
        resetTemplateConfig();
        if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem(PENDING_CONFIG_KEY);
            window.sessionStorage.removeItem(PENDING_META_KEY);
            window.localStorage.removeItem(PENDING_CONFIG_KEY);
            window.localStorage.removeItem(PENDING_META_KEY);
        }
    }, [resetTemplateConfig]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    useEffect(() => {
        if (!selectedTemplate) {
            return;
        }
        const template = templates.find((item) => item.id === selectedTemplate);
        if (template?.presetConfig) {
            setTemplateConfig(template.presetConfig, { restrictToDefaultPages: true });
        } else {
            const defaultConfig = createDefaultTemplateConfig();
            if (template?.name) {
                defaultConfig.name = template.name;
            }
            setTemplateConfig(defaultConfig, { restrictToDefaultPages: true });
        }

        if (template?.name) {
            setSiteName((prev) => (prev === 'Moja nowa strona' ? template.name : prev));
        }
    }, [selectedTemplate, setTemplateConfig, templates]);

    useEffect(() => {
        if (!loading && templates.length > 0 && !selectedTemplate) {
            setSelectedTemplate(templates[0].id);
        }
    }, [loading, templates, selectedTemplate]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        if (templateConfig && Object.keys(templateConfig).length > 0) {
            try {
                const payload = {
                    draftId,
                    templateConfig,
                    updatedAt: Date.now()
                };
                window.localStorage.setItem(PENDING_CONFIG_KEY, JSON.stringify(payload));
                window.sessionStorage.setItem(PENDING_CONFIG_KEY, JSON.stringify(templateConfig));
            } catch (error) {
                console.error('Nie udało się zapisać konfiguracji szablonu w sessionStorage.', error);
            }
        }
    }, [templateConfig, draftId]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        if (siteName) {
            try {
                const payload = {
                    draftId,
                    meta: { name: siteName },
                    updatedAt: Date.now()
                };
                window.localStorage.setItem(PENDING_META_KEY, JSON.stringify(payload));
                window.sessionStorage.setItem(PENDING_META_KEY, JSON.stringify({ name: siteName }));
            } catch (error) {
                console.error('Nie udało się zapisać metadanych strony w sessionStorage.', error);
            }
        }
    }, [siteName, draftId]);

    const modulesByPage = useMemo(() => {
        if (!templateConfig?.pages) {
            return [];
        }
        const pageKeys = (templateConfig.pageOrder || Object.keys(templateConfig.pages))
            .filter((key) => templateConfig.pages?.[key]);

        return pageKeys.reduce((accumulator, key) => {
            const page = templateConfig.pages[key];
            const filteredModules = (page?.modules || []).filter(shouldDisplayModule);

            if (filteredModules.length === 0) {
                return accumulator;
            }

            accumulator.push({
                ...page,
                modules: filteredModules
            });

            return accumulator;
        }, []);
    }, [templateConfig]);

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('editor:activeNewDraft', draftId);
            }
            navigate('/studio/editor/new', { state: { isNewSite: true, siteName, draftId } });
            return;
        }
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        if (activeStep === 0) {
            navigate('/studio/dashboard');
            return;
        }
        setActiveStep((prev) => prev - 1);
    };

    const disableNext = () => {
        if (activeStep === 0) {
            return !selectedTemplate;
        }
        if (activeStep === 1) {
            return !siteName?.trim();
        }
        return false;
    };

    return (
        <Container maxWidth="lg">
            <Stack spacing={5}>
                <Box>
                    <Typography variant="overline" sx={{ letterSpacing: 2, color: 'secondary.main' }}>
                        NOWA STRONA
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        Przeprowadź mnie przez konfigurację
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
                        Wybierz jeden z przygotowanych szablonów, włącz potrzebne moduły i rozpocznij edycję.
                    </Typography>
                </Box>

                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {activeStep === 0 && (
                    <Grid container spacing={3}>
                        {loading && (
                            <Grid item xs={12}>
                                <Typography>Ładowanie szablonów...</Typography>
                            </Grid>
                        )}
                        {error && (
                            <Grid item xs={12}>
                                <Alert severity="error">{error}</Alert>
                            </Grid>
                        )}
                        {!loading && !error && templates.length === 0 && (
                            <Grid item xs={12}>
                                <Typography>Brak dostępnych szablonów.</Typography>
                            </Grid>
                        )}
                        {!loading && !error && templates.map((template) => (
                            <Grid item xs={12} md={4} key={template.id}>
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                    <Card
                                        elevation={selectedTemplate === template.id ? 6 : 0}
                                        sx={{
                                            borderRadius: 4,
                                            border:
                                                selectedTemplate === template.id
                                                    ? '2px solid rgba(160, 0, 22, 0.45)'
                                                    : '1px solid rgba(160, 0, 22, 0.12)'
                                        }}
                                    >
                                        <CardActionArea onClick={() => setSelectedTemplate(template.id)}>
                                            <Box
                                                sx={{
                                                    height: 180,
                                                    borderBottom: '1px solid rgba(160, 0, 22, 0.12)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: 'linear-gradient(120deg, rgba(160,0,22,0.18), rgba(12,12,12,0.08))'
                                                }}
                                            >
                                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                    {template.name}
                                                </Typography>
                                            </Box>
                                            <CardContent>
                                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                                    {template.description}
                                                </Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                    {template.modules.map((module) => (
                                                        <Chip key={module} label={module} size="small" />
                                                    ))}
                                                </Stack>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {activeStep === 1 && (
                    <Stack spacing={4}>
                        <TextField
                            label="Nazwa strony"
                            value={siteName}
                            onChange={(event) => setSiteName(event.target.value)}
                            helperText="Ta nazwa będzie widoczna w panelu Studio oraz na Twojej liście stron."
                        />
                        <Divider light>Narzędzia modułów</Divider>
                        <Stack spacing={3}>
                            {modulesByPage.map((page) => (
                                <Box
                                    key={page.id}
                                    sx={{
                                        borderRadius: 4,
                                        border: '1px solid rgba(160, 0, 22, 0.14)',
                                        p: 3,
                                        backgroundColor: 'background.paper'
                                    }}
                                >
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                        {page.name}
                                    </Typography>
                                    <Stack spacing={2}>
                                        {page.modules.map((module) => (
                                            <Box
                                                key={module.id}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 2,
                                                    borderRadius: 3,
                                                    px: 2,
                                                    py: 1.5,
                                                    border: '1px solid rgba(160,0,22,0.08)'
                                                }}
                                            >
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {module.name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        {getModuleDescription(module)}
                                                    </Typography>
                                                </Box>
                                                <Switch
                                                    checked={module.enabled}
                                                    onChange={() => toggleModule(module.id)}
                                                    color="secondary"
                                                />
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    </Stack>
                )}

                {activeStep === 2 && (
                    <Stack spacing={3}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            Wszystko gotowe!
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            Po kliknięciu przejdziemy bezpośrednio do edytora. W każdej chwili możesz zmodyfikować moduły
                            i zapisać wersję roboczą.
                        </Typography>
                    </Stack>
                )}

                <Stack direction="row" justifyContent="space-between">
                    <Button variant="text" onClick={handleBack}>
                        {activeStep === 0 ? 'Zamknij' : 'Wstecz'}
                    </Button>
                    <Button variant="contained" onClick={handleNext} disabled={disableNext()}>
                        {activeStep === steps.length - 1 ? 'Przejdź do edytora' : 'Dalej'}
                    </Button>
                </Stack>
            </Stack>
        </Container>
    );
};

export default SiteCreationWizard;

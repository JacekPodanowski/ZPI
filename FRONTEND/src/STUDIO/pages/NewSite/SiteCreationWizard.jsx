import React, { useEffect, useMemo, useState } from 'react';
import {
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

const SiteCreationWizard = () => {
    const navigate = useNavigate();
    const { templates } = useTemplateStore();
    const { templateConfig, resetTemplateConfig, setTemplateConfig, toggleModule } = useEditorStore();

    const [activeStep, setActiveStep] = useState(0);
    const [siteName, setSiteName] = useState('Moja nowa strona');
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    useEffect(() => {
        resetTemplateConfig();
    }, [resetTemplateConfig]);

    useEffect(() => {
        if (!selectedTemplate) {
            return;
        }
        const template = templates.find((item) => item.id === selectedTemplate);
        if (template?.presetConfig) {
            setTemplateConfig(template.presetConfig);
        } else {
            const defaultConfig = createDefaultTemplateConfig();
            if (template?.name) {
                defaultConfig.name = template.name;
            }
            setTemplateConfig(defaultConfig);
        }

        if (template?.name) {
            setSiteName((prev) => (prev === 'Moja nowa strona' ? template.name : prev));
        }
    }, [selectedTemplate, setTemplateConfig, templates]);

    const modulesByPage = useMemo(() => {
        if (!templateConfig?.pages) {
            return [];
        }
        return Object.values(templateConfig.pages).map((page) => ({
            ...page,
            modules: page.modules || []
        }));
    }, [templateConfig]);

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            navigate('/studio/editor/new', { state: { isNewSite: true, siteName } });
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
                        {templates.map((template) => (
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
                                                        {module.id === 'hero' && 'Sekcja powitalna z hasłem przewodnim'}
                                                        {module.id === 'calendar' && 'Harmonogram zajęć i rezerwacje'}
                                                        {module.id === 'about' && 'Opowiedz o sobie i swoim doświadczeniu'}
                                                        {module.id === 'contact' && 'Dane kontaktowe i formularz'}
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

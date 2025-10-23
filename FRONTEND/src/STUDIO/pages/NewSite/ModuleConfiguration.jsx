import React, { useState } from 'react';
import {
    Box,
    Button,
    Container,
    Stack,
    Switch,
    TextField,
    Typography,
    Breadcrumbs,
    Link as MuiLink
} from '@mui/material';
import { motion } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ModuleWarningModal from './ModuleWarningModal';
import { validateSiteName } from './wizardConstants';

const ModuleCard = ({ module, onToggle, index }) => {
    const IconComponent = module.icon;
    const isDisabled = !module.enabled;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 3,
                    border: '1px solid rgba(160, 0, 22, 0.08)',
                    backgroundColor: isDisabled ? 'rgba(0, 0, 0, 0.02)' : 'background.paper',
                    opacity: isDisabled ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    mb: 1.5
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <IconComponent
                        sx={{
                            fontSize: 32,
                            color: 'text.secondary'
                        }}
                    />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.25 }}>
                        {module.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                        {module.description}
                    </Typography>
                </Box>
                <Switch
                    checked={module.enabled}
                    onChange={() => onToggle(module)}
                    color="secondary"
                    sx={{
                        '& .MuiSwitch-track': {
                            transition: 'background-color 0.2s ease'
                        }
                    }}
                />
            </Box>
        </motion.div>
    );
};

const ModuleConfiguration = ({ modules, onModuleToggle, siteName, onSiteNameChange, category, onBack, onNext }) => {
    const [warningModal, setWarningModal] = useState({ open: false, module: null });
    const [nameError, setNameError] = useState(null);

    const handleToggle = (module) => {
        // If trying to disable and module has warning
        if (module.enabled && module.disableWarning?.enabled) {
            setWarningModal({ open: true, module });
        } else {
            onModuleToggle(module.id);
        }
    };

    const handleConfirmDisable = () => {
        if (warningModal.module) {
            onModuleToggle(warningModal.module.id);
        }
        setWarningModal({ open: false, module: null });
    };

    const handleNameChange = (event) => {
        const newName = event.target.value;
        onSiteNameChange(newName);
        const error = validateSiteName(newName);
        setNameError(error);
    };

    const canProceed = siteName?.trim() && !validateSiteName(siteName);

    const getCategoryLabel = () => {
        const categoryLabels = {
            wellness: 'Wellness & Ruch',
            education: 'Edukacja & Korepetycje',
            creative: 'Kreatywność & Profesja',
            health: 'Zdrowie & Terapia',
            default: 'Domyślna konfiguracja'
        };
        return categoryLabels[category] || categoryLabels.default;
    };

    return (
        <Container maxWidth="md">
            <Stack spacing={5}>
                <Box>
                    <Breadcrumbs sx={{ mb: 2 }}>
                        <MuiLink
                            component="button"
                            variant="body2"
                            onClick={onBack}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                color: 'text.secondary',
                                textDecoration: 'none',
                                cursor: 'pointer',
                                '&:hover': {
                                    color: 'secondary.main'
                                }
                            }}
                        >
                            <ChevronLeftIcon sx={{ fontSize: 18, mr: 0.5 }} />
                            {getCategoryLabel()}
                        </MuiLink>
                    </Breadcrumbs>
                    <Typography
                        variant="overline"
                        sx={{
                            letterSpacing: 2,
                            color: 'secondary.main',
                            fontWeight: 600
                        }}
                    >
                        KROK 2 Z 2
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, mt: 1, mb: 2 }}>
                        Dostosuj swoją stronę
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                        Włącz lub wyłącz moduły według potrzeb. Zawsze możesz to zmienić później.
                    </Typography>
                </Box>

                <TextField
                    label="Jak nazywa się Twój projekt?"
                    value={siteName}
                    onChange={handleNameChange}
                    error={!!nameError}
                    helperText={nameError || 'Ta nazwa będzie widoczna w Twoim panelu Studio'}
                    fullWidth
                    placeholder="np. Pracownia Jogi Anny, Korepetycje Matematyki"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            transition: 'all 0.2s ease',
                            '&.Mui-focused': {
                                boxShadow: '0 0 0 3px rgba(160, 0, 22, 0.1)'
                            }
                        }
                    }}
                    inputProps={{
                        maxLength: 20
                    }}
                />

                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Moduły strony
                    </Typography>
                    <Stack spacing={0}>
                        {modules.map((module, index) => (
                            <ModuleCard key={module.id} module={module} onToggle={handleToggle} index={index} />
                        ))}
                    </Stack>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        pt: 2,
                        borderTop: '1px solid rgba(160, 0, 22, 0.08)'
                    }}
                >
                    <Button variant="text" onClick={onBack} startIcon={<ChevronLeftIcon />}>
                        Wstecz
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onNext}
                        disabled={!canProceed}
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(160, 0, 22, 0.25)'
                            }
                        }}
                    >
                        Przejdź do edytora
                    </Button>
                </Box>
            </Stack>

            <ModuleWarningModal
                open={warningModal.open}
                onClose={() => setWarningModal({ open: false, module: null })}
                onConfirm={handleConfirmDisable}
                warning={warningModal.module?.disableWarning}
            />
        </Container>
    );
};

export default ModuleConfiguration;

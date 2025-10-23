import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useEditorStore, { createDefaultTemplateConfig } from '../../store/editorStore';
import CategorySelection from './CategorySelection';
import ModuleConfiguration from './ModuleConfiguration';
import { getModulesForCategory, WIZARD_STORAGE_KEYS } from './wizardConstants';

const createDraftId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `draft-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
};

const SiteCreationWizard = () => {
    const navigate = useNavigate();
    const { setTemplateConfig, resetTemplateConfig } = useEditorStore();

    const [activeStep, setActiveStep] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [siteName, setSiteName] = useState('');
    const [modules, setModules] = useState([]);
    const [draftId] = useState(() => {
        if (typeof window === 'undefined') {
            return createDraftId();
        }
        const previousActive = window.localStorage.getItem(WIZARD_STORAGE_KEYS.ACTIVE_DRAFT);
        if (previousActive) {
            window.localStorage.removeItem(`editor:draft:new:${previousActive}`);
        }
        const generated = createDraftId();
        window.localStorage.setItem(WIZARD_STORAGE_KEYS.ACTIVE_DRAFT, generated);
        return generated;
    });

    // Initialize - clear previous wizard state
    useEffect(() => {
        resetTemplateConfig();
        if (typeof window !== 'undefined') {
            // Clear old storage
            window.sessionStorage.removeItem(WIZARD_STORAGE_KEYS.PENDING_CONFIG);
            window.sessionStorage.removeItem(WIZARD_STORAGE_KEYS.PENDING_META);
            window.localStorage.removeItem(WIZARD_STORAGE_KEYS.PENDING_CONFIG);
            window.localStorage.removeItem(WIZARD_STORAGE_KEYS.PENDING_META);

            // Try to restore wizard state
            const savedStep = window.localStorage.getItem(WIZARD_STORAGE_KEYS.STEP);
            const savedCategory = window.localStorage.getItem(WIZARD_STORAGE_KEYS.CATEGORY);
            
            if (savedStep) {
                setActiveStep(parseInt(savedStep, 10));
            }
            if (savedCategory) {
                setSelectedCategory(savedCategory);
            }
        }
    }, [resetTemplateConfig]);

    // Save wizard state to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(WIZARD_STORAGE_KEYS.STEP, activeStep.toString());
            if (selectedCategory) {
                window.localStorage.setItem(WIZARD_STORAGE_KEYS.CATEGORY, selectedCategory);
            }
        }
    }, [activeStep, selectedCategory]);

    // Handle category selection
    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
        const categoryModules = getModulesForCategory(categoryId);
        setModules(categoryModules);
        setActiveStep(1);
    };

    // Handle skip category selection
    const handleSkipCategory = () => {
        setSelectedCategory('default');
        const defaultModules = getModulesForCategory('default');
        setModules(defaultModules);
        setActiveStep(1);
    };

    // Handle module toggle
    const handleModuleToggle = (moduleId) => {
        setModules((prevModules) =>
            prevModules.map((module) =>
                module.id === moduleId ? { ...module, enabled: !module.enabled } : module
            )
        );
    };

    // Handle back navigation
    const handleBack = () => {
        if (activeStep === 0) {
            navigate('/studio/sites');
        } else {
            setActiveStep(0);
            setSelectedCategory(null);
            setModules([]);
        }
    };

    // Handle final submission
    const handleNext = () => {
        // Create template config based on selected modules
        const defaultConfig = createDefaultTemplateConfig();
        
        // Update modules in the default config based on user selections
        // This is a simplified version - you may need to adjust based on your actual template structure
        const updatedConfig = {
            ...defaultConfig,
            name: siteName
        };

        // Store in localStorage
        if (typeof window !== 'undefined') {
            const configPayload = {
                draftId,
                templateConfig: updatedConfig,
                updatedAt: Date.now()
            };
            const metaPayload = {
                draftId,
                meta: { name: siteName },
                updatedAt: Date.now()
            };
            
            window.localStorage.setItem(WIZARD_STORAGE_KEYS.PENDING_CONFIG, JSON.stringify(configPayload));
            window.sessionStorage.setItem(WIZARD_STORAGE_KEYS.PENDING_CONFIG, JSON.stringify(updatedConfig));
            window.localStorage.setItem(WIZARD_STORAGE_KEYS.PENDING_META, JSON.stringify(metaPayload));
            window.sessionStorage.setItem(WIZARD_STORAGE_KEYS.PENDING_META, JSON.stringify({ name: siteName }));
            window.localStorage.setItem(WIZARD_STORAGE_KEYS.ACTIVE_DRAFT, draftId);
        }

        // Set the template config in the store
        setTemplateConfig(updatedConfig, { restrictToDefaultPages: true });

        // Navigate to editor
        navigate('/studio/editor/new', { 
            state: { 
                isNewSite: true, 
                siteName, 
                draftId,
                category: selectedCategory,
                modules 
            } 
        });
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                py: 8
            }}
        >
            {activeStep === 0 && (
                <CategorySelection onSelectCategory={handleCategorySelect} onSkip={handleSkipCategory} />
            )}
            {activeStep === 1 && (
                <ModuleConfiguration
                    modules={modules}
                    onModuleToggle={handleModuleToggle}
                    siteName={siteName}
                    onSiteNameChange={setSiteName}
                    category={selectedCategory}
                    onBack={handleBack}
                    onNext={handleNext}
                />
            )}
        </Box>
    );
};

export default SiteCreationWizard;

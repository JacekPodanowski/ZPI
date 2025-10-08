import { Template } from '../types';

const templates: Template[] = [
    {
        id: '1',
        name: 'Minimalist Template',
        description: 'A clean and simple template for personal websites.',
        modules: ['HomePage', 'AboutMe', 'Calendar'],
    },
    // Add more templates as needed
];

export const getTemplates = (): Template[] => {
    return templates;
};

export const saveTemplate = (template: Template): void => {
    // Logic to save the template (e.g., to a database or local storage)
};

export const deleteTemplate = (templateId: string): void => {
    // Logic to delete the template by ID
};
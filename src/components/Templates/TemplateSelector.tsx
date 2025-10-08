import React from 'react';

const TemplateSelector: React.FC = () => {
    const templates = [
        { id: 1, name: 'Minimalist Template' },
        { id: 2, name: 'Modern Template' },
        { id: 3, name: 'Elegant Template' },
    ];

    const handleTemplateSelect = (templateId: number) => {
        // Logic to handle template selection
        console.log(`Template selected: ${templateId}`);
    };

    return (
        <div className="template-selector">
            <h2>Select a Template</h2>
            <ul>
                {templates.map(template => (
                    <li key={template.id} onClick={() => handleTemplateSelect(template.id)}>
                        {template.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TemplateSelector;
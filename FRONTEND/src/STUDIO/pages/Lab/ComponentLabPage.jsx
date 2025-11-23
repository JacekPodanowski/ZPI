import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/apiClient';
import compileReactSnippet from '../../../utils/compileReactSnippet';
import { useToast } from '../../../contexts/ToastContext';

const resolveBabel = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.Babel || null;
};

const ComponentLabPage = () => {
    const [components, setComponents] = useState([]);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [jsxCode, setJsxCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const addToast = useToast();

    // Three default example components available to pick from
    const defaultComponents = [
        {
            id: 'default-1',
            name: 'Simple Text',
            description: 'Wyświetla prosty nagłówek z props.text',
            source_code: `(props) => <h1>{props.text || 'Hello from Component Lab'}</h1>`,
            isDefault: true
        },
        {
            id: 'default-2',
            name: 'Colored Title',
            description: 'Nagłówek z kolorem przekazywanym w props.color',
            source_code: `(props) => <h2 style={{color: props.color || 'crimson'}}>{props.text || 'Stylowany nagłówek'}</h2>`,
            isDefault: true
        },
        {
            id: 'default-3',
            name: 'List Renderer',
            description: 'Renderuje listę elementów przekazanych w props.items',
            source_code: `(props) => <ul>{(props.items || ['one','two','three']).map((it,i) => <li key={i}>{it}</li>)}</ul>`,
            isDefault: true
        }
    ];

    useEffect(() => {
        apiClient.get('/custom-components/').then(res => setComponents(res.data));
    }, []);

    const handleSelectComponent = (comp) => {
        setSelectedComponent(comp);
        setName(comp.name);
        setDescription(comp.description);
        setJsxCode(comp.source_code || `// Brak kodu źródłowego JSX dla "${comp.name}"`);
    };

    const resetEditor = () => {
        setSelectedComponent(null);
        setName('');
        setDescription('');
        setJsxCode('');
    };

    const handleSave = async () => {
        if (!name.trim()) {
            addToast('Nazwa komponentu jest wymagana.', { variant: 'warning' });
            return;
        }

        let compiledCode;
        try {
            const babel = resolveBabel();
            if (!babel) {
                addToast('Biblioteka Babel nie została załadowana. Odśwież stronę i spróbuj ponownie.', { variant: 'error' });
                return;
            }
            compiledCode = compileReactSnippet(babel, jsxCode);
        } catch (error) {
            addToast(`Błąd kompilacji JSX: ${error.message}`, { variant: 'error' });
            return;
        }

        const blob = new Blob([compiledCode], { type: 'application/javascript' });
        const formData = new FormData();
        formData.append('file', blob, `${name.toLowerCase().replace(/\s+/g, '_')}.js`);
        formData.append('source_code', jsxCode);

            try {
            let componentData;
            // If selected component is an existing (non-default) component, PATCH it.
            // Default examples (isDefault === true) should be treated as new creations.
            if (selectedComponent && !selectedComponent.isDefault) {
                await apiClient.patch(`/custom-components/${selectedComponent.id}/`, {
                    name,
                    description,
                    source_code: jsxCode,
                });
                const res = await apiClient.post(
                    `/custom-components/${selectedComponent.id}/upload_compiled/`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                componentData = res.data;
                setComponents(components.map(c => (c.id === componentData.id ? componentData : c)));
            } else {
                const createRes = await apiClient.post('/custom-components/', {
                    name,
                    description,
                    source_code: jsxCode,
                });
                const newComp = createRes.data;
                const uploadRes = await apiClient.post(
                    `/custom-components/${newComp.id}/upload_compiled/`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                componentData = uploadRes.data;
                setComponents([...components, componentData]);
            }
            handleSelectComponent(componentData);
            addToast('Komponent zapisany!', { variant: 'success' });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Błąd zapisu komponentu', error.response?.data || error);
            addToast('Nie udało się zapisać komponentu.', { variant: 'error' });
        }
    };

    return (
        <div className="p-6 space-y-6">
            <header className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Laboratorium Komponentów React</h2>
                <button
                    type="button"
                    onClick={resetEditor}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                    Nowy komponent
                </button>
            </header>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="md:col-span-1 space-y-4">
                    <h3 className="text-lg font-medium">Zapisane komponenty</h3>
                    <div className="space-y-2">
                        {/* Default example components */}
                        {defaultComponents.map(component => (
                            <button
                                type="button"
                                key={component.id}
                                onClick={() => handleSelectComponent(component)}
                                className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                                    selectedComponent?.id === component.id
                                        ? 'border-black bg-gray-100'
                                        : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="font-semibold">{component.name}</div>
                                {component.description && (
                                    <p className="text-sm text-gray-600">{component.description}</p>
                                )}
                            </button>
                        ))}

                        {/* Saved/custom components from backend */}
                        {components.map(component => (
                            <button
                                type="button"
                                key={component.id}
                                onClick={() => handleSelectComponent(component)}
                                className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                                    selectedComponent?.id === component.id
                                        ? 'border-black bg-gray-100'
                                        : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="font-semibold">{component.name}</div>
                                {component.description && (
                                    <p className="text-sm text-gray-600">{component.description}</p>
                                )}
                            </button>
                        ))}

                        {components.length === 0 && (
                            <p className="text-sm text-gray-500">Brak komponentów. Utwórz pierwszy.</p>
                        )}
                    </div>
                </div>

                <div className="md:col-span-3 space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nazwa</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="HeroTitle"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Opis</label>
                            <input
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="Krótki opis zastosowania"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Kod JSX</label>
                        <textarea
                            value={jsxCode}
                            onChange={e => setJsxCode(e.target.value)}
                            rows={18}
                            spellCheck={false}
                            className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                            placeholder="(props) => <h1>{props.text}</h1>"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900"
                        >
                            Zapisz i kompiluj
                        </button>
                        <p className="text-sm text-gray-600">
                            Przykład:{' '}
                            <code>{`(props) => <h1 style={{color: props.color}}>{props.text}</h1>`}</code>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ComponentLabPage;

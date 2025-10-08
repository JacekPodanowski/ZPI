import { useState, useEffect } from 'react';

export const useFetchTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch('/api/templates');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTemplates(data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    return { templates, loading, error };
};

export const useEditorState = () => {
    const [editorState, setEditorState] = useState({});

    const updateEditorState = (newState) => {
        setEditorState((prevState) => ({ ...prevState, ...newState }));
    };

    return { editorState, updateEditorState };
};
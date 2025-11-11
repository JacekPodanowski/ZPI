import React, { useEffect, useMemo, useState } from 'react';
import { resolveMediaUrl } from '../../../../../config/api';
import compileReactSnippet from '../../../../../utils/compileReactSnippet';
import { REACT_COMPONENT_MEDIA_PROP_KEYS } from '../../../../../constants/reactComponentDefaults';

const resolveBabel = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.Babel || null;
};

const DefaultReactComponent = ({ content, style }) => {
  const { componentUrl, sourceCode, props = {} } = content || {};
  const [Component, setComponent] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const resolvedProps = useMemo(() => {
    const safeProps = props && typeof props === 'object' ? { ...props } : {};

    const normalizeMediaValue = (value) => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
          return trimmed;
        }
        if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
          return trimmed;
        }
        return resolveMediaUrl(trimmed);
      }

      if (Array.isArray(value)) {
        return value.map((entry) => normalizeMediaValue(entry));
      }

      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value).map(([nestedKey, nestedValue]) => [nestedKey, normalizeMediaValue(nestedValue)])
        );
      }

      return value;
    };

    const shouldResolveMedia = (key, value) => {
      if (!value) {
        return false;
      }
      const lowerKey = key.toLowerCase();
      return REACT_COMPONENT_MEDIA_PROP_KEYS.some((keyword) => lowerKey.includes(keyword));
    };

    const enhancedProps = Object.fromEntries(
      Object.entries(safeProps).map(([key, value]) => {
        if (shouldResolveMedia(key, value)) {
          return [key, normalizeMediaValue(value)];
        }
        return [key, value];
      })
    );

    if (typeof enhancedProps.resolveMediaUrl !== 'function') {
      enhancedProps.resolveMediaUrl = resolveMediaUrl;
    }

    if (typeof enhancedProps.navigateToSitePage !== 'function') {
      enhancedProps.navigateToSitePage = (target) => {
        if (typeof window === 'undefined') {
          return;
        }

        const detail = typeof target === 'string' ? { path: target } : (target || {});
        window.dispatchEvent(new CustomEvent('site:navigate', { detail }));
      };
    }

    return enhancedProps;
  }, [props]);

  useEffect(() => {
    if (!sourceCode || typeof window === 'undefined') {
      return;
    }

    try {
      const babel = resolveBabel();
      if (!babel) {
        setErrorMessage('Biblioteka Babel nie jest dostępna w tej przeglądarce. Odśwież stronę lub sprawdź konfigurację.');
        return;
      }
      const compiled = compileReactSnippet(babel, sourceCode);
      // eslint-disable-next-line no-new-func
      const factory = new Function('React', `return (${compiled});`);
      const resolvedComponent = factory(React);

      if (typeof resolvedComponent !== 'function') {
        throw new Error('Zdefiniowany kod nie zwraca komponentu React.');
      }

      setComponent(() => resolvedComponent);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error.message || 'Nie udało się skompilować komponentu z kodu źródłowego.');
      setComponent(null);
    }
  }, [sourceCode]);

  useEffect(() => {
    if ((sourceCode && typeof window !== 'undefined') || !componentUrl) {
      if (!componentUrl) {
        setErrorMessage('Brak zdefiniowanego komponentu. Skompiluj go w konfiguratorze, aby wygenerować plik.');
      }
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const loadComponent = async () => {
      try {
        const fullUrl = resolveMediaUrl(componentUrl);
        const response = await fetch(fullUrl);
        if (!response.ok) {
          throw new Error(`Nie można załadować komponentu: ${response.statusText}`);
        }

        const code = (await response.text())?.trim();
        if (!code) {
          throw new Error('Załadowany plik komponentu jest pusty.');
        }
        const factory = new Function('React', `return (${code});`);
        const resolvedComponent = factory(React);

        if (typeof resolvedComponent !== 'function') {
          throw new Error('Załadowany moduł nie jest komponentem React.');
        }

        if (isMounted) {
          setComponent(() => resolvedComponent);
          setErrorMessage(null);
        }
      } catch (error) {
        if (isMounted) {
          setComponent(null);
          setErrorMessage(error.message || 'Nie udało się załadować komponentu.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, [componentUrl, sourceCode]);

  if (errorMessage) {
    return (
      <div className="border border-red-400 bg-red-50 text-red-700 rounded-lg p-4 text-sm">
        Błąd komponentu: {errorMessage}
      </div>
    );
  }

  if (!Component) {
    return <div>{isLoading ? 'Ładowanie komponentu React…' : 'Komponent nadal nie został zdefiniowany.'}</div>;
  }

  try {
    return <Component {...resolvedProps} />;
  } catch (renderError) {
    return (
      <div className="border border-red-400 bg-red-50 text-red-700 rounded-lg p-4 text-sm">
        Błąd renderowania komponentu.
      </div>
    );
  }
};

export default DefaultReactComponent;

// src/components/ErrorBoundary/ErrorBoundary.jsx
import React, { Component } from 'react';
import styles from './ErrorBoundary.module.css'; // Stwórzmy też dla niego style

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    // Ta metoda cyklu życia jest wywoływana po tym, jak potomek rzucił błąd.
    // Otrzymuje błąd jako parametr i powinna zwrócić wartość, aby zaktualizować stan.
    static getDerivedStateFromError(error) {
        return { hasError: true, error: error };
    }

    // Ta metoda cyklu życia jest również wywoływana po tym, jak potomek rzucił błąd.
    // Otrzymuje dwa parametry:
    // 1. error - Obiekt błędu.
    // 2. errorInfo - Obiekt z kluczem componentStack, który zawiera informacje o tym,
    //    który komponent w drzewie rzucił błąd.
    componentDidCatch(error, errorInfo) {
        // Możesz również zalogować błąd do zewnętrznego serwisu raportowania błędów
        console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        // np. logErrorToMyService(error, errorInfo.componentStack);
    }

    render() {
        if (this.state.hasError) {
            // Możesz wyrenderować dowolny interfejs awaryjny
            return (
                <div className={styles.errorBoundaryContainer}>
                    <h1 className={styles.errorTitle}>Coś poszło nie tak...</h1>
                    <p className={styles.errorMessage}>
                        Przepraszamy, wystąpił nieoczekiwany błąd podczas ładowania tej części strony.
                        Spróbuj odświeżyć stronę lub skontaktuj się z pomocą techniczną, jeśli problem będzie się powtarzał.
                    </p>
                    {/* W trybie deweloperskim możesz chcieć wyświetlić więcej szczegółów */}
                    {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                        <details className={styles.errorDetails}>
                            <summary>Szczegóły błędu (dla dewelopera)</summary>
                            <pre>{this.state.error && this.state.error.toString()}</pre>
                            <pre>{this.state.errorInfo.componentStack}</pre>
                        </details>
                    )}
                    <button className={styles.refreshButton} onClick={() => window.location.reload()}>
                        Odśwież Stronę
                    </button>
                </div>
            );
        }

        // Normalnie, jeśli nie ma błędu, renderuj komponenty potomne
        return this.props.children;
    }
}

export default ErrorBoundary;
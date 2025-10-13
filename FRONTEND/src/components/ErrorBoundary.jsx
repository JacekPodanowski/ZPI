import React from 'react';
import { Box, Button, Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        if (typeof window !== 'undefined' && window.console) {
            console.error('Unhandled application error:', error, errorInfo);
        }

        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    handleToggleDetails = () => {
        this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
    };

    handleCopyDetails = async () => {
        const { error, errorInfo } = this.state;
        const details = [error?.stack, errorInfo?.componentStack]
            .filter(Boolean)
            .join('\n\n');

        if (!details) {
            return;
        }

        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(details);
            }
        } catch (clipError) {
            console.warn('Failed to copy error details', clipError);
        }
    };

    render() {
        const { hasError, error, errorInfo, showDetails } = this.state;

        if (hasError) {
            const errorMessage = error?.message || 'Wystąpił nieoczekiwany błąd.';
            const errorDetails = [error?.stack, errorInfo?.componentStack]
                .filter(Boolean)
                .join('\n\n');

            return (
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        px: 3,
                        textAlign: 'center',
                        backgroundColor: '#f5f5f5',
                        color: '#1e1e1e'
                    }}
                >
                    <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
                        Coś poszło nie tak
                    </Typography>
                    <Typography variant="body1" maxWidth={520}>
                        {errorMessage}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button variant="contained" color="primary" onClick={this.handleReload}>
                            Odśwież stronę
                        </Button>
                        {errorDetails && (
                            <Button variant="outlined" color="primary" onClick={this.handleToggleDetails}>
                                {showDetails ? 'Ukryj szczegóły' : 'Pokaż szczegóły'}
                            </Button>
                        )}
                    </Box>
                    {showDetails && errorDetails && (
                        <Box
                            component="pre"
                            sx={{
                                mt: 3,
                                p: 2,
                                maxWidth: 720,
                                maxHeight: 320,
                                overflow: 'auto',
                                textAlign: 'left',
                                backgroundColor: '#ffffff',
                                borderRadius: 1,
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                width: '100%',
                                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)'
                            }}
                        >
                            {errorDetails}
                        </Box>
                    )}
                    {showDetails && errorDetails && (
                        <Button variant="text" color="primary" onClick={this.handleCopyDetails} sx={{ mt: 1 }}>
                            Skopiuj szczegóły
                        </Button>
                    )}
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

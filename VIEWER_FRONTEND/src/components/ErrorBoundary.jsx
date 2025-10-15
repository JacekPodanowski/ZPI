import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

const FALLBACK_THEME = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: 'rgb(228, 229, 218)',
            paper: 'rgba(255, 255, 255, 0.96)'
        },
        text: {
            primary: 'rgb(30, 30, 30)',
            secondary: 'rgba(30, 30, 30, 0.72)'
        },
        primary: {
            main: 'rgb(146, 0, 32)',
            contrastText: '#ffffff'
        },
        secondary: {
            main: 'rgb(188, 186, 179)'
        },
        divider: 'rgba(30, 30, 30, 0.12)'
    },
    typography: {
        fontFamily: '"Montserrat", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        button: {
            textTransform: 'none',
            fontWeight: 600
        }
    }
});

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
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

    getErrorDetails = () => {
        const { error, errorInfo } = this.state;
        const detailString = [error?.stack, errorInfo?.componentStack]
            .filter(Boolean)
            .join('\n\n');

        return detailString || 'Brak dodatkowych szczegółów dotyczących błędu.';
    };

    handleReload = () => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    };

    handleCopyDetails = async () => {
        const details = this.getErrorDetails();

        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(details);
            }
        } catch (clipError) {
            console.warn('Failed to copy error details', clipError);
        }
    };

    render() {
        const { hasError, error } = this.state;

        if (hasError) {
            const errorMessage = error?.message || 'Wystąpił nieoczekiwany błąd.';
            const errorDetails = this.getErrorDetails();

            return (
                <MuiThemeProvider theme={FALLBACK_THEME}>
                    <CssBaseline />
                    <Box
                        sx={{
                            minHeight: '100vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 3,
                            px: 3,
                            py: 6,
                            textAlign: 'center',
                            backgroundColor: (theme) => theme.palette.background.default,
                            color: (theme) => theme.palette.text.primary
                        }}
                    >
                        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                            Coś poszło nie tak
                        </Typography>
                        <Typography variant="body1" maxWidth={520} color="text.secondary">
                            {errorMessage}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Button variant="contained" color="primary" onClick={this.handleReload}>
                                Odśwież stronę
                            </Button>
                            <Button variant="outlined" color="primary" onClick={this.handleCopyDetails}>
                                Skopiuj szczegóły
                            </Button>
                        </Box>
                        <Box
                            component="pre"
                            sx={{
                                mt: 1,
                                p: 3,
                                maxWidth: 720,
                                maxHeight: 360,
                                overflow: 'auto',
                                textAlign: 'left',
                                backgroundColor: (theme) => theme.palette.background.paper,
                                borderRadius: 2,
                                border: (theme) => `1px solid ${theme.palette.divider}`,
                                width: '100%',
                                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
                                fontFamily: '"Roboto Mono", "Menlo", "Monaco", monospace',
                                fontSize: '0.875rem',
                                lineHeight: 1.5,
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {errorDetails}
                        </Box>
                    </Box>
                </MuiThemeProvider>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
